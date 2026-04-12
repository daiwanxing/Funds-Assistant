<script setup lang="ts">
import Toast from "../Toast.vue";
import { useToast } from "@/composables/useToast";

const { toasts, dismiss, pause, resume } = useToast();

// Before leave: capture position relative to viewport container.
// NOTE: viewport must have no transform — transforms shift the
// containing-block origin and break absolute child positioning.
const onBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  const viewportEl = htmlEl.parentElement as HTMLElement;
  const vpRect = viewportEl.getBoundingClientRect();
  const elRect = htmlEl.getBoundingClientRect();
  htmlEl.style.top = `${elRect.top - vpRect.top}px`;
  htmlEl.style.left = `${elRect.left - vpRect.left}px`;
  htmlEl.style.width = `${elRect.width}px`;
};
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      class="toast-container"
      aria-live="polite"
      aria-atomic="false"
      @before-leave="onBeforeLeave"
    >
      <div
        v-for="item in toasts"
        :key="item.id"
        class="toast-container__item"
        @click="dismiss(item.id)"
        @mouseenter="pause(item.id)"
        @mouseleave="resume(item.id)"
      >
        <Toast :item="item" />
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss" src="./ToastContainer.scss"></style>
