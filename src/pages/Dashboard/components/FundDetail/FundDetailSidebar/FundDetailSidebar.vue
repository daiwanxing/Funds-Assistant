<script setup lang="ts">
import { computed } from "vue";
import type { FundProfile } from "@/types/fund";

const props = defineProps<{
  profile: FundProfile;
}>();

const navWithDate = computed(() => {
  if (!props.profile.unitNav) return "--";
  if (!props.profile.unitNavDate) return props.profile.unitNav;
  return `${props.profile.unitNav} (${props.profile.unitNavDate})`;
});

const overviewRows = computed(() => {
  return [
    { label: "单位净值", value: navWithDate.value },
    { label: "累计净值", value: props.profile.accumulatedNav ?? "--" },
    { label: "基金类型", value: props.profile.fundType ?? "--" },
    { label: "基金公司", value: props.profile.fundCompany ?? "--" },
    { label: "基金经理", value: props.profile.fundManager ?? "--" },
    { label: "交易状态", value: props.profile.tradeStatus ?? "--" },
    { label: "基金规模", value: props.profile.fundScale ?? "--" },
  ];
});
</script>

<template>
  <aside
    data-test="fund-detail-sidebar"
    class="fund-detail-sidebar"
  >
    <section class="fund-detail-sidebar__section">
      <h3 class="fund-detail-sidebar__title">
        基金概况
      </h3>

      <div class="fund-detail-sidebar__card">
        <div
          v-for="(item, index) in overviewRows"
          :key="item.label"
          :class="[
            'fund-detail-sidebar__row',
            { 'fund-detail-sidebar__row--muted': index % 2 === 0 },
          ]"
        >
          <span class="fund-detail-sidebar__label">
            {{ item.label }}：
          </span>
          <span class="fund-detail-sidebar__value">
            {{ item.value }}
          </span>
        </div>
      </div>
    </section>
  </aside>
</template>

<style scoped lang="scss" src="./FundDetailSidebar.scss"></style>
