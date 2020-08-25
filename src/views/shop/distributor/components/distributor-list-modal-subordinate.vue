<template>
  <Modal
    class="distributor-list-subordinate height-model"
    title="查看一级分销商情况"
    :transition-names="['false']"
    v-model="modalStatus"
    footer-hide
    :width="1252"
  >
    <div class="distributor-list-subordinate-content">
      <div class="distributor-list-subordinate-table">
        <vertical-line-titlebar
          class="distributor-list-subordinate-title"
          :title="distributorDataShow[0] && distributorDataShow[0].nickname"
        />
        <div class="distributor-list-subordinate-right">
          <common-table :columnsData="columnsData1" type="border" :listData="distributorDataShow"></common-table>
        </div>
      </div>
      <div class="distributor-list-subordinate-table">
        <vertical-line-titlebar
          class="distributor-list-subordinate-title"
          :title="distributorDataShow[0] && distributorDataShow[0].nickname + '的一级分销商:'"
        />
        <div class="distributor-list-subordinate-right">
          <common-table
            :columnsData="columnsData2"
            type="border"
            :listData="distributorSubordinateData"
          ></common-table>
        </div>
      </div>
    </div>
    <Page
      style="text-align: right;"
      :total="total"
      size="small"
      :page-size="pageSize"
      show-sizer
      :current="currentPage"
      @on-change="onPageChange"
      @on-page-size-change="onPageSizeChange"
      show-elevator
    />
  </Modal>
</template>

<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";

