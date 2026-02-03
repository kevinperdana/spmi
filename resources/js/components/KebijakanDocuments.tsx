import { useEffect, useMemo, useRef, useState } from 'react';

interface DocumentItem {
    id: number;
    doc_number: string | null;
    title: string;
    download_url: string | null;
    view_url: string | null;
}

interface DocumentSection {
    id: number;
    title: string;
    documents: DocumentItem[];
}

interface KebijakanDocumentsProps {
    sections: DocumentSection[];
    label?: string;
}

const styles = `
  /* =========================
     SCOPE RESET (biar gak bentrok theme)
     ========================= */
  .spmi-fasilitas,
  .spmi-fasilitas * { box-sizing: border-box; }

  :root{
    --spmi-card:#ffffff;
    --spmi-text:#111827;
    --spmi-muted:#6b7280;
    --spmi-border:#e5e7eb;
    --spmi-shadow:0 10px 25px rgba(0,0,0,.08);
    --spmi-radius:18px;

    --spmi-accent:#2563eb; /* border active */
    --spmi-pill:#eef1f4;   /* bg tab non-active */
  }

  .spmi-fasilitas{
    width: 100%;
    overflow: visible;
  }

  /* GRID 2 KOLOM (SAMA POLA DENGAN CONTOH KAMU) */
  .spmi-fasilitas__grid{
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 28px;
    align-items: start;
    padding: 24px 16px 24px;
    overflow: visible;
  }

  /* LABEL KIRI (INI YANG "PRESISI" seperti contoh) */
  .spmi-fasilitas__side{ position: relative; overflow: visible; }
  .spmi-fasilitas__vert{
    position: sticky;
    top: 110px;

    writing-mode: vertical-rl;
    transform: rotate(180deg);

    font-weight: 800;
    letter-spacing: 6px;
    color: #98a2b3;

    /* responsif seperti contoh */
    font-size: clamp(34px, 4.5vw, 54px);
    line-height: 1;
    margin-bottom: 24px;
    user-select: none;
    z-index: 1;
  }

  /* KONTEN KANAN */
  .spmi-fasilitas__content{ min-width: 0; overflow: visible; }

  /* ====== TABS ====== */
  .spmi-tabs{
    font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
    color:var(--spmi-text);
  }

  .spmi-tabs__head{
    display:flex;
    gap:10px;
    padding:12px;
    background: #ffffff;
    border:1px solid var(--spmi-border);
    border-radius:18px;

    overflow-x:auto;
    overflow-y:hidden;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:thin;
  }

  .spmi-tabs__head::-webkit-scrollbar{ height:8px; }
  .spmi-tabs__head::-webkit-scrollbar-thumb{
    background:rgba(0,0,0,.15);
    border-radius:999px;
  }
  .spmi-tabs__head::-webkit-scrollbar-track{ background:transparent; }

  .spmi-tab{
    flex:0 0 auto;
    white-space:nowrap;
    appearance:none;
    border:1px solid transparent;
    background: var(--spmi-pill);
    padding: 12px 18px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 800;
    color: #6b7280;
    cursor:pointer;
    transition: all .15s ease;
    line-height:1;
  }

  .spmi-tab:hover:not(.is-active){
    background:#e6eaef;
    color:#111827;
    transform: translateY(-1px);
  }

  .spmi-tab.is-active{
    background:#ffffff;
    color:#111827;
    border: 2px solid var(--spmi-accent);
    box-shadow: 0 6px 14px rgba(0,0,0,.08);
  }

  /* ====== PANEL + TABLE ====== */
  .spmi-panel{
    margin-top: 18px;
    border-radius: var(--spmi-radius);
    background: var(--spmi-card);
    border: 1px solid var(--spmi-border);
    box-shadow: var(--spmi-shadow);
    overflow: visible;
  }

  .spmi-panel__inner{ padding: 22px 22px 18px; }

  .spmi-panel__title{
    margin: 0 0 14px;
    font-size: 44px;
    line-height: 1.05;
    font-weight: 800;
    color: #1f2937;
  }

  .spmi-table-wrap{
    overflow-x:auto;
    border:1px solid var(--spmi-border);
    border-radius: 18px;
    background: #fff;
  }

  .spmi-table{
    width:100%;
    border-collapse:separate;
    border-spacing:0;
    min-width: 920px;
  }

  .spmi-table thead th{
    text-align:left;
    font-size: 18px;
    color:#111827;
    font-weight: 900;
    background:#f7f7f7;
    border-bottom:1px solid var(--spmi-border);
    padding:18px;
  }

  .spmi-table tbody td{
    padding:22px 18px;
    border-bottom:1px solid var(--spmi-border);
    vertical-align:middle;
    font-size: 20px;
    font-weight: 700;
    color:#111827;
  }
  .spmi-table tbody tr:last-child td{ border-bottom:0; }

  .spmi-docno{ font-weight: 900; letter-spacing: .02em; }
  .spmi-docname{ font-weight: 900; }
  .spmi-cell-center{
    text-align:center;
    vertical-align:middle;
  }
  .spmi-head-center{ text-align:center; }

  .spmi-btn{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding: 16px 22px;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.08);
    background:#111827;
    color:#fff;
    font-weight: 900;
    font-size: 18px;
    text-decoration:none;
    transition: transform .12s ease, opacity .12s ease;
    white-space:nowrap;
  }
  .spmi-btn:hover{ transform: translateY(-1px); opacity: .95; }
  .spmi-btn:active{ transform: translateY(0); }
  .spmi-btn[disabled],
  .spmi-btn.is-disabled{
    opacity:.5;
    cursor:not-allowed;
    transform:none;
  }
  button.spmi-btn{ cursor:pointer; }
  .spmi-btn--view{ background:#2563eb; }

  .spmi-download{
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  .spmi-download .spmi-btn,
  .spmi-download__badge{
    width: 100%;
    justify-content: center;
  }
  .spmi-download__badge{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: #f8fafc;
    color: #6b7280;
    font-size: 11px;
    font-weight: 700;
  }
  .spmi-download__badge--available{
    border-color: #bbf7d0;
    background: #dcfce7;
    color: #15803d;
  }
  .spmi-download__badge--restricted{
    border-color: #fed7aa;
    background: #ffedd5;
    color: #c2410c;
  }

  .spmi-empty{ margin-top: 12px; color: var(--spmi-muted); font-weight: 700; }

  /* ====== MODAL VIEWER ====== */
  .spmi-modal{
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(15, 23, 42, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .spmi-modal__dialog{
    width: min(1200px, 100%);
    height: min(90vh, 900px);
    background: #ffffff;
    border-radius: 22px;
    box-shadow: 0 30px 70px rgba(0,0,0,.35);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .spmi-modal__header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--spmi-border);
    background: #f8fafc;
  }

  .spmi-modal__title{
    font-size: 18px;
    font-weight: 800;
    color: #111827;
    margin: 0;
  }

  .spmi-modal__controls{
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .spmi-control{
    border: 1px solid var(--spmi-border);
    background: #ffffff;
    color: #111827;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    line-height: 1;
  }
  .spmi-control:hover{ background: #f1f5f9; }
  .spmi-control:disabled{ opacity: .5; cursor: not-allowed; }
  .spmi-control--primary{
    background: #111827;
    border-color: #111827;
    color: #ffffff;
  }
  .spmi-control--primary:hover{ background: #0f172a; }
  .spmi-control--ghost{ background: transparent; }

  .spmi-zoom-label{
    font-size: 12px;
    font-weight: 800;
    color: #334155;
    padding: 0 6px;
  }

  .spmi-viewer{
    flex: 1;
    background: #0f172a;
  }
  .spmi-viewer iframe{
    width: 100%;
    height: 100%;
    border: 0;
    background: #0f172a;
  }

  /* ====== RESPONSIVE (SAMA POLA DENGAN CONTOH) ====== */
  @media (max-width: 900px){
    .spmi-fasilitas__grid{
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .spmi-fasilitas__side{
      display: none;
    }
    .spmi-panel__title{ font-size: 34px; }
  }

  @media (max-width: 640px){
    .spmi-modal{
      padding: 12px;
    }
    .spmi-modal__header{
      flex-direction: column;
      align-items: flex-start;
    }
    .spmi-modal__controls{
      width: 100%;
      justify-content: flex-start;
    }
  }
`;

