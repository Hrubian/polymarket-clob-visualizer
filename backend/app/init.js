import { registerEvents } from "./events.js";
import { render } from "./rendering.js";

export const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight

export const ctx = canvas.getContext("2d");

export const websocket = new WebSocket("ws://localhost:8080/l2");


registerEvents(window, canvas, ctx, websocket)
render(ctx, canvas)
