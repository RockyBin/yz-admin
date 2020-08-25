<template>
  <div>
    <Form ref="form" :model="conditions" :labelWidth="150">
      <FormItem prop="autoUpgrade" label="是否允许会员自动升级：">
          <RadioGroup v-model="info.auto_upgrade">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
            </RadioGroup>
      </FormItem>
      <FormItem prop="foo" label="升级条件：">
        <Button
          type="primary"
          shape="circle"
          icon="md-add"
          @click="addCondition"
          >添加条件</Button
        >
        <more-message
          style="vertical-align:initial;margin-left:10px;"
          :maxWidth="350"
          text="没有设置升级条件则表示将没有会员可以自动升级到该等级。"
        ></more-message>
        <span v-if="conditionError" class="error-tips">{{
          conditionError == 1
            ? "已添加的数值条件不能为空"
            : "请添加至少一条升级条件"
        }}</span>
        <Collapse simple v-model="openPanels">
          <Panel
            v-show="
              conditions[TeamDealerNum] ||
                conditions[DirectlyDealerNum] ||
                conditions[IndirectDealerNum]
            "
            name="1"
            hide-arrow
          >
            <div class="title">
              <i
                class="iconfont icon-md-arrow-dropright"
                :class="{ rotate: openPanels.includes('1') }"
              ></i>
              <span>人数：</span>
            </div>
            <div slot="content">
              <template v-if="conditions[TeamDealerNum]">
                <div
                  v-for="(item, index) in conditions[TeamDealerNum]"
                  :key="TeamDealerNum + '-' + index"
                  class="condition-row"
                >
                  <span>团队</span>
                  <FormItem
                    :prop="
                      TeamDealerNum + '[' + index + '].value.dealer_level_id[0]'
                    "
                    :rules="[
                      {
                        required: true,
                        message: ' ',
                        type: 'number',
                        validator: validator,
                        trigger: 'change'
                      }
                    ]"
                  >
                    <Select
                      class="common-input-text-156"
                      transfer
                      transfer-class-name="common-input-select-transfer"
                      v-model="
                        conditions[TeamDealerNum][index].value
                          .dealer_level_id[0]
                      "
                    >
                      <Option
                        v-for="item in dealerList"
                        :class="{ 'second-level': item.parent_id }"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <span>等级经销商合计数量&nbsp;&nbsp;满</span>
                  <FormItem
                    :prop="TeamDealerNum + '[' + index + '].value.member_count'"
                    :rules="[
                      {
                        required: true,
                        message: ' ',
                        type: 'number',
                        validator: validator
                      }
                    ]"
                  >
                    <InputNumber
                      class="common-input-text-156"
                      :min="1"
                      :max="9999999"
                      :precision="0"
                      v-model="item.value.member_count"
                      placeholder="请输入"
                    ></InputNumber>
                  </FormItem>
                  <span>人</span>
                  <more-message
                    text="团队内，XX等级的经销商的总人数，不包括自己"
                  ></more-message>
                  <RadioGroup v-model="item.logistic">
                    <Radio label="or">或</Radio>
                    <Radio label="and">与</Radio>
                  </RadioGroup>
                  <span
                      style="color: #9ea7b4;padding-right: 14px;"
                      v-if="item.explain"
                  >（只对【经销商】升级有效）</span>
                  <span
                    class="table-operation"
                    @click="
                      deleteConditionArray(conditions[TeamDealerNum][index])
                    "
                    >删除</span
                  >
                </div>
              </template>
              <div
                style="padding-bottom: 20px;"
                v-if="conditions[TeamDealerNum]"
              >
                <span
                  class="table-operation"
                  @click="addConditionArray(conditions[TeamDealerNum])"
                  style="display: block;line-height: initial;width: 36px;"
                  ><i class="ivu-icon ivu-icon-md-add"></i>添加</span
                >
              </div>
              <template v-if="conditions[DirectlyDealerNum]">
                <div
                  v-for="(item, index) in conditions[DirectlyDealerNum]"
                  :key="DirectlyDealerNum + '-' + index"
                  class="condition-row"
                >
                  <span>直推</span>
                  <FormItem
                    :prop="
                      DirectlyDealerNum +
                        '[' +
                        index +
                        '].value.dealer_level_id[0]'
                    "
                    :rules="[
                      {
                        required: true,
                        message: ' ',
                        type: 'number',
                        validator: validator,
                        trigger: 'change'
                      }
                    ]"
                  >
                    <Select
                      class="common-input-text-156"
                      transfer
                      transfer-class-name="common-input-select-transfer"
                      v-model="
                        conditions[DirectlyDealerNum][index].value
                          .dealer_level_id[0]
                      "
                    >
                      <Option
                        v-for="item in dealerList"
                        :class="{ 'second-level': item.parent_id }"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <span>等级经销商合计数量&nbsp;&nbsp;满</span>
                  <FormItem
                    :prop="
                      DirectlyDealerNum + '[' + index + '].value.member_count'
                    "
                    :rules="[
                      {
                        required: true,
                        message: ' ',
                        type: 'number',
                        validator: validator
                      }
                    ]"
                  >
                    <InputNumber
                      class="common-input-text-156"
                      :min="1"
                      :max="9999999"
                      :precision="0"
                      v-model="item.value.member_count"
                      placeholder="请输入"
                    ></InputNumber>
                  </FormItem>
                  <span>人</span>
                  <more-message
                    text="所有直推的XX等级经销商人数，不包括自己"
                  ></more-message>
                  <RadioGroup v-model="item.logistic">
                    <Radio label="or">或</Radio>
                    <Radio label="and">与</Radio>
                  </RadioGroup>
                  <span
                      style="color: #9ea7b4;padding-right: 14px;"
                      v-if="item.explain"
                  >（只对【经销商】升级有效）</span>
                  <span
                    class="table-operation"
                    @click="
                      deleteConditionArray(conditions[DirectlyDealerNum][index])
                    "
                    >删除</span
                  >
                </div>
              </template>
              <div
                style="padding-bottom: 20px;"
                v-if="conditions[DirectlyDealerNum]"
              >
                <span
                  class="table-operation"
                  @click="addConditionArray(conditions[DirectlyDealerNum])"
                  style="display: block;line-height: initial;width: 36px;"
                  ><i class="ivu-icon ivu-icon-md-add"></i>添加</span
                >
              </div>
              <template v-if="conditions[IndirectDealerNum]">
                <div
                  v-for="(item, index) in conditions[IndirectDealerNum]"
                  :key="IndirectDealerNum + '-' + index"
                  class="condition-row"
                >
                  <span>间推</span>
                  <FormItem
                    :prop="
                      IndirectDealerNum +
                        '[' +
                        index +
                        '].value.dealer_level_id[0]'
                    "
                    :rules="[
                      {
                        required: true,
                        message: ' ',
                        type: 'number',
                        validator: validator,
                        trigger: 'change'
                      }
                    ]"
                  >
                    <Select
                      class="common-input-text-156"
                      transfer
                      transfer-class-name="common-input-select-transfer"
                      v-model="
                        conditions[IndirectDealerNum][index].value
                          .dealer_level_id[0]
                      "
                    >
                      <Option
                        v-for="item in dealerList"
                        :class="{ 'second-level': item.parent_id }"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <span>等级经销商合计数量&nbsp;&nbsp;满</span>
                  <FormItem
                    :prop="
                      IndirectDealerNum + '[' + index + '].value.member_count'
                    "
                    :rules="[
                      {
                        required: true,
                        message: ' ',
                        type: 'number',
                        validator: validator
                      }
                    ]"
                  >
                    <InputNumber
                      class="common-input-text-156"
                      :min="1"
                      :max="9999999"
                      :precision="0"
                      v-model="item.value.member_count"
                      placeholder="请输入"
                    ></InputNumber>
                  </FormItem>
                  <span>人</span>
                  <more-message
                    text="所有间推的XX等级经销商人数，不包括自己"
                  ></more-message>
                  <RadioGroup v-model="item.logistic">
                    <Radio label="or">或</Radio>
                    <Radio label="and">与</Radio>
                  </RadioGroup>
                  <span
                      style="color: #9ea7b4;padding-right: 14px;"
                      v-if="item.explain"
                  >（只对【经销商】升级有效）</span>
                  <span
                    class="table-operation"
                    @click="
                      deleteConditionArray(conditions[IndirectDealerNum][index])
                    "
                    >删除</span
                  >
                </div>
              </template>
              <div
                style="padding-bottom: 20px;"
                v-if="conditions[IndirectDealerNum]"
              >
                <span
                  class="table-operation"
                  @click="addConditionArray(conditions[IndirectDealerNum])"
                  style="display: block;line-height: initial;width: 36px;"
                  ><i class="ivu-icon ivu-icon-md-add"></i>添加</span
                >
              </div>
            </div>
          </Panel>
          <Panel v-show="conditions[SelfBuyMoney]" name="2" hide-arrow>
            <div class="title">
              <i
                class="iconfont icon-md-arrow-dropright"
                :class="{ rotate: openPanels.includes('2') }"
              ></i>
              <span>订单：</span>
            </div>
            <div slot="content">
              <div v-if="conditions[SelfBuyMoney]" class="condition-row">
                <span>自购云仓订单金额&nbsp;&nbsp;满</span>
                <FormItem
                  :prop="SelfBuyMoney + '.value'"
                  :rules="[
                    {
                      required: true,
                      message: ' ',
                      type: 'number',
                      validator: validator
                    }
                  ]"
                >
                  <InputNumber
                    class="common-input-text-156"
                    :min="1"
                    :max="9999999"
                    :precision="2"
                    v-model="conditions[SelfBuyMoney].value"
                    placeholder="请输入"
                  ></InputNumber>
                </FormItem>
                <span>元</span>
                <more-message text="自购的云仓进货订单总金额"></more-message>
                <RadioGroup v-model="conditions[SelfBuyMoney].logistic">
                  <Radio label="or">或</Radio>
                  <Radio label="and">与</Radio>
                </RadioGroup>
                <span
                    style="color: #9ea7b4;padding-right: 14px;"
                    v-if="conditions[SelfBuyMoney].explain"
                >（只对【经销商】升级有效）</span>
                <span
                  class="table-operation"
                  @click="deleteCondition(SelfBuyMoney)"
                  >删除</span
                >
              </div>
            </div>
          </Panel>
          <Panel
            v-show="
              conditions[TotalRechargeMoney] || conditions[OnceRechargeMoney]
            "
            name="3"
            hide-arrow
          >
            <div class="title">
              <i
                class="iconfont icon-md-arrow-dropright"
                :class="{ rotate: openPanels.includes('3') }"
              ></i>
              <span>充值：</span>
            </div>
            <div slot="content">
              <div v-if="conditions[TotalRechargeMoney]" class="condition-row">
                <span>累计充值金额&nbsp;&nbsp;满</span>
                <FormItem
                  :prop="TotalRechargeMoney + '.value'"
                  :rules="[
                    {
                      required: true,
                      message: ' ',
                      type: 'number',
                      validator: validator
                    }
                  ]"
                >
                  <InputNumber
                    class="common-input-text-156"
                    :min="0"
                    :max="9999999"
                    :precision="2"
                    v-model="conditions[TotalRechargeMoney].value"
                    placeholder="请输入"
                  ></InputNumber>
                </FormItem>
                <span>元</span>
                <more-message
                  text="累计充值到余额账户的总金额，包括充值和转现，不包括提现到余额和充值赠送的金额"
                ></more-message>
                <RadioGroup v-model="conditions[TotalRechargeMoney].logistic">
                  <Radio label="or">或</Radio>
                  <Radio label="and">与</Radio>
                </RadioGroup>
                <span
                    style="color: #9ea7b4;padding-right: 14px;"
                    v-if="conditions[TotalRechargeMoney].explain"
                >（只对【经销商】升级有效）</span>
                <span
                  class="table-operation"
                  @click="deleteCondition(TotalRechargeMoney)"
                  >删除</span
                >
              </div>
              <div v-if="conditions[OnceRechargeMoney]" class="condition-row">
                <span>一次性充值金额&nbsp;&nbsp;满</span>
                <FormItem
                  :prop="OnceRechargeMoney + '.value'"
                  :rules="[
                    {
                      required: true,
                      message: ' ',
                      type: 'number',
                      validator: validator
                    }
                  ]"
                >
                  <InputNumber
                    class="common-input-text-156"
                    :min="0"
                    :max="9999999"
                    :precision="2"
                    v-model="conditions[OnceRechargeMoney].value"
                    placeholder="请输入"
                  ></InputNumber>
                </FormItem>
                <span>元</span>
                <more-message
                  text="一次性充值到余额账户的金额，包括充值和转现，不包括提现到余额和充值赠送的金额"
                ></more-message>
                <RadioGroup v-model="conditions[OnceRechargeMoney].logistic">
                  <Radio label="or">或</Radio>
                  <Radio label="and">与</Radio>
                </RadioGroup>
                <span
                    style="color: #9ea7b4;padding-right: 14px;"
                    v-if="conditions[OnceRechargeMoney].explain"
                >（只对【经销商】升级有效）</span>
                <span
                  class="table-operation"
                  @click="deleteCondition(OnceRechargeMoney)"
                  >删除</span
                >
              </div>
            </div>
          </Panel>
          <Panel v-show="conditions[SelfBuyProduct]" name="4" hide-arrow>
            <div class="title">
              <i
                class="iconfont icon-md-arrow-dropright"
                :class="{ rotate: openPanels.includes('4') }"
              ></i>
              <span>商品：</span>
            </div>
            <div slot="content">
              <div v-if="conditions[SelfBuyProduct]" class="condition-row">
                <span>自购云仓商品&nbsp;&nbsp;满</span>
                <FormItem
                  :prop="SelfBuyProduct + '.value'"
                  :rules="[
                    {
                      required: true,
                      message: ' ',
                      type: 'number',
                      validator: validator
                    }
                  ]"
                >
                  <InputNumber
                    class="common-input-text-156"
                    :min="1"
                    :max="9999999"
                    :precision="0"
                    v-model="conditions[SelfBuyProduct].value"
                    placeholder="请输入"
                  ></InputNumber>
                </FormItem>
                <span>件</span>
                <more-message text="自购的云仓进货商品的总数量"></more-message>
                <RadioGroup v-model="conditions[SelfBuyProduct].logistic">
                  <Radio label="or">或</Radio>
                  <Radio label="and">与</Radio>
                </RadioGroup>
                <span
                    style="color: #9ea7b4;padding-right: 14px;"
                    v-if="conditions[SelfBuyProduct].explain"
                >（只对【经销商】升级有效）</span>
                <span
                  class="table-operation"
                  @click="deleteCondition(SelfBuyProduct)"
                  >删除</span
                >
              </div>
              <div v-if="conditions[SelfBuyProduct]">
                <span>购买以下任意商品：</span>
                <Button
                  type="primary"
                  shape="circle"
                  icon="md-add"
                  @click="addProduct"
                  >添加商品</Button
                >
                <span v-if="productError" class="error-tips"
                  >请至少添加一个有效商品</span
                >
              </div>
              <div
                v-if="conditions[SelfBuyProduct] && productList.length"
                style="padding-bottom:25px;"
              >
                <common-table
                  :width="700"
                  :columnsData="productSelectTableColumn"
                  :listData="productList"
                  type="border"
                ></common-table>
              </div>
            </div>
          </Panel>
        </Collapse>
      </FormItem>
    </Form>
    <upgrade-condition-modal
      v-model="showConditionModal"
      :selectID="conditionTypes"
      @getSelectID="getConditionTypes"
    ></upgrade-condition-modal>
    <product-list-modal
      @onGetProductInfo="onGetProductInfo"
      v-model="showProductModal"
      :productIds="productIds"
    ></product-list-modal>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import upgradeConditionModal from "./dealer-level-upgrade-condition-modal.vue";
