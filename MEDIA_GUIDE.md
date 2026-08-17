# 图片与视频替换指南

## 最简单：原位替换

把新文件放进 `public/images`，并使用现有文件名覆盖旧文件。页面中所有引用会一起更新，不用改代码。

## 使用新文件名

1. 图片放入 `public/images`，例如 `public/images/new-cover.jpg`。
2. 视频建议放入 `public/videos`，例如 `public/videos/showreel.mp4`。
3. 打开 `app/portfolio-data.ts`，将对应路径改成：

```ts
cover: "/images/new-cover.jpg"
```

或：

```ts
images: ["/videos/showreel.mp4", "/images/1.jpg", "/images/2.jpg"]
```

系统会根据扩展名自动区分图片和视频。你当前放在 `public/images/巴厘岛.mp4` 的视频也可以直接写成：

```ts
images: ["/images/巴厘岛.mp4"]
```

## 视频建议

- 首选 `.mp4`：H.264 视频编码 + AAC 音频编码。
- 也支持 `.webm` 和 `.ogg`。
- 不建议直接使用 `.mov`，因为部分浏览器无法播放。
- 项目卡和首屏会静音循环播放；打开全屏后会显示播放、暂停、音量和进度控制。
- 建议单条视频控制在 30–50 MB 以内，页面打开会更快。

## 修改项目名称和顺序

`app/portfolio-data.ts` 中的 `projects` 数组控制项目名称、类型、年份、说明以及每个项目的素材顺序。`images` 数组里的第一个素材会作为项目封面。
