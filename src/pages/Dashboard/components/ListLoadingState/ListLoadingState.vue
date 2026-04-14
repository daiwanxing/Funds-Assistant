<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="dashboard-list-loading-state">
    <svg
      width="240"
      height="80"
      viewBox="0 0 240 80"
      class="dashboard-list-loading-state__visual"
    >
      <defs>
        <filter
          id="dashboardListGlowBlur"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="1.5"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="dashboardListOuterGlowBlur"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="3.5"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient
          id="dashboardListAreaGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stop-color="#3B82F6"
            stop-opacity="0.15"
          />
          <stop
            offset="100%"
            stop-color="#3B82F6"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <path
        d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15 L 240 80 L 0 80 Z"
        fill="url(#dashboardListAreaGradient)"
      />

      <path
        d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15"
        fill="none"
        class="dashboard-list-loading-state__track"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        id="dashboardListLoadingPath"
        d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15"
        fill="none"
        class="dashboard-list-loading-state__line"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        pathLength="100"
        stroke-dasharray="100"
        stroke-dashoffset="100"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="100; 0; 0; 100"
          keyTimes="0; 0.62; 0.80; 1"
          keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
          calcMode="spline"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </path>

      <circle
        r="9"
        fill="#3B82F6"
        opacity="0.18"
        filter="url(#dashboardListOuterGlowBlur)"
      >
        <animateMotion
          dur="2.8s"
          repeatCount="indefinite"
          keyPoints="0; 1; 1; 0"
          keyTimes="0; 0.62; 0.80; 1"
          keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
          calcMode="spline"
        >
          <mpath href="#dashboardListLoadingPath" />
        </animateMotion>
      </circle>

      <circle
        r="4"
        fill="#60A5FA"
        opacity="0.6"
        filter="url(#dashboardListGlowBlur)"
      >
        <animateMotion
          dur="2.8s"
          repeatCount="indefinite"
          keyPoints="0; 1; 1; 0"
          keyTimes="0; 0.62; 0.80; 1"
          keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
          calcMode="spline"
        >
          <mpath href="#dashboardListLoadingPath" />
        </animateMotion>
      </circle>

      <circle
        r="2"
        fill="#FFFFFF"
        opacity="0.92"
      >
        <animateMotion
          dur="2.8s"
          repeatCount="indefinite"
          keyPoints="0; 1; 1; 0"
          keyTimes="0; 0.62; 0.80; 1"
          keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
          calcMode="spline"
        >
          <mpath href="#dashboardListLoadingPath" />
        </animateMotion>
      </circle>
    </svg>

    <div class="dashboard-list-loading-state__copy">
      <span class="dashboard-list-loading-state__title">{{ title }}</span>
      <span class="dashboard-list-loading-state__description">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ListLoadingState.scss"></style>