export default function KebijakanDocuments({ sections, label }: KebijakanDocumentsProps) {
    const initialSection = useMemo(() => sections[0] || null, [sections]);
    const [activeId, setActiveId] = useState<number | null>(initialSection?.id ?? null);
    const [viewerDocument, setViewerDocument] = useState<DocumentItem | null>(null);
    const [viewerRevision, setViewerRevision] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const activeButtonRef = useRef<HTMLButtonElement | null>(null);
    const verticalLabel = label ?? 'KEBIJAKAN';
    const zoomPercent = Math.round(zoomLevel * 100);
    const viewerSrc = viewerDocument?.view_url ? `${viewerDocument.view_url}#zoom=${zoomPercent}` : '';

    const ZOOM_STEP = 0.25;
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2.5;

    const canZoomIn = zoomLevel < MAX_ZOOM;
    const canZoomOut = zoomLevel > MIN_ZOOM;

    useEffect(() => {
        if (!activeId && sections.length > 0) {
            setActiveId(sections[0].id);
        }
    }, [activeId, sections]);

    useEffect(() => {
        if (activeButtonRef.current) {
            activeButtonRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeId]);

    useEffect(() => {
        if (!viewerDocument) return;

        setZoomLevel(1);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setViewerDocument(null);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [viewerDocument]);

    const handleOpenViewer = (document: DocumentItem) => {
        if (!document.view_url) return;
        setViewerDocument(document);
    };

    const handleCloseViewer = () => {
        setViewerDocument(null);
    };

    const handleZoomIn = () => {
        setZoomLevel((current) => Math.min(MAX_ZOOM, Number((current + ZOOM_STEP).toFixed(2))));
    };

    const handleZoomOut = () => {
        setZoomLevel((current) => Math.max(MIN_ZOOM, Number((current - ZOOM_STEP).toFixed(2))));
    };

    const handleZoomReset = () => {
        setZoomLevel(1);
        setViewerRevision((current) => current + 1);
    };

    const activeSection = sections.find((section) => section.id === activeId) || sections[0];
    const rows = activeSection?.documents || [];

    if (!sections.length) {
        return null;
    }

    return (
        <>
            <style>{styles}</style>
            <div className="spmi-fasilitas">
                <div className="spmi-fasilitas__grid">
                    <div className="spmi-fasilitas__side">
                        <div className="spmi-fasilitas__vert">{verticalLabel}</div>
                    </div>

                    <div className="spmi-fasilitas__content">
                        <div className="spmi-tabs" data-tabs>
                            <div className="spmi-tabs__head" role="tablist" aria-label="Dokumen Kebijakan">
                                {sections.map((section) => {
                                    const isActive = section.id === activeSection?.id;
                                    return (
                                        <button
                                            key={section.id}
                                            className={`spmi-tab${isActive ? ' is-active' : ''}`}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive ? 'true' : 'false'}
                                            onClick={() => setActiveId(section.id)}
                                            ref={isActive ? activeButtonRef : null}
                                        >
                                            {section.title}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="spmi-panel" role="tabpanel">
                                <div className="spmi-panel__inner">
                                    <h2 className="spmi-panel__title" id="kebijakanPanelTitle">
                                        {activeSection?.title}
                                    </h2>

                                    <div className="spmi-table-wrap">
                                        <table className="spmi-table" aria-describedby="kebijakanPanelTitle">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 120 }}>No.</th>
                                                    <th>Kebijakan</th>
                                                    <th className="spmi-head-center" style={{ width: 140 }}>
                                                        View
                                                    </th>
                                                    <th className="spmi-head-center" style={{ width: 220 }}>
                                                        Link (Download)
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row) => (
                                                    <tr key={row.id}>
                                                        <td>
                                                            <span className="spmi-docno">{row.doc_number || '-'}</span>
                                                        </td>
                                                        <td>
                                                            <span className="spmi-docname">{row.title}</span>
                                                        </td>
                                                        <td className="spmi-cell-center">
                                                            {row.view_url ? (
                                                                <button
                                                                    type="button"
                                                                    className="spmi-btn spmi-btn--view"
                                                                    onClick={() => handleOpenViewer(row)}
                                                                >
                                                                    View
                                                                </button>
                                                            ) : (
                                                                <span
                                                                    className="spmi-btn spmi-btn--view is-disabled"
                                                                    aria-disabled="true"
                                                                >
                                                                    View
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="spmi-cell-center">
                                                            <div className="spmi-download">
                                                                {row.download_url ? (
                                                                    <a
                                                                        className="spmi-btn"
                                                                        href={row.download_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download
                                                                    >
                                                                        Download
                                                                    </a>
                                                                ) : (
                                                                    <span
                                                                        className="spmi-btn"
                                                                        aria-disabled="true"
                                                                    >
                                                                        Download
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="spmi-empty" hidden={rows.length > 0}>
                                        Belum ada dokumen pada tab ini.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {viewerDocument && viewerDocument.view_url ? (
                <div
                    className="spmi-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Preview ${viewerDocument.title}`}
                    onClick={handleCloseViewer}
                >
                    <div className="spmi-modal__dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="spmi-modal__header">
                            <h3 className="spmi-modal__title">{viewerDocument.title}</h3>
                            <div className="spmi-modal__controls">
                                <button
                                    type="button"
                                    className="spmi-control"
                                    onClick={handleZoomOut}
                                    disabled={!canZoomOut}
                                    aria-label="Zoom out"
                                >
                                    -
                                </button>
                                <span className="spmi-zoom-label">{zoomPercent}%</span>
                                <button
                                    type="button"
                                    className="spmi-control"
                                    onClick={handleZoomIn}
                                    disabled={!canZoomIn}
                                    aria-label="Zoom in"
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    className="spmi-control"
                                    onClick={handleZoomReset}
                                >
                                    Reset
                                </button>
                                <a
                                    className="spmi-control spmi-control--primary"
                                    href={viewerDocument.view_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Buka Tab
                                </a>
                                <button
                                    type="button"
                                    className="spmi-control spmi-control--ghost"
                                    onClick={handleCloseViewer}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                        <div className="spmi-viewer">
                            <iframe
                                key={`${viewerDocument.id}-${viewerRevision}`}
                                src={viewerSrc}
                                title={`Preview ${viewerDocument.title}`}
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
