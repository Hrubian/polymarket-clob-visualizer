
export function registerEvents(window, canvas, websocket) {
    // Websocket subscription
    websocket.addEventListener("message", (event) => {
        const msg = JSON.parse(event.data);
        console.log("Received bid " + msg.bidPrice + " and ask " + msg.askPrice)

        addPoint(msg.bidPrice, msg.askPrice);
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

    });

    // time zooming
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        console.log("TODO time zooming not done yet")
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
            resize();
        }, 100);
    })
}

