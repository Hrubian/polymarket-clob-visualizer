
function getY(overlay, price) {
    return overlay.height * (1 - price);
}

export function drawGrid(ctx, overlay) {
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // major lines (0.0, 0.1, ...)
    for (let p = 0; p <= 1.0001; p += 0.1) {
        const y = getY(overlay, p);

        ctx.strokeStyle = 'rgba(0,255,255,0.18)';
        if (p == 0.5) {
            ctx.lineWidth = 6
        } else {
            ctx.lineWidth = 3
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(overlay.width, y);
        ctx.stroke();

        // labels
        ctx.fillStyle = 'rgba(0,255,255,0.7)';
        ctx.font = '14px monospace';

        ctx.fillText(p.toFixed(2), 8, y - 4);
    }

    // minor lines (0.05, 0.15, ...)
    for (let p = 0.05; p < 1.0; p += 0.1) {
        const y = getY(overlay, p);

        ctx.strokeStyle = 'rgba(0,255,255,0.08)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(overlay.width, y);
        ctx.stroke();
    }
}

export function resizeOverlay(ctx, overlay) {
    const dpr = window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    overlay.width = width * dpr;
    overlay.height = height * dpr;

    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawGrid(ctx, overlay);
}