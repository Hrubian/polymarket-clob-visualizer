import {resizeCanvas} from "./rendering";

export function registerEvents(window, canvas, ctx, websocket) {
    // Websocket subscription
    websocket.addEventListener("message", (event) => {
        console.log("Recieved msg from ws: " + event.data)
        const msg = JSON.parse(event.data);
        marketData.push(msg)
    });

    // History panning
    canvas.addEventListener("mousedown", (e) => {

    });
    window.addEventListener("mouseup", (e) => {

    });
    window.addEventListener("mousemove", (e) => {

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

