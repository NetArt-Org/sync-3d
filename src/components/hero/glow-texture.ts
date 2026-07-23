import * as THREE from "three";

let cached: THREE.CanvasTexture | null = null;

/**
 * Soft radial halo used behind the orbit nodes. Drawn once and shared by every
 * node — on a white page a normal-blended blue falloff reads far cleaner than
 * additive blending, which would wash out to white.
 */
export function getGlowTexture(): THREE.CanvasTexture {
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (context) {
    const half = size / 2;
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(27, 68, 224, 0.55)");
    gradient.addColorStop(0.35, "rgba(27, 68, 224, 0.18)");
    gradient.addColorStop(1, "rgba(27, 68, 224, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  cached = new THREE.CanvasTexture(canvas);
  cached.colorSpace = THREE.SRGBColorSpace;
  return cached;
}
