<template>
<div class="mall-container">
  <thirdMenu :list="thirdMenu"/>
  <div class="container">
    <Form ref="formValidate" :model="formValidate" class="mall-add">
      <div class="level-news">
        <switch-titlebar
          style="margin-bottom: 20px;"
          :value="1"
          :switchShow="false"
          hasBorder
          title="订单流程设置"
        >
          <div>
            <FormItem label="未支付订单：" :label-width="102" class="margin-bottom-form">
              <InputNumber
                v-model="formValidate.nopay_close_day"
                :min="0"
                :precision="0"
                :max="90"
                class="common-input-text-60"
              ></InputNumber>
              <label class="label-margin-common">天</label>
              <InputNumber
                v-model="formValidate.nopay_close_hour"
                :max="24"
                :precision="0"
                :min="0"
                class="common-input-text-60"
              ></InputNumber>
              <label class="label-margin-common">小时</label>
              <InputNumber
                v-model="formValidate.nopay_close_minute"
                :max="60"
                :precision="0"
                :min="0"
                class="common-input-text-60"              
              ></InputNumber>
              <label class="close-time">分钟自动关闭</label>
              <more-message :text="content[0]" class="prompt"></more-message>
            </FormItem>
            <FormItem label="已发货订单：" :label-width="102" prop="ordersend_success_day" class="margin-bottom-form">
              <InputNumber
                v-model="formValidate.ordersend_success_day"
                :min="1"
                :max="90"
                class="common-input-text-60"
              ></InputNumber>
              <label class="label-margin-left">天后自动确认收货,交易完成</label>
              <more-message :text="content[1]" class="prompt"></more-message>
            </FormItem>
          </div>
        </switch-titlebar>
        <switch-titlebar
          style="margin-bottom: 0px;"
          v-model="formValidate.aftersale_isopen"
          :true-value="1" 
          :false-value="0"
          hasBorder
          title="是否开启售后设置功能"
          @on-change="noticeUser"
        >
        <!-- <i-switch :true-value="1" :false-value="0" v-model="formValidate.aftersale_isopen" @on-change="noticeUser">
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch> -->
          <div v-if="formValidate.aftersale_isopen">
            <FormItem label="维权期：" :label-width="102" prop="ordersend_close_day" class="margin-bottom-form">
              <label class="label-margin-right">确认收货后</label>
              <InputNumber
                v-model="formValidate.ordersend_close_day"
                :min="1"
                :max="90"
                class="common-input-text-60"              
              ></InputNumber>
              <label class="label-margin-left">天后关闭退款/退货功能</label>
              <more-message :text="content[2]" class="prompt"></more-message>
            </FormItem>
          </div>
        </switch-titlebar>
      </div>
    </Form>
    <Modal v-model="showModal" class="after-sale-setting-modal" :width="506" @on-ok="formValidate.aftersale_isopen=0">
      <Icon size="34" color="#ed4014" type="ios-help-circle"></Icon>
      <span style="font-size:16px;font-weight:bold;margin-left:12px;vertical-align:middle">提示</span>
      <div style="font-size:13px;padding-left:46px;margin-top:4px;">
        <p style='margin-bottom:8px;'>关闭售后功能后，系统将发生以下变化：</p>
        <p>1.系统不再存在维权期，订单“成交”数据展示的是订单完成后的数据</p>
        <p>2.设置了以【维权期后】为计算条件的，自动变更为【付款后】统计</p>
        <p>3.用户不能再申请售后，但之前已经申请的售后订单和数据还存在</p>
      </div>
    </Modal>
    <div class="footer">
      <Button type="primary" shape="circle" @click="onSaveStart" perm="order.config.operate">保存</Button>
    </div>
  </div>
</div>
</template>
<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import thirdMenuData from "./components/third-menu-for-setting-mall";
export default {
  components: { footButton, verticalLineTitlebar, moreMessage, thirdMenu, switchTitlebar},
  data() {
    return {
      showModal:false,
      content: [
        "最长可设置90天",
        "最长可设置90天",
        "买家可在确认收货后进行退款/退货申请，逾期不能申请。最长可设置90天"
      ],
      imageIsError: false,
      formValidate: {
        aftersale_isopen:1,
        nopay_close_minute: 0,
        nopay_close_hour: 0,
        nopay_close_day: 0,
        ordersend_success_day: 0,
        ordersend_close_day: 7
      },
      thirdMenu: []
    };
  },
  methods: {
    noticeUser(){
     if(this.formValidate.aftersale_isopen==1){
       this.$nextTick(()=>{
         this.formValidate.aftersale_isopen=1;
       })
      //  this.$Modal.confirm({
      //    title:"提示",
      //    content:"<p style='margin-bottom:8px;'>关闭售后功能后，系统将发生以下变化：</p>1.系统不再存在维权期，订单“成交”数据展示的是订单完成后的数据<br/>2.设置了以【维权期后】为计算条件的，自动变更为【付款后】统计<br/>3.用户不能再申请售后，但之前已经申请的售后订单和数据还存在",
      //    onOk:()=>{
      //      this.formValidate.aftersale_isopen=0;
      //    }
      //  })
      this.showModal=true;
     }
    },
    // 获取表单数据
    getData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/orderconfig/info", "", res => {
        this.$store.state.COMMON_loading = false;
        this.formValidate = res.data;
      });
    },
    // 保存
    onSaveStart() {
      if (this.formValidate.nopay_close_day === null) {
        this.formValidate.nopay_close_day = 0;
      }
      if (this.formValidate.nopay_close_hour === null) {
        this.formValidate.nopay_close_hour = 0;
      }
      if (this.formValidate.nopay_close_minute === null) {
        this.formValidate.nopay_close_minute = 0;
      }
      if (
        this.formValidate.nopay_close_day > 0 ||
        this.formValidate.nopay_close_hour > 0 ||
        this.formValidate.nopay_close_minute > 0
      ) {
        this.$httpGet(
          "/shop/admin/orderconfig/edit",
          this.formValidate,
          res => {
            if (res.code === 200) {
              this.$Message.success("保存成功");
              this.getData();
            } else {
              this.$Message.error("保存失败");
            }
          }
        );
      } else {
        this.$Message.error("保存失败, 未支付订单不能全部为0");
      }
    }
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getData();
  }
};
</script>
<style lang="less" scoped>
.mall-container {
  position: absolute;
  width: 100%;
  height: calc(100vh - 132px);
  background: #f2f4fd;
  display: flex;
  .container {
    height: 100%;
    flex: 1;
  }
}
.container {
  
  /deep/.more-message {
    display:inline-block;
    i.iconfont {
      margin-top: -3px;
      display: inline-block;
    }
  }
  .mall-add {
    padding: 24px;
    text-align: left;
    overflow: auto;
    height: calc(100vh - 120px);
    background: white;
    .level-news {
      /deep/.ivu-form-item-label {
        width: 120px;
        padding-right:10px;
      }
      .close-time {
        margin-left: 12px;
      }
      .padding-form{
        padding-top: 20px;
        padding-bottom:24px;
      }
    }
  }
}
.label-margin-common {
  margin: 0 12px;
}
.label-margin-right{
  margin-right:10px
}
.label-margin-left {
  margin-left: 10px;
}
.footer {
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #eee;
  background: white;
  .ivu-btn-primary {
    width: 70px;
    height: 32px;
  }
}
</style>
<style lang="less">
  .after-sale-setting-modal{
    /deep/.ivu-modal-footer{
      border:none;
    }
  }
</style>