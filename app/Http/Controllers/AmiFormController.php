<?php

namespace App\Http\Controllers;

use App\Models\AmiForm;
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
}
