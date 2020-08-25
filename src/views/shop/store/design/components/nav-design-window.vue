<template>
  <div class="container">
    <Tabs value="main-nav">
      <TabPane label="导航编辑" name="main-nav">
        <div class="nav-container">
          <div class="nav-wrapper">
            <div class="frame">
              <div class="page-header"></div>
              <div class="tips">
                <img src="images/icon-store.gif" />
                <div class="text">
                  页面内容
                  <br />
                  前往{{ deviceType == 2 ? "广告屏" : "店铺" }}装修编辑
                </div>
              </div>
              <ModuleNavBottom :info="navBarInfo" :editMode="true"></ModuleNavBottom>
            </div>
          </div>
          <div class="side">
            <ModuleNavBottomProperty :info="navBarInfo"></ModuleNavBottomProperty>
          </div>
        </div>
      </TabPane>
    </Tabs>
    <div class="action-bar">
      <Button
        class="btn-save"
        type="primary"
        shape="circle"
        @click="saveNavBarInfo"
        :perm="deviceType == 2 ? 'bigscreen.page.operate':'page.operate'"
      >保存并发布</Button>
    </div>
  </div>
</template>
<script>
import "@/views/shop/css/iconfont-front/iconfont.css";
import ModuleNavBottom from "./modules-mobi-for-render/ModuleNavBottom";
import ModuleNavBottomProperty from "./modules-mobi-for-design/ModuleNavBottomProperty";
export default {
  props: {
    deviceType: {
      type: Number,
      default: 1
    }
  },
  components: {
    ModuleNavBottom,
    ModuleNavBottomProperty
  },
  data() {
    return {
      navBarInfo: {
        id: 0,
        background: "",
        normal_color: "",
        active_color: ""
      }
    };
  },
  mounted: function() {
    this.loadNavInfo();
  },
  methods: {
    loadNavInfo() {
      // 和店铺的导航区分开 因为权限不一样
      let url =
        this.deviceType == 2
          ? "/shop/admin/ui/design/mobile/bigscreen/nav/get?id="
          : "/shop/admin/ui/design/mobile/nav/get?id=";
      this.$httpGet(
        url + this.navBarInfo.id,
        { device_type: this.deviceType },
        res => {
          for (var i = 0; i < res.data.items.length; i++) {
            res.data.items[i].id = i + 1;
          }
          this.navBarInfo = res.data;
          if (this.navBarInfo.device_type)
            this.deviceType = this.navBarInfo.device_type;
        }
      );
    },
    saveNavBarInfo() {
      // 检测是否填写完整
      let isError = false;
      let formData = JSON.parse(JSON.stringify(this.navBarInfo));
      formData.device_type = this.deviceType;
      let items = formData.items;
      for (let i = 0, len = items.length; i < len; i++) {
        if (items[i]["error"] === true) {
          this.$Message.error("导航" + (i + 1) + "未填写完整");
          isError = true;
          return false;
        }
        delete items[i]["error"];
      }
      if (isError) return false;
      let url =
        this.deviceType == 2
          ? "/shop/admin/ui/design/mobile/bigscreen/nav/save"
          : "/shop/admin/ui/design/mobile/nav/save";
      this.$httpPost(url, formData, res => {
        if (res.code == 200) {
          this.$Message.success("底部导航保存成功");
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
.frame .nav-bar {
  position: absolute;
  bottom: 0;
}
.nav-container .side {
  width: 354px;
  height: 100%;
  background: white;
}
.btn-save {
  background: #4570ea;
}
</style>
