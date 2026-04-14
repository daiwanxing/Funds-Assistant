<script setup lang="ts">
type SettingsSection = "holdings" | "preferences";

type SettingsNavItem = {
  key: SettingsSection;
  label: string;
  hint: string;
};

defineProps<{
  items: SettingsNavItem[];
  activeKey: SettingsSection;
}>();

const emit = defineEmits<{
  change: [section: SettingsSection];
}>();

const handleClick = (section: SettingsSection) => {
  emit("change", section);
};
</script>

<template>
  <aside class="settings-sidebar">
    <div class="settings-sidebar__profile">
      <div class="settings-sidebar__avatar">
        个
      </div>
      <div class="settings-sidebar__profile-copy">
        <span class="settings-sidebar__eyebrow">个人中心</span>
        <strong class="settings-sidebar__name">导航</strong>
        <span class="settings-sidebar__meta">单页滚动布局</span>
      </div>
    </div>

    <nav
      class="settings-sidebar__nav"
      aria-label="个人中心菜单"
    >
      <button
        v-for="item in items"
        :key="item.key"
        :data-test="`settings-sidebar-item-${item.key}`"
        type="button"
        class="settings-sidebar__item"
        :class="{ 'settings-sidebar__item--active': item.key === activeKey }"
        @click="handleClick(item.key)"
      >
        <span class="settings-sidebar__item-label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.settings-sidebar {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-self: start;
  padding: 8px 0 0;

  &__profile {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 10px;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
  }

  &__profile-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__eyebrow,
  &__meta {
    color: var(--text-tertiary);
    font-size: 12px;
  }

  &__eyebrow {
    letter-spacing: 0.08em;
  }

  &__name {
    color: var(--text-primary);
    font-size: 17px;
    font-weight: 600;
  }

  &__meta {
    margin-top: 2px;
    line-height: 1.45;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--border-subtle);
  }

  &__item {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: var(--text-primary);
    text-align: left;
    transition: background-color 0.18s ease;
  }

  &__item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &__item--active {
    background: rgba(255, 255, 255, 0.05);
  }

  &__item-label {
    font-size: 15px;
    font-weight: 500;
  }
}

@media (max-width: 960px) {
  .settings-sidebar {
    position: static;
  }
}
</style>
