<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container">
      <Form
        ref="formValidateBase"
        :model="formValidate"
        :rules="ruleValidateBase"
        :label-width="140"
        class="form-full-wrapper"
      >
        <div class="tl-config">
          <switch-titlebar
            style="margin-bottom: 20px;"
            hasBorder
            :value="true"
            :tipShow="true"
            :switchShow="false"
            title="通联支付接口配置"
            tipText="当开启了通联支付，必须填写支付接口配置"
          >
		    <FormItem
              label="服务商授权ID："
              prop="tlpay_orgid"
              class="margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.tlpay_orgid"
                  class="common-input-text-260"
                  placeholder="请输入服务商授权ID"
                  @on-change="filterInput($event,'tlpay_orgid')"
                />
				<more-message text="服务商授权ID请联系我们获取" class="prompt"></more-message>
              </div>
            </FormItem>
            <FormItem
              label="商户号："
              prop="tlpay_mchid"
              class="margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.tlpay_mchid"
                  class="common-input-text-260"
                  placeholder="请输入商户号"
                  @on-change="filterInput($event,'tlpay_mchid')"
                />
              </div>
            </FormItem>
            <FormItem
              label="APPID："
              prop="tlpay_appid"
              class="margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.tlpay_appid"
                  class="common-input-text-260"
                  placeholder="请输入APPID"
                  @on-change="filterInput($event,'tlpay_appid')"
                />
              </div>
            </FormItem>
            <FormItem
              label="MD5交易密钥："
              prop="tlpay_key"
              class="margin-bottom-form"
              style="margin-bottom: 16px !important;"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.tlpay_key"
                  class="common-input-text-260"
                  placeholder="MD5交易密钥"
                  @on-change="filterInput($event,'tlpay_key')"
                />
              </div>
            </FormItem>
          </switch-titlebar>
        </div>
        <div class="wx-online">
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="isOpenTLOnlinePay"
            :true-value="true"
            :false-value="false"
            hasBorder
            :tipShow="isOpenTLOnlinePay"
            title="是否开启通联支付"
            tipText="通联支付在前端展示“微信支付(通联)”、“支付宝(通联)”；建议不要同时启用“通联支付”和“线上微信/支付宝”，以免造成用户的疑问。"
            @on-change="changeOpenTLOnlinePay"
          >
            <FormItem label="应用入口：" class="un-start" style="margin-bottom: 16px !important;" v-if="isOpenTLOnlinePay">
              <div class="product-detail-item">
                <CheckboxGroup v-model="formValidate.tlpay_online_entrance">
                  <Checkbox label="pay_retail">支付C端零售单</Checkbox>
                  <Checkbox label="pay_balance_recharge">余额账户充值</Checkbox>
                  <Checkbox label="pay_initial_money" v-if="hasLicensePerm('ENABLE_AGENT')">支付代理加盟费</Checkbox>
                  <!--<Checkbox label="pay_dealer_initial_money" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付经销商加盟费</Checkbox>-->
                  <Checkbox label="pay_cloudstock_purchase" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')" >支付云仓进货单</Checkbox>
                  <Checkbox label="pay_cloudstock_take_delivery_freight"  v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付云仓提货运费</Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
            
          </switch-titlebar>
        </div>
      </Form>
      <div class="footer">
        <Button
          shape="circle"
          class="save"
          type="primary"
          @click="onHandleSubmit('formValidateBase')"
          :loading="loading"
          perm="pay.config.operate"
        >保存</Button>
      </div>
    </div>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import moreMessage from "COMPONENTS/more-message/more-message";
