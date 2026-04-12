import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchFundHoldings, fetchFundIndustry } from "@/api/fundHoldings";

export const useFundHoldings = (code: MaybeRefOrGetter<string | null>) => {
  const queryKey = computed(() => ["fundHoldings", toValue(code)] as const);
  const nextSuppressToast = ref(true);
  const enabled = computed(() => {
    const c = toValue(code);
    return c !== null && c.trim().length > 0;
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const c = toValue(code);
      if (!c) return null;
      const suppressToast = nextSuppressToast.value;
      nextSuppressToast.value = true;
      const [holdings, industry] = await Promise.all([
        fetchFundHoldings(c, 10, { suppressToast }),
        fetchFundIndustry(c, 10, { suppressToast }),
      ]);
      return { holdings, industry };
    },
    staleTime: 10 * 60 * 1000, // 持仓数据更新频率低，10 分钟缓存
    retry: 1,
  });

  const snapshot = computed(() => data.value?.holdings ?? null);
  const industrySnapshot = computed(() => data.value?.industry ?? null);
  const holdings = computed(() => snapshot.value?.holdings ?? []);
  const quarter = computed(() => snapshot.value?.quarter ?? "");
  const industries = computed(() => industrySnapshot.value?.industries ?? []);
  const industryQuarter = computed(() => industrySnapshot.value?.quarter ?? "");
  const maxRatio = computed(() => {
    const list = holdings.value;
    if (list.length === 0) return 0;
    return Math.max(...list.map((h) => h.ratio));
  });

  const retry = async () => {
    nextSuppressToast.value = false;
    await refetch();
  };

  return {
    snapshot,
    industrySnapshot,
    holdings,
    quarter,
    industries,
    industryQuarter,
    maxRatio,
    isLoading: isPending,
    isError,
    retry,
  };
};
