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
  { src: mediaGroups.homeCover.items[0], alt: "含海量过高动态封面", className: "hero-card--one", kind: "video" },
  { src: mediaGroups.homeCover.items[1], alt: "绿得很具体人物贴纸", className: "hero-card--two", kind: "sticker" },
  { src: mediaGroups.homeCover.items[2], alt: "从小岛毕业小熊贴纸", className: "hero-card--three", kind: "sticker" },
  { src: mediaGroups.homeCover.items[3], alt: "人已在山里人物贴纸", className: "hero-card--four", kind: "sticker" },
  { src: mediaGroups.homeCover.items[4], alt: "一些组队行为静态封面", className: "hero-card--five", kind: "square" },
];

const carouselSlots = [-2, -1, 0, 1, 2] as const;

type HeroOffset = { x: number; y: number; rotate: number };
type LightboxState = { project: number; image: number } | null;

const isVideo = (src: string) => /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(src);
const wrapIndex = (index: number, total: number) => ((index % total) + total) % total;
const bookPreviewSrc = (src: string) => src.replace("/pages/", "/previews/");

function PortfolioMedia({
  src,
  alt,
  controls = false,
  autoPlay = !controls,
  muted = !controls,
  loop = !controls,
  draggable,
}: {
  src: string;
  alt: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  draggable?: boolean;
}) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        aria-label={alt}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
      />
    );
  }

  return <img src={src} alt={alt} draggable={draggable} />;
}

