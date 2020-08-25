<template>
  <div class="marketing-list">
    <Tabs :animated="false" v-model="name">
      <TabPane label="优惠券" name="0">
        <div class="marketing-list-left">
          <add-more text="新增优惠券" @onAddMoreClick="onAddCoupons" perm="coupon.operate"></add-more>
        </div>
        <search-list :searchParams="searchParams" :searchData="searchData" class="marketing-search">
          <!--<Button @click="onExportTableList(0, listData)" perm="coupon.view">导出</Button>-->
        </search-list>
        <common-table
          :minWidth="1080"
          :columnsData="columnsData"
          :listData="listData"
          :loading="tableLoading"
          @selectData="onSelectionChange"
          class="marketing-table"
        ></common-table>
        <div class="bar-pager">
          <Page
            v-if="total > 0"
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            @on-change="changePage"
            @on-page-size-change="changePageSize"
            show-sizer
            show-elevator
            :transfer="true"
          />
        </div>
      </TabPane>
      <TabPane label="发放记录" name="1">
        <search-list
          :searchParams="searchCodeParams"
          :searchData="searchCodeData"
          class="marketing-search"
        >
          <!--<Button @click="onExportTableList(1, listRecordData)">导出</Button>-->
        </search-list>
        <common-table
          :minWidth="1400"
          :columnsData="columnsRecordData"
          :listData="listRecordData"
          :loading="tableLoading"
          aline="center"
          @selectData="onSelectionChange"
          class="marketing-table"
        ></common-table>
        <div class="bar-pager">
          <Page
            v-if="total > 0"
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            @on-change="changePage"
            @on-page-size-change="changePageSize"
            show-sizer
            show-elevator
            :transfer="true"
          />
        </div>
      </TabPane>
    </Tabs>
    
    <marketing-manage-coupons
      :isShowCoupons="isShowCoupons"
      :loading="modalLoading"
      @changeCancelCoupons="changeCancelCoupons"
      @changeConfirmCoupons="changeConfirmCoupons"
      :levelList="levelList"
      :memberLevelList="memberLevelList"
      :tablesLoading="tablesLoading"
      @searchMemberButton="searchMemberButton"
      @pageManage="pageManage"
    ></marketing-manage-coupons>
    <marketing-manage-issue
      :cancelCerification="cancelCerification"
      @clickCancelButton="clickCancelButton"
      :titles="titles"
      :okTexts="okTexts"
      :cancelTexts="cancelTexts"
      :types="types"
      @confirmClickButton="confirmClickButton"
      @cancelClickButton="cancelClickButton"
      :member_count="member_count"
      :coupon_count="coupon_count"
      :received_nouse="received_nouse"
      :buttonLoading="buttonLoading"
    ></marketing-manage-issue>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportList"
      @cancelExportList="cancelExportList"
    ></export-modal>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import marketingManageCoupons from "./components/marketing-manage-coupons.vue";
