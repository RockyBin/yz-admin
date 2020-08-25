<template>
  <div class="label-item" :style="{'background-color':backgroundColor}">{{tagName}}</div>
</template>
<script>
  import Emitter from "iview/src/mixins/emitter";

  export default {
    mixins: [Emitter],
    props: {
      tagName: {
        type: String,
        default: ''
      },
      backgroundColor: {
        type: String,
        default: ''
      }
    },
    data() {
      return {};
    },
    mounted() {

    },
    methods: {

    }
  };
</script>
<style lang="less" scoped>
  .label-item {
    display: inline-block;
    font-size: 12px;
    color: #fff;
    background-color: #CCCCCC;
    border-radius: 3px;
    height: 16px;
    padding: 0 4px;
    line-height: 16px;
  }
</style>


