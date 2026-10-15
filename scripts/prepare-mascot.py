"""Repack the supplied transparent portraits into cells before skill alignment.

The cutout sheets have uneven row spacing. Connected portraits, including their
floating symbols, are placed in roomy cells without changing the artwork.
Requires Pillow, NumPy, and SciPy (the page-mascot skill requirements).
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "characters" / "welquim"
TILE = 500

for name in ("directions", "reactions"):
    original = SOURCE / f"{name}-transparent.png"
    pixels = np.array(Image.open(original).convert("RGBA"))
    labels, count = ndimage.label(pixels[:, :, 3] > 40)
    boxes = ndimage.find_objects(labels)
    sizes = ndimage.sum(pixels[:, :, 3] > 40, labels, range(1, count + 1))
    bodies = sorted(range(count), key=lambda i: sizes[i], reverse=True)[:9]
    centers = [(np.mean([boxes[i][1].start, boxes[i][1].stop]),
                np.mean([boxes[i][0].start, boxes[i][0].stop])) for i in bodies]
    groups = {i: [i + 1] for i in bodies}
    for index in range(count):
        if index in bodies or sizes[index] < 40:
            continue
        box = boxes[index]
        center = (np.mean([box[1].start, box[1].stop]),
                  np.mean([box[0].start, box[0].stop]))
        nearest = min(range(9), key=lambda j: (center[0] - centers[j][0]) ** 2 +
                      (center[1] - centers[j][1]) ** 2)
        groups[bodies[nearest]].append(index + 1)
    atlas = Image.new("RGBA", (TILE * 3, TILE * 3))
    for i, center in zip(bodies, centers):
        mask = ndimage.binary_dilation(np.isin(labels, groups[i]), iterations=2)
        cutout = pixels.copy()
        cutout[~mask, 3] = 0
        ys, xs = np.where(cutout[:, :, 3] > 0)
        left, top, right, bottom = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        portrait = Image.fromarray(cutout).crop((left, top, right, bottom))
        col = min(2, int(center[0] / (pixels.shape[1] / 3)))
        row = min(2, int(center[1] / (pixels.shape[0] / 3)))
        x = round(TILE / 2 - (center[0] - left))
        y = TILE - 35 - portrait.height
        atlas.alpha_composite(portrait, (col * TILE + x, row * TILE + y))
    atlas.save(SOURCE / f"{name}.png")
    print(f"Repacked {name}: {atlas.size}")
