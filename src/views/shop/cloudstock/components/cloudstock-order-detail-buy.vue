<template>
  <div class="cloudstock-order-detail">
    <div class="flex-wrapper">
      <div class="info-block" style="min-width:403px;">
        <div class="title">订单信息</div>
        <div class="content">
          <div class="row"><span class="key">进货单号：</span><span class="value">{{order_info.id}}</span></div>
          <div class="row">
            <span class="key">订单状态：</span>
            <span 
              :class="'value ' + (statusMap[+order_info.status+1] && statusMap[+order_info.status+1].className)"
            >{{order_info.status_text}}</span>
          </div>
          <div class="row"><span class="key">买家昵称：</span><span class="value">{{order_info.nickname}}</span></div>
          <div class="row"><span class="key">手机号：</span><span class="value">{{order_info.mobile}}</span></div>
          <div class="row"><span class="key">姓名：</span><span class="value">{{order_info.name || "--"}}</span></div>
          <div class="row flex"><span class="key">买家备注：</span><span class="value remark">{{order_info.remark || "--"}}</span></div>
          <div class="row flex">
            <span class="key">内部备注：</span>
            <span class="value" :style="{'flex-grow':isEditing?1:0}">
              <span v-if="!isEditing" class="remark">{{order_info.remark_inside || "--"}}</span>
              <span v-else class="input-wrapper">
                <Input type="textarea" v-model="remark_inside" :maxlength="50" placeholder="请输入备注"/>
                <span class="suffix">{{remark_inside ? remark_inside.length : 0}}/50</span>
              </span>
            </span>
            <span style="white-space:nowrap;" perm="cloudstock.order.operate" class="table-operation" @click="modifyRemark">{{isEditing ? "保存" : "修改"}}</span>
          </div>
        </div>
      </div>
      <div class="info-block">
        <div class="title">交易信息</div>
        <div class="content">
          <div class="row"><span class="key">下单时间：</span><span class="value">{{order_info.created_at}}</span></div>
          <div class="row"><span class="key">收款人：</span><span class="value">{{order_info.payee_name}}</span></div>
          <div class="row"><span class="key">支付时间：</span><span class="value">{{order_info.pay_at || '--'}}</span></div>
          <div class="row"><span class="key">结算方式：</span><span class="value">{{order_info.pay_type_text || '--'}}</span></div>
          <div v-if="!(order_info.status == 4 || order_info.status == 0 && order_info.payment_status == 0) && (order_info.pay_type == 6 || order_info.pay_type == 7 || order_info.pay_type == 8 || order_info.pay_type == 9)" class="row">
            <span class="key">支付凭证：</span>
            <span v-if="order_info.payment_voucher && order_info.payment_voucher.length" class="value absolute">
              <show-big-img 
                v-for="(imgURL, index) in order_info.payment_voucher" :key="index"
                :imgURL="imgURL"
              ></show-big-img>
            </span>
            <span v-else class="value">--</span>
          </div>
          <!-- <div v-if="order_info.status == 2 || order_info.status == 3" class="row"><span class="key">支付流水号：</span><span class="value">{{order_info.transaction_id || '--'}}</span></div> -->
          <div v-if="order_info.status == 2 || order_info.status == 3 || order_info.status == 0 && order_info.payment_status == 2 || order_info.status == 4 && order_info.payment_status == 2 || order_info.status == 1 && order_info.payment_status == 2" class="btn-wrapper"><Button type="primary" @click="isShowRecord=true">查看支付记录</Button></div>
        </div>
      </div>
      <div class="info-block">
        <div class="title">交易流程</div>
        <div class="content">
          <div v-for="(log, index) in order_info.order_log" :key="index" class="row">{{log}}</div>
          <div v-if="order_info.status == 1&&!order_info.payee" class="btn-wrapper"><Button type="primary" @click="isShowVerify=true" perm="finance.operate &amp; cloudstock.order.operate">财务审核</Button></div>
        </div>
      </div>
    </div>
    <row-span-table
      :minWidth="1000"
      :columnsData="columnsData"
      :listData="product_list"
      :rowSpanKey="['cloudstock_id']"
      :loading="tableLoading"
      @selectChange="selectChange"
    ></row-span-table>
    <div class="summary">
      <div class="amount">订单金额：¥ {{order_info.total_money}}</div>
    </div>
    <view-record :order_info="order_info" v-model="isShowRecord"></view-record>
    <finance-verify :order_info="order_info" :order_id="order_info.id" v-model="isShowVerify"></finance-verify>
  </div>
