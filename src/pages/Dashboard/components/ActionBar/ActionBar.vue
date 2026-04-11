<script setup lang="ts">
defineProps<{
  isEdit: boolean;
  isDuring: boolean;
  isLiveUpdate: boolean;
  showCost: boolean;
  showGains: boolean;
  allGains: readonly [number, number];
  allCostGains: readonly [number, number];
}>();

defineEmits<{
  market: [];
  toggleLiveUpdate: [];
  toggleEdit: [];
  settings: [];
  changelog: [];
  reward: [];
  refresh: [];
}>();

const fmtNum = (n: number): string => {
  return parseFloat(String(n)).toLocaleString("zh", {
    minimumFractionDigits: 2,
  });
};

const metricToneClass = (value: number): string => {
  return value >= 0 ? "action-bar__metric--positive" : "action-bar__metric--negative";
};
</script>

<template>
  <div class="action-bar">
    <div class="action-bar__controls">
      <button
        class="action-bar__button"
        @click="$emit('market')"
      >
        行情中心
      </button>
      <button
        v-if="isDuring"
        class="action-bar__button"
        @click="$emit('toggleLiveUpdate')"
      >
        {{ isLiveUpdate ? "暂停更新" : "实时更新" }}
      </button>
      <button
        v-if="!isDuring"
        class="action-bar__button action-bar__button--muted"
      >
        休市中
      </button>
      <button
        class="action-bar__button"
        @click="$emit('toggleEdit')"
      >
        {{ isEdit ? "完成编辑" : "编辑" }}
      </button>
      <button
        class="action-bar__button"
        @click="$emit('settings')"
      >
        设置
      </button>
      <button
        class="action-bar__button"
        @click="$emit('changelog')"
      >
        日志
      </button>
      <button
        class="action-bar__button action-bar__button--reward"
        @click="$emit('reward')"
      >
        打赏
      </button>
    </div>

    <div
      v-if="showCost || showGains"
      class="action-bar__summary"
    >
      <button
        v-if="showGains"
        :class="[
          'action-bar__metric',
          metricToneClass(allGains[0]),
        ]"
      >
        日收益：{{ fmtNum(allGains[0]) }}{{ isNaN(allGains[1]) ? "" : `（${allGains[1]}%）` }}
      </button>
      <button
        v-if="showCost"
        :class="[
          'action-bar__metric',
          metricToneClass(allCostGains[0]),
        ]"
      >
        持有收益：{{ fmtNum(allCostGains[0]) }}{{ isNaN(allCostGains[1]) ? "" : `（${allCostGains[1]}%）` }}
      </button>
    </div>

    <button
      class="action-bar__refresh"
      @click="$emit('refresh')"
    >
      <span class="action-bar__refresh-icon i-carbon-renew" />
    </button>
  </div>
</template>

<style scoped lang="scss" src="./ActionBar.scss"></style>
