import {resize} from "./regl_rendering.js"
import {viewData, marketData, interactionData} from "./data.js";
import {resizeOverlay} from "./grid.js";

export function registerEvents(window, canvas, websocket, grid_canvas, grid_context) {
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

        if (e.shiftKey) {
            zoomPrice(e, canvas);
        } else {
            zoomTime(e);
        }
    }, { passive: false });

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
            resize(canvas)
            resizeOverlay(grid_context, grid_canvas)
        }, 100);
    })
}

function zoomTime(e) {
    if (e.deltaY < 0) {
        viewData.timeIntervalSeconds = Math.min(viewData.timeIntervalSeconds * 1.1, 1000);
    } else {
        viewData.timeIntervalSeconds = Math.max(viewData.timeIntervalSeconds / 1.1, 3);
    }
}

function zoomPrice(e, canvas) {
    const rect = canvas.getBoundingClientRect();

    // mouse Y in [0, 1]
    const mouseY = (e.clientY - rect.top) / rect.height;

    // convert mouse Y -> price
    // top = maxPrice
    // bottom = minPrice
    const mousePrice =
        viewData.maxPrice - mouseY * (viewData.maxPrice - viewData.minPrice);

    const zoomFactor = 1.1;

    const oldRange = viewData.maxPrice - viewData.minPrice;

    const newRange =
        e.deltaY < 0
            ? oldRange / zoomFactor
            : oldRange * zoomFactor;

    // preserve mouse position during zoom
    const ratio =
        (mousePrice - viewData.minPrice) / oldRange;

    let minPrice = mousePrice - ratio * newRange;
    let maxPrice = minPrice + newRange;

    // optional clamps
    minPrice = Math.max(0, minPrice);
    maxPrice = Math.min(1, maxPrice);

    viewData.minPrice = minPrice;
    viewData.maxPrice = maxPrice;

    console.log(minPrice, maxPrice);
}