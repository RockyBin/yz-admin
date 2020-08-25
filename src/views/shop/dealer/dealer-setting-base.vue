<template>
<div class="dealer-setting-base">
  <div class="container">
    <!--<switch-titlebar-->
        <!--style="margin: 0 0 24px 0;"-->
        <!--v-model="status"-->
        <!--title="是否开启经销商功能"-->
        <!--@on-change="warnUser"-->
    <!--/>-->
    <Form ref="form" :label-width="134">
      <verticalLineTitlebar :title="'经销商基础设置'"/>
      <FormItem label="货款打款对象：">
        <div class="dealer-setting-base-itme dealer-seting-base-ts">
          <RadioGroup v-model="purchases_money_target">
            <Radio :label="0">打款给公司</Radio>
            <more-message
              :text="'打款给公司：是指下级经销商的云仓进货货款\n先支付给公司，再由公司返款给上级经销商。'"
              style="margin-right: 20px;"
            ></more-message>
            <Radio :label="1">打款给上级</Radio>
            <more-message
              :max-width="400"
              :text="'打款给上级：若使用的支付方式是【余额支付】，则是指下级经销商\n的云仓进货货款先支付给公司，再由公司返款给上级；若使用的支付\n方式是【线下支付】，则货款直接支付给上级，货款不经过公司财务。'"
            ></more-message>
          </RadioGroup>
          <div class="tips" v-show="purchases_money_target === 1">*当上级是【公司】时，则支付给公司的方式则读取后台设置的【云仓进货单】的支付方式。</div>
        </div>
      </FormItem>
      <FormItem label="支付给上级方式：" v-show="purchases_money_target === 1">
        <div class="dealer-setting-base-itme">
          <RadioGroup v-model="pay_parent_type">
            <Radio :label="0">余额支付</Radio>
            <Radio :label="1">线下收款</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <FormItem label="经销商充值余额：">
        <div class="dealer-setting-base-itme dealer-seting-base-ts">
          <RadioGroup v-model="recharge_balance_target">
            <Radio :label="0">向公司充值</Radio>
            <more-message
              :text="'向公司充值：是指所有经销商充值时都直接把\n钱充值到公司账户，公司产生财务记录。'"
              style="margin-right: 20px;"
            ></more-message>
            <Radio :label="1">向上级充值</Radio>
            <more-message
              :max-width="400"
              :text="'向上级充值：是指当上级是公司时，直接把钱充值到公司账户；当为\n经销商时，下级把钱转给上级，上级完成充值审核后，系统从上级的\n余额账户把钱转到下级的账户。'"
            ></more-message>
          </RadioGroup>
        </div>
      </FormItem>
      <!--<FormItem label="加盟费打款对象：">-->
        <!--<div class="dealer-setting-base-itme dealer-seting-base-ts">-->
          <!--<RadioGroup v-model="initial_money_target">-->
            <!--<Radio :label="0">打款给公司</Radio>-->
            <!--<more-message-->
              <!--text="打款给公司：是指下级经销商把加盟费直接支付给公司。"-->
              <!--style="margin-right: 20px;"-->
            <!--&gt;</more-message>-->
            <!--<Radio :label="1">打款给上级</Radio>-->
            <!--<more-message-->
              <!--text="打款给上级：是指下级经销商把加盟费直接支付给上级经销商。"-->
            <!--&gt;</more-message>-->
          <!--</RadioGroup>-->
        <!--</div>-->
      <!--</FormItem>-->
      <FormItem label="物流运费：" :rules="rulesFreightTemplate" prop="select_freight">
        <div class="dealer-setting-base-itme">
          <more-message
            text="云仓提货时的物流运费，该【运费模式】应用于整个云仓提货的所有商品的物流运费。"
            style="margin-right: 14px;"
          ></more-message>
          <RadioGroup v-model="logistics_freight">
            <Radio :label="0">免运费</Radio>
            <Radio :label="1">买家承担运费</Radio>
          </RadioGroup>
          <div class="dealer-setting-base-select" v-show="logistics_freight">
            <Select class="common-input-text-310" not-found-text :transfer="true" @on-change="onSelectChange" v-model="select_freight">
              <Option v-for="(itme,index) in freightTemplate" :key="index" :value="itme.id">{{itme.template_name}}</Option>
            </Select>
            <Button type="primary" style="margin-left:5px;" class="common-row-btn" @click="$router.push({name: 'settingLogisticsList'})">新增</Button>
            <p style="font-size:12px;color: #FE3737;line-height: initial;position: absolute;">{{modalValidate}}</p>
          </div>
        </div>
      </FormItem>
    </Form>
  </div>
  <div class="footer">
    <Button type="primary" shape="circle" @click="saveSetting" perm="dealer.config.operate">保存</Button>
  </div>
