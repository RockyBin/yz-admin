<template>
  <div class="marketing-add">
    <Form
      ref="formValidate"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="114"
      class="marketing-form"
      :class="{'change-marketing-form': selectName === 'use'}"
    >
      <Tabs size="small" :value="selectName" :animated="false" @on-click="switchTab">
        <TabPane
          label="基本信息"
          :name="tabName[0]"
          :disabled="disabledClick.news"
        >
          <div v-show="selectName === 'news'">
            <verticalLineTitlebar title="填写基本信息"/>
            <div class="padding-form">
              <FormItem label="优惠券标题：" prop="title">
                <div class="wrapper">
                  <i-input
                    v-model="formValidate.title"
                    class="formValidate-textarea"

                    :disabled="isShowDisable"
                    placeholder="请输入优惠券标题"
                    :maxlength="20"
                  ></i-input>
                  <span class="suffix">{{formValidate.title.length}}/20</span>
                </div>
              </FormItem>
              <FormItem label="应用终端：" prop="terminal_type">
                <CheckboxGroup v-model="formValidate.terminal_type">
                  <template v-for="(item, index) in terminals">
                    <Checkbox
                      v-if="item.id !== -1"
                      :label="String(item.id)"
                      :key="index"
                    >{{item.value}}</Checkbox>
                  </template>
                </CheckboxGroup>
              </FormItem>
              <FormItem label="使用门槛：" prop="doorsill_type">
                <RadioGroup v-model="formValidate.doorsill_type">
                  <Radio :label="0" :disabled="isShowDisable">无门槛</Radio>
                  <Radio :label="1" :disabled="isShowDisable">满额门槛</Radio>
                </RadioGroup>
              </FormItem>
              <div v-if="formValidate.doorsill_type === 1" class="div-margin">
                <FormItem prop="doorsill_full_money">
                  <label>满</label>
                  <InputNumber
                    v-model="formValidate.doorsill_full_money"
                    :min="1"
                    class="formValidate-input-money"
                    :disabled="isShowDisable"
                    placeholder="请输入金额"
                  ></InputNumber>
                  <label>元</label>
                  <more-message text="输入非零整数，值不能为空" placement="bottom" class="common-ml-10"></more-message>
                </FormItem>
              </div>
              <FormItem class="ivu-form-item-required" label="优惠券类型：" prop="coupon_type">
                <RadioGroup v-model="formValidate.coupon_type" @on-change="formValidate.coupon_money=null">
                  <Radio :label="0" :disabled="isShowDisable">现金券</Radio>
                  <Radio :label="1" :disabled="isShowDisable">折扣劵</Radio>
                </RadioGroup>
              </FormItem>
              <div class="div-margin">
                <FormItem prop="coupon_money" v-if="formValidate.coupon_type !== 1">
                  <InputNumber
                    :min="1"
                    :max="9999999.99"
                    :precision="2"
                    v-model="formValidate.coupon_money"
                    style="margin-left: 0;"
                    class="formValidate-input-money"
                    :disabled="isShowDisable"
                    placeholder="请输入金额"
                  ></InputNumber>
                  <label>元</label>
                  <more-message text="输入非零整数，值不能为空" placement="bottom" class="common-ml-10"></more-message>
                </FormItem>
                <FormItem prop="coupon_money" v-else>
                  <InputNumber
                    :min="0"
                    v-model="formValidate.coupon_money"
                    :max="10"
                    style="margin-left: 0;"
                    class="formValidate-input-money"
                    :disabled="isShowDisable"
                    placeholder="请输入折扣"
                  ></InputNumber>
                  <label>折</label>
                  <more-message text="输入0.1~10之间的数字，值不能为空" placement="bottom" class="common-ml-10"></more-message>
                </FormItem>
              </div>
              <FormItem label="有效期：" prop="effective_type" class="effective-bottom ivu-form-item-required">
                <RadioGroup v-model="formValidate.effective_type">
                  <Radio :label="0" :disabled="isShowDisable">指定日期</Radio>
                  <Radio :label="1" :disabled="isShowDisable">固定天数</Radio>
                </RadioGroup>
              </FormItem>
              <div v-if="formValidate.effective_type === 0" >
                <FormItem prop="effective_starttime" class="display-types">
                  <DatePicker
                    type="date"
                    placeholder="开始时间"
                    format="yyyy-MM-dd"
                    :editable="false"
                    v-model="formValidate.effective_starttime"
                    :options="startDateOptions"
                    :disabled="isShowDisable"
                    transfer
                  ></DatePicker>
                </FormItem>
                <label style="margin: 0 10px">-</label>
                <FormItem prop="effective_endtime" class="end-date display-types">
                  <DatePicker
                    type="date"
                    placeholder="结束时间"
                    format="yyyy-MM-dd"
                    :editable="false"
                    v-model="formValidate.effective_endtime"
                    :options="endDateOptions"
                    :disabled="isShowDisable"
                    transfer
                  ></DatePicker>
                </FormItem>
              </div>
              <div v-else>
                <FormItem prop="times" class="display-types">
                  <label>自领取日</label>
                  <InputNumber
                    v-model="formValidate.times"
                    :min="1"
                    class="formValidate-input-times"
                    :disabled="isShowDisable"
                    placeholder="请输入天数"
                  ></InputNumber>
                  <label>天内有效</label>
                  <more-message text="输入非零整数，值不能为空" placement="bottom" class="common-ml-10"></more-message>
                </FormItem>
              </div>
            </div>
            <verticalLineTitlebar title="指定用户群"/>
            <div class="padding-form">
              <FormItem label="指定用户群：" prop="member_type" style="margin-bottom:0px !important;">
                <RadioGroup v-model="formValidate.member_type">
                  <Radio :label="0" :disabled="isShowDisable">所有用户</Radio>
                </RadioGroup>
              </FormItem>
            </div>
            <verticalLineTitlebar title="参与商品"/>
            <div
              class="padding-form"
              :class="{
                'marketing-add-product_type': formValidate.product_type === 2
              }"
            >
              <FormItem label="参与商品：" prop="product_type">
                <RadioGroup v-model="formValidate.product_type">
                  <Radio :label="0" :disabled="isShowDisable">全部商品</Radio>
                  <Radio :label="1" :disabled="isShowDisable">商品分类</Radio>
                  <Radio :label="2" :disabled="isShowDisable">指定商品</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem v-if="[1, 2].includes(formValidate.product_type)">
                <tree-simple
                  v-if="formValidate.product_type === 1"
                  :data="product_info"
                  show-checkbox
                  @on-check-change="OnCheckChange"
                  @on-select-change="onSelectChange"
                ></tree-simple>
                <div v-else style="width: 702px;margin-top: -10px;">
                  <add-more
                    text="选择商品"
                    v-if="!isShowDisable"
                    @onAddMoreClick="onAddProductClick"
                  ></add-more>
                  <common-table
                    v-show="productSelectData.length"
                    :columnsData="productSelectTableColumn"
                    :listData="productSelectData"
                    type="border"
                  ></common-table>
                </div>
                <span v-if="isShowProductInfo">指定商品分类不能为空</span>
              </FormItem>
            </div>
          </div>
        </TabPane>
        <TabPane
          label="领取并使用"
          :name="tabName[1]"
          :disabled="disabledClick.use"
          class="marketing-receive"
        >
          <verticalLineTitlebar title="领取限制"/>
          <div class="padding-form">
            <FormItem label="领取券总数量：">
              <RadioGroup v-model="formValidate.amount_type">
                <Radio :label="0">无限</Radio>
                <Radio :label="1">有限张数</Radio>
              </RadioGroup>
            </FormItem>
            <div v-if="formValidate.amount_type === 1" class="div-margin">
              <FormItem prop="amount">
                <InputNumber
                  :min="1"
                  v-model="formValidate.amount"
                  class="formValidate-input-amount"
                ></InputNumber>
                <label>张</label>
                <more-message text="输入非零整数，值不能为空" placement="bottom" class="common-ml-10"></more-message>
              </FormItem>
            </div>
            <FormItem label="领取张数限制：">
              <RadioGroup v-model="formValidate.receive_limit_type">
                <Radio :label="0">无限</Radio>
                <Radio :label="1">有限张数</Radio>
              </RadioGroup>
            </FormItem>
            <div v-if="formValidate.receive_limit_type === 1" class="div-margin">
              <FormItem prop="receive_limit_num">
                <label>每人限领</label>
                <InputNumber
                  :min="1"
                  v-model="formValidate.receive_limit_num"
                  style="width:110px;margin: 0 12px"
                ></InputNumber>
                <label>张</label>
                <more-message text="输入非零整数，值不能为空" placement="top" class="common-ml-10"></more-message>
              </FormItem>
            </div>
            <FormItem label="是否开放领取：">
              <more-message text="开放领取是指该券展示在商品详情页/优惠券列表可供用户自由领取，否则只能后台推送" placement="bottom" class="common-mr-12"></more-message>
              <RadioGroup v-model="formValidate.receivie_status">
                <Radio :label="1" :disabled="isShowDisable">是</Radio>
                <Radio :label="0" :disabled="isShowDisable">否</Radio>
              </RadioGroup>
            </FormItem>
          </div>
        </TabPane>
      </Tabs>
    </Form>
    <foot-button>
      <Button
        style="width: 100px;height: 32px;"
        v-if="selectName === tabName[1]"
        @click="backPrevious"
        >返回上一步</Button
      >
      <Button
        style="width: 70px;height: 32px;"
        type="primary"
        v-if="selectName === tabName[1]"
        :loading="buttonLoading"
        @click="handleSubmitUse"
        perm="coupon.operate"
        >保存</Button
      >
      <Button
        style="width: 100px;height: 32px;"
        type="primary"
        v-else
        @click="handleSubmit"
        >保存并下一步</Button
      >
    </foot-button>
    <product-list-modal
      @onGetProductInfo="onGetProductInfo"
      v-model="modalStatus"
      :productIds="productIds"
    ></product-list-modal>
  </div>
