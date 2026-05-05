import { viewData, marketData } from "./data.js"; // TODO should it be here or injected as render param

function drawHeatmap() {
    // TODO
}

function getX(timestamp, startTime, endTime, timeIntervalMs, widthPx) {
    return (timestamp - startTime) / timeIntervalMs * widthPx
}

function getY(price, min, max, height) {
    return height - ((price - min) / (max - min)) * height;
}

function drawLine(books, keyName, color, ctx, canvas, startTime, endTime) {
    if (books.length === 0) {
        return
    }
    const minPrice = viewData.minPrice;
    const maxPrice = viewData.maxPrice;
    const timeIntervalMs = viewData.timeIntervalSeconds * 1000;

    ctx.beginPath();
    let lastPoint = books[0]

    for (let i = 0; i < books.length; i++) {
        const p = books[i];

        // const x = getX(p.time, now, canvas.width);
        const x = getX(p.epochTimestamp, startTime, endTime, timeIntervalMs, canvas.width)
        const y = getY(p[keyName][0].price, minPrice, maxPrice, canvas.height);

        if (i === 0) ctx.moveTo(x, y);
        else {
            const oldY = getY(lastPoint[keyName], canvas.height)
            ctx.lineTo(x, oldY);
            ctx.lineTo(x, y);
        }
        lastPoint = p;
    }

    const oldY = getY(lastPoint[keyName], canvas.height)
    ctx.lineTo(canvas.width, oldY);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowBlur = 9;
    ctx.shadowColor = color;

    ctx.stroke();
}

export function render(context, canvas) {
    context.fillStyle = "#1e1e1e";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let endTime;
    if (viewData.endTime === "now") {
        // endTime = performance.now(); // in millis
        endTime = Date.now()
    } else {
        endTime = viewData.endTime;
    }

    let startTime = endTime - viewData.timeIntervalSeconds * 1000;

    // TODO draw grid/numbers...
    let books = marketData.filter((book) => book.epochTimestamp >= startTime && book.epochTimestamp <= endTime) // TODO use binsearch
    drawHeatmap()
    drawLine(books, "bids", "#3399ff", context, canvas, startTime, endTime)
    drawLine(books, "asks", "#ff4d4d", context, canvas, startTime, endTime)

    requestAnimationFrame(() => render(context, canvas));
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