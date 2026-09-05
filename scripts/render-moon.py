"""Render a decorative lunar sphere from NASA's equirectangular map.
Optional asset tool: Python 3 + Pillow. Not needed to build or serve the site.
NASA/GSFC/LRO source and credit are recorded in EVIDENCE.md.
"""
import math
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
texture = Image.open(root / 'assets/images/moon-texture.jpg').convert('RGB')
tw, th = texture.size
source = texture.load()
size = 1100
image = Image.new('RGBA', (size, size), (11, 11, 16, 0))
pixels = image.load()
radius = size * .455
# Upper-left sidelight makes a restrained crescent, not a glowing gradient sphere.
light = (-.72, -.52, -.35)
length = math.sqrt(sum(x*x for x in light))
light = tuple(x / length for x in light)
for y in range(size):
    ny = (y - size / 2) / radius
    for x in range(size):
        nx = (x - size / 2) / radius
        rr = nx * nx + ny * ny
        if rr >= 1:
            continue
        nz = math.sqrt(1 - rr)
        longitude = math.atan2(nx, nz)
        latitude = math.asin(ny)
        u = int(((longitude / (2 * math.pi)) + .52) * tw) % tw
        v = min(th - 1, max(0, int((latitude / math.pi + .5) * th)))
        rgb = source[u, v]
        diffuse = max(0, nx * light[0] + ny * light[1] + nz * light[2])
        intensity = .027 + diffuse ** .72 * 1.55
        color = tuple(min(248, int(channel * intensity)) for channel in rgb)
        alpha = min(255, int((1 - math.sqrt(rr)) * radius * 255))
        pixels[x, y] = (*color, alpha)
image.save(root / 'assets/images/moon.webp', quality=88, method=6)
print('Rendered assets/images/moon.webp')
