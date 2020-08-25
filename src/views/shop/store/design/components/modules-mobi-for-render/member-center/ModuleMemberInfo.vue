<template>
  <div class="theme-gr-bg-color" style="position: relative;overflow: hidden;" :style="module.invitation_code_is_show && memberInfo.invite_code ? '' :  'margin-bottom: -36px;'">
    <!-- 设置按钮 -->
    <div class="member-center-header-setting" @click="$router.push({name:'memberPersonInfoView'})">
      <div class="member-center-header-icon">
        <i class="right-icon iconfont iconfont1 icon-setting"></i>
      </div>
    </div>
    <!-- 分享 -->
    <div class="member-center-header-share" @click="onViewShareClick">
      <div class="member-center-header-icon">
        <i class="right-icon iconfont iconfont1 icon icon-qrcode"></i>
      </div>
    </div>
    <!-- 头部信息 -->
    <div class="member-center-header" onclick="return false;" :class="{'member-center-header-layout-one': memberInfo.id && module.layout === 1, 'member-center-header-layout-two': memberInfo.id && module.layout === 2}" :style="`background-image: url(${require('./images/member-bg.png')});`">
      <div
        class="member-center-header-avatar"
        @click="isLogin ? $router.push({name: 'memberPersonInfoEdit'}) : $router.push({name: 'login'})"
      >
        <div
          class="member-center-header-img"
          :style="`background-image: url(${($root.$options.filters.getUrl ? $root.$options.filters.getUrl(memberInfo.headurl) : '') || require('./images/default_head.png')})`"
        ></div>
      </div>
      <div
        class="member-center-header-login"
        v-if="!memberInfo.id"
        @click="$router.push({name: 'login'})"
      >登录/注册</div>
      <div class="member-center-header-info" v-else>
        <div class="member-center-header-nickname">{{memberInfo.nickname}}</div>
        <div>
          <div
            class="member-center-header-level" v-if="module.member_level_is_show"
          ><i class="iconfont iconfont1 icon-member" v-if="memberInfo.level_text"></i>{{memberInfo.level_text || "普通会员"}}</div>
        </div>
      </div>
    </div>
    <div class="member-center-invite" onclick="return false;" v-if="module.invitation_code_is_show && memberInfo.invite_code" :style="`background-image: url(${require('./images/member-bg-invite.png')});`">
      <div>分享我的邀请码：{{memberInfo.invite_code}}</div>
      <div @click="copyLinkUrl(memberInfo.invite_code)">点击复制</div>
    </div>
    <!-- 圆弧 -->
    <div class="member-center-head-bg" onclick="return false;" :style="`background-image: url(${require('./images/member-bg-bottom.png')});`"></div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  props: ["memberInfo", "module"],
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      isLogin: "LOGINSTATUS"
    })
  },
  methods: {
    onViewShareClick() {
      this.$emit("showPoster");
    },
    /**
     * 复制邀请码
     */
    copyLinkUrl(code) {
      let text = "我的店铺邀请码：" + code;
      if (window.clipboardData) {
        window.clipboardData.clearData();
        window.clipboardData.setData("Text", text);
        this.$toast("复制成功");
      } else {
        var oInput = document.createElement("input");
        oInput.value = text;
        oInput.setAttribute("readonly", "readonly");
        document.body.appendChild(oInput);
        // 选择对象
        if (this.$store.state.isIOS) {
          oInput.setSelectionRange(0, 100);
        } else {
          oInput.select();
        }
        document.execCommand("Copy"); // 执行浏览器复制命令
        oInput.style.display = "none";
        document.body.removeChild(oInput);
        this.$toast("复制成功");
      }
    },
  }
};
</script>
<style lang="less" scoped>
// 头部
.member-center-header {
  display: flex;
  align-items: center;
  padding: 32px 20px 48px;
  color: #fff;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: top right;
  &.member-center-header-layout-one {
    .member-center-header-info {
      margin-left: 16px;
      .member-center-header-level {
        margin-top: 8px;
      }
    }
  }
  &.member-center-header-layout-two {
    flex-direction: column;
    padding: 15px 20px 48px;
    .member-center-header-info {
      text-align: center;
      margin-top: 8px;
    }
  }
  .member-center-header-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #fff;
    box-sizing: border-box;
    .member-center-header-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
  }
  .member-center-header-login {
    width: 80px;
    height: 30px;
    margin-left: 18px;
    margin-top: 16px;
    font-size: 14px;
    text-align: center;
    line-height: 30px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  .member-center-header-info {
    .member-center-header-nickname {
      font-size: 14px;
    }
    .member-center-header-level {
      display: inline-block;
      box-sizing: border-box;
      height: 20px;
      line-height: 18px;
      padding:0 6px;
      text-align: center;
      overflow: hidden;
      font-size: 11px;
      border-radius: 10px;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255,255,255, 0.5);
      background-origin: content-box;
      i {
        font-size: 12px;
        color: #FFD500;
        margin-right: 4px;
      }
      & + div {
        margin-left: 5px;
      }
    }
  }
}
// 邀请码
.member-center-invite {
  position: absolute;
  bottom: 0;
  width: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 37px;
  margin: 0 20px;
  padding: 7px 0 9px;
  box-sizing: border-box;
  border-radius: 5px;
  color: #FCDA7B;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  & > div {
    margin-left: 13px;
    &:last-child {
      width: 60px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 10px;
      background-color: #FCDA7B;
      color: #333;
    }
  }
}
// 头部设置按钮
.member-center-header-setting {
  width: 40px;
  height: 42px;
  position: absolute;
  top: 0;
  right: 0;
  .member-center-header-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .right-icon {
      color: #fff !important;
      font-size: 22px;
    }
  }
}
// 分享按钮
.member-center-header-share {
  width: 40px;
  height: 42px;
  position: absolute;
  top: 0;
  right: 40px;
  .member-center-header-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .right-icon {
      color: #fff !important;
      font-size: 24px;
    }
  }
}
.member-center-head-bg {
  position: absolute;
  bottom: -4px;
  left: 0;
  right: -1px;
  height: 19px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>