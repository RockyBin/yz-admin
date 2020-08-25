<template>
  <div class="login">
    <h1>
      <span>后台管理系统</span>
    </h1>
    <div class="background">
      <div class="wrapper">
        <img src="images/picture.png" alt />
        <div class="form">
          <h3>用户登陆</h3>
          <Input
            class="user-name"
            type="text"
            v-model="userName"
            placeholder="请输入手机号/用户名"
            @on-enter="login($event, 1)"
          >
            <i
              class="iconfont icon-md-person"
              style="color:#8d9ab3"
              slot="prepend"
            ></i>
          </Input>
          <Input
            class="password"
            :type="passwordType"
            v-model="password"
            placeholder="请输入密码"
            @on-enter="login($event, 1)"
            :icon="passwordIcon"
            @on-click="switchPasswordIcon()"
          >
            <i
              class="iconfont icon-suo"
              style="color:#8d9ab3"
              slot="prepend"
            ></i>
          </Input>
          <Button
            v-if="!userName || !password || validated"
            class="btn-login"
            type="primary"
            @click="login"
            >登录</Button
          >
          <Poptip
            v-show="userName && password && !validated"
            v-model="showPop"
            placement="top-start"
            width="333"
          >
            <Button class="btn-login" type="primary" @click="login"
              >登录</Button
            >
            <Icon
              slot="title"
              type="md-close"
              size="16"
              @click="showPop = false"
            />
            <div
              slot="content"
              id="slide-validator"
              style="position:relative;height:222px;"
            ></div>
          </Poptip>
          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        </div>
      </div>
    </div>
    <p class="copy">
      <!--版权所有：佛山市亿动网络有限公司-->
    </p>
  </div>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      userName: "",
      password: "",
      showPop: false,
      validated: false,
      errorMsg: "",
      passwordIcon: "null-class iconfont icon-ios-eye-off",
      passwordType: "password"
    };
  },
  mounted() {
    this.showMsg();
    this.initPop();
    //为登陆后显示开店向导做准备
    window.sessionStorage.removeItem("has-show-guide-model");
  },
  methods: {
    login(event, isEnter) {
      if (!this.userName && !this.password) {
        this.$Message.error("请输入用户名和密码！");
        this.errorMsg = "请输入用户名和密码！";
      } else if (!this.userName) {
        this.$Message.error("请输入用户名！");
        this.errorMsg = "请输入用户名！";
      } else if (!this.password) {
        this.$Message.error("请输入密码！");
        this.errorMsg = "请输入密码！";
      }
      if (isEnter) {
        this.showPop = true;
      }
      if (this.userName && this.password && this.validated) {
        axios
          .post("/shop/admin/login", {
            username: this.userName,
            password: this.password
          })
          .then(res => {
            if (res.code == 200) {
              this.$Message.success(res.msg);
              this.errorMsg = "";
              // 开发环境和生产环境区分
              var homeUrl = "/shop/admin/";
              if (
                process &&
                process.env &&
                process.env.NODE_ENV === "development"
              ) {
                homeUrl = "/";
              }
              window.location.href = homeUrl; // 跳转重新加载菜单;
            } else {
              this.$Message.error(res.msg);
              this.errorMsg = res.msg;
              this.validated = false;
              this.jigsaw.reset();
            }
          })
          .catch(err => {
            this.$Message.error(err);
            this.validated = false;
            this.jigsaw.reset();
          });
      }
    },
    showMsg() {
      if (this.$route.query.msg) {
        this.$Message.error(this.$route.query.msg);
      }
    },
    initPop() {
      var el = document.getElementById("slide-validator");
      this.jigsaw = jigsaw.init(
        el,
        () => {
          setTimeout(() => {
            this.validated = true;
            this.showPop = false;
            this.login();
          }, 500);
        },
        () => {
          this.validated = false;
        }
      );
    },
    switchPasswordIcon() {
      if (this.passwordIcon.indexOf("icon-ios-eye-off") > -1) {
        this.passwordIcon = "null-class iconfont icon-ios-eye";
        this.passwordType = "input";
      } else {
        this.passwordIcon = "null-class iconfont icon-ios-eye-off";
        this.passwordType = "password";
      }
    }
  }
};
</script>
<style lang="less" scoped>
.login {
  height: 100vh;
  text-align: left;
  background: white;
  h1 {
    font-size: 24px;
    height: 15%;
    line-height: 1;
    color: rgba(102, 102, 102, 1);
    position: relative;
    & > span {
      position: absolute;
      left: 19%;
      bottom: 20px;
    }
  }
  .background {
    position: relative;
    width: 100%;
    height: 49vh;
    min-height: 488px;
    font-size: 0;
    background: linear-gradient(0deg, #ccf6fd 0%, #447ee9 100%);
    .wrapper {
      width: 1200px;
      height: 100%;
      display: flex;
      align-items: center;
      padding-left: 136px;
      padding-right: 86px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0);
    }
    img {
      width: 436px;
      height: 380px;
      object-fit: cover;
      margin-right: 182px;
    }
    .form {
      font-size: 14px;
      width: 360px;
      height: 450px;
      border-radius: 4px;
      background: white;
      padding: 50px 25px;
      h3 {
        font-size: 18px;
        line-height: 1;
        color: rgba(102, 102, 102, 1);
        margin-bottom: 45px;
      }
      .user-name {
        margin-bottom: 18px;
      }
      .password {
        margin-bottom: 30px;
      }
      /deep/.ivu-input {
        height: 40px;
        padding-left: 10px !important;
      }
      /deep/.ivu-input-group-prepend {
        width: 40px;
      }
      /deep/.ivu-poptip-body {
        padding: 0 23px 20px;
        .ivu-poptip-body-content {
          overflow: hidden;
        }
      }
      /deep/.ivu-poptip-title {
        overflow: hidden;
      }
      /deep/.ivu-poptip-title .ivu-icon {
        float: right;
      }
      /deep/.ivu-poptip-title:after {
        height: 0;
      }
      /deep/.ivu-input-icon {
        height: 40px;
        line-height: 40px;
        font-size: 18px;
      }
      .btn-login {
        width: 310px;
        height: 50px !important;
        font-size: 16px;
        margin-bottom: 24px;
      }
      .error {
        font-size: 12px;
        color: rgba(250, 0, 26, 1);
      }
    }
  }
  .copy {
    font-size: 14px;
    line-height: 1;
    margin-top: 20px;
    text-align: center;
    color: rgba(153, 153, 153, 1);
  }
}
</style>
