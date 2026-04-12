<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, LoaderCircle } from "lucide-vue-next";

const emit = defineEmits<{
  "go-login": [];
}>();

const { forgotPassword } = useAuthStore();

const email = ref("");
const success = ref("");

const isLoading = computed(() => forgotPassword.isPending);
const isValid = computed(() => email.value.trim() !== "");

const handleSubmit = async () => {
  success.value = "";
  try {
    const result = await forgotPassword.mutateAsync({ email: email.value.trim() });
    success.value = result.message ?? "如果该邮箱已注册，您将收到重置密码邮件";
  } catch {
    // 错误已由 http 拦截器统一 toast 处理
  }
};

/** 父组件切走时调用，重置内部状态 */
const reset = () => {
  email.value = "";
  success.value = "";
};

defineExpose({ reset });
</script>

<template>
  <div class="forgot-panel">
    <div class="forgot-panel__header">
      <h1 class="forgot-panel__title">
        找回密码
      </h1>
      <p class="forgot-panel__description">
        输入注册邮箱，我们将发送重置链接
      </p>
    </div>

    <form
      class="forgot-panel__form"
      @submit.prevent="handleSubmit"
    >
      <div
        v-if="success"
        class="forgot-panel__message"
      >
        {{ success }}
      </div>

      <div class="forgot-panel__field">
        <label
          for="auth-form-forgot-email"
          class="forgot-panel__label"
        >邮箱</label>
        <div class="forgot-panel__input-shell">
          <Mail
            :size="16"
            class="forgot-panel__input-icon"
          />
          <input
            id="auth-form-forgot-email"
            v-model="email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            class="forgot-panel__input"
          >
        </div>
      </div>

      <button
        type="submit"
        class="forgot-panel__submit"
        :disabled="!isValid || isLoading"
      >
        <LoaderCircle
          v-if="isLoading"
          :size="18"
          class="forgot-panel__spinner"
        />
        <span v-else>发送重置链接</span>
      </button>
    </form>

    <div class="forgot-panel__footer">
      <button
        type="button"
        class="forgot-panel__link-button"
        @click="emit('go-login')"
      >
        返回登录
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ForgotPanel.scss"></style>
