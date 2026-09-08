from pathlib import Path
from PIL import Image

img_dir = Path(r"C:\Users\user\Desktop\Podorozhnik\frontend\public\img")
THRESHOLD = 32

for path in sorted(img_dir.glob("icon-*.png")):
    im = Image.open(path).convert("RGBA")
    pixels = im.load()
    w, h = im.size
    cleared = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= THRESHOLD and g <= THRESHOLD and b <= THRESHOLD:
                pixels[x, y] = (0, 0, 0, 0)
                cleared += 1
    im.save(path, optimize=True)
    print(f"{path.name}: cleared {cleared}/{w*h} ({cleared * 100 / (w * h):.1f}%)")

print("done")
