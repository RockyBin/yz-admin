<template>
  <div class="distributor-base-setting" v-show="!$store.state.COMMON_loading">
    <Form
      ref="formValidateBase"
      :model="formValidate"
      :label-width="120"
      class="form-full-wrapper"
    >
      <switch-titlebar
        style="margin: 0 0 24px;"
        v-model="enableDistribute"
        :true-value="true"
        :false-value="false"
        title="是否开启分销功能"
        @on-change="confirm"
      />
      <div v-show="enableDistribute">
        <!-- 基础设置 -->
        <!-- <verticalLineTitlebar :title="'基础设置'"/> -->
        <FormItem label="分销层级：" prop="level" class="first-item">
          <div class="distributor-setting-item">
            <more-message
              :maxWidth="326"
              :text="'当分销层级发生变化，对应的佣金级也跟着增加/减少。\n如：设置了二级分销，分佣级别只有一级和二级佣金生效。'"
              style="margin-right: 14px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.level">
              <Radio :label="1">一级分销</Radio>
              <Radio :label="2">二级分销</Radio>
              <Radio :label="3">三级分销</Radio>
            </RadioGroup>
            <p
              class="tip"
            >*默认佣金比例请到 <span @click="$router.push({name: 'distributorLevel'})">分销商等级</span> 进行设置</p>
          </div>
        </FormItem>
        <FormItem label="分销内购：" prop="internal_purchase" class="form-height">
          <div class="distributor-setting-item">
            <more-message
              :maxWidth="326"
              :text="'开启分销内购，分销商自己购买商品，享受一级佣金，\n上级享受二级佣金，上上级享受三级佣金'"
              style="margin-right: 14px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.internal_purchase">
              <Radio :label="1">开启</Radio>
              <Radio :label="0">关闭</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="自购业绩：" class="form-height">
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="formValidate.calc_performance_valid_condition">
              <Radio :label="1">计算到分销订单业绩</Radio>
              <Radio :label="0">不计算到分销订单业绩</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="分销分佣节点：" class="form-height">
          <div class="distributor-setting-item">
            <more-message
                :maxWidth="326"
                text="付款后，则<分销佣金发放>的节点为订单成功付款后产生，维权期后则过了维权期才产生。"
                style="margin-right: 14px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.calc_commission_valid_condition" @on-change="noticeUser">
              <Radio :label="0">付款后</Radio>
              <Radio :label="1">维权期后</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="等级升级节点：" class="form-height">
          <div class="distributor-setting-item">
            <more-message
                :maxWidth="326"
                text="付款后，则<分销商等级升级>的节点为订单成功付款后升级，维权期后则过了维权期才升级。"
                style="margin-right: 14px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.calc_upgrade_valid_condition" @on-change="showModal(1)">
              <Radio :label="0">付款后</Radio>
              <Radio :label="1">维权期后</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem label="加盟申请节点：" class="form-height">
          <div class="distributor-setting-item">
            <more-message
                :maxWidth="326"
                text="付款后，则<分销商加盟申请>的节点为订单成功付款后符合条件申请，维权期后则过了维权期才符合条件申请。"
                style="margin-right: 14px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.calc_apply_valid_condition" @on-change="showModal(2)">
              <Radio :label="0">付款后</Radio>
              <Radio :label="1">维权期后</Radio>
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

export default {
  data() {
    return {
      loadingStatus: false,
      enableDistribute: true,
      formValidate: {
        level: 3, // 分销层级
        internal_purchase: 0, // 分销内购
        calc_performance_valid_condition:1, //自购业绩：0 付款后；1 维权期后；
        calc_commission_valid_condition:1, //分销分佣节点：0 付款后；1 维权期后；
        calc_upgrade_valid_condition:1, //等级升级节点：0 付款后；1 维权期后；
        calc_apply_valid_condition:1, //加盟申请节点：0 付款后；1 维权期后；
      },
      aftersale_isopen:1, //订单设置--售后设置是否开启
    };
  },
  components: {
    footButton,
    verticalLineTitlebar,
    moreMessage,
    switchTitlebar
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.getDistributeInfo();
  },
  methods: {
    noticeUser(){
      if(this.formValidate.calc_commission_valid_condition==0){
        this.$nextTick(()=>{
          this.formValidate.calc_commission_valid_condition=1
        })
        this.$Modal.confirm({
          title:"提示",
          content:"切换为【付款后】发放佣金后，只会影响到新订单，旧订单的预计佣金数据不自动处理，是否确定要切换？",
          onOk:()=>{
            this.formValidate.calc_commission_valid_condition=0;
          }
        })
      }
      if(this.formValidate.calc_commission_valid_condition==1&&!this.aftersale_isopen){
        this.$nextTick(()=>{
          this.formValidate.calc_commission_valid_condition=0
        })
        this.$Modal.confirm({
          title:"提示",
          okText:"前往设置",
          content:"前往【订单设置>售后设置】开启售后功能并设置维权期，即可使用维权期后的功能",
          onOk:()=>{
            this.$router.push("/setting/mall/order");
          }
        })
      }
    },
    showModal(type){
      if (type === 1){
        if(this.formValidate.calc_upgrade_valid_condition==1&&!this.aftersale_isopen){
          this.$nextTick(()=>{
            this.formValidate.calc_upgrade_valid_condition=0
          })
          this.$Modal.confirm({
            title:"提示",
            okText:"前往设置",
            content:"前往【订单设置>售后设置】开启售后功能并设置维权期，即可使用维权期后的功能",
            onOk:()=>{
              this.$router.push("/setting/mall/order");
            }
          })
        }
      }
      if (type === 2){
        if(this.formValidate.calc_apply_valid_condition==1&&!this.aftersale_isopen){
          this.$nextTick(()=>{
            this.formValidate.calc_apply_valid_condition=0
          })
          this.$Modal.confirm({
            title:"提示",
            okText:"前往设置",
            content:"前往【订单设置>售后设置】开启售后功能并设置维权期，即可使用维权期后的功能",
            onOk:()=>{
              this.$router.push("/setting/mall/order");
            }
          })
        }
      }
    },
    /**
     * 保存信息
     */
    async onSaveClick() {
      let level = this.formValidate.level;
      if (!this.enableDistribute) {
        this.formValidate.level = 0;
      }
      let data = Object.assign({}, this.formValidate);
      this.formValidate.level = level;
      this.loadingStatus = true;
      this.http({
        url: "/shop/admin/distribution/setting/base/edit",
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
        "/shop/admin/distribution/setting/base/info",
        null,
        async res => {
          if (res.code == 200) {
            let returnData = res.data;
            this.formValidate = {
              internal_purchase: Number(returnData.internal_purchase),
              calc_apply_valid_condition:Number(returnData.calc_apply_valid_condition),
              calc_commission_valid_condition:Number(returnData.calc_commission_valid_condition),
              calc_performance_valid_condition:Number(returnData.calc_performance_valid_condition),
              calc_upgrade_valid_condition:Number(returnData.calc_upgrade_valid_condition)
            };
            this.aftersale_isopen=Number(returnData.aftersale_isopen);
            if (returnData.level == 0) {
              this.enableDistribute = false;
              this.formValidate.level = 3;
            } else {
              this.formValidate.level = Number(returnData.level);
            }
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
              "若关闭了商城的分销功能，不会影响已经产生分销佣金的订单，但通过分销链产生的新的订单将不会再进行分佣，分销商也不能再访问<分销中心>，但分销数据仍然保留，是否确定关闭？",
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
