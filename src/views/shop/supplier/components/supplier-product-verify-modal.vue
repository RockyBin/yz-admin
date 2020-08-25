<template>
  <Modal
    v-model="modalStatus"
    class="supplier-product-verify-modal"
    :loading="modalLoading"
    title="审核商品"
    :width="dataInfo ? 650 : 440"
    :mask-closable="false"
    :closable="closable"
    @on-ok="onModalConfirmClick"
  >
    <Form
      ref="formValidate"
      :model="formItem"
      :rules="ruleValidate"
      style="margin-right: -20px;"
      :style="dataInfo ? 'width: 603px;' : ''"
    >
      <FormItem label="审核：" :label-width="80">
        <RadioGroup v-model="formItem.pass">
          <Radio :label="1">通过</Radio>
          <Radio :label="-1">拒绝</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="商品状态："
        v-show="formItem.pass === 1"
        :style="dataInfo ? '' : 'margin-bottom: 0 !important;'"
        :label-width="80"
      >
        <RadioGroup v-model="formItem.status">
          <Radio :label="1">上架</Radio>
          <Radio :label="0">下架</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="拒绝原因："
        :label-width="80"
        v-show="formItem.pass !== 1"
        prop="reason"
      >
        <div>
          <Input
            v-model="formItem.reason"
            style="width: 280px;min-height: 70px;"
            type="textarea"
            :maxlength="200"
            placeholder="请输入拒绝原因"
          />
          <div class="textarea-suffix-num">
            {{ formItem.reason.length }}/200
          </div>
        </div>
      </FormItem>
      <FormItem v-if="dataInfo">
        <div class="supplier-product-verify-modal-info">
          <div class="supplier-product-verify-modal-left">
            <vertical-title title="审核商品"></vertical-title>
            <div>
              <img
                :src="
                  dataInfo.image
                    ? $store.state.siteComdataPath + dataInfo.image
                    : ''
                "
              />
              <Tooltip :content="dataInfo.product_name" placement="top">
                <div class="two-hide">
                  {{ dataInfo.product_name }}
                </div>
              </Tooltip>
            </div>
          </div>
          <div class="supplier-product-verify-modal-line"></div>
          <div class="supplier-product-verify-modal-right">
            <vertical-title title="供应商信息"></vertical-title>
            <div>
              <i class="iconfont icon-gonghuoshang"></i>
              <span>名称：{{ dataInfo.supplier_name }}</span>
            </div>
          </div>
        </div>
      </FormItem>
      <FormItem v-if="dataInfo">
        <div>
          <common-table
            type="border"
            :columnsData="columnsData"
            :listData="listData"
            :style="`width:${603 + 2}px;`"
          ></common-table>
          <div
            class="ivu-form-item-error-tip"
            v-if="Object.values(tableError).filter(n => n).length"
          >
            {{
              Object.keys(tableError).filter(
                n => tableError[n] && /hasErrorprice/.test(n)
              ).length
                ? "销售价不能为空"
                : "成本价不能为空"
            }}
          </div>
        </div>
      </FormItem>
    </Form>
  </Modal>