import marketingManageIssue from "./components/marketing-manage-issue.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
const searchData = {
  // 优惠券搜索框的值
  title: "",
  coupon_type: "-1",
  terminal_type: constants.terminalSearch[0].id,
  status: "-1"
};
const searchCodeData = {
  // 优惠券发放搜索框的值
  // title: "",
  keyword: "",
  coupon_type: "-1",
  receive_terminal_type: "",
  status: "-1"
  // mobile: "",
  // nickname: ""
};
export default {
  components: {
    searchList,
    addMore,
    commonTable,
    marketingManageCoupons,
    marketingManageIssue,
    exportModal
  },
  data() {
    return {
      constants,
      modalLoading: false,
      tablesLoading: false, // 弹框表格loading
      tableLoading: false, // 表格loading
      exportUrl: "", // 导出请求地址
      exportListData: {}, // 存储将要导出的数据
      tableListExportStatus: false, // 导出弹框
      name: this.$route.query.tab === "1" ? this.$route.query.tab : "0", // tab页
      searchData: Object.assign({}, searchData),
      searchCodeData: Object.assign({}, searchCodeData),
      currentData: {},
      selectTableData: [], // 选择数据
      currentPage: 1, // 当前页
      pageSize: 10, // 当前页有多少条数据
      total: 10, // 总共有多少条数据
      confirmCouponsData: {}, // 保存发送优惠券的数据
      member_count: "", // 用户数量
      received_nouse: "", // 优惠券被领取且尚未使用张数
      over: "", //是否超出已领取数量
      coupon_count: "", // 优惠券总数量
      couponsId: "", // 优惠券id
      memberLevelList: [], // 会员列表等级
      levelList: {}, // 会员列表数据
      titles: "注意", // 弹框标题
      okTexts: "去修改总数量", // 确认按钮名称
      cancelTexts: "继续发送", // 取消按钮名称
      types: 1, // 1 核销 2 发放 3 禁用
      cancelCerification: false, // 发放确认时弹框
      couponQuantity: 1, // 优惠券数量
      isShowCoupons: false, // 优惠券弹框
      isCheckAll: false, // 全选按钮
      buttonLoading: false,
      useStatusArray: [
        {
          value: 0,
          name: "失效",
          className: "table-error"
        },
        {
          value: 1,
          name: "已使用",
          className: "table-success"
        },
        {
          value: 2,
          name: "未使用",
          className: "table-warning"
        },
        {
          value: 3,
          name: "已过期",
          className: "table-error"
        },
        {
          value: 4,
          name: "已锁定",
          className: "status-warn"
        }
      ],
      searchParams: [
        {
          type: 1,
          // name: "优惠券标题：",
          width: "80px",
          key: "title",
          placeholder: "优惠券标题",
          prefixIcon: "ios-search"
        },
        {
          type: 3,
          name: "类型：",
          key: "coupon_type",
          options: [
            {
              id: "-1",
              value: "全部"
            },
            {
              id: "0",
              value: "现金劵"
            },
            {
              id: "1",
              value: "折扣劵"
            }
          ]
        },
        {
          type: 3,
          name: "状态：",
          key: "status",
          options: [
            {
              id: "-1",
              value: "全部"
            },
            {
              id: "1",
              value: "生效中"
            },
            {
              id: "0",
              value: "已禁用"
            },
            {
              id: "2",
              value: "已过期"
            }
          ]
        },
        {
          type: 3,
          name: "应用终端：",
          // width: "80px",
          // search_new_line: true,
          key: "terminal_type",
          options: constants.terminalSearch
        }
      ],
      searchCodeParams: [
        // {
        //   type: 1,
        //   name: "优惠券标题：",
        //   width: "80px",
        //   key: "title",
        //   placeholder: "请输入优惠券标题"
        // },
        {
          type: 1,
          width: "80px",
          key: "keyword",
          placeholder: "标题/昵称/姓名/手机",
          prefixIcon: "ios-search"
        },
        {
          type: 3,
          name: "类型：",
          key: "coupon_type",
          options: [
            {
              id: "-1",
              value: "全部"
            },
            {
              id: "0",
              value: "现金劵"
            },
            {
              id: "1",
              value: "折扣劵"
            }
          ]
        },
        {
          type: 3,
          name: "状态：",
          key: "status",
          options: [
            {
              id: "-1",
              value: "全部"
            },
            {
              id: "0",
              value: "失效"
            },
            {
              id: "1",
              value: "已使用"
            },
            {
              id: "2",
              value: "未使用"
            },
            {
              id: "3",
              value: "已过期"
            },
            {
              id: "4",
              value: "已锁定"
            }
          ]
        } /*,
        {
          type: 3,
          name: "领取终端：",
          key: "receive_terminal_type",
          options: constants.terminalSearch
        }*/
        // {
        //   type: 1,
        //   name: "会员昵称：",
        //   width: "80px",
        //   search_new_line: true,
        //   key: "nickname"
        // },
        // {
        //   type: 1,
        //   name: "手机号：",
        //   key: "mobile"
        // }
      ],
      columnsData: [
        // {
        //   type: "selection",
        //   width: 60,
        //   align: "center"
        // },
        {
          title: "优惠券标题",
          key: "title",
          align: "left",
          minWidth: 160
        },
        {
          title: "门槛/面值/类型",
          align: "center",
          minWidth: 128,
          render: (h, params) => {
            var arr = [];
            if (params.row.doorsill_type == 1) {
              arr.push(`满${params.row.doorsill_full_money}元可用`);
            } else {
              arr.push("无门槛使用");
            }
            if (params.row.coupon_type == 1) {
              arr.push(`${parseFloat(params.row.coupon_money)}折`);
            } else {
              arr.push(`${params.row.coupon_money}元`);
            }
            if (params.row.coupon_type == 1) {
              arr.push("折扣券");
            } else {
              arr.push("现金券");
            }
            return h("span", [arr[0], h("br"), arr[1], h("br"), arr[2]]);
          }
        },
        {
          title: "有效期",
          align: "center",
          key: "effective_time",
          minWidth: 100,
          render: (h, params) => {
            var pair = [];
            if (params.row.effective_type == 0) {
              pair = params.row.effective_time.split("-");
            }
            if (pair.length == 2) {
              return h("span", [pair[0], h("br"), pair[1]]);
            } else {
              return h("span", params.row.effective_time);
            }
          }
        },
        {
          title: "可用商品",
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            if (params.row.product_info === "全场商品") {
              return h("div", params.row.product_info);
            } else if (params.row.product_type === 2) {
              return h("div", "指定商品");
            } else {
              return h(
                "div",
                ((render, params) => {
                  const rows = [];
                  rows.push(
                    h(
                      "Tooltip",
                      {
                        props: {
                          content: params.row.product_info,
                          placement: "top-start",
                          "max-width": 400,
                          disabled: params.row.product_type !== 1
                        }
                      },
                      [
                        h(
                          "div",
                          { class: "table-area-shape" },
                          params.row.product_info
                        )
                      ]
                    )
                  );
                  return rows;
                })(h, params)
              );
            }
          }
        },
        {
          title: "用户群",
          key: "member_type",
          minWidth: 80,
          align: "center"
        },
        {
          title: "可领取",
          minWidth: 80,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.can_received === -1 ? "无限" : params.row.can_received
            );
          }
        },
        {
          title: "已领取",
          align: "center",
          key: "have_received",
          minWidth: 80
        },
        // {
        //   title: "已使用",
        //   key: "already_used",
        //   width: 120,
        //   align: "center"
        // },
        // {
        //   title: "使用率",
        //   minWidth: 80,
        //   align: "center",
        //   key: "use_rate"
        // },
        {
          title: "已使用/使用率",
          minWidth: 122,
          align: "center",
          render: (h, p) => {
            return h("div", [p.row.already_used, h("br"), p.row.use_rate]);
          }
        },
        {
          title: "应用终端",
          minWidth: 120,
          align: "center",
          key: "terminal_type"
        },
        {
          title: "状态",
          minWidth: 80,
          align: "center",
          key: "status",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  "text-align": "center"
                },
                class: {
                  "table-success": params.row.status === 1,
                  "table-error": params.row.status === 0 || params.row.status === 2
                }
              },
              params.row.status === 0
                ? "已禁用"
                : params.row.status == 1 ? "生效中" : "已过期"
            );
          }
        },
        {
          title: "操作",
          align: "center",
          width: 130,
          render: (h, params) => {
            var edit = h(
              "span",
              {
                style: {
                  "margin-right": "10px"
                },
                class: { "table-operation": true },
                on: {
                  click: () => {
                    this.rowIndex = params.index;
                    this.$router.push({
                      name: "marketingManageEdit",
                      query: {
                        id: params.row.id,
                        status: params.row.status
                      }
                    });
                  }
                }
              },
              "编辑"
            );
              var line = h(
                  "span",
                  {
                      style: {
                          "margin-right": "2px",
                      },
                      class: { "table-operation": true }
                  },
                  "|"
              );
            var del = h(
              "span",
              {
                class: { "table-operation": true },
                attrs: {
                  perm: "coupon.operate"
                },
                on: {
                  click: () => {
                    this.deleteData(params.row.id);
                  }
                }
              },
              "删除"
            );
            var disable = h(
              "span",
              {
                class: { "table-operation": true },
                style: {
                  display: "inline-block",
                  width: "50px"
                },
                attrs: {
                  perm: "coupon.operate"
                },
                on: {
                  click: () => {
                    this.couponsId = params.row.id;
                    this.titles = "注意";
                    this.okTexts = "确认禁用";
                    this.types = 3;
                    this.cancelTexts = "取消";
                    this.currentData = params.row;

                    var obj = {};
                    obj.id = params.row.id;
                    obj.effective_endtime = params.row.effective_endtime;
                    obj.effective_type = params.row.effective_type;
                    this.couponDisable(obj);
                  }
                }
              },
              "禁用"
            );
            var more = h(
              "Dropdown",
              {
                style: { width: "50px" },
                attrs: {
                  trigger: "click",
                  transfer: true,
                  perm: "coupon.operate"
                },
                on: {
                  "on-click": name => {
                    this.couponsId = params.row.id;
                    if (params.row.status === 0) {
                      // if (name === 3) {
                      //   this.deleteData(params.row.id);
                      // } else {
                      //   if (
                      //     params.row.effective_type === 0 &&
                      //     params.row.effective_endtime <
                      //       parseInt(
                      //         Math.round(
                      //           new Date().getTime() / 1000
                      //         ).toString()
                      //       )
                      //   ) {
                      //     this.$Modal.info({
                      //       title: "注意",
                      //       content:
                      //         "当前优惠券有效期已过期，请重新进行更改。"
                      //     });
                      //     return false;
                      //   }
                      //   params.row.status = 1;
                      //   this.changeStatusPost(params.row);
                      // }
                    } else {
                      // 发放
                      if (name === 0) {
                        this.getMemberList({ page_size: 10 });
                        this.isShowCoupons = true;
                      } else {
                        // 禁用

                        this.titles = "注意";
                        this.okTexts = "确认禁用";
                        this.types = 3;
                        this.cancelTexts = "取消";
                        this.currentData = params.row;

                        var obj = {};
                        obj.id = params.row.id;
                        obj.effective_endtime = params.row.effective_endtime;
                        obj.effective_type = params.row.effective_type;
                        this.couponDisable(obj);
                      }
                    }
                  }
                }
              },
              [
                h(
                  "span",
                  {
                    attrs: { href: "javascript:void(0)" },
                    class: { "table-operation": true }
                  },
                  ["更多", h("Icon", { attrs: { type: "ios-arrow-down" } })]
                ),
                h(
                  "DropdownMenu",
                  { slot: "list", style: { minWidth: "50px" } },
                  [
                    h(
                      "DropdownItem",
                      {
                        attrs: { name: 0 },
                        style: { padding: "7px 0px", "text-align": "center" },
                        class: { isHide: params.row.status === 0 }
                      },
                      "发放"
                    ),
                    h(
                      "DropdownItem",
                      {
                        attrs: { name: 1 },
                        style: { padding: "7px 0px", "text-align": "center" },
                        class: { isHide: params.row.status === 0 }
                      },
                      "禁用"
                    )
                  ]
                )
              ]
            );
            var hideDist = false;
            var end = null,
              now = new Date();
            if (
              params.row.effective_type == 0 &&
              params.row.effective_endtime
            ) {
              end = new Date(
                Number(params.row.effective_endtime) * 1000 +
                  24 * 60 * 60 * 1000 -
                  1
              );
              if (now.getTime() > end.getTime()) {
                hideDist = true;
              }
            }
            return h("div", [
              params.row.status === 1 ? edit : del,
              params.row.status === 1 ? line : "",
              params.row.status === 1 ? (hideDist ? disable : more) : ""
            ]);
          }
        }
      ],
      listData: [],
      columnsRecordData: [
        // {
        //   type: "selection",
        //   width: 40,
        //   align: "center"
        // },
        {
          title: "优惠券标题",
          key: "title",
          align: "left",
          minWidth: 160
        },
        {
          title: "劵码",
          key: "code",
          align: "center",
          minWidth: 150
        },
        {
          title: "门槛/面值/类型",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            var menkan = "";
            if (params.row.doorsill_type == 1) {
              menkan += `满 ${params.row.doorsill_full_money} 元`;
            } else {
              menkan += "无门槛";
            }
            var amount = "";
            if (params.row.coupon_type == 1) {
              amount += `打 ${parseFloat(params.row.coupon_money)} 折`;
            } else {
              amount += `减 ${params.row.coupon_money} 元`;
            }
            return h("span", [
              menkan,
              h("br"),
              amount,
              h("br"),
              params.row.coupon_type == 1 ? "折扣券" : "现金券"
            ]);
          }
        },
        // {
        //   title: "类型",
        //   align: "center",
        //   render: (h, params) => {
        //     return h(
        //       "span",
        //       params.row.coupon_type === 0 ? "现金劵" : "折扣劵"
        //     );
        //   }
        // },
        {
          title: "优惠",
          align: "center",
          minWidth: 80,
          render: (h, params) => {
            return h(
              "span",
              params.row.coupon_type === 0
                ? params.row.coupon_money + "元"
                : parseFloat(params.row.coupon_money) + "折"
            );
          }
        },
        // {
        //   title: "领取终端",
        //   align: "center",
        //   render: (h, params) => {
        //     return h(
        //       "span",
        //       params.row.receive_terminal_type?constants.terminalSearch.map(item => {
        //         if (params.row.receive_terminal_type === item.id) {
        //           return item.value;
        //         }
        //       }):'--'
        //     );
        //   }
        // },
        {
          title: "领取/过期时间",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    display: "block"
                  }
                },
                params.row.receive_time
              ),
              h(
                "span",
                {
                  style: {
                    display: "block"
                  }
                },
                params.row.expiry_time
              )
            ]);
          }
        },
        {
          title: "使用时间",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            return h("span", params.row.use_time || "--");
          }
        },
        {
          title: "使用终端",
          align: "center",
          key: "use_terminal_type",
          minWidth: 90,
          render: (h, params) => {
            return h(
              "span",
              params.row.use_terminal_type
                ? params.row.use_terminal_type === 5
                  ? "手动核销"
                  : constants.terminalSearch.map(item => {
                      if (params.row.use_terminal_type === item.id) {
                        return item.value;
                      }
                    })
                : "--"
            );
          }
        },
        {
          title: "会员信息",
          minWidth: 170,
          render: (h, params) => {
            return h("div", {
                attrs: {
                  perm: "member.detail.view"
                },
                style: {
                  cursor: "pointer",
                  padding: "10px 0",
                  lineHeight: "16px"
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "memberDetail",
                      query: {
                        id: params.row.member_id
                      }
                    });
                  }
                }
              }, [
              h(
                "span",
                {
                  class: "one-hide"
                },
                params.row.nickname
              ),
              h(
                "span",
                {
                  class: "one-hide",
                  style: {
                    color: "#9EA7B4"
                  }
                },
                "姓名：" + params.row.name
              ),
              h(
                "span",
                {
                  style: {
                    display: "block",
                    color: "#9EA7B4"
                  }
                },
                "手机：" + params.row.mobile
              ),
              h(
                "span",
                {
                  style: {
                    display: "block",
                    color: "#9EA7B4"
                  }
                },
                "ID：" + params.row.member_id
              )
            ]);
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 80,
          render: (h, params) => {
            return h(
              "span",
              {
                class: this.useStatusArray.find(item => {
                  return params.row.item_status === item.value;
                }).className
              },
              this.useStatusArray.map(item => {
                if (params.row.item_status === item.value) {
                  return item.name;
                }
              })
            );
          }
        },
        {
          title: "备注",
          align: "center",
          minWidth: 180,
          render: (h, params) => {
            return h("span", params.row.remark || "--");
          }
        },
        {
          title: "操作",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-operation":
                      params.row.status === 1 && params.row.item_status === 2
                  },
                  attrs: {
                    perm: "coupon.operate"
                  },
                  on: {
                    click: () => {
                      if (params.row.item_status === 2) {
                        this.cancelCerification = true;
                        this.titles = "核销";
                        this.okTexts = "确认";
                        this.types = 1;
                        this.cancelTexts = "取消";
                        this.currentData = params.row;
                      }
                    }
                  }
                },
                params.row.status === 1
                  ? params.row.item_status === 2 ? "核销" : "--"
                  : "--"
              )
            ]);
          }
        }
      ],
      listRecordData: [],
      commonFunction,
      nums: 0 // 0 优惠券导出 1 发放导出
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.searchDatas();
      },
      deep: true
    },
    searchCodeData: {
      handler() {
        this.currentPage = 1;
        this.searchCodeDatas();
      },
      deep: true
    },
    name(val) {
      this.$router.replace({
        name: "marketingManage",
        query: {
          tab: val
        }
      });
      this.onTabSetting();
    }
  },
  methods: {
    // 会员选择翻页
    pageManage(val) {
      this.getMemberList(val);
    },
    // 切换tab页
    onTabSetting() {
      this.selectTableData = [];
      if (this.name === "0") {
        this.searchData = Object.assign({}, searchData);
      } else {
        this.searchCodeData = Object.assign({}, searchCodeData);
      }
    },
    // 分页
    changePage(val) {
      this.currentPage = val;
      let obj = this.merge();
      if (this.name === "0") {
        this.getList(obj);
      } else {
        this.getIssueList(obj);
      }
    },
    // 分页条数
    changePageSize(val) {
      this.pageSize = val;
      this.currentPage = 1;
      let obj = this.merge();
      if (this.name === "0") {
        this.getList(obj);
      } else {
        this.getIssueList(obj);
      }
    },
    // 分页，条数改变合并搜索条件
    merge() {
      let obj = {};
      if (this.name === "0") {
        obj = this.searchData;
      } else {
        obj = this.searchCodeData;
      }
      obj.page = this.currentPage;
      obj.page_size = this.pageSize;
      return obj;
    },
    // 选中的列表数据
    onSelectionChange(selectData) {
      this.selectTableData = [];
      this.selectTableData = selectData;
    },
    // 取消关闭发放弹框
    clickCancelButton() {
      this.cancelCerification = false;
    },
    // 取消模态框
    cancelExportList() {
      this.tableListExportStatus = false;
    },

    // 导出功能
    onExportTableList(num, datas) {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.nums = num;
      if (num === 1) {
        this.exportUrl = "/shop/admin/coupon/item/export";
      } else {
        this.exportUrl = "/shop/admin/coupon/export";
      }
      this.exportListData.show_all = "";
      if (datas.length > this.selectTableData.length) {
        this.exportListData.ids = [];
        this.selectTableData.forEach(item => {
          if (num === 1) {
            this.exportListData.ids.push(item.item_id);
          } else {
            this.exportListData.ids.push(item.id);
          }
        });
        this.commonFunction.exportTable(
          this.exportListData,
          this.http,
          this.exportUrl
        );
      } else {
        this.tableListExportStatus = true;
      }
    },
    // 导出当前页 0 导出所有 1
    exportList(val) {
      this.exportListData.ids = [];
      if (val === 1) {
        this.exportListData.show_all = 1;
      } else {
        this.selectTableData.forEach(item => {
          if (this.nums === 1) {
            this.exportListData.ids.push(item.item_id);
          } else {
            this.exportListData.ids.push(item.id);
          }
        });
      }
      this.commonFunction.exportTable(
        this.exportListData,
        this.http,
        this.exportUrl
      );
      this.tableListExportStatus = false;
    },
    // 禁用
    couponDisable(params) {
      // this.cancelCerification = true;
      this.$httpPost(
        "/shop/admin/coupon/couponitem",
        { coupon_id: params.id },
        res => {
          if (res.code === 200) {
            this.member_count = String(res.data.member_count);
            this.received_nouse = String(res.data.received_count);
            this.$Modal.confirm({
              title: "提示",
              content: `该优惠券被领取但尚未使用的数量为${
                this.received_nouse
              }张，共被${
                this.member_count
              }个会员领取。除非必要，请不要随意禁用。一旦禁用，这些券将会“失效”，不能再使用，是否确定禁用？`,
              onOk: () => {
                let obj = this.currentData;
                obj.status = 0;
                this.changeStatusPost(obj);
              }
            });
          }
        }
      );
    },
    // 删除
    deleteData(id) {
      this.$Modal.confirm({
        title: "提示",
        content: "删除后将不可恢复，是否确定删除该优惠券？",
        onOk: () => {
          this.$httpPost("/shop/admin/coupon/delete", { id: id }, res => {
            if (res.code === 200) {
              this.$Message.success("删除成功");
              this.getList(this.searchData);
            }
          });
        }
      });
    },
    // 优惠券查询
    searchDatas() {
      let val = this.merge();
      this.getList(val);
    },
    // 优惠券发放查询
    searchCodeDatas() {
      let val = this.merge();
      this.getIssueList(val);
    },
    onClickCancel() {
      this.cancelCerification = false;
    },
    // 新增优惠券
    onAddCoupons() {
      this.$router.push({ name: "marketingManageAdd" });
    },
    changeCancelCoupons() {
      this.isShowCoupons = false;
    },
    // 判断会员数量与优惠券数量
    changeConfirmCoupons(obj) {
      this.modalLoading = true;
      obj.id = this.couponsId;
      this.confirmCouponsData = obj;
      this.$httpGet("/shop/admin/coupon/checkcouponamount", obj, res => {
        if (res.code) {
          this.$httpGet("/shop/admin/coupon/sendCoupon", obj, res => {
            this.modalLoading = false;
            this.isShowCoupons = false;
            if (res.code === 200) {
              this.$Message.success("发送成功");
              this.getList({
                page: this.currentPage,
                page_size: this.pageSize
              });
            } else {
              this.$Message.error("发送失败");
            }
          });
        } else {
          this.modalLoading = false;
          this.isShowCoupons = false;
          this.over = res.data.over;
          if (res.data.member_count > res.data.coupon_count) {
            this.member_count = String(res.data.member_count);
            this.coupon_count = String(res.data.coupon_count);
            this.cancelCerification = true;
            this.titles = "注意";
            this.okTexts = "去修改总数量";
            this.types = 2;
            this.cancelTexts = "继续发送";
            return false;
          }
          //可能没有超出总数量，但有可能超出了可领取数量
          if (this.over) {
            this.types = 2;
            this.$Modal.info({
              title: "提示信息",
              content: "其中若用户已达到限领张数，则不再为其发送优惠券哦~",
              onOk: () => {
                this.cancelClickButton();
              }
            });
          }
        }
      });
    },
    // 点击 1 核销取消 2 继续发送
    cancelClickButton() {
      if (this.types === 2) {
        this.buttonLoading = true;
        this.$httpGet(
          "/shop/admin/coupon/sendCoupon",
          this.confirmCouponsData,
          res => {
            if (res.code === 200) {
              this.buttonLoading = false;
              this.$Message.success("发送成功");
              this.getList({
                page: this.currentPage,
                page_size: this.pageSize
              });
            }
          }
        );
      }
      this.cancelCerification = false;
    },
    // 点击 1 核销成功 2 去修改总数量 3 禁用成功
    confirmClickButton(val) {
      this.cancelCerification = false;
      if (this.types === 3) {
        let obj = this.currentData;
        obj.status = 0;
        this.changeStatusPost(obj);
      } else if (this.types === 1) {
        this.verificationSuccess(val);
      } else if (this.types === 2) {
        this.$router.push({
          name: "marketingManageEdit",
          query: {
            id: this.couponsId,
            status: val.status
          }
        });
      }
    },
    // 核销成功
    verificationSuccess(val) {
      let obj = {};
      obj.id = this.currentData.item_id;
      obj.remark = val.note;
      obj.status = val.status;
      this.$httpGet("/shop/admin/coupon/item/confirm", obj, res => {
        if (res.code === 200) {
          this.$Message.success("核销成功");
          let newObj = this.merge();
          this.getIssueList(newObj);
        }
      });
    },
    // 搜索会员列表
    searchMemberButton(val) {
      this.getMemberList(val);
    },
    // 获取会员列表
    getMemberList(params) {
      if (params && params.level === 0) {
        params.level = "";
      }
      this.tablesLoading = true;
      this.$httpGet("/shop/admin/coupon/memberandlevel", params, res => {
        this.tablesLoading = false;
        if (res.code === 200) {
          this.levelList = res.data;
          this.levelList.member_data.current = Number(
            this.levelList.member_data.current
          );
          if (params) {
            this.memberLevelList = res.data.level_data.list;
          }
        }
      });
    },
    // 优惠券发放
    couponPost(row) {
      let obj = {};
      obj.level = row.id;
      obj.nickname = row;
      this.$httpGet("/shop/admin/coupon/memberandlevel", obj, res => {
        if (res.code === 200) {
          this.getList({ page: this.currentPage, page_size: this.pageSize });
        }
      });
    },
    // 改变优惠券的状态
    changeStatusPost(row) {
      let obj = {};
      obj.id = row.id;
      obj.status = row.status;
      this.searchData;
      let newSearchData = {};
      newSearchData.title = this.searchData.title;
      newSearchData.coupon_type = this.searchData.coupon_type;
      newSearchData.terminal_type = this.searchData.terminal_type;
      newSearchData.status = this.searchData.status;
      newSearchData.page = this.currentPage;
      newSearchData.page_size = this.pageSize;
      this.$httpGet("/shop/admin/coupon/status", obj, res => {
        if (res.code === 200) {
          this.getList(newSearchData);
        }
      });
    },
    // 获取优惠券列表数据
    getList(val) {
      this.tableLoading = true;
      this.$httpGet("/shop/admin/coupon/list", val, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.listData = [];
          this.$nextTick(() => {
            this.tableLoading = false;
            this.listData = res.data.list;
            this.currentPage = res.data.current;
            this.pageSize = res.data.page_size;
            this.total = res.data.total;
          });
        }
      });
    },
    // 获取优惠券发放列表
    getIssueList(val) {
      this.tableLoading = true;
      this.$httpGet("/shop/admin/coupon/item/list", val, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.listRecordData = [];
          this.$nextTick(() => {
            this.tableLoading = false;
            this.listRecordData = res.data.list;
            this.currentPage = res.data.current;
            this.pageSize = res.data.page_size;
            this.total = res.data.total;
          });
        }
      });
    }
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.onTabSetting();
  }
};
</script>
<style lang="less" scoped>
.marketing-list {
  height: 100%;
  overflow: auto;
  /deep/.ivu-table-wrapper.common-table-noborder {
    overflow: initial;
  }
  /deep/.ivu-tabs {
    overflow: visible;
    .ivu-tabs-content{
      padding:24px 24px 0;
      height: calc(100vh - 121px);
      overflow: auto;
    }
  }
  .marketing-list-left {
    text-align: left;
    .add-more-btn{
      /deep/.ivu-btn-primary{
        width: 100px;
      }
    }
    // margin-left: 24px;
    // margin-top: 24px;
  }
  /deep/.table-area-shape {
    margin: 0 -18px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    padding: 3px 15px;
    overflow: hidden;
  }
  .marketing-search {
    // background-color: #f8f9fd;
    // border-radius: 5px;
    // margin: 24px;
    // text-align: left;
    // padding-top: 16px;
    // padding-left: 15px;
    /deep/.data-list-search-item {
      & > span {
        width: auto;
      }
      &:nth-last-child(2) {
        margin-right: 12px;
      }
    }
    /deep/.data-list-search-btn {
      button:last-child {
        margin-right: 15px;
      }
    }

    /deep/.data-list-search-btn {
      display: inline-block;
      margin-bottom: 0;
    }
  }
  .marketing-table {
    // margin: 0 24px;
    /deep/.ivu-table-default {
      table {
        tbody {
          tr td:nth-child(3) .ivu-table-cell {
            -webkit-line-clamp: 3 !important;
          }
        }
      }
    }
  }
  /deep/.ivu-tabs-nav-scroll {
    .ivu-tabs-tab {
      font-size: 15px;
    }
  }
}
</style>
<style lang="less">
.ivu-dropdown-transfer {
  margin: 0;
  padding: 0;
  .ivu-dropdown-item:hover {
    background: #4a6af5;
    color: #fff;
  }
  .ivu-dropdown-item {
    padding: 3px 0px !important;
  }
}
</style>
