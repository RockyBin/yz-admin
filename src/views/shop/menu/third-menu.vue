<template>
  <div ref="thirdMenu" class="third-menu">
    <router-link
      class="link"
      tag="div"
      v-for="(item,index) in list"
      :key="index"
      :to="item.target"
    >{{item.title}}</router-link>
  </div>
</template>
<script>
import Emitter from "iview/src/mixins/emitter";
export default {
  mixins: [Emitter],
  props: ["list"],
  mounted() {
    this.dispatch(
      "yunzhiHome",
      "on-yunzhi-third-menu-add",
      this.$refs.thirdMenu
    );
  },
  beforeDestroy() {
    this.dispatch("yunzhiHome", "on-yunzhi-third-menu-remove");
  }
};
</script>
<style lang="less" scoped>
.third-menu {
  flex-shrink: 0;
  width: 100px;
  padding: 10px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #f2f4fd;
  margin-top: -12px;
  .link {
    line-height: 30px;
    margin-bottom: 10px;
    border-radius: 5px;
    font-size: 12px;
    &:hover {
      cursor: pointer;
    }
    &:last-child {
      margin-bottom: 0;
    }
    &.router-link-active {
      background: #e6ecfc;
    }
  }
}
</style>