</template>
<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import constants from "@/views/shop/components/constants.js";
import moreMessage from "COMPONENTS/more-message/more-message";
import treeSimple from "COMPONENTS/selector/class-tree-simple";
import commonTable from "@/views/shop/components/table/common-table.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import productListModal from "@/views/shop/store/design/components/product-list.vue";
let tabName = ["news", "use"];
export default {
  components: {
    footButton,
    verticalLineTitlebar,
    moreMessage,
    treeSimple,
    commonTable,
    addMore,
    productListModal
  },
  data() {
    const checkTitle = (rule, value, callback) => {
      if (value) {
        callback();
      } else {
        callback(new Error("请输入优惠券标题"));
      }
    };
    const checkCouponMoney = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入数值"));
      }
      if (
        this.formValidate.coupon_type == 0 &&
        /^\+?[1-9][0-9]*$/.test(value) !== true
      ) {
        callback(new Error("请输入非零整数"));
      }
      if (
        this.formValidate.coupon_type === 1 &&
        /^(([1-9]\d{0,9})|0)(\.\d{0,1})?$/.test(value) !== true
      ) {
        callback(new Error("只能保留一位小数"));
      }
      callback();
    };
    const checkAmount = (rule, value, callback) => {
      if (/^\+?[1-9][0-9]*$/.test(value) !== true) {
        callback(new Error("请输入非零整数"));
      }
      if (
        this.formValidate.amount_type === 1 &&
        this.formValidate.have_received > value
      ) {
        callback(
          new Error(
            "总数量应比领取数量(" + this.formValidate.have_received + ")大"
          )
        );
      }
      callback();
    };
    return {
      // 开始时间必须要小于结束时间
      startDateOptions: {
        disabledDate: function(date) {
          if (this.formValidate.effective_endtime) {
            return (
              (date &&
                date.valueOf() >
                  new Date(this.formValidate.effective_endtime) - 86400000) ||
              (date && date.valueOf() < Date.now() - 86400000)
            );
          } else {
            return date && date.valueOf() < Date.now() - 86400000;
          }
        }.bind(this)
      },
      // 结束时间必须要大于开始时间
      endDateOptions: {
        disabledDate: function(date) {
          if (this.formValidate.effective_starttime) {
            return (
              (date &&
                date.valueOf() - 86400000 <
                  new Date(this.formValidate.effective_starttime)) ||
              (date && date.valueOf() < Date.now() - 86400000)
            );
          } else {
            return date && date.valueOf() < Date.now() - 86400000;
          }
        }.bind(this)
      },
      recordId: [],
      buttonLoading: false, // 按钮loading
      isShowDisable: false,
      isShowProductInfo: false, // 显示指定商品
      selectName: tabName[0], // 默认显示基本信息
      tabName,
      disabledClick: {
        news: true,
        use: true
      },
      terminals: constants.terminalSearch, // 接收终端来源的数据
      product_info: [], // 分类信息
      formValidate: {
        title: "", // 优惠券标题
        doorsill_type: 0, // 使用门槛
        terminal_type: ["2", "3","4","6"], // 应用终端 默认全选
        // terminal_type: ["1", "2", "3", "4"],
        doorsill_full_money: null, // 门槛金额
        coupon_type: 0, // 优惠卷类型
        coupon_money: null, // 优惠券 现金
        effective_type: 0, // 有效期类型
        times: null, // 天数
        effective_starttime: "", // 开始日期
        effective_endtime: "", // 结束日期
        member_type: 0, // 指定用户群
        product_type: 0, // 指定商品
        amount_type: 0,
        amount: 1,
        receive_limit_type: 0,
        receive_limit_num: 1,
        have_received: 0,
        receivie_status: 1 //是否开放领取
      },
      treeData: [],
      modalStatus: false,
      productSelectTableColumn: [
        {
          title: "商品信息",
          width: 286,
          render: (h, params) => {
            let status = params.row.status === 1;
            return h("div", {}, [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    marginRight: "8px",
                    verticalAlign: "middle"
                    // border: "1px solid #eeeeee"
                  }
                },
                [
                  h("img", {
                    attrs: {
                      src:
                        params.row.small_images.split(",").length &&
                        this.$store.state.siteComdataPath +
                          params.row.small_images.split(",")[0]
                    },
                    style: {
                      height: "40px",
                      width: "40px",
                      display: "block",
                      objectFit: "contain"
                    }
                  })
                ]
              ),
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    width: status ? "calc(100% - 48px)" : "calc(100% - 108px)",
                    textAlign: "left",
                    lineHeight: "initial",
                    "font-size": "0"
                  }
                },
                [
                  h(
                    "Tooltip",
                    {
                      style: {
                        width: "100%"
                      },
                      props: {
                        content: params.row.name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      }
                    },
                    [
                      h(
                        "div",
                        {
                          style: {
                            display: "-webkit-inline-box",
                            "-webkit-line-clamp": 2,
                            "-webkit-box-orient": "vertical",
                            overflow: "hidden",
                            lineHeight: "21px",
                            "font-size": "12px"
                          }
                        },
                        params.row.name
                      )
                    ]
                  )
                ]
              ),
              status
                ? ""
                : h(
                    "div",
                    {
                      class: "table-error",
                      style: {
                        "vertical-align": "middle",
                        "margin-left": "10px",
                        "margin-right": "-4px"
                      }
                    },
                    params.row.status === 0 ? "已下架" : "已删除"
                  )
            ]);
          }
        },
        {
          title: "商品分类",
          width: 172,
          align: "center",
          render: (h, params) => {
            let text = "";
            if (typeof params.row.product_class === "string") {
              text = params.row.product_class;
            } else {
              let classObj = {};
              let classArray =
                params.row.product_class || params.row.class || [];
              classArray.forEach(item => {
                classObj[item.id] = true;
              });
              text = classArray
                .filter(item => !classObj[item.parent_id])
                .map(item => item.class_name)
                .join(",");
            }
            return h(
              "div",
              { style: { "line-height": "initial" } },
              params.row.status === -9 ? "--" : text || ""
            );
          }
        },
        {
          title: "销售价",
          width: 110,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.status === -9 ? "--" : "￥" + params.row.price
            );
          }
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              params.row.status === -9
                ? ""
                : h(
                    "a",
                    {
                      class: {
                        "table-operation": true
                      },
                      on: {
                        click: () => {
                          this.$router.push({
                            name: "productDetail",
                            query: {
                              id: params.row.id
                            }
                          });
                        }
                      }
                    },
                    "查看详情"
                  ),
              params.row.status === -9 || this.isShowDisable
                ? ""
                : h("span", {
                    style: {
                      display: "inline-block",
                      width: "1px",
                      "background-color": "#3f66d3",
                      height: "12px",
                      "vertical-align": "middle",
                      margin: "0 14px"
                    }
                  }),
              this.isShowDisable
                ? ""
                : h(
                    "a",
                    {
                      class: {
                        "table-operation": true
                      },
                      on: {
                        click: () => {
                          this.productSelectData.splice(params.index, 1);
                        }
                      }
                    },
                    "删除"
                  ),
              params.row.status === -9 && this.isShowDisable ? "--" : ""
            ]);
          }
        }
      ],
      productSelectData: [],
      ruleValidate: {
        title: [
          {
            required: true,
            validator: checkTitle,
            trigger: "blur"
          }
        ],
        terminal_type: [
          {
            required: true,
            type: "array",
            min: 1,
            message: "至少选择一个应用终端",
            trigger: "change"
          }
        ],
        doorsill_full_money: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.formValidate.doorsill_type === 0) {
                return callback();
              }
              if (value > 0) {
                return callback();
              } else {
                return callback(new Error("值不能为空"));
              }
            }
          },
          {
            message: "请输入非零整数",
            trigger: "change",
            pattern: /^\+?[1-9][0-9]*$/
          }
        ],
        coupon_money: [
          {
            validator: checkCouponMoney,
            trigger: "blur",
            type: "number"
            // pattern: /^(([1-9]\d{0,9})|0)(\.\d{0,1})?$/
          }
        ],
        amount: [
          {
            validator: checkAmount,
            trigger: "blur",
            type: "number"
          }
        ],
        receive_limit_num: [
          {
            validator: (rule, value, callback) => {
              if (/^\+?[1-9][0-9]*$/.test(value) !== true) {
                return callback(new Error("请输入非零整数"));
              } else {
                return callback();
              }
            },
            trigger: "blur",
            type: "number"
          }
        ],
        times: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.formValidate.effective_type === 0) {
                return callback();
              }
              if (value > 0) {
                let reg = /^\+?[1-9][0-9]*$/;
                if (reg.test(value)) {
                  return callback();
                } else {
                  return callback(new Error("请输入非零整数"));
                }
              } else {
                return callback(new Error("值不能为空"));
              }
            },
            trigger: "blur",
            type: "number"
          }
        ],
        effective_starttime: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.formValidate.effective_type === 1) {
                return callback();
              }
              if (value) {
                return callback();
              } else {
                return callback(new Error("请选择开始时间"));
              }
            },
            type: "date",
            trigger: "change"
          }
        ],
        effective_endtime: [
          {
            required: true,
            type: "date",
            message: "请选择结束时间",
            trigger: "change"
          }
        ],
        product_type: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === 0) {
                return callback();
              } else if (value === 1) {
                let treeArarry = [];
                if (this.treeData) {
                  for (let i = 0; i < this.treeData.length; i++) {
                    if (this.treeData[i].checked == true) {
                      treeArarry.push(this.treeData[i].id);
                    }
                  }
                }
                return treeArarry.length
                  ? callback()
                  : callback(new Error("至少选择一个商品分类"));
              } else {
                return this.productSelectData.length
                  ? callback()
                  : callback(new Error("至少选择一个指定商品"));
              }
            },
            trigger: "none"
          }
        ]
      }
    };
  },
  watch: {
    formValidate: {
      handler() {
        this.$nextTick(() => this.checkNext());
      },
      deep: true
    },
    productSelectData() {
      this.$nextTick(() => this.checkNext());
    },
    treeData() {
      this.$nextTick(() => this.checkNext());
    }
  },
  computed: {
    productIds() {
      return this.productSelectData.map(n => n.id);
    }
  },
  methods: {
    checkNext() {
      this.$refs["formValidate"].validate(valid => {
        if (valid) {
          this.disabledClick.news = false;
          this.disabledClick.use = false;
        } else {
          // 清除验证信息
          this.disabledClick.use = true;
          this.disabledClick.news = true;
          this.$refs["formValidate"].fields.forEach(el => {
            el.validateState = "";
          });
        }
      });
    },
    switchTab(name) {
      if (this.selectName === "news" && name !== this.selectName) {
        if (!this.disabledClick.use) {
          this.handleSubmit();
        }
        this.selectName = name;
      } else if (this.selectName === "use" && name !== this.selectName) {
        this.selectName = name;
      }
    },
    // 添加商品
    onAddProductClick() {
      this.modalStatus = true;
    },
    onGetProductInfo(val) {
      this.productSelectData.unshift(...val);
    },
    // 转为时间格式
    initFormatter(date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      var d = date.getDate();
      d = d < 10 ? "0" + d : d;
      return y + "-" + m + "-" + d;
      // var h = date.getHours();
      // h = h < 10 ? "0" + h : h;
      // var minute = date.getMinutes();
      // minute = minute < 10 ? "0" + minute : minute;
      // var second = date.getSeconds();
      // second = minute < 10 ? "0" + second : second;
      // return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
    },
    // 字符串转Date()
    parserDate(date) {
      var t = Date.parse(date);
      if (!isNaN(t)) {
        return new Date(Date.parse(date.replace(/-/g, "/")));
      }
    },
    // 保存并下一步
    handleSubmit() {
      // 编辑 启用 基本信息不需要验证
      if (this.isShowDisable) {
        this.selectName = "use";
      } else {
        this.$refs["formValidate"].validate(valid => {
          if (valid) {
            // 禁用 启用时 有效日期必须大于今天的日期
            if (
              this.$route.query.status === 0 &&
              this.formValidate.effective_type === 0
            ) {
              let today = new Date();
              if (
                new Date(Date.parse(today)) >
                new Date(Date.parse(this.formValidate.effective_endtime))
              ) {
                this.formValidate.effective_endtime = "";
                this.$Message.error("请输入有效日期");
                return;
              }
            }
            this.selectName = "use";
          } else {
            this.$Message.error(this.$store.state.FAIL_MSG);
          }
        });
      }
    },
    // 保存提交
    savePost(urls) {
      let data = {};
      delete this.formValidate.have_received;
      data = Object.assign({}, this.formValidate);
      // 选择日期时传数据必须转出时间格式
      if (this.formValidate.effective_type === 0) {
        // 如果日期是时间格式则不需要转换
        if (!isNaN(data.effective_starttime)) {
          data.effective_starttime = this.initFormatter(
            data.effective_starttime
          );
        }
        if (!isNaN(data.effective_endtime)) {
          data.effective_endtime = this.initFormatter(data.effective_endtime);
        }
      } else {
        // 这里主需要清空开始日期，结束日期会接收天数
        data.effective_starttime = "";
      }
      if (this.formValidate.effective_type === 1) {
        data.effective_endtime = data.times;
      }
      delete data.times;
      // 处理参与商品的数据
      if (this.formValidate.product_type === 1) {
        data.product_info = [];
        this.product_info.forEach((item, index) => {
          if (item.checked === true) {
            data.product_info.push(item.id);
          }
          if (this.product_info[index].children) {
            this.product_info[index].children.forEach(items => {
              if (items.checked === true) {
                data.product_info.push(items.id);
              }
            });
          }
        });
        data.product_info = data.product_info.join(",");
      } else if (this.formValidate.product_type === 2) {
        data.product_info = this.productSelectData
          .map(item => item.id)
          .join(",");
      } else {
        data.product_info = "";
      }
      data.terminal_type = this.formValidate.terminal_type.join(",");
      this.$httpPost(urls, data, res => {
        if (res.code === 200) {
          if (this.$route.query.id) {
            this.$Message.success("编辑成功");
          } else {
            this.$Message.success("新增成功");
          }
          this.$router.push({ name: "marketingManage" });
        } else {
          this.$Message.error(res.msg);
        }
        this.buttonLoading = false;
      });
    },
    // 保存
    handleSubmitUse() {
      this.buttonLoading = true;
      this.$refs["formValidate"].validate(valid => {
        if (valid) {
          if (this.isShowDisable || this.$route.query.status == 0) {
            this.savePost("/shop/admin/coupon/edit");
          } else {
            this.selectName = "use";
            this.savePost("/shop/admin/coupon/add");
          }
        } else {
          this.buttonLoading = false;
          // 根据报错信息跳转到相应页显示
          this.selectName = this.$refs["formValidate"].fields.find(
            el =>
              [
                "title",
                "terminal_type",
                "doorsill_full_money",
                "coupon_money",
                "times",
                "effective_starttime",
                "effective_endtime",
                "product_type"
              ].includes(el.prop) && el.validateState !== "success"
          )
            ? tabName[0]
            : tabName[1];
          this.$Message.error("保存失败");
        }
      });
    },
    OnCheckChange(data) {
      this.treeData = [...data];
    },
    onSelectChange(data, obj) {
      let checked = !obj.checked;
      this.product_info.forEach(el => {
        if (obj.id === el.id) {
          this.$set(el, "checked", checked);
          this.$set(el, "indeterminate", false);
          if (el.children) {
            for (let i = 0; i < el.children.length; i++) {
              this.$set(el.children[i], "checked", checked);
            }
          }
        } else {
          if (el.children) {
            let status = true; // 标记全选，为true就是全选
            let indStatus = true; // 标记全不选，为true就是全不选
            let isCurrent = false;
            for (let i = 0; i < el.children.length; i++) {
              if (obj.id === el.children[i].id) {
                this.$set(el.children[i], "checked", checked);
                isCurrent = true;
              }
              if (!el.children[i].checked) {
                status = false;
              } else {
                indStatus = false;
              }
            }
            if (isCurrent) {
              this.$set(el, "checked", status);
              // 只有部分选才为true，就是排除全选和全不选状态
              this.$set(el, "indeterminate", !(status || indStatus));
            }
          }
        }
      });
      let newArray = [];
      this.product_info.forEach(item => {
        if (item.checked) {
          newArray.push(item);
        }
        if (item.children) {
          item.children.forEach(items => {
            if (items.checked) {
              newArray.push(items);
            }
          });
        }
      });
      this.treeData = [...newArray];
    },
    // 返回上一步
    backPrevious() {
      this.selectName = "news";
    },
    // 获取基本信息
    infoData() {
      this.$httpPost("/shop/admin/coupon/info", this.$route.query, res => {
        if (res.code === 200) {
          this.formValidate = res.data.info;
          this.formValidate.effective_endtime =
            this.formValidate.effective_type == 1
              ? this.formValidate.effective_endtime
              : this.parserDate(this.formValidate.effective_endtime);
          this.formValidate.effective_starttime = this.parserDate(
            this.formValidate.effective_starttime
          );
          this.formValidate.coupon_money = Number(
            this.formValidate.coupon_money
          );
          if (this.formValidate.effective_type === 1) {
            this.formValidate.times = this.formValidate.effective_endtime;
            this.formValidate.effective_endtime = "";
          }
          // 后台传过来的是字符串，渲染需要转出数组
          this.formValidate.terminal_type = this.formValidate.terminal_type.split(
            ","
          );
          this.formValidate.coupon_money = Number(
            this.formValidate.coupon_money
          );
          // 启用 不允许修改基本信息
          if (this.$route.query.status !== 0) {
            this.isShowDisable = true;
          }
          // 如果选中商品分类则直接拿到数据，否则加载分类列表
          if (res.data.info.product_info && res.data.info.product_type === 1) {
            this.product_info = res.data.info.product_info;
            this.treeStructure();
          } else {
            this.productClass(1);
          }
          // 如果选中指定商品则显示商品数据
          if (res.data.info.product_info && res.data.info.product_type === 2) {
            this.productSelectData = res.data.info.product_info;
          }
        }
      });
    },
    // 渲染树形结构
    treeStructure() {
      if (this.product_info) {
        // 渲染树形结构
        for (let i = 0; i < this.product_info.length; i++) {
          this.product_info[i].disabled = true;
          this.product_info[i].expand = true;
          if (this.product_info[i].children) {
            for (let j = 0; j < this.product_info[i].children.length; j++) {
              this.product_info[i].children[j].disabled = true;
            }
          }
        }
      }
      this.onSelectChange([], {});
    },
    // 获取产品分类
    productClass(status) {
      this.$httpPost("/shop/admin/coupon/productclass", "", res => {
        this.product_info = res.data;
        status && this.treeStructure();
      });
    }
  },
  mounted() {
    // 点击编辑传过来的参数
    if (this.$route.query.id) {
      this.selectName = "news";
      // if (this.$route.query.status == 0) {
      //   this.selectName = "news";
      // } else {
      //   this.selectName = "use";
      // }
      this.infoData();
    } else {
      this.selectName = "news";
      this.productClass();
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-add {
  height: calc(100% - 70px);
  overflow: auto;
  .marketing-receive {
    /deep/.ivu-form-item-required .ivu-form-item-label:before {
      display: none;
    }
  }
  /deep/.ivu-tabs {
    .ivu-tabs-content {
      margin-left: 24px;
      margin-top: 24px;
      .ivu-form-item {
        margin-bottom: 30px;
      }
    }
    .ivu-tabs-bar {
      margin-bottom: 30px;
    }
  }
  .change-marketing-form {
    height: 100% !important;
    min-height: 100% !important;
  }
  .effective-bottom {
    margin-bottom: 5px !important;
  }
  .marketing-form {
    text-align: left;
    min-height: 100vh;
    .wrapper {
      width: fit-content;
      position: relative;
      .suffix {
        position: absolute;
        right: 10px;
        bottom: 8px;
        line-height: 1;
        color: #999;
      }
    }
    .marketing-add-product_type {
      /deep/.ivu-form-item-error-tip {
        padding: 0;
        margin-top: 10px;
        line-height: 32px;
        margin-left: 106px;
      }
    }
    .padding-form {
      padding: 20px 0 24px;
    }
    /deep/.form-tree {
      margin-bottom: 30px;
    }
    /deep/.vertical-line-titlebar-wrapper {
      height: auto;
      line-height: normal;
    }
    /deep/.formValidate-textarea {
      width: 320px;
      textarea {
        height: 20px;
      }
    }
    /deep/.form-number {
      display: inline-block;
      vertical-align: bottom;
      margin-left: 10px;
      line-height: 12px;
    }
    /deep/.formValidate-input-money {
      width: 110px;
      margin: 5px 12px 0;
    }
    /deep/.display-types {
      margin-bottom: 0px !important;
      display: inline-block;
    }
    /deep/.formValidate-input-times {
      width: 110px;
      margin: 0 5px;
    }
    /deep/.formValidate-input-amount {
      width: 110px;
      margin-right: 12px;
    }
    /deep/.end-date {
      .ivu-form-item-content {
        margin-left: 0 !important;
      }
    }
    /deep/.form-button {
      height: 70px;
      border-top: 1px solid #ddd;
      position: absolute;
      bottom: -30px;
      width: 100%;
      left: -24px;
      width: calc(100% + 24px);
      button {
        width: 110px;
        margin-top: 18px;
        border-radius: 16px;
        margin-left: calc(50% - 55px);
      }
    }
    /deep/.ivu-picker-confirm-time {
      display: none;
    }
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
    .ivu-radio {
      margin-right: 5px;
    }
  }
  /deep/.ivu-checkbox-wrapper {
    margin-right: 20px;
    .ivu-checkbox {
      margin-right: 5px;
    }
  }
  .div-margin {
    margin-bottom: 20px;
    /deep/.ivu-form-item-content {
      margin-top: -20px;
    }
  }
  /deep/.ivu-tabs-nav-scroll {
    .ivu-tabs-tab {
      font-size: 15px;
    }
  }
}
</style>
