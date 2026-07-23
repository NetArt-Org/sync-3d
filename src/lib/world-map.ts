/**
 * Coarse vector world map used to decide which points of a sphere are land.
 *
 * Each entry is a simplified coastline as `[longitude, latitude]` pairs in
 * degrees. Accuracy is deliberately low — the dots are ~1.5° apart, so any
 * finer detail is invisible. Keeping the map as data (rather than sampling an
 * equirectangular texture) means the globe has no network or asset dependency
 * and can be built synchronously on first render.
 */

type Ring = readonly (readonly [number, number])[];

const AFRICA: Ring = [
  [-17, 14], [-16, 20], [-12, 28], [-9, 32], [-5, 36], [3, 37], [10, 37],
  [11, 33], [20, 32], [25, 32], [32, 31], [35, 28], [37, 22], [38, 17],
  [43, 12], [51, 12], [51, 4], [42, -1], [40, -10], [40, -16], [35, -22],
  [32, -26], [30, -31], [25, -34], [18, -35], [15, -27], [12, -17], [9, -1],
  [9, 4], [3, 6], [-8, 4], [-13, 8],
];

const EUROPE: Ring = [
  [-9, 43], [-9, 38], [-6, 36], [0, 39], [3, 42], [8, 44], [12, 45], [16, 42],
  [19, 40], [23, 37], [27, 40], [29, 41], [35, 42], [40, 44], [48, 46],
  [52, 48], [60, 52], [60, 60], [55, 66], [42, 66], [40, 70], [30, 70],
  [25, 71], [20, 70], [15, 68], [12, 65], [10, 60], [8, 58], [10, 55],
  [8, 54], [4, 52], [0, 49], [-2, 48], [-5, 48], [-2, 44],
];

const ASIA: Ring = [
  [26, 40], [30, 41], [36, 41], [40, 43], [48, 46], [52, 48], [60, 52],
  [60, 60], [60, 70], [70, 73], [80, 74], [95, 78], [110, 76], [130, 72],
  [142, 73], [160, 70], [180, 70], [180, 66], [170, 66], [160, 61], [150, 59],
  [143, 53], [140, 50], [135, 45], [130, 43], [126, 40], [122, 38], [122, 30],
  [117, 23], [110, 21], [107, 18], [108, 11], [105, 10], [103, 1], [98, 8],
  [95, 16], [92, 21], [88, 21], [85, 20], [80, 16], [80, 10], [77, 8],
  [73, 16], [70, 21], [68, 24], [62, 25], [57, 25], [59, 22], [56, 17],
  [52, 13], [45, 13], [43, 12], [40, 16], [36, 22], [35, 28], [34, 31],
  [36, 36], [30, 36],
];

const NORTH_AMERICA: Ring = [
  [-168, 66], [-160, 70], [-150, 70], [-140, 70], [-130, 70], [-120, 72],
  [-110, 68], [-95, 68], [-85, 70], [-75, 68], [-65, 60], [-60, 55],
  [-55, 50], [-60, 45], [-70, 42], [-74, 39], [-76, 35], [-81, 31], [-80, 25],
  [-83, 29], [-89, 29], [-94, 29], [-97, 25], [-92, 19], [-87, 21], [-88, 16],
  [-83, 15], [-79, 9], [-83, 11], [-87, 13], [-92, 15], [-97, 16], [-105, 20],
  [-110, 24], [-114, 28], [-117, 32], [-122, 37], [-124, 41], [-124, 48],
  [-130, 54], [-140, 60], [-150, 59], [-160, 55], [-165, 60],
];

const SOUTH_AMERICA: Ring = [
  [-81, -4], [-79, -8], [-76, -14], [-71, -18], [-70, -23], [-71, -30],
  [-73, -37], [-73, -44], [-75, -50], [-70, -55], [-65, -55], [-64, -51],
  [-62, -40], [-57, -35], [-53, -33], [-48, -25], [-40, -22], [-39, -15],
  [-35, -8], [-45, -1], [-50, 0], [-52, 5], [-60, 8], [-67, 11], [-72, 12],
  [-75, 9], [-78, 8], [-80, 0],
];

