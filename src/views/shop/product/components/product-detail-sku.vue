<template>
  <div class="product-detail-sku">
    <Form ref="formValidateSku" :model="value" :rules="ruleValidateSku" :label-width="85">
      <FormItem label="供应商：" v-show="supplierInfo.id">
        <div class="product-detail-item">
          <i-input
            :disabled="true"
            class="common-input-text-260 product-detail-supplier-disabled"
            style="width: 284px;"
            :value="supplierInfo.supplier_name"
          >
            <i slot="prefix" class="iconfont icon-gonghuoshang"></i>
          </i-input>
        </div>
      </FormItem>
      <FormItem label="规格类型：" style="margin-top: 0 !important;">
        <div class="product-detail-item">
          <span class="product-detail-verity">开启多规格商品</span>
          <i-switch
            :disabled="disableChange || !!supplierInfo.id"
            v-model="value.multiSpecificationsStatus"
          >
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
        </div>
      </FormItem>
      <FormItem label="商品编码：" prop="productNumber" v-show="!value.multiSpecificationsStatus">
        <div class="product-detail-item">
          <Input
            :disabled="disableChange"
            :maxlength="20"
            class="common-input-text-260"
            v-model.trim="value.productNumber"
            placeholder="请输入编码"
          />
        </div>
      </FormItem>
      <FormItem label="市场价：" v-show="!value.multiSpecificationsStatus">
        <div class="product-detail-item">
          <InputNumber
            :disabled="disableChange"
            :min="0"
            :max="9999999.99"
            v-model="value.marketPrice"
            :precision="2"
            placeholder="请输入金额"
          />
          <span class="product-detail-verity">元</span>
        </div>
      </FormItem>
      <FormItem label="销售价：" prop="sellPrice" v-show="!value.multiSpecificationsStatus">
        <div class="product-detail-item">
          <InputNumber
            :disabled="disableChange"
            v-model="value.sellPrice"
            :min="0"
            :max="9999999.99"
            :precision="2"
            placeholder="请输入金额"
          />
          <span class="product-detail-verity">元</span>
        </div>
      </FormItem>
      <FormItem
        label="供货价："
        v-show="supplierInfo.id && !value.multiSpecificationsStatus"
      >
        <div class="product-detail-item">
          <Input
            class="product-detail-supplier-disabled"
            disabled
            v-model="supplierInfo.supplier_price"
          />
          <span class="product-detail-verity">元</span>
        </div>
      </FormItem>
      <FormItem label="成本价：" prop="supplyPrice" v-show="!value.multiSpecificationsStatus">
        <div class="product-detail-item">
          <InputNumber
            :disabled="disableChange"
            :min="0"
            :max="9999999.99"
            :precision="2"
            v-model="value.supplyPrice"
            placeholder="请输入金额"
          />
          <span class="product-detail-verity">元</span>
        </div>
      </FormItem>
      <FormItem label="商品规格：" v-show="value.multiSpecificationsStatus">
        <div class="product-detail-item product-detail-item-auto">
          <more-message
            :text="
              `最多能添加${
                value.product_sku_num && value.product_sku_num.sku_name_num
              }组规格，仅支持其中一组规格可以添加规格图片`
            "
            style="margin-right: 7px;margin-left: -2px;"
          ></more-message>
          <div class="product-detail-sku-specifications-list">
            <specifications-list
              :disabled="disableChange"
              ref="specificationsList"
              :setArray="setArray"
              :supplierInfo="supplierInfo"
              v-model="value"
            ></specifications-list>
          </div>
        </div>
      </FormItem>
      <FormItem
        v-show="value.multiSpecificationsStatus"
        class="product-detail-item-specification"
        style="margin-top: 0 !important;margin-top: -20px !important;"
        prop="specificationsData"
      ></FormItem>
      <FormItem label="会员价：" prop="memberPriceType" :show-message="false">
        <div class="product-detail-item product-detail-item-auto">
          <RadioGroup v-model="value.memberPriceType">
            <Radio :disabled="disableChange" :label="0">
              使用系统会员价
              <a
                href="javascript:;"
                v-show="!value.multiSpecificationsStatus && value.memberPriceType === 0"
                @click="onSystemMemberPriceClick"
              >{{memberSystemTableShow ? '收起': '查看'}}</a>
            </Radio>
            <Radio
              :disabled="disableChange || value.memberLevelList.length == 0"
              :label="1"
              :title="value.memberLevelList.length == 0 ? '您没有新增会员等级，此选项禁用':''"
            >
              自定义会员价
              <a
                href="javascript:;"
                v-show="!value.multiSpecificationsStatus && value.memberPriceType === 1"
                @click="onCustomMemberPriceClick"
              >{{memberCustomTableShow ? '收起': '编辑'}}</a>
            </Radio>
            <Radio :disabled="disableChange" :label="-1">不启用会员价</Radio>
          </RadioGroup>
          <member-table
            v-show="memberTableShow"
            :tableData="memberPriceList"
            ref="memberTable"
            v-model="value.memberLevelPriceType"
            :price="value.sellPrice"
            :hasSetting="value.memberPriceType === 1"
          ></member-table>
        </div>
      </FormItem>
      <FormItem label="库存：" prop="productSkuNum" v-show="!value.multiSpecificationsStatus">
        <div
          class="product-detail-item"
          :class="{'ivu-form-item-error': productID && value.productSkuNum <= skuNumWarning}"
        >
          <InputNumber
            v-model="value.productSkuNum"
            placeholder="请输入库存"
            :min="0"
            :max="9999999"
            :class="{ 'product-detail-supplier-disabled': supplierInfo.id }"
            :disabled="!!supplierInfo.id"
            :precision="0"
          />
        </div>
      </FormItem>
      <FormItem label="重量：" prop="productQuantity" v-show="productType==0&&!value.multiSpecificationsStatus">
        <div class="product-detail-item">
          <InputNumber
            :disabled="disableChange"
            v-model="value.productQuantity"
            :min="0"
            :max="9999999"
            :precision="3"
            placeholder="请输入重量"
          />
          <span class="product-detail-verity">kg</span>
          <more-message text="当该商品选择了<按重量计算的运费模板>时，请填写商品重量！" style="margin-left: 7px;" />
        </div>
      </FormItem>
      <FormItem
        label="规格明细："
        v-show="value.multiSpecificationsStatus && specificationsShow"
        prop="skus"
        style="margin-bottom: 0 !important;"
      ></FormItem>
      <FormItem
        v-show="value.multiSpecificationsStatus && specificationsShow"
        style="margin-top: -32px !important;"
      >
        <div class="product-detail-item product-detail-item-auto">
          <div
            class="product-detail-sku-specifications-list"
            style="width:100%;"
          >
            <specifications-table
              :productType="productType"
              :disabled="disableChange"
              :setArray="setArray"
              :productID="productID"
              :skuNumWarning="skuNumWarning"
              :memberLevelList="value.memberLevelList"
              :memberPriceType="value.memberPriceType"
              :supplierInfo="supplierInfo"
              ref="specificationsTable"
              :value="value"
            ></specifications-table>
          </div>
        </div>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import specificationsList from "@/views/shop/product/components/product-detail-sku-specifications.vue";
