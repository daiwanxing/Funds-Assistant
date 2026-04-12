<script setup lang="ts">
import BrandLogo from "@/components/ui/BrandLogo/BrandLogo.vue";
import Globe from "@/pages/Authentication/components/Globe/Globe.vue";
import { useAuthGlobeMarkets } from "@/pages/Authentication/composables/useAuthGlobeMarkets";

const authGlobeMarkets = useAuthGlobeMarkets();
</script>

<template>
  <div class="auth-layout">
    <header class="auth-layout__header">
      <div class="auth-layout__brand">
        <BrandLogo
          class="auth-layout__brand-mark"
          :size="34"
        />
        <span class="auth-layout__brand-name">Funds Assistant</span>
      </div>
    </header>


    <main class="auth-layout__main">
      <section class="auth-layout__hero">
        <div class="auth-layout__hero-stage">
          <div class="auth-layout__hero-copy">
            <h2 class="auth-layout__hero-title">
              See Markets First
            </h2>
            <p class="auth-layout__hero-description">
              聚合全球主要市场信号，助您建立更清晰的基金决策依据。
            </p>
          </div>

          <div class="auth-layout__globe-shell">
            <Globe :items="authGlobeMarkets.items.value" />
          </div>
        </div>
      </section>


      <section class="auth-layout__panel">
        <div class="auth-layout__panel-body">
          <slot />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./AuthLayout.scss"></style>
