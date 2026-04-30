from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = ROOT / "Snipaste_2026-04-30_18-06-05.png"
OUT_DIR = ROOT / "assets" / "live2d"


MASK_DEFS = {
    "bang_left": [
        ("polygon", [(365, 305), (535, 290), (610, 380), (575, 595), (485, 705), (345, 670), (315, 515)]),
    ],
    "bang_center": [
        ("polygon", [(630, 285), (920, 290), (965, 405), (865, 670), (750, 800), (620, 700), (590, 470)]),
    ],
    "bang_right": [
        ("polygon", [(900, 290), (1140, 315), (1210, 455), (1160, 660), (1030, 720), (900, 610), (855, 405)]),
    ],
    "hair_left": [
        ("polygon", [(220, 560), (410, 640), (455, 910), (415, 1190), (250, 1310), (120, 1180), (135, 835)]),
    ],
    "hair_right": [
        ("polygon", [(1160, 610), (1350, 590), (1445, 760), (1435, 1115), (1325, 1285), (1150, 1260), (1115, 900)]),
    ],
    "earring_left": [
        ("ellipse", (320, 690, 560, 1115)),
    ],
    "earring_right": [
        ("ellipse", (1005, 695, 1245, 1115)),
    ],
    "iris_left": [
        ("ellipse", (420, 620, 675, 875)),
    ],
    "iris_right": [
        ("ellipse", (880, 620, 1135, 875)),
    ],
    "mouth": [
        ("ellipse", (640, 780, 945, 980)),
    ],
    "torso": [
        ("polygon", [(485, 835), (1090, 835), (1115, 1125), (1010, 1320), (585, 1320), (460, 1130)]),
    ],
    "skirt": [
        ("polygon", [(490, 980), (1090, 980), (1180, 1310), (400, 1315)]),
    ],
}

BLUR_FOR_LAYER = {
    "bang_left": 1.2,
    "bang_center": 1.2,
    "bang_right": 1.2,
    "hair_left": 1.5,
    "hair_right": 1.5,
    "earring_left": 1.0,
    "earring_right": 1.0,
    "iris_left": 0.8,
    "iris_right": 0.8,
    "mouth": 0.8,
    "torso": 1.2,
    "skirt": 1.2,
}

EXPAND_FOR_CLEAR = {
    "bang_left": 8,
    "bang_center": 8,
    "bang_right": 8,
    "hair_left": 8,
    "hair_right": 8,
    "earring_left": 6,
    "earring_right": 6,
    "iris_left": 4,
    "iris_right": 4,
    "mouth": 4,
    "torso": 8,
    "skirt": 8,
}

BASE_ERASE_ORDER = [
    "bang_left",
    "bang_center",
    "bang_right",
    "hair_left",
    "hair_right",
    "earring_left",
    "earring_right",
    "iris_left",
    "iris_right",
    "mouth",
    "torso",
    "skirt",
]


def draw_shape(draw: ImageDraw.ImageDraw, shape) -> None:
    kind, data = shape
    if kind == "polygon":
        draw.polygon(data, fill=255)
    elif kind == "ellipse":
        draw.ellipse(data, fill=255)
    elif kind == "rectangle":
        draw.rectangle(data, fill=255)
    else:
        raise ValueError(f"Unsupported shape: {kind}")


def make_mask(size, shapes, expand=0, blur=0):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for shape in shapes:
        draw_shape(draw, shape)
    if expand > 0:
        for _ in range(expand):
            mask = mask.filter(ImageFilter.MaxFilter(3))
    if blur > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return mask


def harden_mask(mask: Image.Image, threshold: int = 14) -> Image.Image:
    return mask.point(lambda value: 255 if value > threshold else 0)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC_PATH).convert("RGBA")
    width, height = img.size

    img.save(OUT_DIR / "full.png")

    clear_masks = {}
    for name, shapes in MASK_DEFS.items():
        layer_mask = make_mask((width, height), shapes, blur=BLUR_FOR_LAYER.get(name, 1.0))
        layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        layer.paste(img, (0, 0), layer_mask)
        layer.save(OUT_DIR / f"{name}.png")

        clear_masks[name] = make_mask(
            (width, height),
            shapes,
            expand=EXPAND_FOR_CLEAR.get(name, 6),
            blur=1.4,
        )
        clear_masks[name] = harden_mask(clear_masks[name])

    base = img.copy()
    alpha = base.getchannel("A")
    for name in BASE_ERASE_ORDER:
        alpha = Image.composite(Image.new("L", (width, height), 0), alpha, clear_masks[name])
    base.putalpha(alpha)
    base.save(OUT_DIR / "base.png")

    print(f"Generated Live2D layer assets in {OUT_DIR}")


if __name__ == "__main__":
    main()
