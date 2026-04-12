<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from "vue";
import { Bell, CircleCheck, CircleX, Info } from "lucide-vue-next";
import type { ToastItem } from "@/composables/useToast";

const props = defineProps<{ item: ToastItem }>();

const iconMap = {
  default: Bell,
  success: CircleCheck,
  error: CircleX,
  warning: Info,
  info: Info,
} as const;

const icon = computed(() => iconMap[props.item.type]);
</script>

<template>
  <div
    class="toast"
    :class="`toast--${item.type}`"
  >
    <component
      :is="icon"
      class="toast__icon"
      :size="18"
      :stroke-width="2.5"
    />
    <span class="toast__message">{{ item.message }}</span>
  </div>
</template>

<style scoped lang="scss" src="./Toast.scss"></style>
