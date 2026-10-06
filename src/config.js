// Values produced by scripts/extract_frames.py (see public/frames/meta.json)
export const BG = "#e80b08";
export const FRAME_COUNT = 64;
export const FRAME_W = 1280;
export const FRAME_H = 720;
export const FACE = { x: 0.4805, y: 0.3986 }; // face centre inside the frame (0..1)
export const SMOOTHING = 0.26;   // per-frame (60fps) angular response
export const DEADZONE_IN = 0.12; // fraction of viewport width: look straight at the user
export const DEADZONE_OUT = 0.14;