import specificationsTable from "@/views/shop/product/components/product-detail-sku-specifications-table.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import memberTable from "./product-detail-sku-member-table";
export default {
  name: "productDetailSku",
  components: {
    specificationsList,
    specificationsTable,
    moreMessage,
    memberTable
  },
  props: {
    value: {
      required: true,
      type: Object
    },
    productType: {
      required: true,
      default: 0
    },
    productID: {
      required: true
    },
    setArray: {
      required: true
    },
    skuNumWarning: {
      required: true
    },
    disableChange: {
      default: false,
      type: Boolean
    },
    // 单规格会员价
    memberPriceList: {
      type: Array,
      default() {
        return [];
      }
    },
    supplierInfo: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      memberSystemTableShow: false,
      memberCustomTableShow: true,
      ruleValidateSku: {
        specificationsData: [
          {
            required: true,
            validator: (rule, value, callback) => {
              let check = this.$refs["specificationsList"].checkData();
              check.status ? callback() : callback(new Error(check.msg));
            }
          }
        ],
        // 验证所有关于sku的（规格值和商品多规格）
        skus: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              // 如果不开启多规格则不验证
              if (!this.value.multiSpecificationsStatus) {
                return callback();
              }
              let promiseArray = [];
              let serialSetArray = new Set([]);
              let validMsg = "";
              let validInventoryMsg = "";
              let status = false;
              // 验证多规格的规格细明
              this.value.skuArray.forEach(item => {
                if (item.inventory === null) {
                  status = true;
                  validInventoryMsg = "库存不能为空";
                  this.$set(
                    this.setArray,
                    item.sku_code + "inventory_error",
                    true
                  );
                }
                if (isNaN(parseFloat(item.supply_price))) {
                  validInventoryMsg =
                    "成本价不能为" + (item.supply_price === null ? "空" : "零");
                  this.$set(
                    this.setArray,
                    item.sku_code + "supply_price_error",
                    true
                  );
                  status = true;
                }
                if (!item.price) {
                  validInventoryMsg =
                    "销售价不能为" + (item.price === null ? "空" : "零");
                  this.$set(
                    this.setArray,
                    item.sku_code + "price_error",
                    true
                  );
                  status = true;
                }
                promiseArray.push(
                  new Promise(resolve => {
                    item.validator(rule, item.serial_number, valid => {
                      let validStatus =
                        typeof valid === "undefined" ? true : false;
                      if (
                        validStatus &&
                        item.serial_number.trim() &&
                        serialSetArray.has(item.serial_number)
                      ) {
                        validMsg = "已存在相同商品编码";
                        validStatus = false;
                      }
                      if (valid) {
                        validMsg = valid.message;
                      }
                      serialSetArray.add(item.serial_number);
                      this.$set(
                        this.setArray,
                        item.sku_code + "serial_number_error",
                        !validStatus
                      );
                      resolve(validStatus);
                    });
                  })
                );
              });

              if (!status && this.value.memberPriceType === 1) {
                status = !this.$refs["specificationsTable"].checkSkuData();
                validInventoryMsg = "自定义会员价有误";
              }

              Promise.all(promiseArray).then(valid => {
                let validStatus = valid.findIndex(item => item === false);
                if (validStatus > -1 || status) {
                  callback(
                    new Error(
                      validMsg ||
                        validInventoryMsg ||
                        validInventoryMsg ||
                        validInventoryMsg
                    )
                  );
                } else {
                  callback();
                }
              });
            }
          }
        ],
        supplyPrice: [
          {
            required: true,
            validator: (rule, value, callback) => {
              // 如果开启多规格则不验证
              if (this.value.multiSpecificationsStatus) {
                return callback();
              }
              if (
                !isNaN(parseFloat(value)) &&
                Number(value.toString().trim()) >= 0
              ) {
                return callback();
              }
              return callback(new Error("请输入成本价"));
            },
            trigger: "blur"
          }
        ],
        sellPrice: [
          {
            required: true,
            validator: (rule, value, callback) => {
              // 如果开启多规格则不验证
              if (this.value.multiSpecificationsStatus) {
                return callback();
              }
              if (value && Number(value.toString().trim()) > 0) {
                return callback();
              }
              return callback(new Error("请输入销售价"));
            },
            trigger: "blur"
          }
        ],
        productQuantity: [
          {
            // required: true,
            validator: (rule, value, callback) => {
              // 如果开启多规格则不验证
              if (this.value.multiSpecificationsStatus) {
                return callback();
              }
              if (value === null || Number(value.toString().trim()) >= 0) {
                return callback();
              }
              return callback(new Error("重量不能小于零"));
            },
            trigger: "blur"
          }
        ],
        memberPriceType: [
          {
            validator: (rule, value, callback) => {
              // 如果开启多规格则不验证
              if (this.value.multiSpecificationsStatus) {
                return callback();
              }
              if (value !== 1 || this.$refs["memberTable"].checkData()) {
                return callback();
              }
              return callback(new Error(""));
            },
            trigger: "none"
          }
        ],
        productSkuNum: [
          {
            required: true,
            validator: (rule, value, callback) => {
              // 如果开启多规格则不验证
              if (this.value.multiSpecificationsStatus) {
                return callback();
              }
              if (
                value !== null &&
                value.toString().trim() &&
                Number(value.toString().trim()) % 1 === 0
              ) {
                return callback();
              }
              return callback(new Error("请输入整数库存"));
            },
            trigger: "blur"
          }
        ],
        productNumber: [
          {
            min: 0,
            max: 20,
            trigger: "blur",
            validator: this.validMultiSku(null, ({ timer, callback }) => {
              if (this.value.multiSpecificationsStatus) {
                window.clearTimeout(timer);
                timer = null;
                callback();
                return true;
              }
              return false;
            })
          }
        ]
      }
    };
  },
  watch: {
    "value.skuArray": {
      handler(val) {
        val.forEach(n => {
          if (!n.validator) {
            n.validator = this.validMultiSku(n.serial_number);
          }
        });
      },
      immediate: true
    }
  },
  computed: {
    simpleCommissionPrice() {
      return typeof this.value.supplyPrice === "number" &&
        typeof this.value.sellPrice === "number"
        ? this.value.sellPrice - this.value.supplyPrice > 0
          ? this.value.sellPrice - this.value.supplyPrice
          : 0
        : null;
    },
    hasFenxiao() {
      return this.hasLicensePerm("ENABLE_DISTRIBUTION");
    },
    memberTableShow() {
      if (this.value.multiSpecificationsStatus) {
        return false;
      }
      if (this.value.memberPriceType !== -1) {
        if (this.value.memberPriceType === 1 && this.memberCustomTableShow) {
          return true;
        }
        if (this.value.memberPriceType === 0 && this.memberSystemTableShow) {
          return true;
        }
      }
      return false;
    },
    // 是否显示规格细明
    specificationsShow() {
      return (
        this.value.specificationsData.length &&
        this.value.specificationsData.filter(el => el.values.length).length
      );
    },
    distributionLevelListStatus() {
      return Object.assign(
        {},
        ...this.value.distributionLevelList.map(item => {
          return { [item.id]: item };
        })
      );
    }
  },
  methods: {
    // 弹窗显示
    onSystemMemberPriceClick() {
      this.memberSystemTableShow = !this.memberSystemTableShow;
    },
    onCustomMemberPriceClick() {
      this.memberCustomTableShow = !this.memberCustomTableShow;
    },
    /**
     * 获取旧值
     */
    getVaildValue(status) {
      if (status === null) {
        return this.value.oldProductNumber;
      } else {
        return status;
      }
    },
    /**
     * params {oldValidData} 数据库旧的标号
     */
    validMultiSku(oldValidData, preCall) {
      let timer = null;
      let oldValue = null;
      let oldValid = null;
      let oldCallback = null;
      return (rule, value, callback) => {
        // 其他要验证的
        if (preCall && preCall({ timer, oldValid, value, callback })) {
          return;
        }
        // 原来的商品编号无需验证
        if (
          this.getVaildValue(oldValidData) &&
          this.getVaildValue(oldValidData) === value
        ) {
          window.clearTimeout(timer);
          timer = null;
          oldValid = null;
          return callback();
        }
        if (!value || !value.trim()) {
          window.clearTimeout(timer);
          timer = null;
          oldValid = null;
          return callback();
        }
        // 如果结果已经验证过了，拿原来的验证结果
        if (oldValue === value) {
          if (oldValid !== null) {
            return oldValid ? callback(new Error(oldValid)) : callback();
          } else {
            return (oldCallback = callback);
          }
        }
        // 记录本次要验证的数据
        oldValue = value;
        oldValid = null;
        oldCallback = callback;
        // 延时验证，防止短时间内多次触发
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          this.$httpGet(
            "/shop/admin/product/check/serial/number",
            { serial_number: value },
            res => {
              if (!timer) {
                return;
              }
              if (res.code === 200) {
                oldValid = false;
                return oldCallback();
              } else {
                oldValid = res.msg;
                return oldCallback(new Error(res.msg));
              }
            }
          );
        }, 200);
      };
    }
  }
};
</script>

