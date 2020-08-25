<template>
  <div>
    <div
      class="order-sele"
      :class="{'is-height':detailsList.after_sale_status === 3 && detailsList.receive_status === 1}"
    >
      <div class="order-sele-head">售后情况</div>
      <div class="order-sele-container">
        <div>
          <label>售后单号：</label>
          <label>{{detailsList.id}}</label>
        </div>
        <div>
          <label>申请时间：</label>
          <label>{{detailsList.created_at}}</label>
        </div>
        <div>
          <label>售后类型：</label>
          <label>{{ detailsList.type}}</label>
        </div>
        <div>
          <label>售后状态：</label>
          <label>{{ detailsList.status_text }}</label>
        </div>
        <div>
          <label v-if="detailsList.type_status === 0">退款原因：</label>
          <label v-else>退货原因：</label>
          <label>{{detailsList.reason}}</label>
        </div>
        <div>
          <label v-if="detailsList.type_status === 0">退款说明：</label>
          <label v-else>退货说明：</label>
          <label>{{detailsList.content}}</label>
        </div>
        <div>
          <label>上传图片：</label>                    
            <template v-for="(item, index) in detailsList.images">
              <div class="upload-image" :key="index" :class="{'common-ml-10': index > 0}">
                <img v-if="item" :src="$store.state.siteComdataPath + item"  class="upload">
                <div class="upload-background">
                  <Icon type="ios-eye-outline" @click.native="onShowLargeImageClick(item)" class="upload-icon"></Icon>
                </div>                
              </div>
            </template>                                           
        </div>
        <div class="check-image" v-if="detailsList.images">
          <label>(点击查看大图)</label> 
        </div>
        <div v-if="[4, 5, 6, 7].indexOf(detailsList.after_sale_status) !== -1 && detailsList.return_logistics_no" class="order-logistics">
           <div>
            <label>寄回商品：</label>            
          </div>
          <div>
            <label>物流公司：</label>
            <label>{{detailsList.return_logistics_name}}</label>
          </div>
          <div>
            <label>物流单号：</label>
            <label>{{detailsList.return_logistics_no}}</label>&nbsp;&nbsp;
            <label class="table-operation" @click="onCheckLogistics">查看物流</label>
          </div>
          <div>
            <div style="color: #ED9218;" v-if="detailsList.after_sale_status === 4 && detailsList.supplier_member_id" >待供应商确认收货</div>
            <Button type="primary" @click="onConfrimGoods" v-if="detailsList.after_sale_status === 4  && !detailsList.supplier_member_id" perm="order.after-sale.operate">确认收货</Button>
            <Button type="primary" @click="onAudit" v-if="detailsList.after_sale_status === 6" perm="finance.operate">审核</Button>
          </div>          
        </div>
      </div>
      <div
        class="order-sele-audit"
        v-if="[1, 2, 5, 7, 8].includes(detailsList.after_sale_status)"
      >
        <Button type="primary" @click="onAudit" v-if="detailsList.after_sale_status === 1 || detailsList.after_sale_status === 2" :perm="getAuditPerm()">审核</Button>
        <div v-if="detailsList.after_sale_status === 8" class="refund-money">
          <label>关闭原因：</label>
          <label>买家撤销申请</label>
        </div>
        <div v-if="detailsList.after_sale_status === 7" class="refund-money">
          <label>拒绝原因：</label>
          <label>{{detailsList.refuse_msg}}</label>
        </div>
        <div v-if="detailsList.after_sale_status === 5" class="refund-money">
          <div>
            <label>实际退款金额：</label>
            <label>￥{{detailsList.real_money}}</label>
          </div>
          <div>
            <label>退款状态：</label>
            <label>{{ detailsList.status_text }}</label>
            <!-- <label>{{commonFunction.matchName(detailsList.after_sale_status, constants.refundStatus)}}</label> -->
          </div>
        </div>
      </div>
    </div>
    <order-model
      :isShowModal="isShowModal"
      :formItem="formItem"
      :amountPay="detailsList.actual_amount"
      :types="detailsList.type_status"
      :status="detailsList.after_sale_status"
      :detail="detailsList"
      :productList="detailsList.products"
      @cancelButton="cancelButton"
      @confrimButton="confrimButton"
      :buttonLoading="buttonLoading"
    ></order-model>
    <order-logistics
      :iframeSrc="detailsList.return_logistics_web"
      :logisticsValue="logisticsValue"
      @onCancel="clickCancel"
    ></order-logistics>
    <Modal v-model="visible" class="image-modal">
      <p slot="header"></p>
      <img :src="$store.state.siteComdataPath + imgName" v-if="visible">     
    </Modal>
    <Modal
      v-model="imageModalStatus"
      class="distributor-verify-expand-image-view"
      footer-hide
      fullscreen
    >
      <div slot="header" style="display:none">
      </div>
      <img v-if="imageViewUrl" :src="$store.state.siteComdataPath + imageViewUrl" alt>
    </Modal>
  </div>
