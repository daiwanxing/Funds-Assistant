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
  <section class="px-1">
    <h3 class="mb-2.5 text-[11px] text-white/28 font-sans tracking-[0.18em]">
      {{ title }}
    </h3>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="item in items"
        :key="item.label"
        class="rounded-[16px] border border-white/[0.04] bg-[rgba(255,255,255,0.02)] px-3 py-2.5"
      >
        <div class="mb-1 text-[10px] text-white/22 font-sans tracking-wide">
          {{ item.label }}
        </div>
        <div
          class="text-[12px] font-mono font-semibold break-words"
          :class="{
            'text-white/86': !item.tone || item.tone === 'default',
            'text-up': item.tone === 'positive',
            'text-down': item.tone === 'negative',
          }"
        >
          {{ item.value }}
        </div>
      </div>
    </div>
  </section>
</template>
