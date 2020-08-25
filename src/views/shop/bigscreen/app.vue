<template>
  <div class="container">
    <Tabs value="main-nav">
      <TabPane label="广告屏APP" name="main-nav">
        <div class="store-decoration" v-if="done">
          <div class="store-decoration-welcome" v-if="!hasApp">
            <div class="store-decoration-welcome-title">hello，请创建您的广告屏App</div>
            <div class="store-decoration-welcome-content">
              <div class="store-decoration-welcome-item">
                <img :src="require('@/views/shop/css/images/ios-image.png')" alt />
                <div class="store-decoration-welcome-item-desc">您还没有创建专属的广告屏App，请立即创建</div>
                <div class="store-decoration-welcome-item-button">
                  <Button type="primary" ghost shape="circle">立即创建</Button>
                  <Button type="primary" shape="circle" @click="onEditClick">立即创建</Button>
                </div>
              </div>
            </div>
          </div>
          <div class="store-decoration-view" v-else>
            <div class="store-decoration-view-iframe">
              <div class="phone-container">
                <img class="background" src="images/ad-screen.png" />
                <img class="applogo" :src="appInfo.logo" />
              </div>
            </div>
            <div class="store-decoration-view-btn">
              <div class="store-decoration-view-btn-content">
                <Button
                  type="primary"
                  shape="circle"
                  @click="onEditClick"
                  perm="bigscreen.app.operate"
                >编辑</Button>
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
                  <Button type="primary" ghost shape="circle">下载</Button>
                  <div slot="content" :style="{ textAlign: 'left' }">
                    <div :style="{ marginBottom: '10px'}">下载地址</div>
                    <Icon
                      type="md-close"
                      @click="poptipShow=false"
                      style="position:absolute;top:10px;right:15px;font-size:20px;cursor:pointer"
                    ></Icon>
                    <div style="margin-bottom:30px;display:flex;align-items: flex-end;">
                      <Input :value="appInfo.download_url" :readonly="true" style="width:244px" />
                      <Button
                        type="primary"
                        style="height:32px;margin-left:5px"
                        @click="copyLinkUrl(appInfo.download_url)"
                      >复制</Button>
                    </div>
                    <div style="margin-bottom:20px">下载二维码</div>
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
export default {
  components: {
    QRCode
  },
  data() {
    return {
      done: false,
      appInfo: {
        id: 0
      },
      hasApp: false,
      downloadUrl: "",
      poptipShow: false
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getAppInfo();
  },
  methods: {
    /**
     * 获取APP信息
     */
    getAppInfo() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/mobileapp/get?device_type=2"
        })
          .then(res => {
            if (res.code === 200) {
              this.done = true;
              this.$store.state.COMMON_loading = false;
              this.hasApp = !!res.data.id;
              this.appInfo = res.data || {};
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
    onEditClick() {
      this.$router.push({
        name: "bigscreenAppEdit",
        query: {
          id: this.appInfo.id
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
      this.$Message.success("复制成功");
    },
    onShowPoptip() {
      var canvas = this.$refs.canvas;
      QRCode.toCanvas(
        canvas,
        this.appInfo.download_url,
        { margin: 1 },
        function(error) {
          if (error) console.error(error);
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
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
          text-align: center;
          margin-top: 16px;
        }
        .store-decoration-welcome-item-button {
          border-radius: 20px;
          width: 106px;
          height: 40px;
          display: inline-block;
          margin-top: 27px;
          button {
            width: 100px;
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
    display: flex;
    align-items: flex-start;
    height: calc(100vh - 120px);
    padding: 24px;
    .store-decoration-view-iframe {
      .phone-container {
        width: 294px;
        position: relative;
        .background {
          width: 294px;
          object-fit: contain;
        }
        .applogo {
          width: 40px;
          height: 40px;
          position: absolute;
          top: 115px;
          left: 75px;
          border-radius: 5px;
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
