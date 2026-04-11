import * as echarts from "echarts/core";
import type { ACWorthPoint, FundReturnPeriod } from "@/types/fund";

const formatXAxisLabel = (value: number, period: FundReturnPeriod) => {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (period) {
    case "1w":
    case "1m":
      return `${month}-${day}`;
    case "3m":
    case "6m":
      return `${month}/${day}`;
    case "ytd":
    case "1y":
    case "2y":
      return `${date.getFullYear()}-${month}`;
    case "5y":
    case "10y":
      return `${date.getFullYear()}`;
    default:
      return `${month}-${day}`;
  }
};

const getXAxisSplitNumber = (period: FundReturnPeriod) => {
  switch (period) {
    case "1w":
    case "1m":
      return 4;
    case "3m":
    case "6m":
      return 5;
    case "ytd":
    case "1y":
      return 6;
    default:
      return 5;
  }
};

export const createFundReturnChartOption = ({
  chartData,
  period,
  isRising,
  lineColor,
  yAxisMin,
  yAxisMax,
}: {
  chartData: ACWorthPoint[];
  period: FundReturnPeriod;
  isRising: boolean;
  lineColor: string;
  yAxisMin: number | null;
  yAxisMax: number | null;
}): echarts.EChartsCoreOption => {
  return {
    animation: true,
    animationDuration: 400,
    grid: {
      top: 10,
      right: 18,
      bottom: 18,
      left: 24,
      containLabel: false,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(17,19,23,0.92)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      textStyle: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
      },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const item = p as { data: [number, number] };
        if (!item?.data) return "";
        const date = new Date(item.data[0]);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return `<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:3px">${dateStr}</div><div style="font-size:14px;font-weight:600;color:${lineColor}">${item.data[1].toFixed(4)}</div>`;
      },
    },
    xAxis: {
      type: "time",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "rgba(255,255,255,0.18)",
        fontSize: 9,
        fontFamily: "var(--font-sans)",
        formatter: (value: number) => formatXAxisLabel(value, period),
      },
      min: chartData[0]?.[0],
      max: chartData[chartData.length - 1]?.[0],
      splitNumber: getXAxisSplitNumber(period),
      splitLine: {
        show: false,
        lineStyle: {
          color: "rgba(255,255,255,0.035)",
          type: "solid",
        },
      },
    },
    yAxis: {
      type: "value",
      position: "left",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "rgba(255,255,255,0.24)",
        fontSize: 9,
        fontFamily: "var(--font-mono)",
        formatter: (value: number) => value.toFixed(3),
      },
      min: yAxisMin ?? undefined,
      max: yAxisMax ?? undefined,
      splitLine: {
        show: false,
        lineStyle: {
          color: "rgba(255,255,255,0.03)",
        },
      },
      splitNumber: 4,
    },
    series: [
      {
        type: "line",
        data: chartData,
        showSymbol: false,
        smooth: false,
        lineStyle: {
          color: lineColor,
          width: 1.8,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: isRising ? "rgba(255,90,82,0.18)" : "rgba(48,209,88,0.18)",
            },
            {
              offset: 0.45,
              color: isRising ? "rgba(255,90,82,0.08)" : "rgba(48,209,88,0.08)",
            },
            {
              offset: 1,
              color: isRising ? "rgba(255,90,82,0.02)" : "rgba(48,209,88,0.02)",
            },
          ]),
        },
        emphasis: {
          lineStyle: { width: 2 },
        },
      },
    ],
  };
};
