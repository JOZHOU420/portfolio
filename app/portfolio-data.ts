/**
 * GROUPED MEDIA GUIDE
 * Every website project/book has one matching folder under /public/media.
 * Replace files inside that folder, or add a new path to its `items` array.
 * The first item in each project group is used as that project's cover.
 * .mp4, .webm and .ogg paths are detected automatically as video.
 */
export const mediaGroups = {
  blueStatic: {
    folder: "/media/01-blue-static",
    items: [
      "/media/01-blue-static/01-cover.jpg",
      "/media/01-blue-static/02-portrait.jpg",
    ],
  },
  betweenVolumes: {
    folder: "/media/02-between-volumes",
    items: ["/media/02-between-volumes/01-cover.jpg"],
  },
  afterTheHeat: {
    folder: "/media/03-after-the-heat",
    items: [
      "/media/03-after-the-heat/01-cover.jpg",
      "/media/03-after-the-heat/02-landscape.jpg",
    ],
  },
  softSignal: {
    folder: "/media/04-soft-signal",
    items: ["/media/04-soft-signal/01-cover.mp4"],
  },
  fieldNotesBook: {
    folder: "/media/05-book-field-notes",
    items: [
      "/media/05-book-field-notes/01-cover.jpg",
      "/media/05-book-field-notes/02-portrait.jpg",
      "/media/05-book-field-notes/03-colour.jpg",
      "/media/05-book-field-notes/04-motion.mp4",
    ],
  },
  distanceVolumeBook: {
    folder: "/media/06-book-distance-volume",
    items: [
      "/media/06-book-distance-volume/01-cover.jpg",
      "/media/06-book-distance-volume/02-landscape.jpg",
      "/media/06-book-distance-volume/03-sea.jpg",
    ],
  },
};

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
    images: mediaGroups.blueStatic.items,
  },
  {
    title: "Between Volumes",
    kind: "Architecture study",
    year: "2024",
    note: "Concrete, temporary light and the choreography of passing bodies.",
    color: "#d9d5ca",
    images: mediaGroups.betweenVolumes.items,
  },
  {
    title: "After the Heat",
    kind: "Personal landscape",
    year: "2026",
    note: "Notes from dry places where scale becomes difficult to read.",
    color: "#e89942",
    images: mediaGroups.afterTheHeat.items,
  },
  {
    title: "Soft Signal",
    kind: "Moving image",
    year: "2023—25",
    note: "A moving portrait is allowed to remain unresolved.",
    color: "#cd5637",
    images: mediaGroups.softSignal.items,
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

const fieldNotes = mediaGroups.fieldNotesBook.items;
const distanceVolume = mediaGroups.distanceVolumeBook.items;

export const books: Book[] = [
  {
    title: "Field Notes 01",
    subtitle: "Colour / People / Fragments",
    edition: "Edition of 60 · 2025",
    cover: fieldNotes[0],
    accent: "#243bd7",
    pages: [
      {
        left: { label: "FIELD NOTES 01", text: "Colour / People / Fragments\n2023—2025" },
        right: { image: fieldNotes[0], label: "Plate 01" },
      },
      {
        left: { image: fieldNotes[1], label: "Plate 02" },
        right: { image: fieldNotes[2], label: "Plate 03" },
      },
      {
        left: { image: fieldNotes[3], label: "Plate 04" },
        right: {
          label: "A NOTE ON LOOKING",
          text: "The portrait begins after certainty ends. I leave the frame open long enough for posture to become accident.",
        },
      },
      {
        left: { image: fieldNotes[2], label: "Plate 05" },
        right: { image: fieldNotes[0], label: "Plate 06 / End" },
      },
    ],
  },
  {
    title: "Distance, Volume",
    subtitle: "Structures / Deserts / Edges",
    edition: "First edition · 2026",
    cover: distanceVolume[0],
    accent: "#9dff38",
    pages: [
      {
        left: { label: "DISTANCE, VOLUME", text: "Structures / Deserts / Edges\n2024—2026" },
        right: { image: distanceVolume[0], label: "Figure 01" },
      },
      {
        left: { image: distanceVolume[1], label: "Figure 02" },
        right: { image: distanceVolume[2], label: "Figure 03" },
      },
      {
        left: {
          label: "FIELD RECORD",
          text: "Scale is never neutral. A wall can become a horizon; a body can become a mark on the weather.",
        },
        right: { image: distanceVolume[0], label: "Figure 04" },
      },
      {
        left: { image: distanceVolume[1], label: "Figure 05" },
        right: { image: distanceVolume[2], label: "Figure 06 / End" },
      },
    ],
  },
];