const DEFAULT_PAGE_SIZE = 20;
export default {
  components: {
    commonTable,
    verticalLineTitlebar
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    selectID: {
      default: 0
    },
    distributorData: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    let columnData = [
      {
        title: "昵称/手机号",
        width: 240,
        render: (h, params) => {
          return h(
            "div",
            {
              style: {
                display: "flex"
              }
            },
            [
              h("img", {
                props: {
                  type: "primary",
                  size: "small"
                },
                attrs: {
                  src:
                    params.row.headurl ||
                    require("@/views/shop/images/head-portrait.png")
                },
                style: {
                  width: "40px",
                  height: "40px",
                  marginRight: "10px",
                  display: "inline-block",
                  borderRadius: "5px",
                  verticalAlign: "middle"
                }
              }),
              h(
                "span",
                {
                  style: {
                    flex: "1",
                    display: "inline-block",
                    verticalAlign: "middle"
                  }
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        overflow: "hidden",
                        "max-width": "130px"
                      }
                    },
                    params.row.nickname
                  ),
                  h(
                    "div",
                    {
                      style: {
                        color: "#9ea4b1"
                      }
                    },
                    (params.row.member_mobile
                      ? params.row.member_mobile
                      : params.row.mobile) || ""
                  )
                ]
              )
            ]
          );
        }
      },
      {
        title: "分销商等级",
        key: "distributor_level_name",
        width: 120,
        align: "center",
        render: (h, params) => {
          return h("div", params.row.distributor_level_name || "默认等级");
        }
      },
      {
        title: "注册时间",
        align: "center",
        width: 120,
        render: (h, params) => {
          return h("div", [
            h(
              "div",
              params.row.member_created_at &&
                params.row.member_created_at.split(/\s/)[0].replace(/-/g, ".")
            ),
            h(
              "div",
              params.row.member_created_at &&
                params.row.member_created_at.split(/\s/)[1]
            )
          ]);
        }
      },
      {
        title: "成为分销商时间",
        width: 130,
        align: "center",
        render: (h, params) => {
          return h(
            "div",
            params.row.passed_at
              ? [
                  h(
                    "div",
                    params.row.passed_at.split(/\s/)[0].replace(/-/g, ".")
                  ),
                  h("div", params.row.passed_at.split(/\s/)[1])
                ]
              : "- - -"
          );
        }
      },
      {
        title: "交易情况",
        width: 150,
        align: "center",
        className: "distributor-list-modal-deal",
        render: (h, params) => {
          return h(
            "div",
            {
              style: {
                textAlign: "left",
                display: "inline-block"
              }
            },
            [
              h("div",`付款：${params.row.member_buy_times || 0}次/￥${params.row.member_buy_money || 0}`),
              h("div",`成交：${params.row.member_deal_times || 0}次/￥${params.row.member_deal_money || 0}`)
            ]
          );
        }
      }
    ];
    let totalTeam = {
      title: "团队总数量",
      align: "center",
      width: 120,
      render: (h, params) => {
        return h("div", [h("span", params.row.total_team || 0)]);
      }
    };
    let totalCommision = {
      title: "佣金总收益",
      width: 160,
      align: "center",
      renderHeader: (h, params) => {
        return h("div", [
          h("span", params.column.title),
          h(
            "Poptip",
            {
              props: {
                trigger: "hover",
                title: "佣金总收益",
                transfer: true,
                content: "该分销商自身佣金总收益",
                transfer: true,
                placement: "top-end",
                offset: 15
              }
            },
            [
              h("i", {
                class: "iconfont icon-ios-help-circle-outl"
              })
            ]
          )
        ]);
      },
      render: (h, params) => {
        return h("div", [h("span", "￥" + params.row.total_commission || 0)]);
      }
    };
    return {
      modalStatus: false,
      total: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      currentPage: 1,
      columnsData1: [
        ...columnData,
        Object.assign({}, totalTeam),
        {
          title: "一级分销商数量",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h("div", [
              h("span", params.row.directly_under_distributor || 0)
            ]);
          }
        },
        Object.assign({}, totalCommision)
      ],
      columnsData2: [
        ...columnData,
        Object.assign({}, totalTeam, { title: "成员" }),
        Object.assign({}, totalCommision, { width: 150 }),
        {
          title: "带来佣金",
          align: "center",
          width: 160,
          renderHeader: (h, params) => {
            return h("div", [
              h("span", params.column.title),
              h(
                "Poptip",
                {
                  props: {
                    trigger: "hover",
                    title: "带来佣金",
                    transfer: true,
                    width: 250,
                    placement: "top-end",
                    offset: 15
                  }
                },
                [
                  h(
                    "div",
                    {
                      slot: "content",
                      style: {
                        whiteSpace: "pre-wrap"
                      }
                    },
                    "该分销商的团队[包括当前分销商]，给上级分销商带来多少佣金"
                  ),
                  h("i", {
                    class: "iconfont icon-ios-help-circle-outl"
                  })
                ]
              )
            ]);
          },
          render: (h, params) => {
            return h("div", [
              h("span", "￥" + (params.row.sub_team_commission || "0.00"))
            ]);
          }
        }
      ],
      distributorSubordinateData: []
    };
  },
  computed: {
    distributorDataShow() {
      let data = this.distributorData.concat();
      data = data.map(item => {
        item = Object.assign({}, item);
        delete item._expanded;
        return item;
      });
      return data;
    }
  },
  watch: {
    value(val) {
      if (this.modalStatus !== val) {
        this.modalStatus = val;
      }
    },
    modalStatus(val) {
      this.$emit("input", val);
    },
    // 监听id变化重新拿数据
    selectID() {
      this.currentPage = 1;
      this.pageSize = DEFAULT_PAGE_SIZE;
      this.distributorSubordinateData = [];
      this.getListData();
    }
  },
  methods: {
    onPageChange(index) {
      this.currentPage = index;
      this.getListData();
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getListData();
    },
    /**
     * 获取数据
     */

    getListData() {
      this.$httpGet(
        "/shop/admin/distribution/distributor/list",
        {
          type: 2,
          parent_id: this.selectID,
          page: this.currentPage,
          page_size: this.pageSize,
          finance_member_id: this.selectID,
          status: 1,
        },
        res => {
          if (res.code === 200) {
            this.total = res.data.total;
            this.distributorSubordinateData = res.data.data || [];
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
.distributor-list-subordinate {
  width: 1256px;

  /deep/.ivu-modal-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /deep/.ivu-modal-body {
    padding: 0;

    .distributor-list-subordinate-content {
      padding: 30px 24px 36px;
      max-height: 616px;
      overflow-y: auto;
      .distributor-list-subordinate-table {
        & + div {
          margin-top: 40px;
        }
        .distributor-list-subordinate-right {
          width: 1192px;
        }
        .distributor-list-subordinate-title {
          font-size: 13px;
          margin-bottom: 20px;
        }
        .ivu-table-wrapper {
          .ivu-table-body {
            .distributor-list-modal-deal .ivu-table-cell {
              display: block;
            }
          }
          .ivu-poptip {
            margin-left: 10px;
            .ivu-poptip-rel {
              width: 14px;
              height: 14px;
              line-height: 14px;
              vertical-align: baseline;
              font-size: 16px;
              font-weight: initial;
            }
            .ivu-poptip-popper {
              width: 200px;
              font-weight: initial;
              text-align: left;
              .ivu-poptip-title-inner {
                font-size: 13px;
              }
              .ivu-poptip-body-content-inner {
                white-space: pre-wrap;
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    .ivu-page {
      padding: 20px 24px;
    }
  }
}
</style>
