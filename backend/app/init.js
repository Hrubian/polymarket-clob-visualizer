import { registerEvents } from "./events.js";
import { render } from "./rendering.js";
import {initRegl, render_regl} from "./regl_rendering.js";
export const canvas = document.getElementById("gl");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight

// export const ctx = canvas.getContext("2d");

export const websocket = new WebSocket("ws://localhost:8080/l2");


initRegl(canvas)

registerEvents(window, canvas, websocket)
// render(ctx, canvas)
// requestAnimationFrame(render_regl)
render_regl(canvas)
