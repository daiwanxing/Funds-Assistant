<script setup lang="ts">
import type { FundItem } from "@/types";

const props = defineProps<{
  dataList: FundItem[];
  isEdit: boolean;
  darkMode: boolean;
  loadingList: boolean;
  showGSZ: boolean;
  showAmount: boolean;
  showGains: boolean;
  showCost: boolean;
  showCostRate: boolean;
  badgeContent: number;
  realtimeFundcode: string | null;
  sortType: Record<string, string>;
}>();

defineEmits<{
  fundDetail: [item: FundItem];
  sort: [type: string];
  delete: [id: string];
  select: [id: string];
  changeNum: [item: FundItem];
  changeCost: [item: FundItem];
  dragStart: [e: DragEvent, item: FundItem];
  dragOver: [e: DragEvent, item: FundItem];
  dragEnter: [e: DragEvent, item: FundItem, index: number];
  dragEnd: [e: DragEvent, item: FundItem];
}>();

const fmtLocale = (n: number | string): string => {
  return parseFloat(String(n)).toLocaleString("zh", {
    minimumFractionDigits: 2,
  });
};

const sortIndicator = (value?: string): string => {
  return value === "desc" ? "↓" : value === "asc" ? "↑" : "";
};

const valueToneClass = (value: number): string => {
  return value >= 0 ? "fund-table__cell--positive" : "fund-table__cell--negative";
};

const rowStateClass = (isEdit: boolean): string => {
  return isEdit ? "fund-table__row--editable" : "fund-table__row--interactive";
};

const rowNameClass = (isEdit: boolean): string => {
  return isEdit ? "fund-table__name-cell" : "fund-table__name-cell fund-table__name-cell--link";
};

const focusButtonClass = (isActive: boolean): string => {
  return isActive
    ? "fund-table__icon-button fund-table__icon-button--active"
    : "fund-table__icon-button";
};
</script>