function BookPage({ page }: { page: Book["pages"][number] }) {
  const preview = bookPreviewSrc(page.image);
  return (
    <div className="book-page">
      <img
        src={page.image}
        srcSet={`${preview} 1200w, ${page.image} 2400w`}
        sizes="(max-width: 620px) 94vw, min(90vw, 1420px)"
        alt={page.label}
        draggable={false}
        decoding="async"
        fetchPriority="high"
      />
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
    if (activeBook === null) return;
    const pageItems = books[activeBook].pages;
    [spread - 2, spread - 1, spread + 1, spread + 2].forEach((pageIndex) => {
      if (pageIndex < 0 || pageIndex >= pageItems.length) return;
      const preloadImage = new Image();
      preloadImage.src = bookPreviewSrc(pageItems[pageIndex].image);
    });
  }, [activeBook, spread]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        setActiveBook(null);
        setResumeOpen(false);
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
    setLightbox({ project, image });
  };

  const closeProject = () => {
    setLightbox(null);
  };

  const openBook = (index: number) => {
    setActiveBook(index);
    setSpread(0);
    setTurnDirection("next");
  };

  const closeBook = () => {
    setActiveBook(null);
  };

  function turnBook(direction: "next" | "prev") {
    if (activeBook === null) return;
    const last = books[activeBook].pages.length - 1;
    setTurnDirection(direction);
    setSpread((currentSpread) => {
      return direction === "next" ? Math.min(last, currentSpread + 1) : Math.max(0, currentSpread - 1);
    });
  }

  const activeProject = lightbox ? projects[lightbox.project] : null;
  const currentBook = activeBook !== null ? books[activeBook] : null;

  return (
    <main onPointerMove={moveCursor}>
      <div className="cursor-dot" ref={cursorRef} aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Raina portfolio home">
          周小雨 / RAINA®
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Selected work</a>
          <a href="#books">Books</a>
          <button type="button" onClick={() => setResumeOpen(true)}>
            简历 ↗
          </button>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <p className="eyebrow">AI Product Manager · Visual / Image · AI Applications</p>
        <h1 id="hero-title">
          AI products
          <br />
          <span>for visual worlds.</span>
        </h1>
        <p className="hero-intro">
          我是一名 AI 产品经理，专注视觉 / 图像内容及 AI 应用，
          将感知、内容与技术转化为清晰可用的产品体验。
        </p>

        <div className="hero-stage" aria-label="Draggable selected photography collage">
          {heroCards.map((card, index) => (
            <button
              className={`hero-card ${card.className} hero-card--${card.kind}`}
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

        <span className="hero-index">01—05 / Drag to compose</span>
        <a className="scroll-cue" href="#work">
          Scroll to explore <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="manifesto" aria-label="Artist statement">
        <p className="section-label">Approach — 01</p>
        <p className="manifesto-copy">
          I build AI products where <em>visual intelligence</em> becomes clear,
          useful and ready for people to explore.
        </p>
        <p className="manifesto-copy-zh">
          我热爱摄影、审美与图像创作，也希望打造真正实用、人人都能轻松探索的视觉智能 AI 产品。
        </p>
        <div className="ticker" aria-hidden="true">
          <div>
            AI product strategy · Multimodal experience · Visual content · Prototyping · AI
            product strategy · Multimodal experience ·
          </div>
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="project-index project-index--lead" aria-label="Project index">
          <p className="section-label">INDEX / HOVER TO PREVIEW</p>
          <p className="index-intro">
            <span>五组摄影作品，记录五个</span>
            <span>从日常生活里拾起的片段。</span>
          </p>
          <div className="index-layout">
            <div className="index-list">
              {projects.map((project, projectIndex) => (
                <div
                  className="index-row"
                  key={project.title}
                  onMouseEnter={() => {
                    setIndexHover(projectIndex);
                  }}
                  onFocus={() => setIndexHover(projectIndex)}
                  tabIndex={0}
                >
                  <span>0{projectIndex + 1}</span>
                  <strong>{project.title}</strong>
                  <span>{project.kind}</span>
                  <span>{project.year}</span>
                </div>
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

        <div className="section-heading">
          <p className="section-label">Selected work — 02</p>
          <h2 id="work-title">Five visual stories</h2>
          <div className="work-guide">
            <span>下一步 / NEXT</span>
            <p>点击任意封面进入对应图组系列，使用左右方向键平滑浏览。</p>
            <strong aria-hidden="true">↓</strong>
          </div>
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

      </section>

      <section className="books-section" id="books" aria-labelledby="books-title">
        <div className="books-heading">
          <p className="section-label">Printed matter — 03</p>
          <h2 id="books-title">
            Portfolio
            <br />
            过往设计作品集
          </h2>
          <p>收录过往的视觉与环境设计项目，欢迎选择一本，随意翻翻。</p>
        </div>
        <div className="book-shelf">
          {books.map((book, index) => (
            <button
              className="book-object"
              type="button"
              key={book.title}
              onClick={() => openBook(index)}
              aria-label={`Open ${book.title}`}
            >
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
            Raina / 周小雨是一名 AI 产品经理，专注视觉 / 图像内容及 AI 应用，
            工作横跨产品策略、多模态体验、视觉内容与快速原型。
            </p>
            <p className="contact-details">
              <span>电话 / 微信</span>
              <a href="tel:13114936926">13114936926（微信同号）</a>
              <span>邮箱</span>
              <a href="mailto:1341059849@qq.com">1341059849@qq.com</a>
            </p>
            <button className="resume-button" type="button" onClick={() => setResumeOpen(true)}>
              全屏查看简历 <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      <footer>
        <a className="footer-cta" href="mailto:1341059849@qq.com">
          <span className="footer-cta-en">Empowering everyone to create something worth seeing.</span>
          <span className="footer-cta-zh">让每个人都能创造值得被看见的作品。</span>
        </a>
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
          <div className="orbit-carousel" aria-live="polite">
            <div
              className={`orbit-track orbit-track--${galleryDirection}`}
              key={`${lightbox.project}-${lightbox.image}-${galleryDirection}`}
            >
              {carouselSlots.map((slot) => {
                const imageIndex = wrapIndex(lightbox.image + slot, activeProject.images.length);
                const src = activeProject.images[imageIndex];
                const fromSlot = slot + (galleryDirection === "next" ? 1 : -1);
                return (
                  <figure
                    className={`orbit-item${slot === 0 ? " orbit-item--center" : ""}${Math.abs(slot) === 2 ? " orbit-item--far" : ""}`}
                    key={slot}
                    style={{ "--slot": slot, "--from-slot": fromSlot } as CSSProperties}
                    aria-hidden={slot !== 0}
                  >
                    <PortfolioMedia
                      src={src}
                      alt={`${activeProject.title} media ${imageIndex + 1}`}
                      autoPlay={slot === 0}
                      muted
                      loop
                    />
                  </figure>
                );
              })}
            </div>
            <p className="orbit-caption">{activeProject.note}</p>
          </div>
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
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className="open-book">
              <div
                className={`book-under-page book-under-page--${turnDirection}`}
                key={`${activeBook}-${spread}`}
                aria-hidden="true"
              >
                <BookPage page={currentBook.pages[spread]} />
              </div>
              <span className="book-page-edge" aria-hidden="true" />
            </div>
            <button
              className="reader-hit reader-hit--right"
              type="button"
              onClick={() => turnBook("next")}
              disabled={spread === currentBook.pages.length - 1}
              aria-label="Next spread"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="reader-controls">
            <button type="button" onClick={() => turnBook("prev")} disabled={spread === 0}>
              ← 上一页
            </button>
            <p>点击页面左右两侧 · 左右滑动 · 或使用方向键</p>
            <button type="button" onClick={() => turnBook("next")} disabled={spread === currentBook.pages.length - 1}>
              下一页 →
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