</div>
</template>
<script>
import axios from "axios";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import FormItem from "iview/src/components/form/form-item";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
export default {
  components: {
      FormItem,
    moreMessage,
    verticalLineTitlebar
  },
  data(){
    const validateFreightTemplate = (rule,value,callback) => {
        if (!this.logistics_freight){
            return callback();
        }
        if (!this.select_freight) {
            this.modalValidate = "请选择运费模板";
            return callback();
        }else{
            this.modalValidate = '';
            return callback();
        }
    }
    return {
      status: 1,
      logistics_freight:0,//物流运费
      freightTemplate:{},//运费模板
      select_freight:0,//选中模板
      purchases_money_target:0,//货款打款对象
      pay_parent_type: 1, // 上级打款的支付方式
      recharge_balance_target: 0, // 经销商充值余额
      // initial_money_target:0,//加盟费打款对象
      formFields:{
        discount:null
      },
      modalValidate:'',
      rulesFreightTemplate: [{validator: validateFreightTemplate, trigger: "blur"}],
    }
  },
  created(){
    this.getSetting();
    this.getFreightTemplate()
  },
  methods: {
    // warnUser(enable) {
    //   if(!enable){
    //     this.$nextTick(() => {
    //       this.status = 1;
    //     })
    //     this.$Modal.confirm({
    //         title: "提示",
    //         content: "若关闭了经销商功能，数据仍然保留；经销商将不能再访问<经销商中心>页面，是否确定关闭？",
    //         onOk: () => {
    //             this.status = 0;
    //         }
    //     })
    //   }
    // },
    getSetting(){
      this.$store.state.COMMON_loading = true;
      axios.get("/shop/admin/dealer/basesetting/info").then(res => {
        if(res.code == 200){
          if (res.data.freight_id){
              this.logistics_freight = 1;
          }else{
              this.logistics_freight = 0;
          }
          this.select_freight = res.data.freight_id;
          this.status = res.data.status;
          // this.initial_money_target = res.data.initial_money_target;
          this.purchases_money_target = res.data.purchases_money_target;
          this.recharge_balance_target = res.data.recharge_balance_target;
          this.pay_parent_type = res.data.pay_parent_type;
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err)
      }).finally(() => {
        this.$store.state.COMMON_loading = false;
      })
    },
    getFreightTemplate(){
        this.$store.state.COMMON_loading = true;
      axios.get("/shop/admin/freighttemplate/get/freight").then(res => {
          this.freightTemplate = res
      }).catch(err => {
          this.$Message.error(err)
      }).finally(() => {
          this.$store.state.COMMON_loading = false;
      })
    },
    onSelectChange(e) {
        this.select_freight = e;
    },
    saveSetting() {
      this.$refs.form.validate(valid => {
        if(valid){
            if (this.logistics_freight&&!this.select_freight){
                this.$Message.error("保存失败")
                return;
            }
          this.$store.state.COMMON_loading = true;
          axios.post("/shop/admin/dealer/basesetting/edit",{
            status: this.status,
            purchases_money_target:this.purchases_money_target,
            recharge_balance_target: this.recharge_balance_target,
            pay_parent_type: this.pay_parent_type,
            // initial_money_target:this.initial_money_target,
            freight_id:this.logistics_freight?this.select_freight:0,
          }).then(res => {
            this.$store.state.COMMON_loading = false;
            if(res.code == 200){
              this.modalValidate = '';
              this.$Message.success("保存成功")
            } else {
              this.$Message.error(res.msg)
            }
          }).catch(err => {
            this.$Message.error(err)
          })
        } else {
          this.modalValidate = '';
          this.$Message.error("保存失败")
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .dealer-setting-base{
    .container{
      padding: 24px;
      height: calc(100vh - 120px);
      overflow: auto;
      .vertical-line-titlebar-wrapper{
        margin-bottom: 20px;
        color: #464C5B;
      }
      .ivu-alert {
        line-height: 21px;
        /deep/.ivu-alert-icon {
          top: 14px;
        }
        .desc {
          margin-bottom: 4px;
          line-height: 21px;
          &:last-child {
            margin-bottom: 0;
            margin-top: 20px;
          }
        }
      }
      .tips{
        color: #9EA7B4;
        line-height:1.5;
      }
      /deep/.ivu-checkbox-wrapper{
        margin-right: 20px;
        color: #657180;
        .ivu-checkbox{
          margin-right: 5px;
        }
      }
      /*.ivu-form{*/
        /*&>.ivu-form-item:nth-child(2){*/
          /*margin-bottom: 0 !important;*/
        /*}*/
      /*}*/
      /deep/.ivu-form-item{
        .ivu-form-item-label{
          color: #657180;
        }
      }
      .form-content{
        position: relative;
        padding-left: 30px;
        .more-message{
          position:absolute;
          left:0;
        }
        .dealer-setting-discount{
          /deep/.ivu-form-item-error-tip{
            left: -5px;
          }
        }
        /deep/.ivu-form-item-error-tip{
          /*left: -5px;*/
          padding: 0;
          margin-top: 3px;
        }
        /deep/.ivu-radio-wrapper{
          margin-right:20px;
          color: #657180;
        }
        /deep/.ivu-form-item{
          display: inline-block;
          margin:0 5px;
          .ivu-form-item-label{
            color: #657180;
          }
        }
      }
      .dealer-setting-base-itme {
        text-align: left;
        /deep/.ivu-radio-wrapper {
          margin-right: 20px;
          color: #657180;
        }
        /deep/.iconfont{
          color: #657180;
        }
        .tip {
          font-size: 12px;
          color: #9ea4b1;
          line-height: 1;
        }
        .dealer-setting-base-select{
          margin-top: 10px;
          .common-input-text-310{
            width: 279px;
            color: #657180 !important;
          }
          .common-row-btn{
            width: 58px;
            height: 32px;
          }
        }
      }
      .dealer-seting-base-ts{
        /deep/.ivu-radio-wrapper {
          margin-right: 5px;
        }
      }
    }
    .footer{
      height:50px;
      line-height:50px;
      text-align:center;
      border-top:1px solid #eee;
      .ivu-btn{
        width: 70px;
      }
    }
  }
</style>