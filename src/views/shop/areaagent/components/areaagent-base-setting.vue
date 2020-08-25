<template>
  <div class="distributor-base-setting" v-show="!$store.state.COMMON_loading">
    <Form
        ref="formValidateBase"
        :model="formValidate"
        :label-width="120"
        class="form-full-wrapper"
    >
      <alert-warning>
        <p>1.区域划分原则：以收货地址为导向划分省市区，当用户购买产品并收货地址是属于该代理商的区域管辖范围，则可得到相应的区域返佣。 </p>
        <p>2.当一个订单中只有虚拟商品，由于虚拟商品没有收货地址，故暂不参与区域返佣。</p>
      </alert-warning>
      <switch-titlebar
          style="margin: 24px 0 24px;"
          v-model="enableDistribute"
          :true-value="true"
          :false-value="false"
          title="是否开启区域代理功能"
          @on-change="confirm"
      />
      <div v-show="enableDistribute">
        <!-- 基础设置 -->
        <!-- <verticalLineTitlebar :title="'基础设置'"/> -->
        <FormItem label="返佣发放节点：" prop="internal_purchase" class="form-height">
          <div class="distributor-setting-item">
            <more-message
                :maxWidth="326"
                :text="'付款后，则<区域订单返佣>的节点为订单成功付款后发放，维权期后则过了维权期才发放。'"
                style="margin-right: 14px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.commision_grant_time" @on-change="noticeUser">
              <Radio :label="0">付款后</Radio>
              <Radio :label="1">维权期后</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="返佣计算基准：" class="form-height">
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="formValidate.commision_type">
              <Radio :label="0">按商品利润计算</Radio>
              <Radio :label="1">按商品实付销售价计算</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="自购分佣：" class="form-height">
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="formValidate.internal_purchase">
              <Radio :label="1">是</Radio>
              <Radio :label="0">否</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="自购业绩：" class="form-height">
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="formValidate.internal_purchase_performance">
              <Radio :label="1">计算到区域代理订单业绩</Radio>
              <Radio :label="0">不计算到区域代理订单业绩</Radio>
            </RadioGroup>
          </div>
        </FormItem>
      </div>
    </Form>

    <foot-button
        @onSaveClick="onSaveClick"
        :loading="loadingStatus"
        perm="distributor.config.operate"
    ></foot-button>
  </div>
</template>

