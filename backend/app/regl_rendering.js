// TODO can it be modifiable
import {marketData, viewData} from "./data.js";
// import createREGL from 'https://cdn.skypack.dev/regl';
const W = 1200;   // time columns
const H = 100;   // price levels

// CPU-side data buffer
const data = new Float32Array(W * H);
let regl = null;
let draw = null;
let texture = null;

let frames = 0;
let lastTime = performance.now()

// for average fillData time
let samples = 0;
let sampleSum = 0;

export function initRegl(canvas) {
    console.log("canvas: " + canvas)
    regl = window.createREGL({
        canvas: canvas,
        extensions: ['OES_texture_float']
    });
    texture = regl.texture({
        width: W,
        height: H,
        data: data,
        format: 'luminance',
        type: 'float'
    });
    draw = regl({ // TODO maybe export
        frag: `
precision mediump float;
uniform sampler2D tex;
varying vec2 uv;

void main () {
  float v = texture2D(tex, uv).r;

  // Convert from [0,1] → [-1,1]
  v = v * 2.0 - 1.0;

  float intensity = 0.0;
  vec3 color = vec3(0.0);

  if (v > 0.0) {
    // ASK (red)
    intensity = 0.15 + 0.85 * v;
    color = vec3(1.0, 0.0, 0.0);
  } else if (v < 0.0) {
    // BID (blue)
    intensity = 0.15 + 0.85 * (-v);
    color = vec3(0.0, 0.3, 1.0);
  } else {
    // zero → transparent
    gl_FragColor = vec4(0.0);
    return;
  }

  // Modulate color by intensity to achieve shading based on volume
  gl_FragColor = vec4(color * intensity, 1.0);
}
  `,
        vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;

    void main () {
      uv = 0.5 * (position + 1.0);
      gl_Position = vec4(position, 0, 1);
    }
  `,
        attributes: {
            position: [
                [-1, -1],
                [ 1, -1],
                [-1,  1],
                [ 1,  1]
            ]
        },
        uniforms: {
            tex: texture
        },
        count: 4,
        primitive: 'triangle strip'
    });

}

function measureFPS() {
    frames++;
    let now = performance.now()

    if (now - lastTime >= 1000) {
        console.log(`FPS: ${frames}`);
        console.log(`FillData AVG time: ${sampleSum / samples}`)

        frames = 0;
        lastTime = now;
        sampleSum = 0;
        samples = 0;
    }
}

function fillData() {
    const perfStart = performance.now();

    const vData = viewData;
    const endTime = vData.endTime === "now" ? Date.now() : vData.endTime;
    const timeIntervalMs = vData.timeIntervalSeconds * 1000;
    const startTime = endTime - timeIntervalMs;
    const maxVol = vData.maxVolumeSaturation;
    const invMaxVol = 1.0 / maxVol;
    const timeToColFactor = W / timeIntervalMs;

    data.fill(0.5);

    const n = marketData.length;
    if (n === 0) return;

    // Binary search for the first book that starts at or after startTime
    let low = 0;
    let high = n;
    while (low < high) {
        let mid = (low + high) >>> 1;
        if (marketData[mid].epochTimestamp < startTime) low = mid + 1;
        else high = mid;
    }

    // The book active at startTime is marketData[low - 1] if it exists
    let startIdx = low > 0 ? low - 1 : 0;

    for (let i = startIdx; i < n; i++) {
        const book = marketData[i];
        const timestamp = book.epochTimestamp;

        if (timestamp > endTime) break;

        const nextTimestamp = (i + 1 < n) ? marketData[i + 1].epochTimestamp : endTime;

        let col = ((timestamp - startTime) * timeToColFactor) | 0;
        let nextCol = ((nextTimestamp - startTime) * timeToColFactor) | 0;

        if (col < 0) col = 0;
        if (nextCol > W) nextCol = W;

        if (col >= nextCol || col >= W) continue;

        const bids = book.bids;
        for (let j = 0; j < bids.length; j++) {
            const b = bids[j];
            let row = (b.price * H) | 0;
            if (row < 0) row = 0; else if (row >= H) row = H - 1;

            const p = (b.quantity < maxVol ? b.quantity : maxVol) * invMaxVol;
            const val = 0.5 - p * 0.5;

            const rowOffset = row * W;
            data.fill(val, rowOffset + col, rowOffset + nextCol);
        }

        const asks = book.asks;
        for (let j = 0; j < asks.length; j++) {
            const a = asks[j];
            let row = (a.price * H) | 0;
            if (row < 0) row = 0; else if (row >= H) row = H - 1;

            const p = (a.quantity < maxVol ? a.quantity : maxVol) * invMaxVol;
            const val = 0.5 + p * 0.5;

            const rowOffset = row * W;
            data.fill(val, rowOffset + col, rowOffset + nextCol);
        }
    }

    const perfEnd = performance.now();
    samples++;
    sampleSum += perfEnd - perfStart;
}

export function render_regl(canvas) {
    measureFPS();
    regl.poll();
    regl.clear({color: [0, 0, 0, 1]});
    fillData()
    texture.subimage(data);
    draw();

    requestAnimationFrame(() => render_regl(canvas));
}

export function resize(canvas) {
    const dpr = window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    regl._gl.viewport(0, 0, canvas.width, canvas.height);
}
