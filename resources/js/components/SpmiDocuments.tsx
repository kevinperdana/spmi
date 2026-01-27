import { useCallback, useEffect, useRef, useState } from 'react';

interface DocumentItem {
    id: number;
    title: string;
    download_url: string | null;
}

interface DocumentSection {
    id: number;
    title: string;
    documents: DocumentItem[];
}

interface SpmiDocumentsProps {
    sections: DocumentSection[];
}

const prevIcon = '\u2039';
const nextIcon = '\u203a';
const downloadArrow = '\u2192';

const styles = `
  /* =========================
     SCOPE RESET (biar gak bentrok theme)
     ========================= */
  .spmi-fasilitas,
  .spmi-fasilitas * { box-sizing: border-box; }

  .spmi-fasilitas{
    width: 100%;
    overflow: visible;
  }

  /* GRID 2 KOLOM */
  .spmi-fasilitas__grid{
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 28px;
    align-items: start;
    padding: 0 16px 24px;
    overflow: visible; /* penting untuk shadow */
  }

  /* LABEL KIRI */
  .spmi-fasilitas__side{ position: relative; overflow: visible; }
  .spmi-fasilitas__vert{
    position: sticky;
    top: 110px;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: 800;
    letter-spacing: 6px;
    color: #98a2b3;
    font-size: 54px;
    line-height: 1;
    margin-top: 24px;
    user-select: none;
    z-index: 1;
  }

  /* KONTEN */
  .spmi-fasilitas__content{ min-width: 0; overflow: visible; }

  /* SECTION */
  .spmi-sec{ margin: 24px 0 0px; overflow: visible; }
  .spmi-sec__header{
    background: #eef2f5;
    padding: 18px 18px;
    overflow: visible;
  }
  .spmi-sec__title{
    margin: 0;
    font-size: 54px;
    line-height: 1.05;
    font-weight: 800;
    color: #1f2937;
  }

  /* =========================
     SLIDER
     ========================= */
  .spmi-slider{
    position: relative;
    margin-top: 14px;
    padding: 0 44px;         /* ruang tombol */
    overflow: visible;        /* penting: jangan clip shadow */
  }

  .spmi-track{
    position: relative;
    z-index: 1;               /* di bawah tombol */
    display: flex;
    gap: 18px;
    overflow-x: auto;
    overflow-y: visible;      /* penting */
    scroll-snap-type: x mandatory;

    /* ruang untuk shadow agar tidak "kepotong" */
    padding: 14px 2px 50px;

    scrollbar-width: none;
  }
  .spmi-track::-webkit-scrollbar{ display: none; }

  /* =========================
     CARD
     ========================= */
  .spmi-card{
    scroll-snap-align: start;
    min-width: 240px;
    max-width: 240px;

    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;

    text-decoration: none;
    color: inherit;

    /* drop-shadow lebih aman dari clipping dibanding box-shadow */
    box-shadow: none;
    filter: drop-shadow(0 10px 18px rgba(0,0,0,.08));

    transition: transform .15s ease, filter .15s ease, border-color .15s ease;
    will-change: transform;
  }
  .spmi-card:hover{
    transform: translateY(-2px);
    filter: drop-shadow(0 16px 28px rgba(0,0,0,.12));
    border-color: #d1d5db;
  }

  .spmi-pill{
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 4px 10px;
    border-radius: 999px;
    margin-bottom: 10px;
  }
  .spmi-card__title{
    font-size: 18px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 6px;
  }
  .spmi-card__desc{
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 14px;
  }
  .spmi-card__cta{
    font-weight: 800;
    color: #374151;
  }
  .spmi-card__badge{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: #f8fafc;
    color: #6b7280;
    font-size: 11px;
    font-weight: 700;
  }
  .spmi-card__badge--available{
    border-color: #bbf7d0;
    background: #dcfce7;
    color: #15803d;
  }
  .spmi-card__badge--restricted{
    border-color: #fed7aa;
    background: #ffedd5;
    color: #c2410c;
  }

  /* =========================
     NAV BUTTONS (klikable)
     ========================= */
  .spmi-nav{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    width: 34px;
    height: 52px;
    border: 0;
    border-radius: 8px;

    background: rgba(17,24,39,.85);
    color: #fff;
    cursor: pointer;
    font-size: 28px;

    display: flex;
    align-items: center;
    justify-content: center;

    /* paling penting: di atas semuanya */
    z-index: 9999 !important;
    pointer-events: auto !important;
  }
  .spmi-nav--prev{ left: 0; }
  .spmi-nav--next{ right: 0; }
  .spmi-nav:disabled{ opacity: .35; cursor: not-allowed; }

  /* kalau theme bikin overlay pseudo element, matikan */
  .spmi-slider::before,
  .spmi-slider::after{
    content: none !important;
  }

  /* =========================
     DOTS
     ========================= */
  .spmi-dots{
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-top: 6px;
  }
  .spmi-dot{
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #cfd6dd;
    border: 0;
    cursor: pointer;
  }
  .spmi-dot.is-active{ background: #6b7280; }

  /* =========================
     RESPONSIVE
     ========================= */
  @media (max-width: 900px){
    .spmi-fasilitas__grid{
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .spmi-fasilitas__side{
      display: none;
    }
    .spmi-sec__title{ font-size: 34px; }
  }

/* ===== FIX CLICK ARROW: bikin layer slider kuat ===== */
.spmi-slider{
  position: relative;
  margin-top: 14px;
  padding: 0 44px;
  overflow: visible;

  /* kunci: buat stacking context sendiri */
  isolation: isolate;
  z-index: 10;
}

/* tombol harus lebih tinggi dari track */
.spmi-track{ position: relative; z-index: 1; }

/* tombol di atas semuanya + area klik lebih besar */
.spmi-nav{
  z-index: 99999 !important;
  pointer-events: auto !important;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

/* Perbesar hit area klik tombol (tanpa ubah ukuran visual) */
.spmi-nav::before{
  content:"";
  position:absolute;
  inset:-18px;  /* makin besar area klik */
  background: transparent;
}
`;

