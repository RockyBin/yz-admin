
<template>
  <div class="body" :class="{slide: slideStatus}">
    <div class="left-menu-wrapper">
      <div class="letf-top-webname primary-bgcolor">
        <div class="letf-top-webname-content">
          <span @click="onChangeMenuSilde">
            <i class="iconfont icon-m-menu"></i>
          </span>
          <span style="text-align:left;">后台系统</span>
        </div>
      </div>
      <div class="left-menu-content" @mouseenter="onEnterLeft">
        <menus class="left-menus" @reloadPage="onReloadPage" :slideStatus="slideStatus" @changeSlide="onChangeSlide" :leftMenuStatus="leftMenuStatus"></menus>
      </div>
    </div>
    <div class="right-content" :class="{'right-content-footer': fields.length}" @mouseenter="onEnterRight">
      <div class="top-menu-content">
        <breadcrum-menus class="third-menu"></breadcrum-menus>
        <right-menus></right-menus>
      </div>
      <div class="h-gray-padding"></div>
      <div class="third-menu-and-main">
        <div class="third-menu-wrapper" ref="thirdMenuWrapper">
        </div>
        <div class="matter">
          <vuescroll :ops="ops" ref="vs">
            <keep-alive :include="[]">
              <router-view v-if="reload" :style="{'padding-bottom':fields.length&&'50px'}"></router-view>
            </keep-alive>
            <Spin fix v-if="$store.state.COMMON_loading">
              <Icon type="ios-loading" size="32" class="common-loading"></Icon>
            </Spin>
          </vuescroll>         
        </div>
        <!-- <div class="v-gray-padding"></div> -->
      </div>
    </div>
    <div
      v-if="fields.length && fields[0]"
      v-show="!$store.state.COMMON_loading"
      class="foot-button"
      ref="footButton"
    >
      <div>
        <div class="foot-button-content" :class="{'foot-button-content-third': hasThirdMenu}"></div>
      </div>
    </div>
  </div>
