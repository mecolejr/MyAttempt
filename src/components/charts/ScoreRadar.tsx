"use client";

import { Radar } from "react-chartjs-2";
import { useRef, useState } from "react";
import "./setup";

export type ScoreRadarAdjustDim = "Safety" | "Community" | "Cost & Quality";

type Props = {
  safety: number;
  community: number;
  costQuality: number;
  onAdjust?: (dim: ScoreRadarAdjustDim, delta?: number) => void;
};

export default function ScoreRadar({ safety, community, costQuality, onAdjust }: Props) {
  const chartRef = useRef<any>(null);
  const [dragging, setDragging] = useState(false);
  const [lastIdx, setLastIdx] = useState<number | null>(null);
  const data = {
    labels: ["Safety", "Community", "Cost & Quality"],
    datasets: [
      {
        label: "TruePlace Dimensions",
        data: [safety, community, costQuality],
        backgroundColor: "rgba(37, 99, 235, 0.25)",
        borderColor: "#2563eb",
        pointBackgroundColor: "#2563eb",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: "#e5e7eb" },
        angleLines: { color: "#e5e7eb" },
      },
    },
    plugins: { legend: { display: false } },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3, hoverRadius: 6 },
    },
    animation: {
      duration: 900,
      easing: "easeOutQuart",
    },
    onHover: (event: any, elements: any[], chart: any) => {
      const canvas = chart?.canvas as HTMLCanvasElement | undefined;
      if (!canvas) return;
      canvas.style.cursor = elements?.length ? "pointer" : "default";
    },
  } as const;

  return (
    <Radar
      ref={chartRef}
      data={data}
      options={options}
      onClick={(_evt: any, elements: any[]) => {
        if (!onAdjust || !elements?.length) return;
        const index = elements[0].index ?? 0;
        const dim = data.labels[index] as ScoreRadarAdjustDim;
        onAdjust(dim, 5);
      }}
      onMouseDown={() => setDragging(true)}
      onMouseUp={() => {
        setDragging(false);
        setLastIdx(null);
      }}
      onMouseLeave={() => {
        setDragging(false);
        setLastIdx(null);
      }}
      onMouseMove={(evt: any) => {
        if (!dragging || !onAdjust) return;
        const chart = chartRef.current;
        if (!chart) return;
        const elements = chart.getElementsAtEventForMode(evt, "nearest", { intersect: true }, true);
        if (!elements?.length) return;
        const index = elements[0].index ?? 0;
        if (lastIdx === index) return;
        setLastIdx(index);
        const dim = data.labels[index] as ScoreRadarAdjustDim;
        const delta = evt?.native?.altKey ? -2 : 2;
        onAdjust(dim, delta);
      }}
    />
  );
}