export default {
  components: {
    thirdMenu,
    switchTitlebar,
	moreMessage
  },
  data() {
    return {
      loading: false,
      isOpenTLOnlinePay: true,
      thirdMenu: [],
      formValidate: {
        type: {
          tlpay: 1
        },
		tlpay_orgid: "", //服务商授权ID
        tlpay_mchid: "", // 商户号
        tlpay_appid: "", // appid
        tlpay_key: "", // md5秘钥
        tlpay_online_entrance: ["pay_retail", "pay_balance_recharge"], // 线上应用入口
        pay_config_type: 5
      },
      ruleValidateBase: {
		 tlpay_orgid: [
          {
            required: true,
            message: "服务商授权ID不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenTLOnlinePay && !value) {
                callback("服务商授权ID不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        tlpay_mchid: [
          {
            required: true,
            message: "商户号不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenTLOnlinePay && !value) {
                callback("商户号不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        tlpay_appid: [
          {
            required: true,
            message: "APPID不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              console.log(11111)
              if(this.isOpenTLOnlinePay && !value) {
                callback("APPID不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        tlpay_key: [
          {
            required: true,
            message: "MD5交易密钥不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenTLOnlinePay && !value) {
                callback("MD5交易密钥不能为空")
              } else {
                callback()
              }
            }
          }
        ]
      }
    };
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getInfo();
  },
  methods: {
    // 开启微信线上支付
    changeOpenTLOnlinePay(status) {
      this.isOpenTLOnlinePay = status;
    },
    filterInput(event,field) {
      var filteredValue = event.target.value.replace(/[^\x00-\xff]/g, "")
      this.$nextTick(() => {
        this.formValidate[field] = filteredValue
      })
    },
    // 初始化数据
    getInfo() {
      // this.formValidate.tlpay_online_entrance.push("pay_retail");
      let tlpay_online_entrance = [];
      this.$httpGet(
        `/shop/admin/payconfig/info`,
        { pay_config_type: this.formValidate.pay_config_type },
        res => {
          if (res.msg === this.$store.state.SUCCESS) {
            for (let item in res.data) {
              if (res.data[item]) {
                try {
                  if (item === "type") {
                    const typeParse = JSON.parse(res.data[item]);
                    if (Number(typeParse.tlpay) === 1) {
                      this.isOpenTLOnlinePay = true;
                    } else {
                      this.isOpenTLOnlinePay = false;
                    }
                    this.$set(this.formValidate, item, typeParse);
                  } else if (item === "tlpay_online_entrance") {
                    for (const key in JSON.parse(res.data[item])) {
                      if (JSON.parse(res.data[item]).hasOwnProperty(key)) {
                        tlpay_online_entrance.push(key);
                      }
                    }
                    this.formValidate.tlpay_online_entrance = tlpay_online_entrance
                  } else {
                    this.$set(this.formValidate, item, res.data[item]);
                  }
                } catch (error) {
                  throw error;
                }
              }
            }
          }
        }
      );
    },
    // json转formData
    objectToFormData(obj) {
      if (typeof obj === "object") {
        let form = new FormData();
        for (let item in obj) {
          if (item !== this.$store.state.SITE_ID) {
            if (typeof obj[item] === "object") {
              form.append(item, JSON.stringify(obj[item]));
            } else {
              form.append(item, obj[item]);
            }
          }
        }
        return form;
      }
    },
    // 提交保存前检验数据
    uploadBeforeFilter() {
      let data = Object.assign({}, this.formValidate);
      let tempObj = data.tlpay_online_entrance;
      data.tlpay_online_entrance = {};
      for (const key in tempObj) {
        if (tempObj.hasOwnProperty(key)) {
          data.tlpay_online_entrance[tempObj[key]] = 1;
        }
      }
      let formData = this.objectToFormData(data);
      return formData;
    },
    // 提交
    onHandleSubmit(name) {
      // 如果关闭
      if (!this.isOpenTLOnlinePay) {
        this.loading = true;
        this.formValidate.type.tlpay = 0;

        this.$refs[name].validate(() => {})
        const data = this.uploadBeforeFilter();
        this.$httpUpload(`/shop/admin/payconfig/edit`, data, res => {
          this.loading = false;
          if (res.msg === this.$store.state.SUCCESS) {
            this.$Message.success(this.$store.state.SUCCESS_MSG);
          } else {
            this.$Message.error(res.msg);
          }
        });
      } else {
        // 只要有一个开启
        this.$refs[name].validate(valid => {
          if (valid) {
            this.loading = true;
            this.formValidate.type.tlpay = 1;

            // json转formData
            let data = this.uploadBeforeFilter();

            // formData 格式提交
            this.$httpUpload(`/shop/admin/payconfig/edit`, data, res => {
              this.loading = false;
              if (res.msg === this.$store.state.SUCCESS) {
                this.$Message.success(this.$store.state.SUCCESS_MSG);
              } else {
                this.$Message.error(res.msg);
              }
            });
          } else {
            this.$Message.error("保存失败");
          }
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import "../css/_spaceing.less";
@labelmr: 10px;
@checkboxmr: 5px;
@checkwrapmr: 20px;
@unitml: 10px;
.mall-container {
  width: 100%;
  height: calc(100vh - 132px);
  background: #f2f4fd;
  display: flex;
  .container {
    height: 100%;
    flex: 1;
    .margin-bottom-item-form {
      margin-bottom: 40px;
    }
  }
}
.form-full-wrapper {
  /*height: calc(100vh - 170px);*/
  overflow: auto;
  background: white;
  .submit {
    width: 75px;
  }

  .unit {
    display: inline-block;
    vertical-align: middle;
    .spac-ml(@unitml);
  }
  /deep/.ivu-upload {
    display: inline-block;
    width: 78px;
    height: 78px;
  }
  /deep/.ivu-form-item-label {
    padding-right: 10px;
  }
  /deep/.un-start .ivu-form-item-label:before {
    content: unset;
  }
  /deep/.ivu-checkbox,
  /deep/.ivu-radio {
    .spac-mr(@checkboxmr);
  }
  /deep/.ivu-checkbox-wrapper {
    .spac-mr(@checkwrapmr);
  }
  .radi-txt {
    display: inline-block;
    vertical-align: middle;
  }
  .product-detail-item {
    text-align: left;
    color: #464c5b;
    .prompt{
      margin-left: 5px;
    }
    .common-row-btn {
      width: 58px;
      height: 32px;
    }
    .input-item-is-null {
      border: 1px solid #f00 !important;
      border-radius: 4px;
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
  button {
    width: 70px;
    height: 32px;
  }
}
</style>
