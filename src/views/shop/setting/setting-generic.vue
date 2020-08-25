<template>
  <div>
    <thirdMenu :list="thirdMenu" />
    <div class="wrapper">
      <div class="content">
        <Form ref="form" :model="formField" :rules="rules" :label-width="160">
          <switch-titlebar 
            :switchShow="false" 
            title="商品设置" 
            hasBorder 
          >
            <FormItem label="商品详情跳转设置：" class="generic-radio-style product-video">
			  <more-message
                    style="margin-right: 20px;margin-left: -10px;"
                    text="当商品上传了购物视频时，可设置点击商品跳转到【图文详情页】或【视频购页】"
                ></more-message>
              <RadioGroup v-model="formField.product_video_page">
                <Radio :label="0">图文详情页</Radio>
                <Radio :label="1">视频购页</Radio>
              </RadioGroup>
            </FormItem>
			<FormItem label="商品列表默认排版：" class="generic-radio-style product-video">
              <RadioGroup v-model="formField.product_list_style">
                <Radio :label="1">双列排版</Radio>
                <Radio :label="0">单列排版</Radio>
                <span class="table-operation" @click="showModal(0)">示例</span>
              </RadioGroup>
            </FormItem>
			<FormItem label="是否展示商品销量：" class="generic-radio-style product-video">
              <RadioGroup v-model="formField.product_list_show_sale_num">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
                <span class="table-operation" @click="showModal(1)">示例</span>
              </RadioGroup>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar :switchShow="false" title="邀请码设置" hasBorder>
            <FormItem label="注册时是否显示邀请码：" class="generic-radio-style">
              <RadioGroup v-model="formField.show_code">
                <Radio :label="0">不显示</Radio>
                <Radio :label="1">显示非必填</Radio>
                <Radio :label="2">显示且必填</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              label="显示邀请码页面："
              class="generic-radio-style"
              v-if="hasLicensePerm('ENABLE_DISTRIBUTION')"
            >
              <Checkbox
                :true-value="1"
                :false-value="0"
                v-model="formField.show_code_pages.distribution"
              >分销中心</Checkbox>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar :switchShow="false" title="绑定推荐关系设置" hasBorder>
            <FormItem label="上下级绑定关系模式：" class="generic-radio-style">
              <RadioGroup v-model="formField.bind_invite_time" @on-change="noticeUser">
                <Radio :label="0">首次注册</Radio>
                <more-message
                    style="margin-right: 20px;margin-left: -10px;"
                    text="推荐下级时，下级注册成为会员时是谁推荐的就是谁的下级，当没有推荐人时，推荐人就是总部。"
                ></more-message>
                <Radio :label="1">首次下单</Radio>
                <more-message
                    style="margin-right: 10px;margin-left: -10px;"
                    text="会员第一次成功下单并完成支付时是谁推荐的就是谁的下级，当没有推荐人时，推荐人就是总部。"
                ></more-message>
              </RadioGroup>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="formField.product_comment_status"
            title="是否开启评价功能"
            hasBorder
          >
            <FormItem label="审核方式：" class="generic-radio-style">
              <RadioGroup v-model="formField.product_comment_check_way">
                <Radio :label="1">自动审核</Radio>
                <Radio :label="0">手动审核</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="自动评价：" prop="product_comment_auto_day">
              <p>
                <span>确认收货后，</span>
                <InputNumber
                  v-model="formField.product_comment_auto_day"
                  :min="1"
                  :max="180"
                  placeholder="请输入天数"
                ></InputNumber>
                <span>天之内买家没有评价，系统自动默认好评</span>
                <more-message text="最长可设置180天"></more-message>
              </p>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar
            v-model="formField.balance_give_status"
            v-if="hasBalanceGiveFunction"
            title="是否允许账户余额转现"
            hasBorder
          >
            <FormItem label="转赠对象：" class="generic-radio-style">
              <RadioGroup v-model="formField.balance_give_target">
                <Radio :label="1">任何会员</Radio>
                <Radio :label="2">所有下级</Radio>
                <Radio :label="3">所有直推下级</Radio>
              </RadioGroup>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar
            v-if="hasLicensePerm('ENABLE_DISTRIBUTION') || hasLicensePerm('ENABLE_AGENT')"
            v-model="formField.small_shop_status"
            title="是否开启“我的小店”功能"
            hasBorder
          >
            <FormItem label="自选商品功能：" class="generic-radio-style">
              <more-message
                style="vertical-align: initial;margin-right: 10px;margin-left: 0;"
                text="开启后，允许分销/代理商在自己的小店，选择并展示自己推广的产品"
              ></more-message>
              <RadioGroup
                style="font-size: 0;"
                v-model="formField.small_shop_optional_product_status"
              >
                <Radio :label="1">开启</Radio>
                <Radio :label="0">关闭</Radio>
              </RadioGroup>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar
            v-if="hasLicensePerm('ENABLE_CLOUDSTOCK') && this.formField.show_retail"
            v-model="formField.retail_status"
            title="是否开启商城零售功能"
            hasBorder
          >
            <p
              style="padding-left:16px;font-size: 12px;color: #9EA7B4;"
            >*开启零售功能后，商城的【个人中心】可展示全部菜单；关闭后，则关闭零售相关菜单。</p>
          </switch-titlebar>
        </Form>
      </div>
      <!-- <foot-button  @onSaveClick="submit"></foot-button> -->
      <div class="footer">
        <Button type="primary" shape="circle" @click="submit" perm="site.config.operate">保存</Button>
      </div>
    </div>
    <modal-example v-model="isShowModal" :indexSelect="indexSelect"></modal-example>
  </div>
