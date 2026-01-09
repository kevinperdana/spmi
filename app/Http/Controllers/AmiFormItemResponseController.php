<?php

namespace App\Http\Controllers;

use App\Models\AmiFormItem;
use App\Models\AmiFormItemResponse;
use Illuminate\Http\Request;

class AmiFormItemResponseController extends Controller
{
    public function store(Request $request, AmiFormItem $amiFormItem)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'auditor') {
            abort(403);
        }

        $isChecklist = $amiFormItem->satuan_unit === 'tersedia';

        $rules = $isChecklist
            ? ['value_bool' => ['required', 'boolean']]
            : ['value_number' => ['nullable', 'numeric']];
        $rules['notes'] = ['nullable', 'string', 'max:1000'];

        $validated = $request->validate($rules);

        AmiFormItemResponse::updateOrCreate(
            [
                'ami_form_item_id' => $amiFormItem->id,
                'user_id' => $user->id,
            ],
            [
                'value_bool' => $isChecklist ? (bool) ($validated['value_bool'] ?? false) : null,
                'value_number' => $isChecklist ? null : ($validated['value_number'] ?? null),
                'notes' => isset($validated['notes']) && $validated['notes'] !== '' ? $validated['notes'] : null,
            ]
        );

        return redirect()
            ->back()
            ->with('success', 'Response saved.');
    }
}
