import { motion, useReducedMotion } from "framer-motion";

interface ScoreGaugeProps {
  /** 0..100 */
  score: number;
  grade: string;
  label: string;
  sublabel: string;
}

/**
 * Animated radial gauge showing the weighted security score.
 * The arc sweeps from the top clockwise; color tracks the grade.
 */
export function ScoreGauge({ score, grade, label, sublabel }: ScoreGaugeProps) {
  const reduceMotion = useReducedMotion();

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  // Three-quarter arc, sweeping clockwise from the top.
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const progress = Math.min(1, Math.max(0, score / 100));

  const strokeColor =
    score < 25
      ? "hsl(0 72% 51%)"
      : score < 50
        ? "hsl(38 92% 50%)"
        : score < 75
          ? "hsl(45 93% 47%)"
          : "hsl(160 84% 39%)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          role="img"
          aria-label={`${label}: ${score} out of 100`}
        >
          {/* Track: three-quarter arc, gap at the bottom */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform="rotate(135 110 110)"
          />
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform="rotate(135 110 110)"
            initial={{
              strokeDashoffset: reduceMotion
                ? arcLength * (1 - progress)
                : arcLength,
            }}
            animate={{ strokeDashoffset: arcLength * (1 - progress) }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-5xl font-bold tabular-nums"
            style={{ color: strokeColor }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            / 100
          </span>
          <span
            className="mt-2 text-lg font-semibold"
            style={{ color: strokeColor }}
          >
            Grade {grade}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground text-center max-w-56">
        {sublabel}
      </p>
    </div>
  );
}
