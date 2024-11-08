import { Camera } from "./camera.ts";

const canvas = document.createElement("canvas");
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
canvas.style.webkitUserSelect = "none";
canvas.style.userSelect = "none";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

{
  const h = canvas.height / 2;
  const w = canvas.width / 2;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w * 2, h * 2);
  const str = "画面をタップして開始します";
  ctx.font = "30px sans-serif";
  ctx.fillStyle = "#fff";
  const {
    actualBoundingBoxAscent: top,
    actualBoundingBoxDescent: bottom,
    actualBoundingBoxLeft: left,
    actualBoundingBoxRight: right,
  } = ctx.measureText(str);
  ctx.fillText(str, w - (right - left) / 2, h - (bottom - top) / 2);
}

const bv2rgb = (bv: number): [number, number, number] => {
  const T = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
  let x: number;
  let y: number;
  const t = 1000 / T;
  if (T <= 4000) {
    x = ((-0.2661239 * t - 0.2343589) * t + 0.8776956) * t + 0.179910;
  } else {
    x = ((-3.0258469 * t + 2.1070379) * t + 0.2226347) * t + 0.240390;
  }
  if (T <= 2222) {
    y = ((-1.1063814 * x - 1.34811020) * x + 2.18555832) * x -
      0.20219683;
  } else if (T <= 4000) {
    y = ((-0.9549476 * x - 1.37418593) * x + 2.09137015) * x -
      0.16748867;
  } else {
    y = ((3.0817580 * x - 5.87338670) * x + 3.75112997) * x -
      0.37001483;
  }
  const X = x / y;
  const Z = (1 - x) / y - 1;
  const r = 3.2406 * X - 0.4986 * Z - 1.5372;
  const g = -0.9689 * X + 0.0415 * Z + 1.8758;
  const b = 0.0557 * X + 1.0570 * Z - 0.2040;
  const m = Math.max(r, g, b);
  return [
    Math.round(Math.max(r / m * 255, 0)),
    Math.round(Math.max(g / m * 255, 0)),
    Math.round(Math.max(b / m * 255, 0)),
  ];
};

const dat = await (async () => {
  const d = await fetch("./data.json")
    .then((r) => r.json()) as [number, number, number, number, number][];

  return d.map<[number, number, number, number, string]>((x) => [
    10 ** (Number(x[0]) / -500) * Math.hypot(x[1], x[2], x[3]) / 8,
    x[1],
    x[2],
    x[3],
    "rgb(" + bv2rgb((x[4] - 400) / 1000).join(","),
  ]);
})();

let kdat: [number, number, number, number, string][] = [];

const filt = (
  dister: (x: number, y: number, z: number) => number,
) => {
  const h = canvas.height;
  const scale = h * 2;
  kdat = [];

  for (let i = 0; i < dat.length; i++) {
    const z = dister(dat[i][1], dat[i][2], dat[i][3]);
    if (z > 0 && dat[i][0] / z * scale >= 0.1) kdat.push(dat[i]);
  }
};

const line: [[number, number, number], [number, number, number]][] =
  await fetch("./line.json")
    .then((r) => r.json()).then((v: [number, number][]) =>
      v.map(([a, b]) => [
        [dat[a][1], dat[a][2], dat[a][3]],
        [dat[b][1], dat[b][2], dat[b][3]],
      ])
    );

let minll = 2000;