</template>
<script>
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
import orderLogistics from "@/views/shop/components/modal/modal-logistics.vue";
import orderModel from "./order-model.vue";
export default {
  components: { orderLogistics, orderModel },
  props: {
    detailsList: {
      type: Object,
      default: () => {}
    },
    saleId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      buttonLoading: false,
      imageModalStatus: false,
      imageViewUrl: "",
      imgName: "",
      visible: false, // 默认不显示大图
      types: 0, // 退货或退款
      constants,
      commonFunction,
      logisticsValue: false,
      isShowModal: false, // 审核弹框
      formItem: {
        refundStatus: 1, // 退款状态
        refundAmount: 0,
        about: "" // 备注
      }
    };
  },
  methods: {
    /**
     * 放大图片
     */
    onShowLargeImageClick(url) {
      this.imageViewUrl = url;
      this.$nextTick(() => {
        this.imageModalStatus = true;
      });
    },
    clickCancel() {
      this.logisticsValue = false;
    },
    onCheckLogistics() {
      this.logisticsValue = true;
    },
    // 审核
    onAudit() {
      this.isShowModal = true;
    },
    // 确认
    confrimButton() {
      let obj = {};
      obj.status = this.formItem.refundStatus;
      obj.id = this.detailsList.id;
      if (this.formItem.refundStatus === 1) {
        obj.money = this.formItem.refundAmount;
        this.refundFunction(obj);
      } else {
        obj.refuse_msg = this.formItem.about;
        this.refundFunction(obj);
      }
    },
    // 退款
    refundFunction(obj) {
      this.buttonLoading = true;
      this.$httpPost("/shop/admin/aftersale/edit", obj, res => {
        this.buttonLoading = false;
        if (res.code === 200) {
          this.$Message.success("提交成功");
          this.$emit("updateList", this.detailsList.id);
        }
        this.isShowModal = false;
      });
    },
    // 取消
    cancelButton() {
      this.isShowModal = false;
    },
    // 确认收货
    onConfrimGoods() {
      this.$Modal.confirm({
        title:"提示",
        content:"是否确定收货？",
        onOk:()=>{
          this.$httpPost(
            "/shop/admin/aftersale/edit",
            { id: this.detailsList.id },
            res => {
              if (res.code === 200) {
                this.$Message.success("收货成功");
                this.$emit("updateList", this.detailsList.id);
              }
            }
          );
        }
      })
    },
    getAuditPerm() {
      return this.detailsList.after_sale_status === 2
        ? "order.after-sale.operate"
        : "finance.operate";
    }
  }
};
</script>
<style lang="less" scoped>
.order-sele {
  position: relative;
  display: inline-block;
  height: 100%;
  width: 100%;
  border: 1px solid #dddee1;
  border-radius: 6px;
  overflow: hidden;
  .order-sele-head {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #f8f9fd;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
  }
  .order-sele-container {
    padding: 0 25px;
    width: 100%;
    font-size: 12px;
    color: #657180;
    .order-logistics {
      border-top: 1px solid #d1d1d1;
    }
    div {
      margin-top: 15px;
    }
    div.check-image {
      margin-top: -20px;
      padding-left: 62px;
    }
    div:last-child {
      margin-bottom: 25px;
    }
  }
  .order-sele-audit {
    border-top: 1px solid #d1d1d1;
    width: calc(100% - 50px);
    margin-left: 25px;
    .refund-money {
      padding: 30px 0;
      div:first-child {
        margin-bottom: 10px;
      }
    }
    button {
      background: rgba(74, 106, 245, 1);
      color: #fff;
      margin: 20px 0;
    }
  }
  .upload-image {
    position: relative;
    display: inline-block;
    .upload {
      width: 60px;
      height: 60px;
      vertical-align: top;
    }
    .upload-background {
      display: none;
      position: absolute;
      top: -15px;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    }
  }
  .upload-image:hover {
    .upload-background {
      background: rgba(0, 0, 0, 0.6);
      display: block;
      .upload-icon {
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 18px 18px;
      }
    }
  }
}
.is-height {
  // height: 402px;
  .table-operation {
    margin-left: 5px;
  }
}
.distributor-verify-expand-image-view {
  /deep/.ivu-modal-content {
    .ivu-modal-header {
      border-color: transparent;
      color: #000;
    }

    .ivu-modal-body img {
      max-width: 800px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
