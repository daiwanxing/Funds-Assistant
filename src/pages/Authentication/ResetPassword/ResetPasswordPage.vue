<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-vue-next";

const router = useRouter();
const { resetPassword } = useAuthStore();

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Recovery tokens from URL hash (Supabase puts them there)
const accessToken = ref("");
const refreshToken = ref("");

onMounted(() => {
  // Parse tokens from hash fragment
  // Format: #access_token=...&refresh_token=...&type=recovery
  const hash = window.location.hash;

  // Also try from the raw hash if it starts with #access_token
  if (hash.includes("access_token=")) {
    const cleanHash = hash.replace(/^#\/?/, "").replace(/^.*?\?/, "");
    const hashParams = new URLSearchParams(cleanHash.includes("access_token") ? cleanHash : hash.slice(1));
    accessToken.value = hashParams.get("access_token") ?? "";
    refreshToken.value = hashParams.get("refresh_token") ?? "";
  }
});

const isLoading = computed(() => resetPassword.isPending);
const isFormValid = computed(
  () => password.value.length >= 6 && password.value === confirmPassword.value,
);
const passwordMismatch = computed(
  () => confirmPassword.value !== "" && password.value !== confirmPassword.value,
);

const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await resetPassword.mutateAsync({
      password: password.value,
      accessToken: accessToken.value || undefined,
      refreshToken: refreshToken.value || undefined,
    });
    successMessage.value = "密码已重置，即将跳转登录页面…";
    setTimeout(() => {
      router.push("/auth/sign-in");
    }, 2000);
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    errorMessage.value =
      axiosError.response?.data?.error?.message ?? "重置失败，请稍后重试";
  }
};
</script>

<template>
  <div class="reset-password-page">
    <div class="reset-password-page__card">
      <div class="reset-password-page__header">
        <div class="reset-password-page__icon">
          <ShieldCheck :size="24" />
        </div>
        <h1 class="reset-password-page__title">
          重置密码
        </h1>
        <p class="reset-password-page__subtitle">
          设置一个新密码
        </p>
      </div>

      <form
        class="reset-password-page__form"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="errorMessage"
          class="reset-password-page__feedback reset-password-page__feedback--error"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="reset-password-page__feedback reset-password-page__feedback--success"
        >
          {{ successMessage }}
        </div>

        <div class="reset-password-page__field">
          <label
            for="reset-password"
            class="reset-password-page__label"
          >新密码</label>
          <div class="reset-password-page__input-shell">
            <Lock
              :size="16"
              class="reset-password-page__input-icon"
            />
            <input
              id="reset-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="至少 6 位"
              autocomplete="new-password"
              class="reset-password-page__input"
            >
            <button
              type="button"
              class="reset-password-page__toggle"
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

        <div class="reset-password-page__field">
          <label
            for="reset-confirm"
            class="reset-password-page__label"
          >确认新密码</label>
          <div class="reset-password-page__input-shell">
            <Lock
              :size="16"
              class="reset-password-page__input-icon"
            />
            <input
              id="reset-confirm"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="再次输入新密码"
              autocomplete="new-password"
              class="reset-password-page__input"
              :class="{ 'reset-password-page__input--error': passwordMismatch }"
            >
          </div>
          <span
            v-if="passwordMismatch"
            class="reset-password-page__field-error"
          >
            两次输入的密码不一致
          </span>
        </div>

        <button
          type="submit"
          class="reset-password-page__submit"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? "重置中…" : "确认重置" }}
        </button>
      </form>

      <div class="reset-password-page__footer">
        <router-link
          to="/auth/sign-in"
          class="reset-password-page__back-link"
        >
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ResetPasswordPage.scss"></style>
