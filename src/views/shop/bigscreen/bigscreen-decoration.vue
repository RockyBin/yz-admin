<template>
  <div class="container">
    <Tabs v-model="tabSelect" :animated="false" name="decoration">
      <TabPane label="广告屏主页" :name="tabName[0]">
        <div class="store-decoration" v-if="done">
          <div class="store-decoration-welcome" v-if="!hasBigHomePage">
            <div class="store-decoration-welcome-title">hello，请创建您的广告屏主页</div>
            <div class="store-decoration-welcome-content">
              <div class="store-decoration-welcome-item">
                <img :src="require('@/views/shop/css/images/ios-image.png')" alt />
                <div class="store-decoration-welcome-item-type">快速创建模式</div>
                <div class="store-decoration-welcome-item-desc">选择此模式，安装行业模板，只需做小修改就可快速 创建出美观的广告屏主页</div>
                <div class="store-decoration-welcome-item-button">
                  <Button type="primary" ghost shape="circle">选择</Button>
                  <Button type="primary" shape="circle" @click="onQuickModuleClick">选择</Button>
                </div>
              </div>
              <div class="store-decoration-welcome-between">或</div>
              <div class="store-decoration-welcome-item">
                <img :src="require('@/views/shop/css/images/zujian-zuoyouhuadongtu.png')" alt />
                <div class="store-decoration-welcome-item-type">自定义模式</div>
                <div
                  class="store-decoration-welcome-item-desc"
                >选择此模式，您可以对界面做个性化的操作，打造出 属于您独一无二的广告屏主页</div>
                <div class="store-decoration-welcome-item-button">
                  <Button type="primary" ghost shape="circle" :loading="selectLoading">选择</Button>
                  <Button
                    type="primary"
                    shape="circle"
                    :loading="selectLoading"
                    @click="onCustomModuleClick"
                  >选择</Button>
                </div>
              </div>
            </div>
          </div>
          <div class="store-decoration-view" v-else>
            <div class="store-decoration-view-iframe">
              <div class="phone-container">
                <div class="phone-head">
                  <img src="images/mobile-top.jpg" />
                  <div class="page-name">{{homePageInfo.title ? homePageInfo.title : "店铺主页"}}</div>
                </div>
                <div class="phone-body">
                  <iframe
                    v-if="pageUrl"
                    :src="pageUrl"
                    frameborder="0"
                    scrolling="no"
                    width="100%"
                    height="100%"
                  ></iframe>
                  <div class="mask"></div>
                </div>
              </div>
            </div>
            <div class="store-decoration-view-btn">
              <div class="store-decoration-view-btn-content">
                <Button
                  type="primary"
                  shape="circle"
                  @click="onEditHomeClick"
                  perm="bigscreen.page.operate"
                >编辑主页</Button>
              </div>
              <div class="store-decoration-view-btn-content">
                <Button type="primary" ghost shape="circle" @click="onPreviewHomeClick">预览</Button>
              </div>
              <div class="store-decoration-view-btn-content">
                <Poptip
                  v-model="poptipShow"
                  @on-popper-show="onShowPoptip"
                  placement="right-start"
                  :word-wrap="true"
                  :transfer="true"
                  padding="15px 22px"
                >
                  <Button type="primary" ghost shape="circle">推广</Button>
                  <div slot="content" :style="{ textAlign: 'left' }">
                    <div :style="{ marginBottom: '10px'}">广告屏推广链接</div>
                    <Icon
                      type="md-close"
                      @click="poptipShow=false"
                      style="position:absolute;top:10px;right:15px;font-size:20px;cursor:pointer"
                    ></Icon>
                    <div style="margin-bottom:30px;display:flex;align-items: flex-end;">
                      <Input :value="pageUrl" :readonly="true" style="width:244px" />
                      <Button
                        type="primary"
                        style="height:32px;margin-left:5px"
                        @click="copyLinkUrl(pageUrl)"
                      >复制</Button>
                    </div>
                    <div style="margin-bottom:20px">推广二维码</div>
                    <div>
                      <canvas ref="canvas"></canvas>
                    </div>
                  </div>
                </Poptip>
              </div>
            </div>
          </div>
        </div>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import "@/views/shop/css/iconfont-front/iconfont.css";
