<template>
  <div class="switch-titlebar" :class="{'switch-titlebar-border': (!switchShow || switchStatus) && hasBorder}">
    <div class="switch-titlebar-head">
      <span class="switch-titlebar-head-text" style="margin-right: 14px;">{{title}}</span>
      <i-switch v-model="switchStatus" v-if="switchShow" :disabled="disabled" :true-value="trueValue" :false-value="falseValue" @on-change="onSwitchChange">
        <span slot="open">开</span>
        <span slot="close">关</span>
      </i-switch>
      <span v-show="tipShow">
        <Icon type="md-alert" />
        <span class="info" v-html="tipText"></span>
      </span>
      <more-message v-if="moreMessage" style="height:22px;vertical-align:unset;" :text="moreMessage"></more-message>
    </div>
    <div class="switch-titlebar-content" v-show="!switchShow || switchStatus">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    moreMessage
  },
  props: {
    "true-value": {
      default: 1
    },
    "false-value": {
      default: 0
    },
    title: {
      type: String,
      default: ""
    },
    value: {
      default: 0
    },
    hasBorder: {
      type: Boolean,
      default: false
    },
    tipShow: {
      default: false
    },
    tipText: {
      type: String,
      default: ""
    },
    switchShow: {
      type: Boolean,
      default: true
    },
    moreMsgText: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    moreMessage: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      switchStatus: this.falseValue
    }
  },
  watch: {
    value: {
      handler(val) {
        this.switchStatus = val;
      },
      immediate: true
    },
    switchStatus(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onSwitchChange(val) {
      this.$emit("on-change", val);
    }
  },
}
</script>
<style lang="less" scoped>
.switch-titlebar {
  margin-bottom: 24px;
  .switch-titlebar-head {
    font-size: 0;
    padding: 18px 16px 20px;
    border-radius: 3px;
    background-color: #F5F6F7;
    .switch-titlebar-head-text {
      font-size: 13px;
      font-weight: bold;
      line-height: 22px;
      margin-right: 14px;
      color: #464C5B;
      vertical-align: middle;
    }
  }
  &.switch-titlebar-border {
    .switch-titlebar-head {
      border-radius: 3px 3px 0 0;
    }
    .switch-titlebar-content {
      border-left: 1px solid #F5F6F7;
      border-right: 1px solid #F5F6F7;
      border-bottom: 1px solid #F5F6F7;
      border-radius: 0 0 3px 3px;
      padding: 24px 0;
    }
  }
  .info{
    color: #464C5B;
    font-size: 12px;
    vertical-align: middle;
  }
  .ivu-switch {
    margin-right: 15px;
  }
  .ivu-icon-md-alert{
    font-size: 16px;
    color: #FF9900;
    margin-right: 5px;
  }
}
</style>