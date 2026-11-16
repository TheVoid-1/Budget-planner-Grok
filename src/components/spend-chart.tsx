import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, type SpendRow } from "@/lib/budget";

type TipProps = {
  active?: boolean;
  payload?: Array<{ payload?: SpendRow }>;
};

function SpendTip({ active, payload }: TipProps) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-sm bg-fg px-3 py-2 text-sm text-bg">
      <p className="font-medium">{row.name}</p>
      <p className="tabular-nums">
        {formatMoney(row.cents)} · {row.pct}%
      </p>
    </div>
  );
}

export function SpendChart({ rows }: { rows: SpendRow[] }) {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  if (rows.length === 0) return null;

  return (
    <div
      className="w-full min-w-0 text-muted"
      style={{ height: Math.max(176, rows.length * 40) }}
      role="img"
      aria-label="Bar chart of spending by category"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={112}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 13 }}
            tickFormatter={(value: string) =>
              value.length > 14 ? `${value.slice(0, 13)}…` : value
            }
          />
          <Tooltip
            cursor={{ fill: "var(--color-inset)" }}
            content={<SpendTip />}
          />
          <Bar
            dataKey="cents"
            fill="var(--color-accent)"
            barSize={12}
            radius={[0, 6, 6, 0]}
            isAnimationActive={animate}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
