<template>
  <div class="home">
    <div v-if="!allFinish" class="guide">
      <h3>
        开店指南
        <small>( 为了更好的经营您的店铺，请完成以下设置 )</small>
      </h3>
      <div class="flex-wrapper">
        <template v-for="(item,index) in steps">
          <router-link
            tag="div"
            :to="item.target"
            :perm="item.perm"
            :key="'step'+index"
            :class="['step',item.finish&&'finish']"
          >
            <i v-if="item.finish" class="iconfont icon-md-checkmark"></i>
            <div v-else class="circle">{{index+1}}</div>
            <div class="text">
              <div class="title">{{item.title}}</div>
              <div class="desc">{{item.desc}}</div>
            </div>
          </router-link>
          <i
            v-if="index<5"
            class="iconfont icon-ios-arrow-forward"
            style="font-size:18px;color:#5d86fb"
            :key="index"
          ></i>
        </template>
      </div>
    </div>
    <div class="todo">
      <h3>待办事项</h3>
      <div class="flex-wrapper">
        <div class="order block">
          <img src="images/home/order-form.png" alt>
          <div class="info">
            <router-link to="/order/shop?tab=1" tag="div" perm="order.view">
              待发货订单：
              <span class="green">{{data.order_pay_num}}</span> 笔
            </router-link>
            <router-link to="/order/afterSele" tag="div" perm="order.after-sale.view">
              售后订单：
              <span class="green">{{data.after_sale_num}}</span> 笔
            </router-link>
          </div>
        </div>
        <div class="auditing block">
          <img src="images/home/audit.png" alt>
          <div class="info">
            <router-link tag="div" to="/finance/withdrawal?tab=0" perm="withdraw.view">
              提现审核：
              <span class="orange">{{data.withdraw_apply_num}}</span> 笔
            </router-link>
            <router-link v-if="hasLicensePerm('ENABLE_DISTRIBUTION')" tag="div" to="/distributor/verify?status=0" perm="distributor.review.view">
              分销商审核：
              <span class="orange">{{data.distributor_apply_num}}</span> 个
            </router-link>
          </div>
        </div>
        <div class="product block">
          <img src="images/home/inventory.png" alt>
          <div class="info">
            <router-link tag="div" to="/product/manage?index=3" perm="product.view">
              缺货商品：
              <span class="red">{{data.product_stock_low_num}}</span> 个
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="management">
      <h3>经营概况</h3>
      <div class="flex-wrapper">
        <div class="block">
          <div class="title">
            访客数（人）
            <Tooltip
              max-width="260"
              placement="top-start"
              offset="-15"
              content="从0点截至当前时间，访问店铺的去重人数，一个人在统计时间范围内访问多次只记为一人。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.uv_today}}
            <i
              v-if="+data.uv_today!=+data.uv_yesterday"
              :class="['iconfont','icon-Shape',+data.uv_today>+data.uv_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.uv_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">
            新增会员（人）
            <Tooltip 
              max-width="260" 
              placement="top" 
              content="从0点截至当前时间，新增的会员数量"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.member_new_num_today}}
            <i
              v-if="+data.member_new_num_today!=+data.member_new_num_yesterday"
              :class="['iconfont','icon-Shape',+data.member_new_num_today>+data.member_new_num_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.member_new_num_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">充值金额（元）
            <Tooltip 
              max-width="260" 
              placement="top" 
              content="从0点截至当前时间，会员通过第三方支付充值到平台的余额之和。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.recharge_money_today}}
            <i
              v-if="+data.recharge_money_today!=+data.recharge_money_yesterday"
              :class="['iconfont','icon-Shape',+data.recharge_money_today>+data.recharge_money_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.recharge_money_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">支付人数（人）
            <Tooltip 
              max-width="260" 
              placement="top" 
              content="从0点截至当前时间，下单并成功支付的人数，一人多次支付记为一人。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.member_pay_num_today}}
            <i
              v-if="+data.member_pay_num_today!=+data.member_pay_num_yesterday"
              :class="['iconfont','icon-Shape',+data.member_pay_num_today>+data.member_pay_num_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.member_pay_num_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">支付订单数（笔）
            <Tooltip 
              max-width="260" 
              placement="top" 
              content="从0点截至当前时间，下单并成功支付的订单数"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.order_pay_num_today}}
            <i
              v-if="+data.order_pay_num_today!=+data.order_pay_num_yesterday"
              :class="['iconfont','icon-Shape',+data.order_pay_num_today>+data.order_pay_num_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.order_pay_num_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">交易金额（元）
            <Tooltip 
              max-width="260" 
              placement="top" 
              content="从0点截至当前时间，所有下单并成功支付订单的实付金额之和。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.trade_money_today}}
            <i
              v-if="+data.trade_money_today!=+data.trade_money_yesterday"
              :class="['iconfont','icon-Shape',+data.trade_money_today>+data.trade_money_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.trade_money_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">收益（元）
            <Tooltip
              max-width="260"
              placement="top-end"
              offset="10"
              content="从0点截至当前时间，商城的销售总收益。公式：交易金额-商品成本-运费"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.total_profit_money_today}}
            <i
              v-if="+data.total_profit_money_today!=+data.total_profit_money_yesterday"
              :class="['iconfont','icon-Shape',+data.total_profit_money_today>+data.total_profit_money_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.total_profit_money_yesterday}}</div>
        </div>
      </div>
    </div>
    <div class="distribution" v-if="hasLicensePerm('ENABLE_DISTRIBUTION')">
      <h3>分销概况</h3>
      <div class="flex-wrapper">
        <div class="block">
          <div class="title">新增分销商（人）
            <Tooltip
              max-width="260"
              placement="top-start"
              offset="-15"
              content="从0点截至当前时间，新增的分销商数量（审核通过）"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.distributor_new_num_today}}
            <i
              v-if="+data.distributor_new_num_today!=+data.distributor_new_num_yesterday"
              :class="['iconfont','icon-Shape',+data.distributor_new_num_today>+data.distributor_new_num_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.distributor_new_num_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">分销订单数（笔）
            <Tooltip
              max-width="260"
              placement="top"
              content="从0点截至当前时间，分销体系下产生的分销订单数"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.distribution_order_num_today}}
            <i
              v-if="+data.distribution_order_num_today!=+data.distribution_order_num_yesterday"
              :class="['iconfont','icon-Shape',+data.distribution_order_num_today>+data.distribution_order_num_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.distribution_order_num_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">
            分销交易额（元）
            <Tooltip
              max-width="260"
              placement="top"
              content="从0点截至当前时间，分销体系下产生的分销订单的实付金额之和。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.distribution_trade_money_today}}
            <i
              v-if="+data.distribution_trade_money_today!=+data.distribution_trade_money_yesterday"
              :class="['iconfont','icon-Shape',+data.distribution_trade_money_today>+data.distribution_trade_money_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.distribution_trade_money_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">
            分销佣金（元）
            <Tooltip max-width="260" placement="top" content="从0点截至当前时间，分销体系下所有分销订单产生的佣金之和。">
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.distribution_commission_today}}
            <i
              v-if="+data.distribution_commission_today!=+data.distribution_commission_yesterday"
              :class="['iconfont','icon-Shape',+data.distribution_commission_today>+data.distribution_commission_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.distribution_commission_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">佣金提现笔数（笔）
            <Tooltip
              max-width="260"
              placement="top"
              content="从0点截至当前时间，分销商申请提现佣金到第三方平台的笔数之和。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.commission_withdraw_num_today}}
            <i
              v-if="+data.commission_withdraw_num_today!=+data.commission_withdraw_num_yesterday"
              :class="['iconfont','icon-Shape',+data.commission_withdraw_num_today>+data.commission_withdraw_num_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.commission_withdraw_num_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">佣金提现额（元）
            <Tooltip
              max-width="260"
              placement="top"
              content="从0点截至当前时间，分销商申请提现佣金到第三方平台的佣金金额之和。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.commission_withdraw_money_today}}
            <i
              v-if="+data.commission_withdraw_money_today!=+data.commission_withdraw_money_yesterday"
              :class="['iconfont','icon-Shape',+data.commission_withdraw_money_today>+data.commission_withdraw_money_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.commission_withdraw_money_yesterday}}</div>
        </div>
        <div class="block">
          <div class="title">已支付佣金（元）
            <Tooltip
              max-width="260"
              placement="top-end"
              offset="10"
              content="从0点截至当前时间，对提现的佣金完成审核并成功打款到第三方的佣金之和。"
            >
              <i class="iconfont icon-ios-help-circle-outl"></i>
            </Tooltip>
          </div>
          <div class="data">
            {{data.commission_out_money_totay}}
            <i
              v-if="+data.commission_out_money_totay!=+data.commission_out_money_yesterday"
              :class="['iconfont','icon-Shape',+data.commission_out_money_totay>+data.commission_out_money_yesterday?'up':'down']"
            ></i>
          </div>
          <div class="yesterday">昨日 {{data.commission_out_money_yesterday}}</div>
        </div>
      </div>
    </div>
    <div class="store">
      <h3>商铺总览</h3>
      <div class="flex-wrapper">
        <div class="block">
          <div class="title">交易总金额（元）</div>
          <div class="data">{{data.total_trade_money}}</div>
        </div>
        <div class="block">
          <div class="title">订单总数（个）</div>
          <div class="data">{{data.total_order_num}}</div>
        </div>
        <div class="block">
          <div class="title">会员总数（个）</div>
          <div class="data">{{data.total_member_num}}</div>
        </div>
        <div class="block">
          <div class="title">商品总数（个）</div>
          <div class="data">{{data.total_product_num}}</div>
        </div>
      </div>
    </div>
    <div class="common">
      <h3>常用功能</h3>
      <div class="wrapper">
        <router-link to="/order/shop" perm="order.view">商城订单</router-link>
        <router-link to="/order/afterSele" perm="order.after-sale.view">售后订单</router-link>
        <router-link to="/product/manage" perm="product.view">商品列表</router-link>
        <router-link to="/product/add" perm="product.operate">新增商品</router-link>
        <router-link to="/member/list" perm="member.view">会员列表</router-link>
        <router-link to="/finance/withdrawal" perm="withdraw.view">提现管理</router-link>
        <router-link to="/distributor/verify" perm="distributor.review.view" v-if="hasLicensePerm('ENABLE_DISTRIBUTION')">分销商审核</router-link>
        <router-link to="/marketing/manage" perm="coupon.view">优惠券</router-link>
      </div>
    </div>
    <Modal title="开店指引" class="guide-model" v-model="needShowModel">
      <div>
        <div class="flex-wrapper" v-if="currentStep > -1">
          <div class="info">
            <h3>{{steps[currentStep].title}}</h3>
            <p class="desc">{{steps[currentStep].desc}}</p>
            <p class="text">为了给用户更好购物体验，请完成设置</p>
          </div>
          <img :src="steps[currentStep].image" alt="">
        </div>
        <div class="btn-wrapper" v-if="currentStep > -1">
          <Button type="primary" :perm="steps[currentStep].perm" @click="$router.push(steps[currentStep].target)">前往设置</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import axios from "axios";
