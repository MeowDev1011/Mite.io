#!/usr/bin/env python3
import os
import struct
import zlib
import math

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    # Compress IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr)))
    png.extend(b'IHDR')
    png.extend(ihdr)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr)))
    
    # IDAT chunk
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed)))
    
    # IEND chunk
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND')))
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Created {filename}")

def draw_cell_icon(x, y, w, h):
    cx, cy = w / 2, h / 2
    dx = x - cx
    dy = y - cy
    dist = math.hypot(dx, dy)
    r_outer = w * 0.42
    r_core = w * 0.22
    
    # Background: Deep bio crimson/dark
    bg_r, bg_g, bg_b, bg_a = 11, 2, 6, 255
    
    if dist < r_outer:
        # Cell body gradient
        norm = dist / r_outer
        # Bioluminescent emerald-cyan microbe with membrane
        if dist > r_outer - (w * 0.05):
            # Glowing membrane edge
            return (16, 185, 129, 255) # emerald-500
        elif dist < r_core:
            # Nucleus / Core
            core_norm = dist / r_core
            r = int(244 * (1 - core_norm) + 16 * core_norm)
            g = int(63 * (1 - core_norm) + 185 * core_norm)
            b = int(94 * (1 - core_norm) + 129 * core_norm)
            return (r, g, b, 255)
        else:
            # Cytoplasm
            alpha = int(255 * (1 - norm * 0.3))
            return (5, 150, 105, alpha) # emerald-600
    elif dist < r_outer + (w * 0.08):
        # Outer bioluminescent halo
        halo_norm = (dist - r_outer) / (w * 0.08)
        alpha = int(180 * (1 - halo_norm))
        return (52, 211, 153, alpha)
    else:
        return (bg_r, bg_g, bg_b, 255)

os.makedirs('/public', exist_ok=True)
create_png(192, 192, draw_cell_icon, '/public/pwa-192x192.png')
create_png(512, 512, draw_cell_icon, '/public/pwa-512x512.png')
create_png(512, 512, draw_cell_icon, '/public/pwa-maskable-512x512.png')
create_png(180, 180, draw_cell_icon, '/public/apple-touch-icon.png')
print("All PWA icons generated successfully!")
