import Box from "@mui/material/Box";

/**
 * Brand mark + wordmark. Two SKUs:
 *
 *   <Logo />           full wordmark image (logolc2.png) for top nav
 *   <Logo variant="icon" />    square mark only (logolc1.png) for tight
 *                              spots (auth pages, OG tiles, splashes)
 *
 * Both render as actual <img> tags so the brand gradient comes through
 * pixel-perfect rather than getting recreated with CSS each time. The
 * image is small enough (26 KB for the wordmark) that the perf cost is
 * trivial, and it stays consistent with print/external usage.
 *
 * Falls through with `userSelect: none` and `aria-label="LynkCircles"`
 * so screen readers announce the brand name without us double-rendering
 * "LynkCircles" as text underneath.
 */

interface Props {
  /** Pixel height of the rendered logo. Width auto-scales. */
  size?: number;
  /** "wordmark" (default) → image with text, "icon" → square monogram. */
  variant?: "wordmark" | "icon";
}

const ASSETS = {
  wordmark: {
    src: "/logolc2.png",
    intrinsicWidth: 397,
    intrinsicHeight: 61,
  },
  icon: {
    src: "/logolc1.png",
    intrinsicWidth: 1755,
    intrinsicHeight: 1755,
  },
};

export const Logo = ({ size = 28, variant = "wordmark" }: Props) => {
  const asset = ASSETS[variant];
  const aspectRatio = asset.intrinsicWidth / asset.intrinsicHeight;
  const width = size * aspectRatio;

  return (
    <Box
      component="img"
      src={asset.src}
      // Hint to the browser so layout doesn't shift while the image
      // resolves. Width is computed from the intrinsic aspect ratio
      // so wordmark/icon both render at the requested height.
      width={width}
      height={size}
      alt="LynkCircles"
      sx={{
        display: "block",
        userSelect: "none",
        // Subtly fade brightness in dark mode — the gradient already
        // works against both backgrounds but the white edge of the
        // wordmark can read a little hot at full strength.
        opacity: (theme) => (theme.palette.mode === "dark" ? 0.95 : 1),
      }}
      draggable={false}
    />
  );
};
