<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type PropType } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ACWorthPoint, FundReturnPeriod } from "@/types/fund";
import { createFundReturnChartOption } from "./fundReturnChartOptions";

const props = defineProps({
  data: {
    type: Array as PropType<ACWorthPoint[]>,
    required: true,
  },
  period: {
    type: String as PropType<FundReturnPeriod>,
    required: true,
  },
  isRising: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:period", value: FundReturnPeriod): void;
}>();

echarts.use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

const PERIODS: { key: FundReturnPeriod; label: string }[] = [
  { key: "1w", label: "1周" },
  { key: "1m", label: "1个月" },
  { key: "3m", label: "3个月" },
  { key: "6m", label: "6个月" },
  { key: "ytd", label: "年初至今" },
  { key: "1y", label: "1年" },
  { key: "2y", label: "2年" },
  { key: "5y", label: "5年" },
  { key: "10y", label: "10年" },
];

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const lineColor = computed(() =>
  props.isRising ? "#ff5a52" : "#30d158",
);
const chartData = computed(() => props.data);

const rangeValues = computed(() => chartData.value.map(([, value]) => value));

const yAxisBounds = computed(() => {
  const values = rangeValues.value;
  if (values.length === 0) {
    return { min: null, max: null };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const padding = min === 0 ? 0.1 : Math.abs(min) * 0.05;
    return {
      min: min - padding,
      max: max + padding,
    };
  }

  const padding = (max - min) * 0.12;
  return {
    min: Math.max(0, min - padding),
    max: max + padding,
  };
});

const buildOption = (): echarts.EChartsCoreOption => {
  return createFundReturnChartOption({
    chartData: chartData.value,
    period: props.period,
    isRising: props.isRising,
    lineColor: lineColor.value,
    yAxisMin: yAxisBounds.value.min,
    yAxisMax: yAxisBounds.value.max,
  });
};

const initChart = () => {
  if (!chartRef.value) return;
  if (chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return;
  chart = echarts.init(chartRef.value, undefined, { renderer: "canvas" });
  chart.setOption(buildOption());
};

const updateChart = () => {
  if (!chart) return;
  chart.setOption(buildOption(), { notMerge: true });
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  initChart();
  if (chartRef.value && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize();
    });
    resizeObserver.observe(chartRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
  chart = null;
});

watch(() => [props.data, props.isRising, props.period], updateChart, { deep: true });
</script>

<template>
  <div class="fund-return-chart">
    <div class="fund-return-chart__toolbar">
      <div class="fund-return-chart__periods">
        <button
          v-for="p in PERIODS"
          :key="p.key"
          :class="[
            'fund-return-chart__period-button',
            {
              'fund-return-chart__period-button--active': period === p.key,
            },
          ]"
          @click="emit('update:period', p.key)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div
      ref="chartRef"
      class="fund-return-chart__canvas"
    />
  </div>
</template>

<style scoped lang="scss" src="./FundReturnChart.scss"></style>
