<template>
  <div class="right-menu">
    <Poptip
      @on-popper-show="onShowPoptip"
      placement="bottom"
      :word-wrap="true"
      :transfer="true"
      padding="15px 22px"
      trigger="hover"
    >
      <div class="pop-btn">
        <span class="pop-btn-text">商城端</span>
        <span class="pop-btn-icon">
          <i class="iconfont icon-QRcode" style="font-size:16px"></i>
        </span>
      </div>
      <div slot="content" :style="{ textAlign: 'left' }">
        <div :style="{ marginBottom: '10px' }">商城主页推广链接</div>
        <div style="margin-bottom:30px;display:flex;align-items: flex-end;">
          <Input :value="pageUrl" :readonly="true" style="width:244px" />
          <Button
            type="primary"
            style="height:32px;margin-left:5px"
            @click="copyLinkUrl(pageUrl)"
          >复制</Button>
        </div>
        <div style="position: relative;display: flex;">
          <div style="flex:1">
            <div style="margin-bottom: 20px;">H5/公众号二维码</div>
            <canvas ref="canvas"></canvas>
          </div>
          <div v-if="wxAppQrcode&&hasLicensePerm('ENABLE_WXAPP')" style="width: 60px;position: relative;">
            <div
              style="position:absolute;left:50%;bottom:10px;border-left:1px dashed #DCDEE2;width:1px;height: 75%;"
            ></div>
          </div>
          <div v-if="wxAppQrcode&&hasLicensePerm('ENABLE_WXAPP')" style="flex:1">
            <div style="margin-bottom: 20px;">微信小程序二维码</div>
            <div>
              <img :src="wxAppQrcode" style="width: 115px;" />
            </div>
          </div>
        </div>
      </div>
    </Poptip>
    <Poptip
      placement="bottom-end"
      :word-wrap="true"
      :transfer="true"
      padding="15px 22px"
      trigger="hover"
    >
      <div class="pop-btn">
        <span class="pop-btn-text">员工端</span>
        <span class="pop-btn-icon">
          <i class="iconfont icon-xiaochengxu" style="color:#605ab0"></i>
        </span>
      </div>
      <div slot="content" :style="{ textAlign: 'left' }">
        <div :style="{ marginBottom: '10px' }">员工端小程序链接</div>
        <div>企业ID：{{ siteID }}</div>
        <img src="images/home/applets-qrcode.png" alt class="crm-img" />
      </div>
    </Poptip>
    <Poptip
        placement="bottom"
        :word-wrap="false"
        :transfer="true"
        padding="24px 22px"
        trigger="hover"
        v-if="hasLicensePerm('ENABLE_SUPPLIER')"
    >
      <div class="pop-btn">
        <span class="pop-btn-text">供应商端</span>
        <span class="pop-btn-icon">
          <i class="iconfont icon-gonghuoshang" style="font-size:17px;color: #41B44D;"></i>
        </span>
      </div>
      <div slot="content" :style="{ textAlign: 'left' }">
        <div :style="{ marginBottom: '20px' }">供应商后台登录地址：</div>
        <div style="display:flex;align-items: flex-end;">
          <Input :value="supplierUrl" :readonly="true" style="width:244px" />
          <Button
              type="primary"
              style="height:32px;margin-left:5px"
              @click="copyLinkUrl(supplierUrl)"
          >复制</Button>
        </div>
      </div>
    </Poptip>
    <Poptip trigger="hover" width="130" placement="bottom-end">
      <div class="username">
        {{ $store.state.userInfo ? $store.state.userInfo.name : "请先登录" }}
        <Icon type="ios-arrow-down" size="15"></Icon>
      </div>
      <div class="content" slot="content">
        <div class="item">
          <a href="http://help.wfenxian.com" class="help-link" target="_blank">
            <i style="color:#5D86FB;" class="iconfont icon-ios-help-circle-outl"></i>帮助中心
          </a>
        </div>
        <div class="item" @click="showModal = true">
          <i style="color:#F7A52F" class="iconfont icon-ios-lock"></i>修改密码
        </div>
        <div class="item" @click="logout">
          <i style="color:#F9530A" class="iconfont icon-ios-power"></i>退出登录
        </div>
      </div>
    </Poptip>
    <Modal
      class="pass-modal"
      v-model="showModal"
      title="修改密码"
      :mask-closable="false"
      width="390"
      @on-cancel="cancel"
    >
      <Form ref="form" :model="fields" :rules="rules" :label-width="84">
        <FormItem label="旧密码" prop="oldPass">
          <Input type="password" v-model="fields.oldPass" placeholder="请输入旧密码" />
        </FormItem>
        <FormItem label="新密码" prop="newPass">
          <Input type="password" v-model="fields.newPass" placeholder="请输入新密码" />
        </FormItem>
        <FormItem label="确认密码" prop="newPass2">
          <Input type="password" v-model="fields.newPass2" placeholder="请再次输入新密码" />
        </FormItem>
      </Form>
      <div class="footer" slot="footer">
        <Button type="text" @click="cancel">取消</Button>
        <Button type="primary" @click="confirm">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import axios from "axios";
