<template>
  <div>
    <Spin size="large" fix v-if="showLoading"></Spin>
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <div class="main-board" v-show="loaded" v-if="!noSsl && !noWxApp">
        <div class="wrapper">
          <div class="wxapp-issue-steps" v-if="isShowTitle">
            <div class="wxapp-steps-item" @click="backToStepOne">
              <div class="wxapp-steps-step common_is_finish"><div>1</div>设置小程序样式</div>
            </div>
            <div class="wxapp-steps-item" @click="backToStepTwo">
              <div
                class="wxapp-steps-step"
                :class="{'common_is_finish': currentStep >= 2}"
              ><div>2</div>上传小程序代码包</div>
            </div>
            <div class="wxapp-steps-item">
              <div
                class="wxapp-steps-step"
                :class="{'common_is_finish': currentStep >= 3}"
              ><div>3</div>{{uploadType == 2 ? '下载并手动发布' : '提交审核'}}</div>
            </div>
          </div>
          <step-one v-if="currentStep == 1" :info="formField" @onsubmit="submitStepOne"></step-one>
          <step-two v-if="currentStep == 2" :info="appInfo" @stepThreeFinish="threeFinish" @previousStep="previousStep"></step-two>
          <manualDownload v-if="uploadType == 2" :file="packageUrl" @reSelect="reSelect"></manualDownload>
          <onlineIssue
            v-if="uploadType == 1 && !isOnlineSuccess"
            @reSelect="reSelect"
            @accept="accept"
          ></onlineIssue>
          <Modal
            v-model="qrModal"
            title="授权码"
            width="300px"
            :mask-closable="false"
            @on-cancel="close"
          >
            <p class="countdown-tip-one issue_shop_color" v-if="haveRequest">
              请在
              <span class="countdown">{{countdownTime}}</span>秒内扫码，完成授权
            </p>
            <p class="requesting issue_shop_color" v-if="requesting">正在请求授权码</p>
            <p class="fail-tips issue_shop_color" v-if="failTips">授权码已失效</p>
            <div class="preview">
              <div class="loading" v-if="requesting">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <img class="qrcodeImg" width="180" v-if="qrcodeImgFlag" src />
              <Button
                type="primary"
                class="getCountDownTime"
                v-if="failTips"
                @click="getCountDownTime"
                perm="wxapp.config.operate"
              >重新获取</Button>
            </div>
            <p class="countdown-tip-two">
              请使用开发者微信扫码
              <br />完成授权
            </p>
            <div slot="footer"></div>
          </Modal>
          <onlineSuccess
            v-if="isOnlineSuccess"
            :uploadParams="uploadParams"
            :previewQRcode="previewQRcode"
            @selectAgain="selectAgain"
          ></onlineSuccess>
        </div>
      </div>
      <div class="nossl-tips" v-show="loaded" v-else-if="noWxApp">
        <div style="width: 80px;height: 80px;margin: 0 auto;">
          <img src="images/wxapp/mini-program.png" style="width: 100%;height: 100%;" alt="" />
        </div>
        <div style="margin: 32px 0 30px;text-align: center;">发布小程序请先绑定小程序信息</div>
        <div style="text-align: center;">
          <router-link style="display: inline-block;color: #fff;border-radius: 20px;background-color: #3F63F7;padding: 10px 38px 9px 39px;font-size: 16px;" perm="ssl.config.view" to="/channel/wxapp/wxapp-setting">前往绑定小程序</router-link>
        </div>
      </div>
      <div class="nossl-tips" v-show="loaded" v-else-if="noSsl">
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
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "../components/third-menu-for-channel-wxapp";
import stepOne from "./components/publish-step-1/stepOne.vue";
import stepTwo from "./components/publish-step-2/stepTwo.vue";
import manualDownload from "./components/manualDownload/manualDownload";
import onlineIssue from "./components/onlineIssue/onlineIssue";
import onlineSuccess from "./components/onlineSuccess/onlineSuccess";
export default {
  components: {
    thirdMenu,
    stepOne,
    stepTwo,
    manualDownload,
    onlineIssue,
    onlineSuccess
  },
  data() {
    return {
      showLoading: false,
      isShowTitle: true,
      loaded: false,
      currentStep: 1, // 当前是第几步
      uploadType: 0, // 代码上传方式，1=一键上传，2=手动上传
      packageUrl: "", // 小程序包的下载地址
      failTips: false, // 失效提示
      isOnlineSuccess: false, // 是否成功在线上传
      onlineIssue: false, // 在线上次填写资料
      qrModal: false, // 二维码弹框
      onlineIssueParams: "", // 授权上传所需参数
      uploadServer: "", // 上传服务器(只包含协议、主机名和端口，不带路径，如 http://wxupload-3.yz168.cc )
      uploadServerApi: "", // 上传服务器带API页面路径
      projectname: "", // 项目名称
      qrcodeImgFlag: false, // 二维码
      requesting: true, // 正在请求授权码
      haveRequest: false, // 是否请求到授权码
      countdownTime: 30, // 倒计时
      haveApply: false, // 判断是否获取二维码
      intervalid: null, // 定时器
      defaultBtn: false, // 重新获取开关
      startTime: 0,
      checkLoginTimer: null,
      uploadParams: "", // 上传所需内容
      previewQRcode: "", // 预览二维码
      noWxApp: false, // 是否没有配置小程序
      noSsl: false, // 是否没有配置SSL
      domainList: [], // 可选的列表
      thirdMenu: [], // 左侧菜单
      formField: {
        name: "",
        head_bgcolor: "#FFFFFF",
        head_fontcolor: "black"
      },
      appInfo: {}, // 从数据库加载到的小程序配置信息
      rules: {
        name: [
          { required: true, message: "请填写小程序名称", trigger: "blur" }
        ],
        head_bgcolor: [
          { required: true, message: "请选择导航背景颜色", trigger: "blur" }
        ],
        head_fontcolor: [
          { required: true, message: "请选择标题颜色", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getConfig();
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
  },
  methods: {
    getConfig() {
      this.showLoading = true;
      this.$httpGet("/shop/admin/wxapp/config/info", {}, res => {
        this.showLoading = false;
        if (res.code == 200) {
          if (!res.data.config) {
            this.noWxApp = true;
            this.loaded = true
            return;
          }
          if (!res.data.config.appid) {
            this.noWxApp = true;
            this.loaded = true
            return;
          }
          this.qrcode =
            res.data.config && res.data.config.qrcode
              ? [res.data.config.qrcode]
              : [];
          Object.assign(this.formField, res.data.config);
          this.appInfo = res.data.config;
          this.formField.head_bgcolor = this.formField.head_bgcolor || "#FFFFFF";
          this.formField.head_fontcolor =
            this.formField.head_fontcolor || "black";
          this.domainList = res.data.domain_list;
          if (this.domainList.length < 1) {
            this.noSsl = true;
          }
        } else {
          this.$Message.error(res.msg);
        }
        this.loaded = true
      });
    },
    // 在线上次重新选择
    selectAgain() {
      this.uploadType = 0;
      this.currentStep = 1;
      this.isOnlineSuccess = false;
    },
    // 重新选择
    reSelect() {
      this.uploadType = 0;
      this.currentStep = 2;
      this.isOnlineSuccess = false;
    },
    // 回到第一步
    backToStepOne() {
      if (this.currentStep > 1) this.currentStep = 1;
      this.uploadType = 0;
      this.isOnlineSuccess = false;
    },
    // 回到第二步
    backToStepTwo() {
      if (this.currentStep > 2) this.currentStep = 2;
      this.uploadType = 0;
      this.isOnlineSuccess = false;
    },
    //回到第一步
    previousStep(){
      if (this.currentStep > 1) this.currentStep = 1;
    },
    // 第二步
    twoFinish() {
      this.currentStep = 2;
    },
    // 手动第三步
    threeFinish(data) {
      this.currentStep = 3;
      this.uploadType = data.uploadType;
      if (data.package) {
        this.packageUrl = data.package;
      }
    },
    // 第一步时，点击下一步按钮的动作
    submitStepOne() {
      this.showLoading = true;
      this.$httpUpload("/shop/admin/wxapp/config/save", this.formField, res => {
        this.showLoading = false;
        if (res.code == 200) {
          this.currentStep = 2;
          this.getConfig();
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    // 授权上传
    accept(data) {
      let _this = this;
      this.qrModal = true;
      this.uploadParams = data.info;
      this.$httpPost("/shop/admin/wxapp/config/upload/info/get", null, res => {
        if (res.code == 200) {
          _this.uploadServer = res.data.server;
          _this.uploadServerApi = res.data.serverApi;
          _this.projectname = res.data.name;
          _this.appid = res.data.appid;
          _this.packageUrl = res.data.file;
          _this.getQrcode();
        } else {
          _this.$Message.error(res.msg);
        }
      });
    },
    // 获取验证二维码
    getQrcode(skipdownload) {
      let _this = this;
      this.$jsonp(this.uploadServerApi, {
        action: "getloginqrcode",
        packageurl: this.packageUrl,
        skipdownload: skipdownload ? 1 : 0
      }).then(res => {
        if (res.code == 200) {
          _this.requesting = false;
          _this.qrcodeImgFlag = true;
          _this.haveRequest = true;
          _this.$nextTick(() => {
            document
              .querySelectorAll(".qrcodeImg")[0]
              .setAttribute("src", this.uploadServer + "/" + res.qrcode);
          });
          if (!_this.haveApply) {
            _this.haveApply = true;
            _this.countdownTime = 30;
            _this.intervalid = setInterval(function() {
              _this.countdown(0);
            }, 1000);
          } else {
            clearInterval(_this.intervalid);
            _this.countdownTime = 30;
            _this.defaultBtn = false;
            _this.intervalid = setInterval(function() {
              _this.countdown(0);
            }, 1000);
          }
          _this.checkLogin();
          _this.startTime = new Date().getTime() / 1000; // 开始计算
        } else if (res.code === 501) {
          this.$Message.error("系统繁忙，请20秒后重试！");
          this.defaultBtn = false;
          this.qrModal = false;
          clearInterval(_this.intervalid);
        } else {
          this.haveApply = false;
          this.defaultBtn = false;
          this.qrModal = false;
          clearInterval(_this.intervalid);
          this.$Message.error(res.msg);
        }
      });
    },
    // 重新获取
    getCountDownTime() {
      let _this = this;
      if (!this.defaultBtn) {
        document.querySelectorAll(".qrcodeImg")[0].style.opacity = 1;
        document.querySelectorAll(".preview")[0].style.background = "#f6f8fb";
        _this.qrcodeImgFlag = false;
        _this.failTips = false;
        _this.requesting = true;
        _this.getQrcode(true);
        _this.clearTimer();
      }
    },
    // 关闭弹框
    close() {
      clearInterval(this.intervalid);
      this.clearTimer();
      this.haveRequest = false;
      this.failTips = false;
      this.qrcodeImgFlag = false;
      this.requesting = true;
    },
    clearTimer() {
      let _this = this;
      if (this.checkLoginTimer) {
        clearTimeout(_this.checkLoginTimer);
      }
    },
    // 倒计时
    countdown(status) {
      let _this = this;
      if (status === 0) {
        if (this.countdownTime > 0) {
          _this.countdownTime--;
          if (_this.countdownTime <= 9) {
            _this.countdownTime = "0" + _this.countdownTime;
          }
        } else {
          _this.haveRequest = false;
          _this.failTips = true;
          document.querySelectorAll(".qrcodeImg")[0].style.opacity = 0.2;
          document.querySelectorAll(".preview")[0].style.background =
            "transparent";
          clearInterval(_this.intervalid);
          _this.clearTimer();
        }
      }
    },
    // 检测是否扫码
    checkLogin() {
      let _this = this;
      this.$jsonp(this.uploadServerApi, { action: "checklogin" }).then(json => {
        if (
          _this.startTime > 0 &&
          new Date().getTime() / 1000 - _this.startTime > 30
        ) {
          _this.clearTimer();
        }
        if (json.code === 200) {
          if (json.haslogin === 1) {
            _this.qrModal = false;
            _this.clearTimer();
            _this.doupload();
            clearInterval(_this.intervalid);
            _this.$store.state.COMMON_loading = true;
            setTimeout(function() {
              _this.haveRequest = false;
              _this.requesting = true;
              _this.qrcodeImgFlag = false;
            }, 200);
          } else {
            _this.checkLoginTimer = setTimeout(function() {
              _this.checkLogin();
            }, 2000);
          }
        } else {
          _this.$Message.error(json.data.msg);
        }
      });
    },
    // 扫码后上传
    doupload() {
      let _this = this;
      this.$jsonp(this.uploadServerApi, {
        action: "upload",
        packageurl: this.packageUrl,
        projectname: this.projectname,
        appid: this.appid,
        version: this.uploadParams.version,
        desc: this.uploadParams.remark
      }).then(json => {
        _this.$store.state.COMMON_loading = false;
        if (json !== "" && typeof json === "object") {
          if (json.code === 200) {
            _this.$Message.success("上传成功！");
            _this.currentStep = 3;
            _this.onlineIssue = false;
            _this.isOnlineSuccess = true;
            _this.previewQRcode = this.uploadServer + "/" + json.qrcode;
          } else {
            clearInterval(_this.intervalid);
            _this.haveApply = false;
            if (
              json["error"] &&
              json["error"].indexOf("登录用户不是该小程序的开发者") > -1
            ) {
              _this.$Message.error(
                json["error"] + "，请用小程序的开发者微信扫码上传"
              );
            } else if (
              json["error"] &&
              json["error"].indexOf("重新登录") > -1
            ) {
              _this.$Message.error(json["error"]);
            } else {
              _this.$Message.error(json["error"]);
            }
          }
        } else {
          _this.$Message.error(json);
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
  .wrapper {
    padding: 16px 16px 0 16px;
    /*overflow: auto;*/
    .wxapp-issue-steps {
      display: flex;
      flex-direction: row;
      overflow: hidden;
      box-sizing: border-box;
      font-size: 0;
      .wxapp-steps-item:first-child {
        margin-left: 0;
        /*padding-right: 12px;*/
        /*overflow: hidden;*/
        .wxapp-steps-step:before{
          content: unset !important;
        }
      }
      .wxapp-steps-item:nth-of-type(3) {
        /*padding-right: 12px;*/
        .wxapp-steps-step:after{
          content: unset !important;
        }
      }
      .wxapp-steps-item {
        position: relative;
        text-align: center;
        margin: 0 7px;
        cursor: pointer;
        flex: 1;
        .wxapp-steps-step {
          height: 50px;
          /*line-height: 50px;*/
          font-size: 14px;
          background: #F8F8F9;
          border: 1px solid #DCDEE2;
          &.common_is_finish {
            background: #5D7AF7;
            color: #fff;
            border: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            &>div{
              border-radius: 50%;
              background-color: #E4E9FF;
              margin-right: 10px;
              color: #4A6AF5;
              width: 20px;
              height: 20px;
            }
            &::after {
              background-color: #5D7AF7;
            }
          }
        }
        .wxapp-steps-step:before {
          content: " ";
          display: inline-block;
          width: 36px;
          height: 36px;
          border-top: 1px solid #DCDEE2;
          border-left: 1px solid #DCDEE2;
          position: absolute;
          top: 7px;
          left: -18px;
          transform:rotate(135deg);
          background-color: #fff;
        }
        .wxapp-steps-step:after {
          content: " ";
          display: inline-block;
          width: 36px;
          height: 36px;
          border-top: 1px solid #DCDEE2;
          border-left: 1px solid #DCDEE2;
          position: absolute;
          top: 7px;
          right: -18px;
          transform:rotate(135deg);
          z-index: 1;
          background-color: #F8F8F9;
        }
      }
    }
  }
}
.nossl-tips {
  padding: 249px 100px 100px;
  font-size: 14px;
}
.wxapp-issue-steps {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 0;
  .wxapp-steps-item:first-child {
    margin-left: 0;
    /*padding-right: 12px;*/
    /*overflow: hidden;*/
  }
  .wxapp-steps-item:nth-of-type(2) {
    /*padding-right: 12px;*/
  }
  .wxapp-steps-item {
    position: relative;
    text-align: center;
    margin: 0 7px;
    cursor: pointer;
    flex: 1;
    .wxapp-steps-step {
      height: 50px;
      /*line-height: 50px;*/
      font-size: 14px;
      background: #f6f8fb;
      color: #464C5B;
      display: flex;
      justify-content: center;
      align-items: center;
      &>div{
        border-radius: 50%;
        background-color:#2C3E50;
        margin-right: 10px;
        color: #F8F8F9;
        width: 20px;
        height: 20px;
      }
    }
  }
}
.countdown-tip-one {
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
}
.requesting {
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
}
.fail-tips {
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
}
.preview {
  width: 180px;
  height: 180px;
  background: #f6f8fb;
  margin: 0 auto 10px;
  position: relative;
  .loading {
    height: 8px;
    margin: 0 auto;
    position: absolute;
    top: 44%;
    left: 50%;
    transform: translate(-50%, -50%);
    span {
      display: inline-block;
      width: 8px;
      height: 100%;
      margin-right: 5px;
      border-radius: 50%;
      background: #ccc;
      -webkit-animation: load 1.04s ease infinite;
    }
    span:last-child {
      margin-right: 0px;
    }
    @-webkit-keyframes load {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    span:nth-child(1) {
      -webkit-animation-delay: 0.13s;
    }
    span:nth-child(2) {
      -webkit-animation-delay: 0.26s;
    }
    span:nth-child(3) {
      -webkit-animation-delay: 0.39s;
    }
    span:nth-child(4) {
      -webkit-animation-delay: 0.52s;
    }
    span:nth-child(5) {
      -webkit-animation-delay: 0.65s;
    }
  }
  .getCountDownTime {
    position: absolute;
    top: 74px;
    right: 50px;
  }
}
.countdown-tip-two {
  text-align: center;
  font-size: 14px;
  color: #999;
}
</style>