import { Head } from '@inertiajs/react';
import { SectionRenderer } from '@/components/builder/section-renderer';
import type { LandingPage } from '@/types/builder';

interface PreviewProps {
  page: LandingPage;
  isPublic?: boolean;
}

export default function Preview({ page, isPublic = false }: PreviewProps) {
  return (
    <>
      <Head title={page.title} />

      <div className="min-h-screen bg-white">
        {/* Global styles application */}
        <style>
          {page.globalStyles?.fontFamily &&
            `body { font-family: ${page.globalStyles.fontFamily}; }`}
          {page.globalStyles?.primaryColor &&
            `:root { --primary-color: ${page.globalStyles.primaryColor}; }`}
        </style>

        {/* Render all sections */}
        <div className="max-w-7xl mx-auto">
          {page.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              isEditing={false}
            />
          ))}
        </div>

        {/* Empty state */}
        {page.sections.length === 0 && !isPublic && (
          <div className="flex items-center justify-center min-h-screen text-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">No content yet</h2>
              <p className="text-gray-600">
                Start building your landing page in the editor
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