</template>
<script>
import axios from "axios";
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import moreMessage from "COMPONENTS/more-message/more-message";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import modalExample from "./components/modal-example.vue"
export default {
  components: {
    verticalLineTitlebar,
    switchTitlebar,
    moreMessage,
    thirdMenu,
    footButton,
    modalExample
  },
  data() {
    return {
      isShowModal: false,
      indexSelect: 0,
      thirdMenu: [],
      formField: {
        product_video_page: 0,
        product_list_style: 1,
        product_list_show_sale_num: 1,
        product_comment_status: 1,
        product_comment_check_way: 0,
        product_comment_auto_day: 0,
        show_code: 0,
        bind_invite_time:0,
        retail_status: 1,
        balance_give_status: 0,
        balance_give_target: 1,
        small_shop_status: 0,
        small_shop_optional_product_status: 0,
        show_code_pages: {
          distribution: 0
        }
      },
      rules: {
        product_comment_auto_day: [
          {
            required: true,
            type: "number",
            message: "自动评价天数不能为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    hasBalanceGiveFunction() {
      return (
        this.hasLicensePerm("ENABLE_DISTRIBUTION") ||
        this.hasLicensePerm("ENABLE_AGENT") ||
        this.hasLicensePerm("ENABLE_CLOUDSTOCK")
      );
    }
  },
  created() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.$store.state.COMMON_loading = true;
    this.$httpGet("/shop/admin/config/info", null, res => {
      this.$store.state.COMMON_loading = false;
      if (res.code == 200) {
        let data = res.data;
        // 赋初始值
        if (!data.show_code_pages) {
          data.show_code_pages = {};
        } else {
          data.show_code_pages = JSON.parse(data.show_code_pages);
        }
        if (!Object.keys(data.show_code_pages).length) {
          data.show_code_pages = {
            distribution: 0
          };
        }
        this.formField = data;
      } else {
        this.$Message.error(res.msg);
      }
    });
  },
  methods: {
    showModal(index) {
      this.isShowModal = true;
      this.indexSelect = index;
    },
    submit() {
      if (this.formField.product_comment_status) {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.saveSetting();
          } else {
            this.$Message.error("保存失败");
          }
        });
      } else {
        this.saveSetting();
      }
    },
    //切换上下级绑定关系模式时出现的弹窗
    noticeUser(){
      //切换首次注册
      if(this.formField.bind_invite_time==0){
        this.$nextTick(()=>{
          this.formField.bind_invite_time=1
        })
        this.$Modal.confirm({
          title:"提示",
          content:"切换为【首次注册】后，只会影响到新会员的绑定关系，但已注册未下单的旧数据不自动处理，是否确定切换？",
          onOk:()=>{
            this.formField.bind_invite_time=0;
          }
        })
      }
      //切换首次下单
      if(this.formField.bind_invite_time==1){
        this.$nextTick(()=>{
          this.formField.bind_invite_time=0
        })
        this.$Modal.confirm({
          title:"提示",
          content:"切换为【首次下单】后，只会影响到新会员的绑定关系，旧数据已经绑定上下级关系的不影响，是否确定切换？",
          onOk:()=>{
            this.formField.bind_invite_time=1;
          }
        })
      }
    },
    saveSetting() {
      axios
        .post("/shop/admin/config/save", {
          product_video_page: this.formField.product_video_page,
          product_list_style: this.formField.product_list_style,
          product_list_show_sale_num: this.formField.product_list_show_sale_num,
          product_comment_status: this.formField.product_comment_status,
          product_comment_check_way: this.formField.product_comment_check_way,
          product_comment_auto_day: this.formField.product_comment_auto_day,
          show_code: this.formField.show_code,
		      bind_invite_time: this.formField.bind_invite_time,
          retail_status: this.formField.retail_status,
          balance_give_status: this.formField.balance_give_status,
          balance_give_target: this.formField.balance_give_target,
          small_shop_status: this.formField.small_shop_status,
          small_shop_optional_product_status: this.formField
            .small_shop_optional_product_status,
          show_code_pages: this.formField.show_code_pages
        })
        .then(res => {
          if (res.code === 200) {
            this.$Message.success(res.msg);
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  /*height:calc(100vh - 120px);*/
  overflow: auto;
  padding: 24px;
  padding-bottom: 74px;
  /deep/.ivu-form-item {
    margin-bottom: 20px;
  }
  /deep/.vertical-line-titlebar-wrapper {
    margin-bottom: 24px;
  }
  /deep/.ivu-input-number {
    margin-right: 7px;
  }
  /deep/.more-message {
    vertical-align: 1px;
  }
  /deep/.ivu-form-item-error-tip {
    left: 77px;
  }
  .generic-radio-style {
    /deep/.ivu-radio-group {
      .ivu-radio-wrapper {
        margin-right: 20px !important;
        .ivu-radio {
          margin-right: 5px !important;
        }
      }
    }
  }
  .product-video {
    /deep/.ivu-form-item-label {
      width: 185px !important;
    }
    /deep/.ivu-form-item-content {
      margin-left: 30px !important;
    }
    .table-operation {
      color: #3352d9;
      font-size: 12px;
    }
  }
}
.footer {
  position: fixed;
  bottom: 10px;
  height: 50px;
  line-height: 50px;
  width: calc(100% - 260px);
  background-color: #fff;
  text-align: center;
  border-top: 1px solid #eee;
  z-index: 100;
  /deep/.ivu-btn-primary {
    width: 70px;
    height: 32px;
  }
}
/*.footer{*/
/*height:50px;*/
/*line-height:50px;*/
/*text-align:center;*/
/*border-top:1px solid #eee;*/
/*/deep/.ivu-btn-primary{*/
/*width:70px;*/
/*height:32px;*/
/*}*/
/*}*/
</style>
