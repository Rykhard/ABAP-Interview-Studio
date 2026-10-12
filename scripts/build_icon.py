"""Generate matching vector, browser fallback and touch study-book icons."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
scale = 8
background = '#122b3e'
# Broad pages and a single bookmark remain recognizable at browser-tab size.
shapes = [
    ([(11, 16), (22, 16), (29, 20), (29, 49), (22, 45), (11, 45)], '#eef6f6'),
    ([(35, 20), (42, 16), (53, 16), (53, 45), (42, 45), (35, 49)], '#afd5cb'),
    ([(44, 16), (50, 16), (50, 30), (47, 27), (44, 30)], '#eda975'),
]
svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    f'  <rect width="64" height="64" rx="14" fill="{background}"/>',
]
image = Image.new('RGBA', (64 * scale, 64 * scale))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((0, 0, 64 * scale - 1, 64 * scale - 1), radius=14 * scale, fill=background)
for points, color in shapes:
    coordinates = ' '.join(f'{x},{y}' for x, y in points)
    svg.append(f'  <polygon points="{coordinates}" fill="{color}"/>')
    draw.polygon([(x * scale, y * scale) for x, y in points], fill=color)
svg.append('</svg>')
(root / 'assets/favicon.svg').write_text('\n'.join(svg) + '\n', encoding='utf-8')
image.resize((180, 180), Image.Resampling.LANCZOS).save(root / 'assets/apple-touch-icon.png')
image.save(root / 'assets/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('Generated study-book SVG, 16/32/48px favicon and 180px touch icon.')
