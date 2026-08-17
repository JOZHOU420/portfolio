# 分组素材替换指南

所有图片与视频现在都在 `public/media` 中，并按项目分组：

| 文件夹 | 对应页面内容 |
| --- | --- |
| `01-blue-static` | Blue Static 项目 |
| `02-between-volumes` | Between Volumes 项目 |
| `03-after-the-heat` | After the Heat 项目 |
| `04-soft-signal` | Soft Signal 视频项目 |
| `05-book-field-notes` | 第一本作品册 Field Notes 01 |
| `06-book-distance-volume` | 第二本作品册 Distance, Volume |

## 原位替换

进入某个项目文件夹，用同名文件覆盖旧文件即可。例如：

- 替换 Blue Static 封面：覆盖 `public/media/01-blue-static/01-cover.jpg`。
- 替换 Soft Signal 视频：覆盖 `public/media/04-soft-signal/01-cover.mp4`。

同名覆盖时不需要修改代码。替换完成后需要重新发布，线上网站才会更新。

## 给一组增加更多素材

1. 把新文件放进对应项目文件夹。
2. 打开 `app/portfolio-data.ts`。
3. 在该组的 `items` 中增加路径，顺序就是网站里的浏览顺序。

```ts
blueStatic: {
  folder: "/media/01-blue-static",
  items: [
    "/media/01-blue-static/01-cover.jpg",
    "/media/01-blue-static/02-portrait.jpg",
    "/media/01-blue-static/03-detail.mp4",
  ],
},
```

每个项目组的第一个素材是项目封面。系统会根据扩展名自动识别 `.mp4`、`.webm` 和 `.ogg` 视频。

## 视频建议

- 首选 MP4：H.264 视频编码 + AAC 音频编码。
- 项目封面会静音循环播放，全屏打开后有完整播放控制。
- 不建议直接使用 MOV。
- 单条视频建议控制在 30–50 MB 以内。