import productListModal from "@/views/shop/store/design/components/product-list.vue";
import allUpgradeCondition, {
  DealerLevelUpgradeCondition_TeamDealerNum as TeamDealerNum,
  DealerLevelUpgradeCondition_DirectlyDealerNum as DirectlyDealerNum,
  DealerLevelUpgradeCondition_IndirectDealerNum as IndirectDealerNum,
  DealerLevelUpgradeCondition_SelfBuyMoney as SelfBuyMoney,
  DealerLevelUpgradeCondition_TotalRechargeMoney as TotalRechargeMoney,
  DealerLevelUpgradeCondition_OnceRechargeMoney as OnceRechargeMoney,
  DealerLevelUpgradeCondition_SelfBuyProduct as SelfBuyProduct
} from "./dealer-level-upgrade-all-condition.js";
const deepCopy = obj => {
  return JSON.parse(JSON.stringify(obj));
};
export default {
  props: ["settingData", "initialProductList","info"],
  components: {
    moreMessage,
    commonTable,
    upgradeConditionModal,
    productListModal
  },
  data() {
    return {
      TeamDealerNum,
      DirectlyDealerNum,
      IndirectDealerNum,
      SelfBuyMoney,
      TotalRechargeMoney,
      OnceRechargeMoney,
      SelfBuyProduct,
      dealerList: [], // 所有的经销商等级，用于下拉选择框
      conditionError: 0, //表单校验提示，0：没有错误；1：input为空；2：升级条件全被删除
      productError: 0, //产品列表校验提示，0：没有错误；1：列表为空
      openPanels: ["1", "2", "3", "4"], //折叠面板默认全部打开
      showConditionModal: false,
      showProductModal: false,
      conditions: {}, //已添加的所有升级条件
      productList: [], //已选择的商品列表
      productSelectTableColumn: [
        {
          title: "商品信息",
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
          width: 175,
          align: "center",
          render: (h, params) => {
            let classObj = {};
            let classArray = params.row.product_class || params.row.class || [];
            classArray.forEach(item => {
              classObj[item.id] = true;
            });
            let text = classArray
              .filter(item => !classObj[item.parent_id])
              .map(item => item.class_name)
              .join(",");
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
          width: 130,
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
                      style: {
                        marginRight: "14px"
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
              h(
                "a",
                {
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.productList.splice(params.index, 1);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ]
    };
  },
  computed: {
    conditionTypes() {
      return Object.keys(this.conditions);
    },
    hasValidProduct() {
      return this.productList.some(item => item.status == 1);
    },
    productIds() {
      return this.productList.map(item => item.id);
    }
  },
  watch: {
    "settingData.upgrade": {
      handler(value) {
        this.conditions = {};
        value.forEach(item => {
          if (item.type==1 || item.type==3||item.type==4||item.type==5){
            item.explain = true;
          }
          if (
            [TeamDealerNum, DirectlyDealerNum, IndirectDealerNum].includes(
              item.type
            )
          ) {
            if (this.conditions[item.type]) {
              this.conditions[item.type].push(item);
            } else {
              this.conditions[item.type] = [item];
            }
          } else {
            this.$set(this.conditions, item.type, item);
          }
        })
      }
    },
    initialProductList(value) {
      // 初始商品列表
      this.productList = value || [];
    },
    productIds: {
      // 控制校验错误提示的显示
      handler(ids) {
        // 同步更新product_id字段
        this.settingData.product_id = ids;
        if (ids.length == 0 && this.conditions[this.SelfBuyProduct]) {
          this.productError = 1;
        } else {
          this.productError = 0;
        }
      },
      deep: true
    },
  },
  created() {
    this.getAllDealer();
  },
  methods: {
    hasEmptyField() {
      // 是否有未填写的input
      return Object.keys(this.conditions).some(key => {
        if (
          Object.prototype.toString.call(this.conditions[key].value) ==
          "[object Object]"
        ) {
          return (
            !this.conditions[key].value.dealer_level_id ||
            !this.conditions[key].value.dealer_level_id.length ||
            !this.conditions[key].value.member_count
          );
        } else {
          return !this.conditions[key].value;
        }
      });
    },
    addCondition() {
      // 添加升级条件弹窗显示
      this.showConditionModal = true;
    },
    /**
     * 添加多个升级条件
     */
    addConditionArray(data) {
      var index = this.settingData.upgrade.findIndex(
        item => item == data[data.length - 1]
      );
      this.settingData.upgrade.splice(index + 1, 0, {
        type: data[0].type,
        logistic: "or",
        explain:data[0].explain,
        value: {
          dealer_level_id: [null],
          member_count: null
        }
      });
    },
    deleteCondition(type) {
      // 删除升级条件
      var index = this.settingData.upgrade.findIndex(item => item.type == type);
      this.$delete(this.conditions, type);
      this.settingData.upgrade.splice(index, 1);
    },
    /**
     * 删除存在多个的
     */
    deleteConditionArray(n) {
      var index = this.settingData.upgrade.findIndex(item => item == n);
      if (this.conditions[n.type].length === 1) {
        this.$delete(this.conditions, n.type);
      } else {
        this.conditions[n.type].splice(
          this.conditions[n.type].findIndex(i => i === n),
          1
        );
      }
      this.settingData.upgrade.splice(index, 1);
    },
    getConditionTypes(types) {
      //添加升级条件弹窗返回值
      types.forEach(type => {
        if (!this.conditions[type]) {
          this.$set(this.conditions, type, deepCopy(allUpgradeCondition[type]));
          this.settingData.upgrade.push(this.conditions[type]);
        }
      });
    },
    addProduct() {
      // 添加商品弹窗显示
      this.showProductModal = true;
    },
    onGetProductInfo(val) {
      // 添加商品弹窗返回值
      this.productList = val.concat(this.productList);
    },
    validator(rule, value, callback) {
      // 单个input的校验逻辑
      if (value) {
        if (Array.isArray(value) && !value.length) {
          callback(" ");
        } else {
          callback();
        }
      } else {
        callback(" ");
      }
      if (!this.hasEmptyField()) {
        this.conditionError = 0;
      }
    },
    validate() {
      // 表单提交时的校验逻辑
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (
            valid &&
            (this.hasValidProduct || !this.conditions[this.SelfBuyProduct])
          ) {
            resolve("upgrade");
          } else {
            reject("upgrade");
          }
          if (!valid) {
            this.conditionError = 1;
          } else {
            this.conditionError = 0;
          }
          if (!this.hasValidProduct && this.conditions[this.SelfBuyProduct]) {
            this.productError = 1;
          } else {
            this.productError = 0;
          }
        });
      });
    },
    getAllDealer() {
      this.http
        .post("/shop/admin/dealer/level/list", {
          is_hide: 0, //是否是隐藏等级 1是 0不是
          get_all: 1 //1 获取所有的列表 用于下拉框
        })
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            let listData = res.data.list || [];
            let hiddenObj = {};
            let showData = [];
            // 筛选出基础等级的
            let baseData = listData
              .filter(n => {
                let status = !n.parent_id;
                // 如果有上级则区分出来
                if (!status) {
                  if (hiddenObj[n.parent_id]) {
                    hiddenObj[n.parent_id].push(n);
                  } else {
                    hiddenObj[n.parent_id] = [n];
                  }
                }
                return status;
              })
              .sort((a, b) => b.weight - a.weight);
            // 根据基础等级的顺序筛选出隐藏等级的
            baseData.forEach(n => {
              showData.push(n);
              if (hiddenObj[n.id]) {
                showData.push(
                  ...hiddenObj[n.id].sort((a, b) => b.weight - a.weight)
                );
              }
            });
            this.dealerList = showData;
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-form {
  .error-tips {
    color: #ed4014;
    margin-left: 14px;
  }
  .common-input-text-156 {
    width: 156px;
  }
  .common-input-text-120 {
    width: 120px;
  }
  .ivu-collapse-simple {
    border: none;
    /*width: 923px;*/
    margin-top: 20px;
    /deep/.ivu-collapse-item {
      border: none;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      .icon-md-arrow-dropright {
        display: inline-block;
        transition: transform 0.3s;
        margin-right: 10px;
        &.rotate {
          transform: rotate(90deg);
        }
      }
      .ivu-collapse-header {
        color: #464c5b;
        font-size: 14px;
        font-weight: bold;
        height: 50px;
        line-height: 50px;
        background: #f5f6f7;
      }
      .ivu-collapse-content {
        background: #f5f6f7;
        padding-left: 80px;
        .ivu-collapse-content-box {
          padding-bottom: 0px;
          .condition-row {
            line-height: 32px;
          }
          .ivu-form-item {
            margin: 0 5px;
            display: inline-block;
            vertical-align: initial;
          }
          .ivu-radio-group {
            vertical-align: initial;
          }
          .ivu-radio-wrapper {
            margin-right: 20px;
            /*&:last-child {*/
              /*margin-right: 60px;*/
            /*}*/
          }
          .more-message {
            margin-left: 5px;
            margin-right: 20px;
          }
          .ivu-table-wrapper {
            th {
              border-bottom: 1px solid #dcdee2;
            }
          }
          .ivu-btn-primary {
            margin-bottom: 20px;
            vertical-align: top;
          }
        }
      }
    }
  }
}
.second-level {
  padding-left: 30px;
  position: relative;
  &:before,
  &:after {
    content: "";
    display: block;
    position: absolute;
    left: 16px;
    bottom: 12px;
    background-color: #ccc;
  }
  &:before {
    width: 1px;
    height: 10px;
  }
  &:after {
    width: 10px;
    height: 1px;
  }
}
</style>
