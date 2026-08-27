from PIL import Image, ImageDraw

BG = (20, 23, 28, 255)          # --bg
CORE = (92, 200, 160, 255)      # --track-core
POWERBI = (76, 141, 255, 255)   # --track-powerbi
HOMEMODS = (224, 164, 88, 255)  # --track-homemods

def make_icon(size, maskable=False, path="icon.png"):
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)

    if maskable:
        # keep the mark inside the safe zone (~center 80%) with bg filling to edges
        pad = int(size * 0.26)
    else:
        pad = int(size * 0.20)
        # rounded-rect corners for the non-maskable icon
        radius = int(size * 0.22)
        mask = Image.new("L", (size, size), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
        bg_layer = Image.new("RGBA", (size, size), BG)
        img = Image.composite(bg_layer, Image.new("RGBA", (size, size), (0, 0, 0, 0)), mask)
        d = ImageDraw.Draw(img)

    # three vertical bars, evenly spaced, rounded caps — echoes the in-app gauge strip
    bars = [CORE, POWERBI, HOMEMODS]
    n = len(bars)
    gap = int(size * 0.06)
    inner_w = size - 2 * pad
    bar_w = (inner_w - gap * (n - 1)) / n
    top = pad
    bottom = size - pad
    x = pad
    for color in bars:
        d.rounded_rectangle([x, top, x + bar_w, bottom], radius=bar_w / 2, fill=color)
        x += bar_w + gap

    img.save(path)

make_icon(192, maskable=False, path="icons/icon-192.png")
make_icon(512, maskable=False, path="icons/icon-512.png")
make_icon(512, maskable=True, path="icons/icon-maskable-512.png")
make_icon(180, maskable=False, path="icons/apple-touch-icon.png")
print("done")
