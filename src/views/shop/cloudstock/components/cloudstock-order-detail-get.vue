<template>
  <div class="cloudstock-order-detail">
    <div class="flex-wrapper">
      <div class="info-block">
        <div class="title">订单信息</div>
        <div class="content">
          <div class="row">
            <span class="key">提货单号：</span
            ><span class="value">{{ order_info.id }}</span>
          </div>
          <div class="row">
            <span class="key">订单状态：</span>
            <span :class="statusMapClassName">{{
              order_info.status_text
            }}</span>
          </div>
          <div class="row">
            <span class="key">买家昵称：</span
            ><span class="value">{{ order_info.nickname }}</span>
          </div>
          <div class="row">
            <span class="key">手机号：</span
            ><span class="value">{{ order_info.mobile }}</span>
          </div>
          <div class="row">
            <span class="key">姓名：</span
            ><span class="value">{{ order_info.name || "--" }}</span>
          </div>
          <div class="row flex">
            <span class="key">买家备注：</span
            ><span class="value remark">{{ order_info.remark || "--" }}</span>
          </div>
          <div class="row flex">
            <span class="key">内部备注：</span>
            <span class="value" :style="{ 'flex-grow': isEditing ? 1 : 0 }">
              <span v-if="!isEditing" class="remark">{{
                order_info.remark_inside || "--"
              }}</span>
              <span v-else class="input-wrapper">
                <Input
                  type="textarea"
                  v-model="remark_inside"
                  :maxlength="50"
                  placeholder="请输入备注"
                />
                <span class="suffix"
                  >{{ remark_inside ? remark_inside.length : 0 }}/50</span
                >
              </span>
            </span>
            <span
              class="table-operation"
              perm="cloudstock.order.operate"
              @click="modifyRemark"
              >{{ isEditing ? "保存" : "修改" }}</span
            >
          </div>
        </div>
      </div>
      <div class="info-block">
        <div class="title">发货信息</div>
        <div class="content">
          <div class="row">
            <span class="key">下单时间：</span
            ><span class="value">{{ order_info.created_at }}</span>
          </div>
          <div class="row" v-if="order_info.status == 3">
            <span class="key">发货仓库：--</span>
          </div>
          <div class="row" v-else>
            <span class="key">发货仓库：</span
            ><span class="value">云仓-{{ order_info.nickname }}</span>
          </div>
          <div class="row" v-show="order_info.virtual_flag!=1" v-if="order_info.status == 3">
            <span class="key">物流运费：--</span>
          </div>
          <div class="row" v-show="order_info.virtual_flag!=1" v-else>
            <span class="key">物流运费：</span
            ><span class="value"
              >￥{{ order_info.freight
              }}<span
                v-show="order_info.status == 4"
                style="color: #FF9900;margin-left: 5px;"
                >({{ order_info.status_text }})</span
              ></span
            >
          </div>
          <div class="row" v-show="order_info.status == 3">
            <span class="key">订单取消原因：</span
            ><span class="value">{{ order_info.cancel_message }}</span>
          </div>
        </div>
      </div>
      <div class="info-block">
        <div class="title">物流信息</div>
        <div class="content">
          <div class="row" v-if="order_info.virtual_flag != 1">
            <span class="key">收货人姓名：</span
            ><span class="value">{{ order_info.receiver_name }}</span>
          </div>
          <div class="row" v-if="order_info.virtual_flag != 1">
            <span class="key">收货人电话：</span
            ><span class="value">{{ order_info.receiver_tel }}</span>
          </div>
          <div class="row address" v-if="order_info.virtual_flag != 1">
            <span class="key">收货人地址：</span
            ><span class="value">{{
              order_info.prov +
                order_info.city +
                order_info.area +
                order_info.receiver_address
            }}</span>
          </div>
          <div class="btn-wrapper" v-if="order_info.status == 0">
            <Button
              type="primary"
              perm="cloudstock.order.operate"
              @click="batchDelivery"
              >批量发货</Button
            >
            <RadioGroup
              v-model="is_virtual"
              v-if="order_info.virtual_flag == 2"
            >
              <Radio :label="0">实物商品</Radio>
              <Radio :label="1">虚拟商品</Radio>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
    <row-span-table
      ref="table"
      :minWidth="1158"
      :columnsData="columnsData"
      :listData="product_list"
      :disableItem="disableItem"
      :loading="tableLoading"
      :selectable="order_info.status == 0"
      :rowSpanKey="['logistics_id']"
      @selectChange="selectChange"
    ></row-span-table>
    <div class="summary">数量合计：{{ order_info.product_num }}</div>
    <order-delivery
      v-model="isShowDeliverModal"
      :isReadOnly="isReadOnly"
      :is_virtual="virtualFlag"
      :logisticsInfo="currentRow"
      :orderDetail="order_info"
      :product_id="currentProductId"
      :product_ids="selectProductIds"
      @deliverSuccess="deliverSuccess"
      @deliverCanceled="deliverCanceled"
    ></order-delivery>
    <modal-logistics
      :logisticsValue="isShowLogistics"
      :iframeSrc="iframeSrc"
      @onCancel="isShowLogistics = false"
    ></modal-logistics>
  </div>