import { findComponentDownward } from "@/views/shop/utils/utils";
import { Promise } from "q";
import QRCode from "qrcode";
export default {
  components: {
    QRCode
  },
  data() {
    const validateOldPass = (rule, value, callback) => {
      if (!value) {
        callback("请输入旧密码");
      } else {
        callback();
      }
    };
    const validateNewPass = (rule, value, callback) => {
      if (!value) {
        callback("请输入新密码");
      } else if (!value.match(/^(?=\w*[0-9])(?=\w*[a-zA-Z])(\w{8,})$/)) {
        callback("密码不少于8位，必须包含数字和字母");
      } else {
        if (this.fields.newPass2 != "") {
          this.$refs.form.validateField("newPass2");
        }
        callback();
      }
    };
    const validateNewPass2 = (rule, value, callback) => {
      if (!value) {
        callback("请再次输入新密码");
      } else if (value != this.fields.newPass) {
        callback("与新密码不一致");
      } else {
        callback();
      }
    };
    return {
      loginBtnStatus: false,
      showModal: false,
      fields: {
        oldPass: "",
        newPass: "",
        newPass2: ""
      },
      rules: {
        oldPass: [
          { required: true, validator: validateOldPass, trigger: "blur" }
        ],
        newPass: [
          { required: true, validator: validateNewPass, trigger: "blur" }
        ],
        newPass2: [
          { required: true, validator: validateNewPass2, trigger: "blur" }
        ]
      },
      poptipHomeShow: false,
      poptipCrmShow: false,
      pageUrl: "",
      supplierUrl:"",
      siteID: 0
    };
  },
  mounted() {
    var domain = location.host;
    if (domain.indexOf("localhost") > -1 || !domain) {
      domain = "shop.test.72dns.net";
    }
    this.pageUrl = "http://" + domain + "/shop/front/";
    this.supplierUrl = "http://"+domain+"/shop/supplier";
    // 获取siteid
    this.siteID = this.getCookie("InitSiteID");
    this.loadWxAppInfo();
  },
  computed: {
    wxAppQrcode() {
      if (this.hasLicensePerm("ENABLE_WXAPP") && this.$store.state.wxAppInfo && this.$store.state.wxAppInfo.qrcode) {
        return (
          this.$store.state.siteComdataPath + this.$store.state.wxAppInfo.qrcode
        );
      } else {
        return "";
      }
    }
  },
  methods: {
    loadWxAppInfo() {
      this.$httpGet("/shop/admin/wxapp/config/info", {}, res => {
        if (res.code == 200) {
          this.$store.state.wxAppInfo = res.data.config;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    cancel() {
      this.showModal = false;
      this.$refs.form.resetFields();
    },
    confirm() {
      window.form = this.$refs.form;
      this.$refs.form.validate(valid => {
        if (valid) {
          axios
            .post("/shop/admin/staff/password", {
              password: this.fields.newPass,
              password_confirm: this.fields.newPass2,
              password_old: this.fields.oldPass
            })
            .then(res => {
              if (res.code == 200) {
                this.showModal = false;
                this.$refs.form.resetFields();
                this.$Message.success(res.msg);
              } else {
                this.$Message.error(res.msg);
                this.$refs.form.fields[0].validateState = "error";
                this.$refs.form.fields[0].validateMessage = res.msg;
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        }
      });
    },
    logout() {
      if (this.loginBtnStatus) {
        return;
      }
      this.$Modal.confirm({
        title: "提示",
        content:"是否确定退出登录？",
        onOk: () => {
          let promiseArray = [];
          // 如何是编辑页面则需要先保存数据
          if (
            this.$route.name === "storeDesignMobile" ||
            this.$route.name === "storeDesignHomeMobile"
          ) {
            promiseArray.push(
              findComponentDownward(
                this.$root,
                "storeDesignMobile"
              ).beforeLeaveCallBack()
            );
          }
          Promise.all(promiseArray).then(() => {
            this.$httpGet("/shop/admin/logout", null, res => {
              this.$router.push({ path: "/login" });
            });
          });
        }
      });
    },
    /**
     * 复制页面链接
     */
    copyLinkUrl(url) {
      var oInput = document.createElement("input");
      oInput.value = url;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.style.display = "none";
      document.body.removeChild(oInput);
      this.$Message.success("数据已复制到剪切板");
    },
    onShowPoptip() {
      var canvas = this.$refs.canvas;
      QRCode.toCanvas(canvas, this.pageUrl, { margin: 1 }, function(error) {
        if (error) console.error(error);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.right-menu {
  text-align: right;
  /deep/.ivu-poptip {
    margin-right: 20px;

    .ivu-poptip-popper {
      top: 45px !important;
      left: unset !important;
      right: 12px;
      width: 130px;
      min-width: 130px;

      .ivu-poptip-inner {
        padding: 5px 0;
      }
    }
  }
  .username {
    display: inline-block;
    cursor: pointer;
  }
  .item {
    font-size: 13px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: #f3f3f3;
    }
    .iconfont {
      margin-right: 10px;
    }
    .help-link,
    .help-link:hover,
    .help-link:active,
    .help-link:visited {
      color: #464c5b;
    }
  }
  /deep/.ivu-poptip-body {
    padding: 0 !important;
  }
}
.crm-img {
  width: 360px;
  margin-top: 10px;
}
.pop-btn-icon {
  vertical-align: text-top;
  line-height: 1;
  .iconfont {
    margin-left: 5px;
    font-size: 18px;
    line-height: 1;
  }
}
.pop-btn {
  cursor: pointer;
}
.pass-modal {
  /deep/.ivu-modal-body {
    height: 220px;
    padding: 28px;
    .ivu-form-item {
      margin-bottom: 30px;
    }
  }
}
</style>
