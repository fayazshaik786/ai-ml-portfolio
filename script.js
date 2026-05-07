const canvas = document.getElementById("modelCanvas");
const ctx = canvas.getContext("2d");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

const colors = {
  ink: "#17201b",
  teal: "#0c7c72",
  coral: "#e85d4f",
  gold: "#d99a21",
  green: "#9bbf54"
};

let nodes = [];
let tick = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildNodes(rect.width, rect.height);
}

function buildNodes(width, height) {
  const layers = [4, 6, 5, 3];
  const leftPad = width * 0.14;
  const rightPad = width * 0.16;
  const topPad = height * 0.16;
  const bottomPad = height * 0.2;
  const usableWidth = width - leftPad - rightPad;
  const usableHeight = height - topPad - bottomPad;

  nodes = layers.flatMap((count, layerIndex) => {
    const x = leftPad + (usableWidth / (layers.length - 1)) * layerIndex;
    return Array.from({ length: count }, (_, nodeIndex) => {
      const y = topPad + (usableHeight / Math.max(1, count - 1)) * nodeIndex;
      return {
        x,
        y,
        layerIndex,
        nodeIndex,
        radius: 7 + ((layerIndex + nodeIndex) % 3),
        phase: Math.random() * Math.PI * 2
      };
    });
  });
}

function drawNetwork() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  tick += 0.012;

  ctx.fillStyle = "rgba(23, 32, 27, 0.035)";
  for (let x = 28; x < width; x += 42) {
    for (let y = 28; y < height; y += 42) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const grouped = [0, 1, 2, 3].map((layer) => nodes.filter((node) => node.layerIndex === layer));
  for (let layer = 0; layer < grouped.length - 1; layer += 1) {
    grouped[layer].forEach((source) => {
      grouped[layer + 1].forEach((target) => {
        const pulse = Math.sin(tick * 3 + source.nodeIndex + target.nodeIndex) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(12, 124, 114, ${0.08 + pulse * 0.16})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
    });
  }

  nodes.forEach((node) => {
    const float = Math.sin(tick * 2 + node.phase) * 4;
    const x = node.x + Math.cos(tick + node.phase) * 2;
    const y = node.y + float;
    const palette = [colors.teal, colors.coral, colors.gold, colors.green];

    ctx.beginPath();
    ctx.arc(x, y, node.radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = palette[(node.layerIndex + node.nodeIndex) % palette.length];
    ctx.fill();
  });

  ctx.fillStyle = colors.ink;
  ctx.font = "800 13px Inter, system-ui, sans-serif";
  ctx.fillText("inputs", width * 0.1, height * 0.1);
  ctx.fillText("features", width * 0.37, height * 0.1);
  ctx.fillText("model", width * 0.66, height * 0.1);
  ctx.fillText("output", width * 0.77, height * 0.82);

  requestAnimationFrame(drawNetwork);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawNetwork();
