<template>
  <div class="container">
    <Tabs value="main-nav">
      <TabPane
        :label="(device_type == 2 ? '广告屏' : '首页') + '弹窗编辑'"
        name="main-nav"
      >
        <div class="nav-container">
          <div class="nav-wrapper">
            <div class="frame">
              <div class="tips">这里将显示弹窗预览效果</div>
              <Popup
                :popupInfo="popupInfo"
                ref="popupModule"
                :editMode="true"
              ></Popup>
            </div>
          </div>
          <div class="side">
            <PopupProperty  ref="property" :errorShow="errorShow" :info="popupInfo"></PopupProperty>
          </div>
        </div>
      </TabPane>
    </Tabs>
    <div class="action-bar">
      <Button
        class="btn-save"
        type="primary"
        shape="circle"
        @click="savepopupInfo"
        :perm="device_type == 2 ? 'bigscreen.popup.operate' : 'page.popup.operate'"
        >保存并发布</Button
      >
    </div>
  </div>
</template>
<script>
import "@/views/shop/css/iconfont-front/iconfont.css";
import Popup from "./modules-mobi-for-render/popup-render";
import PopupProperty from "./modules-mobi-for-design/PopupProperty";
export default {
  props: {
    deviceType: {
      type: Number,
      default: 1
    }
  },
  components: {
    Popup,
    PopupProperty
  },
  data() {
    return {
      device_type: this.deviceType,
      timer: null,
      errorShow: {
        error1: false,
        error2: false,
      },
      popupInfo: {
        id: 0,
        interval: 3,
        show_interval: null,
        autoclose_second: null,
        items: []
      },
      oldPopupInfo: null
    };
  },
  watch: {
    popupInfo: {
      handler(val) {
        if (this.oldPopupInfo) {
          // 弹窗展示样式
          if (val.size_type !== this.oldPopupInfo.size_type) {
            this.initPopup();
          // 广告位设置（排除跳转链接）
          } else if (val.show_type !== this.oldPopupInfo.show_type) {
            if (!this.$refs["popupModule"].show) {
              this.$refs["popupModule"].popup();
            }
          } else if (["interval", "show_interval"].filter(n => val[n] !== this.oldPopupInfo[n]).length) {
            if (!this.$refs["popupModule"].show) {
              this.$refs["popupModule"].popup();
            } else {
              this.$refs["popupModule"].freeSecond = 0;
            }
          } else if (["autoclose", "autoclose_second"].filter(n => val[n] !== this.oldPopupInfo[n]).length) {
            if (!this.$refs["popupModule"].show) {
              this.$refs["popupModule"].popup();
            } else {
              this.$refs["popupModule"].showSecond = 0;
            }
          } else if (
            this.oldPopupInfo.items.length === val.items.length
            && val.items.filter((n, index) => n.link_desc !== this.oldPopupInfo.items[index].link_desc).length
          ) {
            if (!this.$refs["popupModule"].show) {
              this.$refs["popupModule"].popup();
            }
          } else {
            this.initPopup();
          }
        }
        this.oldPopupInfo = JSON.parse(JSON.stringify(val));
      },
      deep: true
    }
  },
  mounted: function() {
    this.loadPopupInfo();
  },
  methods: {
    initPopup() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.$refs["popupModule"].close();
        this.$nextTick(() => {
          this.$refs["popupModule"].popup();
        });
      }, 100);
    },
    loadPopupInfo() {
      // 和店铺的导航区分开 因为权限不一样
      let url = "/shop/admin/ui/design/popup/get";
      this.$httpGet(
        url,
        { device_type: this.device_type, id: this.popupInfo.id },
        res => {
          for (var i = 0; i < res.data.items.length; i++) {
            res.data.items[i].id = i + 1;
          }
          this.popupInfo = res.data;
          if (this.popupInfo.device_type)
            this.device_type = this.popupInfo.device_type;
        }
      );
    },
    savepopupInfo() {
      // 检测是否填写完整
      let isError = false;
      let formData = JSON.parse(JSON.stringify(this.popupInfo));
      this.errorShow = {
        error1: formData.show_type === 3 && !formData.show_interval,
        error2: formData.autoclose === 1 && !(formData.autoclose_second >= 5)
      };
      if (Object.values(this.errorShow).filter(n => n).length) {
        this.$Message.error("保存失败");
        return;
      }
      formData.device_type = this.device_type;
      let items = formData.items;
      for (let i = 0, len = items.length; i < len; i++) {
        if (items[i]["error"] === true) {
          this.$Message.error("广告位" + (i + 1) + "未填写完整");
          isError = true;
          return false;
        }
        delete items[i]["error"];
      }
      if (isError) return false;
      let url = "/shop/admin/ui/design/popup/save";
      this.$httpPost(url, formData, res => {
        if (res.code == 200) {
          this.$Message.success("弹窗保存成功");
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.container {
  height: 100%;
}
.container/deep/ .ivu-tabs-bar {
  margin-bottom: 0;
  padding-left: 5px;
}
.container .ivu-tabs-tabpane {
  height: 100%;
}
.nav-container {
  height: calc(100vh - 168px);
  display: flex;
  align-items: flex-start;
  background: #f2f4fd;
}
.nav-wrapper {
  flex: 1;
  position: relative;
  height: 100%;
  background: #e8ebef;
}
.action-bar {
  height: 50px;
  width: 100%;
  line-height: 50px;
  background: white;
  position: absolute;
  bottom: 0;
  text-align: center;
  border-top: 1px solid #ebebeb;
}
.action-bar .ivu-btn-primary {
  width: 100px;
  height: 34px;
}
.page-header {
  height: 60px;
  background-image: url("../../../../../../public/images/mobile-top.jpg");
}
.nav-wrapper .frame {
  position: relative;
  width: 375px;
  height: calc(100% - 100px);
  max-height: 775px;
  margin: 0 auto;
  margin-top: 50px;
  background: white;
  border: 1px solid #e8eaec;
  .tips {
    width: 100%;
    position: absolute;
    text-align: center;
    top: 50%;
    transform: translateY(-50%);
    .text {
      font-size: 12px;
      color: #999;
      line-height: 1.5;
    }
  }
}
.frame {
  .nav-bar {
    position: absolute;
    bottom: 0;
  }
  & > .mask {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
  }
  & > div:last-child {
    /deep/.mask {
      position: absolute;
    }
    /deep/.slider-container {
      position: absolute;
    }
  }
}
.nav-container .side {
  width: 362px;
  height: 100%;
  background: white;
}
.btn-save {
  background: #4570ea;
}
</style>
