#!/usr/bin/env python3
"""Generate the transparent particle-fallbacks as animated WebP images.

Renders a soft-glowing particle field on a fully transparent canvas so it works
over any theme background. Motion is a periodic function of real time t, so the
loop is seamless and every fps version follows the identical path (only the
temporal sampling differs -> clean A/B).

Usage:
    python scripts/generate-fallback-webp.py            # both 30 and 60 fps
    python scripts/generate-fallback-webp.py --fps 30   # one version

Outputs:
    video/video-fallback-30fps.webp
    video/video-fallback-60fps.webp
"""
import argparse
import math
import os
import random
import sys
import time

from PIL import Image, ImageDraw

W, H = 1080, 1200          # portrait to cover the tall hero box; object-fit handles the rest
LOOP_SECONDS = 8            # nominal; actual period is derived from the frame timing
QUALITY = 80                # lossy webp quality
SEED = 7892
DEFAULT_METHOD = 4          # webp compression effort (0..6)

ACCENT = (194, 65, 12)      # #C2410C
PALETTE = [
    ACCENT,                 # burnt orange - strong on both themes
    (234, 120, 60),         # lighter orange
    (240, 160, 110),        # soft peach
    (150, 148, 138),        # light warm gray
    (105, 107, 100),        # mid gray
    (70, 72, 68),           # dark warm gray
]

SPRITE_CACHE = {}


def make_glow(size, color, alpha):
    """Soft radial-glow sprite (square RGBA): color at centre -> transparent edge."""
    key = (size, color, alpha)
    hit = SPRITE_CACHE.get(key)
    if hit is not None:
        return hit
    if size < 1:
        size = 1
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = (size - 1) / 2.0
    max_r = size / 2.0
    steps = max(8, int(size / 4))
    for i in range(steps, 0, -1):
        r = max_r * i / steps
        if r < 1.0:
            continue
        a = int(alpha * ((i / steps) ** 3.0))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(color[0], color[1], color[2], a))
    SPRITE_CACHE[key] = img
    return img


def build_particles(rng):
    """Three parallax depth layers orbiting around base points (seamless loop).

    Deliberately sparse: with dense glow coverage every frame differs everywhere
    and WebP's animation encoder gets no temporal savings (alpha is never
    temporally predicted), so file size would explode. Sparse + tight falloff
    keeps it light while still reading as a floating particle field.
    """
    layers = [
        # far: small, dim, slow, short orbits
        dict(count=40, radius=(2, 6), alpha=(60, 140), speed_k=(1, 2), amp=(5, 14),
             colors=[PALETTE[3], PALETTE[4], PALETTE[5], PALETTE[1]]),
        # mid
        dict(count=24, radius=(6, 12), alpha=(120, 200), speed_k=(1, 3), amp=(10, 26),
             colors=[ACCENT, PALETTE[1], PALETTE[2], PALETTE[3], PALETTE[4]]),
        # near: big, bright, faster, wider orbits
        dict(count=12, radius=(12, 22), alpha=(160, 240), speed_k=(2, 4), amp=(16, 38),
             colors=[ACCENT, PALETTE[1], PALETTE[2]]),
    ]
    particles = []
    for li, layer in enumerate(layers):
        k1 = layer['speed_k'][0]
        k2 = layer['speed_k'][1]
        for _ in range(layer['count']):
            r = rng.uniform(layer['radius'][0], layer['radius'][1])
            base_x = rng.uniform(40, W - 40)
            base_y = rng.uniform(40, H - 40)
            amp_x = rng.uniform(layer['amp'][0], layer['amp'][1])
            amp_y = rng.uniform(layer['amp'][0], layer['amp'][1])
            # integer cycle counts per loop period -> motion returns to start -> seamless loop
            wk1 = rng.randint(k1, k2)
            wk2 = rng.randint(k1, k2)
            tw = rng.randint(2, 5)
            p1 = rng.uniform(0, math.tau)
            p2 = rng.uniform(0, math.tau)
            p_tw = rng.uniform(0, math.tau)
            alpha = rng.uniform(layer['alpha'][0], layer['alpha'][1])
            color = layer['colors'][rng.randrange(len(layer['colors']))]
            particles.append(dict(
                base_x=base_x, base_y=base_y,
                amp_x=amp_x, amp_y=amp_y,
                wk1=wk1, wk2=wk2, p1=p1, p2=p2,
                tw=tw, p_tw=p_tw,
                r=r, alpha=alpha, color=color,
            ))
    return particles