</template>
<script>
import axios from "axios"
import rowSpanTable from "./row-span-table.vue"
import viewRecord from "./cloudstock-order-view-record.vue"
import financeVerify from "./cloudstock-order-finance-verify.vue"
import showBigImg from "COMPONENTS/modal/modal-show-big-img.vue"
import {buyOrderStatus as statusMap, payTypesMap} from "./cloudstock-config.js"
export default {
  components: {
    showBigImg,
    rowSpanTable,
    viewRecord,
    financeVerify
  },
  data() {
    return {
      isShowRecord: false,
      isShowVerify: false,
      isEditing: false,
      tableLoading: false,
      order_info: {},
      product_list: [],
      remark_inside: "",
      statusMap,
      payTypesMap,
      actionColumn: {
        key: "cloudstock_id",
        title: "操作",
        align: "center",
        minWidth: 83,
        render: (h, p) => {
          if(!p.row.cloudstock_id && 
            this.order_info.status == 2 &&
            this.product_list.filter(item => item.cloudstock_id == 0).every(item => !item.shortage_stock)){
            return h("span",{
              class: "table-operation",
              attrs: {
	              perm: "cloudstock.order.operate"
              },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: "提示",
                    content: `是否确定给【${this.order_info.nickname}】配仓`,
                    onOk: () => {
                      this.allocateStock(p.row.order_id)
                    }
                  })
                  
                }
              }
            }, "配仓")
          } else {
            return h("span", "--")
          }
          
        }
      },
      columnsData: [
        {
          key: "",
          title: "商品",
          align: "left",
          minWidth: 288,
          render: (h, p) => {
            let left = h("img", {
              style: {
                "width": "40px",
                "height": "40px",
                "object-fit": "contain",
                "border-radius": "5px",
                "flex-shrink": "0"
              },
              attrs: {
                src: this.formatURL(p.row.image)
              }
            })
            let right = h("div",{
              style: {
                "margin-left": "14px",
                "line-height": "normal"
              }
            },[
              h("div", {
                class: "two-hide",
                style: {
                  "word-break": "break-all"
                }
              },p.row.name),
              p.row.sku_name && p.row.sku_name.length ? h('div',{
                style: {
                  "color": "#9EA7B4"
                }
              }, this.yzArrayToString(p.row.sku_name)) : null
            ])
            return h("div", {
              style: {
                "display":"flex",
                "align-items":"center"
              }
            }, [left, right])
          }
        },
        {
          key: "price",
          title: "云仓订货单价",
          align: "center",
          render: (h, p) => {
            return h("span","￥" + p.row.price)
          }
        },
        {
          key: "num",
          title: "数量",
          align: "center"
        },
        {
          key: "money",
          title: "商品金额",
          align: "center",
          render: (h, p) => {
            return h("span","￥" + p.row.money)
          }
        },
        {
          key: "cloudstock_id",
          title: "配仓仓库",
          align: "center",
          minWidth: 170,
          render: (h, p) => {
            return h("div", "云仓：" + p.row.cloudstock_name)
          }
        },
        {
          key: "inventory",
          title: "仓库库存",
          align: "center",
          render: (h, p) => {
            return h("div", [
              h("span", p.row.inventory || 0),
              p.row.shortage_stock && h("span",{
                class: "table-error",
                style: "margin-left: 10px;"
              },"缺货")
            ])
          }
        },
        {
          key: "stock_status_text",
          title: "状态",
          align: "center",
          // render: (h, p) => {
          //   let status = this.statusMap.find(item => item.value == p.row.stock_status)
          //   return status ? h("span",status.name) : h("span", "--")
          // }
        }
      ]
    }
  },
  watch: {
    "order_info.status": {
      handler(status) {
        if(status > 2){
          let index = this.columnsData.findIndex(column => {
            return column.key == "inventory"
          })
          if(index > -1){
            this.columnsData.splice(index, 1);
          }
        }
        if(status == 2) {
          this.$set(this.columnsData[0], "minWidth", 206);
          this.columnsData.push(this.actionColumn)
        }
      }
    }
  },
  created() {
    this.getOrderInfo();
  },
  methods: {
    formatURL(url){
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    },
    selectChange(data) {
      this.selectTableData = data;
    },
    allocateStock(order_id) {
      axios.post("/shop/admin/cloudstock/purchase/order/stock/deliver",{
        order_id
      }).then(res => {
        if(res.code == 200){
          this.$Message.success("配仓成功")
          this.getOrderInfo()
        } else {
          this.$Message.error("配仓失败")
        }
      }).catch(err => {
        this.$Message.error(err)
      })
    },
    modifyRemark() {
      if(this.isEditing){
        axios.post("/shop/admin/cloudstock/purchase/order/edit/inside/remark", {
          order_id: this.$route.query.order_id,
          remark: this.remark_inside
        }).then(res => {
          if(res.code == 200) {
            this.order_info.remark_inside = this.remark_inside
            this.$Message.success("保存成功")
            this.isEditing = false
          } else {
            this.$Message.error("保存失败")
          }
        })
      } else {
        this.remark_inside = this.order_info.remark_inside
        this.isEditing = true
      }
    },
    getOrderInfo() {
      this.$store.state.COMMON_loading = true
      axios.post('/shop/admin/cloudstock/purchase/order/info',{
        order_id: this.$route.query.order_id
      }).then(res => {
        if(res.code == 200){
          this.order_info = res.data.order_info
          this.product_list = res.data.product_list
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err)
      }).finally(() => {
        this.$store.state.COMMON_loading = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../css/my-theme/index";
.cloudstock-order-detail {
  padding: 24px !important;
  .flex-wrapper{
    display: flex;
    margin-bottom: 24px;
    .info-block{
      // min-width: 403px;
      width: calc(33.33% - 11px);
      border-radius:6px;
      overflow: hidden;
      border: 1px solid #DCDEE2;
      .title{
        color: #464c5b;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #F8F8F9;
        font-size: 13px;
        font-weight: bold;
        border-bottom: 1px solid #DCDEE2;
      }
      .content{
        position: relative;
        padding: 20px;
        font-size: 12px;
        color: #657180;
        height: calc(100% - 40px);
        .row{
          margin-bottom: 12px;
          .table-operation {
            margin-left: 15px;
          }
          .input-wrapper {
            position: relative;
            display: inline-block;
            width: 100%;
            .suffix {
              position:absolute;
              right: 10px;
              bottom: 0;
              color: #9EA4B1;
            }
            /deep/.ivu-input-wrapper{
              width: 100%;
              vertical-align: text-top;
              textarea{
                height: 82px;
                resize: none;
                padding-right: 40px;
              }
            }
          }
          .absolute {
            position: absolute;
            line-height: 0;
            margin-top: -5px;
            .img-wrapper {
              margin-right: 10px;
            }
          }
          &.flex {
            display: flex;
            align-items: flex-start;
            .key {
              flex-shrink: 0;
            }
            .remark {
              word-break: break-all;
            }
          }
          &:last-child {
            margin-bottom: 0px;
          }
        }
        .img-wrapper{
          display: inline-block;
        }
        .btn-wrapper{
          position: absolute;
          bottom: 0;
          left: 20px;
          width: calc(100% - 40px);
          height: 74px;
          line-height: 74px;
          text-align: center;
          /*border-top: 1px dashed #eee;*/
        }
      }
      &:not(:last-child){
        margin-right: 20px;
      }
    }
  }
  .row-span-table {
    /deep/ th{
      color: #464c5b;
    }
    /deep/ td{
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