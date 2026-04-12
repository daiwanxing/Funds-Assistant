<script setup lang="ts">
import { computed } from 'vue';
import { Search, Plus, Check } from 'lucide-vue-next';
import type { SearchFundItem } from '@/composables/fund/useFundSearch';

type HighlightSegment = {
  text: string;
  matched: boolean;
};

const props = defineProps<{
  query: string;
  options: SearchFundItem[];
  loading: boolean;
  addedCodes: string[];
}>();

const emit = defineEmits<{
  (e: 'add', code: string): void;
}>();

const addedKeys = computed(() => {
  return new Set(props.addedCodes);
});

const buildHighlightSegments = (text: string, query: string): HighlightSegment[] => {
  if (!text) {
    return [];
  }

  if (!query) {
    return [{ text, matched: false }];
  }

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');

  return text
    .split(regex)
    .filter(Boolean)
    .map((segment) => ({
      text: segment,
      matched: segment.toLowerCase() === query.toLowerCase(),
    }));
};

const handleAdd = (code: string) => {
  if (!addedKeys.value.has(code)) {
    emit('add', code);
  }
};
</script>

<template>
  <div class="search-fund-list">
    <div
      v-if="!loading && options && options.length > 0"
      class="search-fund-list__summary"
    >
      <div class="search-fund-list__summary-text">
        找到 <span class="search-fund-list__summary-count">{{ options.length }}</span> 个匹配结果 · 点击 + 添加至自选
      </div>
    </div>

    <div class="search-fund-list__body">
      <template v-if="loading">
        <div class="search-fund-list__loading-state">
          <svg
            width="240"
            height="80"
            viewBox="0 0 240 80"
            class="search-fund-list__loading-visual"
          >
            <defs>
              <filter
                id="glowBlur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation="1.5"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="outerGlowBlur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation="3.5"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stop-color="#3B82F6"
                  stop-opacity="0.15"
                />
                <stop
                  offset="100%"
                  stop-color="#3B82F6"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>


            <path
              d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15 L 240 80 L 0 80 Z" 
              fill="url(#areaGradient)"
            />

            <path
              d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15" 
              fill="none"
              class="search-fund-list__loading-track"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- The Drawing Path: 强制 pathLength 使得进度计算与偏移完全 1:1 -->
            <path
              id="searchLineDataPath"
              d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15" 
              fill="none"
              class="search-fund-list__loading-line"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" 
              pathLength="100"
              stroke-dasharray="100"
              stroke-dashoffset="100"
            >
              <animate
                attributeName="stroke-dashoffset" 
                values="100; 0; 0; 100" 
                keyTimes="0; 0.62; 0.80; 1" 
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1" 
                calcMode="spline" 
                dur="2.8s" 
                repeatCount="indefinite"
              />
            </path>



            <circle
              r="9"
              fill="#3B82F6"
              opacity="0.18"
              filter="url(#outerGlowBlur)"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                keyPoints="0; 1; 1; 0"
                keyTimes="0; 0.62; 0.80; 1"
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
                calcMode="spline"
              >
                <mpath href="#searchLineDataPath" />
              </animateMotion>
            </circle>


            <circle
              r="4"
              fill="#60A5FA"
              opacity="0.6"
              filter="url(#glowBlur)"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                keyPoints="0; 1; 1; 0"
                keyTimes="0; 0.62; 0.80; 1"
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
                calcMode="spline"
              >
                <mpath href="#searchLineDataPath" />
              </animateMotion>
            </circle>


            <circle
              r="2"
              fill="#FFFFFF"
              opacity="0.92"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                keyPoints="0; 1; 1; 0"
                keyTimes="0; 0.62; 0.80; 1"
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
                calcMode="spline"
              >
                <mpath href="#searchLineDataPath" />
              </animateMotion>
            </circle>
          </svg>

          <div class="search-fund-list__loading-copy">
            <span class="search-fund-list__loading-title">正在检索基金数据库</span>
            <span class="search-fund-list__loading-description">共收录 10,000+ 只基金 · 实时行情数据</span>
          </div>
        </div>
      </template>

      <template v-else-if="options.length > 0">
        <ul class="search-fund-list__list">
          <li
            v-for="item in options"
            :key="item.value"
            class="search-fund-list__row"
          >
            <div class="search-fund-list__identity">
              <div class="search-fund-list__headline">
                <span class="search-fund-list__name">
                  <template
                    v-for="(segment, index) in buildHighlightSegments(item.label, query)"
                    :key="`${item.value}-label-${index}`"
                  >
                    <span
                      v-if="segment.matched"
                      class="search-fund-list__match"
                    >
                      {{ segment.text }}
                    </span>
                    <template v-else>
                      {{ segment.text }}
                    </template>
                  </template>
                </span>
                <span
                  v-if="item.tag"
                  class="search-fund-list__tag"
                >
                  {{ item.tag }}
                </span>
              </div>
              <span class="search-fund-list__description">
                <template
                  v-for="(segment, index) in buildHighlightSegments(item.desc || '', query)"
                  :key="`${item.value}-desc-${index}`"
                >
                  <span
                    v-if="segment.matched"
                    class="search-fund-list__match"
                  >
                    {{ segment.text }}
                  </span>
                  <template v-else>
                    {{ segment.text }}
                  </template>
                </template>
              </span>
            </div>

            <div class="search-fund-list__metrics">
              <span class="search-fund-list__quote">
                {{ item.gsz ?? '--' }}
              </span>
              <div class="search-fund-list__action-column">
                <template v-if="item.gszzl !== undefined">
                  <span
                    :class="[
                      'search-fund-list__change-badge',
                      item.gszzl >= 0
                        ? 'search-fund-list__change-badge--rise'
                        : 'search-fund-list__change-badge--fall',
                    ]"
                  >
                    {{ item.gszzl >= 0 ? '+' : '' }}{{ item.gszzl.toFixed(2) }}%
                  </span>
                </template>
                <span
                  v-else
                  class="search-fund-list__change-placeholder"
                >--</span>

                <button
                  v-if="addedKeys.has(item.value)"
                  class="search-fund-list__action-button search-fund-list__action-button--added"
                >
                  <Check class="search-fund-list__action-icon" /> 已添加
                </button>
                <button
                  v-else
                  class="search-fund-list__action-button search-fund-list__action-button--add"
                  @click="handleAdd(item.value)"
                >
                  <Plus class="search-fund-list__action-icon" /> 添加
                </button>
              </div>
            </div>
          </li>
        </ul>
      </template>

      <div
        v-else-if="!loading"
        class="search-fund-list__empty-state"
      >
        <Search class="search-fund-list__empty-icon" />
        <span class="search-fund-list__empty-text">未找到任何匹配项</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundSearchList.scss"></style>
