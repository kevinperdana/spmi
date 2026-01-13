<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QuestionnaireController extends Controller
{
    public function index()
    {
        $questionnaires = Page::query()
            ->where('layout_type', 'kuesioner')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'slug', 'created_at']);

        return Inertia::render('Questionnaires/Index', [
            'questionnaires' => $questionnaires,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $title = $validated['title'];
        $slug = $this->uniqueSlug(Str::slug($title) ?: 'kuesioner');

        Page::create([
            'user_id' => $request->user()->id,
            'title' => $title,
            'slug' => $slug,
            'layout_type' => 'kuesioner',
            'content' => json_encode($this->buildTemplateContent($title)),
            'is_published' => true,
            'order' => 0,
        ]);

        return redirect()
            ->route('questionnaires.index')
            ->with('success', 'Kuesioner dibuat.');
    }

    public function update(Request $request, Page $page)
    {
        $this->ensureQuestionnaire($page);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $page->update([
            'title' => $validated['title'],
        ]);

        return redirect()
            ->route('questionnaires.index')
            ->with('success', 'Nama kuesioner diperbarui.');
    }

    public function destroy(Page $page)
    {
        $this->ensureQuestionnaire($page);

        $page->delete();

        return redirect()
            ->route('questionnaires.index')
            ->with('success', 'Kuesioner dihapus.');
    }

    private function ensureQuestionnaire(Page $page): void
    {
        if ($page->layout_type !== 'kuesioner') {
            abort(404);
        }
    }

    private function uniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $suffix = 2;

        while (Page::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $suffix;
            $suffix += 1;
        }

        return $slug;
    }

    private function buildTemplateContent(string $title): array
    {
        $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $timestamp = time();

        $customHtml = implode("\n", [
            '<div class="kuesioner">',
            '  <div class="kuesioner-card">',
            '    <div class="kuesioner-header">',
            '      <span class="kuesioner-back">&larr;</span>',
            '      <h1>' . $safeTitle . '</h1>',
            '    </div>',
            '',
            '    <div class="kuesioner-form">',
            '      <label for="k-nim">Nim</label>',
            '      <input id="k-nim" type="text" placeholder="" />',
            '',
            '      <label for="k-nama">Nama Lengkap</label>',
            '      <input id="k-nama" type="text" placeholder="" />',
            '',
            '      <label for="k-prodi">Program Studi</label>',
            '      <select id="k-prodi" class="kuesioner-select">',
            '        <option selected disabled>Pilih Program Studi ...</option>',
            '        <option>Teknik Informatika</option>',
            '        <option>Sistem Informasi</option>',
            '        <option>Teknik Elektro</option>',
            '      </select>',
            '',
            '      <label for="k-tahun">Tahun Akademik</label>',
            '      <select id="k-tahun" class="kuesioner-select">',
            '        <option selected disabled>Pilih Tahun Akademik...</option>',
            '        <option>2022/2023</option>',
            '        <option>2023/2024</option>',
            '        <option>2024/2025</option>',
            '      </select>',
            '',
            '      <label for="k-layanan">Layanan</label>',
            '      <select id="k-layanan" class="kuesioner-select">',
            '        <option selected disabled>Pilih Layanan yg akan dinilai...</option>',
            '        <option>Akademik</option>',
            '        <option>Keuangan</option>',
            '        <option>Perpustakaan</option>',
            '      </select>',
            '    </div>',
            '',
            '    <div class="kuesioner-notes">',
            '      <h3>Petunjuk :</h3>',
            '      <ol>',
            '        <li>Isilah angket ini sesuai dengan kondisi yang saudara alami, masukan saudara sangat berguna untuk meningkatkan kualitas layanan akademik &amp; umum dari fakultas dan prodi</li>',
            '        <li>Angket ini bersifat rahasia dan tidak berhubungan dengan nilai Saudara</li>',
            '        <li>Skala penilaian: 1=sangat kurang, 2= kurang, 3= cukup, 4=baik, 5=sangat baik</li>',
            '      </ol>',
            '    </div>',
            '  </div>',
            '</div>',
        ]);

        $customCss = implode("\n", [
            '.kuesioner {',
            '  background: #f8fafc;',
            '}',
            '',
            '.kuesioner-card {',
            '  background: #ffffff;',
            '  border: 1px solid #e5e7eb;',
            '  border-radius: 18px;',
            '  padding: 24px 28px 28px;',
            '  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);',
            '}',
            '',
            '.kuesioner-header {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 12px;',
            '  border-bottom: 1px solid #e5e7eb;',
            '  padding-bottom: 16px;',
            '  margin-bottom: 20px;',
            '  color: #0f172a;',
            '}',
            '',
            '.kuesioner-header h1 {',
            '  font-size: 20px;',
            '  font-weight: 600;',
            '  margin: 0;',
            '}',
            '',
            '.kuesioner-back {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  width: 28px;',
            '  height: 28px;',
            '  border-radius: 50%;',
            '  background: #eff6ff;',
            '  color: #1d4ed8;',
            '  font-size: 18px;',
            '  font-weight: 700;',
            '}',
            '',
            '.kuesioner-form {',
            '  display: grid;',
            '  grid-template-columns: 220px 1fr;',
            '  gap: 16px 24px;',
            '  align-items: center;',
            '  margin-bottom: 24px;',
            '}',
            '',
            '.kuesioner-form label {',
            '  font-weight: 600;',
            '  color: #0f172a;',
            '}',
            '',
            '.kuesioner-form input,',
            '.kuesioner-form select {',
            '  width: 100%;',
            '  border: 1px solid #cbd5f5;',
            '  border-radius: 10px;',
            '  padding: 10px 12px;',
            '  font-size: 14px;',
            '  color: #0f172a;',
            '  background: #ffffff;',
            '}',
            '',
            '.kuesioner-form input:focus,',
            '.kuesioner-form select:focus {',
            '  outline: none;',
            '  border-color: #7aa3f0;',
            '  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);',
            '}',
            '',
            '.kuesioner-select {',
            '  appearance: none;',
            "  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");",
            '  background-repeat: no-repeat;',
            '  background-position: right 14px center;',
            '  background-size: 16px;',
            '  padding-right: 40px;',
            '}',
            '',
            '.kuesioner-notes h3 {',
            '  margin: 0 0 8px;',
            '  font-size: 16px;',
            '  color: #0f172a;',
            '}',
            '',
            '.kuesioner-notes ol {',
            '  margin: 0;',
            '  padding-left: 18px;',
            '  color: #1f2937;',
            '  display: grid;',
            '  gap: 8px;',
            '  font-size: 14px;',
            '  line-height: 1.6;',
            '}',
            '',
            '@media (max-width: 640px) {',
            '  .kuesioner-card {',
            '    padding: 20px;',
            '  }',
            '',
            '  .kuesioner-header {',
            '    flex-direction: column;',
            '    align-items: flex-start;',
            '  }',
            '',
            '  .kuesioner-header h1 {',
            '    font-size: 18px;',
            '  }',
            '',
            '  .kuesioner-form {',
            '    grid-template-columns: 1fr;',
            '  }',
            '}',
        ]);

        return [
            'sections' => [
                [
                    'id' => 'section-kuesioner-' . $timestamp,
                    'layout_type' => 'full-width',
                    'background_config' => [
                        'type' => 'solid',
                        'color' => '#f8fafc',
                        'gradient' => [
                            'color1' => '#3b82f6',
                            'color2' => '#2f1dbf',
                            'angle' => 90,
                        ],
                    ],
                    'container_config' => [
                        'maxWidth' => 'max-w-6xl',
                        'horizontalPadding' => '16',
                        'verticalPadding' => '32',
                        'paddingTop' => '24',
                        'paddingBottom' => '32',
                        'paddingLeft' => null,
                        'paddingRight' => null,
                    ],
                    'columns' => [
                        [
                            'id' => 'col-kuesioner-' . $timestamp . '-0',
                            'width' => 12,
                            'widthTablet' => 12,
                            'widthMobile' => 12,
                            'card' => false,
                            'elements' => [
                                [
                                    'type' => 'custom',
                                    'customHtml' => $customHtml,
                                    'customCss' => $customCss,
                                    'customJs' => '',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
