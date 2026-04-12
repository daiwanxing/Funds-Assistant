<script setup lang="ts">
import type { DropdownGroupProps } from "./types";

defineProps<DropdownGroupProps>();
</script>

<template>
  <div class="dropdown-group">
    <div
      v-if="label"
      class="dropdown-group__label"
    >
      {{ label }}
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss" src="./DropdownGroup.scss"></style>
