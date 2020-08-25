<template>
  <ButtonGroup>
    <Button
      :class="{active:isObject(item) && value == item.value || !isObject(item) && value == index}"
      v-for="(item, index) in data"
      :key="index"
      @click="handleClick(item,index)"
    >{{isObject(item) ? item.name : item}}</Button>
  </ButtonGroup>
</template>
<script>
export default {
  props: {
    data: [Array, Object],
    value: [String, Number]
  },
  methods: {
    isObject(item) {
      return Object.prototype.toString.call(item) == "[object Object]";
    },
    handleClick(item, index) {
      let value = this.isObject(item) ? item.value : index;
      this.$emit("input", value);
      this.$emit("on-click", value);
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-btn-group {
  margin-bottom: 20px;
  .ivu-btn-default {
    height: 36px;
  }
}
</style>