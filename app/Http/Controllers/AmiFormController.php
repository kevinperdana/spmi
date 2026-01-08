<?php

namespace App\Http\Controllers;

use App\Models\AmiForm;
use App\Models\AmiFormItemResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AmiFormController extends Controller
{
    public function index()
    {
        $forms = AmiForm::query()
            ->select(['id', 'title', 'created_at'])
            ->withCount('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('AmiForms/Index', [
            'forms' => $forms,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        AmiForm::create([
            'title' => $validated['title'],
        ]);

        return redirect()
            ->route('ami-forms.index')
            ->with('success', 'Form created successfully.');
    }

    public function destroy(AmiForm $amiForm)
    {
        $amiForm->delete();

        return redirect()
            ->route('ami-forms.index')
            ->with('success', 'Form deleted successfully.');
    }

    public function results(AmiForm $amiForm)
    {
        $amiForm->load([
            'sections' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            },
            'sections.items' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            },
        ]);

        $itemIds = $amiForm->items()->pluck('ami_form_items.id');
        $responses = $itemIds->isEmpty()
            ? collect()
            : AmiFormItemResponse::query()
                ->whereIn('ami_form_item_id', $itemIds)
                ->whereHas('user', fn ($query) => $query->where('role', 'auditor'))
                ->with('user:id,name,email,role')
                ->get();

        $auditors = $responses
            ->groupBy('user_id')
            ->map(function ($group) {
                $user = $group->first()->user;
                $responseMap = $group->mapWithKeys(function ($response) {
                    return [
                        $response->ami_form_item_id => [
                            'value_bool' => $response->value_bool,
                            'value_number' => $response->value_number,
                        ],
                    ];
                })->toArray();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'responses' => $responseMap,
                ];
            })
            ->values();

        return Inertia::render('AmiForms/Results', [
            'form' => $amiForm,
            'sections' => $amiForm->sections,
            'auditors' => $auditors,
        ]);
    }
}
