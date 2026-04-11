# Fund Detail Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the dashboard fund-detail area into a chart-led layout with a narrow right sidebar and an always-visible bottom holdings strip.

**Architecture:** Keep `FundDetail.vue` as the container that orchestrates detail and holdings data, move the right-column display into focused presentational components, and reshape the existing chart and holdings components to match the new three-part layout. Use component tests first to lock the new structure and key summary fields before changing implementation.

**Tech Stack:** Vue 3 SFCs with `<script setup lang="ts">`, TanStack Query composables, Vitest, Vue Test Utils, UnoCSS utility classes

---

### Task 1: Lock the new detail layout with tests

**Files:**
- Create: `src/__tests__/pages/Dashboard/components/FundDetail.test.ts`
- Create: `src/__tests__/pages/Dashboard/components/FundDetailSidebar.test.ts`
- Check: `src/types/fund.ts`

- [ ] **Step 1: Write failing component tests for the new layout**
- [ ] **Step 2: Run `pnpm test:run src/__tests__/pages/Dashboard/components/FundDetail.test.ts src/__tests__/pages/Dashboard/components/FundDetailSidebar.test.ts` and confirm they fail for the expected missing structure**
- [ ] **Step 3: Keep the assertions focused on the new success-state structure and right-sidebar summary fields**

### Task 2: Refactor the detail container and add sidebar components

**Files:**
- Modify: `src/pages/Dashboard/components/FundDetail/FundDetail.vue`
- Modify: `src/pages/Dashboard/components/FundDetail/FundDetailHero.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundDetailSidebar.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundDetailInfoGroup.vue`
- Modify: `src/pages/Dashboard/components/FundDetail/index.ts`

- [ ] **Step 1: Move success-state layout from `2×2` grid to `hero + main split + bottom strip`**
- [ ] **Step 2: Feed sidebar summary data from the container with explicit props**
- [ ] **Step 3: Keep child components presentational and typed**
- [ ] **Step 4: Run the targeted tests and make them pass**

### Task 3: Reshape chart and holdings presentation

**Files:**
- Modify: `src/pages/Dashboard/components/FundDetail/FundReturnChart.vue`
- Modify: `src/pages/Dashboard/components/FundDetail/FundHoldings.vue`

- [ ] **Step 1: Expand chart visual weight and tighten the chart header controls**
- [ ] **Step 2: Convert holdings from a panel card into a bottom detail strip**
- [ ] **Step 3: Preserve the existing rise/fall semantics and holdings progress visualization**
- [ ] **Step 4: Re-run targeted tests**

### Task 4: Verify project health

**Files:**
- Check: `src/pages/Dashboard/components/FundDetail/*.vue`
- Check: `src/__tests__/pages/Dashboard/components/*.test.ts`

- [ ] **Step 1: Run `pnpm test:run`**
- [ ] **Step 2: Run `pnpm type-check`**
- [ ] **Step 3: Run `pnpm lint`**
- [ ] **Step 4: Summarize changed files, verification evidence, and any remaining risks**
