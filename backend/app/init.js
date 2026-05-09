import { registerEvents } from "./events.js";
import {initRegl, render_regl} from "./regl_rendering.js";
import {drawGrid} from "./grid.js";
export const gl_canvas = document.getElementById("gl");
gl_canvas.width = window.innerWidth;
gl_canvas.height = window.innerHeight

export const grid_canvas = document.getElementById("overlay");
grid_canvas.width = window.innerWidth;
grid_canvas.height = window.innerHeight
export const grid_context = grid_canvas.getContext("2d");

export const websocket = new WebSocket("ws://localhost:8080/l2");


initRegl(gl_canvas);

registerEvents(window, gl_canvas, websocket, grid_canvas, grid_context);
// render(ctx, canvas)
// requestAnimationFrame(render_regl)
render_regl(gl_canvas);
drawGrid(grid_context, grid_canvas);