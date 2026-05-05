import {resizeCanvas} from "./rendering.js";
import {viewData, marketData, interactionData} from "./data.js";

export function registerEvents(window, canvas, ctx, websocket) {
    // Websocket subscription
    websocket.addEventListener("message", (event) => {
        console.log("Recieved msg from ws: " + event.data)
        const msg = JSON.parse(event.data);
        marketData.push(msg)
    });

    // History panning
    canvas.addEventListener("mousedown", (e) => {
        interactionData.isDragging = true
        interactionData.lastMouseX = e.clientX;
    });
    window.addEventListener("mouseup", (e) => {
        interactionData.isDragging = false
    });
    window.addEventListener("mousemove", (e) => {
        if (!interactionData.isDragging) return;

        const dx = e.clientX - interactionData.lastMouseX;
        interactionData.lastMouseX = e.clientX;

        const msPerPixel = viewData.timeIntervalSeconds * 1000 / canvas.width;

        const offsetChange = dx * msPerPixel

        const now = Date.now();
        if (viewData.endTime === "now") {
            viewData.endTime = Math.min(now, now - offsetChange);
        } else {
            viewData.endTime = Math.min(now, viewData.endTime - offsetChange);
        }
    });

    // Back to real-time
    window.addEventListener("dblclick", (e) => {
        viewData.endTime = "now"
    });

    // time zooming
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            viewData.timeIntervalSeconds = Math.min(viewData.timeIntervalSeconds * 1.1, 1000);
        } else {
            viewData.timeIntervalSeconds = Math.max(viewData.timeIntervalSeconds / 1.1, 3);
        }
    })

    // tooltips
    canvas.addEventListener("mousemove", (e) => { // TODO doubled handler

    });
    canvas.addEventListener("mouseleave", (e) => {

    });

    // window resizing
    let resizeTimeout;
    window.addEventListener("resize", (e) => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas(canvas, ctx);
        }, 100);
    })
}

