<template>
  <div class="marketing-integral">
    <Tabs :animated="false" v-model="tabSelectIndex">
      <TabPane label="积分列表" name="0" class="integral-preferential">
        <add-more
          text="新增记录"
          @onAddMoreClick="onAddMoreClick"
          class="marketing-add"
          perm="point.operate"
        ></add-more>
        <search-list :searchParams="searchParams" :searchData="searchData" class="marketing-search">
          <!--<Button @click="onExportTableList" perm="point.view">导出</Button>-->
        </search-list>
        <common-table
          :columnsData="columnsData"
          :minWidth="1094"
          :loading="tableLoading"
          :listData="listData"
          @selectData="onSelectionChange"
          class="marketing-table"
        ></common-table>
        <div class="bar-pager">
          <Page
            v-if="total"
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            show-elevator
            show-sizer
            @on-change="onChangePage"
            @on-page-size-change="onChangePageSize"
            class="page-style"
            :transfer="true"
          />
        </div>
      </TabPane>
      <TabPane label="积分设置" name="1" class="integral-setting">
        <Form
          ref="formItem"
          :rules="ruleItem"
          :model="formItem"
          :label-width="130"
          style="text-align:left"
          v-if="isFormContainer"
        >
          <switch-titlebar
            v-model="formItem.status"
            title="是否开启积分功能"
            @on-change="onSwitchChange"
          />
          <div v-show="formItem.status === 1">
            <FormItem v-show="false" label="应用渠道：" prop="checkbox" class="channel-setting">
              <CheckboxGroup v-model="formItem.checkbox">
                <Checkbox v-for="(item, index) in checkboxs" :key="index" :label="item.name"></Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem label="抵扣方式：" prop="deductionMethod">
              <CheckboxGroup v-model="formItem.deductionMethod">
                <Checkbox label="商城购物消费抵扣"></Checkbox>
              </CheckboxGroup>
            </FormItem>

            <div
              v-if="formItem.deductionMethod.length >= 1"
              style="margin-left: 115px;margin-bottom:20px"
            >
              <FormItem label="订单抵扣：" prop="out_order_pay_point">
                <label style="margin-right:10px;">每</label>
                <InputNumber
                  v-model="formItem.out_order_pay_point"
                  :min="0"
                  style="width:110px;"
                  class="common-mr-12"
                  placeholder="请输入积分"
                ></InputNumber>
                <label>积分可抵扣1元</label>
                <more-message text="输入非零整数，值不能为空" placement="bottom" class="common-ml-12"></more-message>
              </FormItem>
              <FormItem label="最大积分抵扣：" prop="out_order_pay_max_percent">
                <InputNumber
                  v-model="formItem.out_order_pay_max_percent"
                  :min="0"
                  :max="100"
                  style="width:110px;"
                  class="common-mr-12"
                  placeholder="请输入抵扣比例"
                ></InputNumber>
                <label>%</label>
                <more-message text="每笔订单，使用积分抵扣最大能抵扣多少比例" placement="bottom" class="common-ml-12"></more-message>
              </FormItem>
            </div>
            <FormItem label="积分转赠：">
              <RadioGroup v-model="pointGiveStatus">
                <Radio :label="1">
                  <span>允许</span>
                </Radio>
                <Radio :label="0">
                  <span>不允许</span>
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="转赠对象：" v-show="pointGiveStatus">
              <RadioGroup v-model="pointGiveTarget">
                <Radio :label="1">任何会员</Radio>
                <Radio :label="2">所有下级</Radio>
                <Radio :label="3">所有直推下级</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="获取途径：" prop="tables" style="margin-bottom:0">
              <Table
                class="table2"
                border
                :loading="tableLoading"
                :columns="pathColumnsData"
                :data="pathListData"
              ></Table>
            </FormItem>
          </div>
        </Form>
        <foot-button v-if="showSaveButton">
          <Button type="primary" class="save" @click="onSaveData" perm="point.operate">保存</Button>
        </foot-button>
      </TabPane>
    </Tabs>
    <marketing-integral-add
      v-model="isShowNewRecord"
      @chooseMemberButton="chooseMemberButton"
      @cancelAddMember="cancelAddMember"
      :chooseMemberListData="chooseMemberListData"
      @saveAddMember="saveAddMember"
    ></marketing-integral-add>
    <marketing-integral-choose
      v-model="isShowChooseMember"
      :isShowChoose="isShowChoose"
      @chooseMemberList="chooseMemberList"
      :chooseMemberData="chooseMemberData"
      :choosepage="choosepage"
      :tablesLoading="tablesLoading"
      :tableListLength="tableListLength"
      :memberLevelList="memberLevelList"
      @changeChoosePage="changeChoosePage"
      @changeChoosePageSize="changeChoosePageSize"
      @searchButton="searchButton"
      @memberListData="memberListData"
    ></marketing-integral-choose>
    <Modal v-model="isShowSwitch" title="积分关闭" width="430">
      <div style="height: 118px">若关闭积分功能，商场将关闭积分功能。用户积分数据仍然保留，但不能使用。是否继续进行关闭积分功能？</div>
      <div slot="footer">
        <Button type="text" @click="onCancle">取消</Button>
        <Button type="primary" @click="onRemainClosed">继续关闭</Button>
      </div>
    </Modal>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportList"
      @cancelExportList="cancelExportList"
    ></export-modal>
  </div>