</template>
<script>
// import commonTable from "@/views/shop/components/table/common-table.vue";
import axios from "axios";
import rowSpanTable from "./row-span-table.vue";
import orderDelivery from "./cloudstock-order-delivery.vue";
import modalLogistics from "@/views/shop/components/modal/modal-logistics.vue";
import { getOrderStatus as statusMap } from "./cloudstock-config.js";
export default {
  components: {
    // commonTable,
    rowSpanTable,
    orderDelivery,
    modalLogistics,
  },
  data() {
    return {
      is_virtual: 0, //0实物商品，1虚拟商品
      isReadOnly: false,//区分查看发货信息和修改发货信息
      virtualFlag: 0,
      isEditing: false,
      tableLoading: false,
      showActionColumn: false,
      isShowDeliverModal: false,
      currentRow: null,
      isShowLogistics: false,
      statusMapClassName: "",
      iframeSrc: "",
      remark_inside: "",
      formFields: {
        company: "",
        number: "",
      },
      rules: {
        company: [
          { required: true, message: "请选择物流公司", trigger: "blur" },
        ],
        number: [
          { required: true, message: "请输入物流单号", trigger: "blur" },
        ],
      },
      statusMap,
      order_info: {},
      product_list: [],
      currentProductId: null, //单独发货时的商品id，可以区分单独发货与批量发货
      selectProductIds: [], //批量发货时的商品id数组
      actionColumn: {
        key: "",
        title: "操作",
        align: "center",
        render: (h, p) => {
          return p.row.delivery_status == 0 &&
            p.row.is_virtual == this.is_virtual
            ? h(
                "span",
                {
                  class: "table-operation",
                  attrs: {
                    perm: "cloudstock.order.operate",
                  },
                  on: {
                    click: () => {
                      this.currentProductId = p.row.id;
                      this.virtualFlag = p.row.is_virtual;
                      this.isReadOnly = false;
                      this.currentRow = null;
                      this.isShowDeliverModal = true;
                    },
                  },
                },
                "发货"
              )
            : h("span", "--");
        },
      },
      statusColumn: {
        key: "status",
        title: "状态",
        align: "center",
        render: (h, p) => {
          let status = this.statusMap.find(
            (item) => item.value == p.row.delivery_status
          );
          return status
            ? h("span", p.row.delivery_status_text)
            : h("span", "--");
          // return status ? h("span",status.name) : h("span", "--")
        },
      },
      logisticsColumn: {
        key: "logistics_id",
        title: "发货信息",
        align: "center",
        render: (h, p) => {
          if (p.row.delivery_status != 0) {
            return h("div", [
              h(
                "div",
                {
                  style: {
                    display: p.row.is_virtual ? "none" : "block",
                  },
                },
                p.row.logistics_name
              ),
              p.row.is_virtual && p.row.logistics_no
                ? h(
                    "Tooltip",
                    {
                      props: {
                        content: p.row.logistics_no,
                        placement: "top",
                        transfer: true,
                        maxWidth: 384,
                      },
                    },
                    [
                      h(
                        "div",
                        {
                          style: {
                            "display": "-webkit-box",
                            "-webkit-line-clamp": "2",
                            "-webkit-box-orient": "vertical",
                            "overflow": "hidden",
                            "text-overflow": "ellipsis",
                            "word-break": "break-all"
                          },
                        },
                        p.row.logistics_no
                      ),
                    ]
                  )
                : h(
                    "div",
                    p.row.logistics_no || "--"
                  ),
              h("div", [
                h(
                  "span",
                  {
                    class: "table-operation",
                    attrs: {
                      perm: "cloudstock.order.view",
                    },
                    on: {
                      click: () => {
                        if(p.row.is_virtual) {
                          this.currentRow = p.row;
                          this.isReadOnly = true;
                          this.virtualFlag = 1;
                          this.isShowDeliverModal = true;
                        } else {
                          this.$httpGet(
                            "/shop/admin/logistics/info",
                            { id: p.row.logistics_id },
                            (res) => {
                              if (res.code === 200) {
                                this.iframeSrc = res.data.search_url;
                                this.isShowLogistics = true;
                              }
                            }
                          );
                        }
                      },
                    },
                  },
                  p.row.is_virtual ? "查看发货信息" : "查看物流"
                ),
                this.order_info.status !== 2
                  ? h(
                      "span",
                      {
                        class: "table-operation",
                        attrs: {
                          perm: "cloudstock.order.operate",
                        },
                        style: {
                          "margin-left": "15px",
                        },
                        on: {
                          click: () => {
                            this.currentRow = p.row;
                            this.isReadOnly = false;
                            this.virtualFlag = p.row.is_virtual;
                            this.isShowDeliverModal = true;
                          },
                        },
                      },
                      "修改"
                    )
                  : "",
              ]),
            ]);
          } else {
            return h("span", "暂无");
          }
        },
      },
      initialColumnsData: [
        {
          key: "product_name",
          title: "商品",
          align: "left",
          minWidth: 328,
          render: (h, p) => {
            let img = h(
              "div",
              {
                style: {
                  position: "relative",
                  "flex-shrink": "0",
                  height: "40px",
                },
              },
              [
                h(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      bottom: "0px",
                      width: "40px",
                      height: "16px",
                      background: "rgba(0,0,0,0.6)",
                      "border-radius": "0 0 5px 5px",
                      color: "white",
                      "font-size": "12px",
                      "text-align": "center",
                      "line-height": "16px",
                    },
                  },
                  p.row.is_virtual ? "虚拟" : "实物"
                ),
                h("img", {
                  style: {
                    width: "40px",
                    height: "40px",
                    "object-fit": "contain",
                    "border-radius": "5px",
                  },
                  attrs: {
                    src: this.formatURL(p.row.image),
                  },
                }),
              ]
            );
            let info = h(
              "div",
              {
                style: {
                  "margin-left": "14px",
                  "line-height": "normal",
                },
              },
              [
                h(
                  "div",
                  {
                    class: "two-hide",
                    style: {
                      "word-break": "break-all",
                    },
                  },
                  p.row.product_name
                ),
                p.row.sku_names && p.row.sku_names.length
                  ? h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4",
                          "margin-top": "5px",
                        },
                      },
                      this.yzArrayToString(p.row.sku_names)
                    )
                  : null,
              ]
            );
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center",
                },
              },
              [img, info]
            );
          },
        },
        {
          key: "num",
          title: "提货数量",
          align: "center",
        },
      ],
    };
  },
  computed: {
    columnsData() {
      if (this.order_info.status == 0) {
        return this.initialColumnsData.concat(
          this.statusColumn,
          this.logisticsColumn,
          this.actionColumn
        );
      } else if (this.order_info.status == 1 || this.order_info.status == 2) {
        return this.initialColumnsData.concat(
          this.statusColumn,
          this.logisticsColumn
        );
      } else if (this.order_info.status == 3) {
        return this.initialColumnsData.concat(this.statusColumn);
      } else if (this.order_info.status == 4) {
        return this.initialColumnsData;
      }
    },
  },
  watch: {
    is_virtual() {
      this.$refs.table.clearSelect();
    },
  },
  created() {
    this.getDeliveryInfo();
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    selectChange(data) {
      this.selectProductIds = data;
    },
    disableItem(item) {
      return item.delivery_status != 0 || item.is_virtual != this.is_virtual;
    },
    batchDelivery() {
      if (this.selectProductIds.length) {
        this.currentRow = null;
        this.virtualFlag = this.is_virtual;
        this.isShowDeliverModal = true;
      } else {
        this.$Message.error("请选择要批量发货的商品");
      }
    },
    deliverSuccess() {
      // if(!this.currentProductId) {
      //   this.$refs.table.clearSelect()
      // } else {
      //   let index = this.selectProductIds.findIndex(id => id == this.currentProductId)
      //   if(index > -1) {
      //     this.selectProductIds.splice(index, 1)
      //   }
      //   this.currentProductId = null;// 单独发货关闭弹窗时清除单独发货的标志
      // }
      if (this.currentProductId) {
        this.currentProductId = null; // 单独发货关闭弹窗时清除单独发货的标志
      }
      this.$refs.table.clearSelect();
      this.getDeliveryInfo();
    },
    deliverCanceled() {
      if (this.currentProductId) {
        this.currentProductId = null; // 单独发货关闭弹窗时清除单独发货的标志
      }
    },
    modifyRemark() {
      if (this.isEditing) {
        axios
          .post("/shop/admin/cloudstock/take/delivery/order/inside/remark", {
            order_id: this.$route.query.order_id,
            remark: this.remark_inside,
          })
          .then((res) => {
            if (res.code == 200) {
              this.order_info.remark_inside = this.remark_inside;
              this.$Message.success("保存成功");
              this.isEditing = false;
            } else {
              this.$Message.error("保存失败");
            }
          });
      } else {
        this.remark_inside = this.order_info.remark_inside;
        this.isEditing = true;
      }
    },
    getDeliveryInfo() {
      this.$store.state.COMMON_loading = true;
      axios
        .post("/shop/admin/cloudstock/take/delivery/order/info", {
          order_id: this.$route.query.order_id,
        })
        .then((res) => {
          if (res.code == 200) {
            this.order_info = res.data.order_info;
            this.product_list = res.data.product_list;
            if (this.order_info.virtual_flag == 2) {
              if (
                this.product_list
                  .filter((item) => {
                    return item.delivery_status == 0;
                  })
                  .every((item) => {
                    return item.is_virtual == 1;
                  })
              ) {
                this.is_virtual = 1;
              } else {
                this.is_virtual = 0;
              }
            } else {
              this.is_virtual = this.order_info.virtual_flag;
            }
            if (this.order_info.status >= 1) {
              this.initialColumnsData[0].minWidth = 0;
            }
            this.statusMap.forEach((item) => {
              if (res.data.order_info.status == item.value) {
                this.statusMapClassName = item.className;
              }
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch((err) => {
          this.$Message.error(err.message);
        })
        .finally(() => {
          this.$store.state.COMMON_loading = false;
        });
    },
  },
};
</script>
<style lang="less" scoped>
@import "../../css/my-theme/index";
.cloudstock-order-detail {
  padding: 24px;
  .flex-wrapper {
    display: flex;
    margin-bottom: 24px;
    .info-block {
      min-width: 373px;
      width: calc(33.33% - 11px);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #dcdee2;
      .title {
        color: #464c5b;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #f8f8f9;
        font-size: 13px;
        font-weight: bold;
        border-bottom: 1px solid #dcdee2;
      }
      .content {
        position: relative;
        padding: 20px;
        font-size: 12px;
        color: #657180;
        height: calc(100% - 40px);
        .row {
          margin-bottom: 12px;
          .key {
            white-space: nowrap;
          }
          .table-operation {
            margin-left: 15px;
            white-space: nowrap;
          }
          .input-wrapper {
            position: relative;
            display: inline-block;
            width: 100%;
            .suffix {
              position: absolute;
              right: 10px;
              bottom: 0;
              color: #9ea4b1;
            }
            /deep/.ivu-input-wrapper {
              width: 100%;
              vertical-align: text-top;
              textarea {
                height: 82px;
                resize: none;
                padding-right: 40px;
              }
            }
          }
          &.flex {
            display: flex;
            .key {
              flex-shrink: 0;
            }
            .remark {
              word-break: break-all;
            }
          }
          &.address {
            display: flex;
          }
          &:last-child {
            margin-bottom: 0px;
          }
        }
        .img-wrapper {
          display: inline-block;
        }
        .btn-wrapper {
          position: absolute;
          bottom: 0;
          left: 20px;
          width: calc(100% - 40px);
          height: 74px;
          line-height: 74px;
          border-top: 1px dashed #eee;
          /deep/.ivu-btn-primary {
            margin-right: 20px;
          }
          /deep/.ivu-radio-wrapper {
            margin-right: 20px;
            line-height: 32px;
          }
        }
      }
      &:not(:last-child) {
        margin-right: 20px;
      }
    }
  }
  .row-span-table {
    /deep/ th {
      color: #464c5b;
    }
    /deep/ td {
      color: #657180;
    }
  }
  .summary {
    height: 54px;
    line-height: 54px;
    text-align: right;
    font-size: 16px;
    border-bottom: 1px solid #e6e8eb;
  }
}
</style>
<style lang="less">
.deliver-modal {
  .info {
    padding: 16px;
    line-height: 1;
    border-radius: 4px;
    background: #f5f6f7;
    margin-top: 20px;
    .title {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .user {
      margin-bottom: 13px;
    }
    .address {
      line-height: 1.5;
    }
  }
}
</style>
