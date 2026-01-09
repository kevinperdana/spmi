<?php

namespace App\Http\Controllers;

use App\Models\AmiForm;
use App\Models\AmiFormFollowup;
use App\Models\AmiFormItem;
use App\Models\AmiFormItemResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AmiFormFollowupController extends Controller
{
    public function rtm(Request $request)
    {
        return $this->index($request, 'rtm', 'RTM & RTL');
    }

    public function rtl(Request $request)
    {
        return $this->index($request, 'rtl', 'RTM & RTL');
    }

    public function update(Request $request, AmiFormItem $amiFormItem)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['rtm', 'rtl'])],
            'decision' => ['nullable', 'string'],
            'target_time' => ['nullable', 'string', 'max:255'],
            'responsible' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        AmiFormFollowup::updateOrCreate(
            [
                'ami_form_item_id' => $amiFormItem->id,
                'type' => $validated['type'],
            ],
            [
                'decision' => $validated['decision'] ?? null,
                'target_time' => $validated['target_time'] ?? null,
                'responsible' => $validated['responsible'] ?? null,
                'status' => $validated['status'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Data saved.');
    }

    private function index(Request $request, string $type, string $title)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            abort(403);
        }

        $forms = AmiForm::with([
            'sections' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            },
            'sections.items' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            },
        ])
            ->orderBy('created_at', 'desc')
            ->get();

        $itemIds = $forms
            ->flatMap(fn ($form) => $form->sections->flatMap(fn ($section) => $section->items))
            ->pluck('id');

        $responses = $itemIds->isEmpty()
            ? collect()
            : AmiFormItemResponse::query()
                ->whereIn('ami_form_item_id', $itemIds)
                ->whereHas('user', fn ($query) => $query->where('role', 'auditor'))
                ->orderByDesc('updated_at')
                ->get()
                ->groupBy('ami_form_item_id');

        $followups = $itemIds->isEmpty()
            ? collect()
            : AmiFormFollowup::query()
                ->whereIn('ami_form_item_id', $itemIds)
                ->where('type', $type)
                ->get()
                ->keyBy('ami_form_item_id');

        $payload = $forms->map(function ($form) use ($responses, $followups) {
            $items = $form->sections
                ->flatMap(fn ($section) => $section->items)
                ->map(function ($item) use ($responses, $followups) {
                    $response = $responses->get($item->id)?->first();
                    $followup = $followups->get($item->id);

                    return [
                        'id' => $item->id,
                        'code' => $item->code,
                        'indicator' => $item->indicator,
                        'notes' => $response?->notes,
                        'decision' => $followup?->decision,
                        'target_time' => $followup?->target_time,
                        'responsible' => $followup?->responsible,
                        'status' => $followup?->status,
                    ];
                })
                ->values();

            return [
                'id' => $form->id,
                'title' => $form->title,
                'items' => $items,
            ];
        })->values();

        return Inertia::render('RtmRtl/Index', [
            'type' => $type,
            'title' => $title,
            'forms' => $payload,
        ]);
    }
}
