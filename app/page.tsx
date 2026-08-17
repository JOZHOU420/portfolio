"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { books, mediaGroups, projects, type Book } from "./portfolio-data";

const heroCards = [
  { src: mediaGroups.blueStatic.items[0], alt: "Blue Static cover", className: "hero-card--one" },
  { src: mediaGroups.betweenVolumes.items[0], alt: "Between Volumes cover", className: "hero-card--two" },
  { src: mediaGroups.softSignal.items[0], alt: "Soft Signal moving-image cover", className: "hero-card--three" },
];

type HeroOffset = { x: number; y: number; rotate: number };
type LightboxState = { project: number; image: number } | null;

const isVideo = (src: string) => /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(src);

function PortfolioMedia({
  src,
  alt,
  controls = false,
  draggable,
}: {
  src: string;
  alt: string;
  controls?: boolean;
  draggable?: boolean;
}) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        aria-label={alt}
        controls={controls}
        autoPlay={!controls}
        muted={!controls}
        loop={!controls}
        playsInline
        preload="metadata"
      />
    );
  }

  return <img src={src} alt={alt} draggable={draggable} />;
}

function BookPage({ page, side }: { page: Book["pages"][number]["left"]; side: "left" | "right" }) {
  return (
    <div className={`book-page book-page--${side}`}>
      {page.image ? (
        <PortfolioMedia src={page.image} alt={page.label ?? "Photobook page"} controls />
      ) : (
        <div className="book-page-copy">
          <small>{page.label}</small>
          <p>{page.text}</p>
        </div>
      )}
      {page.image && <small className="book-page-label">{page.label}</small>}
    </div>
  );
}