<style lang="less" scoped>
.product-detail-sku {
  .product-detail-item-specification {
    /deep/.ivu-form-item-error-tip {
      margin-left: 22px;
    }
  }
  .product-detail-item {
    height: 32px;
    line-height: 32px;
    &.product-detail-item-auto {
      height: auto;
    }
    /deep/.product-detail-sku-member-table {
      margin-top: 7px;
    }
    .ivu-switch {
      margin-left: 8px;
    }

    /deep/.ivu-input-wrapper.ivu-input-wrapper-default,
    .ivu-input-number {
      width: 210px;
      margin-right: 7px;
      vertical-align: top;
    }
    /deep/.product-detail-sku-commission-table,
    /deep/.product-detail-sku-member-table {
      .ivu-input-number:not(.ivu-input-number-error) {
        border: 1px solid #dcdee2;
        &:hover,
        &:focus,
        &.ivu-input-number-focused {
          border-color: #6e88f7;
          outline: 0;
          -webkit-box-shadow: 0 0 0 2px rgba(74, 106, 245, 0.2);
          box-shadow: 0 0 0 2px rgba(74, 106, 245, 0.2);
        }
      }
    }

    .product-detail-sku-specifications-list {
      display: inline-block;
      width: calc(100% - 25px);
    }
  }
}
</style>
