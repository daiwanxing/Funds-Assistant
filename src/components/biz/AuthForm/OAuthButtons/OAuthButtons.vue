<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits<{
  oauth: [provider: "google" | "github"];
}>();

const auth = useAuthStore();

const handleOAuth = (provider: "google" | "github") => {
  auth.startOAuthSignIn(provider);
  emit("oauth", provider);
};
</script>

<template>
  <div class="oauth-buttons">
    <div class="oauth-buttons__divider">
      <div class="oauth-buttons__divider-line" />
      <span class="oauth-buttons__divider-label">或</span>
      <div class="oauth-buttons__divider-line" />
    </div>
    <div
      class="oauth-buttons__list"
    >
      <button
        data-test="oauth-google"
        type="button"
        title="使用 Google 登录"
        class="oauth-icon-btn"
        @click="handleOAuth('google')"
      >
        <img
          src="/google-svgrepo-com.svg"
          alt="Google"
          class="oauth-buttons__icon"
        >
      </button>
      <button
        data-test="oauth-github"
        type="button"
        title="使用 GitHub 登录"
        class="oauth-icon-btn"
        @click="handleOAuth('github')"
      >
        <img
          src="/github-svgrepo-com.svg"
          alt="GitHub"
          class="oauth-buttons__icon"
        >
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./OAuthButtons.scss"></style>
