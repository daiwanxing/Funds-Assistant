<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CheckCircle, XCircle } from "lucide-vue-next";

const router = useRouter();

const status = ref<"loading" | "success" | "error">("loading");
const message = ref("");
const title = ref("验证中…");
const actionLabel = ref("前往登录");
const actionTarget = ref("/auth/sign-in");

onMounted(() => {
  // Parse the hash fragment for verification result
  const hash = window.location.hash;
  const [, hashQuery = ""] = hash.split("?");
  const query = new URLSearchParams(hashQuery);

  if (query.get("source") === "oauth" || query.get("reason") === "oauth_callback_failed") {
    const provider = query.get("provider");
    const redirectUrl = query.get("redirectUrl") ?? "/";
    const providerLabel =
      provider === "google" ? "Google" : provider === "github" ? "GitHub" : "第三方账号";

    if (query.get("status") === "success") {
      status.value = "success";
      title.value = "登录成功";
      message.value = `${providerLabel} 登录成功，正在为您跳转…`;
      actionLabel.value = "进入首页";
      actionTarget.value = redirectUrl;

      // 同 Tab 跳转到目标页面
      setTimeout(() => {
        router.push(redirectUrl);
      }, 800);

      return;
    }

    status.value = "error";
    title.value = "登录失败";
    message.value = "第三方登录失败，请返回登录页后重试。";
    actionLabel.value = "前往登录";
    actionTarget.value = "/auth/sign-in";
    return;
  }

  if (hash.includes("error")) {
    status.value = "error";
    title.value = "验证失败";
    // Try to extract error description
    const params = new URLSearchParams(hash.replace(/^#\/?.*?\?/, "").replace(/^#/, ""));
    const errorDesc =
      params.get("error_description") ??
      params.get("error") ??
      "验证失败";
    message.value = decodeURIComponent(errorDesc);
  } else if (hash.includes("access_token") || hash.includes("type=signup")) {
    status.value = "success";
    title.value = "验证成功";
    message.value = "邮箱验证成功！您现在可以登录了。";
  } else {
    // Default: assume success if no error indicator
    status.value = "success";
    title.value = "验证成功";
    message.value = "邮箱验证成功！您现在可以登录了。";
  }
});

const goToSignIn = () => {
  router.push(actionTarget.value);
};
</script>

<template>
  <div class="auth-callback-page">
    <div class="auth-callback-page__card">
      <div class="auth-callback-page__header">
        <div
          class="auth-callback-page__status-icon"
          :class="{
            'auth-callback-page__status-icon--success': status === 'success',
            'auth-callback-page__status-icon--error': status === 'error',
          }"
        >
          <CheckCircle
            v-if="status === 'success'"
            :size="24"
          />
          <XCircle
            v-else-if="status === 'error'"
            :size="24"
          />
          <div
            v-else
            class="auth-callback-page__loader"
          />
        </div>
        <h1 class="auth-callback-page__title">
          {{ title }}
        </h1>
        <p class="auth-callback-page__message">
          {{ message }}
        </p>
      </div>

      <button
        v-if="status !== 'loading'"
        type="button"
        class="auth-callback-page__action"
        @click="goToSignIn"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./CallbackPage.scss"></style>