</template>
<script>
import verticalTitle from "@/views/shop/components/titlebar/vertical-line-titlebar.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
const formItem = {
  status: 1,
  pass: 1,
  reason: ""
};
export default {
  components: {
    verticalTitle,
    commonTable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    dataInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      modalStatus: false,
      modalLoading: true,
      closable: true,
      tableError: {},
      formItem: { ...formItem },
      ruleValidate: {
        reason: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.formItem.pass === 1 || value.trim()) {
                return callback();
              }
              return callback("请输入拒绝原因");
            },
            trigger: "blur"
          }
        ]
      },
      headerValue: {
        price: null,
        supply_price: null
      },
      initColumnsData: [
        this.getInputTableData("price", "销售价"),
        {
          title: "供货价(元）",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h("div", {}, "￥" + (params.row.supplier_price || "0.00"));
          }
        },
        this.getInputTableData("supply_price", "成本价"),
        {
          title: "库存",
          align: "center",
          minWidth: 98,
          render: (h, params) => {
            return h("div", params.row.inventory || 0);
          }
        }
      ]
    };
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      if (val) {
        this.tableError = {};
        this.formItem = {
          ...formItem
        };
      }
    },
    modalStatus(val) {
      this.$emit("input", val);
    }
  },
  computed: {
    listData() {
      return this.dataInfo ? this.dataInfo.product_skus : [];
    },
    columnsData() {
      return [].concat(this.getSkuNameColumn(), ...this.initColumnsData);
    },
    sku_name() {
      return this.dataInfo ? this.dataInfo.product_sku_name : [];
    }
  },
  methods: {
    /**
     * 获取多规格数据项
     */
    getSkuNameColumn() {
      return this.sku_name.map(n => ({
        title: n.name,
        align: "center",
        minWidth: 110,
        render: (h, params) => {
          let skuValue = this.dataInfo.product_sku_value.find(
            m =>
              m.sku_name_id === n.id &&
              params.row.sku_code
                .split(",")
                .find(n => n && Number(n) === Number(m.id))
          );
          return h("div", (skuValue && skuValue.value) || "");
        }
      }));
    },
    /**
     * 获取可编辑数据的列表项
     */
    getInputTableData(key, title) {
      return {
        align: "center",
        minWidth: 110,
        renderHeader: h => {
          let headerContent = [
            h("InputNumber", {
              props: {
                size: "small",
                placeholder: "批量设置",
                precision: 2,
                max: 9999999.99,
                min: 0,
                value: this.headerValue[key]
              },
              on: {
                "on-blur": () => {
                  this.$set(this.headerValue, key, null);
                },
                "on-change": val => {
                  this.$set(this.headerValue, key, val);
                  this.listData.forEach((item, index1) => {
                    if (val) {
                      this.$set(
                        this.tableError,
                        index1 + "hasError" + key,
                        false
                      );
                    }
                    this.$set(item, key, val);
                  });
                }
              }
            })
          ];
          return h("div", { style: "padding: 4px 0" }, [
            h(
              "div",
              {
                style: this.sku_name.length
                  ? {
                      lineHeight: "15px",
                      height: "17px"
                    }
                  : {},
                class: "supplier-product-verify-modal-reqiure"
              },
              title + "(元)"
            ),
            this.sku_name.length
              ? h(
                  "div",
                  {
                    style: {
                      lineHeight: "22px",
                      height: "25px",
                      fontWeight: "initial",
                      position: "relative"
                    }
                  },
                  headerContent
                )
              : ""
          ]);
        },
        render: (h, params) => {
          return h(
            "div",
            {
              class: {
                "ivu-form-item-error": this.tableError[
                  params.index + "hasError" + key
                ]
              }
            },
            [
              h("InputNumber", {
                props: {
                  size: "small",
                  placeholder: "请输入",
                  precision: 2,
                  max: 9999999.99,
                  min: 0,
                  value: params.row[key] && Number(params.row[key])
                },
                on: {
                  "on-change": val => {
                    this.listData[params.index][key] = val;
                    if (val) {
                      this.$set(
                        this.tableError,
                        params.index + "hasError" + key,
                        false
                      );
                    }
                  }
                }
              })
            ]
          );
        }
      };
    },
    onModalConfirmClick() {
      this.$refs.formValidate.validate(valid => {
        let status = true;
        this.listData.forEach((n, i) => {
          ["supply_price", "price"].forEach(m => {
            if (!n[m]) {
              status = false;
              this.$set(this.tableError, i + "hasError" + m, true);
            }
          });
        });
        if (valid && status) {
          this.closable = false;
          let data = {
            verify_status: this.formItem.pass,
            reject_reason: this.formItem.pass === 1 ? "" : this.formItem.reason,
            status: this.formItem.pass === 1 ? this.formItem.status : 0
          };
          if (this.dataInfo) {
            data.sku_price = this.dataInfo.product_skus.map(n => ({
              id: n.id,
              price: n.price,
              supply_price: n.supply_price
            }));
          }
          this.$emit("onConfirmClick", data, () => {
            this.closable = true;
            this.modalStatus = false;
          });
        } else {
          this.$Message.error("审核失败");
          this.modalLoading = false;
          this.$nextTick(() => {
            this.modalLoading = true;
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.supplier-product-verify-modal {
  /deep/textarea {
    width: 280px;
    min-height: 70px;
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
  }
  .supplier-product-verify-modal-info {
    display: flex;
    padding: 10px 24px 20px;
    border-radius: 5px;
    background-color: #f5f6f7;
    font-size: 13px;
    .supplier-product-verify-modal-left {
      flex: 1;
      img {
        height: 40px;
        width: 40px;
        display: block;
        object-fit: contain;
        margin-right: 14px;
        border-radius: 4px;
        flex: none;
      }
      & > div {
        &:last-child {
          display: flex;
          align-items: center;
          padding: 14px;
          margin-top: 10px;
          border-radius: 5px;
          line-height: 16px;
          font-size: 12px;
          background-color: #fff;
          border: 1px solid #dcdee2;
        }
      }
    }
    .supplier-product-verify-modal-line {
      border-left: 1px dashed #dcdee2;
      margin: 10px 20px 0;
    }
    .supplier-product-verify-modal-right {
      flex: 1;
      & > div {
        &:last-child {
          margin-top: 10px;
          line-height: 24px;
          font-size: 12px;
          i {
            font-size: 24px;
            color: #41b44d;
            vertical-align: top;
            margin-right: 10px;
          }
          span {
            vertical-align: top;
          }
        }
      }
    }
  }
  /deep/.ivu-table {
    overflow: auto;
    .ivu-table-header {
      overflow: initial;
    }
    .ivu-input-number-input {
      text-align: center;
    }
    .supplier-product-verify-modal-reqiure::before {
      content: "*";
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 13px;
      color: #ed4014;
      font-weight: initial;
    }
  }
}
</style>