function DocumentSectionSlider({ section }: { section: DocumentSection }) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const updateButtons = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        const max = track.scrollWidth - track.clientWidth - 2;
        setCanPrev(track.scrollLeft > 2);
        setCanNext(track.scrollLeft < max);
    }, []);

    useEffect(() => {
        updateButtons();
        const track = trackRef.current;
        if (!track) return;

        const handleScroll = () => requestAnimationFrame(updateButtons);
        track.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateButtons);

        return () => {
            track.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateButtons);
        };
    }, [updateButtons, section.documents.length]);

    const scrollByOne = (direction: number) => {
        const track = trackRef.current;
        if (!track) return;

        const firstCard = track.querySelector<HTMLElement>('.spmi-card');
        const step = (firstCard?.offsetWidth || 240) + 18;
        track.scrollBy({ left: direction * step, behavior: 'smooth' });
    };

    return (
        <section className="spmi-sec" data-spmi-slider>
            <div className="spmi-sec__header">
                <h2 className="spmi-sec__title">{section.title}</h2>
            </div>

            <div className="spmi-slider">
                <button
                    className="spmi-nav spmi-nav--prev"
                    type="button"
                    aria-label="Sebelumnya"
                    onClick={() => scrollByOne(-1)}
                    disabled={!canPrev}
                >
                    {prevIcon}
                </button>

                <div className="spmi-track" ref={trackRef}>
                    {section.documents.map((document) => (
                        document.download_url ? (
                            <a
                                key={document.id}
                                className="spmi-card"
                                href={document.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="spmi-pill">PDF</div>
                                <div className="spmi-card__title">{document.title}</div>
                                <div className="spmi-card__desc">Download {downloadArrow}</div>
                            </a>
                        ) : (
                            <div
                                key={document.id}
                                className="spmi-card"
                                aria-disabled="true"
                            >
                                <div className="spmi-pill">PDF</div>
                                <div className="spmi-card__title">{document.title}</div>
                                <div className="spmi-card__desc">Download {downloadArrow}</div>
                            </div>
                        )
                    ))}
                </div>

                <button
                    className="spmi-nav spmi-nav--next"
                    type="button"
                    aria-label="Berikutnya"
                    onClick={() => scrollByOne(1)}
                    disabled={!canNext}
                >
                    {nextIcon}
                </button>
            </div>
        </section>
    );
}

export default function SpmiDocuments({ sections }: SpmiDocumentsProps) {
    if (!sections.length) {
        return null;
    }

    return (
        <>
            <style>{styles}</style>
            <div className="spmi-fasilitas">
                <div className="spmi-fasilitas__grid">
                    <div className="spmi-fasilitas__side">
                        <div className="spmi-fasilitas__vert">DOKUMEN SPMI</div>
                    </div>

                    <div className="spmi-fasilitas__content">
                        {sections.map((section) => (
                            <DocumentSectionSlider key={section.id} section={section} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
