# Dashboard SCSS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the visible Dashboard page from mixed UnoCSS utility styling to semantic, maintainable SCSS with one stylesheet per component, strict BEM naming, and shared color tokens.

**Architecture:** Keep color tokens centralized as CSS variables, keep SCSS responsible for structure and reuse, and move Dashboard-visible components to external `scss` files referenced by their Vue SFCs. Preserve current layout and behavior while replacing utility-heavy templates with semantic BEM classes.

**Tech Stack:** Vue 3 SFCs, SCSS (`sass`), Vitest, Vue Test Utils, Vite

---

### Task 1: Lock the new Dashboard class contract with tests

**Files:**
- Create: `src/__tests__/pages/Dashboard/dashboardClassNames.test.ts`

- [ ] Add tests that assert the new semantic class contract for the Dashboard shell and representative visible components.
- [ ] Run the targeted Vitest file and confirm it fails before any template changes.

### Task 2: Add SCSS compilation support and shared styling helpers

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/styles/tokens.css`
- Create: `src/styles/_mixins.scss`

- [ ] Add the `sass` dev dependency required by Vue SFC external `scss` files.
- [ ] Expand `src/styles/tokens.css` with semantic color aliases while preserving existing variables used elsewhere.
- [ ] Add a small shared SCSS helper file for reusable patterns such as button reset, truncation, focus treatment, and panel surfaces.

### Task 3: Migrate the Dashboard page shell and left rail to semantic SCSS

**Files:**
- Modify: `src/pages/Dashboard/HomePage.vue`
- Create: `src/pages/Dashboard/HomePage.scss`
- Modify: `src/pages/Dashboard/components/WatchlistHeader.vue`
- Create: `src/pages/Dashboard/components/WatchlistHeader.scss`
- Modify: `src/pages/Dashboard/components/FundSavedList.vue`
- Create: `src/pages/Dashboard/components/FundSavedList.scss`
- Modify: `src/pages/Dashboard/components/FundSearchList.vue`
- Create: `src/pages/Dashboard/components/FundSearchList.scss`
- Modify: `src/pages/Dashboard/components/StatusBar/UserBar.vue`
- Create: `src/pages/Dashboard/components/StatusBar/UserBar.scss`

- [ ] Replace utility-heavy classes with semantic BEM classes for the page shell and left-side visible components.
- [ ] Keep layout dimensions aligned with the current Dashboard baseline.
- [ ] Keep interactive states readable and centralized in SCSS instead of inline utility strings.

### Task 4: Migrate the Dashboard ticker and detail region to semantic SCSS

**Files:**
- Modify: `src/pages/Dashboard/components/GlobalTicker/GlobalTicker.vue`
- Create: `src/pages/Dashboard/components/GlobalTicker/GlobalTicker.scss`
- Modify: `src/pages/Dashboard/components/GlobalTicker/TickerCard.vue`
- Create: `src/pages/Dashboard/components/GlobalTicker/TickerCard.scss`
- Modify: `src/pages/Dashboard/components/FundDetail/FundDetail.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundDetail.scss`
- Modify: `src/pages/Dashboard/components/FundDetail/FundDetailHero.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundDetailHero.scss`
- Modify: `src/pages/Dashboard/components/FundDetail/FundReturnChart.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundReturnChart.scss`
- Modify: `src/pages/Dashboard/components/FundDetail/FundDetailOverviewRail.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundDetailOverviewRail.scss`
- Modify: `src/pages/Dashboard/components/FundDetail/FundAnalysisPanel.vue`
- Create: `src/pages/Dashboard/components/FundDetail/FundAnalysisPanel.scss`

- [ ] Convert the right-side visible Dashboard components to semantic BEM markup and external SCSS files.
- [ ] Preserve chart sizing, detail header spacing, overview rail layout, and holdings analysis structure.
- [ ] Keep runtime color-driven states based on data, but route their visual values through CSS tokens.

### Task 5: Verify the migration end to end

**Files:**
- Verify only

- [ ] Run the targeted Dashboard Vitest files and confirm the new class contract passes.
- [ ] Run `pnpm type-check`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test:run`.
- [ ] Check the Dashboard in the browser at `http://localhost:4310/#/` to confirm layout and visible styling remain aligned with the current baseline.
