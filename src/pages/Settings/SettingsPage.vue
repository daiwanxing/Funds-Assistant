<script setup lang="ts">
import { shallowRef, useTemplateRef } from "vue";
import SettingsSidebar from "./components/SettingsSidebar.vue";

type SettingsSection = "holdings" | "preferences";

type SettingsNavItem = {
  key: SettingsSection;
  label: string;
  hint: string;
};

const navItems: SettingsNavItem[] = [
  {
    key: "holdings",
    label: "我的持仓",
    hint: "",
  },
  {
    key: "preferences",
    label: "偏好设置",
    hint: "",
  },
];

const activeSection = shallowRef<SettingsSection>("holdings");
const holdingsSection = useTemplateRef<HTMLElement>("holdingsSection");
const preferencesSection = useTemplateRef<HTMLElement>("preferencesSection");

const handleSectionChange = (section: SettingsSection) => {
  activeSection.value = section;

  const target = section === "holdings" ? holdingsSection.value : preferencesSection.value;
  target?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
</script>

<template>
  <div class="settings-page">
    <div class="settings-page__layout">
      <SettingsSidebar
        :items="navItems"
        :active-key="activeSection"
        @change="handleSectionChange"
      />

      <main class="settings-page__content">
        <header class="settings-page__hero">
          <span class="settings-page__eyebrow">Account</span>
          <h1
            class="settings-page__title"
            data-test="settings-page-title"
          >
            个人中心
          </h1>
          <p class="settings-page__description">
            用单页方式承接账户相关内容，左侧导航只负责定位到对应区块。
          </p>
        </header>

        <section
          ref="holdingsSection"
          class="settings-page__section"
          data-test="settings-section-holdings"
        >
          <h2 class="settings-page__section-title">
            我的持仓
          </h2>
          <p class="settings-page__section-description">
            这里是我的持仓内容占位。
          </p>
          <p class="settings-page__section-copy">
            后续持仓相关信息会补充到这个区块。
          </p>
        </section>

        <section
          ref="preferencesSection"
          class="settings-page__section"
          data-test="settings-section-preferences"
        >
          <h2 class="settings-page__section-title">
            偏好设置
          </h2>
          <p class="settings-page__section-description">
            这里是偏好设置内容占位。
          </p>
          <p class="settings-page__section-copy">
            后续展示与账户偏好会补充到这个区块。
          </p>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  padding: 24px 32px 64px;
  background: var(--bg-0);

  &__layout {
    display: grid;
    grid-template-columns: 240px minmax(0, 820px);
    gap: 48px;
    align-items: start;
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
  }

  &__content {
    min-width: 0;
  }

  &__hero {
    padding: 8px 0 28px;
  }

  &__eyebrow {
    color: var(--text-tertiary);
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  &__title {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 600;
  }

  &__description {
    margin-top: 8px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  &__section {
    padding: 0 0 40px;
    margin-bottom: 40px;
    border-bottom: 1px solid var(--border-subtle);
    scroll-margin-top: 24px;
  }

  &__section-title {
    font-size: 18px;
    font-weight: 600;
  }

  &__section-description {
    margin-top: 10px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  &__section-copy {
    margin-top: 12px;
    color: var(--text-tertiary);
    font-size: 14px;
    line-height: 1.7;
  }
}

@media (max-width: 960px) {
  .settings-page {
    padding: 16px;

    &__layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
}
</style>
