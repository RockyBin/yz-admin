<template>
  <div class="expand-finances">
    <template v-for="(item, index) in detailsData">
      <div :key="index">
        <div class="common-width">
          <div class="p-t-20">会员信息：</div>
          <div>
            <label>ID：</label>
            <label>{{ item.member_id }}</label>
          </div>
          <div>
            <label>昵称：</label>
            <label>{{ item.auth_nickname }}</label>
          </div>
          <div>
            <label>手机：</label>
            <label>{{ item.mobile }}</label>
          </div>  
        </div>
        <div class="common-width">
          <div class="p-t-20">提现金额：</div>
          <div>
            <label>提现金额：</label>
            <label>{{"￥" + item.money }}</label>
          </div>
          <div>
            <label>手续费用：</label>
            <label>{{"￥"+ item.money_fee }}</label>
          </div>
          <div>
            <label>到账金额：</label>
            <label>{{"￥"+ item.money_real }}</label>
          </div>  
        </div>
        <div class="common-width">
          <div class="p-t-20">流水情况：</div>
          <div>
            <label>流水号：</label>
            <label>{{ item.tradeno }}</label>
          </div>
          <div>
            <label>时间：</label>
            <label>{{ item.active_at }}</label>
          </div>
          <div>
            <label>状态：</label>
            <label v-if="item.status === 1">提现成功</label>
          </div>  
        </div>
        <div class="common-width">
          <div class="p-t-20">收款情况：</div>
          <div>
            <label>提现到账：</label>
            <label>{{ getWithdrawalType(item) }}</label>
          </div>
          <div v-if="[8,9].includes(item.pay_type) && item.snapshot">
            <label>账户姓名：</label>
            <label>{{ item.pay_type==8?item.snapshot.alipay_name:item.snapshot.bank_card_name }}</label>
          </div>
          <div>
            <div style="display:inline-flex;align-items:center;">
              <label style="flex-shrink:0;align-self:flex-start;line-height:19px;">收款账户：</label>
              <label style="line-height:19px;">{{ getWithdrawalAccount(item) }}</label>
            </div>
            <div class="small-img" v-if="[6,7].includes(item.pay_type) && item.snapshot" >
              <div class="mask" @click="showBigImg=true"><Icon type="ios-eye-outline" color="white" size="20"></Icon></div>
              <img class="wx-qrcode" v-if="item.pay_type==6 && item.snapshot.wx_qrcode" :src="getImgURL(item.snapshot.wx_qrcode)" alt="">
              <img class="zfb-qrcode" v-if="item.pay_type==7 && item.snapshot.alipay_qrcode" :src="getImgURL(item.snapshot.alipay_qrcode)" alt="">
            </div>
          </div>
          <div>
            <label>申请时间：</label>
            <label>{{ item.created_at }}</label>
          </div>
      </div>
      <Modal class="big-img-modal" v-model="showBigImg" v-if="[6,7].includes(item.pay_type) && item.snapshot" fullscreen footer-hide>
        <img class="qrcode" v-if="item.pay_type==6" :src="getImgURL(item.snapshot.wx_qrcode)" alt="">
        <img class="qrcode" v-if="item.pay_type==7" :src="getImgURL(item.snapshot.alipay_qrcode)" alt="">
      </Modal>
    </div>
    </template>
  </div>
</template>
<script>
import constants from "@/views/shop/components/constants.js";
export default {
  props: {
    detailsData: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  created(){
    // console.log(2222222,this.detailsData)
  },
  data() {
    return {
      showBigImg:false,
      collectionType: constants.collectionType,
      paymentType: [
        {
          value: 5,
          name: "余额"
        },
        {
          value: 98,
          name: "佣金"
        }
      ]
    };
  },
  methods: {
    // 匹配名称
    matchName(val, data) {
      let names = "";
      data.forEach(el => {
        if (el.value === val) {
          names = el.name;
        }
      });
      return names;
    },
    getImgURL(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    getWithdrawalType(item){
      switch(item.pay_type){
        case 1:
          return "余额";
        case 2:
          return "微信钱包-线上结算";
        case 3:
          return "支付宝-线上结算";
        case 6:
          return "微信钱包-线下结算";
        case 7:
          return "支付宝-线下结算";
        case 8:
          return "支付宝-线下结算";
        case 9:
          return "银行账户-线下结算";
        case 79:
          return "余额";  
        case 99:
          return "余额";
        default:
          return ""
      }
    },
    getWithdrawalAccount(item){
      switch(item.pay_type){
        case 1:
          return "余额账户";
        case 2:
          return "微信钱包";
        case 3:
          return "支付宝";
        case 6:
          return "微信收款码";
        case 7:
          return "支付宝收款码";
        case 8:
          return "支付宝账户-"+item.snapshot?item.snapshot.alipay_account:'';
        case 9:
          return item.snapshot ? `${item.snapshot.bank || '--'}/${item.snapshot.bank_branch || '--'}/${item.snapshot.bank_account || '--'}` : '--';
        case 79:
          return "余额账户";  
        case 99:
          return "余额账户";
        default:
          return "--"
      }
    }
  }
};
</script>

<style lang="less" scoped>
.expand-finances {
  .common-width {
    display: inline-block;
    width: 22%;
    padding-left: 30px;
    vertical-align: top;
    .p-t-20 {
      padding-top: 20px;
      margin-bottom: 15px;
      font-weight: normal;
    }
    & > div:not(:first-child) {
      color: #657180;
    }
    div:not(:first-child) {
      // margin-bottom: 5px;
      line-height:25px;
    }
    &:last-child{
      width:33%;
    }
    .small-img{
      display:inline-block;
      position:relative;
      width:30px;
      height:30px;
      border:1px solid #DCDEE2;
      vertical-align:middle;
      margin-left:10px;
      img{
        width:100%;
        height:100%;
        object-fit:cover;
        &.wx-qrcode{
          object-position:top left;
        }
        &.zfb-qrcode{
          object-position:54% left;
        }
      }
      .mask{
        display:none;
        position:absolute;
        width:100%;
        height:100%;
        line-height:27px;
        text-align:center;
        background:rgba(0,0,0,0.5);
      }
      &:hover{
        .mask{
          display:block;
        }
      }
    }
  }
}
</style>

