/**
 * Uniform-corner subset adapted from figma-squircle (MIT), Tien Pham.
 * Upstream 45622dc2e9b23d69a44be673d15d1152c50df8d8, src/draw.ts.
 * See smooth-corners.LICENSE and the linked Figma geometry in the hook README.
 */
export function getSmoothCornerPath(
  width: number,
  height: number,
  radius = 8,
  smoothing = 1
): string {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  )
    return ''
  const budget = Math.min(width, height) / 2
  const r = Math.min(Math.max(Number.isFinite(radius) ? radius : 0, 0), budget)
  if (r === 0) return `M 0 0 H ${width} V ${height} H 0 Z`
  const smooth = Math.min(
    Math.max(Number.isFinite(smoothing) ? smoothing : 0, 0),
    1,
    budget / r - 1
  )
  const p = (1 + smooth) * r
  const arc =
    Math.sin((((90 * (1 - smooth)) / 2) * Math.PI) / 180) * r * Math.SQRT2
  const tangent = r * Math.tan((((45 * smooth) / 2) * Math.PI) / 180)
  const c = tangent * Math.cos((45 * smooth * Math.PI) / 180)
  const d = c * Math.tan((45 * smooth * Math.PI) / 180)
  const b = (p - arc - c - d) / 3
  const a = 2 * b
  const path = `
    M ${width - p} 0
    c ${a} 0 ${a + b} 0 ${a + b + c} ${d}
    a ${r} ${r} 0 0 1 ${arc} ${arc}
    c ${d} ${c} ${d} ${b + c} ${d} ${a + b + c}
    L ${width} ${height - p}
    c 0 ${a} 0 ${a + b} ${-d} ${a + b + c}
    a ${r} ${r} 0 0 1 ${-arc} ${arc}
    c ${-c} ${d} ${-(b + c)} ${d} ${-(a + b + c)} ${d}
    L ${p} ${height}
    c ${-a} 0 ${-(a + b)} 0 ${-(a + b + c)} ${-d}
    a ${r} ${r} 0 0 1 ${-arc} ${-arc}
    c ${-d} ${-c} ${-d} ${-(b + c)} ${-d} ${-(a + b + c)}
    L 0 ${p}
    c 0 ${-a} 0 ${-(a + b)} ${d} ${-(a + b + c)}
    a ${r} ${r} 0 0 1 ${arc} ${-arc}
    c ${c} ${-d} ${b + c} ${-d} ${a + b + c} ${-d}
    Z`
  return path
    .replace(/-?\d+\.\d+(?:e[+-]?\d+)?/gi, (value) =>
      String(Number(Number(value).toFixed(4)))
    )
    .replace(/\s+/g, ' ')
    .trim()
}
