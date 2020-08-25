<template>
  <div class="choose-member common-table-modal">
    <div class="member-container">
      <i-input
        v-model="chooseMemberInput"
        placeholder="昵称/姓名/手机"
        @on-change="changeInputData"
      >
        <Select v-model="chooseMemberSelect" slot="prepend" class="select-width" placeholder="全部会员">
          <Option :value="0">全部会员</Option>
          <template v-for="(item, index) in memberLevelList">
            <Option :value="item.id" :key="index">{{item.name}}</Option>
          </template>
        </Select>
        <Button slot="append" icon="ios-search" @click="onSearchButton" style="border:none"></Button>
      </i-input>
    </div>
    <Table
      :columns="columnsList"
      :data="dataList.list"
      :loading="tablesLoading"
      class="table-style"
      @on-row-click="$emit('on-row-click', $event)"
    ></Table>
    <Page
      v-if="dataList.total > 0"
      :total="dataList.total"
      :current="dataList.current"
      :page-size="pageSize"
      @on-change="changePage"
      size="small"
      show-elevator
      style="margin: 20px 14px 0;text-align:right"
    />
  </div>
</template>
<script>
export default {
  props: {
    // 列表laoding
    tablesLoading: {
      type: Boolean,
      default() {
        return false;
      }
    },
    // 列表头部数据
    columnsList: {
      type: Array,
      default() {
        return [];
      }
    },
    // 列表需要显示的用户数据
    dataList: {
      type: Object,
      default() {
        return {};
      }
    },
    // 会员等级
    memberLevelList: {
      type: Array,
      default() {
        return [];
      }
    },
    isInit: {
      type: Boolean,
      default() {
        return true;
      }
    }
  },
  data() {
    return {
      pageSize: 10,
      chooseMemberInput: "",
      chooseMemberSelect: "",
      chooseMemberInputCopy: "",
      chooseMemberSelectCopy: ""
    };
  },
  watch: {
    isInit(val) {
      if (val) {
        this.chooseMemberInput = "";
        this.chooseMemberSelect = "";
        this.chooseMemberInputCopy = "";
        this.chooseMemberSelectCopy = "";
      }
    }
  },
  methods: {
    // 分页
    changePage(val) {
      this.$emit("pagingCapabilities", {
        page: val,
        page_size: this.pageSize,
        level: this.chooseMemberSelectCopy,
        keyword: this.chooseMemberInputCopy
      });
    },
    // 搜索功能
    onSearchButton() {
      this.chooseMemberInputCopy = this.chooseMemberInput;
      this.chooseMemberSelectCopy = this.chooseMemberSelect;
      this.$emit("searchButton", {
        level: this.chooseMemberSelect,
        keyword: this.chooseMemberInput,
        page_size: this.pageSize
      });
    },
    changeInputData() {}
  }
};
</script>
<style lang="less" scoped>
.choose-member {
  .member-container {
    margin-bottom: 15px;
    margin-top: 25px;
    /deep/.select-width {
      width: 100px;
      /deep/.ivu-select-placeholder {
        color: #464c5b;
      }
      .ivu-select-dropdown {
        width: 260px;
        text-align: left;
      }
    }
  }
  .table-style {
    font-size: 12px;
    /deep/.ivu-table-body {
      height: 315px;
      overflow-y: auto;
      overflow-x: hidden;
      tr {
        td:nth-child(2) {
          .ivu-table-cell {
            & > div {
              padding-top: 7px;
            }
          }
        }
      }
    }
  }
  .page-style {
    margin-bottom: 30px;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
  }
  /deep/.button-style {
    display: none;
    position: absolute;
    right: 0px;
    top: 23px;
    background: #fff;
    width: 50px;
    height: 24px;
    border-radius: 5px;
    border: solid 1px #4a6af5;
    background-color: #4a6af5;
    color: #fff;
    outline: none;
  }
  /deep/.ivu-table-row:hover .button-style {
    display: block;
  }
  /deep/.ivu-table-row .show-choose-style {
    display: block;
    background-color: #fff;
    color: #4a6af5;
  }
  /deep/.ivu-page-item-active {
    background: #4a6af5;
    a {
      color: #fff;
    }
  }
  /deep/.ivu-page-item-active:hover a {
    color: #fff;
  }
}
</style>