</template>
<script>
import vuescroll from "vuescroll";
import scrollbar from "@/assets/scrollbar.less";
import menus from "@/views/shop/menu/menu.vue";
import breadcrumMenus from "@/views/shop/menu/breadcrum-menus.vue";
import rightMenus from "@/views/shop/menu/right-menus.vue";
export default {
  name: "yunzhiHome",
  provide() {
    return {
      "yunzhiHome": this
    }
  },
  data() {
    return {
      leftMenuStatus: false,
      hasThirdMenu: false,
      slideStatus: false, // 左边菜单是否收起标识
      fields: [],
      reload: true, // 刷新页面内容
      saveFunc: [],
      scrollbar: null,
      ops: {
        //自定义的滚动条，参考 https://vuescrolljs.yvescoding.org/guide
        rail: {
          opacity: "0.9",
          background: "#f5f5f5",
          border: "1px solid #ccc",
          size: "6px",
          gutterOfEnds: "0px",
          gutterOfSide: "0px"
        },
        bar: {
          background: "rgb(193,193,193)",
          keepShow: true,
          size: "5px",
          minSize: 0.2
        },
        scrollButton: {
          enable: false,
          background: "#666"
        },
        scrollPanel: {
          easing: "easeInQuad",
          speed: 800
        },
        vuescroll: {
          wheelScrollDuration: 0
        }
      }
    };
  },
  components: {
    vuescroll,
    menus,
    breadcrumMenus,
    rightMenus
  },
  created() {
    this.$on("on-yunzhi-foot-button-add", field => {
      if (field) {
        this.fields = [field];
        this.$nextTick(() => {
          this.getFootContent().innerHTML = "";
          this.getFootContent().appendChild(this.fields[0]);
          this.fields[0].style.display = "block";
        });
      }
      return false;
    });
    this.$on("on-yunzhi-foot-button-remove", () => {
      this.fields = [];
      this.getFootContent().innerHTML = "";
      return false;
    });
    this.$on("on-yunzhi-third-menu-add", thirdMenu => {
      if (thirdMenu) {
        this.hasThirdMenu = true;
        this.$refs.thirdMenuWrapper.appendChild(thirdMenu);
      }
      return false;
    });
    this.$on("on-yunzhi-third-menu-remove", () => {
      if (this.$refs.thirdMenuWrapper) {
        this.hasThirdMenu = false;
        this.$refs.thirdMenuWrapper.innerHTML = "";
      }
      return false;
    });
  },
  methods: {
    onEnterLeft() {
      this.leftMenuStatus = false;
    },
    onEnterRight() {
      this.leftMenuStatus = true;
    },
    onReloadPage() {
      this.reload = false;
      this.$nextTick(() => {
        this.reload = true;
      });
    },
    /**
     * 返回顶部（用于子页面需要时通过inject调用）
     */
    scrollToTop() {
      this.$refs["vs"].scrollTo({ x: 0, y: 0 }, 0);
    },
    getFootContent() {
      // return this.$refs["footButton"].querySelector(".foot-button-content");
      if (this.$refs["footButton"])
        return this.$refs["footButton"].querySelector(".foot-button-content");
      return null;
    },
    // 改变左边菜单收起状态
    onChangeMenuSilde() {
      this.slideStatus = !this.slideStatus;
      var foot = this.getFootContent();
      if (foot) {
        foot.style.transition = "all 0.5s";
        foot.style.width = this.slideStatus
          ? "calc(100% - 70px)"
          : "calc(100% - 160px)";
        foot.style.left = this.slideStatus ? "60px" : "150px";
      }
    },
    // 收起左边菜单
    onChangeSlide() {
      this.slideStatus = false;
    }
  }
};
</script>
<style lang="less" scoped>
@left-width: 140px;
@left-icon-width: 50px;
@left-name-width: @left-width - @left-icon-width;
.body {
  display: flex;
  flex-wrap: nowrap;
  .common-loading {
    animation: ani-demo-spin 1s linear infinite;
  }
  .foot-button {
    height: 70px;
    z-index: 9;
    .foot-button-content {
      position: fixed;
      left: 150px;
      bottom: 10px;
      height: 50px;
      line-height: 50px;
      width: calc(100% - 160px);
      text-align: center;
      border-radius: 0 0 3px 3px;
      z-index: 100;
      /deep/.footer {
        float: right;
        width: calc(100% - 100px);
      }
      &.foot-button-content-third {
        left: 250px;
        width: calc(100% - 260px);
      }
    }
  }
  @keyframes ani-demo-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .demo-spin-col {
    height: 100px;
    position: relative;
    border: 1px solid #eee;
  }
  .left-menu-wrapper {
    width: @left-width;
    z-index: 100;
    transition: width 0.5s;
    background-color: #252e3b;
    .letf-top-webname {
      width: @left-width;
      transition: width 0.5s;
      color: #fff;
      overflow: hidden;
      .letf-top-webname-content {
        width: @left-width;
        height: 50px;
        line-height: 50px;
      }
      span {
        vertical-align: top;
        font-size: 16px;
        display: inline-block;
        width: @left-name-width;
        &:first-child {
          width: @left-icon-width;
          height: 100%;
          cursor: pointer;
          i {
            font-size: 24px;
          }
        }
      }
    }
    /deep/.left-menu-content {
      overflow-y: auto;
      overflow-x: hidden;
      margin-top: 10px;
      height: calc(100vh - 60px);
      position: relative;

      &::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        border-radius: 10px;
        background: rgb(37, 46, 59);
      }
      &::-webkit-scrollbar {
        width: 6px;
        height: 8px;
        background-color: #081221;
      }
      &::-webkit-scrollbar-thumb {
        /*定义滑块 内阴影+圆角*/
        border-radius: 8px;
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        background-color: rgba(0, 0, 0, 0.3);
      }
    }
  }
  .right-content {
    flex: 1;
    transition: margin-left 0.5s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .top-menu-content {
      height: 50px;
      line-height: 50px;
      background-color: #fff;
    }
    .h-gray-padding {
      height: 10px;
      background: #f2f4fd;
    }
    .third-menu-and-main {
      flex: 1;
      display: flex;
      .third-menu-wrapper {
        background: white;
      }
    }
    .matter {
      flex: 1;
      text-align: left;
      background: #fff;
      height: calc(100vh - 70px);
      position: relative;
      overflow: hidden;
      margin:0 10px 10px;
      border-radius:3px;
      // border-left: 12px solid #f2f4fd;
      // border-right: 12px solid #f2f4fd;
      // border-bottom: 12px solid #f2f4fd;
      /deep/.__rail-is-horizontal {
        height: 10px !important;
      }
      /deep/.__bar-is-horizontal {
        height: 10px !important;
      }
      .__vuescroll .__panel .__view > div {
        overflow: unset !important;
      }
      .subject {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: auto;
        border-left: 12px solid #f2f4fd;
        border-right: 12px solid #f2f4fd;
        > div {
          position: absolute;
          width: 100%;
          // min-width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: auto;
        }
      }
      /deep/.mall-container {
        height: 100%;
      }
    }
  }

  &.slide {
    .left-menu-wrapper {
      width: @left-icon-width;
      .letf-top-webname {
        width: @left-icon-width;
      }
    }
  }
}
</style>
