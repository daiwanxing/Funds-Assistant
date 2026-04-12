<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-vue-next";
import { PASSWORD_RE } from "@/constants";
import { OAuthButtons } from "../OAuthButtons";

const emit = defineEmits<{
  "go-login": [];
}>();

const { signUp, resendVerification } = useAuthStore();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const success = ref("");
const isRegistered = ref(false);

const isLoading = computed(() => signUp.isPending);
const isPasswordStrong = computed(() => PASSWORD_RE.test(password.value));
const passwordWeak = computed(
  () => password.value !== "" && !isPasswordStrong.value,
);
const isValid = computed(
  () =>
    email.value.trim() !== "" &&
    isPasswordStrong.value &&
    password.value === confirmPassword.value,
);
const passwordMismatch = computed(
  () =>
    confirmPassword.value !== "" &&
    password.value !== confirmPassword.value,
);

const handleSubmit = async () => {
  success.value = "";
  try {
    await signUp.mutateAsync({
      email: email.value.trim(),
      password: password.value,
    });
    success.value = "注册成功！请前往邮箱完成验证后再登录。";
    isRegistered.value = true;
  } catch {
    // 错误已由 http 拦截器统一 toast 处理
  }
};

const handleResend = async () => {
  try {
    await resendVerification.mutateAsync({ email: email.value.trim() });
    success.value = "验证邮件已重新发送，请检查您的邮箱。";
  } catch {
    // 错误已由 http 拦截器统一 toast 处理
  }
};

/** 父组件切走时调用，重置内部状态 */
const reset = () => {
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  showPassword.value = false;
  success.value = "";
  isRegistered.value = false;
};

defineExpose({ reset });
</script>

<template>
  <div class="register-panel">
    <div class="register-panel__header">
      <h1 class="register-panel__title">
        注册 Funds Assistant
      </h1>
      <p class="register-panel__description">
        创建账号以开启云端同步
      </p>
    </div>

    <template v-if="!isRegistered">
      <form
        class="register-panel__form"
        @submit.prevent="handleSubmit"
      >
        <div class="register-panel__field">
          <label
            for="auth-form-reg-email"
            class="register-panel__label"
          >邮箱</label>
          <div class="register-panel__input-shell">
            <Mail
              :size="16"
              class="register-panel__input-icon"
            />
            <input
              id="auth-form-reg-email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              autocomplete="email"
              class="register-panel__input"
            >
          </div>
        </div>

        <div class="register-panel__field">
          <label
            for="auth-form-reg-password"
            class="register-panel__label"
          >密码</label>
          <div class="register-panel__input-shell">
            <Lock
              :size="16"
              class="register-panel__input-icon"
            />
            <input
              id="auth-form-reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="至少 9 位，含字母和数字"
              autocomplete="new-password"
              class="register-panel__input"
              :class="{ 'register-panel__input--danger': passwordWeak }"
            >
            <button
              type="button"
              class="register-panel__visibility-button"
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
          <span
            v-if="passwordWeak"
            class="register-panel__hint register-panel__hint--warning"
          >
            密码需至少 9 位，且同时包含字母和数字
          </span>
        </div>

        <div class="register-panel__field">
          <label
            for="auth-form-reg-confirm"
            class="register-panel__label"
          >确认密码</label>
          <div class="register-panel__input-shell">
            <Lock
              :size="16"
              class="register-panel__input-icon"
            />
            <input
              id="auth-form-reg-confirm"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="再次输入密码"
              autocomplete="new-password"
              class="register-panel__input"
              :class="{ 'register-panel__input--danger': passwordMismatch }"
            >
          </div>
          <span
            v-if="passwordMismatch"
            class="register-panel__hint register-panel__hint--danger"
          >
            两次输入的密码不一致
          </span>
        </div>

        <button
          type="submit"
          class="register-panel__submit"
          :disabled="!isValid || isLoading"
        >
          <LoaderCircle
            v-if="isLoading"
            :size="18"
            class="register-panel__spinner"
          />
          <span v-else>注册</span>
        </button>
      </form>
    </template>

    <template v-else>
      <div class="register-panel__success">
        <div class="register-panel__message register-panel__message--success">
          注册成功！请前往邮箱完成验证后再登录。
        </div>
        <button
          type="button"
          class="register-panel__secondary-action"
          :disabled="resendVerification.isPending"
          @click="handleResend"
        >
          {{ resendVerification.isPending ? "发送中…" : "重新发送验证邮件" }}
        </button>
        <button
          type="button"
          class="register-panel__link-button"
          @click="emit('go-login')"
        >
          前往登录
        </button>
      </div>
    </template>

    <OAuthButtons />

    <div class="register-panel__footer">
      <span class="register-panel__footer-text">已有账号？</span>
      <button
        type="button"
        class="register-panel__link-button"
        @click="emit('go-login')"
      >
        登录
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./RegisterPanel.scss"></style>
