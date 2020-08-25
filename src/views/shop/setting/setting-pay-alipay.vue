<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container">
      <Form
        ref="formValidateBase2"
        :model="formValidate"
        :rules="ruleValidateBase"
        :label-width="145"
        class="form-full-wrapper"
      >
        <div class="ali-config">
          <switch-titlebar
            style="margin-bottom: 20px;"
            hasBorder
            :value="true"
            :tipShow="true"
            :switchShow="false"
            title="支付宝接口配置"
            tipText="当开启了线上支付和线上提现，必须填写支付接口配置"
          >
            <FormItem
              label="APPID："
              prop="alipay_appid"
              class="margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.alipay_appid"
                  class="common-input-text-260"
                  placeholder="请输入APPID"
                />
              </div>
            </FormItem>
            <FormItem
              label="支付宝公钥："
              prop="alipay_public_key"
              class="ivu-form-item-required margin-bottom-form"
            >
              <div class="product-detail-item" style="line-height:1;">
                <Input
                  type="textarea"
                  v-model="formValidate.alipay_public_key"
                  style="width:260px;"
                  placeholder="请输入支付宝公钥"
                />
              </div>
            </FormItem>
            <FormItem
              label="应用私钥："
              prop="alipay_private_key"
              class="ivu-form-item-required margin-bottom-item-form"
              style="margin-bottom: 16px !important;"
            >
              <div class="product-detail-item" style="line-height:1;">
                <Input
                  type="textarea"
                  v-model="formValidate.alipay_private_key"
                  style="width:260px;"
                  placeholder="请输入应用私钥"
                />
              </div>
            </FormItem>
          </switch-titlebar>
        </div>
        <!-- 支付宝线上支付 -->
        <div class="ali-online">
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="isOpenAliOnlinePay"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="是否开启支付宝线上支付功能"
            @on-change="changeOpenAliOnlinePay"
          >
            <FormItem label="应用入口：" class="un-start" style="margin-bottom: 16px !important;" v-if="isOpenAliOnlinePay">
              <div class="product-detail-item">
                <CheckboxGroup v-model="formValidate.alipay_online_entrance">
                  <Checkbox label="pay_retail">支付C端零售单</Checkbox>
                  <Checkbox label="pay_balance_recharge">余额账户充值</Checkbox>
                  <Checkbox label="pay_initial_money"  v-if="hasLicensePerm('ENABLE_AGENT')">支付代理加盟费</Checkbox>
                  <!--<Checkbox label="pay_dealer_initial_money" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付经销商加盟费</Checkbox>-->
                  <Checkbox label="pay_cloudstock_purchase"  v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付云仓进货单</Checkbox>
                  <Checkbox label="pay_cloudstock_take_delivery_freight"  v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付云仓提货运费</Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
          </switch-titlebar>
        </div>

        <!-- 支付宝线下支付 -->
        <div class="ali-offline">
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="isOpenAliOfflinePay"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="是否开启支付宝线下支付功能"
            @on-change="changeOpenAliOfflinePay"
          >
          <FormItem label="应用入口：" class="un-start" v-if="isOpenAliOfflinePay">
            <div class="product-detail-item">
              <CheckboxGroup v-model="formValidate.alipay_offline_entrance">
                <Checkbox label="pay_balance_recharge">余额账户充值</Checkbox>
                <Checkbox v-show="hasLicensePerm('ENABLE_AGENT')" label="pay_initial_money">支付代理加盟费</Checkbox>
                <!--<Checkbox label="pay_dealer_initial_money" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付经销商加盟费</Checkbox>-->
                <Checkbox v-show="hasLicensePerm('ENABLE_CLOUDSTOCK')" label="pay_cloudstock_purchase">支付云仓进货单</Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
          <FormItem label="支付类型：" class="un-start" v-if="isOpenAliOfflinePay">
            <div class="product-detail-item">
              <RadioGroup
                v-model="formValidate.alipay_offline_pay_type"
              >
                <Radio :label="0">支付宝账号</Radio>
                <Radio :label="1">支付宝收款码</Radio>
              </RadioGroup>
            </div>
          </FormItem>
          <FormItem
            label="账户名称："
            prop="alipay_name"
            v-show="isOpenAliOfflinePay&&formValidate.alipay_offline_pay_type==0"
            class="margin-bottom-form"
          >
            <div class="product-detail-item">
              <Input
                v-model="formValidate.alipay_name"
                class="common-input-text-260"
                placeholder="请输入账户名称"
              />
            </div>
          </FormItem>
          <FormItem
            label="支付宝账号："
            prop="alipay_account"
            v-show="isOpenAliOfflinePay&&formValidate.alipay_offline_pay_type==0"
            class="margin-bottom-form"
            style="margin-bottom: 16px !important;"
          >
            <div class="product-detail-item">
              <Input
                v-model="formValidate.alipay_account"
                class="common-input-text-260"
                placeholder="请输入支付宝账号"
                @on-keyup="formValidate.alipay_account=formValidate.alipay_account.replace(/[^\a-\z\A-\Z0-9\@\.]/g,'')"
              />
            </div>
          </FormItem>
          <FormItem
            label="上传支付宝收款码："
            prop="alipay_qrcode"
            class="margin-bottom-form2"
            style="margin-bottom: 16px !important;"
            v-show="isOpenAliOfflinePay&&formValidate.alipay_offline_pay_type==1"
          >
             <show-big-img-upload 
              imgSize="77px"
              :class="{'has-error': qrcodeError}"
              :InitImgURLs="qrcodeImg"
              v-model="formValidate.alipay_qrcode"
            ></show-big-img-upload>
          </FormItem>
          </switch-titlebar>
        </div>
      </Form>
      <div class="footer">
        <Button
          shape="circle"
          class="save"
          type="primary"
          @click="onHandleSubmit('formValidateBase2')"
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
import imageDragable from "COMPONENTS/image-select/image-select-dragable.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue"
export default {
  components: {
    footButton,
    thirdMenu,
    imageDragable,
    switchTitlebar,
    showBigImgUpload
  },
  data() {
    return {
      loading: false,
      isOpenAliOnlinePay: true,
      isOpenAliOfflinePay: true,
      alipay_cert: null,
      alipay_cert_key: null,
      qrcodeImg: "",
      qrcodeError: false,
      thirdMenu: [],
      formValidate: {
        type: {
          alipay: 1,
          alipay_offline: 1
        },
        alipay_appid: "", // appid
        alipay_public_key: "", // 支付宝公钥
        alipay_private_key: "", // 应用私钥
        alipay_name: "", // 账户名称
        alipay_account: "", // 支付宝账号
        alipay_online_entrance: ["pay_retail", "pay_balance_recharge"], // 线上应用入口
        alipay_offline_entrance: [], // 线下应用入口
        alipay_qrcode: [], // 支付宝收款码
        alipay_offline_pay_type: 0,
        pay_config_type: 2
      },
      ruleValidateBase: {
        alipay_appid: [
          {
            required: true,
            message: "请输入APPID",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenAliOnlinePay && !value) {
                callback("请输入APPID")
              } else {
                callback()
              }
            }
          }
        ],
        alipay_public_key: [
          {
            required: true,
            message: "请输入支付宝公钥",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenAliOnlinePay && !value) {
                callback("请输入支付宝公钥")
              } else {
                callback()
              }
            }
          }
        ],
        alipay_private_key: [
          {
            required: true,
            message: "请输入应用私钥",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenAliOnlinePay && !value) {
                callback("请输入应用私钥")
              } else {
                callback()
              }
            }
          }
        ],
        alipay_name: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value || this.formValidate.alipay_offline_pay_type==1 || !this.isOpenAliOfflinePay) {
                callback();
              } else {
                callback(new Error("请输入账户名称"));
              }
            }
          }
        ],
        alipay_account: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value || this.formValidate.alipay_offline_pay_type==1 || !this.isOpenAliOfflinePay) {
                callback();
              } else {
                return callback(new Error("请输入支付宝账号"));
              }
            }
          }
        ],
        alipay_qrcode: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              if (value.length || this.formValidate.alipay_offline_pay_type==0 || !this.isOpenAliOfflinePay) {
                this.qrcodeError = false;
                callback();
              } else {
                this.qrcodeError = true;
                return callback(new Error("请上传收款码"));
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
    // 支付宝支付类型切换
    // itemChange(e) {
    //   if (e == 0) {
    //     this.formValidate.alipay_offline_pay_type = 0;
    //     // this.$refs["formValidateBase2"].fields.forEach(function(e) {
    //     //   if (e.prop == "alipay_qrcode") {
    //     //     e.resetField();
    //     //   }
    //     // });
    //   } else {
    //     this.formValidate.alipay_offline_pay_type = 1;
    //     // this.$refs["formValidateBase2"].fields.forEach(function(e) {
    //     //   if (e.prop == "alipay_account" || e.prop == "alipay_name") {
    //     //     e.resetField();
    //     //   }
    //     // });
    //   }
    // },
    // 开启支付宝线上支付
    changeOpenAliOnlinePay(status) {
      this.isOpenAliOnlinePay = status;
    },
    // 开启支付宝线下支付
    changeOpenAliOfflinePay(status) {
      this.isOpenAliOfflinePay = status;
    },
    // 初始化数据
    getInfo() {
      // this.formValidate.alipay_online_entrance.push("pay_retail");
      this.$httpGet(
        `/shop/admin/payconfig/info`,
        { pay_config_type: 2 },
        res => {
          let alipay_offline_entrance = [];
          let alipay_online_entrance = [];
          if (res.msg === this.$store.state.SUCCESS) {
            for (let item in res.data) {
              if (res.data[item]) {
                try {
                  if (item === "type") {
                    const typeParse = JSON.parse(res.data[item]);
                    if (Number(typeParse.alipay) === 1) {
                      this.isOpenAliOnlinePay = true;
                    } else {
                      this.isOpenAliOnlinePay = false;
                    }
                    if (Number(typeParse.alipay_offline) === 1) {
                      this.isOpenAliOfflinePay = true;
                    } else {
                      this.isOpenAliOfflinePay = false;
                    }
                    this.$set(this.formValidate, item, typeParse);
                  } else if (item === "alipay_offline_entrance") {
                    for (const key in JSON.parse(res.data[item])) {
                      if (JSON.parse(res.data[item]).hasOwnProperty(key)) {
                        alipay_offline_entrance.push(key);
                      }
                    }
                    this.formValidate.alipay_offline_entrance = alipay_offline_entrance
                  } else if (item === "alipay_online_entrance") {
                    for (const key in JSON.parse(res.data[item])) {
                      if (JSON.parse(res.data[item]).hasOwnProperty(key)) {
                        alipay_online_entrance.push(key);
                      }
                    }
                    this.formValidate.alipay_online_entrance = alipay_online_entrance
                  } else if (item === "alipay_qrcode") {
                    this.qrcodeImg = res.data[item];
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
      delete data.alipay_qrcode;
      let tempObj = data.alipay_online_entrance;
      let tempObj2 = data.alipay_offline_entrance;

      data.alipay_offline_pay_type = Number(data.alipay_offline_pay_type);

      data.alipay_online_entrance = {};
      data.alipay_offline_entrance = {};

      for (const key in tempObj) {
        if (tempObj.hasOwnProperty(key)) {
          data.alipay_online_entrance[tempObj[key]] = 1;
        }
      }

      for (const key in tempObj2) {
        if (tempObj2.hasOwnProperty(key)) {
          data.alipay_offline_entrance[tempObj2[key]] = 1;
        }
      }

      let formData = this.objectToFormData(data);
      // 没有改变过的情况下就不传改key值上去
      if (this.formValidate.alipay_qrcode.length) {
        formData.append("alipay_qrcode", this.formValidate.alipay_qrcode[0]);
      }
      return formData;
    },
    // 提交
    onHandleSubmit(name) {
      // 如果关闭
      if (!this.isOpenAliOnlinePay && !this.isOpenAliOfflinePay) {
        this.loading = true;
        this.formValidate.type.alipay = 0;
        this.formValidate.type.alipay_offline = 0;
        this.$refs[name].validate(() => {})
        const data = this.uploadBeforeFilter();
        this.$httpUpload(`/shop/admin/payconfig/edit`, data, res => {
          this.loading = false;
          if (res.msg === this.$store.state.SUCCESS) {
            this.$Message.success(this.$store.state.SUCCESS_MSG);
          }
        });
      } else {
        // 只要有一个开启
        this.$refs[name].validate(valid => {
          if (valid) {
            this.loading = true;
            if (this.isOpenAliOnlinePay) {
              this.formValidate.type.alipay = 1;
            } else {
              this.formValidate.type.alipay = 0;
            }
            if (this.isOpenAliOfflinePay) {
              this.formValidate.type.alipay_offline = 1;
            } else {
              this.formValidate.type.alipay_offline = 0;
            }
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

  .ali-offline {
    .margin-bottom-form2 {
      height: 80px;
      /deep/.ivu-form-item-content {
        height: 100%;
      }
    }
    /deep/.ivu-form-item-content {
      position: relative;
      .img {
        width: 77px;
        height: 77px;
        border: none;
        // padding: 2px;
        object-fit: contain;
        cursor: pointer;
        &::after {
          content: "+";
          font-size: 44px;
          color: #bfc2c8;
          display: flex;
          width: 79px;
          height: 79px;
          position: absolute;
          top: -1px;
          left: -1px;
          background: #fff;
          justify-content: center;
          align-items: center;
          border: 1px dashed #ccc;
          border-radius: 5px;
        }
      }

      .delete-img {
        position: absolute;
        top: -7px;
        left: 70px;
        background: #fff;
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }
  .unit {
    display: inline-block;
    vertical-align: middle;
    .spac-ml(@unitml);
  }
  /deep/.ivu-upload {
    display: inline-block;
    width: 80px;
    height: 80px;
  }

  /deep/.un-start .ivu-form-item-label:before {
    content: unset;
  }
  /deep/.ivu-checkbox,
  /deep/.ivu-radio {
    .spac-mr(@checkboxmr);
  }
  /deep/.ivu-radio-wrapper,
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
    /deep/textarea {
      min-height:76px;
      padding: 6px;
      color: #464c5b;
      &:focus {
        box-shadow: none;
      }
      &::-webkit-input-placeholder {
        color: #ccc;
      }
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
