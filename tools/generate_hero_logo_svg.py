#!/usr/bin/env python3
"""Build the exact hero logo outlines from the site's Inter Tight variable font."""

from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib.removeOverlaps import removeOverlaps
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = ROOT / "assets/fonts/NGSwv5HMAFg6IuGlBNMjxLsD8ah8QA.woff2"
OUTPUT_PATH = ROOT / "assets/hero-logo-3d.svg"

TEXT = "ТУКАЙФ"
WEIGHT = 700

# The live hero uses 18vw type with -1.2vw tracking: -1/15 em.
TRACKING_EM = -1.2 / 18

# The global negative tracking is too tight for the diagonal start of У:
# its face intersects Т once both glyphs get depth. Keep the rest unchanged.
TU_PAIR_ADJUST_EM = 0.075

# Match the current 120px snowflake beside a roughly 368px desktop wordmark.
STAR_WIDTH_EM = 0.326
GAP_EM = 0.054

STAR_VIEWBOX_X = -3.0
STAR_VIEWBOX_Y = 18.51
STAR_VIEWBOX_SIZE = 80.55
STAR_PATH = (
    "M47.3818 41.2734L64.4385 31.4268L74.5459 48.9346"
    "L57.4883 58.7822L74.5469 68.6309L64.4395 86.1377"
    "L47.3818 76.2891V95.9863H27.166V76.2891L10.1084 86.1377"
    "L0 68.6299L17.0566 58.7812L0.000976562 48.9346"
    "L10.1094 31.4277L27.166 41.2754V21.5801H47.3818V41.2734Z"
)


def clean(value: float) -> str:
    return f"{value:.3f}".rstrip("0").rstrip(".")


def glyphs_with_components(font: TTFont, glyph_names: list[str]) -> list[str]:
    """Include referenced base glyphs so overlaps are removed inside composites."""
    glyf = font["glyf"]
    ordered: list[str] = []
    pending = list(glyph_names)

    while pending:
        glyph_name = pending.pop(0)
        if glyph_name in ordered:
            continue
        ordered.append(glyph_name)

        glyph = glyf[glyph_name]
        if glyph.isComposite():
            pending.extend(glyph.getComponentNames(glyf))

    return ordered


def main() -> None:
    variable_font = TTFont(FONT_PATH)
    font = instantiateVariableFont(variable_font, {"wght": WEIGHT}, inplace=False)
    units_per_em = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    glyph_names = [cmap[ord(char)] for char in TEXT]

    # Font glyphs can contain overlapping components. Browsers fill them as one
    # silhouette, while 3D extrusion would leave coplanar faces that shimmer.
    # Union the components before exporting to make every letter watertight.
    removeOverlaps(font, glyphNames=glyphs_with_components(font, glyph_names))
    glyph_set = font.getGlyphSet()

    tracking = units_per_em * TRACKING_EM
    star_width = units_per_em * STAR_WIDTH_EM
    gap = units_per_em * GAP_EM

    glyphs: list[tuple[str, str, float, float]] = []
    cursor_x = star_width + gap
    top = 0.0
    bottom = 0.0
    cap_top = 0.0

    previous_char = ""
    for char in TEXT:
        if previous_char == "Т" and char == "У":
            cursor_x += units_per_em * TU_PAIR_ADJUST_EM

        glyph_name = cmap[ord(char)]
        glyph = glyph_set[glyph_name]
        pen = SVGPathPen(glyph_set)
        glyph.draw(pen)
        glyphs.append((char, pen.getCommands(), cursor_x, glyph.width))
        cursor_x += glyph.width + tracking

        # Bounds are read from the variable outline via a lightweight bounds pen.
        from fontTools.pens.boundsPen import BoundsPen

        bounds_pen = BoundsPen(glyph_set)
        glyph.draw(bounds_pen)
        if bounds_pen.bounds:
            _, y_min, _, y_max = bounds_pen.bounds
            top = max(top, y_max)
            bottom = min(bottom, y_min)
            if char != "Й":
                cap_top = max(cap_top, y_max)

        previous_char = char

    # There is no trailing CSS letter spacing after the final visible glyph.
    logo_width = cursor_x - tracking
    padding_y = units_per_em * 0.02
    baseline = top + padding_y
    logo_height = top - bottom + padding_y * 2

    # The snowflake aligns with the visual centre of the normal cap height.
    star_center_y = baseline - cap_top / 2
    star_scale = star_width / STAR_VIEWBOX_SIZE
    star_x = -STAR_VIEWBOX_X * star_scale
    star_y = star_center_y - star_width / 2 - STAR_VIEWBOX_Y * star_scale

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {clean(logo_width)} {clean(logo_height)}">'
        ),
        "  <!-- Generated from the exact Inter Tight 700 outlines used by twokaif.ru. -->",
        (
            f'  <path id="snowflake" fill="#1d1d1f" d="{STAR_PATH}" '
            f'transform="translate({clean(star_x)} {clean(star_y)}) '
            f'scale({clean(star_scale)})"/>'
        ),
    ]

    for index, (char, path_data, x, _) in enumerate(glyphs):
        lines.append(
            f'  <path id="glyph-{index}" data-char="{char}" fill="#1d1d1f" '
            f'd="{path_data}" transform="translate({clean(x)} {clean(baseline)}) scale(1 -1)"/>'
        )

    lines.append("</svg>")
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT_PATH.relative_to(ROOT)} "
        f"({clean(logo_width)} × {clean(logo_height)} font units)"
    )


if __name__ == "__main__":
    main()
