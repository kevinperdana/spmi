import { Head } from '@inertiajs/react';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    is_published: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    pages: Page[];
}

export default function IndexTest({ pages }: Props) {
    return (
        <>
            <Head title="Pages Test" />
            <div style={{ padding: '20px', color: 'black', backgroundColor: 'white' }}>
                <h1>Pages Test - Simple Version</h1>
                <p>Total pages: {pages?.length || 0}</p>
                <pre>{JSON.stringify(pages, null, 2)}</pre>
            </div>
        </>
    );
}
