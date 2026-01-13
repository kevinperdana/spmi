<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\QuestionnaireSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionnaireSectionController extends Controller
{
    public function create(Page $page)
    {
        $this->ensureQuestionnaire($page);

        return Inertia::render('Questionnaires/Sections/Create', [
            'page' => $page->only(['id', 'title']),
        ]);
    }

    public function store(Request $request, Page $page)
    {
        $this->ensureQuestionnaire($page);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
        ]);

        $order = $validated['order']
            ?? (($page->questionnaireSections()->max('order') ?? -1) + 1);

        $section = $page->questionnaireSections()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'order' => $order,
        ]);

        return redirect()
            ->route('questionnaire-items.index', ['page' => $page->id, 'section' => $section->id])
            ->with('success', 'Section kuesioner dibuat.');
    }

    public function edit(Page $page, QuestionnaireSection $questionnaireSection)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureSectionBelongsToPage($page, $questionnaireSection);

        return Inertia::render('Questionnaires/Sections/Edit', [
            'page' => $page->only(['id', 'title']),
            'section' => $questionnaireSection->only(['id', 'title', 'description', 'order']),
        ]);
    }

    public function update(Request $request, Page $page, QuestionnaireSection $questionnaireSection)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureSectionBelongsToPage($page, $questionnaireSection);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
        ]);

        $questionnaireSection->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'order' => $validated['order'] ?? $questionnaireSection->order,
        ]);

        return redirect()
            ->route('questionnaire-items.index', ['page' => $page->id, 'section' => $questionnaireSection->id])
            ->with('success', 'Section kuesioner diperbarui.');
    }

    public function destroy(Page $page, QuestionnaireSection $questionnaireSection)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureSectionBelongsToPage($page, $questionnaireSection);

        $questionnaireSection->delete();

        return redirect()
            ->route('questionnaire-items.index', $page)
            ->with('success', 'Section kuesioner dihapus.');
    }

    private function ensureQuestionnaire(Page $page): void
    {
        if ($page->layout_type !== 'kuesioner') {
            abort(404);
        }
    }

    private function ensureSectionBelongsToPage(Page $page, QuestionnaireSection $section): void
    {
        if ($section->page_id !== $page->id) {
            abort(404);
        }
    }
}