import myIcon from "@/views/shop/components/icons/icon.vue";
export default {
  components: {
    myIcon
  },
  data() {
    return {
      needShowModel: false,
      allFinish: true,
      steps: [
        {
          key:"store_decoration",
          title: "店铺装修",
          desc: "去创建店铺主页",
          target: "/store/decoration",
          image: "images/home/step1.png",
          perm: "page.view",
          finish: false
        },
        {
          key:"shop_config",
          title: "商城设置",
          desc: "编辑商城信息",
          target: "/setting/mall/mall",
          image: "images/home/step2.png",
          perm: "shop.config.view",
          finish: false
        },
        {
          key:"product_add",
          title: "发布商品",
          desc: "发布您的商品",
          target: "/product/add",
          image: "images/home/step3.png",
          perm: "product.operate",
          finish: false
        },
        {
          key:"pay_config",
          title: "支付设置",
          desc: "开启您的支付信息",
          target: "/setting/mall/pay",
          image: "images/home/step4.png",
          perm: "pay.config.view",
          finish: false
        },
        {
          key:"sms_config",
          title: "短信设置",
          desc: "设置短信配置",
          target: "/setting/news/message",
          image: "images/home/step5.png",
          perm: "sms.config.view",
          finish: false
        },
        {
          key:"commission_set",
          title: "佣金比例设置",
          desc: "设置分销佣金比例",
          target: "/distributor/level",
          image: "images/home/step6.png",
          perm: "distributor.level.view",
          finish: false
        }
      ],
      data: {}
    };
  },
  computed:{
    currentStep(){
      return this.steps.findIndex(step => !step.finish)
    }
  },
  created() {
    this.$Spin.show();
    if(!this.hasLicensePerm('ENABLE_DISTRIBUTION')){
      let index = this.steps.findIndex(item=>item.key=="commission_set")
      if(index > -1){
        this.steps.splice(index,1);
      }
    }
    axios
      .get("/shop/admin/index")
      .then(res => {
        this.$Spin.hide();
        if(!res) return;
        if (res.code == 200) {
          this.data = res.data;
          this.setFinishStep(res.data.step);
          this.$store.commit("saveStoreInfo", res.data.config.shop.info);
          //是否显示向导对话框
          this.needShowModel =
            !window.sessionStorage.getItem("has-show-guide-model") &&
            this.currentStep > -1;
          window.sessionStorage.setItem("has-show-guide-model", "yes");
        } else {
          this.$Message.success(res.msg);
        }
      })
      .catch(err => {
        this.$Spin.hide();
        this.$Message.error(err);
      });
  },
  methods: {
    setFinishStep(data) {
      this.allFinish = data.finish;
      this.steps.forEach(step=>{
        step.finish = data[step.key];
      })
      // this.steps[0].finish = data.shop_config;
      // this.steps[1].finish = data.product_add;
      // this.steps[2].finish = data.store_decoration;
      // this.steps[3].finish = data.pay_config;
      // this.steps[4].finish = data.sms_config;
      // // 防止没有distributor权限时报错（created方法中删除了）
      // this.steps[5] && (this.steps[5].finish = data.commission_set);
    }
  }
};
</script>
<style lang="less" scoped>
.home {
  font-size: 12px;
  background: #f2f4fd;
  h3 {
    font-size: 16px;
    color: #1d2530;
    small {
      font-size: 12px;
      margin-left: 9px;
      font-weight: normal;
      color: #d4cdcd;
    }
  }
  .guide {
    min-height: 161px;
    padding: 18px 20px;
    border-radius: 5px;
    background-image: url("../../public/images/home/bg.png");
    background-size: cover;
    margin-bottom: 10px;
    h3 {
      color: white;
      margin-bottom: 18px;
    }
    .flex-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      .step {
        width: calc(16.7% - 25px);
        min-height: 78px;
        background: #5d86fb;
        border-radius: 20px;
        padding: 18px;
        display: flex;
        cursor:pointer;
        .circle {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border-radius: 24px;
          background-color: #f7c12f;
        }
        .text {
          color: white;
          margin-left: 6px;
          .title {
            font-size: 14px;
          }
          .desc {
            color: #b2d2d7;
            font-size: 12px;
          }
        }
        &.finish {
          background: white;
          .text {
            color: #333;
            .desc {
              color: #999;
            }
          }
          .iconfont {
            display: inline-block;
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border-radius: 50%;
            font-size: 16px;
            color: white;
            background: #6ed22c;
          }
        }
      }
      .icon-ios-arrow-forward {
        writing-mode: tb;
        text-align: center;
      }
    }
  }
  .todo {
    height: 169px;
    background-color: #ffffff;
    border-radius: 5px;
    padding: 20px 16px 30px;
    .flex-wrapper {
      display: flex;
      margin-top: 30px;
      .block {
        width: 200px;
        height: 68px;
        margin-right: 120px;
        display: flex;
        align-items: flex-start;
        img {
          margin-right: 18px;
        }
        .info {
          font-size: 12px;
          line-height: 1;
          & > div {
            cursor: pointer;
            &:first-child {
              margin: 10px 0 14px;
            }
          }
          .green,
          .orange,
          .red {
            font-size: 15px;
          }
          .green {
            color: #6ed22c;
          }
          .orange {
            color: #f7a52f;
          }
          .red {
            color: #ff1d42;
          }
        }
      }
    }
  }
  .distribution,
  .management {
    margin-top: 10px;
    padding: 20px 16px 50px;
    background: white;
    .flex-wrapper {
      display: flex;
      margin-top: 40px;
      .block {
        flex-grow: 1;
        margin-right: 16px;
        padding-left: 6px;
        font-size: 12px;
        &:last-child {
          margin-right: 0;
        }
        .title {
          color: #999;
        }
        .data {
          color: #333;
          font-size: 18px;
          margin-top: 12px;
          margin-bottom: 6px;
        }
        .yesterday {
          color: #666;
        }
        /deep/.icon-Shape {
          display: inline-block;
          font-size: 12px;
          margin-left: 10px;
          &.up {
            color: #6ed22c;
            transform: rotate(0deg);
          }
          &.down {
            color: #f9530a;
            transform: rotate(180deg);
          }
        }
        .icon-ios-help-circle-outl {
          display:inline-block;
          position:relative;
          font-size: 14px;
          vertical-align: middle;
        }
      }
    }
  }
  .management {
    position:relative;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    &:after{
      position:absolute;
      content:"";
      width:calc(100% - 32px);
      height:1px;
      bottom:0;
      background:#f6f5f5;
    }
  }
  .distribution {
    margin-top: 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .store {
    margin-top: 10px;
    padding: 20px 16px 24px;
    background: white;
    border-radius: 5px;
    .flex-wrapper {
      display: flex;
      margin-top: 18px;
      .block {
        width: 196px;
        height: 70px;
        background-color: #feeed6;
        border-radius: 5px;
        margin-right: 24px;
        padding: 15px 26px 16px;
        &:last-child {
          margin-right: 0;
        }
        .title {
          color: #666;
          font-size: 12px;
        }
        .data {
          color: #666;
          font-size: 18px;
        }
      }
    }
  }
  .common {
    margin-top: 10px;
    padding: 20px 16px 24px;
    background: white;
    border-radius: 5px;
    .wrapper {
      margin-top: 24px;
      /deep/a {
        display: inline-block;
        width: 110px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: #f2f6fe;
        border-radius: 5px;
        color: #1d2530;
        font-size: 14px;
        cursor: pointer;
        margin-right: 20px;
        margin-bottom: 20px;
        &:hover {
          color: white;
          background: #859bf7;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
<style lang="less">
  .guide-model{
    .flex-wrapper{
      display:flex;
      align-items:center;
      justify-content:space-between;
      .info{
        line-height:1;
        width:150px;
      }
      img{
        width: 250px;
        height: 150px;
        object-fit: contain;
      }
      h3{
        font-size:16px;
        font-weight:bold;
        margin-bottom:10px;
      }
      .desc{
        color:#999;
        font-size:14px;
        margin-bottom:24px;
      }
      .text{
        color:#999;
        font-size:12px;
        line-height:1.5;
      }
    }
    .btn-wrapper{
      text-align:center;
      margin-top:56px;
    }
    /deep/.ivu-modal-body{
      padding:44px 50px 24px;
    }
    /deep/.ivu-modal-footer{
      display:none;
    }
  }
</style>