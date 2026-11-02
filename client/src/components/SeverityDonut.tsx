import { motion, useReducedMotion } from "framer-motion";

export interface SeveritySlice {
  label: string;
  value: number;
  /** CSS color for the slice. */
  color: string;
}

interface SeverityDonutProps {
  slices: SeveritySlice[];
  totalLabel: string;
}

/**
 * Donut chart for the severity split, built with a conic gradient so it stays
 * crisp at any size and needs no chart library.
 */
export function SeverityDonut({ slices, totalLabel }: SeverityDonutProps) {
  const reduceMotion = useReducedMotion();
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;

  let cursor = 0;
  const stops = slices.map(slice => {
    const from = (cursor / total) * 360;
    cursor += slice.value;
    const to = (cursor / total) * 360;
    return `${slice.color} ${from}deg ${to}deg`;
  });

  return (
    <div className="flex items-center gap-5">
      <motion.div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ backgroundImage: `conic-gradient(${stops.join(", ")})` }}
        initial={reduceMotion ? false : { rotate: -90, opacity: 0, scale: 0.9 }}
        whileInView={{ rotate: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-card">
          <span className="text-2xl font-semibold leading-none tabular-nums">
            {slices.reduce((sum, slice) => sum + slice.value, 0)}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {totalLabel}
          </span>
        </div>
      </motion.div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {slices.map(slice => (
          <li key={slice.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate text-muted-foreground">{slice.label}</span>
            <span className="ml-auto font-medium tabular-nums">{slice.value}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {Math.round((slice.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
