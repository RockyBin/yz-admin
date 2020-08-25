<template>
  <Tree
    :data="data"
    class="class-tree-simple"
    :show-checkbox="showCheckbox"
    @on-check-change="OnCheckChange"
    @on-select-change="onSelectChange"
  ></Tree>
</template>
<script>
export default {
  props: {
    "show-checkbox": {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    OnCheckChange(data) {
      this.$emit("on-check-change", data);
    },
    onSelectChange(data, obj) {
      this.$emit("on-select-change", data, obj);
    }
  }
};
</script>
<style lang="less" scoped>
.class-tree-simple.ivu-tree {
  background: #f5f6f7;
  border: 1px solid #e8eaec;
  border-radius: 4px;
  padding: 6px 0;
  width: 270px;
  /deep/.ivu-checkbox-wrapper {
    margin-left: 0;
    margin-right: 4px;
    .ivu-checkbox {
      margin: 0;
    }
  }
  /deep/.ivu-tree-children {
    li {
      margin: 0;
      .ivu-tree-arrow {
        width: 24px;
      }
      .ivu-tree-title {
        margin: 0;
        width: calc(100% - 48px);
      }
      ul {
        padding: 0 0 0 24px;
        .ivu-tree-arrow {
          position: relative;
          &:before {
            content: "";
            position: absolute;
            display: block;
            height: 32px;
            width: 1px;
            background: #ccc;
            left: 10px;
            bottom: 4px;
          }
          &:after {
            content: "";
            position: absolute;
            display: block;
            width: 14px;
            height: 1px;
            background: #ccc;
            left: 10px;
            bottom: 4px;
          }
        }
        &:nth-child(4) {
          .ivu-tree-arrow {
            &:before {
              height: 24px;
            }
          }
        }
      }
    }
  }
}
</style>
