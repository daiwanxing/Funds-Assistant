import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchFundDetail } from "@/api/fundDetail";
import type {
  ACWorthPoint,
  FundDetailData,
  FundProfile,
  FundReturnPeriod,
} from "@/types/fund";

const PERIOD_LABELS: Record<FundReturnPeriod, string> = {
  "1w": "1周",
  "1m": "1个月",
  "3m": "3个月",
  "6m": "6个月",
  ytd: "年初至今",
  "1y": "1年",
  "2y": "2年",
  "5y": "5年",
  "10y": "10年",
};

/** 按周期裁剪走势数据 */
const filterByPeriod = (
  points: ACWorthPoint[],
  period: FundReturnPeriod,
): ACWorthPoint[] => {
  if (points.length === 0) return [];

  const latest = points[points.length - 1]![0];
  const earliest = points[0]![0];
  let cutoff: number;

  if (period === "ytd") {
    const d = new Date(latest);
    cutoff = new Date(d.getFullYear(), 0, 1).getTime();
  } else if (period === "1w") {
    cutoff = latest - 7 * 24 * 60 * 60 * 1000;
  } else {
    const monthsMap: Record<string, number> = {
      "1m": 1,
      "3m": 3,
      "6m": 6,
      "1y": 12,
      "2y": 24,
      "5y": 60,
      "10y": 120,
    };
    const months = monthsMap[period] ?? 6;
    const d = new Date(latest);
    d.setMonth(d.getMonth() - months);
    cutoff = d.getTime();
  }

  const effectiveCutoff = Math.max(cutoff, earliest);
  return points.filter(([ts]) => ts >= effectiveCutoff);
};

/** 计算周期收益率 */
const calcPeriodReturn = (points: ACWorthPoint[]): number | null => {
  if (points.length < 2) return null;
  const start = points[0]![1];
  const end = points[points.length - 1]![1];
  if (start === 0) return null;
  return ((end - start) / start) * 100;
};

export const useFundDetail = (code: MaybeRefOrGetter<string | null>) => {
  const period = ref<FundReturnPeriod>("6m");

  const queryKey = computed(() => ["fundDetail", toValue(code)] as const);
  const enabled = computed(() => {
    const c = toValue(code);
    return c !== null && c.trim().length > 0;
  });

  const { data, isPending, isError, error } = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const c = toValue(code);
      if (!c) return null;
      return fetchFundDetail(c);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const detail = computed<FundDetailData | null>(() => data.value ?? null);
  const profile = computed<FundProfile | null>(() => detail.value?.profile ?? null);
  const acWorthTrend = computed<ACWorthPoint[]>(() => detail.value?.acWorthTrend ?? []);
  const stockCodes = computed<string[]>(() => detail.value?.stockCodes ?? []);

  const filteredTrend = computed(() => filterByPeriod(acWorthTrend.value, period.value));

  const periodReturn = computed<number | null>(() => calcPeriodReturn(filteredTrend.value));

  const isRising = computed(() => {
    const ret = periodReturn.value;
    return ret !== null && ret >= 0;
  });

  const periodLabel = computed(() => PERIOD_LABELS[period.value]);

  const latestNav = computed<number | null>(() => {
    const trend = acWorthTrend.value;
    if (trend.length === 0) return null;
    return trend[trend.length - 1]![1];
  });

  const setPeriod = (p: FundReturnPeriod) => {
    period.value = p;
  };

  return {
    detail,
    profile,
    acWorthTrend,
    stockCodes,
    period,
    setPeriod,
    filteredTrend,
    periodReturn,
    periodLabel,
    isRising,
    latestNav,
    isLoading: isPending,
    isError,
    error,
  };
};

// Exported for testing
export { filterByPeriod as _filterByPeriod, calcPeriodReturn as _calcPeriodReturn };
