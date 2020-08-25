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
        <div class="wx-config">
          <switch-titlebar
            style="margin-bottom: 20px;"
            hasBorder
            :value="true"
            :switchShow="false"
            :tipShow="true"
            tipText="当开启了线上支付和线上提现，必须填写支付接口配置"
            title="微信支付接口配置"
          >
            <FormItem
              label="商户号："
              prop="wxpay_mchid"
              class="margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.wxpay_mchid"
                  class="common-input-text-260"
                  placeholder="请输入商户号"
                />
              </div>
            </FormItem>
            <FormItem
              label="API密钥："
              prop="wxpay_key"
              class="margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.wxpay_key"
                  class="common-input-text-260"
                  placeholder="请输入API密钥"
                />
              </div>
            </FormItem>
            <FormItem
              label="API证书："
              prop="wxpay_certCode"
              class="ivu-form-item-required margin-bottom-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.wxpay_certCode"
                  class="common-input-text-260"
                  style="height: 34px"
                  :class="{'input-item-is-null':isFileSizeIsZero[0]}"
                  readonly
                  placeholder="请上传API证书"
                />
                <Button type="primary" style="margin-left:10px;" class="common-row-btn">上传</Button>
                <input type="file" class="fileUpload" @change="uploadCert($event)" />
              </div>
            </FormItem>
            <FormItem
              label="API证书密钥："
              prop="wxpay_certCode"
              style="margin-bottom: 16px !important;"
              class="ivu-form-item-required margin-bottom-item-form"
            >
              <div class="product-detail-item">
                <Input
                  v-model="formValidate.wxpay_cert_keyCode"
                  class="common-input-text-260"
                  style="height: 34px"
                  :class="{'input-item-is-null':isFileSizeIsZero[1]}"
                  readonly
                  placeholder="请上传API证书密钥"
                />
                <Button type="primary" style="margin-left:10px;" class="common-row-btn">上传</Button>
                <input type="file" class="fileUpload" @change="uploadCertKey($event)" />
              </div>
            </FormItem>
          </switch-titlebar>
        </div>
        <!-- 微信线上支付 -->
        <div class="wx-online">
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="isOpenWxOnlinePay"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="是否开启微信线上支付功能"
            @on-change="changeOpenWxOnlinePay"
          >
            <FormItem label="应用入口：" style="margin-bottom: 16px !important;" class="un-start" v-if="isOpenWxOnlinePay">
              <div class="product-detail-item">
                <CheckboxGroup v-model="formValidate.wxpay_online_entrance">
                  <Checkbox label="pay_retail">支付C端零售单</Checkbox>
                  <Checkbox label="pay_balance_recharge">余额账户充值</Checkbox>
                  <Checkbox label="pay_initial_money" v-if="hasLicensePerm('ENABLE_AGENT')">支付代理加盟费</Checkbox>
                  <!--<Checkbox label="pay_dealer_initial_money" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付经销商加盟费</Checkbox>-->
                  <Checkbox label="pay_cloudstock_purchase"  v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付云仓进货单</Checkbox>
                  <Checkbox label="pay_cloudstock_take_delivery_freight"  v-if="hasLicensePerm('ENABLE_CLOUDSTOCK')">支付云仓提货运费</Checkbox>
                </CheckboxGroup>
              </div>
            </FormItem>
          </switch-titlebar>
        </div>
        <!-- 微信线下支付 -->
        <div class="wx-offline">
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="isOpenWxOfflinePay"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="是否开启微信线下支付功能"
            @on-change="changeOpenWxOfflinePay"
          >
          <FormItem label="应用入口：" class="un-start" v-if="isOpenWxOfflinePay">
            <div class="product-detail-item">
              <CheckboxGroup v-model="formValidate.wxpay_offline_entrance">
                <Checkbox label="pay_balance_recharge">余额账户充值</Checkbox>
                <Checkbox v-show="hasLicensePerm('ENABLE_AGENT')" label="pay_initial_money">支付代理加盟费</Checkbox>
                <!--<Checkbox v-show="hasLicensePerm('ENABLE_CLOUDSTOCK')" label="pay_dealer_initial_money">支付经销商加盟费</Checkbox>-->
                <Checkbox v-show="hasLicensePerm('ENABLE_CLOUDSTOCK')" label="pay_cloudstock_purchase">支付云仓进货单</Checkbox>
              </CheckboxGroup>
            </div>
          </FormItem>
          <FormItem
            label="上传微信收款码："
            prop="wx_qrcode"
            class="margin-bottom-form"
            style="margin-bottom: 16px !important;"
            v-if="isOpenWxOfflinePay"
          >
            <show-big-img-upload 
              imgSize="77px"
              :class="{'has-error': qrcodeError}"
              :InitImgURLs="qrcodeImg"
              v-model="formValidate.wx_qrcode"
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
      isOpenWxOnlinePay: true,
      isOpenWxOfflinePay: false,
      wxpay_cert_key: "",
      wxpay_cert: "",
      qrcodeImg: "",
      qrcodeError: false,
      thirdMenu: [],
      formValidate: {
        type: {
          wxpay: 1,
          wxpay_offline: 1
        },
        wxpay_mchid: "", // 商户号
        wxpay_key: "", // API秘钥
        wxpay_certCode: "", // API证书
        wxpay_cert_keyCode: "", // API证书密钥
        wxpay_online_entrance: ["pay_retail", "pay_balance_recharge"], // 线上应用入口
        wxpay_offline_entrance: [], // 线下应用入口
        wx_qrcode: [], // 微信收款码
        pay_config_type: 1
      },
      ruleValidateBase: {
        wxpay_mchid: [
          {
            required: true,
            message: "商户号不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenWxOnlinePay && !value) {
                callback("商户号不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        wxpay_key: [
          {
            required: true,
            message: "API密钥不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenWxOnlinePay && !value) {
                callback("API密钥不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        wxpay_certCode: [
          {
            required: true,
            message: "API证书不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenWxOnlinePay && !value) {
                callback("API证书不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        wxpay_cert_keyCode: [
          {
            required: true,
            message: "API证书密钥不能为空",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if(this.isOpenWxOnlinePay && !value) {
                callback("API证书密钥不能为空")
              } else {
                callback()
              }
            }
          }
        ],
        wx_qrcode: [
          {
            required: true,
            message: "请上传收款码",
            validator: (rule, value, callback) => {
              if(!value.length && this.hasLicensePerm('ENABLE_AGENT')) {
                this.qrcodeError = true;
                callback("请上传收款码")
              } else {
                this.qrcodeError = false;
                callback()
              }
            }
          }
        ]
      },
      isFileSizeIsZero: {} //上传的文件大小是否为0
    };
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getInfo();
  },
  methods: {
    // 上传证书
    uploadCert(e) {
      if (e.target.files[0].name.indexOf(".pem") <= 0) {
        this.$Message.error("请输入后缀为pem的文件类型！");
        return;
      }
      if (e.target.files[0].size <= 0) {
        this.isFileSizeIsZero[0] = true;
        this.$Message.error("文件大小为0！");
      } else {
        this.isFileSizeIsZero[0] = false;
      }
      if (e.target.files && e.target.files[0]) {
        this.wxpay_cert = e.target.files[0];
        this.formValidate.wxpay_certCode = e.target.files[0].name;
      }
    },
    // 上传证书密钥
    uploadCertKey(e) {
      if (e.target.files[0].name.indexOf(".pem") <= 0) {
        this.$Message.error("请输入后缀为pem的文件类型！");
        return;
      }
      if (e.target.files[0].size <= 0) {
        this.isFileSizeIsZero[1] = true;
        this.$Message.error("文件大小为0！");
      } else {
        this.isFileSizeIsZero[1] = false;
      }
      if (e.target.files && e.target.files[0]) {
        this.wxpay_cert_key = e.target.files[0];
        this.formValidate.wxpay_cert_keyCode = e.target.files[0].name;
      }
    },
    // 开启微信线上支付
    changeOpenWxOnlinePay(status) {
      this.isOpenWxOnlinePay = status;
    },
    // 开启微信线下支付
    changeOpenWxOfflinePay(status) {
      this.isOpenWxOfflinePay = status;
    },
    // 初始化数据
    getInfo() {
      // this.formValidate.wxpay_online_entrance.push("pay_retail");
      this.$httpGet(
        `/shop/admin/payconfig/info`,
        { pay_config_type: 1 },
        res => {
          let wxpay_offline_entrance = [];
          let wxpay_online_entrance = [];
          if (res.msg === this.$store.state.SUCCESS) {
            for (let item in res.data) {
              if (res.data[item]) {
                try {
                  if (item === "type") {
                    const typeParse = JSON.parse(res.data[item]);
                    if (Number(typeParse.wxpay) === 1) {
                      this.isOpenWxOnlinePay = true;
                    } else {
                      this.isOpenWxOnlinePay = false;
                    }
                    if (Number(typeParse.wxpay_offline) === 1) {
                      this.isOpenWxOfflinePay = true;
                    } else {
                      this.isOpenWxOfflinePay = false;
                    }
                    this.$set(this.formValidate, item, typeParse);
                  } else if (item.indexOf("wxpay_cert") > -1) {
                    try {
                      this.$set(
                        this.formValidate,
                        `${item}Code`,
                        res.data[item].substring(
                          res.data[item].lastIndexOf("/") + 1
                        )
                      );
                      this[item] = res.data[item];
                    } catch (error) {
                      throw error;
                    }
                  } else if (item === "wxpay_offline_entrance") {
                    for (const key in JSON.parse(res.data[item])) {
                      if (JSON.parse(res.data[item]).hasOwnProperty(key)) {
                        wxpay_offline_entrance.push(key);
                      }
                    }
                    this.formValidate.wxpay_offline_entrance = wxpay_offline_entrance
                  } else if (item === "wxpay_online_entrance") {
                    for (const key in JSON.parse(res.data[item])) {
                      if (JSON.parse(res.data[item]).hasOwnProperty(key)) {
                        wxpay_online_entrance.push(key);
                      }
                    }
                    this.formValidate.wxpay_online_entrance = wxpay_online_entrance
                  } else if (item === "wx_qrcode") {
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
    // 提交保存前检验数据
    uploadBeforeFilter() {
      let data = Object.assign({}, this.formValidate);
      delete data.wxpay_certCode;
      delete data.wxpay_cert_keyCode;
      delete data.wx_qrcode;
      let tempObj = data.wxpay_online_entrance;
      let tempObj2 = data.wxpay_offline_entrance;

      data.wxpay_online_entrance = {};
      data.wxpay_offline_entrance = {};

      for (const key in tempObj) {
        if (tempObj.hasOwnProperty(key)) {
          data.wxpay_online_entrance[tempObj[key]] = 1;
        }
      }

      for (const key in tempObj2) {
        if (tempObj2.hasOwnProperty(key)) {
          data.wxpay_offline_entrance[tempObj2[key]] = 1;
        }
      }

      let formData = this.objectToFormData(data);
      // 没有改变过的情况下就不传该key值上去
      if (this.wxpay_cert) {
        formData.append("wxpay_cert", this.wxpay_cert);
      }
      if (this.wxpay_cert_key) {
        formData.append("wxpay_cert_key", this.wxpay_cert_key);
      }
      if (this.formValidate.wx_qrcode.length) {
        formData.append("wx_qrcode", this.formValidate.wx_qrcode[0]);
      }
      return formData;
    },
    // 提交
    onHandleSubmit(name) {
      // 如果关闭
      if (!this.isOpenWxOnlinePay && !this.isOpenWxOfflinePay) {
        this.loading = true;
        this.formValidate.type.wxpay = 0;
        this.formValidate.type.wxpay_offline = 0;

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
            if (this.isOpenWxOnlinePay) {
              this.formValidate.type.wxpay = 1;
            } else {
              this.formValidate.type.wxpay = 0;
            }
            if (this.isOpenWxOfflinePay) {
              this.formValidate.type.wxpay_offline = 1;
            } else {
              this.formValidate.type.wxpay_offline = 0;
            }

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

  .wx-offline {
    .margin-bottom-form {
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
      .enlarge-img{
        position: absolute;
        top: 10px;
        left: 70px;
        background: #fff;
        border-radius: 50%;
        cursor: pointer;
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
    color: #464C5B;
    .common-row-btn{
      width: 58px;
      height: 32px;
    }
    .input-item-is-null {
      border: 1px solid #f00 !important;
      border-radius: 4px;
    }
  }

  // /deep/.image-select-dragable {
  //   display: inline-block;
  //   padding-bottom: 0;
  //   width: 80px;
  //   height: 80px;
  //   margin-top: 10px;

  //   .image-select-dragable-content,
  //   .image-select-dragable-dragable-add {
  //     margin-bottom: 0;
  //     margin-right: 0;
  //     width: 100%;
  //     height: 100%;
  //   }

  //   .image-select-dragable-dragable-add {
  //     .upload-file {
  //       width: 100%;
  //       height: 100%;
  //       .ivu-upload {
  //         margin-left: 0;
  //       }
  //     }
  //   }

  //   .image-select-dragable-item {
  //     width: 80px;
  //     height: 80px;
  //   }
  // }
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
