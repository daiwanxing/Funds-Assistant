<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import type { GlobalIndexItem } from "@/composables/index/useGlobalIndices";
import TickerCard from "./TickerCard.vue";

const props = defineProps<{
  dataList: GlobalIndexItem[];
  isLoading?: boolean;
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const trackContentRef = ref<HTMLElement | null>(null);

const isMarqueeEnabled = ref(false);
const animationDuration = ref(0);
/** 数据已就绪，用于控制 track 的淡入以及走马灯启动 */
const isDataReady = ref(false);
// 滚动速度常量，单位：像素/秒 (值越大滚动越快，50是一个相对适中的阅读速度)
const SCROLL_SPEED = 50;

const updateMarquee = () => {
  if (!wrapperRef.value || !trackContentRef.value) return;
  const wrapperWidth = wrapperRef.value.clientWidth;
  const trackWidth = trackContentRef.value.clientWidth;

  if (trackWidth > wrapperWidth && wrapperWidth > 0) {
    isMarqueeEnabled.value = true;
    animationDuration.value = trackWidth / SCROLL_SPEED;
  } else {
    isMarqueeEnabled.value = false;
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (isDataReady.value) updateMarquee();
  });
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value);
  if (trackContentRef.value) resizeObserver.observe(trackContentRef.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

watch(
  () => props.dataList,
  async (list) => {
    if (!list || list.length === 0) return;
    // 数据到达后先让 DOM 渲染完，再量尺寸启动跑马灯
    await nextTick();
    isDataReady.value = true;
    await nextTick();
    updateMarquee();
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <div class="global-ticker">
    <div class="global-ticker__live-badge">
      <div class="global-ticker__live-dot" />
      <div class="global-ticker__live-text">
        LIVE
      </div>
    </div>

    <div
      ref="wrapperRef"
      class="global-ticker__viewport"
    >
      <div class="global-ticker__fade global-ticker__fade--left" />
      <div class="global-ticker__fade global-ticker__fade--right" />

      <div
        v-if="isLoading || !isDataReady"
        class="global-ticker__skeleton"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="global-ticker__skeleton-item"
        >
          <div class="global-ticker__skeleton-chart" />
          <div class="global-ticker__skeleton-copy">
            <div class="global-ticker__skeleton-line global-ticker__skeleton-line--primary" />
            <div class="global-ticker__skeleton-line global-ticker__skeleton-line--secondary" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="global-ticker__track"
        :class="{
          'global-ticker__track--animating': isMarqueeEnabled,
          'global-ticker__track--ready': isDataReady,
        }"
        :style="isMarqueeEnabled ? { animationDuration: `${animationDuration}s` } : {}"
      >
        <div
          ref="trackContentRef"
          class="global-ticker__track-copy"
        >
          <TickerCard
            v-for="item in dataList"
            :key="item.f12"
            :item="item"
          />
        </div>
        <div
          v-if="isMarqueeEnabled"
          class="global-ticker__track-copy"
        >
          <TickerCard
            v-for="item in dataList"
            :key="item.f12"
            :item="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./GlobalTicker.scss"></style>
