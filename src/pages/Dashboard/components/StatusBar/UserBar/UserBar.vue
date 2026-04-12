<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Ellipsis, User, LogOut, LoaderCircle } from "lucide-vue-next";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Dialog } from "@/components/ui/Dialog";
import BrandLogo from "@/components/ui/BrandLogo/BrandLogo.vue";

const emit = defineEmits<{
  (e: "login"): void;
}>();

const auth = useAuthStore();

const showLogoutDialog = ref(false);

const isLoggingOut = computed(() => auth.signOut.isPending);

const handleProfileClick = () => {
  console.error("Navigate to profile...");
};

const handleLogoutClick = () => {
  showLogoutDialog.value = true;
};

const confirmLogout = async () => {
  await auth.signOut.mutateAsync();
  showLogoutDialog.value = false;
};
</script>

<template>
  <div
    :class="[
      'user-bar',
      auth.isAuthenticated ? 'user-bar--account' : 'user-bar--guest',
    ]"
  >
    <div
      v-if="auth.isAuthenticated"
      class="user-bar__account"
    >
      <div class="user-bar__identity">
        <div class="user-bar__avatar">
          <img
            v-if="auth.avatarUrl"
            :src="auth.avatarUrl"
            class="user-bar__avatar-image"
            alt="avatar"
          >
          <div
            v-else
            class="user-bar__avatar-fallback"
          >
            {{ (auth.nickname || auth.email || 'U').charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="user-bar__profile">
          <span class="user-bar__name">
            {{ auth.nickname || 'wanxing dai' }}
          </span>
          <span class="user-bar__meta">
            <span class="user-bar__meta-value">¥0</span>
          </span>
        </div>
      </div>

      <Dropdown
        placement="top-end"
        trigger="click"
      >
        <template #trigger>
          <button class="user-bar__menu-trigger">
            <Ellipsis class="user-bar__menu-icon" />
          </button>
        </template>

        <DropdownItem
          :icon="User"
          label="个人中心"
          @click="handleProfileClick"
        />
        <DropdownItem
          :icon="LogOut"
          label="退出登录"
          danger
          @click="handleLogoutClick"
        />
      </Dropdown>
    </div>

    <button
      v-else
      class="user-bar__guest-button"
      @click="emit('login')"
    >
      <div class="user-bar__guest-flow" />

      <div class="user-bar__guest-glow" />
      <div class="user-bar__guest-line" />
      <div class="user-bar__guest-copy">
        <BrandLogo
          :size="24"
          class="user-bar__guest-logo"
        />
        <span class="user-bar__guest-text">登录解锁全部功能</span>
      </div>

      <div class="user-bar__guest-action user-bar__guest-action--text">
        登录
      </div>
    </button>
  </div>

  <Dialog
    v-model:open="showLogoutDialog"
    hide-header
    size="auto"
    tone="inverse"
  >
    <div class="user-bar__logout-dialog">
      <div class="user-bar__logout-brand">
        <BrandLogo
          :size="40"
          class="user-bar__logout-logo"
        />
      </div>

      <h2 class="user-bar__logout-title">
        登出当前账号？
      </h2>

      <p class="user-bar__logout-description">
        退出后将丢失数据云端同步
      </p>

      <div class="user-bar__logout-actions">
        <button
          class="user-bar__logout-button user-bar__logout-button--primary"
          :disabled="isLoggingOut"
          @click="confirmLogout"
        >
          <LoaderCircle
            v-if="isLoggingOut"
            :size="18"
            class="user-bar__logout-spinner"
          />
          <span v-else>登出</span>
        </button>
        <button
          class="user-bar__logout-button user-bar__logout-button--secondary"
          :disabled="isLoggingOut"
          @click="showLogoutDialog = false"
        >
          取消
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss" src="./UserBar.scss"></style>
