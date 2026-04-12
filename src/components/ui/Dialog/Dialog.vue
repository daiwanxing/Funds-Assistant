<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { AnimatePresence, motion } from "motion-v";
import { X } from "lucide-vue-next";

import type { DialogProps } from "./types";
const props = withDefaults(defineProps<DialogProps>(), {
  size: "md",
  title: undefined,
  closeOnBackdropClick: true,
  closeOnEsc: true,
  hideHeader: false,
  panelClass: "",
});

const open = defineModel<boolean>("open", { default: false });


let savedOverflow = "";

watch(open, (val) => {
  if (val) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = savedOverflow;
  }
});


const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.closeOnEsc && open.value) {
    open.value = false;
  }
};

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  // Ensure scroll is restored if component unmounts while open
  if (open.value) document.body.style.overflow = savedOverflow;
});


const onBackdropClick = () => {
  if (props.closeOnBackdropClick) open.value = false;
};


const sizeMap = {
  sm: "360px",
  md: "480px",
  lg: "640px",
  auto: "auto",
};
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        key="dialog-backdrop"
        class="dialog-backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="onBackdropClick"
      >
        <motion.div
          key="dialog-panel"
          class="dialog-panel"
          :class="[panelClass, { 'dialog-panel--headerless': hideHeader }]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'dialog-title' : undefined"
          :style="{ '--dialog-width': sizeMap[size ?? 'md'] }"
          :initial="{ opacity: 0, y: 20, scale: 0.96 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 12, scale: 0.97 }"
          :transition="{
            type: 'spring',
            stiffness: 420,
            damping: 30,
            mass: 0.9,
          }"
          @click.stop
        >
          <div 
            v-if="!hideHeader" 
            class="dialog-header"
          >
            <button
              id="dialog-close-btn"
              class="dialog-close-btn"
              type="button"
              aria-label="关闭"
              @click="open = false"
            >
              <X
                :size="16"
                :stroke-width="2.5"
              />
            </button>

            <slot name="header">
              <h2
                v-if="title"
                id="dialog-title"
                class="dialog-title"
              >
                {{ title }}
              </h2>
            </slot>
          </div>


          <div 
            class="dialog-content"
          >
            <slot />
          </div>


          <div
            v-if="$slots.footer"
            class="dialog-footer"
          >
            <slot name="footer" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped lang="scss" src="./Dialog.scss"></style>
