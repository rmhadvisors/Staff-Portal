import { motion } from "motion/react";

// `size` is the logo height; the full logo (swirl + wordmark) is ~2.4x wider than tall.
// `iconOnly` crops to the left swirl for tight spaces like the collapsed sidebar.
// logo-dark.png is the same logo with the navy/grey recoloured light, for dark mode.
export function Logo({
  size = 40,
  floating = false,
  iconOnly = false,
}: {
  size?: number;
  floating?: boolean;
  iconOnly?: boolean;
}) {
  const fit = iconOnly ? "shrink-0 object-cover object-left" : "shrink-0 object-contain";
  const style = { height: size, width: iconOnly ? size : "auto" };
  return (
    <motion.div
      className="shrink-0"
      animate={floating ? { y: [0, -6, 0] } : undefined}
      transition={floating ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <img src="/logo.png" alt="RMH Advisors" className={`${fit} dark:hidden`} style={style} />
      <img src="/logo-dark.png" alt="RMH Advisors" className={`${fit} hidden dark:block`} style={style} />
    </motion.div>
  );
}

// The logo already contains the "RMH Advisors" wordmark.
export const LogoWord = Logo;
