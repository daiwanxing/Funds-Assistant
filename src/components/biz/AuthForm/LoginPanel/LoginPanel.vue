<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-vue-next";
import { OAuthButtons } from "../OAuthButtons";

const emit = defineEmits<{
  success: [];
  "go-register": [];
  "go-forgot": [];
}>();


const { signIn } = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const isLoading = computed(() => signIn.isPending);
const isValid = computed(
  () => email.value.trim() !== "" && password.value !== "",
);

const handleSubmit = async () => {
  try {
    await signIn.mutateAsync({
      email: email.value.trim(),
      password: password.value,
    });
    emit("success");
  } catch {
    // 错误已由 http 拦截器统一处理（401 → toast）
  }
};
</script>

<template>
  <div class="login-panel">
    <div class="login-panel__header">
      <h1 class="login-panel__title">
        登录 Funds Assistant
      </h1>
      <p class="login-panel__description">
        登录以开启云端同步
      </p>
    </div>

    <form
      class="login-panel__form"
      @submit.prevent="handleSubmit"
    >
      <div class="login-panel__field">
        <label
          for="auth-form-email"
          class="login-panel__label"
        >邮箱</label>
        <div class="login-panel__input-shell">
          <Mail
            :size="16"
            class="login-panel__input-icon"
          />
          <input
            id="auth-form-email"
            v-model="email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            class="login-panel__input"
          >
        </div>
      </div>

      <div class="login-panel__field">
        <label
          for="auth-form-password"
          class="login-panel__label"
        >密码</label>
        <div class="login-panel__input-shell">
          <Lock
            :size="16"
            class="login-panel__input-icon"
          />
          <input
            id="auth-form-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="输入密码"
            autocomplete="current-password"
            class="login-panel__input"
          >
          <button
            type="button"
            class="login-panel__visibility-button"
            @click="showPassword = !showPassword"
          >
            <Eye
              v-if="!showPassword"
              :size="16"
            />
            <EyeOff
              v-else
              :size="16"
            />
          </button>
        </div>
      </div>

      <div class="login-panel__support">
        <button
          type="button"
          class="login-panel__link-button"
          @click="emit('go-forgot')"
        >
          忘记密码？
        </button>
      </div>

      <button
        type="submit"
        class="login-panel__submit"
        :disabled="!isValid || isLoading"
      >
        <LoaderCircle
          v-if="isLoading"
          :size="18"
          class="login-panel__spinner"
        />
        <span v-else>登录</span>
      </button>
    </form>

    <OAuthButtons />

    <div class="login-panel__footer">
      <span class="login-panel__footer-text">还没有账号？</span>
      <button
        type="button"
        class="login-panel__link-button"
        @click="emit('go-register')"
      >
        注册
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./LoginPanel.scss"></style>
