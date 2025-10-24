import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';

interface LandingPage {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface IndexProps {
  pages: LandingPage[];
}

export default function Index({ pages }: IndexProps) {
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this landing page?')) {
      router.delete(`/landing-pages/${id}`);
    }
  };

  return (
    <>
      <Head title="Landing Pages" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Landing Pages</h1>
            <p className="text-gray-600 mt-1">
              Manage your landing pages
            </p>
          </div>
          <Button asChild>
            <Link href="/landing-pages/create">
              <Plus className="h-4 w-4 mr-2" />
              New Landing Page
            </Link>
          </Button>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Plus className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No landing pages yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first landing page
            </p>
            <Button asChild>
              <Link href="/landing-pages/create">Create Landing Page</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{page.title}</h3>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      page.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/landing-pages/${page.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/landing-pages/${page.id}/preview`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Updated {new Date(page.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