export default function Home() {
  const [heroOffsets, setHeroOffsets] = useState<HeroOffset[]>([
    { x: 0, y: 0, rotate: -7 },
    { x: 0, y: 0, rotate: 3 },
    { x: 0, y: 0, rotate: 8 },
  ]);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [activeBook, setActiveBook] = useState<number | null>(null);
  const [spread, setSpread] = useState(0);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [indexHover, setIndexHover] = useState(0);
  const dragRef = useRef<{
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const bookSwipeStart = useRef<number | null>(null);

  const hasOverlay = Boolean(lightbox) || activeBook !== null || resumeOpen;

  useEffect(() => {
    document.body.style.overflow = hasOverlay ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hasOverlay]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        setActiveBook(null);
        setResumeOpen(false);
        return;
      }

      if (lightbox && event.key === "ArrowRight") {
        setLightbox((current) => {
          if (!current) return null;
          const total = projects[current.project].images.length;
          return { ...current, image: (current.image + 1) % total };
        });
      }

      if (lightbox && event.key === "ArrowLeft") {
        setLightbox((current) => {
          if (!current) return null;
          const total = projects[current.project].images.length;
          return { ...current, image: (current.image - 1 + total) % total };
        });
      }

      if (activeBook !== null && event.key === "ArrowRight") turnBook("next");
      if (activeBook !== null && event.key === "ArrowLeft") turnBook("prev");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const moveCursor = (event: ReactPointerEvent<HTMLElement>) => {
    if (!cursorRef.current || event.pointerType === "touch") return;
    cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  };

  const startHeroDrag = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: heroOffsets[index].x,
      originY: heroOffsets[index].y,
    };
  };

  const moveHero = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setHeroOffsets((current) =>
      current.map((item, index) =>
        index === drag.index
          ? {
              ...item,
              x: drag.originX + event.clientX - drag.startX,
              y: drag.originY + event.clientY - drag.startY,
            }
          : item,
      ),
    );
  };

  const endHeroDrag = () => {
    dragRef.current = null;
  };

  const nudgeHero = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const amount = event.shiftKey ? 24 : 8;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, -amount],
      ArrowDown: [0, amount],
    };
    if (!delta[event.key]) return;
    event.preventDefault();
    setHeroOffsets((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, x: item.x + delta[event.key][0], y: item.y + delta[event.key][1] }
          : item,
      ),
    );
  };

  const shuffleHero = () => {
    setHeroOffsets((current) =>
      current.map((item) => ({
        x: Math.round((Math.random() - 0.5) * 150),
        y: Math.round((Math.random() - 0.5) * 90),
        rotate: item.rotate + Math.round((Math.random() - 0.5) * 18),
      })),
    );
  };

  const changeLightbox = (direction: 1 | -1) => {
    setLightbox((current) => {
      if (!current) return null;
      const total = projects[current.project].images.length;
      return { ...current, image: (current.image + direction + total) % total };
    });
  };

  const openBook = (index: number) => {
    setActiveBook(index);
    setSpread(0);
    setTurnDirection("next");
  };

  const turnBook = (direction: "next" | "prev") => {
    if (activeBook === null) return;
    setTurnDirection(direction);
    setSpread((current) => {
      const last = books[activeBook].pages.length - 1;
      return direction === "next" ? Math.min(last, current + 1) : Math.max(0, current - 1);
    });
  };

  const activeProject = lightbox ? projects[lightbox.project] : null;
  const currentBook = activeBook !== null ? books[activeBook] : null;

  return (
    <main onPointerMove={moveCursor}>
      <div className="cursor-dot" ref={cursorRef} aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Nian photography home">
          NIAN®
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Selected work</a>
          <a href="#books">Books</a>
          <button type="button" onClick={() => setResumeOpen(true)}>
            Résumé ↗
          </button>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <p className="eyebrow">Independent photographer · Shanghai / Worldwide</p>
        <h1 id="hero-title">
          Images before
          <br />
          <span>explanations.</span>
        </h1>
        <p className="hero-intro">
          Portrait, object and landscape studies—built around colour, tension and the
          small instant before a scene changes.
        </p>

        <div className="hero-stage" aria-label="Draggable selected photography collage">
          {heroCards.map((card, index) => (
            <button
              className={`hero-card ${card.className}`}
              key={card.src}
              type="button"
              aria-label={`Move image ${index + 1}. Drag or use arrow keys.`}
              onPointerDown={(event) => startHeroDrag(event, index)}
              onPointerMove={moveHero}
              onPointerUp={endHeroDrag}
              onPointerCancel={endHeroDrag}
              onKeyDown={(event) => nudgeHero(event, index)}
              style={
                {
                  "--drag-x": `${heroOffsets[index].x}px`,
                  "--drag-y": `${heroOffsets[index].y}px`,
                  "--drag-rotate": `${heroOffsets[index].rotate}deg`,
                } as CSSProperties
              }
            >
              <PortfolioMedia src={card.src} alt={card.alt} draggable={false} />
              <span>0{index + 1}</span>
            </button>
          ))}
          <button className="shuffle-note" type="button" onClick={shuffleHero}>
            Rearrange
            <br />
            the edit ↗
          </button>
        </div>

        <span className="hero-index">01—03 / Drag to compose</span>
        <a className="scroll-cue" href="#work">
          Scroll to explore <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="manifesto" aria-label="Artist statement">
        <p className="section-label">Approach — 01</p>
        <p className="manifesto-copy">
          I photograph the point where the <em>glamorous</em> becomes ordinary—and
          ordinary things start to feel a little strange.
        </p>
        <div className="ticker" aria-hidden="true">
          <div>
            Portrait · Editorial · Art direction · Image making · Portrait · Editorial · Art
            direction · Image making ·
          </div>
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="section-heading">
          <p className="section-label">Selected work — 02</p>
          <h2 id="work-title">Four ongoing stories</h2>
          <p>Click any image to enter the series. Use arrow keys to move through it.</p>
        </div>

        <div className="project-grid">
          {projects.map((project, projectIndex) => (
            <article
              className={`project-card project-card--${projectIndex + 1}`}
              key={project.title}
              style={{ "--card-color": project.color } as CSSProperties}
            >
              <button
                className="project-image"
                type="button"
                onClick={() => setLightbox({ project: projectIndex, image: 0 })}
                aria-label={`Open ${project.title} series`}
              >
                <PortfolioMedia src={project.images[0]} alt={`${project.title}, ${project.kind}`} />
                <span className="view-tag">{isVideo(project.images[0]) ? "Play video" : "View series"} ↗</span>
              </button>
              <div className="project-meta">
                <span>0{projectIndex + 1}</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.kind}</p>
                </div>
                <p>{project.year}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="project-index" aria-label="Project index">
          <p className="section-label">Index / hover to preview</p>
          <div className="index-layout">
            <div className="index-list">
              {projects.map((project, projectIndex) => (
                <button
                  type="button"
                  key={project.title}
                  onMouseEnter={() => setIndexHover(projectIndex)}
                  onFocus={() => setIndexHover(projectIndex)}
                  onClick={() => setLightbox({ project: projectIndex, image: 0 })}
                >
                  <span>0{projectIndex + 1}</span>
                  <strong>{project.title}</strong>
                  <span>{project.kind}</span>
                  <span>{project.year} ↗</span>
                </button>
              ))}
            </div>
            <figure className="index-preview">
              <PortfolioMedia
                key={projects[indexHover].images[1] ?? projects[indexHover].images[0]}
                src={projects[indexHover].images[1] ?? projects[indexHover].images[0]}
                alt={`${projects[indexHover].title} preview`}
              />
              <figcaption>{projects[indexHover].note}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="books-section" id="books" aria-labelledby="books-title">
        <div className="books-heading">
          <p className="section-label">Printed matter — 03</p>
          <h2 id="books-title">
            Two books.
            <br />
            Made to be opened.
          </h2>
          <p>Choose a cover, then click or swipe through each spread.</p>
        </div>
        <div className="book-shelf">
          {books.map((book, index) => (
            <button className="book-object" type="button" key={book.title} onClick={() => openBook(index)}>
              <span className="book-spine" style={{ background: book.accent }} />
              <span className="book-cover">
                <PortfolioMedia src={book.cover} alt={`${book.title} cover`} />
                <span className="book-cover-shade" />
                <strong>{book.title}</strong>
                <small>{book.subtitle}</small>
                <i>Open book ↗</i>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <p className="section-label">Information — 04</p>
        <div className="about-grid">
          <h2 id="about-title">Available for images, ideas and beautiful problems.</h2>
          <div className="about-copy">
            <p>
              Nian is an independent photographer and visual designer working across
              portraiture, editorial commissions and self-initiated books.
            </p>
            <p>
              For commissions, exhibitions, print enquiries or a longer conversation,
              write to <a href="mailto:hello@nianyuan.studio">hello@nianyuan.studio</a>.
            </p>
            <button className="resume-button" type="button" onClick={() => setResumeOpen(true)}>
              Open full-screen résumé <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      <footer>
        <a href="mailto:hello@nianyuan.studio">Let’s make something worth looking at.</a>
        <div>
          <span>Shanghai · 31.2304° N</span>
          <span>© 2026 NIAN</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {lightbox && activeProject && (
        <div className="overlay lightbox" role="dialog" aria-modal="true" aria-label={`${activeProject.title} gallery`}>
          <div className="overlay-topbar">
            <div>
              <strong>{activeProject.title}</strong>
              <span>{activeProject.kind}</span>
            </div>
            <p>
              {String(lightbox.image + 1).padStart(2, "0")} / {String(activeProject.images.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={() => setLightbox(null)} aria-label="Close gallery">
              Close ×
            </button>
          </div>
          <button className="lightbox-nav lightbox-nav--prev" type="button" onClick={() => changeLightbox(-1)} aria-label="Previous image">
            ←
          </button>
          <figure className="lightbox-figure" key={activeProject.images[lightbox.image]}>
            <PortfolioMedia
              src={activeProject.images[lightbox.image]}
              alt={`${activeProject.title} media ${lightbox.image + 1}`}
              controls
            />
            <figcaption>{activeProject.note}</figcaption>
          </figure>
          <button className="lightbox-nav lightbox-nav--next" type="button" onClick={() => changeLightbox(1)} aria-label="Next image">
            →
          </button>
        </div>
      )}

      {currentBook && activeBook !== null && (
        <div className="overlay book-reader" role="dialog" aria-modal="true" aria-label={`${currentBook.title} reader`}>
          <div className="overlay-topbar overlay-topbar--light">
            <div>
              <strong>{currentBook.title}</strong>
              <span>{currentBook.edition}</span>
            </div>
            <p>
              Spread {String(spread + 1).padStart(2, "0")} / {String(currentBook.pages.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={() => setActiveBook(null)} aria-label="Close book">
              Close ×
            </button>
          </div>

          <div
            className="reader-stage"
            onPointerDown={(event) => {
              bookSwipeStart.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (bookSwipeStart.current === null) return;
              const distance = event.clientX - bookSwipeStart.current;
              if (Math.abs(distance) > 45) turnBook(distance < 0 ? "next" : "prev");
              bookSwipeStart.current = null;
            }}
          >
            <button
              className="reader-hit reader-hit--left"
              type="button"
              onClick={() => turnBook("prev")}
              disabled={spread === 0}
              aria-label="Previous spread"
            />
            <div className={`open-book open-book--${turnDirection}`} key={`${activeBook}-${spread}`}>
              <BookPage page={currentBook.pages[spread].left} side="left" />
              <span className="book-gutter" />
              <BookPage page={currentBook.pages[spread].right} side="right" />
            </div>
            <button
              className="reader-hit reader-hit--right"
              type="button"
              onClick={() => turnBook("next")}
              disabled={spread === currentBook.pages.length - 1}
              aria-label="Next spread"
            />
          </div>
          <div className="reader-controls">
            <button type="button" onClick={() => turnBook("prev")} disabled={spread === 0}>
              ← Previous
            </button>
            <p>Click the page · drag · or use arrow keys</p>
            <button type="button" onClick={() => turnBook("next")} disabled={spread === currentBook.pages.length - 1}>
              Next →
            </button>
          </div>
        </div>
      )}

      {resumeOpen && (
        <div className="overlay resume-overlay" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <button className="resume-close" type="button" onClick={() => setResumeOpen(false)}>
            Close résumé ×
          </button>
          <div className="resume-sheet">
            <div className="resume-hero">
              <p>Curriculum Vitae / 2026</p>
              <h2 id="resume-title">NIAN YUAN</h2>
              <p>Photographer · Visual Designer · Image Maker</p>
            </div>
            <div className="resume-columns">
              <div>
                <section>
                  <h3>Profile</h3>
                  <p>
                    Independent photographer building vivid editorial worlds through portrait,
                    spatial observation and print. Based in Shanghai, available worldwide.
                  </p>
                </section>
                <section>
                  <h3>Selected clients</h3>
                  <p>Wallpaper* China · NOWNESS · Lane Crawford · Modern Weekly · Local Objects</p>
                </section>
                <section>
                  <h3>Contact</h3>
                  <p>hello@nianyuan.studio<br />Shanghai, China<br />Instagram / @nian.images</p>
                </section>
              </div>
              <div>
                <section className="resume-list">
                  <h3>Experience</h3>
                  <p><time>2023—Now</time><span>Independent Photographer & Art Director<br />Shanghai / Worldwide</span></p>
                  <p><time>2021—23</time><span>Visual Designer<br />Studio Parallel, Shanghai</span></p>
                  <p><time>2019—21</time><span>Photography Assistant<br />Multiple studios, Shanghai</span></p>
                </section>
                <section className="resume-list">
                  <h3>Recognition</h3>
                  <p><time>2026</time><span>Photobook shortlist · Distance, Volume</span></p>
                  <p><time>2025</time><span>Emerging Image Makers · Group exhibition</span></p>
                  <p><time>2024</time><span>Independent publishing fair · Field Notes 01</span></p>
                </section>
                <section>
                  <h3>Practice</h3>
                  <p>Photography · Art direction · Editorial design · Retouching · Print production</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
