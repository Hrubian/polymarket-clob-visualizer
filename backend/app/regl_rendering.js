// TODO can it be modifiable
import {marketData, viewData} from "./data.js";
import {canvas} from "./init.js"
// import createREGL from 'https://cdn.skypack.dev/regl';
const W = 1000;   // time columns
const H = 100;   // price levels

// CPU-side data buffer
const data = new Float32Array(W * H);
let regl = null;
let draw = null;
let texture = null;

let frames = 0;
let lastTime = performance.now()

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
    // float scaled = v * 1000.0;
    // intensity = log(scaled + 1.0) / log(1001.0);
    intensity = v;

    color = vec3(1.0, 0.2, 0.2);
  } else if (v < 0.0) {
    // BID (blue)
    // float scaled = -v * 1000.0;
    // intensity = log(scaled + 1.0) / log(1001.0);
    intensity = v;

    color = vec3(0.2, 0.4, 1.0);
  } else {
    // zero → transparent
    gl_FragColor = vec4(0.0);
    return;
  }

  gl_FragColor = vec4(color, intensity);
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

        frames = 0;
        lastTime = now;
    }
}

function fillData() {
    data.fill(0.5);
    let endTime;
    if (viewData.endTime === "now") {
        // endTime = performance.now(); // in millis
        endTime = Date.now()
    } else {
        endTime = viewData.endTime;
    }
    let startTime = endTime - viewData.timeIntervalSeconds * 1000;
    let books = marketData.filter((book) => book.epochTimestamp >= startTime && book.epochTimestamp <= endTime) // TODO use binsearch

    let sumQuantity = 0.0
    let cntQuantity = 0;
    let maxQuantity = 0.0
    let minQuantity = 10000000;

    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const timestamp = book.epochTimestamp;
        const column = Math.floor((timestamp - startTime) / (viewData.timeIntervalSeconds * 1000) * W);
        for (let j = 0; j < book.bids.length; j++) {
            const priceLevel = book.bids[j];
            const price = priceLevel.price; // [0, 1]
            const quantity = priceLevel.quantity;

            const row = Math.floor(price * H); // TODO log? exp?

            const proportion = Math.min(quantity, viewData.maxVolumeSaturation) / viewData.maxVolumeSaturation; // [0, 1]

            const finalQuantity = ((- proportion) + 1) / 2.0;
            console.log("bid finalQuantity: ", finalQuantity)

            data[row * W + column] = finalQuantity;

            sumQuantity += quantity;
            cntQuantity += 1;
            if (quantity > maxQuantity)
                maxQuantity = quantity;
            if (quantity < minQuantity)
                minQuantity = quantity;
        }
        for (let j = 0; j < book.asks.length; j++) {
            const priceLevel = book.asks[j];
            const price = priceLevel.price; // [0, 1]
            const quantity = priceLevel.quantity;

            const row = Math.floor(price * H); // TODO log? exp?

            const proportion = Math.min(quantity, viewData.maxVolumeSaturation) / viewData.maxVolumeSaturation; // [0, 1]

            const finalQuantity = proportion / 2 + 0.5;
            console.log("ask finalQuantity: ", finalQuantity)

            data[row * W + column] = finalQuantity;

            sumQuantity += quantity;
            cntQuantity += 1;
            if (quantity > maxQuantity)
                maxQuantity = quantity;
            if (quantity < minQuantity)
                minQuantity = quantity;
        }
    }
    console.log("avg: ", sumQuantity / cntQuantity);
    console.log("max: ", maxQuantity);
    console.log("min: ", minQuantity);
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
