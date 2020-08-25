<template>
  <Modal
    v-model="showModal"
    title="转移给员工"
    class="setting-account-modal-transfer"
    width="648"
    :mask-closable="false"
    :loading="loading"
    @on-ok="onConfirmClick"
  >
    <div class="setting-account-modal-transfer-head" v-if="dataInfo">
      <div class="setting-account-modal-transfer-item">
        <titlebar title="原员工"></titlebar>
        <div>
          <div
            class="setting-account-modal-transfer-avator"
            :style="`background-image: url(${getHeadImg(dataInfo.headurl)});`"
          ></div>
          <div class="setting-account-modal-transfer-info">
            <div>姓名：{{ dataInfo.name }}</div>
            <div v-if="dataInfo.position">职位：{{ dataInfo.position }}</div>
            <div v-if="dataInfo.mobile">手机：{{ dataInfo.mobile }}</div>
          </div>
        </div>
      </div>
      <div class="setting-account-modal-transfer-item">
        <titlebar title="绑定会员情况"></titlebar>
        <div>
          <div class="setting-account-modal-transfer-info">
            <div>总会员：{{ dataInfo.member_count }}</div>
            <div v-if="Number(dataInfo.distributor_count)">
              分销商：{{ dataInfo.distributor_count }}
            </div>
            <div v-if="Number(dataInfo.agent_count)">
              代理商：{{ dataInfo.agent_count }}
            </div>
            <div v-if="Number(dataInfo.dealer_count)">
              经销商：{{ dataInfo.dealer_count }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <search-list
        :searchParams="searchParams"
        :search-data="searchData"
        :onLine="true"
      />
    </div>
    <common-table
      @on-row-click="onRowClick"
      :hasBorder="true"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
      :row-class-name="rowClassName"
    ></common-table>
    <Page
      style="text-align: right;margin: 20px 10px -4px 0;"
      :total="total"
      size="small"
      :page-size="pageSize"
      :current="currentPage"
      @on-change="getPageChange"
      @on-page-size-change="onPageSizeChange"
      show-elevator
    />
  </Modal>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
const searchData = {
  keyword: "",
  level: -1
};
export default {
  components: {
    searchList,
    titlebar,
    commonTable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    dataInfo: {
      type: Object,
      default() {
        return null;
      }
    },
    levelList: {
      type: Array,
      default() {
        return [];
      }
    },
    levelObj: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      showModal: false,
      loading: true,
      defaultImg: require("../../images/head-portrait.png"),
      tableLoading: false,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      selectID: -1,
      rowClassName: row => {
        return row.id === this.selectID ? "table-disabled" : "";
      },
      columnsData: [
        {
          title: "员工信息",
          align: "left",
          width: 240,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  paddingRight: "28px"
                }
              },
              [
                h("img", {
                  attrs: {
                    src: this.getHeadImg(params.row.headurl)
                  },
                  style: {
                    width: "40px",
                    height: "40px",
                    borderRadius: "5px",
                    "vertical-align": "middle",
                    display: "inline-block",
                    marginRight: "12px"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      display: "inline-block",
                      "vertical-align": "middle",
                      width: "calc(100% - 56px)"
                    }
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        style: {
                          width: "100%",
                          fontSize: 0,
                          display: "block"
                        },
                        props: {
                          placement: "top"
                        }
                      },
                      [
                        h(
                          "div",
                          {
                            style: {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "12px",
                              whiteSpace: "nowrap"
                            }
                          },
                          "姓名：" + params.row.name
                        ),
                        h("div", { slot: "content" }, params.row.name)
                      ]
                    ),
                    params.row.position
                      ? h(
                          "div",
                          {
                            style: {
                              marginTop: "4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "12px",
                              whiteSpace: "nowrap"
                            }
                          },
                          "职位：" + params.row.position
                        )
                      : "",
                    params.row.mobile
                      ? h(
                          "div",
                          { style: "margin-top: 4px;" },
                          "手机：" + params.row.mobile
                        )
                      : ""
                  ]
                )
              ]
            );
          }
        },
        {
          title: "账号",
          align: "left",
          width: 120,
          key: "username"
        },
        {
          title: "部门",
          align: "left",
          width: 120,
          render: (h, params) => {
            let department = this.levelObj[params.row.department_id];
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                }
              },
              department
                ? [
                    h(
                      "div",
                      department.parent_id
                        ? department.parent_name
                        : department.name
                    ),
                    department.parent_id
                      ? h(
                          "div",
                          {
                            class: "table-second-level"
                          },
                          department.name
                        )
                      : ""
                  ]
                : "--"
            );
          }
        },
        {
          align: "right",
          renderHeader: h => {
            return h("div");
          },
          render: (h, params) => {
            return h(
              "div",
              params.row.id !== (this.dataInfo && this.dataInfo.id)
                ? [
                    h(
                      "Button",
                      {
                        props: { type: "primary" },
                        style: {
                          display: this.selectID === params.row.id ? "none" : ""
                        },
                        on: {
                          click: () => {
                            this.selectID = params.row.id;
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
                            this.selectID === params.row.id
                              ? "inline-block"
                              : "none"
                        }
                      },
                      "已选择"
                    )
                  ]
                : ""
            );
          }
        }
      ],
      listData: [],
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "姓名/账号/手机"
        },
        {
          type: 11,
          key: "level",
          placeholder: "请选择部门",
          name: "",
          options: [{ id: -1, name: "全部" }]
        }
      ],
      searchData: Object.assign({}, searchData)
    };
  },
  watch: {
    value(val) {
      this.showModal = val;
      if (val) {
        this.total = 0;
        this.currentPage = 1;
        this.listData = [];
        this.searchData = Object.assign({}, searchData);
        this.selectID = -1;
      }
    },
    levelList(val) {
      this.$set(this.searchParams.find(n => n.key === "level"), "options", val);
    },
    showModal(val) {
      this.$emit("input", val);
    },
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    }
  },
  methods: {
    getPageChange(val) {
      this.currentPage = val;
      this.getList();
    },
    onRowClick(item) {
      this.selectID = item.id;
    },
    onPageSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList();
    },
    onConfirmClick() {
      if (this.selectID === -1) {
        this.$Message.error("请选择员工");
        this.loading = false;
        this.$nextTick(() => {
          this.loading = true;
        });
        return;
      }
      this.$emit("on-ok", this.selectID);
    },
    /**
     * 获取头像
     */
    getHeadImg(url) {
      if (url) {
        if (!/^(http)/i.test(url)) {
          url = this.$store.state.siteComdataPath + url;
        }
        return url;
      }
      return this.defaultImg;
    },
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/staff/list",
        {
          keyword: this.searchData.keyword,
          department_id:
            this.searchData.level === -1 ? "" : this.searchData.level,
          status: 1,
          page: this.currentPage,
          page_size: this.pageSize
        },
        res => {
          this.tableLoading = false;
          if (res.code === 200) {
            this.total = res.data.total;
            this.listData = res.data.list;
            this.$el.querySelector(".ivu-table-overflowY") &&
              this.$el.querySelector(".ivu-table-overflowY").scrollTo(0, 0);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.setting-account-modal-transfer {
  /deep/.ivu-modal-body {
    height: 505px;
    .ivu-table-wrapper {
      height: 300px;
      .ivu-table-body {
        height: calc(100% - 42px);
        overflow-y: auto;
        overflow-x: hidden;
        .table-disabled {
          background: #f8f8f9;
          td {
            background: none;
          }
        }
        tbody tr {
          &:hover td:last-child button {
            display: inline-block;
          }
          td:last-child button {
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
        .table-second-level {
          padding-left: 14px;
          position: relative;
          margin-top: 4px;
          &:before,
          &:after {
            content: "";
            display: block;
            position: absolute;
            left: 0;
            top: 8px;
            background-color: #ccc;
          }
          &:before {
            top: -2px;
            width: 1px;
            height: 10px;
          }
          &:after {
            width: 10px;
            height: 1px;
          }
        }
      }
      .ivu-table-tip {
        height: calc(100% - 42px);
        table {
          height: 100%;
        }
      }
    }
  }
  /deep/.data-list-search {
    margin-top: 24px;
    .ivu-btn {
      margin-right: 0px;
    }
    .data-list-search-item .ivu-select {
      width: 160px;
    }
  }
  .setting-account-modal-transfer-head {
    position: relative;
    display: flex;
    padding: 10px 0 20px;
    border-radius: 5px;
    font-size: 13px;
    background-color: #f7f8fd;
    .setting-account-modal-transfer-item {
      position: relative;
      width: 50%;
      padding: 0 19px;
      &:first-child {
        &:after {
          content: "";
          display: block;
          position: absolute;
          top: 15px;
          right: 0;
          bottom: 0px;
          border-left: 1px dashed #dcdee2;
        }
      }
      & > div {
        &:last-child {
          margin-top: 10px;
          display: flex;
          align-items: center;
          font-size: 12px;
        }
      }
      .setting-account-modal-transfer-avator {
        width: 60px;
        height: 60px;
        border-radius: 5px;
        flex-shrink: 0;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      }
      .setting-account-modal-transfer-info {
        padding-left: 13px;
        padding-bottom: 2px;
        color: #657180;
        & > div {
          line-height: 16px;
          & + div {
            margin-top: 4px;
          }
        }
      }
    }
  }
}
</style>
