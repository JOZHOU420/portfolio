"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  books,
  mediaGroups,
  projects,
  resumePages,
  resumePdf,
  type Book,
} from "./portfolio-data";

const heroCards = [
  { src: mediaGroups.homeCover.items[0], alt: "含海量过高动态封面", className: "hero-card--one", emoji: "🐠" },
  { src: mediaGroups.homeCover.items[1], alt: "绿得很具体", className: "hero-card--two", emoji: "🌴" },
  { src: mediaGroups.homeCover.items[2], alt: "从小岛毕业", className: "hero-card--three", emoji: "🎓" },
  { src: mediaGroups.homeCover.items[3], alt: "人已在山里", className: "hero-card--four", emoji: "🦶🏻" },
  { src: mediaGroups.homeCover.items[4], alt: "一些组队行为", className: "hero-card--five", emoji: "🎁" },
];

const projectCursorEmojis = ["🐠", "🌴", "🎓", "🦶🏻", "🎁"] as const;
const bookCursorEmoji = "🖐🏻";

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

function BookPage({ page }: { page: Book["pages"][number] }) {
  return (
    <div className="book-page">
      <PortfolioMedia src={page.image} alt={page.label} controls />
      <small className="book-page-label">{page.label}</small>
    </div>
  );
}

export default function Home() {
  const [heroOffsets, setHeroOffsets] = useState<HeroOffset[]>([
    { x: 0, y: 0, rotate: -7 },
    { x: 0, y: 0, rotate: 3 },
    { x: 0, y: 0, rotate: 8 },
    { x: 0, y: 0, rotate: -4 },
    { x: 0, y: 0, rotate: 5 },
  ]);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [activeBook, setActiveBook] = useState<number | null>(null);
  const [spread, setSpread] = useState(0);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");
  const [galleryDirection, setGalleryDirection] = useState<"next" | "prev">("next");
  const [cursorSticker, setCursorSticker] = useState("");
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
        setCursorSticker("");
        return;
      }

      if (lightbox && event.key === "ArrowRight") {
        setGalleryDirection("next");
        setLightbox((current) => {
          if (!current) return null;
          const total = projects[current.project].images.length;
          return { ...current, image: (current.image + 1) % total };
        });
      }

      if (lightbox && event.key === "ArrowLeft") {
        setGalleryDirection("prev");
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
    setGalleryDirection(direction === 1 ? "next" : "prev");
    setLightbox((current) => {
      if (!current) return null;
      const total = projects[current.project].images.length;
      return { ...current, image: (current.image + direction + total) % total };
    });
  };

  const openProject = (project: number, image = 0) => {
    setGalleryDirection("next");
    setCursorSticker(projectCursorEmojis[project]);
    setLightbox({ project, image });
  };

  const closeProject = () => {
    setLightbox(null);
    setCursorSticker("");
  };

  const openBook = (index: number) => {
    setActiveBook(index);
    setSpread(0);
    setTurnDirection("next");
    setCursorSticker(bookCursorEmoji);
  };

  const closeBook = () => {
    setActiveBook(null);
    setCursorSticker("");
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
      <div
        className={`cursor-dot${cursorSticker ? " cursor-dot--sticker" : ""}`}
        ref={cursorRef}
        aria-hidden="true"
      >
        {cursorSticker}
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Raina portfolio home">
          RAINA®
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
        <p className="eyebrow">Visual designer · Image maker · Shenzhen / Beijing</p>
        <h1 id="hero-title">
          Images before
          <br />
          <span>explanations.</span>
        </h1>
        <p className="hero-intro">
          Travel, portrait and collaborative image studies—built around colour,
          observation and the small instant before a scene changes.
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
              onPointerEnter={() => setCursorSticker(card.emoji)}
              onPointerLeave={() => setCursorSticker("")}
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

        <span className="hero-index">01—05 / Drag to compose</span>
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
          <h2 id="work-title">Five visual stories</h2>
          <p>Click any image to enter the series. Use arrow keys to move through it.</p>
        </div>

        <div className="project-grid">
          {projects.map((project, projectIndex) => (
            <article
              className={`project-card project-card--${projectIndex + 1}`}
              key={project.title}
              style={{ "--card-color": project.color } as CSSProperties}
              onPointerEnter={() => setCursorSticker(projectCursorEmojis[projectIndex])}
              onPointerLeave={() => {
                if (!lightbox) setCursorSticker("");
              }}
            >
              <button
                className="project-image"
                type="button"
                onClick={() => openProject(projectIndex)}
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
                  onMouseEnter={() => {
                    setIndexHover(projectIndex);
                    setCursorSticker(projectCursorEmojis[projectIndex]);
                  }}
                  onMouseLeave={() => setCursorSticker("")}
                  onFocus={() => setIndexHover(projectIndex)}
                  onClick={() => openProject(projectIndex)}
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
            <button
              className="book-object"
              type="button"
              key={book.title}
              onClick={() => openBook(index)}
              onPointerEnter={() => setCursorSticker(bookCursorEmoji)}
              onPointerLeave={() => {
                if (activeBook === null) setCursorSticker("");
              }}
              aria-label={`Open ${book.title}`}
            >
              <span className="book-spine" style={{ background: book.accent }} />
              <span className="book-cover">
                <PortfolioMedia src={book.cover} alt={`${book.title} cover`} />
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
            Raina / 周小雨是一名视觉设计师与影像创作者，工作横跨摄影、内容创作、
            产品视觉与自发出版项目。
            </p>
            <p>
              For commissions, exhibitions, print enquiries or a longer conversation,
              write to <a href="mailto:1341059849@qq.com">1341059849@qq.com</a>.
            </p>
            <button className="resume-button" type="button" onClick={() => setResumeOpen(true)}>
              Open full-screen résumé <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      <footer>
        <a href="mailto:1341059849@qq.com">Let’s make something worth looking at.</a>
        <div>
          <span>Shenzhen / Beijing</span>
          <span>© 2026 RAINA</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {lightbox && activeProject && (
        <div
          className="overlay lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProject.title} gallery`}
          onPointerEnter={() => setCursorSticker(projectCursorEmojis[lightbox.project])}
        >
          <div className="overlay-topbar">
            <div>
              <strong>{activeProject.title}</strong>
              <span>{activeProject.kind}</span>
            </div>
            <p>
              {String(lightbox.image + 1).padStart(2, "0")} / {String(activeProject.images.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={closeProject} aria-label="Close gallery">
              Close ×
            </button>
          </div>
          <button className="lightbox-nav lightbox-nav--prev" type="button" onClick={() => changeLightbox(-1)} aria-label="Previous image">
            ←
          </button>
          <figure
            className={`lightbox-figure lightbox-figure--project-${lightbox.project + 1} lightbox-figure--${galleryDirection} lightbox-figure--variant-${lightbox.image % 3}`}
            key={`${activeProject.images[lightbox.image]}-${galleryDirection}`}
          >
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
        <div
          className="overlay book-reader"
          role="dialog"
          aria-modal="true"
          aria-label={`${currentBook.title} reader`}
          onPointerEnter={() => setCursorSticker(bookCursorEmoji)}
        >
          <div className="overlay-topbar overlay-topbar--light">
            <div>
              <strong>{currentBook.title}</strong>
              <span>{currentBook.edition}</span>
            </div>
            <p>
              Page {String(spread + 1).padStart(2, "0")} / {String(currentBook.pages.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={closeBook} aria-label="Close book">
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
              <BookPage page={currentBook.pages[spread]} />
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
          <div className="resume-document" id="resume-title">
            {resumePages.map((page, index) => (
              <img src={page} alt={`周小雨简历第 ${index + 1} 页`} key={page} />
            ))}
          </div>
          <a className="resume-pdf-link" href={resumePdf} target="_blank" rel="noreferrer">
            Open original PDF ↗
          </a>
        </div>
      )}
    </main>
  );
}
