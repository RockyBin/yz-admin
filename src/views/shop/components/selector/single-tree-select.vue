<template>
  <Select
    class="common-input-text-156 single-tree-select"
    transfer
    transfer-class-name="common-input-select-transfer"
    :placeholder="placeholder"
    v-model="selectID"
  >
    <Option
      v-for="item in levelList"
      :class="{ 'single-tree-select-second-level': item.parent_id }"
      :value="item.id"
      :key="item.id"
      >{{ item.name }}</Option
    >
  </Select>
</template>
<script>
/**
 * 树形单选框
 */
export default {
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    levelList: {
      type: Array,
      default() {
        return [];
      }
    },
    placeholder: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selectID: null
    };
  },
  watch: {
    value: {
      handler(val) {
        this.selectID = val;
      },
      immediate: true
    },
    selectID(val) {
      this.$emit("input", val);
    }
  }
};
</script>
<style lang="less" scoped>
.single-tree-select-second-level {
  padding-left: 30px;
  position: relative;
  &:before,
  &:after {
    content: "";
    display: block;
    position: absolute;
    left: 16px;
    bottom: 12px;
    background-color: #ccc;
  }
  &:before {
    width: 1px;
    height: 10px;
  }
  &:after {
    width: 10px;
    height: 1px;
  }
}
</style>
