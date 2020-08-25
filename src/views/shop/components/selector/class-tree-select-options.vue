<template>
  <li class="ivu-select-item" :class="{'ivu-select-item-left': secondChild}" @click="onSelectClick">
    <Icon
      :class="{'ivu-tree-arrow-open': showItem.expand}"
      v-if="childExist"
      type="md-arrow-dropright"
      @click.stop="onArrowChange"
    />
    <Checkbox
      v-model="checked"
      :class="{'ivu-select-icon-none': !childExist}"
      :indeterminate="indeterminate"
      @on-change="onCheckStatusChange"
      @click.native.stop="() => {}"
    ></Checkbox>
    <span :style="isDisabled? 'max-width: calc(100% - 68px);' : ''">{{showItem.data.class_name}}</span>
    <span v-if="isDisabled" class="table-disable">禁用</span>
  </li>
</template>
<script>
export default {
  props: {
    dropVisible: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    value: {
      default: false
    },
    secondChild: {
      type: Boolean,
      default: false
    },
    showItem: {
      default() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    indeterminate() {
      let status = 0;
      this.childExist &&
        this.showItem.children.forEach(item => {
          if (item.checked) {
            status++;
          }
        });
      return !!(status && this.showItem.children.length > status);
    },
    checked: {
      set(val) {
        this.setDataStatus(val);
      },
      get() {
        if (this.childExist) {
          return this.showItem.children.filter(item => item.checked).length > 0;
        } else {
          return !!this.showItem.checked;
        }
      }
    },
    childExist() {
      return this.showItem.children && this.showItem.children.length;
    }
  },
  methods: {
    onSelectClick() {
      this.setDataStatus(!this.checked);
      this.$emit("on-change");
    },
    setDataStatus(val) {
      if (this.childExist) {
        let status = val;
        if (this.indeterminate) {
          status = false;
        }
        this.showItem.children.forEach(item => {
          item.checked = status;
        });
        this.$forceUpdate();
      } else {
        this.$set(this.showItem, "checked", val);
      }
    },
    onCheckStatusChange(val) {
      this.$emit("on-change");
    },
    onArrowChange() {
      this.$emit("expandChange", this.showItem, !this.showItem.expand);
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-select-item {
  padding-left: 10px;
  .table-disable {
    font-size: 12px;
    border-radius: 2px;
    background: #ccc;
    color: #fff;
    vertical-align: middle;
  }
  .ivu-checkbox-wrapper {
    font-size: 0;
    vertical-align: middle;
    .ivu-checkbox {
      font-size: 0;
    }
  }
  & > span:not(.table-disable) {
    max-width: calc(100% - 30px);
    display: inline-block;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &.ivu-select-item-left {
    padding-left: 24px;
  }
  .ivu-icon {
    font-size: 20px;
    line-height: 16px;
    transition: all 0.2s ease-in-out;
    margin-right: 5px;
    &.ivu-tree-arrow-open {
      transform: rotate(90deg);
    }
  }
  .ivu-select-icon-none {
    margin-left: 25px;
  }
  span {
    user-select: none;
  }
}
</style>
