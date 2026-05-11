
function getY(logicalHeight, price) {
    return logicalHeight * (1 - price);
}

function getTimeInterval(visibleSeconds) {
    const intervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    for (const interval of intervals) {
        if (visibleSeconds / interval <= 10) return interval;
    }
    return 1000;
}

export function drawGrid(ctx, overlay, viewData) {
    const dpr = window.devicePixelRatio || 1;
    const width = overlay.width / dpr;
    const height = overlay.height / dpr;

    ctx.clearRect(0, 0, width, height);

    // major lines (0.0, 0.1, ...)
    for (let p = 0; p <= 1.0001; p += 0.1) {
        const y = getY(height, p);

        ctx.strokeStyle = 'rgba(0,255,255,0.18)';
        if (p > 0.49 && p < 0.51) { // float equality safe
            ctx.lineWidth = 6
        } else {
            ctx.lineWidth = 3
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // labels
        ctx.fillStyle = 'rgba(0,255,255,0.7)';
        ctx.font = '14px monospace';

        ctx.fillText(p.toFixed(2), 8, y - 4);
    }

    // minor lines (0.05, 0.15, ...)
    for (let p = 0.05; p < 1.0; p += 0.1) {
        const y = getY(height, p);

        ctx.strokeStyle = 'rgba(0,255,255,0.08)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Vertical time lines
    if (viewData) {
        const interval = getTimeInterval(viewData.timeIntervalSeconds);
        const endTime = viewData.endTime === "now" ? Date.now() : viewData.endTime;
        const startTime = endTime - viewData.timeIntervalSeconds * 1000;

        const intervalMs = interval * 1000;
        const firstLine = Math.ceil(startTime / intervalMs) * intervalMs;

        for (let t = firstLine; t <= endTime; t += intervalMs) {
            const x = ((t - startTime) / (viewData.timeIntervalSeconds * 1000)) * width;

            ctx.strokeStyle = 'rgba(0,255,255,0.18)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            const date = new Date(t);
            const timeStr = date.toLocaleTimeString('en-GB', { hour12: false });

            ctx.fillStyle = 'rgba(0,255,255,0.7)';
            ctx.font = '12px monospace';
            ctx.fillText(timeStr, x + 4, height - 10);
        }
    }
}

export function resizeOverlay(ctx, overlay, viewData) {
    const dpr = window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    overlay.width = width * dpr;
    overlay.height = height * dpr;

    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawGrid(ctx, overlay, viewData);
}