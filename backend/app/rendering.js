import { viewData, marketData } from "./data.js"; // TODO should it be here or injected as render param


export function render(context, canvas) {
    let endTime;
    if (viewData.endTime === "now") {
        endTime = performance.now(); // in millis
    } else {
        endTime = viewData.endTime;
    }

    let startTime = endTime - viewData.timeIntervalSeconds * 1000;
    requestAnimationFrame(render);
}

export function resizeCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set internal resolution
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    // Normalize coordinate system
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}