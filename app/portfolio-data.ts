/**
 * Every website project/book has one matching folder under /public/media.
 * The first item in a project group is used as that project's cover.
 * Images and videos can be mixed; the UI detects common video extensions.
 */
const mediaPath = (folder: string, file: string) => encodeURI(`/media/${folder}/${file}`);

const pageSequence = (folder: string, count: number) =>
  Array.from({ length: count }, (_, index) =>
    mediaPath(folder, `pages/page-${String(index + 1).padStart(3, "0")}.jpg`),
  );

export const mediaGroups = {
  homeCover: {
    folder: "首页封面",
    items: [
      mediaPath("首页封面", "1.mp4"),
      mediaPath("首页封面", "2-sticker.png"),
      mediaPath("首页封面", "3-sticker.png"),
      mediaPath("首页封面", "4-sticker.png"),
      mediaPath("首页封面", "5.jpg"),
    ],
  },
  downByTheSea: {
    folder: "01｜含海量过高",
    items: [
      mediaPath("01｜含海量过高", "FM1.jpg"),
      mediaPath("01｜含海量过高", "01-cover.jpg"),
      mediaPath("01｜含海量过高", "02-portrait.jpg"),
      mediaPath("01｜含海量过高", "03-cover.jpg"),
      mediaPath("01｜含海量过高", "05-landscape.jpg"),
      mediaPath("01｜含海量过高", "微信图片_2026-08-17_231657_509.jpg"),
      mediaPath("01｜含海量过高", "微信图片_2026-08-17_231705_297.jpg"),
      mediaPath("01｜含海量过高", "bad4f7137812d61fd2c60f2a47d011f2_raw.mp4"),
      mediaPath("01｜含海量过高", "e4c6ba49b1197dba8381343be473e0c6_raw.mp4"),
    ],
  },
  rainforest: {
    folder: "02｜绿得很具体",
    items: [
      mediaPath("02｜绿得很具体", "FM2.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_231730_879.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_231759_531.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_231807_055.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_235918_846.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_235924_179.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_235928_560.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-17_235937_669.jpg"),
      mediaPath("02｜绿得很具体", "微信图片_2026-08-18_000043_936.jpg"),
    ],
  },
  graduation: {
    folder: "03｜从小岛毕业",
    items: [
      mediaPath("03｜从小岛毕业", "FM3.jpg"),
      mediaPath("03｜从小岛毕业", "微信图片_2026-08-18_000905_443.jpg"),
      mediaPath("03｜从小岛毕业", "微信图片_20260818000856_25_2.jpg"),
      mediaPath("03｜从小岛毕业", "微信图片_20260818000858_27_2.jpg"),
      mediaPath("03｜从小岛毕业", "微信图片_20260818000859_28_2.jpg"),
      mediaPath("03｜从小岛毕业", "微信图片_20260818001253_33_2.jpg"),
      mediaPath("03｜从小岛毕业", "微信图片_20260818001533_35_2.png"),
    ],
  },
  mountain: {
    folder: "04｜人已在山里",
    items: [
      mediaPath("04｜人已在山里", "FM4.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001821_37_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001822_38_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001826_41_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001827_42_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001828_43_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001829_44_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001832_46_2.jpg"),
      mediaPath("04｜人已在山里", "微信图片_20260818001833_47_2.jpg"),
    ],
  },
  teamwork: {
    folder: "05｜一些组队行为",
    items: [
      mediaPath("05｜一些组队行为", "FM5.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_2026-08-18_002227_637.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_2026-08-18_002259_686.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002616_48_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002617_49_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002618_50_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002623_52_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002626_55_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002627_56_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002628_57_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002630_60_2.jpg"),
      mediaPath("05｜一些组队行为", "微信图片_20260818002633_62_2.jpg"),
    ],
  },
  designPortfolio: {
    folder: "06-book-distance-volume",
    items: pageSequence("06-book-distance-volume", 63),
  },
  environmentPortfolio: {
    folder: "07-book-field-notes",
    items: pageSequence("07-book-field-notes", 50),
  },
  resume: {
    folder: "简历",
    items: pageSequence("简历", 2),
    pdf: mediaPath("简历", "周小雨简历初稿.pdf"),
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
    title: "含海量过高",
    kind: "海岸 / 旅行影像",
    year: "2026",
    note: "海风、岛屿与移动中的片段，在影像里保留旅行的温度。",
    color: "#1b36dc",
    images: mediaGroups.downByTheSea.items,
  },
  {
    title: "绿得很具体",
    kind: "雨林 / 人文风景",
    year: "2026",
    note: "热带建筑、植物与日常光线之间的短暂相遇。",
    color: "#173c2f",
    images: mediaGroups.rainforest.items,
  },
  {
    title: "从小岛毕业",
    kind: "毕业季 / 视觉记录",
    year: "2026",
    note: "关于告别、庆祝与新阶段的明亮记录。",
    color: "#e89942",
    images: mediaGroups.graduation.items,
  },
  {
    title: "人已在山里",
    kind: "山野 / 纪实风景",
    year: "2026",
    note: "在山海之间观察尺度、天气与人的位置。",
    color: "#687665",
    images: mediaGroups.mountain.items,
  },
  {
    title: "一些组队行为",
    kind: "合作 / 现场记录",
    year: "2026",
    note: "共同创作发生时，人物、空间与细节自然形成的现场档案。",
    color: "#cd5637",
    images: mediaGroups.teamwork.items,
  },
];

export type Book = {
  title: string;
  subtitle: string;
  edition: string;
  cover: string;
  accent: string;
  pages: Array<{ image: string; label: string }>;
};

const makeBookPages = (items: string[]) =>
  items.map((image, index) => ({
    image,
    label: `Page ${String(index + 1).padStart(2, "0")}`,
  }));

export const books: Book[] = [
  {
    title: "Raina 设计作品集",
    subtitle: "AI Product / Visual / Campaign",
    edition: "63 pages · 2025",
    cover: mediaGroups.designPortfolio.items[0],
    accent: "#4f46d9",
    pages: makeBookPages(mediaGroups.designPortfolio.items),
  },
  {
    title: "环境设计作品集",
    subtitle: "Space / Architecture / Research",
    edition: "50 pages · 2023",
    cover: mediaGroups.environmentPortfolio.items[0],
    accent: "#79c9ba",
    pages: makeBookPages(mediaGroups.environmentPortfolio.items),
  },
];

export const resumePages = mediaGroups.resume.items;
export const resumePdf = mediaGroups.resume.pdf;
