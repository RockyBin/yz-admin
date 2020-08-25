<template>
  <Modal
    v-model="modalStatus"
    :title="title"
    @on-cancel="onModalCancel"
    @on-ok="onListMemberComfirmClick"
    :width="width"
    :loading="modalLoading"
    :transition-names="['false']"
    :mask-closable="false"
    class="modal-list-select-modal height-model"
  >
    <div class="mglr">
      <div style="margin: 0;">
        <i-input v-model="searchDataCopy.searchName" :placeholder="placeholder">
          <div
            slot="prepend"
            style="padding: 0 14px;"
            v-if="typeof headList === 'string'"
          >
            {{ headList }}
          </div>
          <Select v-else v-model="searchDataCopy.selectClass" slot="prepend" style="width: 100px;">
            <Option :value="0">{{optionsText}}</Option>
            <Option :value="item.id" v-for="item in headList" :key="item.id">{{item[headName]}}</Option>
          </Select>
          <Button slot="append" icon="ios-search" style="width: 42px; border: none" @click="onSearchClick"></Button>
        </i-input>
      </div>
    </div>
    <div
      style="padding: 0 24px;overflow-y: auto; height: 340px;"
      :style="{maxHeight: maxHeight + 'px'}"
    >
      <Table
        @on-row-click="selectIDCopy=$event"
        v-if="modalStatus"
        :loading="tableLoading"
        :height="340"
        :style="{width: 'calc(' + width + 'px - 48px)'}"
        :columns="columnsData"
        :data="tableData"
      ></Table>
    </div>
    <div style="padding: 0 24px;">
      <Page
        style="text-align: right;"
        :total="searchData.total"
        size="small"
        :page-size="searchData.pageSize"
        :current="searchData.currentPage"
        @on-change="getPageChange"
        @on-page-size-change="onPageSizeChange"
        show-elevator
      />
    </div>
    <div
      v-if="selectIDCopy && selectIDCopy[selectKey]"
      class="modal-list-select-modal-fixed"
    >已选：{{selectIDCopy[selectKey]}}</div>
  </Modal>
