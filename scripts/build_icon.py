"""Generate browser fallback and touch icons matching assets/favicon.svg."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
scale = 8
image = Image.new('RGBA', (64 * scale, 64 * scale))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((0, 0, 64 * scale - 1, 64 * scale - 1), radius=14 * scale, fill='#122b3e')
for points, color in [([(22, 19), (9, 32), (22, 45)], '#eef6f6'),
                      ([(42, 19), (55, 32), (42, 45)], '#eef6f6'),
                      ([(37, 15), (27, 49)], '#eda975')]:
    draw.line([(x * scale, y * scale) for x, y in points], fill=color, width=6 * scale, joint='curve')
    for x, y in points:
        draw.ellipse(((x - 3) * scale, (y - 3) * scale, (x + 3) * scale, (y + 3) * scale), fill=color)
image.resize((180, 180), Image.Resampling.LANCZOS).save(root / 'assets/apple-touch-icon.png')
image.save(root / 'assets/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('Generated 16/32/48px favicon and 180px touch icon.')
