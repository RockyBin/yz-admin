<template>
  <div>
    <Spin size="large" fix v-if="showLoading"></Spin>
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <div class="main-board" v-show="loaded" v-if="!noSsl">
        <div class="wrapper">
          <alert-warning v-show="loaded">
            <p>
              1. 绑定后，即可以发布您的小程序到微信平台。
              <router-link
                v-if="isBound"
                perm="wxapp.config.view"
                to="/channel/wxapp/wxapp-publish"
              >点击发布</router-link>
            </p>
            <p>
              2. 为了正常使用微信的功能，请绑定企业认证的小程序。 没有账号，
              <a perm="wxapp.config.operate" target="_blank" href="https://mp.weixin.qq.com">去申请</a>
            </p>
            <p v-if="isBound">
              3. 绑定后，如非必要，请不要随意改动绑定信息。如不再使用小程序，请解绑。
              <a
                @click="unbind"
                perm="wxapp.config.operate"
              >去解绑</a>
            </p>
          </alert-warning>
          <h3>
            <span>微信小程序绑定</span>
          </h3>
          <Form ref="form" :model="formField" :rules="rules" :label-width="120">
            <FormItem label="AppID：" prop="appid">
              <Input v-model="formField.appid" :disabled="isBound" placeholder="请输入小程序AppID" />
            </FormItem>
            <FormItem label="AppSecret：" prop="appsecret">
              <Input v-model="formField.appsecret" placeholder="请输入小程序AppSecret" />
            </FormItem>
            <FormItem label="小程序名称：" prop="name">
              <Input v-model="formField.name" placeholder="请输入小程序名称" />
            </FormItem>
            <FormItem label="域名选择：" prop="domain">
              <Select :disabled="isBound" v-model="formField.domain" style="width:200px">
                <Option
                  v-for="(item, index) in domainList"
                  :value="item.domain"
                  :key="index"
                >{{ item.domain }}</Option>
              </Select>
            </FormItem>
            <FormItem label="小程序二维码：" prop="qrcode">
              <show-big-img-upload
                ref="show-big-img-upload"
                imgSize="40px"
                :InitImgURLs="formField.qrcode"
                v-model="qrcode"
              ></show-big-img-upload>
            </FormItem>
            <FormItem label="验证文件：" prop="verify" class="verify">
              <upload-button
                type="default"
                @fileSelected="formField.verify=$event"
                :url="formField.verify&&($store.state.siteComdataPath+formField.verify)"
              ></upload-button>
            </FormItem>
          </Form>
        </div>
        <div class="footer">
          <Button
            class="save-btn"
            type="primary"
            shape="circle"
            @click="submit"
            perm="wxapp.config.operate"
          >保存</Button>
        </div>
      </div>
      <div class="nossl-tips" v-show="loaded" v-if="noSsl">
        <div style="width: 98px;height: 80px;margin: 0 auto;">
          <img src="images/wxapp/certificate.png" style="width: 100%;height: 100%;" alt="" />
        </div>
        <div style="margin: 32px 0 30px;text-align: center;">应微信小程序官方要求，开通小程序请先配置SSL证书</div>
        <div style="text-align: center;">
          <router-link style="display: inline-block;color: #fff;border-radius: 20px;background-color: #3F63F7;padding: 10px 38px 9px 39px;font-size: 16px;" perm="ssl.config.view" to="/setting/ssl/list">前往设置SSL证书</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Clipboard from "clipboard";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue";
