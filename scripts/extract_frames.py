"""Pre-extract 64 head-rotation frames (+ center) from the character video as WebP.
Run: python scripts/extract_frames.py <video.mp4>
Frame anchors were identified by inspecting the video timeline (24fps, 240 frames)."""
import sys, json, cv2, numpy as np
src = sys.argv[1]
cap = cv2.VideoCapture(src)
print("frames:", cap.get(cv2.CAP_PROP_FRAME_COUNT), "fps:", cap.get(cv2.CAP_PROP_FPS))
frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(f)
H, W = frames[0].shape[:2]

# compass anchors: angle (0=UP, clockwise, degrees, unwrapped) -> video frame
ANCHORS = [(315, 2), (360, 40), (405, 63), (450, 100), (495, 125),
           (540, 155), (585, 178), (630, 203), (675, 222)]
NAMES = {"UP-LEFT": 2, "UP": 40, "UP-RIGHT": 63, "RIGHT": 100, "DOWN-RIGHT": 125,
         "DOWN": 155, "DOWN-LEFT": 178, "LEFT": 203, "CENTER": len(frames) - 1}
CENTER = NAMES["CENTER"]

# background colour (median of border pixels of the neutral frame)
c = frames[CENTER]
border = np.concatenate([c[:8].reshape(-1, 3), c[-8:].reshape(-1, 3)])
b, g, r = np.median(border, axis=0).astype(int)
bg_hex = "#%02x%02x%02x" % (r, g, b)
print("background:", bg_hex)

# remove the small sparkle watermark (bottom right of the frame) by inpainting
def clean(img):
    m = np.zeros(img.shape[:2], np.uint8)
    y0, y1, x0, x1 = int(H * .76), int(H * .91), int(W * .86), int(W * .95)
    sub = img[y0:y1, x0:x1].astype(int)
    diff = np.abs(sub - np.array([b, g, r])).sum(axis=2)
    m[y0:y1, x0:x1] = (diff > 60).astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((9, 9), np.uint8))
    return cv2.inpaint(img, m, 5, cv2.INPAINT_TELEA)

# face centre from the neutral frame (normalised 0..1) for the cursor deadzone/angle origin
cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = cas.detectMultiScale(cv2.cvtColor(c, cv2.COLOR_BGR2GRAY), 1.1, 5, minSize=(120, 120))
if len(faces):
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face = ((x + w / 2) / W, (y + h / 2) / H)
else:
    face = (0.5, 0.35)
print("face centre:", face)

angs = np.array([a for a, _ in ANCHORS], float)
frs = np.array([f for _, f in ANCHORS], float)
picked = []
for i in range(64):
    ang = 315 + i * 360 / 64          # frame 0 = UP-LEFT ... wraps around
    ang = ang if ang <= 675 else ang - 360
    picked.append(int(round(np.interp(ang, angs, frs))))
# index i corresponds to angle (315 + i*5.625) mod 360, so re-order so index 0 = UP (0 deg)
order = [(i, (315 + i * 5.625) % 360) for i in range(64)]
byang = sorted(order, key=lambda t: t[1])
out_frames = [picked[i] for i, _ in byang]
for k, fi in enumerate(out_frames):
    cv2.imwrite(f"public/frames/{k:02d}.webp", clean(frames[fi]), [cv2.IMWRITE_WEBP_QUALITY, 88])
cv2.imwrite("public/frames/center.webp", clean(frames[CENTER]), [cv2.IMWRITE_WEBP_QUALITY, 90])
json.dump({"bg": bg_hex, "face": face, "width": W, "height": H, "count": 64,
           "directions": NAMES, "frameMap": out_frames},
          open("public/frames/meta.json", "w"), indent=1)
print("compass frames:", NAMES)
print("64-frame map (index 0 = UP, clockwise):", out_frames)
