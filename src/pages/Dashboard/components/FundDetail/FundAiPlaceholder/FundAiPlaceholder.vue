<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
</script>

<template>
  <div class="fund-ai-placeholder">
    <span class="fund-ai-placeholder__title">
      AI 分析
    </span>
    <div class="fund-ai-placeholder__body">
      <div class="fund-ai-placeholder__icon-shell">
        <Sparkles
          class="fund-ai-placeholder__icon"
          :stroke-width="1.5"
        />
      </div>
      <div class="fund-ai-placeholder__copy">
        <p class="fund-ai-placeholder__headline">
          AI 分析功能开发中
        </p>
        <p class="fund-ai-placeholder__caption">
          Coming Soon
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundAiPlaceholder.scss"></style>