<template>
  <div
    v-loading="loadingList"
    :element-loading-background="
      darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'
    "
    class="fund-table"
  >
    <table class="fund-table__table">
      <thead class="fund-table__head">
        <tr class="fund-table__head-row">
          <th class="fund-table__head-cell fund-table__head-cell--name">
            基金名称（{{ dataList.length }}）
          </th>
          <th
            v-if="isEdit"
            class="fund-table__head-cell"
          >
            基金代码
          </th>
          <th
            v-if="showGSZ && !isEdit"
            class="fund-table__head-cell"
          >
            估算净值
          </th>
          <th
            v-if="isEdit && (showCostRate || showCost)"
            class="fund-table__head-cell fund-table__head-cell--center"
          >
            成本价
          </th>
          <th
            v-if="showAmount"
            class="fund-table__head-cell fund-table__head-cell--sortable"
            @click="$emit('sort', 'amount')"
          >
            持有额
            <span class="fund-table__sort-indicator">{{ sortIndicator(props.sortType.amount) }}</span>
          </th>
          <th
            v-if="showCost"
            class="fund-table__head-cell fund-table__head-cell--sortable"
            @click="$emit('sort', 'costGains')"
          >
            持有收益
            <span class="fund-table__sort-indicator">{{ sortIndicator(props.sortType.costGains) }}</span>
          </th>
          <th
            v-if="showCostRate"
            class="fund-table__head-cell fund-table__head-cell--sortable"
            @click="$emit('sort', 'costGainsRate')"
          >
            持有收益率
            <span class="fund-table__sort-indicator">{{ sortIndicator(props.sortType.costGainsRate) }}</span>
          </th>
          <th
            class="fund-table__head-cell fund-table__head-cell--sortable"
            @click="$emit('sort', 'gszzl')"
          >
            涨跌幅
            <span class="fund-table__sort-indicator">{{ sortIndicator(props.sortType.gszzl) }}</span>
          </th>
          <th
            v-if="showGains"
            class="fund-table__head-cell fund-table__head-cell--sortable"
            @click="$emit('sort', 'gains')"
          >
            估算收益
            <span class="fund-table__sort-indicator">{{ sortIndicator(props.sortType.gains) }}</span>
          </th>
          <th
            v-if="!isEdit"
            class="fund-table__head-cell"
          >
            更新时间
          </th>
          <th
            v-if="isEdit && (showAmount || showGains || showCost || showCostRate)"
            class="fund-table__head-cell fund-table__head-cell--center"
          >
            持有份额
          </th>
          <th
            v-if="isEdit && badgeContent === 1"
            class="fund-table__head-cell"
          >
            特别关注
          </th>
          <th
            v-if="isEdit"
            class="fund-table__head-cell"
          >
            删除
          </th>
        </tr>
      </thead>

      <tbody class="fund-table__body">
        <tr
          v-for="(el, index) in dataList"
          :key="el.fundcode"
          :draggable="isEdit"
          :class="['fund-table__row', rowStateClass(isEdit)]"
          @dragstart="$emit('dragStart', $event, el)"
          @dragover.prevent="$emit('dragOver', $event, el)"
          @dragenter="$emit('dragEnter', $event, el, index)"
          @dragend="$emit('dragEnd', $event, el)"
        >
          <td
            :class="rowNameClass(isEdit)"
            :title="el.name"
            @click.stop="!isEdit && $emit('fundDetail', el)"
          >
            <span
              v-if="el.hasReplace"
              class="fund-table__replace-badge"
            >✔</span>{{ el.name }}
          </td>

          <td
            v-if="isEdit"
            class="fund-table__cell"
          >
            {{ el.fundcode }}
          </td>

          <td
            v-if="showGSZ && !isEdit"
            class="fund-table__cell"
          >
            {{ el.gsz }}
          </td>

          <td
            v-if="isEdit && (showCostRate || showCost)"
            class="fund-table__cell"
          >
            <input
              class="fund-table__input"
              placeholder="持仓成本价"
              :value="el.cost"
              type="text"
              @input="
                el.cost = Number(($event.target as HTMLInputElement).value);
                $emit('changeCost', el);
              "
            >
          </td>

          <td
            v-if="showAmount"
            class="fund-table__cell"
          >
            {{ fmtLocale(el.amount) }}
          </td>

          <td
            v-if="showCost"
            :class="['fund-table__cell', valueToneClass(el.costGains)]"
          >
            {{ fmtLocale(el.costGains) }}
          </td>

          <td
            v-if="showCostRate"
            :class="['fund-table__cell', valueToneClass(el.costGainsRate)]"
          >
            {{ el.cost > 0 ? el.costGainsRate + "%" : "" }}
          </td>

          <td :class="['fund-table__cell', valueToneClass(el.gszzl)]">
            {{ el.gszzl }}%
          </td>

          <td
            v-if="showGains"
            :class="['fund-table__cell', valueToneClass(el.gains)]"
          >
            {{ fmtLocale(el.gains) }}
          </td>

          <td
            v-if="!isEdit"
            class="fund-table__cell fund-table__cell--time"
          >
            {{ el.hasReplace ? el.gztime?.substring(5, 10) : el.gztime?.substring(10) }}
          </td>

          <td
            v-if="isEdit && (showAmount || showGains || showCost || showCostRate)"
            class="fund-table__cell fund-table__cell--center"
          >
            <input
              class="fund-table__input"
              placeholder="输入持有份额"
              :value="el.num"
              type="text"
              @input="
                el.num = Number(($event.target as HTMLInputElement).value);
                $emit('changeNum', el);
              "
            >
          </td>

          <td
            v-if="isEdit && badgeContent === 1"
            class="fund-table__cell fund-table__cell--center"
          >
            <button
              :class="focusButtonClass(el.fundcode === realtimeFundcode)"
              @click="$emit('select', el.fundcode)"
            >
              ✔
            </button>
          </td>

          <td
            v-if="isEdit"
            class="fund-table__cell fund-table__cell--center"
          >
            <button
              class="fund-table__icon-button fund-table__icon-button--danger"
              @click="$emit('delete', el.fundcode)"
            >
              ✖
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss" src="./FundTable.scss"></style>