</template>
<script>
const defalutSelectObject = null;
const defalutSearchDataCopy = { searchName: "", selectClass: 0 };
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    selectData: {
      type: Object,
      default() {
        return defalutSelectObject;
      }
    },
    tableLoading: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    width: {
      type: Number
    },
    // 左下角显示选中的列表key
    selectKey: {
      default: "nickname"
    },
    columns: {
      type: Array,
      required: true
    },
    tip: {
      type: String,
      default: ""
    },
    headList: {
      type: [Array, String],
      default() {
        return [];
      }
    },
    headName: {
      type: String,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 340
    },
    // 请按照{selectClass: "实际上传的字段",searchName: "",currentPage: "", pageSize: ""}
    searchData: {
      type: Object,
      required: true
    },
    tableData: {
      type: Array,
      default() {
        return [];
      }
    },
    placeholder: {
      type: String,
      default: ""
    },
    optionsText: {
      type: String,
      default: "全部"
    },
    lastColumnWidth: {
      type: Number,
      default: 74
    }
  },
  data() {
    return {
      modalStatus: false,
      selectIDCopy: defalutSelectObject,
      modalLoading: true,
      columnsData: [],
      searchDataCopy: Object.assign({}, defalutSearchDataCopy)
    };
  },
  watch: {
    // 弹窗显示
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
        // 弹窗再次显示还原原来的选择
        if (val) {
          this.selectIDCopy = this.selectData;
        }
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    },
    selectData(val) {
      this.selectIDCopy = val;
    },
    loading(val) {
      this.modalLoading = val;
    },
    columns: {
      handler(val) {
        let columns = val.concat();
        columns.push({
          width: this.lastColumnWidth,
          renderHeader: h => {
            return h("div");
          },
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "primary" },
                  style: {
                    display:
                      this.selectIDCopy && this.selectIDCopy.id == params.row.id
                        ? "none"
                        : ""
                  },
                  on: {
                    click: () => {
                      this.selectIDCopy = params.row;
                    }
                  }
                },
                "选择"
              ),
              h(
                "Button",
                {
                  class: { "primary-color-border": true },
                  style: {
                    display:
                      this.selectIDCopy && this.selectIDCopy.id == params.row.id
                        ? "inline-block"
                        : "none"
                  }
                },
                "已选择"
              )
            ]);
          }
        });
        this.columnsData = columns;
      },
      immediate: true
    }
  },
  methods: {
    // 重置弹窗数据
    resetData() {
      this.emitGetNewList({
        pageSize: 20,
        currentPage: 1,
        searchName: "",
        selectClass: 0
      });
      this.searchDataCopy = Object.assign({}, defalutSearchDataCopy);
      this.$emit("onGetSelectData", null);
    },
    onModalCancel() {
      this.$emit("onModalCancel");
    },
    /**
     * 选择确定
     */
    onListMemberComfirmClick() {
      // 如果没有传loading=true进来
      if (!this.loading || !this.selectIDCopy) {
        this.modalLoading = false;
        this.$nextTick(() => {
          this.modalLoading = true;
        });
      }
      if (!this.selectIDCopy) {
        this.$Message.error(this.tip ? this.tip : ("请" + this.title));
        return;
      }
      this.$emit("onGetSelectData", this.selectIDCopy);
    },
    getPageChange(val) {
      this.emitGetNewList({
        currentPage: val
      });
    },
    onPageSizeChange(size) {
      this.emitGetNewList({
        currentPage: 1,
        pageSize: size
      });
    },
    /**
     * 触发搜索
     */
    onSearchClick() {
      this.emitGetNewList(
        Object.assign(this.searchDataCopy, {
          currentPage: 1
        })
      );
    },
    /**
     * 触发重新加载数据
     */
    emitGetNewList(data) {
      let searchData = Object.assign({}, this.searchData, data);
      this.$emit("getList", searchData);
    }
  }
};
</script>
<style lang="less" scoped>
.modal-list-select-modal {
  /deep/.ivu-modal-header {
    height: 44px;
  }
  /deep/.ivu-modal-body {
    padding: 0;
    .mglr {
      padding: 20px 24px 16px;
    }
    .ivu-page {
      height: 54px;
      line-height: 52px;
    }
    .modal-list-select-modal-fixed {
      position: absolute;
      bottom: 14px;
      left: 18px;
      width: calc(100% - 172px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ivu-select {
      .ivu-select-selection {
        box-shadow: none;
      }
      .ivu-select-dropdown {
        text-align: left;
        width: 180px;
      }
    }
  }
  /deep/.ivu-modal-footer {
    border-top: 1px solid #e8eaec;
    padding: 0 18px;
    height: 50px;
    line-height: 50px;
  }
  
  /deep/.ivu-input-group-prepend,
  /deep/.ivu-input-group-append,
  /deep/.ivu-table-header th {
    background: #dcdee2;
  }
  /deep/.ivu-input-group-append button {
    height: 32px;
    line-height: 1.5;
  }
  /deep/.ivu-table-overflowX {
    overflow-x: hidden !important;
  }
  /deep/.ivu-table-overflowY {
    overflow: auto;
  }
  /deep/table {
    font-size: 12px;
    .ivu-table-cell {
      padding-left: unset;
      padding-right: unset;
      // width: 220px;
    }
    thead tr{
      th:first-child{
        padding-left: 10px;
      }
      th:nth-child(2){
        text-align: unset;
        padding-left: 5px;
      }
    }
    th {
      font-size: 13px;
    }
    tbody tr {
      color: #657180;
      height: 70px;
      &:hover td:last-child button {
        display: inline-block;
      }
      td:first-child{
        padding-left: 14px;
      }
      td:nth-child(2){
        padding-left: 14px;
        text-align: unset;
      }
      td:last-child {
        padding: 0 10px;
        .ivu-table-cell {
          text-align: right;
        }
        .ivu-btn-default{
          margin-left: 4px;
        }
        button {
          width: 50px;
          height: 24px;
          padding: 0;
          line-height: 0;
          display: none;
          span {
            display: block;
          }
        }
      }
    }
  }
}
</style>
