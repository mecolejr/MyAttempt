"use client";

import { Line } from "react-chartjs-2";
import "./setup";

type SeriesPoint = { x: string | number; y: number };

type Props = {
  label: string;
  series: SeriesPoint[];
  color?: string;
  yMax?: number;
  onAdjustPoint?: (index: number) => void;
};

export default function TrendLine({ label, series, color = "#2563eb", yMax = 100, onAdjustPoint }: Props) {
  const data = {
    labels: series.map((p) => p.x),
    datasets: [
      {
        label,
        data: series.map((p) => p.y),
        borderColor: color,
        backgroundColor: `${color}33`,
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: yMax, grid: { color: "#e5e7eb" } },
      x: { grid: { display: false } },
    },
    interaction: { mode: "nearest", intersect: false },
    animation: {
      duration: 900,
      easing: "easeOutQuart",
    },
    animations: {
      y: {
        duration: 900,
        easing: "easeOutQuart",
      },
      colors: {
        type: "color",
        duration: 700,
        easing: "easeOutQuad",
      },
    },
  } as const;

  const onClick = (_: any, elements: any[]) => {
    if (!onAdjustPoint || !elements?.length) return;
    const idx = elements[0].index ?? 0;
    onAdjustPoint(idx);
  };

  return <Line data={data} options={options} onClick={(_: any, elements: any[]) => onClick(_, elements)} />;
}


