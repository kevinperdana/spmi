import { useEffect, useMemo, useRef, useState } from 'react';

interface DocumentItem {
    id: number;
    doc_number: string | null;
    title: string;
    file_url: string;
}

interface DocumentSection {
    id: number;
    title: string;
    documents: DocumentItem[];
}

interface SopDocumentsProps {
    sections: DocumentSection[];
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
    padding: 24px 16px 0;
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
    margin-top:18px;
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
    min-width: 780px;
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

  .spmi-empty{ margin-top: 12px; color: var(--spmi-muted); font-weight: 700; }

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
`;

export default function SopDocuments({ sections }: SopDocumentsProps) {
    const initialSection = useMemo(() => sections[0] || null, [sections]);
    const [activeId, setActiveId] = useState<number | null>(initialSection?.id ?? null);
    const activeButtonRef = useRef<HTMLButtonElement | null>(null);

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
                        <div className="spmi-fasilitas__vert">DOKUMEN SOP</div>
                    </div>

                    <div className="spmi-fasilitas__content">
                        <div className="spmi-tabs" data-tabs>
                            <div className="spmi-tabs__head" role="tablist" aria-label="Dokumen SOP">
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
                                    <h2 className="spmi-panel__title" id="spmiPanelTitle">
                                        {activeSection?.title}
                                    </h2>

                                    <div className="spmi-table-wrap">
                                        <table className="spmi-table" aria-describedby="spmiPanelTitle">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 160 }}>No Dokumen</th>
                                                    <th>Nama Dokumen</th>
                                                    <th style={{ width: 220 }}>Link (Download)</th>
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
                                                        <td>
                                                            <a
                                                                className="spmi-btn"
                                                                href={row.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                            >
                                                                Download
                                                            </a>
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
        </>
    );
}
