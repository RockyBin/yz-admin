<template>
  <Table
    :stripe="type === 'stripe'"
    :border="type === 'border'"
    ref="selection"
    @on-row-click="$emit('on-row-click', $event)"
    @on-selection-change="onSelectChange"
    :columns="columnsData"
    @on-sort-change="onSortChange"
    :row-class-name="rowClassName"
    :data="listData"
    :width="width"
    :class="{'common-table-noborder':!hasBorder && type !== 'border'}"
    :loading="loading"
    :height="height"
  ></Table>
</template>
<script>
// import Table from "./iview-table.vue"
import { on, off } from "iview/src/utils/dom";
export default {
  // components:{
  //   Table
  // },
  props: {
    type: {
      type: String,
      default: ""
    },
    hasBorder: { type: Boolean, default: false },
    // 列表头部数据
    columnsData: {
      type: Array,
      default() {
        return [];
      }
    },
    width: {
      default: null,
      type: [String, Number]
    },
    // 用于修正页面初始化从大屏切换到小屏table会慢慢缩小的问题
    minWidth: {
      type: Number,
      default: 0
    },
    "row-class-name": {
      type: Function,
      default: () => {}
    },
    // 列表需要显示的用户数据
    listData: {
      type: Array,
      default() {
        return [];
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    height: {}
  },
  mounted() {
    if (this.minWidth) {
      let tableSelection = this.$refs["selection"];
      // 销毁computed产生的监听器
      tableSelection._computedWatchers.tableHeaderStyle.teardown();
      tableSelection._computedWatchers.tableStyle.teardown();
      let that = this;
      // 重新定义get方法，防止旧的getter方法触发
      Object.defineProperty(tableSelection, "tableHeaderStyle", {
        get() {
          return {
            minWidth: that.minWidth + "px"
          };
        },
        set() {}
      });
      Object.defineProperty(tableSelection, "tableStyle", {
        get() {
          return {
            minWidth: that.minWidth + "px"
          };
        },
        set() {}
      });
      // 重新赋值最小宽度
      tableSelection.$el.querySelector(
        ".ivu-table-header table"
      ).style.minWidth = this.minWidth + "px";
      tableSelection.$el.querySelector(".ivu-table-body table").style.minWidth =
        this.minWidth + "px";

      on(window, "resize", this.resetNotDataColumn);
    }
  },
  data() {
    return {};
  },
  methods: {
    resetNotDataColumn() {
      if (!this.listData.length) {
        this.$refs["selection"].$el.querySelector(
          ".ivu-table-tip td"
        ).style.width = "";
      }
    },
    // 改变表单的全选状态（会触发onSelectChange，其他情况改变checkAll值都需要经过这个方法传递数据给父级，如watch方法和点击自定义的全选按钮点击事件）
    handleSelectAll(status) {
      this.$refs.selection.selectAll(status);
    },
    onClickSelectAll() {
      // 没有数据则直接返回不操作
      if (!this.listData.length) {
        return;
      }
      this.checkAll = !this.checkAll;
      this.handleSelectAll(this.checkAll);
    },
    // 下架
    onClickShelves() {
      this.$emit("shelvesData");
    },
    // 改变全选状态并将数据传给上级
    onSelectChange(val) {
      this.checkAll =
        val.length === this.listData.length && this.listData.length !== 0;
      this.$emit("selectData", val);
    },
    /**
     * 排序触发的自定义事件
     */
    onSortChange() {
      this.$emit("onSortChange", ...arguments);
    }
  },
  beforeDestroy() {
    off(window, "resize", this.resetNotDataColumn);
  }
};
</script>
<style lang="less" scoped>
.ivu-table-wrapper {
  &.common-table-noborder {
    border-left: none;
    border-right: none;
    border-top: none;
    /deep/.ivu-table-default {
      &:before {
        display: none;
      }
      &:after {
        display: none;
      }
    }
  }
  /deep/.ivu-table-overflowX {
    overflow-x: visible;
  }
  /deep/.ivu-table-default {
    .ivu-table-header table thead tr th {
      border-bottom: none;
    }
    table {
      thead {
        tr {
          th {
            font-size: 0px;
            color: #464c5b;
            font-weight: bold;
            .ivu-table-cell {
              font-size: 13px;
            }
          }
        }
      }
      tbody {
        font-size: 12px;
        tr {
          height: 70px;
          td {
            color: #657180;
            font-size: 12px;
          }
        }
      }
      /deep/.ivu-table-row-hover {
        background-color: #f8f9fd;
      }
      .ivu-table-cell {
        padding: 0 14px;
      }
      thead {
        tr {
          height: 42px;
          th {
            height: 42px;
            text-overflow: initial;
            background-color: #f8f9fd;
          }
        }
      }
    }
  }
}
</style>