import QRCode from "qrcode";
const tabName = ["main-nav"];
export default {
  components: {
    QRCode
  },
  data() {
    return {
      done: false,
      homePageInfo: {},
      hasBigHomePage: false,
      tabName,
      tabSelect: tabName[Number(this.$route.query.tab)] || tabName[0],
      pageUrl: "",
      selectLoading: false,
      poptipShow: false
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getHomePageInfo();
  },
  watch: {
    tabSelect() {
      this.$router.replace({
        name: "bigscreenDecoration",
        query: {
          tab: tabName.findIndex(n => n === this.tabSelect)
        }
      });
    }
  },
  mounted() {
    var domain = location.host;
    if (domain.indexOf("localhost") > -1 || !domain) {
      domain = "shop.test.72dns.net";
    }
    this.pageUrl = "http://" + domain + "/shop/front/#/?device_type=2";
  },
  methods: {
    /**
     * 选择模板
     */
    onSelectPageClick(index) {
      this.productClassFormItem.tempID = index;
    },
    /**
     * 获取主页信息
     */
    getHomePageInfo() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/ui/design/mobile/bigscreen/page/home?device_type=2"
        })
          .then(res => {
            if (res.code === 200) {
              this.done = true;
              this.$store.state.COMMON_loading = false;
              this.hasBigHomePage = !!res.data.page;
              this.homePageInfo = res.data.page || {};
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(() => {
            this.$Message.error("获取数据失败");
          })
          .finally(() => {
            resolve();
          });
      });
    },
    onCustomModuleClick() {
      this.selectLoading = true;
      this.$httpGet(
        "/shop/admin/ui/design/mobile/bigscreen/page/add/blank",
        { device_type: 2 },
        res => {
          this.selectLoading = false;
          if (res.code === 200) {
            this.$router.push({
              name: "bigscreenDesignHomeMobile",
              query: { id: res.data.id }
            });
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onQuickModuleClick() {
      this.$router.push({
        name: "bigscreenTemplate",
        query: { name: "bigscreenTemplate" }
      });
    },
    onEditHomeClick() {
      this.$router.push({
        name: "bigscreenDesignHomeMobile"
      });
    },
    onPreviewHomeClick() {
      window.open("preview.html?device_type=2");
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
      this.$Message.success("复制成功");
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
.ivu-tabs {
  /deep/.ivu-tabs-bar {
    margin-bottom: 0;
  }
}

.store-decoration {
  text-align: center;
  color: #333;
  .store-decoration-welcome {
    .store-decoration-welcome-title {
      font-size: 32px;
      padding: 80px 0;
    }
    .store-decoration-welcome-content {
      img {
        display: block;
      }
      .store-decoration-welcome-item {
        width: 338px;
        display: inline-block;
        vertical-align: top;
        .store-decoration-welcome-item-type {
          font-size: 18px;
          margin-top: 22px;
        }
        .store-decoration-welcome-item-desc {
          color: #999;
          font-size: 14px;
          text-align: left;
          text-align: justify;
          margin-top: 16px;
        }
        .store-decoration-welcome-item-button {
          border-radius: 20px;
          width: 90px;
          height: 40px;
          display: inline-block;
          margin-top: 27px;
          button {
            width: 90px;
            height: 40px;
            font-size: 16px;
            &:not(.ivu-btn-ghost) {
              display: none;
            }
          }
          &:hover {
            button {
              display: none;
              &:not(.ivu-btn-ghost) {
                display: inline-block;
              }
            }
          }
        }
      }
      .store-decoration-welcome-between {
        display: inline-block;
        width: 106px;
        font-size: 24px;
        padding-top: 90px;
        vertical-align: top;
      }
    }
  }
  .store-decoration-view {
    height: calc(100vh - 134px);
    text-align: left;
    padding: 24px;
    .store-decoration-view-iframe {
      height: calc(100vh - 160px);
      width: 500px;
      display: inline-block;
      position: relative;
      .phone-container {
        display: flex;
        flex-direction: column;
        border: 1px solid #efefef;
        height: 100%;
        .phone-head {
          width: 100%;
          position: relative;
          .page-name {
            position: absolute;
            width: 100%;
            top: 30px;
            text-align: center;
            font-size: 16px;
          }
        }
        .phone-body {
          flex: 1;
          position: relative;
          .mask {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: 99;
          }
        }
      }
    }
    .store-decoration-view-btn {
      display: inline-block;
      vertical-align: top;
      padding: 34px 42px;
      .store-decoration-view-btn-content {
        height: 34px;
        border-radius: 17px;
        margin-bottom: 17px;
        button {
          min-width: 90px;
          height: 34px;
        }
      }
    }
    .theme-color {
      // 遮罩层
      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
      &.theme-color-red {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #fd4d66, #fe3737) !important;
        }
      }
      &.theme-color-orange {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #ff9602, #ff5407) !important;
        }
      }
      &.theme-color-blue {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #2dadfc, #637bfb) !important;
        }
      }
      &.theme-color-green {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #86d677, #05c160) !important;
        }
      }
      &.theme-color-golden {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #e0bb7e, #cd9038) !important;
        }
      }
      &.theme-color-pink {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #ff4aad, #ff1269) !important;
        }
      }
      &.theme-color-black {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #333333, #000000) !important;
        }
      }
    }
  }
}
.action-bar {
  height: 50px;
  width: 100%;
  line-height: 50px;
  background: white;
  text-align: center;
  border-top: 1px solid #ebebeb;
}
.action-bar .ivu-btn-primary {
  width: 100px;
  height: 34px;
}
</style>
