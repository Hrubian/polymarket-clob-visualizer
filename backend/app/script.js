const data = [];

function addPoint(bid, ask) {
  const now = performance.now();

  data.push({
    time: now,
    bid,
    ask
  });

  const cutoff = now - 50_000;
  while (data.length > 1 && data[1].time < cutoff) {
    data.shift();
  }
}

const socket = new WebSocket("ws://localhost:8080/prices");

//socket.onmessage = (event) => {
socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  console.log("Received bid " + msg.bidPrice + " and ask " + msg.askPrice)

  addPoint(msg.bidPrice, msg.askPrice);
});

function getX(time, now, width) {
  const age = now - time; // how old the point is
  return width - (age / 50_000) * width;
}

function getPriceRange(data) {
//  let min = Infinity;
//  let max = -Infinity;
//
//  for (const p of data) {
//    if (p.price < min) min = p.price;
//    if (p.price > max) max = p.price;
//  }
//
//  // Avoid flat line
//  if (min === max) {
//    min -= 1;
//    max += 1;
//  }
//
//  return { min, max };
    return { min: 0.0, max: 1.0 };
}

function getY(price, min, max, height) {
  return height - ((price - min) / (max - min)) * height;
}

function drawLine(ctx, data, key, color, now, min, max) {
    if (data.length == 0) {
        return;
    }
    ctx.beginPath();
    let lastPoint = data[0]

  for (let i = 0; i < data.length; i++) {
    const p = data[i];

    const x = getX(p.time, now, canvas.width);
    const y = getY(p[key], min, max, canvas.height);

    if (i === 0) ctx.moveTo(x, y);
    else {
        const oldY = getY(lastPoint[key], min, max, canvas.height)
        ctx.lineTo(x, oldY);
        ctx.lineTo(x, y);
    }
    lastPoint = p;
  }

  const oldY = getY(lastPoint[key], min, max, canvas.height)
  ctx.lineTo(canvas.width, oldY);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowBlur = 9;
  ctx.shadowColor = color;

  ctx.stroke();
}

function drawGrid(ctx, width, height, now) {
  ctx.strokeStyle = "#787878";
  ctx.lineWidth = 1e
  ctx.shadowBlur = 4
  ctx.shadowColor = "#E0E0E0"

  const rows = 20;
  const cols = 30;

  const stepY = height / rows;
  const stepX = width / cols;

  ctx.beginPath();

  // Horizontal lines
  for (let y = 0; y <= height; y += stepY) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  // Vertical lines
  for (let x = 0; x <= width; x += stepX) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  ctx.stroke();
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
//canvas.height = 400;
canvas.height = window.innerHeight

function render() {
  const now = performance.now();

//  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(ctx, canvas.width, canvas.height)

  if (data.length > 1) {
    const { min, max } = getPriceRange(data);

    // Bid (blue)
    drawLine(ctx, data, "bid", "#3399ff", now, min, max);

    // Ask (red)
    drawLine(ctx, data, "ask", "#ff4d4d", now, min, max);
  }

  requestAnimationFrame(render);
}

render();