<script>
  import footButton from "@/views/shop/components/button/foot-button.vue";
  import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
  import moreMessage from "@/views/shop/components/more-message/more-message.vue";
  import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
  import alertWarning from "@/views/shop/components/alert/alert-warning.vue"

  export default {
    data() {
      return {
        loadingStatus: false,
        enableDistribute: true,
        formValidate: {
          commision_grant_time: 1, // 返佣发放节点:
          commision_type:0, //返佣计算基准
          internal_purchase:1, //自购分佣
          internal_purchase_performance:1, //自购业绩
        },
        aftersale_isopen:1, //订单设置--售后设置是否开启
      };
    },
    components: {
      footButton,
      alertWarning,
      moreMessage,
      switchTitlebar
    },
    mounted() {
      this.$store.state.COMMON_loading = true;
      this.getDistributeInfo();
    },
    methods: {
      noticeUser(){
        if(this.formValidate.commision_grant_time==0){
          this.$nextTick(()=>{
            this.formValidate.commision_grant_time=1
          })
          this.$Modal.confirm({
            title:"提示",
            content:"切换为【付款后】发放返佣后，只会影响到新订单，旧订单的预计返佣数据不自动处理，是否确定要切换？",
            onOk:()=>{
              this.formValidate.commision_grant_time=0;
            }
          })
        }
        if(this.formValidate.commision_grant_time==1&&!this.aftersale_isopen) {
          this.$nextTick(() => {
            this.formValidate.commision_grant_time = 0
          })
          this.$Modal.confirm({
            title: "提示",
            okText: "前往设置",
            content: "前往【订单设置>售后设置】开启售后功能并设置维权期，即可使用维权期后的功能。",
            onOk: () => {
              this.$router.push("/setting/mall/order");
            }
          })
        }
      },
      /**
       * 保存信息
       */
      async onSaveClick() {
        let data = Object.assign({}, this.formValidate);
        if (this.enableDistribute){
          data.status = 1
        } else{
          data.status = 0
        }
        this.loadingStatus = true;
        this.http({
          url: "/shop/admin/area/agent/basesetting/edit",
          method: "POST",
          data
        })
          .then(res => {
            if (res.code == 200) {
              this.$Message.success(this.$store.state.SUCCESS_MSG);
            } else {
              this.$Message.error(res.msg);
            }
          })
          .finally(() => {
            this.loadingStatus = false;
          });
      },
      /**
       * 获取分销信息
       */
      getDistributeInfo() {
        this.$httpGet(
          "/shop/admin/area/agent/basesetting/info",
          null,
          async res => {
            if (res.code == 200) {
              let returnData = res.data;
              if (returnData.status){
                this.enableDistribute = true
              } else{
                this.enableDistribute = false
              }
              this.formValidate = {
                commision_grant_time: Number(returnData.commision_grant_time),//返佣发放节点
                commision_type:Number(returnData.commision_type),//返佣计算基准
                internal_purchase:Number(returnData.internal_purchase),//自购分佣
                internal_purchase_performance:Number(returnData.internal_purchase_performance)//自购业绩
              };
              this.aftersale_isopen=Number(returnData.aftersale_isopen);
            } else {
              this.$Message.error(res.msg)
            }
            this.$store.state.COMMON_loading = false;
          }
        );
      },
      // 判断vue是否还存在，防止快速切换路由后请求回调还在执行这种极端的情况下找不到ue导致报错
      getUEExist() {
        return this.$refs["editor"] && this.$refs["editor"].ue;
      },
      /**
       * 获取弹窗里面的数据
       */
      onModalProductData(data) {
        this.notProductSelectData = data;
      },
      /**
       * 关闭弹窗时的弹窗提醒
       */
      confirm(val) {
        if (!val) {
          this.$nextTick(() => {
            this.enableDistribute = true;
            this.$Modal.confirm({
              title: "提示",
              content:
                "若关闭了区域分红功能，不影响历史区域订单返佣，但不会再产生新的相关返佣；旧数据仍然保留；区域代理不能访问<区域代理>页面，是否确定关闭？",
              onOk: () => {
                this.enableDistribute = false;
              }
            });
          });
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  @radio-right: 20px;

  .distributor-base-setting {
    position: relative;
    height: calc(100% - 70px);
    .first-item {
      margin-top: 30px;
    }
    .form-height {
      height: 32px;
    }
    .wrapper {
      padding: 20px 0;
      background: #f5f6f7;
      margin-bottom: 24px;
      /deep/.ivu-form-item {
        margin-bottom: 0 !important;
      }
      /deep/.ivu-form-item-label {
        font-weight: bold;
        font-size: 13px;
        margin: 0 14px;
        width: auto !important;
        padding: 0 !important;
        line-height: 32px;
      }
      /deep/.ivu-form-item-content {
        margin-left: 0 !important;
      }
    }
    .vertical-line-titlebar-wrapper {
      margin-top: 10px;

      & ~ .vertical-line-titlebar-wrapper {
        margin-top: 24px;
      }
    }

    .distributor-setting-mb10 {
      margin-bottom: 16px;
    }

    .distributor-setting-item {
      text-align: left;

      /deep/.ivu-radio-wrapper {
        margin-right: @radio-right;
        color: #464C5B;
        .ivu-radio{
          margin-right: 5px;
        }
      }
      .tip {
        font-size: 12px;
        color: #9ea4b1;
        line-height: 1;
        margin-left: 30px;
        span {
          color: #3352D9;
          cursor: pointer;
        }
      }
      .distributor-setting-item-submitinfo {
        height: 32px;
        margin-bottom: 14px;

        /deep/.ivu-checkbox-group {
          display: inline-block;
          margin-left: 12px;
          height: 32px;
          vertical-align: middle;
        }

        /deep/input {
          color: #9ea4b1;

          &:disabled {
            cursor: default;
            background-color: #fff;
          }
        }
      }
    }
  }
</style>