</template>
<script>
import addMore from "@/views/shop/components/button/add-more.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import marketingIntegralAdd from "./components/marketing-integral-add.vue";
import marketingIntegralChoose from "./components/marketing-integral-choose.vue";
import constants from "@/views/shop/components/constants.js";
import footButton from "COMPONENTS/button/foot-button.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
import commonFunction from "@/views/shop/components/common-function.js";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const searchData = {
  // 搜索框的值
  keyword: "",
  terminal_type: -1,
  in_type: -1,
  times: {
    startTime: "",
    endTime: ""
  }
};
export default {
  components: {
    searchList,
    commonTable,
    addMore,
    marketingIntegralAdd,
    marketingIntegralChoose,
    footButton,
    moreMessage,
    exportModal,
    switchTitlebar
  },
  data() {
    return {
      commonFunction,
      constants,
      tabSelectIndex: this.$route.query.tab === "1" ? this.$route.query.tab : "0",
      tableLoading: false, // 表格loading
      isShowChoose: false, // 解决添加成功后默认选中会员的bug
      memberLevelList: [],
      selectTableData: [], // 选择数据
      isShowSwitch: false, // 是否关闭按钮弹框提示
      isFormContainer: false, // 是否显示表单的内容（解决表单内容占据高度的问题）
      searchData: JSON.parse(JSON.stringify(searchData)),
      startTimes: "", // 开始时间
      endTimes: "", // 结束时间
      currentPage: 1, // 当前页
      pageSize: 10, // 每页有多少条数据
      total: 0, // 总共有多少条数据
      terminalTypes: constants.terminalTypes, // 接收终端来源的数据
      correspondingIntegral: constants.container, // 获取路径
      isShowNewRecord: false, // 新增弹框
      isShowChooseMember: false, // 选择会员
      pointGiveStatus: 1, //新增是否允许积分转赠
      pointGiveTarget: 1, //转赠对象
      pathColumnsData: [
        // 积分设置
        {
          title: "积分获取途径",
          align: "center",
          render: (h, params) => {
            return h("span", params.row.label);
          }
        },
        {
          title: "对应积分",
          minWidth: 400,
          render: (h, params) => {
            return h("div", [
              h("span", params.row.name),
              h("InputNumber", {
                style: {
                  width: "110px",
                  height: "32px",
                  margin: "0 10px"
                },
                class: {
                  "is-hide": !params.row.keyConsume
                },
                attrs: {
                  min: 1,
                  value: params.row.consumeValue,
                  placeholder: "请输入金额"
                },
                on: {
                  "on-change": val => {
                    this.formData[params.row.keyConsume] = val;
                  }
                }
              }),
              h(
                "span",
                {
                  class: {
                    "is-hide": !params.row.keyConsume
                  }
                },
                params.row.names
              ),
              h("InputNumber", {
                style: {
                  width: "110px",
                  height: "32px",
                  margin: "0 10px"
                },
                attrs: {
                  min: 1,
                  value: this.pathListData[params.index].keyValue,
                  placeholder: "请输入积分"
                },
                on: {
                  "on-change": val => {
                    this.formData[params.row.key + "point"] = val;
                  }
                }
              }), //<more-message text="每笔订单，使用积分抵扣最大能抵扣多少比例" placement="bottom" class="common-ml-12"></more-message>
              h("span", "积分"),
              params.row.tips &&
                h(moreMessage, {
                  props: {
                    text: params.row.tips,
                    placement: "top"
                  },
                  style: {
                    "margin-left": "10px"
                  }
                })
            ]);
          }
        },
        {
          title: "备注",
          key: "note",
          align: "center",
          render: (h, params) => {
            return h("span", params.row.note === 1 ? "一次性" : "日常");
          }
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  status: true,
                  "table-error": params.row.status === 0,
                  "table-success": params.row.status === 1
                }
              },
              params.row.status === 1 ? "启用" : "禁用"
            );
          }
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    if (this.pathListData[params.index].status === 0) {
                      this.formData[params.row.key + "status"] = 1;
                      this.pathListData[params.index].status = 1;
                    } else {
                      this.formData[params.row.key + "status"] = 0;
                      this.pathListData[params.index].status = 0;
                    }
                  }
                }
              },
              params.row.status === 1 ? "禁用" : "启用"
            );
          }
        }
      ],
      pathListData: [
        // 获取路径
        {
          label: "完善个人资料",
          name: "自主完善个人资料，赠送",
          val: 3,
          note: 1,
          status: 0,
          key: "in_member_info_",
          keyValue: null
        },
        {
          label: "登录",
          name: "每日登录成功，赠送",
          val: 2,
          note: 0,
          status: 0,
          key: "in_member_login_",
          keyValue: null
        },
        {
          label: "自主注册",
          name: "自主注册成为会员，赠送",
          val: 1,
          note: 1,
          status: 1,
          key: "in_member_reg_",
          keyValue: null
        },
        {
          label: "购物",
          name: "每消费",
          names: "元，赠送",
          keyConsume: "in_consume_per_price",
          consumeValue: null,
          val: 4,
          note: 0,
          status: 0,
          key: "in_consume_",
          keyValue: null
        },
        // {
        //   label: '评论商品',
        //   name: '每完成一次评论，赠送',
        //   val: 5,
        //   note: 0,
        //   status: 0,
        //   keyValue: 0
        // },
        {
          label: "充值",
          name: "每充值1元，赠送",
          val: 6,
          note: 0,
          status: 1,
          key: "in_recharge_",
          keyValue: null
        },
        {
          label: "首次分享",
          name: "每日首次分享成功，赠送",
          val: 7,
          note: 0,
          status: 1,
          key: "in_share_",
          keyValue: null
        },
        {
          label: "推荐新会员",
          name: "每成功推荐新会员，赠送",
          val: 8,
          note: 0,
          status: 1,
          key: "in_member_recommend_",
          keyValue: null,
          tips: "推荐的新用户，注册成功成为会员，则赠送对应积分"
        }
      ],
      checkboxs: [
        // 应用渠道
        {
          name: "公众号",
          val: 1
        },
        {
          name: "H5",
          val: 2
        },
        {
          name: "微信小程序",
          val: 3
        },
        {
          name: "PC",
          val: 4
        }
      ],
      formItem: {
        // 表单数据
        checkbox: ["公众号", "H5", "微信小程序", "PC"],
        status: 1,
        deductionMethod: [],
        out_order_pay_point: "",
        out_order_pay_max_percent: ""
      },
      ruleItem: {
        // 验证规则
        out_order_pay_point: [
          {
            required: true,
            message: "订单抵扣不能为空",
            trigger: "blur",
            type: "number"
          },
          {
            message: "请输入非零整数",
            trigger: "change",
            pattern: /^\+?[1-9][0-9]*$/
          }
        ],
        out_order_pay_max_percent: [
          {
            required: true,
            message: "最大积分抵扣不能为空",
            trigger: "blur",
            type: "number"
          },
          {
            message: "请输入非零整数",
            trigger: "change",
            pattern: /^\+?[1-9][0-9]*$/
          }
        ],
        checkbox: [
          {
            required: true,
            type: "array",
            min: 1,
            message: "至少选择一个应用渠道",
            trigger: "change"
          }
        ]
      },
      isCheckAll: false, // 默认隐藏全选按钮
      searchParams: [
        // 搜索
        {
          type: 1,
          width: "65px",
          key: "keyword",
          placeholder: "昵称/姓名/手机",
          prefixIcon: "ios-search"
        },
        // {
        //   type: 1,
        //   width: "65px",
        //   name: "会员昵称：",
        //   key: "nickname",
        //   placeholder: "请输入会员名称"
        // },
        // {
        //   type: 1,
        //   name: "手机号：",
        //   key: "mobile",
        //   placeholder: "请输入手机号"
        // },
        {
          type: 3,
          name: "来源/用途：",
          key: "in_type",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              value: "其他",
              id: 0
            },
            {
              value: "注册会员",
              id: 1
            },
            {
              value: "登录",
              id: 2
            },
            {
              value: "完善个人资料",
              id: 3
            },
            {
              value: "购物",
              id: 4
            },
            // {
            //   value: '评论商品',
            //   id: '5'
            // },
            {
              value: "充值",
              id: 6
            },
            {
              value: "首次分享",
              id: 7
            },
            {
              value: "推荐新会员",
              id: 8
            },
            {
              value: "推荐新分销商",
              id: 9
            },
            {
              value: "申请成为分销商",
              id: 10
            },
            {
              value: "订单抵扣",
              id: 11
            },
            {
              value: "积分转赠收入",
              id: 13
            },
            {
              value: "积分转赠支出",
              id: 14
            }
          ]
        },
        {
          type: 3,
          name: "终端来源：",
          width: "65px",
          key: "terminal_type",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 2,
              value: "H5"
            },
            {
              id: 3,
              value: "微信公众号"
            },
            {
              id: 4,
              value: "微信小程序"
            },
            {
              id: 6,
              value: "企业微信"
            },
            {
              id: 7,
              value: "员工端"
            },
            {
              id: 5,
              value: "手工录入"
            },
            {
              id: 1,
              value: "PC"
            }
          ]
        },
        {
          type: 2,
          name: "时间：",
          key: "times",
          showDate: true
        }
      ],
      columnsData: [
        // 表格内容
        // {
        //   type: "selection",
        //   width: 40,
        //   align: "center"
        // },
        {
          title: "会员信息",
          align: "left",
          minWidth: 200,
          render: (h, params) => {
            return h(
              memberInfor,
              {
                props: {
                  id: Number(params.row.member_id),
                  headurl: params.row.headurl
                    ? this.getHeadImg(params.row.headurl)
                    : require("../images/head-portrait.png")
                },
                style: {
                  lineHeight: "16px",
                  padding: "12px 0"
                },
                attrs: {
                  perm: "member.detail.view"
                }
              },
              [
                h(
                  "div",
                  {
                    class: "one-hide",
                    style: {
                      fontSize: "12px"
                    }
                  },
                  params.row.nickname
                ),
                h(
                  "div",
                  {
                    class: "one-hide",
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "姓名：" + (params.row.name || "--")
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "手机：" + params.row.mobile
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "ID：" + params.row.member_id
                )
              ]
            );
          }
        },
        {
          title: "时间",
          align: "left",
          key: "active_at",
          minWidth: 120,
          render: (h, p) => {
            return h(
              "div",
              {
                style: { marginLeft: "-5px" }
              },
              [
                h(
                  "span",
                  { style: { display: "inline-block", marginLeft: "5px" } },
                  p.row.active_at.split(" ")[0]
                ),
                h(
                  "span",
                  { style: { display: "inline-block", marginLeft: "5px" } },
                  p.row.active_at.split(" ")[1]
                )
              ]
            );
          }
        },
        {
          title: "出/入账",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("span", params.row.type_text);
          }
        },
        {
          title: "来源/用途",
          align: "left",
          minWidth: 150,
          key: "inout_type_text"
        },
        {
          title: "明细",
          key: "availableGoods",
          align: "left",
          minWidth: 264,
          render: (h, params) => {
            return h("span", params.row.about || "—");
          }
        },
        {
          title: "终端来源",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("span", params.row.terminal_type_text);
          }
        },
        {
          title: "积分变化",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    "margin-right": "5px"
                  }
                },
                params.row.point > 0 ? "+" : "-"
              ),
              h("span", Math.abs(params.row.point))
            ]);
          }
        }
      ],
      listData: [], // 表格数据
      tableListLength: 0, // 弹框列表长度
      chooseMemberData: {}, // 保存会员的数据
      choosepage: {
        // 保存分页
        total: 0,
        current: 1,
        page_size: 10
      },
      tablesLoading: false,
      chooseMemberListData: {}, // 保存会员选中的数据
      nameArray: [
        "in_member_reg_",
        "in_member_login_",
        "in_member_info_",
        "in_consume_",
        "in_product_comment_",
        "in_recharge_",
        "in_share_",
        "in_member_recommend_",
        "in_distribution_recommend_",
        "in_distribution_become_"
      ],
      exportData: {}, // 导出传参
      tableListExportStatus: false,
      showSaveButton: false,
      formData: {} // 提交保存时的数据
    };
  },
  watch: {
    searchData: {
      handler(val) {
        this.searchDatas(val);
      },
      deep: true
    },
    tabSelectIndex(val) {
      this.$router.replace({
        name: "marketingIntegral",
        query: {
          tab: val
        }
      });
      this.onTabSetting(val);
    }
  },
  created() {
    var field = this.searchParams.find(item => item.key == "in_type");
    if (field && !this.hasLicensePerm("ENABLE_DISTRIBUTION")) {
      field.options = field.options.filter(item => {
        return item.id != 9 && item.id != 10;
      });
    }
    if (this.hasLicensePerm("ENABLE_DISTRIBUTION")) {
      this.pathListData.push(
        {
          label: "申请成为分销商",
          name: "提交申请成为分销商，赠送",
          val: 10,
          note: 1,
          status: 1,
          key: "in_distribution_become_",
          keyValue: null
        },
        {
          label: "推荐新分销商",
          name: "每推荐一名新分销商，赠送",
          val: 9,
          note: 0,
          status: 1,
          key: "in_distribution_recommend_",
          keyValue: null,
          tips: "推荐的会员，提交申请成为分销商，则赠送对应积分"
        }
      );
    }
  },
  methods: {
    // 选中
    onSelectionChange(selectData) {
      this.selectTableData = selectData;
    },
    // 查询列表数据
    searchDatas(val) {
      this.currentPage = 1;
      this.getList();
    },
    // 导出积分列表
    download(data) {
      if (!data) {
        return;
      }
      let url = window.URL.createObjectURL(new Blob([data]));
      let link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", "积分列表.xlsx");
      document.body.appendChild(link);
      link.click();
    },
    getHeadImg(url) {
        if (!/^(http)/i.test(url)) {
            url = this.$store.state.siteComdataPath + url;
        }
        return url;
    },
    // 导出功能
    onExportTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.listData.length > this.selectTableData.length) {
        this.exportData.ids = [];
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item.id);
        });
        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/point/export"
        );
      } else {
        this.tableListExportStatus = true;
      }
    },
    // 导出当前页 0 导出所有 1
    exportList(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
      } else {
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item.id);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/point/export"
      );
      this.tableListExportStatus = false;
    },
    cancelExportList(val) {
      this.tableListExportStatus = val;
    },
    commonlistData(val) {
      return {
        in_out_type: val.in_type,
        keyword: val.keyword,
        terminal_type: val.terminal_type,
        active_at_end: val.times.endTime,
        active_at_start: val.times.startTime
      };
    },
    // 开关状态发生改变
    onSwitchChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$set(this.formItem, "status", 1);
          // this.isShowSwitch = true;
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭商城的积分功能，会员将不能再获取积分和使用积分抵扣，但积分数据仍然保留，是否确定关闭？",
            onOk: () => {
              this.$set(this.formItem, "status", 0);
            }
          });
        });
      }
    },
    // 继续关闭
    onRemainClosed() {
      this.formItem.status = 0;
      this.isShowSwitch = false;
    },
    // 取消关闭
    onCancle() {
      this.formItem.status = 1;
      this.isShowSwitch = false;
    },
    // 保存设置数据
    onSaveData() {
      // let obj = {};
      this.formData.status = this.formItem.status;
      if (this.formItem.checkbox.indexOf("H5") !== -1) {
        this.formData.terminal_mobile = 1;
      } else {
        this.formData.terminal_mobile = 0;
      }
      if (this.formItem.checkbox.indexOf("PC") !== -1) {
        this.formData.terminal_pc = 1;
      } else {
        this.formData.terminal_pc = 0;
      }
      if (this.formItem.checkbox.indexOf("微信小程序") !== -1) {
        this.formData.terminal_wxapp = 1;
      } else {
        this.formData.terminal_wxapp = 0;
      }
      if (this.formItem.checkbox.indexOf("公众号") !== -1) {
        this.formData.terminal_wx = 1;
      } else {
        this.formData.terminal_wx = 0;
      }

      if (this.formItem.deductionMethod.indexOf("商城购物消费抵扣") !== -1) {
        this.formData.out_order_pay_status = 1;
        this.formData.out_order_pay_point = this.formItem.out_order_pay_point;
        this.formData.out_order_pay_max_percent = this.formItem.out_order_pay_max_percent;
      } else {
        this.formData.out_order_pay_status = 0;
      }
      this.formData.point_give_status = this.pointGiveStatus;
      this.formData.point_give_target = this.pointGiveTarget;
      let status = true;
      if (this.formItem.status) {
        this.$refs["formItem"].validate(valid => {
          status = valid;
        });
      }
      if (!status) {
        this.$Message.error("保存失败");
        return
      }
      this.$httpPost(
        "/shop/admin/point/config/save",
        this.formData,
        res => {
          if (res.code === 200) {
            this.$Message.success("保存成功");
            this.onTabSetting("1");
          }
        }
      );
    },
    // 获取设置数据
    onTabSetting(val) {
      this.$nextTick(() => {
        document.querySelectorAll(".marketing-integral .ivu-tabs-tabpane")[val].scroll({top:0})
      })
      if (val === "1") {
        this.isFormContainer = true;
        this.tableLoading = true;
        this.$httpGet("/shop/admin/point/config/info", "", res => {
          this.tableLoading = false;
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            this.formData = res.data;
            this.pointGiveStatus = res.data.point_give_status;
            this.pointGiveTarget = res.data.point_give_target;
            this.formItem.status = res.data.status;
            if (res.data.terminal_mobile === 1) {
              this.formItem.checkbox.push("H5");
            }
            if (res.data.terminal_pc === 1) {
              this.formItem.checkbox.push("PC");
            }
            if (res.data.terminal_wxapp === 1) {
              this.formItem.checkbox.push("微信小程序");
            }
            if (res.data.terminal_wx === 1) {
              this.formItem.checkbox.push("公众号");
            }

            if (res.data.out_order_pay_status === 1) {
              this.formItem.deductionMethod.push("商城购物消费抵扣");
            } else {
              this.formItem.deductionMethod = [];
            }

            this.formItem.out_order_pay_point = res.data.out_order_pay_point;
            this.formItem.out_order_pay_max_percent =
              res.data.out_order_pay_max_percent;
            this.pathListData.forEach(item => {
              let status = item.key + "status";
              let point = item.key + "point";
              if (item.keyConsume) {
                item.consumeValue = Number(res.data.in_consume_per_price);
              }
              item.status = res.data[status];
              item.keyValue = res.data[point];
            });
          }
        });
      } else {
        this.searchData = JSON.parse(JSON.stringify(searchData));
        this.isFormContainer = false;
      }
      this.showSaveButton = val == "1";
    },
    // 获取列表数据
    getList() {
      let params = this.commonlistData(this.searchData);
      params["page"] = this.currentPage;
      params["page_size"] = this.pageSize;
      params["show_all"] = "0";
      params["status"] = "1";
      this.tableLoading = true;
      this.$httpGet("/shop/admin/point/list", params, res => {
        if (res.code === 200) {
          this.listData = [];
          this.$nextTick(() => {
            this.tableLoading = false;
            this.$store.state.COMMON_loading = false;
            this.listData = res.data.list;
            this.total = res.data.total;
            this.currentPage = res.data.current;
            this.pageSize = res.data.page_size;
          });
        }
      });
    },
    onChangePage(page) {
      this.currentPage = page;
      this.getList();
    },
    // 条数
    onChangePageSize(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getList();
    },
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$Message.success("Success!");
        } else {
          this.$Message.error("Fail!");
        }
      });
    },
    // 点击新增记录
    onAddMoreClick() {
      this.isShowChoose = true;
      this.isShowNewRecord = true;
    },
    // 新增记录 显示会员弹框
    chooseMemberButton(nums) {
      // 1 重新选择 会默认选中
      if (nums === 1) {
        this.isShowChoose = true;
      }
      this.isShowChooseMember = true;
      this.tablesLoading = true;
      this.$httpPost(
        "/shop/admin/point/member/list",
        { page: 1, page_size: 10 },
        res => {
          this.tablesLoading = false;
          this.pageDataPost(res);
        }
      );
    },
    // 选择会员 显示新增弹框
    chooseMemberList() {
      this.isShowNewRecord = true;
    },
    // 获取页数的数据
    changeChoosePageSize(val) {
      this.choosepage.page_size = val.pageSize;
      this.choosePage(val);
    },
    // 获取翻页后的数据
    changeChoosePage(val) {
      this.choosepage.page = val.page;
      this.choosePage(val);
    },
    choosePage(val) {
      this.tablesLoading = true;
      this.$httpPost(
        "/shop/admin/point/member/list",
        {
          page: this.choosepage.page,
          page_size: this.choosepage.page_size,
          level: val.chooseMemberSelect,
          keyword: val.chooseMemberInput
        },
        res => {
          this.tablesLoading = false;
          this.pageDataPost(res);
        }
      );
    },
    // 翻页数据请求
    pageDataPost(res) {
      this.chooseMemberData = res.data;
      if (res.data.member_level_list) {
        this.memberLevelList = res.data.member_level_list;
      }
      this.tableListLength = res.data.list.length;
      this.choosepage.total = Number(res.data.total);
      this.choosepage.current = Number(res.data.current);
      this.choosepage.page_size = Number(res.data.page_size);
    },
    // 选择会员搜索按钮
    searchButton(val) {
      this.$httpPost(
        "/shop/admin/point/member/list",
        {
          page: 1,
          page_size: this.choosepage.page_size,
          level: val.chooseMemberSelect,
          keyword: val.chooseMemberInput
        },
        res => {
          this.pageDataPost(res);
        }
      );
    },
    // 返回的会员数据
    memberListData(data) {
      this.chooseMemberListData = data;
    },
    // 添加会员
    saveAddMember(data) {
      this.$httpPost("/shop/admin/point/add", data, res => {
        if (res.code === 200) {
          this.$Message.success("添加成功");
          this.chooseMemberListData = {};
          this.isShowNewRecord = false;
          this.isShowChoose = false;
          this.getList();
        } else {
          this.$Message.error({
            content: res.msg,
            duration: 5,
            closable: true
          });
        }
      });
    },
    // 取消会员
    cancelAddMember() {
      this.isShowChoose = false;
      this.chooseMemberListData = {};
    }
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.onTabSetting(this.tabSelectIndex);
  }
};
</script>
<style lang="less" scoped>
.marketing-integral {
  height: 100%;
  overflow: auto;
  .integral-setting {
    padding: 24px 24px;
    height: calc(100vh - 170px);
    overflow: auto;
    // .ivu-form-item {
    //   margin-bottom: 30px;
    // }
    .ivu-table {
      th {
        background-color: #f8f9fd;
      }
    }
    .table2 {
      /deep/table {
        min-width: 1000px;
        width: 100% !important;
        table-layout: auto;
      }
      /deep/td {
        font-size: 12px;
        color: #657180;
      }

      th:nth-child(2) {
        text-align: center;
      }
      td:nth-child(2) {
        padding-left: 50px;
      }
    }
  }
  /deep/.more-message {
    line-height: 28px;
    vertical-align: middle;
  }
  /deep/.is-hide {
    display: none !important;
  }
  /deep/.ivu-tabs {
    min-height: calc(100vh - 120px);
    .ivu-tabs-bar {
      margin-bottom: 30px;
    }
  }
  .integral-preferential {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
    // text-align: left;
    // .marketing-add {
    //   margin: 24px 24px 0;
    // }
    .marketing-search {
      // background-color: #f8f9fd;
      // border-radius: 5px;
      // margin: 24px;
      // // height: 156px;
      // padding-left: 15px;
      // padding-top: 16px;
      /deep/.data-list-search-item:nth-child(5) {
        span:not(:first-child) {
          font-size: 13px;
          color: #9ea4b1;
          cursor: pointer;
        }
      }
      /deep/.data-list-search-item {
        margin-left: 0px;
      }
      // /deep/.data-list-search-btn {
      //   margin-left: 10px;
      // }
    }
    /deep/.ivu-table-wrapper
      .ivu-table-default
      table
      .ivu-table-cell.ivu-table-cell-with-selection {
      padding: 0;
    }
    /deep/.ivu-table-wrapper .ivu-table-default table {
      tr {
        th:nth-child(2) {
          .ivu-table-cell {
            padding-left: 0;
          }
        }
        td:nth-child(2) {
          .ivu-table-cell {
            padding-left: 0;
          }
        }
      }
    }
    .marketing-table {
      // margin: 0 24px;
      /deep/.disable {
        background-color: #cccccc !important;
        border: solid 1px #cccccc !important;
        color: #657180 !important;
      }
      /deep/.ivu-table-wrapper
        .ivu-table-default
        table
        tbody
        tr
        td:nth-child(3)
        .ivu-table-cell {
        -webkit-line-clamp: 3 !important;
      }
    }
  }
  /deep/.ivu-tabs-nav-scroll {
    .ivu-tabs-tab {
      font-size: 15px;
    }
  }
  // /deep/.status {
  //   display: inline-block;
  //   width: 32px;
  //   height: 18px;
  //   line-height: 18px;
  //   padding: 0 2px;
  // }
  /deep/.start-disable {
    background-color: #cccccc;
    border: solid 1px #cccccc;
    color: #657180;
  }
  // /deep/.start-using {
  //   background-color: #8bcd3c;
  //   border: solid 1px #5daa01;
  //   color: #ffffff;
  // }
  /deep/.ivu-table td {
    height: 70px;
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
    .ivu-radio {
      margin-right: 5px;
    }
  }
}
.ivu-table-wrapper {
  /deep/.ivu-table-default {
    table {
      tbody {
        tr {
          td {
            & + td .ivu-table-cell {
              -webkit-line-clamp: 3;
            }
          }
        }
      }
    }
  }
}
.foot-button{
  .save{
    width: 70px;
    height: 32px;
  }
}
</style>
