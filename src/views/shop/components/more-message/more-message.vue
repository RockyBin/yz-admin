<template>
  <div class="more-message">
    <Tooltip :placement="placement" v-if="!hasLink" :transfer="transfer" :offset="offsetValue" :max-width="maxWidth">
      <i class="iconfont icon-ios-information-circ1"></i>
      <div v-html="text" slot="content" class="more-message-content"></div>
    </Tooltip>
    <a :href="link" :target="target" v-if="hasLink">
      <i class="iconfont icon-ios-information-circ1"></i>
    </a>
  </div>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: ""
    },
    hasLink: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ""
    },
    target: {
      type: String,
      default: "_blank"
    },
    placement: {
      type: String,
      default: "top-start"
    },
    maxWidth: {
      type: Number,
      default: 300
    },
    transfer: {
      type: Boolean,
      default: true
    },
    offset: {
      type: Number,
      default: 0
    }
  },
  computed: {
    // 有的定位会有偏差 需要处理
    offsetValue() {
      if (
        (this.placement.indexOf("top-") > -1 ||
          this.placement.indexOf("bottom-") > -1) &&
        this.offset === 0
      ) {
        if (this.placement.indexOf("-start") > -1) return -12;
        else return 12;
      }
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.more-message {
  height: 32px;
  display: inline-block;
  vertical-align: top;
  i.iconfont {
    font-size: 18px;
    vertical-align: middle;
  }
  /deep/.ivu-tooltip-inner {
    white-space: pre-wrap;
  }
}
.more-message-content {
  margin: -2px -5px;
  white-space: pre-wrap;
  font-size: 12px;
}
</style>
