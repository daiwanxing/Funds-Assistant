<script setup lang="ts">
import { CloudUpload, X } from "lucide-vue-next";

defineProps<{
  open: boolean;
  guestCount: number;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="guest-import-dialog">
      <div
        v-if="open"
        class="guest-import-dialog"
        @click.self="emit('cancel')"
      >
        <div class="guest-import-dialog__card">
          <button
            type="button"
            class="guest-import-dialog__close-button"
            aria-label="关闭"
            @click="emit('cancel')"
          >
            <X :size="16" />
          </button>

          <div class="guest-import-dialog__icon">
            <CloudUpload :size="28" />
          </div>

          <h2 class="guest-import-dialog__title">
            导入本地自选基金
          </h2>
          <p class="guest-import-dialog__message">
            检测到您当前浏览器中有
            <strong>{{ guestCount }}</strong>
            只自选基金，是否将其导入到您的账号中？
          </p>

          <div class="guest-import-dialog__actions">
            <button
              type="button"
              class="guest-import-dialog__action-button guest-import-dialog__action-button--secondary"
              @click="emit('cancel')"
            >
              暂不导入
            </button>
            <button
              type="button"
              class="guest-import-dialog__action-button guest-import-dialog__action-button--primary"
              @click="emit('confirm')"
            >
              确认导入
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss" src="./GuestImportDialog.scss"></style>
