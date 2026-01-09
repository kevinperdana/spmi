import { useMemo } from 'react';

interface DocumentItem {
    id: number;
    doc_number: string | null;
    title: string;
    download_url: string | null;
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

export default function KebijakanDocuments({ sections, label }: KebijakanDocumentsProps) {
    const sectionList = useMemo(() => sections, [sections]);
    const verticalLabel = label ?? 'KEBIJAKAN';

    return (
        <>
            <style>{styles}</style>
            <div className="spmi-fasilitas">
                <div className="spmi-fasilitas__grid">
                    <div className="spmi-fasilitas__side">
                        <div className="spmi-fasilitas__vert">{verticalLabel}</div>
                    </div>

                    <div className="spmi-fasilitas__content">
                        {sectionList.map((section) => {
                            const rows = section.documents || [];
                            return (
                                <div className="spmi-panel" key={section.id}>
                                    <div className="spmi-panel__inner">
                                        <h2 className="spmi-panel__title" id={`kebijakanTitle-${section.id}`}>
                                            {section.title}
                                        </h2>

                                        <div className="spmi-table-wrap">
                                            <table className="spmi-table" aria-describedby={`kebijakanTitle-${section.id}`}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 120 }}>No.</th>
                                                        <th>Kebijakan</th>
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
                                                                            title="Login sebagai Auditie untuk download"
                                                                        >
                                                                            Download
                                                                        </span>
                                                                    )}
                                                                    <span className={`spmi-download__badge ${row.download_url ? 'spmi-download__badge--available' : 'spmi-download__badge--restricted'}`}>
                                                                        {row.download_url ? 'Available to Download' : 'Available to Auditie'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="spmi-empty" hidden={rows.length > 0}>
                                            Belum ada dokumen pada section ini.
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
