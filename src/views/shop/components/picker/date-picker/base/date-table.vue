<template>
  <div :class="classes">
    <span
      :class="getCellCls(cell)"
      v-for="(cell, i) in cells"
      :key="String(cell.date) + i"
      @click="handleClick(cell)"
    >
      <em>{{ cell.desc }}</em>
    </span>
  </div>
</template>
<script>
const prefixCls = "ivu-date-picker-cells";

export default {
  props: {
    dates: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      prefixCls: prefixCls
    };
  },
  computed: {
    classes() {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-show-week-numbers`]: this.showWeekNumbers
        }
      ];
    },
    cells() {
      return new Array(28).fill(1).map((n, index) => {
        return {
          desc: index + 1,
          index: index,
          selected: this.dates.includes(index + 1),
          disabled: false
        };
      });
    }
  },
  methods: {
    getCellCls(cell) {
      return [
        `${prefixCls}-cell`,
        {
          [`${prefixCls}-cell-selected`]: cell.selected,
          [`${prefixCls}-cell-disabled`]: cell.disabled,
          [`${prefixCls}-focused`]: false
        }
      ];
    },
    handleClick(cell) {
      this.$emit("on-pick", cell.desc);
    }
  }
};
</script>
