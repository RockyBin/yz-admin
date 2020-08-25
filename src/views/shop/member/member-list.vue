<template>
  <div class="member-list">
    <verticalLineTitlebar>
      <h3 style="color:#464C5B;font-size:13px;">
        目前拥有：
        <span style="color:#FF9900;">{{total}}</span> 名会员
      </h3>
    </verticalLineTitlebar>
    <div class="member-list-right">
      <add-more text="新增会员" @onAddMoreClick="onAddmember" perm="member.operate"></add-more>
    </div>
    <search-list
      ref="searchList"
      :searchParams="searchParams"
      @getChangeLevel="getChangeLevel"
      :searchData="searchData"
      class="marketing-search"
    >
       <Button @click="onExportTableList" perm="member.export.operate">导出</Button>
    </search-list>
    <div class="member-list-content">
      <common-table
        ref="memberTable"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
        @selectData="onSelectionChange"
      ></common-table>
    </div>
    <Modal
      v-model="isShowStatus"
      :title="titles"
      :okText="text"
      :width="widths"
      :mask-closable="false"
      @on-cancel="cancelGoDelete"
      class="common-modal-style"
    >
      <p v-if="types === 2">当前会员是分销商。若坚持对该会员进行封号操作，请先前往【分销商列表】取消该分销商资格。</p>
      <p v-if="types === 3">当前会员是代理商。若坚持对会员进行封号操作，请先前往【代理商列表】取消该代理商资格。</p>
      <p v-if="types === 4">当前会员是经销商。若坚持对会员进行封号操作，请先前往【经销商列表】取消该经销商资格。</p>
      <p v-if="types === 5">当前会员是区域代理商。若坚持对会员进行封号操作，请先前往【区代列表】取消该区域代理商资格。</p>
      <p v-if="types === 6">当前会员是供应商。若坚持对会员进行封号操作，请先前往【供应商列表】取消该供应商资格。</p>
      <Form
        v-if="types === 1"
        ref="formList"
        :model="formList"
        :rules="ruleList"
        :label-width="100"
      >
        <FormItem label="手机号：" prop="phoneNum">
          <Input
            type="text"
            v-model="formList.phoneNum"
            @on-change="checkNumber"
            placeholder="请输入手机号"
          />
          <more-message text="手机号码默认为登录账号，新增会员后，号码不允许更改，请核对准确手机号码"></more-message>
        </FormItem>
        <FormItem label="登录密码：" prop="password">
          <Input type="text" v-model="formList.password" placeholder="密码不少于8位，必须包含数字和字母" />
        </FormItem>
        <!-- <FormItem label="确认密码：" prop="password2">
          <Input
            type="password"
            v-model="formList.password2"
            placeholder="密码不少于8位，必须包含数字和字母"
          />
        </FormItem>-->
        <input type="password" style="opacity: 0;display: none;" />
        <FormItem label="会员昵称：" prop="nickname">
          <Input type="text" v-model="formList.nickname" :maxlength="16" placeholder="请输入会员昵称" />
          <span
            style="position: absolute;right: 40px;top: 2px;color:#999"
          >{{ formList.nickname.length }}/16</span>
        </FormItem>
        <FormItem label="会员姓名：" prop="name">
          <Input type="text" v-model="formList.name" :maxlength="16" placeholder="请输入会员姓名" />
          <span
            style="position: absolute;right: 40px;top: 2px;color:#999"
          >{{ formList.name.length }}/16</span>
          <more-message text="姓名仅对商家内部员工可见"></more-message>
        </FormItem>
        <FormItem label="所属员工：" :class="{ employees: trafficAssignmentStatus }">
          <RadioGroup v-model="formList.admin_id_type" v-if="trafficAssignmentStatus">
            <Radio style="margin-right:20px;" :label="1">系统自动分配</Radio>
            <Radio :label="2">手动分配</Radio>
          </RadioGroup>
          <div
            v-if="memberSelectData"
            style="width: 260px;height: 66px;border-radius: 5px;border: solid 1px #dcdee2;margin-bottom:12px;position: relative;"
          >
            <div
              style="float:left;position: relative;top: 50%;transform: translateY(-50%);margin: 0 17px 0 15px;"
            >
              <img
                style="height: 40px;width: 40px;display: block;border-radius: 5px;"
                :src="
                  memberSelectData.headurl
                    ? getHeadImg(memberSelectData.headurl)
                    : require('../images/head-portrait.png')
                "
              />
            </div>
            <div
              style="float:left;line-height: 1.5;position: relative;top: 50%;transform: translateY(-50%);width: calc(100% - 74px);padding-right: 10px;"
            >
              <span>
                <div
                  style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                >姓名：{{ memberSelectData.name }}</div>
                <div
                  style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                  v-if="memberSelectData.position"
                >职位：{{ memberSelectData.position }}</div>
                <div v-if="memberSelectData.mobile">手机：{{ memberSelectData.mobile }}</div>
              </span>
            </div>
            <Icon
              type="md-close-circle"
              style="position: absolute;top: -5px;right: -8px;cursor: pointer;"
              size="16"
              color="#000"
              class="delete"
              @click="deleteImg"
            />
          </div>
          <Button
            v-if="formList.admin_id_type == 2 || !trafficAssignmentStatus"
            type="primary"
            style="height: 32px;padding-top: 0;padding-bottom: 0;vertical-align: top;display: block;"
            @click="onSelectMemberClick"
          >{{ memberSelectData ? "重新选择" : "选择" }}</Button>
        </FormItem>
      </Form>
      <div slot="footer" class="modalFooter">
        <Button type="text" @click="cancelGoDelete">取消</Button>
        <Button
          type="primary"
          :loading="buttonLoading"
          @click="goDeleteDistributor"
          class="ivu-btn-large"
          perm="member.operate"
        >
          <label v-if="!buttonLoading && types >= 2">前往处理</label>
          <label v-if="!buttonLoading && types < 2">确定</label>
        </Button>
      </div>
    </Modal>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="page"
        :page-size="page_size"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        show-sizer
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
    <employee-select-modal
      title="选择员工"
      ref="memberSelectModal"
      :width="648"
      headName="name"
      :selectData="memberSelectData"
      v-model="memberModalStatus"
      @onGetSelectData="onGetMemberSelectData"
    ></employee-select-modal>
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
import constants from "@/views/shop/components/constants.js";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import employeeSelectModal from "@/views/shop/components/modal/modal-employee-select.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
const initialSearchData = {
  // 搜索框的值
  // nickname: "", // 会员昵称
  // mobile: "", // 手机号
  keyword: "", //模糊查询关键字
  keyword_type: "0",
  terminal_type: "", // 终端来源
  in_type: "",
  crtime: {
    // 注册时间
    startTime: "",
    endTime: ""
  },
  deal_type: "", // 成交查询类型
  level: -1, // 会员等级
  level_type: "1", //等级类型
  status: "1", // 账号状态
  dealType: {
    select: 0,
    startStep: null, // 成交查询最小值
    endStep: null // 成交查询最大值
  }
};
const terminalTypes = Object.assign([], constants.terminalTypes);
const terminalSearch = Object.assign([], constants.terminalSearch);
terminalTypes.push({
  id: 5,
  value: "手工录入"
});
terminalSearch.push({
  id: 5,
  value: "手工录入"
});
export default {
  components: {
    addMore,
    searchList,
    commonTable,
    exportModal,
    moreMessage,
    employeeSelectModal,
    verticalLineTitlebar
  },
  data() {
    return {
      buttonLoading: false,
      tableLoading: true,
      constants,
      saveDetails: [], // 保存多个详情的数据
      detailIndex: 0,
      listDetailData: {},
      memberLevelList: [], // 会员列表
      trafficAssignmentStatus: 0, //是否开启流量分配
      formList: {
        phoneNum: "",
        nickname: "",
        name: "",
        password: "",
        // password2: "",
        admin_id_type: 1
      },
      memberSelectData: null,
      ableMemberData: [],
      memberModalStatus: false,
      ruleList: {
        phoneNum: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            type: "number",
            required: true,
            message: "手机号格式不正确",
            trigger: "blur",
            transform(value) {
              let myReg = /^1[0-9]\d{9}$/;
              if (!myReg.test(value)) {
                return false;
              } else {
                return Number(value);
              }
            }
          }
        ],
        nickname: [
          { message: "请输入昵称", trigger: "blur" },
          {
            message: "昵称长度不能大于十六位",
            trigger: "blur"
          }
        ],
        name: [
          { message: "请输入姓名", trigger: "blur" },
          {
            message: "姓名长度不能大于十六位",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            required: true,
            message: "密码不少于8位，必须包含数字和字母",
            pattern: /^(?=\w*[0-9])(?=\w*[a-zA-Z])(\w{8,})$/,
            trigger: "blur"
          },
          {
            trigger: "blur",
            validator: (rule, value, callback) => {
              // if (this.formList.password2 !== "") {
              //   this.$refs.formList.validateField("password2");
              // }
              callback();
            }
          }
        ]
        // password2: [
        //   { required: true, message: "请再次输入密码", trigger: "blur" },
        //   {
        //     trigger: "blur",
        //     validator: (rule, value, callback) => {
        //       if (value !== this.formList.password) {
        //         callback("2次输入密码不一致，请重新输入");
        //       } else {
        //         callback();
        //       }
        //     }
        //   }
        // ]
      },
      widths: 430, // 默认宽度
      titles: "注意",
      text: "前往处理",
      selectMember: "",
      types: 1, // 1 表示新增 2 表示封号情况
      changeData: [], // 详情改变的数据
      resetData: {},
      password: "", // 密码
      place: [], // 保存地址
      isShowInput: [],
      isShowStatus: false, // 封号时是分销商时弹出弹框
      levelList: [], // 会员等级
      openDetail: false, // 更改操作的样式和文本切换
      rowChecked: [], // 默认空数组不选中
      checkedAll: false, // 默认不全选
      //底部table展示数据
      columnsData: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          className: "agent-statistics-selection",
          align: "center"
        },
        {
          title: "会员信息",
          align: "left",
          minWidth: 226,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.id),
                headurl: params.row.headurl
                  ? this.getHeadImg(params.row.headurl)
                  : require("../images/head-portrait.png"),
                nickname: params.row.nickname
                  ? params.row.nickname
                  : params.row.mobile.replace(
                      /(\d{3})\d{4}(\d{4})/,
                      "$1****$2"
                    ),
                mobile: params.row.mobile,
                name: params.row.name || "--"
              },
              attrs: {
                perm: "member.detail.view"
              }
            });
          }
        },
        {
          title: "身份/等级",
          align: "left",
          minWidth: 198,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: { display: "block" }
                },
                "会员：" + (params.row.level ? params.row.level_name : "- -")
              ),
              this.hasLicensePerm("ENABLE_DISTRIBUTION")
                ? h(
                    "span",
                    {
                      style: { display: "block" }
                    },
                    params.row.is_distributor > 0
                      ? "分销商：" + params.row.distribution_level_name
                      : ""
                  )
                : null,
              this.hasLicensePerm("ENABLE_AGENT")
                ? h(
                    "span",
                    {
                      style: { display: "block" }
                    },
                    params.row.agent_level > 0
                      ? "代理商：" + params.row.agent_level_name
                      : ""
                  )
                : null,
              this.hasLicensePerm("ENABLE_AREA_AGENT")
                ? h(
                    "span",
                    {
                      style: { display: "block" }
                    },
                    params.row.area_agent_level_name
                      ? "区域代理：" + params.row.area_agent_level_name
                      : ""
                  )
                : null,
              this.hasLicensePerm("ENABLE_CLOUDSTOCK")
                ? h(
                    "span",
                    {
                      style: { display: "block" }
                    },
                    params.row.dealer_level > 0
                      ? "经销商：" + params.row.dealer_level_name
                      : ""
                  )
                : null,
              this.hasLicensePerm("ENABLE_SUPPLIER")
                ? h(
                    "span",
                    {
                      style: { display: "block" }
                    },
                    params.row.is_supplier > 0 ? "供应商" : ""
                  )
                : null
            ]);
          }
        },
        {
          title: "注册时间",
          key: "created_at",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return h("div", { style: { marginLeft: "-5px" } }, [
              h(
                "span",
                { style: { marginLeft: "5px", display: "inline-block" } },
                params.row.created_at && params.row.created_at.split(/\s/)[0]
              ),
              h(
                "span",
                { style: { marginLeft: "5px", display: "inline-block" } },
                params.row.created_at && params.row.created_at.split(/\s/)[1]
              )
            ]);
          }
        },
        {
          title: "统计",
          minWidth: 160,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                }
              },
              [
                h(
                  "span",
                  {
                    style: {
                      display: "block"
                    }
                  },
                  // `次数 ：${params.row.buy_times}次/￥${Number(params.row.buy_money).toFixed(2)}`
                  `交易次数 ：${params.row.trade_time}次`
                ),
                h(
                  "span",
                  {
                    style: {
                      display: "block"
                    }
                  },
                  // `金额 ：${params.row.deal_times}次/￥${Number(params.row.deal_money).toFixed(2)}`
                  `交易金额 ：￥${Number(params.row.trade_money).toFixed(2)}`
                ),
                h(
                  "span",
                  {
                    style: {
                      display: "block"
                    }
                  },
                  "积分：" + params.row.point
                ),
                h(
                  "span",
                  {
                    style: {
                      display: "block"
                    }
                  },
                  "余额：" + "￥" + Number(params.row.balance).toFixed(2)
                )
              ]
            );
          }
        },
        {
          title: "直推下级",
          align: "center",
          minWidth: 120,
          key: "subordinate",
          renderHeader: (h, index) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "line-height": "32px"
                }
              },
              [
                h("span", "直推人数"),
                h(moreMessage, {
                  style: {
                    "font-weight": "lighter",
                    "margin-left": "5px"
                  },
                  props: {
                    text:
                      "会员是指已经绑定上下级关系的会员，粉丝包括注册/未注册/已绑定/未绑定关系的会员。"
                  }
                })
              ]
            );
          },
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                }
              },
              [
                h("div", [
                  h("span", `会员 ：`),
                  h(
                    "a",
                    {
                      style: {
                        "text-decoration": "underline",
                        color: "#3f66d3"
                      },
                      attrs: {
                        perm: "member.detail.view"
                      },
                      on: {
                        click: () => {
                          if (params.row.is_distributor) {
                            this.$router.push({
                              name: "memberDetail",
                              query: {
                                id: params.row.id,
                                level: 1,
                                tab: 1
                              }
                            });
                          } else {
                            this.$router.push({
                              name: "memberDetail",
                              query: {
                                id: params.row.id,
                                level: 1,
                                tab: 1
                              }
                            });
                          }
                        }
                      }
                    },
                    params.row.directly_distributor_count
                      ? params.row.directly_distributor_count
                      : "0"
                  )
                ]),
                h("div", [
                  h("span", `粉丝 ：`),
                  h(
                    "a",
                    {
                      style: {
                        "text-decoration": "underline",
                        color: "#3f66d3"
                      },
                      attrs: {
                        perm: "fans.view"
                      },
                      on: {
                        click: () => {
                          this.$router.push({
                            name: "memberFansList",
                            query: {
                              keyword: params.row.nickname,
                              search_type: 1
                            }
                          });
                        }
                      }
                    },
                    params.row.fans ? params.row.fans : "0"
                  )
                ])
              ]
            );
          }
        },
        {
          title: "所属员工",
          align: "left",
          minWidth: 154,
          render: (h, params) => {
            return params.row.admin_name || params.row.admin_mobile
              ? h("div", [
                  h("div", params.row.admin_name),
                  h("div", params.row.admin_mobile)
                ])
              : h("div", "--");
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 70,
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-success": this.listData[params.index].status === 1,
                  "table-error": this.listData[params.index].status === 0
                }
              },
              this.listData[params.index].status === 0 ? "封号" : "正常"
            );
          }
        },
        {
          title: "操作",
          align: "center",
          minWidth: 130,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "show-active": params.row.openDetail ? true : "",
                    "table-operation": true
                  },
                  style: {
                    marginRight: "5px",
                    padding: "5px 5px 5px 0px"
                  },
                  attrs: {
                    perm: "member.detail.view"
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "memberDetail",
                        query: {
                          id: params.row.id
                        }
                      });
                    }
                  }
                },
                "查看详情"
              ),
              h(
                "span",
                {
                  class: {
                    "show-active": params.row.openDetail ? true : "",
                    "table-operation": true
                  },
                  style: {
                    padding: "5px 5px 5px 0px"
                  }
                },
                "|"
              ),
              h(
                "span",
                {
                  style: {
                    "margin-left": "5px"
                  },
                  class: {
                    "show-underLine": true,
                    "table-operation": true
                  },
                  attrs: {
                    perm: "member.detail.operate"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content:
                          params.row.status == 1
                            ? "除非必要，请不要随意对会员封号，封号后，此会员将访问不了您的店铺！是否确定要对此会员封号？"
                            : "解封此会员后，会员可以继续访问您的店铺！是否确定要解封此会员？",
                        onOk: () => {
                          this.changeStatus(
                            params.row.status,
                            params.row.id,
                            params.row.is_distributor,
                            params.row.agent_level,
                            params.row.dealer_level,
                            params.row.is_area_agent,
                            params.row.is_supplier,
                            params.row.mobile
                          );
                        }
                      });
                    }
                  }
                },
                this.listData[params.index].status === 0 ? "解封" : "封号"
              )
            ]);
          }
        }
      ],
      listData: [], // 列表数据
      searchData: Object.assign({}, initialSearchData, {
        keyword: this.$route.params.keyword || "",
        keyword_type: this.$route.params.keyword_type || "0",
        level_type: this.$route.params.level_type || "1",
        status: this.$route.params.status || "1"
      }),
      page_size: 10, // 每页显示数量
      page: 1, // 页码
      total: 10, // 总数
      //头部查询模块参数数据
      searchParams: [
        {
          type: 10,
          key: "keyword",
          placeholder: {
            0: "昵称/姓名/手机号",
            2: "姓名/手机号"
          },
          prefixIcon: "ios-search",
          optionKey: "keyword_type",
          options: [
            {
              id: "0",
              value: "会员"
            },
            {
              id: "2",
              value: "员工"
            }
          ]
        },
        {
          type: 2,
          name: "注册时间：",
          key: "crtime"
        },
        {
          type: 12,
          key: "level",
          optionKey: "level_type",
          options: [],
          width: "260",
          optionsType: [
            {
              id: "1",
              value: "会员等级"
            },
            this.hasLicensePerm("ENABLE_DISTRIBUTION")
              ? {
                  id: "2",
                  value: "分销商等级"
                }
              : "",
            this.hasLicensePerm("ENABLE_AGENT")
              ? {
                  id: "3",
                  value: "代理商等级"
                }
              : "",
            this.hasLicensePerm("ENABLE_AREA_AGENT")
              ? {
                  id: "5",
                  value: "区域代理等级"
                }
              : "",
            this.hasLicensePerm("ENABLE_CLOUDSTOCK")
              ? {
                  id: "4",
                  value: "经销商等级"
                }
              : "",
            this.hasLicensePerm("ENABLE_SUPPLIER")
              ? {
                  id: "6",
                  value: "供应商"
                }
              : ""
          ]
        },
        {
          type: 6,
          key: "dealType",
          min: 0,
          step: 1,
          precision: 0,
          // options: [{ id: 2, value: "付款次数" }, { id: 3, value: "付款金额" },{ id: 0, value: "成交次数" }, { id: 1, value: "成交金额" }]
          options: [
            { id: 0, value: "交易次数" },
            { id: 1, value: "交易金额" }
          ]
        },
        {
          type: 3,
          name: "会员状态：",
          key: "status",
          options: [
            {
              id: "-1",
              value: "全部"
            },
            {
              id: "0",
              value: "封号"
            },
            {
              id: "1",
              value: "正常"
            }
          ]
        }
      ],
      exportData: {}, // 导出传参
      tableListExportStatus: false,
      commonFunction
    };
  },
  watch: {
    searchData: {
      handler() {
        this.page = 1;
        this.dealWithData();
      },
      deep: true
    }
  },
  created() {
    this.columnsData = this.columnsData.filter(item => {
      return (
        item.key != "subordinate" || this.hasLicensePerm("ENABLE_DISTRIBUTION")
      );
    });
  },
  methods: {
    checkNumber() {
      this.$nextTick(() => {
        this.formList.phoneNum = this.formList.phoneNum.replace(/[^\d]/g, "");
      });
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    /**
     * table选择变化时触发
     */
    onSelectionChange(selectData) {
      this.rowChecked = selectData;
    },
    // 处理提交的数据
    dealWithData() {
      this.checkedAll = false;
      this.rowChecked = [];
      let obj = {};
      if (this.searchData.crtime.startTime) {
        obj.starttime = this.searchData.crtime.startTime;
      } else {
        obj.starttime = "";
      }
      if (this.searchData.crtime.endTime) {
        obj.endtime = this.searchData.crtime.endTime;
      } else {
        obj.endtime = "";
      }
      if (
        Number(this.searchData.dealType.startStep) >
        Number(this.searchData.dealType.endStep)
      ) {
        this.$Message.error("最大值不能小于最小值");
        return;
      }
      // obj.deal_type = this.searchData.dealType.select;
      // obj.deal_value_min = this.searchData.dealType.startStep;
      // obj.deal_value_max = this.searchData.dealType.endStep;
      // if(obj.deal_type==0||obj.deal_type==1){
      //   obj.deal_value_min = this.searchData.dealType.startStep;
      //   obj.deal_value_max = this.searchData.dealType.endStep;
      // }else if(obj.deal_type==2){
      //   obj.buy_times_min = this.searchData.dealType.startStep;
      //   obj.buy_times_max = this.searchData.dealType.endStep;
      // }else if(obj.deal_type==3){
      //   obj.buy_money_min = this.searchData.dealType.startStep;
      //   obj.buy_money_max = this.searchData.dealType.endStep;
      // }
      let selectArray = [
        "trade_time_min",
        "trade_time_max",
        "trade_money_min",
        "trade_money_max"
      ];
      let firstName = selectArray[this.searchData.dealType.select * 2];
      let lastName = selectArray[this.searchData.dealType.select * 2 + 1];
      if (this.searchData.dealType.startStep != null) {
        obj[firstName] = this.searchData.dealType.startStep;
      }
      if (this.searchData.dealType.endStep != null) {
        obj[lastName] = this.searchData.dealType.endStep;
      }

      obj.page = this.page;
      obj.page_size = this.page_size;
      // obj.nickname = this.searchData.nickname;
      // obj.mobile = this.searchData.mobile;
      obj.keyword = this.searchData.keyword;
      obj.keyword_type = this.searchData.keyword_type;
      obj.in_type = this.searchData.in_type;
      obj.status = this.searchData.status;
      obj.level = this.searchData.level;
      obj.level_type = this.searchData.level_type;
      obj.terminal_type = this.searchData.terminal_type;
      this.getList(obj);
    },
    // 导出功能
    onExportTableList() {
      if (this.rowChecked.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.listData.length > this.rowChecked.length) {
        this.exportData.ids = [];
        this.rowChecked.forEach(item => {
          this.exportData.ids.push(item.id);
        });
        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/member/export"
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
        if (this.searchData.crtime.startTime) {
          this.exportData.starttime = this.searchData.crtime.startTime;
        } else {
          this.exportData.starttime = "";
        }
        if (this.searchData.crtime.endTime) {
          this.exportData.endtime = this.searchData.crtime.endTime;
        } else {
          this.exportData.endtime = "";
        }
        if (
          Number(this.searchData.dealType.startStep) >
          Number(this.searchData.dealType.endStep)
        ) {
          this.$Message.error("最大值不能小于最小值");
          return;
        }
        let selectArray = [
          "trade_time_min",
          "trade_time_max",
          "trade_money_min",
          "trade_money_max"
        ];
        let firstName = selectArray[this.searchData.dealType.select * 2];
        let lastName = selectArray[this.searchData.dealType.select * 2 + 1];
        if (this.searchData.dealType.startStep != null) {
          this.exportData[firstName] = this.searchData.dealType.startStep;
        }
        if (this.searchData.dealType.endStep != null) {
          this.exportData[lastName] = this.searchData.dealType.endStep;
        }

        this.exportData.page = this.page;
        this.exportData.page_size = this.page_size;
        this.exportData.keyword = this.searchData.keyword;
        this.exportData.keyword_type = this.searchData.keyword_type;
        this.exportData.in_type = this.searchData.in_type;
        this.exportData.status = this.searchData.status;
        this.exportData.level = this.searchData.level;
        this.exportData.level_type = this.searchData.level_type;
        this.exportData.terminal_type = this.searchData.terminal_type;
      } else {
        this.rowChecked.forEach(item => {
          this.exportData.ids.push(item.id);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/member/export"
      );
      this.tableListExportStatus = false;
    },
    cancelExportList(val) {
      this.tableListExportStatus = val;
    },
    // 分页
    changePage(val) {
      this.page = val;
      this.dealWithData();
    },
    // 条数
    changePageSize(val) {
      this.page_size = val;
      this.page = 1;
      this.dealWithData();
    },
    // 判断是否全选
    onCheckAllChange(val) {
      this.checkedAll = !val;
      if (this.checkedAll) {
        this.listData.forEach((item, index) => {
          if (this.rowChecked.indexOf(index) === -1) {
            this.rowChecked.push(item.id);
          }
        });
      } else {
        this.rowChecked = [];
      }
    },
    // 添加会员
    onAddmember() {
      this.isShowStatus = true;
      this.types = 1;
      this.titles = "新增会员";
      this.text = "确定";
      this.resetModalData();
      this.getTrafficAssignment();
    },
    getTrafficAssignment() {
      this.http
        .get("/shop/admin/staff/allocation/info")
        .then(res => {
          if (res.code == 200) {
            this.trafficAssignmentStatus = res.data.status;
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    // 修改解封，封号状态
    changeStatus(
      status,
      id,
      is_distributor,
      agent_level,
      dealer_level,
      is_area_agent,
      is_supplier,
      mobile
    ) {
      let statusChange = status;
      if (statusChange === 0) {
        statusChange = 1;
      } else {
        statusChange = 0;
        this.selectMember = mobile;
        if (is_distributor === 1) {
          this.isShowStatus = true;
          this.titles = "注意";
          this.text = "前往处理";
          this.types = 2;
          return;
        }
        if (agent_level) {
          this.isShowStatus = true;
          this.titles = "注意";
          this.text = "前往处理";
          this.types = 3;
          return;
        }
        if (dealer_level) {
          this.isShowStatus = true;
          this.titles = "注意";
          this.text = "前往处理";
          this.types = 4;
          return;
        }
        if (is_area_agent === 1) {
          this.isShowStatus = true;
          this.titles = "注意";
          this.text = "前往处理";
          this.types = 5;
          return;
        }
        if (is_supplier === 1) {
          this.isShowStatus = true;
          this.titles = "注意";
          this.text = "前往处理";
          this.types = 6;
          return;
        }
      }
      this.$httpPost(
        "/shop/admin/member/status",
        { status: statusChange, id: id },
        res => {
          if (res.code === 200) {
            this.$Message.success(res.msg);
            this.dealWithData();
          } else if (res.code === 512) {
            this.$Message.error(res.msg);
          } else {
            this.$Message.error("操作失败");
          }
        }
      );
    },
    // 1 添加会员 2 前往分销商页面删除分销商
    goDeleteDistributor() {
      if (this.types === 1) {
        this.addMemberData();
      } else if (this.types === 2) {
        this.$router.push({
          path: "/distributor/list",
          query: { mobile: this.selectMember }
        });
      } else if (this.types === 3) {
        this.$router.push({
          path: "/agent/list",
          query: { mobile: this.selectMember }
        });
      } else if (this.types === 4) {
        this.$router.push({
          path: "/dealer/list",
          query: { mobile: this.selectMember }
        });
      } else if (this.types === 5) {
        this.$router.push({
          name: "areaAgentList",
          params: { keyword: this.selectMember }
        });
      }else if (this.types === 6) {
        this.$router.push({
          name: "supplierList",
          params: { keyword: this.selectMember }
        });
      }
    },
    // 取消前往分销商页面删除分销商
    cancelGoDelete() {
      this.isShowStatus = false;
      this.$refs.formList.resetFields();
    },
    // 获取详情数据
    detailListData(id, index, openDetails) {
      this.saveDetails = [];
      this.changeData = [];
      this.isShowInput = [];
      this.$httpPost("/shop/admin/member/info", { id: id }, res => {
        this.listDetailData = res.data;
        this.listDetailData.index = index;
        let obj = {};
        obj.id = res.data.id;
        obj.mobile = res.data.mobile;
        obj.level = res.data.level;
        obj.sex = res.data.sex;
        obj.age = res.data.age;
        obj.nickname = res.data.nickname;
        obj.index = index;
        obj.headurl = res.data.headurl;
        obj.balance = Number(res.data.balance);
        let detailBool = {};
        detailBool.nickname = false;
        detailBool.mobile = false;
        detailBool.level = false;
        detailBool.sex = false;
        detailBool.age = false;
        detailBool.place = false;
        detailBool.password = false;
        detailBool.index = index;
        obj.place = [
          String(res.data.prov),
          String(res.data.city),
          String(res.data.area)
        ];
        if (!openDetails) {
          this.saveDetails.forEach((item, indexs) => {
            if (item.index === index) {
              this.saveDetails.splice(indexs, 1);
              this.changeData.splice(indexs, 1);
              this.isShowInput.splice(indexs, 1);
            }
          });
        } else {
          this.saveDetails.push(this.listDetailData);
          this.changeData.push(obj);
          this.isShowInput.push(detailBool);
        }
      });
    },
    //获取搜索列表所选等级
    getChangeLevel(val) {
      this.$httpGet(
        "/shop/admin/member/level/type/list",
        { type: val },
        res => {
          if (res.code === 200) {
            let arrs = [
              {
                id: -1,
                value: "全部"
              }
            ];
            for (let i = 0; i < res.data.length; i++) {
              arrs.push({
                id: res.data[i].id,
                value: res.data[i].name
              });
            }
            this.$set(this.searchParams[2], "options", arrs);
            if (this.$refs["searchList"].searchDataCopy.level != -1) {
              this.$set(this.$refs["searchList"].searchDataCopy, "level", -1);
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    // 获取列表数据
    getList(obj) {
      this.tableLoading = true;
      this.$httpGet("/shop/admin/member/list", obj, res => {
        this.$store.state.COMMON_loading = false;
        this.tableLoading = false;
        if (res.code === 200) {
          this.listData = [];
          this.saveDetails = [];
          this.changeData = [];
          this.isShowInput = [];
          this.$nextTick(() => {
            res.data.list.forEach(item => {
              let obj = {};
              obj = item;
              obj.openDetail = false;
              this.listData.push(obj);
            });
            this.memberLevelList = res.data.member_level_list;
            this.total = Number(res.data.total);
            this.page_size = Number(res.data.page_size);
            this.page = Number(res.data.current);
          });
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    // 添加会员
    addMemberData() {
      this.isShowStatus = true;
      this.buttonLoading = true;
      this.$refs["formList"].validate(valid => {
        if (valid) {
          let data;
          if (this.memberSelectData) {
            data = {
              mobile: this.formList.phoneNum,
              password: this.formList.password,
              nickname: this.formList.nickname,
              name: this.formList.name,
              admin_id: this.memberSelectData.id
            };
          } else {
            data = {
              mobile: this.formList.phoneNum,
              password: this.formList.password,
              nickname: this.formList.nickname,
              name: this.formList.name
            };
          }
          if (this.trafficAssignmentStatus) {
            data.admin_id_type = this.formList.admin_id_type;
          }
          this.$httpPost("/shop/admin/member/add", data, res => {
            if (res.code === 200) {
              this.searchData = Object.assign({}, initialSearchData);
              this.$nextTick(() => {
                this.$refs.searchList.onSearchClick();
              });
              this.page = 1;
              this.formList.phoneNum = "";
              this.formList.nickname = "";
              this.formList.password = "";
              // this.formList.password2 = "";
              this.formList.name = "";
              this.isShowStatus = false;
              this.$Message.success("新增成功");
              // this.dealWithData(); // searchData已经触发了
            } else if (res.code === 511) {
              // this.$Message.error(res.msg);
              this.$Modal.confirm({
                title: "提示",
                content:
                  res.data.status == 1
                    ? `你所添加的手机号【${this.formList.phoneNum}】已是商城会员，可前往<会员列表>查看会员详情。`
                    : `你所添加的手机号【${this.formList.phoneNum}】已是商城会员，但处于【封号】状态，可前往<会员列表>对会员进行解封。`,
                okText: res.data.status == 1 ? "前往查看" : "前往处理",
                onOk: () => {
                  this.searchData.status = "-1";
                  this.searchData.keyword = this.formList.phoneNum;
                  this.formList.phoneNum = "";
                  this.formList.nickname = "";
                  this.formList.password = "";
                  // this.formList.password2 = "";
                  this.formList.name = "";
                  this.isShowStatus = false;
                  this.dealWithData();
                  // this.$router.replace({
                  //   name: "memberList",
                  //   query: {
                  //     member_id: res.data.member_id
                  //   }
                  // })
                }
              });
            }
            this.buttonLoading = false;
          });
        } else {
          this.buttonLoading = false;
          this.$Message.error("新增失败");
        }
      });
    },
    // 接受重置组件失去焦点时传来的参数并提交参数
    passData(obj) {
      if (this.changeData.length > 1) {
        this.changeData.forEach((item, index) => {
          if (obj[0].index === item.index) {
            this.validationData(index, obj);
          }
        });
      } else {
        this.validationData(0, obj);
      }
    },
    validationData(num, obj) {
      if (!/^1[0-9]\d{9}$/.test(this.changeData[num].mobile)) {
        this.$Message.error("手机格式不正确");
        return;
      }
      if (
        this.changeData[num].age === "" ||
        this.changeData[num].level === ""
      ) {
        this.$Message.error("输入不能为空");
        return;
      }
      this.changeNews(num, obj);
    },
    // 修改密码
    changePassword(val) {
      this.changeNews(val);
    },
    // 修改信息
    changeNews(num, obj) {
      this.$nextTick(() => {
        let params = {};
        params.age = obj[0].age;
        params.id = obj[0].id;
        params.level = obj[0].level;
        params.mobile = obj[0].mobile;
        params.nickname = obj[0].nickname;
        params.sex = obj[0].sex;
        params.prov = obj[0].place[0];
        params.city = obj[0].place[1];
        params.area = obj[0].place[2];
        this.$httpPost("/shop/admin/member/edit", params, res => {
          if (res.code === 200) {
            if (obj[0].place.length > 0) {
              this.$httpPost(
                "/shop/admin/member/info",
                { id: this.listData[obj[0].index].id },
                res => {
                  this.saveDetails[num].prov_text = res.data.prov_text;
                  this.saveDetails[num].city_text = res.data.city_text;
                  this.saveDetails[num].area_text = res.data.area_text;
                }
              );
            }
            this.isShowInput[num].nickname = false;
            this.isShowInput[num].mobile = false;
            this.isShowInput[num].level = false;
            this.isShowInput[num].sex = false;
            this.isShowInput[num].age = false;
            this.isShowInput[num].place = false;
            this.isShowInput[num].password = false;
            if (obj[0].nickname) {
              this.listData[obj[0].index].nickname = obj[0].nickname;
              this.saveDetails[num].nickname = obj[0].nickname;
            }
            if (obj[0].mobile) {
              this.listData[obj[0].index].mobile = obj[0].mobile;
              this.saveDetails[num].mobile = obj[0].mobile;
            }
            if (obj[0].age) {
              this.saveDetails[num].age = obj[0].age;
            }
            if (obj[0].sex) {
              this.saveDetails[num].sex = obj[0].sex;
            }
            if (obj[0].level) {
              this.memberLevelList.forEach(item => {
                if (item.id === obj[0].level) {
                  this.listData[obj[0].index].level_name = item.name;
                  this.listData[obj[0].index].level = obj[0].level;
                }
              });
              this.saveDetails[num].level = obj[0].level;
            }

            this.$Message.success("修改成功");
          } else {
            this.$Message.error(res.msg);
          }
        });
      });
    },
    resetDataStatus(obj) {
      switch (obj.name) {
        case "nickname":
          this.isShowInput[obj.index].nickname = !this.isShowInput[obj.index]
            .nickname;
          break;
        case "mobile":
          this.isShowInput[obj.index].mobile = !this.isShowInput[obj.index]
            .mobile;
          break;
        case "level":
          this.isShowInput[obj.index].level = !this.isShowInput[obj.index]
            .level;
          break;
        case "sex":
          this.isShowInput[obj.index].sex = !this.isShowInput[obj.index].sex;
          break;
        case "age":
          this.isShowInput[obj.index].age = !this.isShowInput[obj.index].age;
          break;
        case "place":
          this.isShowInput[obj.index].place = !this.isShowInput[obj.index]
            .place;
          break;
        case "password":
          this.isShowInput[obj.index].password = !this.isShowInput[obj.index]
            .password;
          break;
        default:
          break;
      }
    },
    rechange(obj) {
      this.$httpPost(
        "/shop/admin/finance/rechange",
        {
          rechange_money: obj.rechangeMoney,
          about: obj.about,
          member_id: obj.member_id,
          financial_direction: obj.financialDirection
        },
        res => {
          if (res.code === 200) {
            this.$httpPost(
              "/shop/admin/member/info",
              { id: this.changeData[0].id },
              res => {
                var index = this.changeData[0].index;
                this.saveDetails[0].balance = res.data.balance;
                this.listData[index].balance = res.data.balance;
                this.saveDetails[0].balance_history = res.data.balance_history;
                this.changeData[0].balance = Number(res.data.balance);
              }
            );
            if (obj.balanceStatus === 0) {
              this.$Message.success("扣减成功");
            } else {
              this.$Message.success("充值成功");
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 弹出员工选择弹窗
     */
    onSelectMemberClick() {
      this.memberModalStatus = true;
    },
    /**
     * 重置员工数据
     */
    resetModalData() {
      this.memberSelectData = null;
      // this.$refs["modalMemberSelect"].resetData();
      this.$refs["memberSelectModal"].clearDatas();
    },
    deleteImg() {
      this.memberSelectData = null;
    },
    /**
     * 获取员工选择ID
     */
    onGetMemberSelectData(data) {
      this.memberSelectData = data;
      this.memberModalStatus = false;
    }
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.getChangeLevel(this.searchData.level_type);
    this.dealWithData();
    // this.getList({ page: this.page, page_size: this.page_size });
  }
};
</script>
<style lang="less" scoped>
.member-list {
  position: relative;
  padding: 24px 24px 0;
  height: 100%;
  overflow: auto;
  // .member-list-right {
  //   text-align: left;
  //   padding-top: 24px;
  // }
  .vertical-line-titlebar-wrapper {
    height: 50px;
    line-height: 50px;
    margin: -24px -24px 24px;
    padding-left: 24px;
    border-bottom: 1px solid #eee;
  }
  .marketing-search {
    // background-color: #f8f9fd;
    // border-radius: 5px;
    // margin: 24px 0px 24px 0px;
    // text-align: left;
    // padding-top: 16px;
    // padding-left: 16px;
    /deep/.data-list-search-btn {
      display: inline-block;
      margin-bottom: 0;
    }
    /deep/.data-list-search-item:nth-child(5) {
      .ivu-select {
        width: 100px;
      }
    }
  }
  .member-list-content {
    /deep/.table-container {
      height: 80px;
    }
  }
  /deep/.show-active {
    // color: red;
    .show-transform {
      transform: rotate(90deg);
      -ms-transform: rotate(90deg);
      -moz-transform: rotate(90deg);
      -webkit-transform: rotate(90deg);
      -o-transform: rotate(90deg);
    }
  }
  /deep/.ivu-cascader-arrow {
    left: 168px;
  }
  /deep/.ivu-tabs-nav {
    margin-left: 24px;
  }
  /deep/.ivu-tabs-bar {
    margin-bottom: 20px;
  }
  /deep/.ivu-tabs-tabpane {
    text-align: left;
    padding: 0 24px;
  }
  .marketing-search {
    /deep/.data-list-search-item:nth-child(5) {
      .ivu-select {
        width: 100px;
      }
    }
    .data-list-search-btn {
      display: inline-block;
    }
  }
  /deep/.ivu-table-column-center:last-child .ivu-table-cell {
    padding: 0;
  }
  /deep/.show-underLine:hover {
    text-decoration: underline;
  }
  /deep/.ivu-checkbox-focus {
    box-shadow: 0 0 0 1px rgba(74, 106, 245, 0.2);
  }
}
/deep/.employees {
  /deep/.ivu-form-item-label {
    line-height: unset;
  }
}
.common-modal-style {
  /deep/.ivu-input-wrapper {
    margin-right: 5px;
    width: auto;
  }
}
</style>
