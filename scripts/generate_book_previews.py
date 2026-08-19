from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MEDIA_ROOT = ROOT / "public" / "media"
PREVIEW_WIDTH = 1200
BOOK_FOLDERS = ("06-book-distance-volume", "07-book-field-notes")


def save_standard_jpeg(source: Path, target: Path, width: int, quality: int) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(
            target,
            format="JPEG",
            quality=quality,
            optimize=True,
            progressive=False,
            subsampling=1,
        )


def generate_book_previews() -> None:
    for folder in BOOK_FOLDERS:
        page_folder = MEDIA_ROOT / folder / "pages"
        preview_folder = MEDIA_ROOT / folder / "previews"
        for source in sorted(page_folder.glob("page-*.jpg")):
            save_standard_jpeg(source, preview_folder / source.name, PREVIEW_WIDTH, 88)


def generate_graduation_cover() -> None:
    source = MEDIA_ROOT / "03｜从小岛毕业" / "FM3.jpg"
    target = ROOT / "public" / "images" / "graduation-cover-v3.jpg"
    save_standard_jpeg(source, target, 2400, 92)


if __name__ == "__main__":
    generate_book_previews()
    generate_graduation_cover()
