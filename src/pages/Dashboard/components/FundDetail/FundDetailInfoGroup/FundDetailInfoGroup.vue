<script setup lang="ts">
interface InfoGroupItem {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}

defineProps<{
  title: string;
  items: InfoGroupItem[];
}>();
</script>

<template>
  <section class="fund-detail-info-group">
    <h3 class="fund-detail-info-group__title">
      {{ title }}
    </h3>

    <div class="fund-detail-info-group__grid">
      <div
        v-for="item in items"
        :key="item.label"
        class="fund-detail-info-group__item"
      >
        <div class="fund-detail-info-group__label">
          {{ item.label }}
        </div>
        <div
          :class="[
            'fund-detail-info-group__value',
            {
              'fund-detail-info-group__value--default': !item.tone || item.tone === 'default',
              'fund-detail-info-group__value--positive': item.tone === 'positive',
              'fund-detail-info-group__value--negative': item.tone === 'negative',
            },
          ]"
        >
          {{ item.value }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./FundDetailInfoGroup.scss"></style>
