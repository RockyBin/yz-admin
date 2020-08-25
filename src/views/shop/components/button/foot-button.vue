<template>
  <div class="foot-button-item" style="display: none;">
    <slot>
      <Button ref="defaultButton" class="save-btn" @click="onSaveClick" :loading="loading" :perm="perm">保存</Button>
    </slot>
  </div>
</template>
<script>
import Emitter from "iview/src/mixins/emitter";

export default {
  mixins: [Emitter],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    perm: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  mounted() {
    this.dispatch("yunzhiHome", "on-yunzhi-foot-button-add", this.$el);
  },
  methods: {
    onSaveClick() {
      this.$emit("onSaveClick");
    }
  },
  beforeDestroy() {
    this.dispatch("yunzhiHome", "on-yunzhi-foot-button-remove");
  }
};
</script>
<style lang="less" scoped>
.foot-button-item {
  background:white;
  border-top: 1px solid #eee;
  border-radius: 0 0 3px 3px;
  .save-btn {
    width: 70px;
    height: 32px;
    background: #4a6af5;
    border-color: #4a6af5;
    color: #fff;
  }
  .save-btn:hover {
    background: #5d7af7;
  }
  button {
    border-radius: 17px;
    & + button {
      margin-left: 10px;
    }
  }
}
</style>


