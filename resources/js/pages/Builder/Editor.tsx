import { Head, router } from '@inertiajs/react';
import { BuilderProvider } from '@/contexts/builder-context';
import { PageBuilder } from '@/components/builder/page-builder';
import type { LandingPage } from '@/types/builder';

interface EditorProps {
  page: LandingPage | null;
}

export default function Editor({ page }: EditorProps) {
  const handleSave = (data: LandingPage) => {
    if (page?.id) {
      // Update existing page
      router.put(`/landing-pages/${page.id}`, data, {
        preserveScroll: true,
      });
    } else {
      // Create new page
      router.post('/landing-pages', data);
    }
  };

  const handlePreview = () => {
    if (page?.id) {
      window.open(`/landing-pages/${page.id}/preview`, '_blank');
    }
  };

  return (
    <>
      <Head title={page ? `Edit ${page.title}` : 'Create Landing Page'} />

      <BuilderProvider initialPage={page || undefined}>
        <PageBuilder onSave={handleSave} onPreview={handlePreview} />
      </BuilderProvider>
    </>
  );
}
