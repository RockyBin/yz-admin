<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container">
      <Form
        ref="formValidateBase3"
        :model="formValidate"
        :rules="ruleValidateBase"
        :label-width="120"
        class="form-full-wrapper"
      >
        <!-- 银行账户线下支付 -->
        <div>
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="isOpenBankOfflinePay"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="是否开启银行账户线下支付功能"
            @on-change="changeOpenBankOfflinePay"
          >
          <FormItem label="应用入口：" class="un-start" v-if="isOpenBankOfflinePay">
            <div class="product-detail-item">
              <CheckboxGroup v-model="formValidate.bank_offline_entrance">
                <Checkbox label="pay_balance_recharge">余额账户充值</Checkbox>
                <Checkbox v-show="hasLicensePerm('ENABLE_AGENT')" label="pay_initial_money">支付代理加盟费</Checkbox>
                <!--<Checkbox label="pay_dealer_initial_money" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付经销商加盟费</Checkbox>-->
                <Checkbox v-show="hasLicensePerm('ENABLE_CLOUDSTOCK')" label="pay_cloudstock_purchase">支付云仓进货单</Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
          <FormItem
            label="持卡人："
            prop="bank_card_name"
            v-if="isOpenBankOfflinePay"
            class="margin-bottom-form"
          >
            <div class="product-detail-item">
              <Input
                v-model="formValidate.bank_card_name"
                class="common-input-text-260"
                placeholder="请输入持卡人"
                :maxlength="6"
              />
              <span
                class="fontcount"
                style="margin-left: -29px;"
              >{{formValidate.bank_card_name ? formValidate.bank_card_name.length : 0}}/6</span>
            </div>
          </FormItem>
          <FormItem
            label="开户银行："
            prop="bank"
            v-if="isOpenBankOfflinePay"
            class="margin-bottom-form"
          >
            <div class="product-detail-item">
              <Input
                v-model="formValidate.bank"
                class="common-input-text-260"
                placeholder="请输入开户银行"
                :maxlength="12"
              />
              <span class="fontcount">{{formValidate.bank ? formValidate.bank.length : 0}}/12</span>
            </div>
          </FormItem>
          <FormItem
            label="银行账户："
            prop="bank_account"
            v-if="isOpenBankOfflinePay"
            class="margin-bottom-form"
            style="margin-bottom: 16px !important;"
          >
            <div class="product-detail-item">
              <Input
                v-model="formValidate.bank_account"
                class="common-input-text-260"
                placeholder="请输入银行账户"
                :maxlength="23"
                @on-keyup="formValidate.bank_account = formValidate.bank_account.replace(/[^0-9]/g,'').replace(/(\d{4})/g,'$1 ').trim()"
              />
              <span
                class="fontcount"
              >{{formValidate.bank_account ? formValidate.bank_account.replace(/\s*/g,"").length : 0}}/19</span>
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
          @click="onHandleSubmit('formValidateBase3')"
          :loading="loading"
          perm="pay.config.operate"
        >保存</Button>
      </div>
    </div>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import footButton from "COMPONENTS/button/foot-button.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";

