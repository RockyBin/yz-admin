<template>
  <div
    class="ivu-select ivu-select-multiple ivu-select-default common-input-select-260"
    :class="isOpen ? 'ivu-select-visible':''"
  >
    <div tabindex="0" class="ivu-select-selection" @click="onDropMenuDown">
      <input type="hidden">
      <div>
        <span class="ivu-select-placeholder">请选择</span>
        <i class="ivu-icon ivu-icon-ios-arrow-down ivu-select-arrow"></i>
      </div>
    </div>
    <div class="ivu-select-dropdown" :style="stateStyle">
      <Tree :data="data2" show-checkbox ref="treeNode"></Tree>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      isOpen: false,
      stateStyle: {
        height: 0,
        overflow: "hidden"
      },
      data2: [
        {
          title: "parent 1",
          expand: true,
          children: [
            {
              title: "parent 1-1",
              expand: true,
              children: [
                {
                  title: "leaf 1-1-1"
                },
                {
                  title: "leaf 1-1-2"
                }
              ]
            },
            {
              title: "parent 1-2",
              expand: true,
              children: [
                {
                  title: "leaf 1-2-1"
                },
                {
                  title: "leaf 1-2-1"
                }
              ]
            }
          ]
        }
      ]
    };
  },
  mounted() {
    document.addEventListener("click", e => {
      if (!this.$el.contains(e.target)) {
        this.isOpen = false;
        this.stateStyle = {
          height: 0,
          overflow: "hidden"
        };
      }
    });
  },
  methods: {
    onDropMenuDown() {
      if (!this.isOpen) {
        this.isOpen = true;
        this.stateStyle = {
          // 获取dom节点的高度，dom节点自己写
          height: `${this.$refs.treeNode._vnode.elm.offsetHeight}px`,
          "overflow-y": "auto"
        };
      } else {
        this.isOpen = false;
        this.stateStyle = {
          height: 0,
          overflow: "hidden"
        };
      }
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-select-dropdown {
  padding: 0px 12px;
  min-width: 260px;
  max-height: 204px;
  transition: height ease 0.3s;
}
</style>