def build_blobs(rng):
    """A couple of huge, very soft glows that drift slowly -> atmosphere."""
    blobs = []
    for _ in range(2):
        r = rng.uniform(200, 320)
        blobs.append(dict(
            base_x=rng.uniform(0, W), base_y=rng.uniform(0, H),
            amp_x=rng.uniform(24, 54), amp_y=rng.uniform(24, 54),
            wk1=rng.choice([1, 2]), wk2=rng.choice([1, 2]),
            p1=rng.uniform(0, math.tau), p2=rng.uniform(0, math.tau),
            r=r, alpha=rng.uniform(13, 22),
            color=rng.choice([ACCENT, PALETTE[1], PALETTE[3]]),
        ))
    return blobs


def render_frame(t, period, particles, blobs, draw_blobs=True):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    w = math.tau / period

    if draw_blobs:
        for b in blobs:
            x = b['base_x'] + b['amp_x'] * math.sin(w * b['wk1'] * t + b['p1'])
            y = b['base_y'] + b['amp_y'] * math.sin(w * b['wk2'] * t + b['p2'])
            size = int(round(b['r'] * 2.2))
            sprite = make_glow(size, b['color'], int(round(b['alpha'])))
            img.paste(sprite, (int(x - size / 2), int(y - size / 2)), sprite)

    for p in particles:
        x = p['base_x'] + p['amp_x'] * math.sin(w * p['wk1'] * t + p['p1'])
        y = p['base_y'] + p['amp_y'] * math.sin(w * p['wk2'] * t + p['p2'])
        tw = 0.72 + 0.28 * math.sin(w * p['tw'] * t + p['p_tw'])
        alpha = int(round(p['alpha'] * tw))
        alpha = max(20, min(255, alpha))
        r = p['r']
        size = int(round(r * 1.9))
        sprite = make_glow(size, p['color'], alpha)
        img.paste(sprite, (int(x - size / 2), int(y - size / 2)), sprite)

    return img


def generate(fps, out_path, particles, blobs, draw_blobs, scale, quality, alpha_quality):
    dur_ms = int(round(1000.0 / fps))
    frames_n = int(round(LOOP_SECONDS * fps))
    period = frames_n * dur_ms / 1000.0

    print('rendering %d fps -> %d frames, %dms each, loop period %.2fs' % (fps, frames_n, dur_ms, period))
    t0 = time.time()
    frames = [render_frame(i * dur_ms / 1000.0, period, particles, blobs, draw_blobs)
              for i in range(frames_n)]
    print('  frames rendered in %.1fs' % (time.time() - t0))

    if scale != 1.0:
        out_size = (int(round(W * scale)), int(round(H * scale)))
        frames = [f.resize(out_size, Image.LANCZOS) for f in frames]
        print('  resized frames to %dx%d' % out_size)

    t0 = time.time()
    save_kwargs = dict(
        save_all=True,
        append_images=frames[1:],
        duration=dur_ms,
        loop=0,
        quality=quality,
        method=DEFAULT_METHOD,
    )
    if alpha_quality is not None:
        save_kwargs['alpha_quality'] = alpha_quality
    frames[0].save(out_path, 'WEBP', **save_kwargs)
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print('  wrote %s (%.2f MB) in %.1fs' % (out_path, size_mb, time.time() - t0))
    return size_mb


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fps', type=int, choices=[30, 60], default=None)
    ap.add_argument('--no-blobs', action='store_true', help='skip the big background glow blobs')
    ap.add_argument('--scale', type=float, default=1.0, help='downscale factor for output frames')
    ap.add_argument('--quality', type=int, default=QUALITY)
    ap.add_argument('--alpha-quality', type=int, default=None, help='lossy alpha compression (default: follow quality)')
    args = ap.parse_args()

    rng = random.Random(SEED)
    particles = build_particles(rng)
    blobs = build_blobs(rng)

    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(here, '..', 'video')

    jobs = [args.fps] if args.fps else [30, 60]
    for fps in jobs:
        out_path = os.path.abspath(os.path.join(out_dir, 'video-fallback-%dfps.webp' % fps))
        generate(fps, out_path, particles, blobs, not args.no_blobs, args.scale, args.quality, args.alpha_quality)


if __name__ == '__main__':
    sys.exit(main())