export default {
  components: {
    footButton,
    thirdMenu,
    switchTitlebar
  },
  data() {
    const validateAccount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("银行账户不能为空"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      isOpenBankOfflinePay: true,
      thirdMenu: [],
      formValidate: {
        type: {
          bankpay: 1
        },
        bank: "", // 开户银行
        bank_account: "", // 银行账户
        bank_card_name: "", // 持卡人
        bank_offline_entrance: [], // 银行卡线下支付引用入口
        pay_config_type: 3
      },
      ruleValidateBase: {
        bank_card_name: [
          {
            required: true,
            message: "持卡人不能为空",
            trigger: "blur"
          }
        ],
        bank: [
          {
            required: true,
            message: "开户银行不能为空",
            trigger: "blur"
          }
        ],
        bank_account: [
          {
            required: true,
            validator: validateAccount,
            trigger: "blur"
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
    // 开启银行线下支付
    changeOpenBankOfflinePay(status) {
      this.isOpenBankOfflinePay = status;
    },
    // 初始化数据
    getInfo() {
      this.$httpGet(
        `/shop/admin/payconfig/info`,
        { pay_config_type: 3 },
        res => {
          if (res.msg === this.$store.state.SUCCESS) {
            for (let item in res.data) {
              if (res.data[item]) {
                try {
                  if (item === "type") {
                    const typeParse = JSON.parse(res.data[item]);
                    if (Number(typeParse.bankpay) === 1) {
                      this.isOpenBankOfflinePay = true;
                    } else {
                      this.isOpenBankOfflinePay = false;
                    }
                    this.$set(this.formValidate, item, typeParse);
                  } else if (item === "bank_offline_entrance") {
                    for (const key in JSON.parse(res.data[item])) {
                      if (JSON.parse(res.data[item]).hasOwnProperty(key)) {
                        this.formValidate.bank_offline_entrance.push(key);
                      }
                    }
                  } else if (item === "bank_account") {
                    this.formValidate.bank_account = res.data.bank_account
                      .replace(/(\d{4})/g, "$1 ")
                      .trim();
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
    // 提交保存前验证数据
    uploadBeforeFilter() {
      let data = Object.assign({}, this.formValidate);
      let tempObj = data.bank_offline_entrance;
      let tempObj2 = data.bank_online_entrance;

      data.bank_offline_entrance = {};
      data.bank_online_entrance = {};

      for (const key in tempObj2) {
        if (tempObj2.hasOwnProperty(key)) {
          data.bank_online_entrance[tempObj2[key]] = 1;
        }
      }

      for (const key in tempObj) {
        if (tempObj.hasOwnProperty(key)) {
          data.bank_offline_entrance[tempObj[key]] = 1;
        }
      }

      data.bank_account = data.bank_account.replace(/\s*/g, "").trim();

      let formData = this.objectToFormData(data);
      return formData;
    },
    // 提交
    onHandleSubmit(name) {
      // 如果关闭
      if (!this.isOpenBankOfflinePay) {
        this.loading = true;
        this.formValidate.type.bankpay = 0;
        this.formValidate.pay_config_type = 3;

        const data = this.uploadBeforeFilter();
        this.$httpUpload(`/shop/admin/payconfig/edit`, data, res => {
          this.loading = false;
          if (res.msg === this.$store.state.SUCCESS) {
            this.$Message.success(this.$store.state.SUCCESS_MSG);
          }
        });
      } else {
        // 只要开启
        this.$refs[name].validate(valid => {
          if (valid) {
            this.loading = true;
            this.formValidate.type.bankpay = 1;
            // json转formData
            const data = this.uploadBeforeFilter();
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
            callback();
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
  // position: absolute;
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
  // padding-bottom: 50px;
  background: white;
  .fileUpload {
    transform: translate3d(-60px, 0px, 0px);
    opacity: 0;
  }
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
    .spac-ml(10px);
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
    position: relative;
    color: #464c5b;

    .input-item-is-null {
      border: 1px solid #f00 !important;
      border-radius: 4px;
    }

    .fontcount {
      position: absolute;
      margin-left: -35px;
      line-height: 35px;
      color: #999;
    }
  }

  /deep/.image-select-dragable {
    display: inline-block;
    padding-bottom: 0;
    width: 80px;
    height: 80px;
    margin-top: 10px;

    .image-select-dragable-content,
    .image-select-dragable-dragable-add {
      margin-bottom: 0;
      margin-right: 0;
      width: 100%;
      height: 100%;
    }

    .image-select-dragable-dragable-add {
      .upload-file {
        width: 100%;
        height: 100%;
        .ivu-upload {
          margin-left: 0;
        }
      }
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
