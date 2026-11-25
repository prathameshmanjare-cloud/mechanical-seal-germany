# Flat-field: divide each image by an estimate of its studio background so the background becomes pure white.
import sys, numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32)
h, w, _ = a.shape
B = 24  # border band
def prof(band, axis):
    # robust background profile: brightest-ish value across the band (ignores shadows/objects), then smoothed
    p = np.percentile(band, 80, axis=axis)  # (n,3)
    k = 61; pad = np.pad(p, ((k//2, k//2), (0, 0)), mode='edge')
    ker = np.ones(k) / k
    return np.stack([np.convolve(pad[:, c], ker, mode='valid') for c in range(3)], 1)
top = prof(a[:B], 0); bot = prof(a[-B:], 0)
left = prof(a[:, :B], 1); right = prof(a[:, -B:], 1)
u = np.linspace(0, 1, w)[None, :, None]; v = np.linspace(0, 1, h)[:, None, None]
T = top[None]; Bo = bot[None]; L = left[:, None]; R = right[:, None]
c00, c10, c01, c11 = a[:B, :B].reshape(-1,3).mean(0), a[:B, -B:].reshape(-1,3).mean(0), a[-B:, :B].reshape(-1,3).mean(0), a[-B:, -B:].reshape(-1,3).mean(0)
bg = (1-v)*T + v*Bo + (1-u)*L + u*R - ((1-u)*(1-v)*c00 + u*(1-v)*c10 + (1-u)*v*c01 + u*v*c11)  # Coons patch
out = np.clip(a / np.maximum(bg, 1) * 255, 0, 255)
# soft knee: push near-white residue to pure white
lum = out.mean(2, keepdims=True)
knee = np.clip((lum - 228) / (250 - 228), 0, 1)
out = out * (1 - knee) + 255 * knee
Image.fromarray(out.astype(np.uint8)).save(dst, 'WEBP', quality=88, method=6)
