/**
 * Generates custom brand PNG icons at user-specified canvas resolution.
 * Converts to Base64 format to write native binary extension assets inside JSZip dynamically.
 */
export function drawIconToCanvasBase64(size: number, primaryColor: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) return "";

  // 1. Draw rounded container background block
  const radius = size * 0.25;
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // 2. Draw expansion arrow lines representing Fullscreen scaling
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1.5, size * 0.08);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const margin = size * 0.26;
  const length = size * 0.22;

  // Arrow 1: Top-Right Corner Expand
  ctx.beginPath();
  ctx.moveTo(size - margin - length, margin);
  ctx.lineTo(size - margin, margin);
  ctx.lineTo(size - margin, margin + length);
  ctx.stroke();

  // Arrow 2: Bottom-Left Corner Expand
  ctx.beginPath();
  ctx.moveTo(margin + length, size - margin);
  ctx.lineTo(margin, size - margin);
  ctx.lineTo(margin, size - margin - length);
  ctx.stroke();

  // Connected Diagonal Line representing expansion axis
  ctx.beginPath();
  ctx.moveTo(margin, size - margin);
  ctx.lineTo(size - margin, margin);
  ctx.stroke();

  // Extract base64
  const dataURL = canvas.toDataURL("image/png");
  // Split metadata header prefix (e.g. "data:image/png;base64,")
  const parts = dataURL.split(";base64,");
  return parts.length > 1 ? parts[1] : dataURL;
}