const AUSTRALIA: Ring = [
  [113, -22], [114, -26], [115, -33], [118, -35], [123, -34], [129, -32],
  [134, -33], [137, -35], [140, -38], [145, -38], [147, -43], [150, -37],
  [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [130, -11],
  [126, -14], [122, -17],
];

const GREENLAND: Ring = [
  [-45, 60], [-50, 64], [-55, 68], [-58, 72], [-60, 76], [-55, 80], [-40, 83],
  [-25, 82], [-20, 76], [-25, 70], [-35, 66],
];

const ISLANDS: readonly Ring[] = [
  // Madagascar
  [[43, -12], [50, -15], [50, -25], [45, -25], [43, -20]],
  // Great Britain
  [[-5, 50], [-3, 54], [-3, 58], [-5, 58], [-6, 55], [-6, 51]],
  // Ireland
  [[-10, 52], [-6, 52], [-6, 55], [-10, 55]],
  // Iceland
  [[-24, 65], [-14, 66], [-14, 64], [-22, 63]],
  // Japan
  [[130, 32], [136, 34], [141, 38], [142, 42], [145, 44], [141, 45], [138, 37], [133, 34]],
  // New Zealand
  [[172, -34], [178, -38], [177, -41], [172, -43], [166, -46], [168, -47], [173, -42]],
  // Sumatra
  [[95, 5], [100, 0], [106, -6], [104, -6], [98, 2]],
  // Java
  [[105, -6], [114, -8], [114, -9], [105, -7]],
  // Borneo
  [[109, 2], [117, 4], [119, -1], [116, -4], [110, -3]],
  // New Guinea
  [[131, -1], [141, -3], [150, -6], [147, -9], [140, -9], [134, -5]],
  // Philippines
  [[120, 18], [124, 12], [126, 7], [122, 6], [120, 13]],
  // Sri Lanka
  [[80, 9], [82, 7], [81, 6], [80, 8]],
];

const LANDMASSES: readonly Ring[] = [
  AFRICA,
  EUROPE,
  ASIA,
  NORTH_AMERICA,
  SOUTH_AMERICA,
  AUSTRALIA,
  GREENLAND,
  ...ISLANDS,
];

/** Standard even-odd ray casting test. */
function pointInRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** True when the given coordinate falls on one of the simplified landmasses. */
export function isLand(lon: number, lat: number): boolean {
  for (const ring of LANDMASSES) {
    if (pointInRing(lon, lat, ring)) return true;
  }
  return false;
}

/**
 * Lays out evenly spaced dots over the land areas of a sphere of `radius`.
 *
 * Points are walked as latitude bands — the same construction the reference
 * design uses — with the per-band count scaled by `cos(lat)` so horizontal and
 * vertical spacing stay equal. Returns a flat `[x, y, z, ...]` array ready to
 * be handed to a `BufferAttribute`.
 */
export function buildLandDots(radius: number, stepDeg: number): Float32Array {
  const positions: number[] = [];
  const bands = Math.round(180 / stepDeg);

  for (let b = 0; b <= bands; b++) {
    const lat = -90 + (b / bands) * 180;
    const phi = ((90 - lat) * Math.PI) / 180;
    const ringRadius = Math.sin(phi);
    const count = Math.max(1, Math.round((360 / stepDeg) * ringRadius));

    for (let i = 0; i < count; i++) {
      const lon = -180 + (i / count) * 360;
      if (!isLand(lon, lat)) continue;

      const theta = ((lon + 180) * Math.PI) / 180;
      positions.push(
        -radius * ringRadius * Math.cos(theta),
        radius * Math.cos(phi),
        radius * ringRadius * Math.sin(theta),
      );
    }
  }

  return new Float32Array(positions);
}
