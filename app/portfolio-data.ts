/**
 * PHOTO / VIDEO SWAP GUIDE
 * 1. Put photos in /public/images and videos in /public/videos.
 * 2. Keep an existing filename to replace it everywhere, or edit a path below.
 * 3. .mp4, .webm and .ogg paths are detected automatically as video.
 * Example: bali: "/images/巴厘岛.mp4" or bali: "/videos/bali-island.mp4"
 * The same media library drives the hero, projects, lightbox and both books.
 */
export const imageLibrary = {
  blue: "/images/1.jpg",
  concrete: "/images/2.jpg",
  desertGold: "/images/3.jpg",
  desertWhite: "/images/4.jpg",
  motion: "/images/巴厘岛.mp4",
  shadow: "/images/5.jpg",
  portraitSoft: "/images/2.jpg",
  portraitOrange: "/images/3.jpg",
  mountain: "/images/4.jpg",
  sea: "/images/5.jpg",
} as const;

export type Project = {
  title: string;
  kind: string;
  year: string;
  note: string;
  color: string;
  images: string[];
};

export const projects: Project[] = [
  {
    title: "Blue Static",
    kind: "Editorial portrait",
    year: "2025",
    note: "A study of distance, skin and constructed calm.",
    color: "#1b36dc",
    images: [imageLibrary.blue, imageLibrary.portraitSoft, imageLibrary.motion],
  },
  {
    title: "Between Volumes",
    kind: "Architecture study",
    year: "2024",
    note: "Concrete, temporary light and the choreography of passing bodies.",
    color: "#d9d5ca",
    images: [imageLibrary.concrete, imageLibrary.shadow, imageLibrary.mountain],
  },
  {
    title: "After the Heat",
    kind: "Personal landscape",
    year: "2026",
    note: "Notes from dry places where scale becomes difficult to read.",
    color: "#e89942",
    images: [imageLibrary.desertGold, imageLibrary.desertWhite, imageLibrary.sea],
  },
  {
    title: "Soft Signal",
    kind: "Portrait series",
    year: "2023—25",
    note: "A moving portrait is allowed to remain unresolved.",
    color: "#cd5637",
    images: [imageLibrary.motion, imageLibrary.portraitOrange, imageLibrary.blue],
  },
];

export type Book = {
  title: string;
  subtitle: string;
  edition: string;
  cover: string;
  accent: string;
  pages: Array<{
    left: { image?: string; label?: string; text?: string };
    right: { image?: string; label?: string; text?: string };
  }>;
};

export const books: Book[] = [
  {
    title: "Field Notes 01",
    subtitle: "Colour / People / Fragments",
    edition: "Edition of 60 · 2025",
    cover: imageLibrary.blue,
    accent: "#243bd7",
    pages: [
      {
        left: { label: "FIELD NOTES 01", text: "Colour / People / Fragments\n2023—2025" },
        right: { image: imageLibrary.blue, label: "Plate 01" },
      },
      {
        left: { image: imageLibrary.portraitSoft, label: "Plate 02" },
        right: { image: imageLibrary.portraitOrange, label: "Plate 03" },
      },
      {
        left: { image: imageLibrary.motion, label: "Plate 04" },
        right: {
          label: "A NOTE ON LOOKING",
          text: "The portrait begins after certainty ends. I leave the frame open long enough for posture to become accident.",
        },
      },
      {
        left: { image: imageLibrary.shadow, label: "Plate 05" },
        right: { image: imageLibrary.blue, label: "Plate 06 / End" },
      },
    ],
  },
  {
    title: "Distance, Volume",
    subtitle: "Structures / Deserts / Edges",
    edition: "First edition · 2026",
    cover: imageLibrary.concrete,
    accent: "#9dff38",
    pages: [
      {
        left: { label: "DISTANCE, VOLUME", text: "Structures / Deserts / Edges\n2024—2026" },
        right: { image: imageLibrary.concrete, label: "Figure 01" },
      },
      {
        left: { image: imageLibrary.shadow, label: "Figure 02" },
        right: { image: imageLibrary.desertWhite, label: "Figure 03" },
      },
      {
        left: {
          label: "FIELD RECORD",
          text: "Scale is never neutral. A wall can become a horizon; a body can become a mark on the weather.",
        },
        right: { image: imageLibrary.desertGold, label: "Figure 04" },
      },
      {
        left: { image: imageLibrary.mountain, label: "Figure 05" },
        right: { image: imageLibrary.sea, label: "Figure 06 / End" },
      },
    ],
  },
];