const draw = (
  rot: (x: number, y: number, z: number) => [number, number, number],
) => {
  const h = canvas.height / 2;
  const scale = h * 2;
  const w = canvas.width / 2;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w * 2, h * 2);

  ctx.strokeStyle = "rgba(200,200,200)";
  ctx.beginPath();
  for (let i = 0; i < line.length; i++) {
    let a: number;
    let b: number;
    let c: number;
    let d: number;
    let e: number;
    let f: number;
    {
      const p = line[i][0];
      const q = rot(p[0], p[1], p[2]);
      a = q[0];
      b = q[1];
      c = q[2];
    }
    {
      const p = line[i][1];
      const q = rot(p[0], p[1], p[2]);
      d = q[0];
      e = q[1];
      f = q[2];
    }
    if (c > 1) {
      ctx.moveTo(
        (a / c) * scale + w,
        (b / c) * scale + h,
      );
      if (f > 1) {
        ctx.lineTo(
          (d / f) * scale + w,
          (e / f) * scale + h,
        );
      } else {
        ctx.lineTo(
          ((d - a) * (c - 1) / (c - f) + a) * scale + w,
          ((e - b) * (c - 1) / (c - f) + b) * scale + h,
        );
      }
    } else {
      if (f > 1) {
        ctx.moveTo(
          (d / f) * scale + w,
          (e / f) * scale + h,
        );
        ctx.lineTo(
          ((a - d) * (f - 1) / (f - c) + d) * scale + w,
          ((b - e) * (f - 1) / (f - c) + e) * scale + h,
        );
      }
    }
  }
  ctx.stroke();

  minll = 2000;
  for (let i = 0; i < kdat.length; i++) {
    const t = rot(kdat[i][1], kdat[i][2], kdat[i][3]);
    const x = t[0];
    const y = t[1];
    const z = t[2];
    const c = kdat[i][4];
    if (z <= 0) continue;
    const s = kdat[i][0] / z * scale;
    {
      const d = (x ** 2 + y ** 2) / z + z;
      if (d < minll) minll = d;
    }
    if (s >= 600) {
      ctx.fillStyle = c + ")";
      ctx.beginPath();
      ctx.arc(
        (x / z) * scale + w,
        (y / z) * scale + h,
        s / 20,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();
    } else if (s >= 6) {
      ctx.fillStyle = c + ")";
      ctx.beginPath();
      ctx.arc(
        (x / z) * scale + w,
        (y / z) * scale + h,
        (s * 1.5) ** 0.5,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();
    } else if (s >= 1) {
      ctx.fillStyle = c + ")";
      ctx.fillRect(
        (x / z) * scale + w - s / 2,
        (y / z) * scale + h - s / 2,
        s,
        s,
      );
    } else if (s >= 0.1) {
      ctx.fillStyle = c + "," + String(s ** 2) + ")";
      ctx.fillRect(
        (x / z) * scale + w - 0.5,
        (y / z) * scale + h - 0.5,
        1,
        1,
      );
    }
  }
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(w - 20, h);
  ctx.lineTo(w + 20, h);
  ctx.moveTo(w, h - 20);
  ctx.lineTo(w, h + 20);
  ctx.stroke();
};

const ido = 36 / 180 * Math.PI;
const keido = 140 / 180 * Math.PI;

const onclick = () => {
  canvas.removeEventListener("click", onclick);
  let s = 0;
  // @ts-ignore: Safari用
  DeviceOrientationEvent?.requestPermission?.();
  let dirs: number | null = null;
  const cam = new Camera();

  window.addEventListener("deviceorientation", (e) => {
    // @ts-ignore: webkitCompassHeadingを使いたい
    const w: number | undefined = e.webkitCompassHeading;
    const alpha = (e.alpha ?? 0) / 180 * Math.PI;
    const beta = (e.beta ?? 0) / -180 * Math.PI;
    const gamma = (e.gamma ?? 0) / 180 * Math.PI;
    if (dirs == null && w != null) dirs = (w / 180 * Math.PI) - alpha;
    cam.dirReset();
    const timedir = (Date.now() - 946728000000) / 86164090.5 * 2 * Math.PI;
    cam.rotY(timedir / 2);
    cam.rotY(139.69175 / 180 * Math.PI);
    cam.rotY(keido);
    cam.rotX(ido);
    cam.rotZ(alpha + (dirs ?? 0));
    cam.rotX(beta);
    cam.rotY(gamma);
  });
  let count = 0;
  const keys: [boolean, boolean, boolean, boolean, boolean] = [
    false,
    false,
    false,
    false,
    false,
  ];
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        keys[0] = true;
        break;
      case "ArrowDown":
        keys[1] = true;
        break;
      case "ArrowLeft":
        keys[2] = true;
        break;
      case "ArrowRight":
        keys[3] = true;
        break;
      case " ":
        keys[4] = true;
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "ArrowUp":
        keys[0] = false;
        break;
      case "ArrowDown":
        keys[1] = false;
        break;
      case "ArrowLeft":
        keys[2] = false;
        break;
      case "ArrowRight":
        keys[3] = false;
        break;
      case " ":
        keys[4] = false;
        break;
    }
  });
  draw(cam.rotter());
  window.addEventListener("touchstart", (e) => count = e.touches.length);
  window.addEventListener("touchend", (e) => count = e.touches.length);
  setInterval(() => {
    if (keys[0]) cam.rotX(-0.01);
    if (keys[1]) cam.rotX(0.01);
    if (keys[2]) cam.rotY(0.01);
    if (keys[3]) cam.rotY(-0.01);
    if (count > 0 || keys[4]) cam.walk(minll / 5);
    if (s++ % 100 === 0) {
      const d = cam.dister();
      filt(d);
      kdat.sort((a, b) => d(b[1], b[2], b[3]) - d(a[1], a[2], a[3]));
    }
    draw(cam.rotter());
  }, 20);
};

canvas.addEventListener("click", onclick);
