// App Store canvas sizes (verified 2026-10-31 against Apple's screenshot specifications).
export const PLATFORMS = {
  mac: { W: 2880, H: 1800, label: 'Mac', accepted: [[2880, 1800], [2560, 1600], [1440, 900], [1280, 800]] },
  iphone: { W: 1320, H: 2868, label: 'iPhone 6.9"', accepted: [[1320, 2868], [1290, 2796], [1260, 2736]] },
  ipad: { W: 2064, H: 2752, label: 'iPad 13"', accepted: [[2064, 2752], [2048, 2732]] },
};

export const MAX_SLOTS = 10;
