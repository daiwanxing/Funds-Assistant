<script setup lang="ts">
import type { DropdownItemProps } from "../types";

const props = defineProps<DropdownItemProps>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (e: MouseEvent) => {
  if (props.disabled) return;
  emit("click", e);
};
</script>

<template>
  <button
    class="dropdown-item"
    :class="{
      'is-active': active,
      'is-danger': danger,
      'is-disabled': disabled,
    }"
    type="button"
    :disabled="disabled"
    :aria-current="active ? 'true' : undefined"
    @click="handleClick"
  >
    <span
      v-if="icon || $slots.icon"
      class="dropdown-item__icon"
    >
      <slot name="icon">
        <component
          :is="icon"
          :size="15"
          :stroke-width="1.8"
        />
      </slot>
    </span>


    <span class="dropdown-item__label">
      <slot>{{ label }}</slot>
    </span>


    <span
      v-if="badge || shortcut || $slots.suffix"
      class="dropdown-item__suffix"
    >
      <slot name="suffix">
        <span
          v-if="badge"
          class="dropdown-item__badge"
        >{{ badge }}</span>
        <kbd
          v-else-if="shortcut"
          class="dropdown-item__shortcut"
        >{{ shortcut }}</kbd>
      </slot>
    </span>
  </button>
</template>

<style scoped lang="scss" src="./DropdownItem.scss"></style>