import uploadButton from "@/views/shop/components/button/upload-button.vue";
import thirdMenuData from "../components/third-menu-for-channel-wxapp";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
export default {
  components: {
    thirdMenu,
    alertWarning,
    uploadButton,
    showBigImgUpload
  },
  data() {
    const validate = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请上传二维码"));
      } else {
        callback();
      }
    };
    const validateFile = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请上传请验证文件"));
      } else {
        callback();
      }
    };

    return {
      showLoading: false,
      isBound: false,
      loaded:false,//页面是否加载完成
      noSsl: false,
      domainList: [],
      thirdMenu: [],
      formField: {
        id: "",
        appid: "",
        appsecret: "",
        name: "",
        domain: "",
        qrcode: null,
        verify: null
      },
      qrcode: [],
      rules: {
        appid: [{ required: true, message: "请输入小程序AppID", trigger: "blur" }],
        appsecret: [
          { required: true, message: "请输入小程序AppSecret", trigger: "blur" }
        ],
        name: [
          { required: true, message: "请输入小程序名称", trigger: "blur" }
        ],
        domain: [{ required: true, message: "请选择域名", trigger: "blur" }],
        qrcode: [
          {
            required: true,
            validator: (rule, value, callback) => {
              validate(rule, this.qrcode[0], callback);
            },
            trigger: "change"
          }
        ],
        verify: [{ required: true, validator: validateFile, trigger: "change" }]
      }
    };
  },
  watch: {
    qrcode: function(val) {
      if (val && val.length) {
        this.$refs.form.validateField("qrcode");
      }
    },
    "formField.verify": function() {
      this.$refs.form.validateField("verify");
    }
  },
  created() {
    this.getConfig();
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    var clipboard = new Clipboard(".copy-btn");
    clipboard.on(
      "success",
      function(e) {
        e.clearSelection(); //清除复制后文字的选中状态
        if (e.text) {
          this.$Message.success("数据已复制到剪贴板");
        }
      }.bind(this)
    );

    clipboard.on(
      "error",
      function(e) {
        this.$Message.error("复制失败");
      }.bind(this)
    );
  },
  methods: {
    getConfig() {
      this.showLoading = true;
      this.$httpGet("/shop/admin/wxapp/config/info", {}, res => {
        this.showLoading = false;
        if (res.code == 200) {
          this.qrcode =
            res.data.config && res.data.config.qrcode
              ? [res.data.config.qrcode]
              : [];
          Object.assign(this.formField, res.data.config);
          this.$store.state.wxAppInfo = res.data.config;
          this.domainList = res.data.domain_list;
          this.isBound = !!res.data.config;
          if (this.domainList.length < 1) {
            this.noSsl = true;
          }
        } else {
          this.$Message.error(res.msg);
        }
        this.loaded = true;
      });
    },
    unbind() {
      this.$Modal.confirm({
        title: "提示",
        content: "解绑后，您的微信小程序将不能正常使用，确定是否要解绑？",
        loading: true,
        onOk: () => {
          this.showLoading = false;
          this.$httpGet("/shop/admin/wxapp/config/delete", {}, res => {
            if (res.code == 200) {
              this.$Message.success("解绑成功");
              this.isBound = false;
              this.qrcode = [];
              document
                .querySelectorAll(".show-big-img-upload .delete")
                .forEach(element => {
                  element.click();
                });
              this.formField = {
                id: "",
                appid: "",
                appsecret: "",
                name: "",
                domain: "",
                qrcode: null,
                verify: null
              };
              this.$Modal.remove();
            } else {
              this.$Message.error(res.msg);
              this.$Modal.remove();
            }
          });
        }
      });
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let formData = new FormData();
          for (let key in this.formField) {
            if (key == "qrcode") {
              formData.append(key + "_file", this[key][0]);
            } else if (key == "verify") {
              formData.append(key + "_file", this.formField[key]);
            } else {
              formData.append(key, this.formField[key]);
            }
          }
          this.showLoading = true;
          this.$httpUpload("/shop/admin/wxapp/config/save", formData, res => {
            this.showLoading = false;
            if (res.code == 200) {
              this.$Message.success("保存成功");
              this.isBound = true;
              this.$store.state.wxAppInfo = res.data.config;
            } else {
              this.$Message.error(res.msg);
            }
          });
        } else {
          this.$Message.error("有未填写的表单字段！");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.main-board {
  width: 100%;
  height: 100%;
  background: #fff;
  padding-bottom: 50px;
  .wrapper {
    padding: 24px;
    /*height: calc(100vh - 120px);*/
    overflow: auto;
    .verify {
      /deep/.ivu-form-item-error-tip {
        margin-top: 1px;
      }
    }
  }
  h3 {
    position: relative;
    height: 32px;
    line-height: 32px;
    margin: 24px 0;
    font-size: 14px;
    &:before {
      position: absolute;
      content: "";
      width: 4px;
      height: 18px;
      left: 0px;
      top: 6px;
      border-radius: 20px;
      background: #4570ea;
    }
    & > span {
      margin-left: 12px;
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
  /deep/.ivu-form-item {
    margin-bottom: 30px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  /deep/.ivu-input-wrapper,
  /deep/.ivu-select {
    width: 260px !important;
    height: 32px !important;
  }
  /deep/.upload-wrapper + .ivu-form-item-error-tip {
    top: auto;
    bottom: 0;
    left: 50px;
  }
  .copy-text {
    display: inline-block;
    width: 250px;
    line-height: 25px;
    padding-top: 4px;
    vertical-align: top;
    word-break: break-all;
  }
  .copy-btn {
    width: 58px;
    height: 32px;
    margin-left: 10px;
  }
}
.nossl-tips {
  padding: 249px 100px 100px;
  font-size: 14px;
}
</style>