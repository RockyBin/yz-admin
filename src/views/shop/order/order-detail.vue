<template>
  <div data-page="orderDetail" style="overflow:auto!important;" v-show="!$store.state.COMMON_loading">
    <div class="show-infos">
      <Card bordered class="info-card" style="width:28%;">
        <p slot="title">
          订单信息
          <span style="color:#FF9900;fontSize:12px">{{orderInfo.supplier_member_id > -1 ? orderInfo.supplier_member_id > 0 ? "(供应商订单)" : "(自营订单)" : ''}}</span>
        </p>
        <p class="line-row">
          <span class="prefix">总订单号：</span>
          <span>{{ orderInfo.id }}</span>
          <label
            v-if="orderInfo.type == 1"
            style="margin-left: 12px;"
            class="table-back"
            >多人拼团</label
          >
        </p>
        <p class="line-row">
          <span class="prefix">订单状态：</span>
          <span>{{
            orderInfo.type == 1 && orderInfo.type_status == 100
              ? "待成团"
              : getStatu(orderInfo.status)
          }}</span>
        </p>
        <p class="line-row">
          <span class="prefix">买家昵称：</span>
          <span>{{ orderInfo.member_nickname }}</span>
        </p>
        <p class="line-row">
          <span class="prefix">手机号：</span>
          <span>{{ orderInfo.member_mobile }}</span>
        </p>
        <p class="line-row">
          <span class="prefix">姓名：</span>
          <span>{{ orderInfo.member_name || "--" }}</span>
        </p>
        <p class="line-row" style="display: flex;">
          <span class="prefix">买家备注：</span>
          <span v-if="orderInfo.remark" class="remark-content">{{
            orderInfo.remark
          }}</span>
          <span v-else>--</span>
        </p>
        <p class="line-row" style="display: flex;position: relative;">
          <span class="prefix">内部备注：</span>
          <span
            class="remark-inside-content"
            :class="{
              'remark-inside-content-long': dataEdit.remark_inside.status,
            }"
          >
            <span v-if="dataEdit.remark_inside.status">
              <Input
                type="textarea"
                placeholder="只对商家内部人员可见"
                v-model.trim="dataEdit.remark_inside.value"
                :maxlength="50"
                :rows="3"
              />
              <div class="remark-inside-word-limit">
                {{ dataEdit.remark_inside.value.length }}/50
              </div>
            </span>
            <span v-else>{{
              orderInfo.remark_inside ? orderInfo.remark_inside : "--"
            }}</span>
          </span>
          <span class="remark-inside-btn">
            <span
              class="table-operation"
              @click="editOrderData('remark_inside')"
              perm="order.operate"
              >{{ dataEdit.remark_inside.status ? "确定" : "修改" }}</span
            >
          </span>
        </p>
      </Card>
      <Card bordered class="info-card" style="width:28%;">
        <p slot="title">交易信息</p>
        <p class="line-row">
          <span class="prefix">下单时间：</span>
          <span>{{ orderInfo.created_at }}</span>
        </p>
        <p class="line-row" v-if="orderInfo.status == 8">
          <span class="prefix">取消时间：</span>
          <span>{{ orderInfo.end_at }}</span>
        </p>
        <p class="line-row" v-if="orderInfo.status == 8">
          <span class="prefix">取消理由：</span>
          <span>{{ orderInfo.cancel_reason_text }}</span>
        </p>
        <p class="line-row">
          <span class="prefix">支付时间：</span>
          <span v-if="orderInfo.pay_at">{{ orderInfo.pay_at }}</span>
          <span v-else>--</span>
        </p>
        <p class="line-row">
          <span class="prefix">发货时间：</span>
          <span>{{ orderInfo.send_at || '--' }}</span>
        </p>
        <p class="line-row">
          <span class="prefix">结算方式：</span>
          <span v-if="orderInfo.pay_type">{{
            getPayType(orderInfo.pay_type)
          }}</span>
          <span v-else>--</span>
        </p>
        <p class="line-row">
          <span class="prefix">支付流水号：</span>
          <span class="payment-flow" v-if="orderInfo.transaction_id">{{
            orderInfo.transaction_id
          }}</span>
          <span v-else>--</span>
        </p>
        <p class="line-row">
          <span class="prefix">终端来源：</span>
          <span>{{ getTerminal(orderInfo.terminal_type) }}</span>
        </p>
      </Card>
      <Card bordered class="info-card" style="flex: 1;">
        <p slot="title">发货信息</p>
        <p class="line-row" v-if="orderInfo.virtual_flag != 1">
          <span class="prefix">收货人姓名：</span>
          {{ orderInfo.receiver_name }}
          <span></span>
        </p>
        <p class="line-row" v-if="orderInfo.virtual_flag != 1">
          <span class="prefix">收货人电话：</span>
          {{ orderInfo.receiver_tel }}
          <span></span>
        </p>
        <p class="line-row" v-if="orderInfo.virtual_flag != 1">
          <span class="prefix">收货人地址：</span>
          <span style="white-space: pre-wrap;"
            >{{ address.prov_text }}{{ address.prov_text === address.city_text ? '' : address.city_text }}{{ address.area_text
            }}{{ address.address }}</span
          >
        </p>
        <p class="line-row last" v-if="orderInfo.virtual_flag != 1 && [0, 1].includes(Number(orderInfo.status))">
          <span class="table-operation" @click="isShowModifyReceiver = true" perm="order.operate">修改收货信息</span>
        </p>
        <p
          class="divide-line"
          v-if="orderInfo.virtual_flag !== 1 && btnShowItem.length"
        ></p>
        <p v-if="btnShowItem.length" class="line-row">
          <template v-for="(item, index) in btnShowItem">
            <Button
              type="primary"
              v-if="item.type !== 'text'"
              :key="index"
              @click="item.click"
              style="margin-right: 15px;"
              :style="item.style"
              perm="order.operate"
              >{{ item.text }}</Button
            >
            <div v-else :key="index" :style="item.style">{{ item.text }}</div>
            <Tooltip
              placement="top"
              :key="'tip' + index"
              v-if="item.tipText"
              transfer
              :max-width="300"
              style="line-height: 32px;height: 32px;vertical-align: top;margin-right: 15px;"
            >
              <i
                class="iconfont icon-ios-help-circle-outl"
                style="font-size: 18px;"
              ></i>
              <div v-html="item.tipText" slot="content"></div>
            </Tooltip>
          </template>
        </p>
      </Card>
    </div>
    <div class="supplier-detail" v-if="orderInfo.supplier_settle">
         <titlebar title="供应商结算信息平台"></titlebar>
         <div class="supplier-name">
              <span>供应商：</span>
              <div class="supplier-icon">
                  <i class="iconfont icon-gonghuoshang"></i>
                  <span>{{orderInfo.supplier_name}}</span>
              </div>
         </div>
         <div class="supplier-order-status" v-if="orderInfo.supplier_settle">
              <span>结算状态：
                <span>{{supplierStatus(orderInfo.supplier_settle.status)}}</span>
              </span>
              <span>商品供货：¥&nbsp;{{orderInfo.supplier_settle.money}}</span>
              <span>订单运费： ¥&nbsp;{{orderInfo.supplier_settle.freight}}</span>
              <span>售后退款： ¥&nbsp;{{changePrice(Math.abs(orderInfo.supplier_settle.after_sale_money*1 + orderInfo.supplier_settle.after_sale_freight*1))}}</span>
              <span>实际结算：¥&nbsp;{{changePrice(orderInfo.supplier_settle.money*1 + orderInfo.supplier_settle.freight*1 - Math.abs(orderInfo.supplier_settle.after_sale_money*1 + orderInfo.supplier_settle.after_sale_freight*1))}}</span>
         </div>
    </div>
    <Table border ref="table" :columns="columns1" :data="data1"></Table>
    <div class="show-prices">
      <!-- 各项明细 -->
      <div class="shop-row">
        <div>
          <div class="shop-before" v-if="Number(orderInfo.manual_discount) || Number(orderInfo.freight_manual_discount)">
            <div>优惠修改记录：</div>
            <p v-if="Number(orderInfo.manual_discount)">订单金额-商家改价优惠：¥ {{orderInfo.manual_discount}}&nbsp;&nbsp;&nbsp;&nbsp;{{orderInfo.money_changed_at}}</p>
            <p v-if="Number(orderInfo.freight_manual_discount)">订单运费-手动改价优惠：¥ {{orderInfo.freight_manual_discount}}&nbsp;&nbsp;&nbsp;&nbsp;{{orderInfo.freight_changed_at}}</p>
          </div>
        </div>
        <div class="shop-area">
          <p class="shop-amount">
            <span>商品总额(优惠后)：</span>
            <span>￥</span>
            <span>{{ orderInfo.sub_total }}</span>
          </p>
          <p class="shop-freight" v-if="orderInfo.virtual_flag != 1">
            <span>运费：</span>
            <span v-if="orderInfo.freight !== 0">￥</span>
            <span v-if="!orderInfo.freight !== 0">{{ orderInfo.freight }}</span>
            <span v-else>免运费</span>
          </p>
          <p class="shop-order-amount">
            <span>订单金额：</span>
            <span>￥</span>
            <span>{{ orderInfo.money }}</span>
          </p>
          <p>
            <span class="table-operation" v-show="orderInfo.status==0" @click="isShowModifyPrice=true" perm="order.operate">修改价格</span>
            <span class="table-operation" v-show="orderInfo.status==0 && orderInfo.supplier_member_id!=-1 && orderInfo.virtual_flag != 1" style="margin:0 10px;">|</span>
            <span class="table-operation" v-show="orderInfo.status==0 && orderInfo.supplier_member_id!=-1 && orderInfo.virtual_flag != 1" @click="isShowModifyFreight=true" perm="order.operate">修改运费</span>
          </p>
        </div>
      </div>
      <!--总金额 -->
      <div class="shop-bottom">
        <p
          class="shop-price"
          v-if="orderInfo.status !== 0 && orderInfo.status !== 8"
        >
          <span>实付金额：</span>
          <span>￥</span>
          <span>{{ orderInfo.money }}</span>
        </p>
      </div>
    </div>
    <order-logistics
      :logisticsValue="logisticsValue"
      :iframeSrc="iframeSrc"
      @onCancel="closeLogistics"
    ></order-logistics>
    <order-delivery
      v-model="showModal"
      :orderDetail="orderInfo"
      :order_id="orderInfo.id"
      :logisticsInfo="formValidate"
      @changeShowModal="changeShowModal"
      @closeShowModal="closeShowModal"
    ></order-delivery>
    <modify-receiver 
      v-model="isShowModifyReceiver"
      :orderInfo="orderInfo"
      :address="address"
      @on-modal-confirm="getOrderDetail()"
    ></modify-receiver>
    <modify-price 
      v-model="isShowModifyPrice"
      :orderInfo="orderInfo"
      @on-modal-confirm="getOrderDetail()"
    ></modify-price>
    <modify-freight 
      v-model="isShowModifyFreight"
      :orderInfo="orderInfo"
      @on-modal-confirm="getOrderDetail()"
    ></modify-freight>
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import supplierIcon from "@/views/shop/components/icons/icon.vue"
import orderLogistics from "@/views/shop/components/modal/modal-logistics.vue";
import orderDelivery from "./components/order-delivery.vue";
import constants from "@/views/shop/components/constants.js";
import tagMessage from "@/views/shop/components/label/label.vue";
import modifyReceiver from "./components/order-modify-receiver-modal.vue";
import modifyPrice from "./components/order-modify-price-modal.vue";
import modifyFreight from "./components/order-modify-freight-modal.vue";
export default {
  components: { 
    orderLogistics, 
    orderDelivery, 
    tagMessage, 
    titlebar, 
    modifyReceiver,
    modifyPrice, 
    modifyFreight
  },
  data() {
    return {
      constants,
      minWidth: 1116,
      logisticsValue: false, // 查看物流
      iframeSrc: "", // 物流地址
      logisticsCompany: Array.from(require("COMPONENTS/logisticsCompany.json")),
      showModal: false,
      formValidate: {
        logistics_id: 0,
        logistics_no: "",
        logistics_company: 6,
        logistics_name: "",
      },
      loading: false,
      id: 0,
      orderInfo: {},
      address: {},
      columns1: [
        {
          title: "商品",
          align: "center",
          minWidth: 228,
          render: (h, params) => {
            return h(
              "Div",
              {
                props: {},
                class: {
                  "tab-cell": true,
                },
              },
              [
                h("Div", [
                  h(
                    "Div",
                    {
                      style: {
                        "background-image": `url(${
                          this.$store.state.siteComdataPath
                        }${params.row.image})`,
                      },
                      class: {
                        "small-img": true,
                      },
                    },
                    [
                      h(
                        "div",
                        {
                          class: "product-type",
                        },
                        params.row.is_virtual ? "虚拟" : "实物"
                      ),
                    ]
                  ),
                  h(
                    "Div",
                    {
                      class: {
                        "right-con": true,
                      },
                    },
                    [
                      h(
                        "Div",
                        {
                          class: {
                            "shop-title": true,
                          },
                        },
                        `${params.row.name}`
                      ),
                      h(
                        "Div",
                        {
                          class: {
                            specifications: true,
                          },
                        },
                        [
                          h(
                            "span",
                            {
                              style: {
                                color: "#9ea7b4",
                              },
                            },
                            params.row.sku_names.length > 0
                              ? this.yzArrayToString(params.row.sku_names)
                              : ""
                          ),
                        ]
                      ),
                      [
                        h("div",{
                          style: {
                            textAlign: "left"
                          }
                        },[
                          //  h(tagMessage, {
                          //   props: {
                          //     tagName: "自营",
                          //     backgroundColor:"#FF9900"
                          //   }
                          // }) 
                         params.row.supplier_member_id === 0 ? "" :
                          h("div", { style: { "line-height": "16px" } }, [
                            h("i", {
                              class: "iconfont icon-gonghuoshang",
                              style: {
                                color: "#41B44D",
                                "margin-right": "3px",
                                "vertical-align": "text-bottom"
                              }
                            }),
                            h(
                              "span",
                              {
                                style: { color: "#9EA7B4", "font-size": "12px" }
                              },
                              params.row.supplier_name
                            )
                          ])
                        ])
                      ]
                    ]
                  ),
                ]),
              ]
            );
          },
        },
        {
          title: "成本价",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h("span", `￥${params.row.cost}`);
          },
        },
        {
          title: "单价",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h("span", `￥${params.row.price}`);
          },
        },
        {
          title: "数量",
          align: "center",
          minWidth: 110,
          key: "num",
        },
        {
          title: "优惠",
          align: "center",
          minWidth: 110,
          // key: "discount",
          render: (h, params) => {
            return h("span", `￥${params.row.discount}`);
          },
        },
        {
          // title: "小计",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", "小计"),
              h(
                "span",
                {
                  style: {
                    "font-size": "12px",
                  },
                },
                "(优惠后)"
              ),
            ]);
          },
          align: "center",
          minWidth: 110,
          // key: "sub_total",
          render: (h, params) => {
            return h("span", `￥${params.row.sub_total}`);
          },
        },
        {
          title: "商品状态",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-success":
                    (params.row.status === 4 &&
                      !params.row.after_sale_status) ||
                    params.row.status === 5 ||
                    (params.row.status === 1 &&
                      params.row.after_sale_status === 5) ||
                    (params.row.status === 6 && params.row.after_sale_status),
                  "table-error":
                    params.row.status === 8 ||
                    (params.row.status === 6 && !params.row.after_sale_status),
                  "table-warning":
                    (params.row.status === 4 &&
                      (params.row.after_sale_status ||
                        params.row.after_sale_status === 0)) ||
                    [0, 2, 3, 7].indexOf(params.row.status) !== -1 ||
                    (params.row.status === 1 &&
                      params.row.after_sale_status !== 5),
                },
              },
              params.row.status_text
              // (params => {
              //   if (params.row.after_sale_status !== null) {
              //     if (params.row.after_sale_type === 0) {
              //       name = "退款";
              //     } else {
              //       name = "退货";
              //     }
              //     // 退款或退货成功
              //     let newName = "";
              //     if (params.row.after_sale_status === 5) {
              //       newName =
              //         name +
              //         this.matchName(
              //           params.row.after_sale_status,
              //           this.constants.refundStatus
              //         );
              //     } else {
              //       newName =
              //         this.matchName(
              //           params.row.after_sale_status,
              //           this.constants.refundStatus
              //         ) + name;
              //     }
              //     return newName;
              //   } else {
              //     return this.matchName(
              //       params.row.status,
              //       this.constants.orderStatus
              //     );
              //   }
              // })(params)
            );
          },
        },
        {
          title: "发货信息",
          align: "center",
          minWidth: 228,
          render: (h, params) => {
            return this.tableExpand(h, params);
          },
        },
      ],
      data1: [],
      dataEdit: {
        remark_inside: {
          status: false,
          value: "",
        },
      },
      isShowModifyReceiver: false,
      isShowModifyPrice: false,
      isShowModifyFreight: false
    };
  },
  computed: {
    btnShowItem() {
      let items = [];
      // 待发货总状态
      let isWait =
        this.orderInfo.status === 1 &&
        this.isShowButton(this.orderInfo) &&
        this.orderInfo.type_status != 100;
      // 待发货按钮显示
      let deliverStatus =
        isWait &&
        this.orderInfo.virtual_flag != 2 &&
        this.orderInfo.supplier_member_id === 0;
      // 发货按钮
      if (deliverStatus) {
        items.push({
          text: "发货",
          click: this.initLogisticsData.bind(this, true)
        });
      }
      if (
        isWait &&
        this.data1.length > 1 &&
        this.orderInfo.supplier_member_id === 0
      ) {
        items.push({
          text: "拆单发货",
          click: this.gotoDemolitionOrder
        });
      }
      // 同步按钮
      if (
        deliverStatus &&
        this.orderInfo.virtual_flag == 0 &&
        this.isShowButton(this.orderInfo, true)
      ) {
        if (
          this.orderInfo.express_status &&
          [0, 3].includes(this.orderInfo.express_sync_status)
        ) {
          items.push({
            text: "同步订单",
            tipText: `同步商城的待发货订单到快递100后台发货；\n同步订单到快递后台后，请到快递后台发货`,
            click: this.onOrderSyncClick.bind(this)
          });
        }
      }
      // 同步结果（express_sync_status > 0表明操作过同步并符合同步的条件，不用考虑是否拆单虚拟商品等）
      if (
        this.orderInfo.status === 1 &&
        this.isShowButton(this.orderInfo, true, true) &&
        this.orderInfo.express_sync_status > 0
      ) {
        items.push({
          type: "text",
          style:
            "display: inline-block;color: #ED4014;line-height: 16px;margin-right: 15px;",
          text:
            this.orderInfo.express_sync_status === 2
              ? "同步中"
              : this.orderInfo.express_sync_status === 3
              ? "同步失败"
              : "已同步订单"
        });
      }
      // 查找是否存在退款中
      if (
        this.orderInfo.item_list &&
        this.orderInfo.item_list.filter(
          n =>
            // 2是待收货，-1撤销退款，2拒绝退款，5退款成功
            n.status === 2 && [null, -1, 2, 5].includes(n.after_sale_status)
        ).length === this.orderInfo.item_list.length
      ) {
        items.push({
          text: "代客确认收货",
          click: this.onReceiptClick
        });
      }
      if (isWait && this.orderInfo.supplier_member_id) {
        items.push({
          type: "text",
          style: "color: #ED4014;margin-top: 32px;line-height: 16px;",
          text: "待供应商发货"
        });
      }
      return items;
    }
  },
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当钩子执行前，组件实例还没被创建
    next((vm) => {
      vm.id = vm.$route.query.id;
      vm.showModal = vm.$route.query.showModal;
      vm.getOrderDetail();
    });
  },
  methods: {
    /**
     * 同步数据
     */
    onOrderSyncClick() {
      this.$Modal.confirm({
        title: "提示",
        loading: true,
        content: "是否确定把该待发货订单同步到快递后台发货？",
        onOk: () => {
          this.orderSyncData({
            ids: [this.orderInfo.id]
          });
        }
      });
    },
    orderSyncData(data) {
      this.$httpPost("/shop/admin/express/order/sync", data, res => {
        this.$Modal.remove();
        if (res.code === 200) {
          // 延时等待上一个弹窗消失
          window.setTimeout(() => {
            this.$Modal.info({
              title: "提示",
              content: "订单同步处理中，请稍后查看同步结果",
              onOk: () => {
                this.getOrderDetail();
              }
            });
          }, 300);
          
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    supplierStatus (status) {
       if (status === 0) {
        return "待结算";
      } else if (status === 1) {
        return "已结算";
      } else {
        return "结算失败";
      }
    },
    // 价格保留两位小数处理
    changePrice (value) {
      let str = value + ''
      let index = str.indexOf('.')
      if(index > 0) {
         str = str.substr(index + 1)
        if(str.length <=2){
          str.length > 1 ? str = value : str = value + '0'
        }else{
          let t = value + ''
          t[index+3] > 5? str = t.substring(0,index+3)*1 + 0.01 : str = t.substring(0,index+3)
        }
      }else {
          str += '.00'
      }
      return str
    },
    gotoDemolitionOrder() {
      this.$router.push({
        name: "orderDemolitionOrder",
        query: { id: this.id }
      });
    },
    closeShowModal() {
      this.showModal = false;
    },
    // 关闭发货弹窗
    changeShowModal() {
      this.showModal = false;
      this.getOrderDetail();
    },
    resetFormValidate() {
      this.formValidate = {
        logistics_id: 0,
        logistics_no: "",
        logistics_company: 6,
        logistics_name: "",
      };
    },
    /**
     * all_wait 是否所有订单都是待发货
     * after_sale 是否包括售后
     */
    isShowButton(product, all_wait, after_sale) {
      let bool = true;
      let newArray = [];
      if (product.item_list) {
        product.item_list.forEach(item => {
          // 待发货
          if (item.status === 1 && (after_sale || item.after_sale_num === 0)) {
            if (newArray.indexOf(item.id) === -1) {
              newArray.push(item.id);
            }
          }
        });
      }
      if (
        newArray.length > 0 &&
        (all_wait ? newArray.length === product.item_list.length : true)
      ) {
        bool = true;
      } else {
        bool = false;
      }
      return bool;
    },
    closeLogistics() {
      this.logisticsValue = false;
    },
    getTerminal(terminal_type) {
      return this.$constants.getConstantsValue(
        "terminalTypes",
        "id",
        terminal_type
      );
    },
    // 获取支付类型
    getPayType(pay_type) {
      return this.$constants.getConstantsValue(
        "collectionType",
        "value",
        pay_type,
        "name"
      );
    },
    // 获取订单状态
    getStatu(status) {
      return this.$constants.getConstantsValue("orderStatus", "id", status);
    },
    // status：空-所有，-1，已删除，0-代付款，1-待发货，2-待收货，3-已收货，4-交易成功，5-交易完成(过售后期并没有申请过售后才进入此状态)，6-交易关闭(维权结束会进入此状态)，7-退款处理中，8-订单取消
    // 合并单元格
    // 暂时需求，先以物流作为合分列表
    tableExpand(h, params) {
      if (params.row.rowspan) {
        this.$nextTick(() => {
          this.$refs["table"].$el
            .querySelector(
              ".ivu-table-tbody tr:nth-child(" +
                (params.index + 1) +
                ") td:nth-child(" +
                (params.column._index + 1) +
                ")"
            )
            .setAttribute("rowspan", params.row.rowspan);
        });
        // 待付款或待发货还没有物流信息
        let logisticsStatus = !(
          params.row.status === 0 || params.row.delivery_status === 0
        );
        let elemsText = [
          // 不是虚拟商品才显示物流公司名称
          logisticsStatus && !params.row.is_virtual
            ? h("p", params.row.logistics_name)
            : "",
          // 虚拟商品的发送信息或实物商品的物流号
          params.row.is_virtual && params.row.logistics_no
            ? h(
                "Tooltip",
                {
                  props: {
                    content: params.row.logistics_no,
                    placement: "top",
                    transfer: true,
                    maxWidth: 384
                  },
                  style: {
                    display: "block"
                  }
                },
                [
                  h(
                    "p",
                    {
                      style: {
                        display: "-webkit-box",
                        "-webkit-line-clamp": "2",
                        "-webkit-box-orient": "vertical",
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        "word-break": "break-all"
                      },
                    },
                    params.row.logistics_no
                  )
                ]
              )
            : "",
          !params.row.is_virtual && logisticsStatus ? h("p", params.row.logistics_no || "--") : ""
        ];
        let elemsBtn = [
          logisticsStatus
            ? h(
                "a",
                {
                  props: {
                    href: "javascript:void(0)"
                  },
                  attrs: {
                    perm: "order.view"
                  },
                  style: {
                    color: "#4a6af5"
                  },
                  on: {
                    click: () => {
                      if (params.row.is_virtual) {
                        this.resetFormValidate();
                        this.formValidate.isReadOnly = true;
                        this.formValidate.logistics_id =
                          params.row.logistics_id;
                        this.formValidate.logistics_no =
                          params.row.logistics_no;
                        this.formValidate.logistics_company =
                          params.row.logistics_company;
                        this.formValidate.logistics_name =
                          params.row.logistics_name;
                        this.formValidate.is_virtual = params.row.is_virtual;
                        this.showModal = true;
                      } else {
                        this.$httpGet(
                          "/shop/admin/logistics/info",
                          { id: params.row.logistics_id },
                          res => {
                            if (res.code === 200) {
                              this.iframeSrc = res.data.search_url;
                            }
                          }
                        );
                        this.logisticsValue = true;
                      }
                    }
                  }
                },
                params.row.is_virtual ? "查看发货信息" : "查看物流"
              )
            : "",
          params.row.logistics_id && [1, 2].includes(this.orderInfo.status)
            ? h(
                "a",
                {
                  props: {
                    href: "javascript:void(0)"
                  },
                  attrs: {
                    perm: "order.operate"
                  },
                  style: {
                    color: "#4a6af5"
                  },
                  on: {
                    click: () => {
                      this.resetFormValidate();
                      this.formValidate.logistics_id = params.row.logistics_id;
                      this.formValidate.logistics_no = params.row.logistics_no;
                      this.formValidate.logistics_company =
                        params.row.logistics_company;
                      this.formValidate.logistics_name =
                        params.row.logistics_name;
                      this.formValidate.is_virtual = params.row.is_virtual;
                      this.showModal = true;
                    }
                  }
                },
                "修改"
              )
            : ""
        ];
        let line = h(
          "a",
          {
            props: {
              href: "javascript:void(0)"
            },
            style: {
              color: "#4a6af5",
              margin: "0 12px"
            }
          },
          "|"
        );
        elemsBtn = elemsBtn.filter(n => n);
        // 插入竖线
        let l = elemsBtn.length - 1;
        elemsBtn.forEach((n, i) => {
          if (i !== l) {
            elemsBtn.splice(l - i, 0, line);
          }
        });
        if (!elemsBtn.length) {
          elemsBtn.push(
            h("div", { style: { color: "rgba(101,113,128,1)" } }, "暂无")
          );
        }
        return h("Div", [...elemsText, ...elemsBtn]);
      } else {
        this.$nextTick(() => {
          let className = `.ivu-table-tbody tr:nth-child(${params.index +
            1}) td:nth-child(${params.column._index + 1})`;
          this.$refs["table"].$el.querySelector(className).style.display =
            "none";
        });
        return h("span", "");
      }
    },
    onReceiptClick() {
      this.$Modal.confirm({
        title: "提示",
        loading: true,
        content: `代客户【${this.orderInfo.member_nickname}】，【订单编号：${
          this.orderInfo.id
        }】订单操作确认收货；确定后，将不能恢复，是否代客户确认收货？`,
        onOk: () => {
          this.$httpPost(
            "/shop/admin/order/receipt",
            {
              order_id: this.orderInfo.id
            },
            res => {
              this.$Modal.remove();
              if (res.code === 200) {
                this.$Message.success("收货成功");
                this.getOrderDetail();
              } else if (res.code === 501) {
                this.$Message.error(res.msg);
                window.setTimeout(() => {
                  this.getOrderDetail();
                }, 1000);
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        }
      });
    },
    // 匹配名称
    matchName(val, data) {
      let names = "";
      data.forEach((item) => {
        if (val === item.id) {
          names = item.value;
        }
      });
      return names;
    },
    getOrderDetail() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/order/info", { id: this.id }, (res) => {
        if (res.code === 200) {
          this.data1 = res.data.item_list || [];
          if (res.data) {
            this.orderInfo = res.data;
            this.address = res.data.address;
            if (res.data.item_list.length >= 0) {
              let rowStatus = null; // 状态
              let rowSpan = 0; // 合并行数
              let target = null; // 第一个元素
              this.data1.forEach((item) => {
                if (rowStatus !== item.group_key) {
                  rowStatus = item.group_key;
                  if (target) {
                    // 旧的
                    target.rowspan = rowSpan;
                  }
                  // 重新初始化
                  rowSpan = 1;
                  target = item;
                } else {
                  rowSpan += 1;
                }
              });
              if (target) {
                // 旧的
                target.rowspan = rowSpan;
              }
            }
          }
          this.$store.state.COMMON_loading = false;
        }
      });
    },
    // 修改内部备注
    editOrderData(orderKey) {
      if (this.dataEdit[orderKey].status) {
        // 保存数据
        if (this.orderInfo[orderKey] != this.dataEdit[orderKey].value) {
          let data = {
            id: this.orderInfo.id,
          };
          data[orderKey] = this.dataEdit[orderKey].value;
          this.$httpPost("/shop/admin/order/edit", data, (res) => {
            if (res.code == 200) {
              this.dataEdit[orderKey].status = false;
              this.orderInfo[orderKey] = this.dataEdit[orderKey].value;
              this.$Message.success("保存成功");
            } else {
              this.$Message.error("保存失败");
            }
          });
        } else {
          this.dataEdit[orderKey].status = false;
        }
      } else {
        this.dataEdit[orderKey].value = this.orderInfo[orderKey]
          ? this.orderInfo[orderKey]
          : "";
        this.dataEdit[orderKey].status = true;
      }
    },
    // 初始化物流信息
    initLogisticsData(isShowModal) {
      this.formValidate.is_virtual = 0;
      this.formValidate.logistics_id = 0;
      this.formValidate.logistics_no = "";
      this.formValidate.logistics_company = 6;
      this.formValidate.logistics_name = "";
      this.showModal = isShowModal ? true : false;
    }
  },
  mounted() {
    if (this.minWidth) {
      let tableSelection = this.$refs["table"];
      // 销毁computed产生的监听器
      tableSelection._computedWatchers.tableHeaderStyle.teardown();
      tableSelection._computedWatchers.tableStyle.teardown();
      // 重新定义get方法，防止旧的getter方法触发
      Object.defineProperty(tableSelection, "tableHeaderStyle", {
        get() {
          return {
            minWidth: this.minWidth + "px",
          };
        },
        set() {},
      });
      Object.defineProperty(tableSelection, "tableStyle", {
        get() {
          return {
            minWidth: this.minWidth + "px",
          };
        },
        set() {},
      });
      // 重新赋值最小宽度
      tableSelection.$el.querySelector(
        ".ivu-table-header table"
      ).style.minWidth = this.minWidth + "px";
      tableSelection.$el.querySelector(".ivu-table-body table").style.minWidth =
        this.minWidth + "px";
    }
  },
};
</script>
<style lang="less" scoped>
@import "../css/_color-val.less";
[data-page="orderDetail"] {
  padding: 24px !important;
  height: calc(~"100vh - 70px");
  box-sizing: border-box;
  /deep/.ivu-table-wrapper {
    .ivu-table-body {
      font-size: 12px;
      color: #657180;
    }
  }
  /deep/.ivu-card:hover {
    box-shadow: none;
  }
  .shop-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  /deep/.shop-before {
    text-align: left;
    padding-left: 16px;
    font-size: 12px;
    line-height: 19px;
    div {
      color: #464C5B;
      margin-bottom: 5px;
    }
    p {
      color: #657180;
    }
  }
  .divide-line {
    margin: 20px 0;
    border-top: 1px dashed @subsidiary-color;
  }
  /deep/.ivu-table-row-hover {
    td {
      background-color: transparent !important;
    }
  }
  /deep/.ivu-table-border thead th {
    border-right: 0;
  }
  /deep/.ivu-card-body {
    padding: 20px;
  }
  /deep/.ivu-card {
    font-size: 13px;
  }
  /deep/.ivu-card-head {
    text-align: center;
    background-color: #f8f9fd;
  }
  /deep/.specifications {
    color: @subsidiary-color;
    font-size: 12px;
    text-align: left;
  }
  /deep/.small-img {
    width: 50px;
    height: 50px;
    display: inline-block;
    vertical-align: middle;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    border-radius: 5px;
    position: relative;

    .product-type {
      position: absolute;
      bottom: 0;
      width: 100%;
      line-height: 16px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 0 0 5px 5px;
    }
  }
  /deep/.warn-msg {
    border: 1px solid @warning-color;
    padding: 1px 2px;
    color: @warning-color;
  }
  /deep/.shop-price {
    padding: 15px;
    font-size: 16px;
  }
  /deep/.error-msg {
    border: 1px solid @error-color;
    padding: 1px 2px;
    color: @error-color;
  }
  /deep/.success-msg {
    border: 1px solid @success-color;
    padding: 1px 2px;
    color: @success-color;
  }
  /deep/.shop-bottom {
    border-bottom: 1px solid #e8eaec;
    border-right: 1px solid #e8eaec;
  }
  /deep/.show-prices {
    text-align: right;
    border-left: 1px solid #e8eaec;
  }
  /deep/.tab-cell {
    padding: 15px 0;
  }
  /deep/.shop-title {
    margin-bottom: 10px;
    text-align: left;
  }
  /deep/.right-con {
    display: inline-block;
    vertical-align: middle;
    width: calc(100% - 65px);
    margin-left: 15px;
  }
  /deep/.shop-area {
    width: 200px;
    line-height: 1.8;
    padding: 10px 0;
    padding-right: 17px;
    display: inline-block;
    border-bottom: 1px solid #e8eaec;
    border-right: 1px solid #e8eaec;
    font-size: 12px;
  }
  .show-infos {
    margin-bottom: 20px;
    overflow: hidden;
    white-space: nowrap;
    color: #657180;
    display: flex;
    .info-card:last-child {
      margin-right: 0px;
    }
    .info-card {
      display: inline-block;
      vertical-align: top;
      margin-right: 16px;
      min-width: 328px;
      overflow: hidden;
      font-size: 12px;
      .line-row {
        padding-bottom: 14px;
        .remark-content {
          word-break: break-all;
          white-space: normal;
        }
        .remark-inside-content {
          max-width: calc(100% - 110px);
          white-space: normal;
          word-break: break-all;
          .remark-inside-word-limit {
            color: #999;
            text-align: right;
          }
          /deep/ textarea {
            resize: none;
          }
        }
        .remark-inside-content-long {
          width: 100%;
        }
        .remark-inside-btn {
          margin-left: 15px;
        }
      }
      .line-row.last {
        padding-bottom: 0px;
      }
    }
  }
  /deep/.ivu-table-wrapper {
    .ivu-table-border {
      thead {
        th {
          background: #f8f9fd;
        }
      }
    }
  }
}
// 供应商订单样式
.supplier-detail {
  padding: 20px 0 20px 18px;
  margin-bottom: 20px;
  border: 1px solid #dcdee2;
  border-radius: 6px;
  .supplier-name{
    display: flex;
    font-size: 12px;
    color: #657180;
    align-items: center;
    padding: 0 0 5px 14px;
    .supplier-icon {
      display: flex;
      align-items: center;
      & >i {
        font-size: 16px;
        color: #41b44d;;
        margin-right: 5px;
      }
    }
  }
  .supplier-order-status{
    font-size: 12px;
    padding-left: 14px;
     color: #657180;
     & > span:first-child {
        span{
          color: #FF9900;
        }
     }
     &>span {
       margin-right: 30px;
     }
  }
}
.modal {
  /deep/.delivery {
    width: 343px;
    background: #f5f6f7;
    padding: 16px;
    p:nth-child(1) {
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 13px;
      line-height: 16px;
    }
    p:nth-child(2) {
      line-height: 32px;
    }
  }
  /deep/.ivu-modal {
    /deep/.ivu-modal-body {
      padding: 24px;
    }
  }
}
</style>
