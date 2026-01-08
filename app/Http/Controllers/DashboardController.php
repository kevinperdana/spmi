<?php

namespace App\Http\Controllers;

use App\Models\AmiForm;
use App\Models\AmiFormItemResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $forms = [];

        if ($user && $user->role === 'auditor') {
            $responses = AmiFormItemResponse::where('user_id', $user->id)
                ->get()
                ->keyBy('ami_form_item_id');

            $forms = AmiForm::with([
                'sections' => function ($query) {
                    $query->orderBy('order')->orderBy('created_at');
                },
                'sections.items' => function ($query) {
                    $query->orderBy('order')->orderBy('created_at');
                },
            ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($form) use ($responses) {
                    return [
                        'id' => $form->id,
                        'title' => $form->title,
                        'sections' => $form->sections->map(function ($section) use ($responses) {
                            return [
                                'id' => $section->id,
                                'title' => $section->title,
                                'items' => $section->items->map(function ($item) use ($responses) {
                                    $response = $responses->get($item->id);
                                    return [
                                        'id' => $item->id,
                                        'code' => $item->code,
                                        'indicator' => $item->indicator,
                                        'satuan_unit' => $item->satuan_unit,
                                        'target_unit' => $item->target_unit,
                                        'capaian_unit' => $item->capaian_unit,
                                        'persentase_unit' => $item->persentase_unit,
                                        'response' => $response ? [
                                            'value_bool' => (bool) $response->value_bool,
                                            'value_number' => $response->value_number,
                                        ] : null,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                    ];
                })
                ->values()
                ->all();
        }

        return Inertia::render('dashboard', [
            'forms' => $forms,
        ]);
    }
}
