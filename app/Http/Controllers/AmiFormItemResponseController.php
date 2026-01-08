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

        $validated = $request->validate($isChecklist
            ? ['value_bool' => ['required', 'boolean']]
            : ['value_number' => ['nullable', 'numeric']]
        );

        AmiFormItemResponse::updateOrCreate(
            [
                'ami_form_item_id' => $amiFormItem->id,
                'user_id' => $user->id,
            ],
            [
                'value_bool' => $isChecklist ? (bool) ($validated['value_bool'] ?? false) : null,
                'value_number' => $isChecklist ? null : ($validated['value_number'] ?? null),
            ]
        );

        return redirect()
            ->back()
            ->with('success', 'Response saved.');
    }
}
