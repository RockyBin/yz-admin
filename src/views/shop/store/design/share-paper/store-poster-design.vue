<template>
  <div class="container">
    <!-- <div class="main-content-title">
      <div style="margin-left:10px;cursor:pointer" @click="goBackToPosterSetting">海报设置</div>
      <img
        style="margin:0 20px;"
        :src="require('@/views/shop/store/design/components/images/stepline.png')"
        alt="" />
      <div class="design" style="color:#4A6AF5;cursor:pointer">海报设计</div>
    </div>-->
    <div class="design-property">
      <div class="wrapper">
        <div class="modules">
          <h2>组件库</h2>
          <p>选择组件点击直接添加</p>
          <div class="mlist">
            <div @click="addModule('ModuleHead')">头像</div>
            <div @click="addModule('ModuleNickName')">昵称</div>
            <div @click="addModule('ModuleQrcode')">二维码</div>
            <div @click="addModule('ModuleImage')">图片</div>
            <div @click="addModule('ModuleText')">文本</div>
          </div>
        </div>
        <div class="design">
          <div class="page-border">
            <div class="paper-container" :style="paperInfo.background ? 'height: auto;':''">
              <vuescroll class="paper" :ops="ops" ref="vs">
                <div class="background">
                  <img v-if="paperInfo.background" :src="paperInfo.background" />
                </div>
                <ModuleRender
                  :modules="paperInfo.modules"
                  :currentEditingModule="currentEditingModule"
                  @on-edit="editModule"
                  @on-del="delModule"
                ></ModuleRender>
              </vuescroll>
            </div>
          </div>
          <div class="gtoolbar" v-if="paperInfo.modules.length > 1">
            <Tooltip content="置顶" placement="right">
              <div
                :class="['icon-item',currentEditingModule && isTopMost(currentEditingModule) == false ? '' : 'disable']"
                @click="moveup(currentEditingModule)"
              >
                <Icon type="ios-arrow-up" :size="20" :color="'white'" />
              </div>
            </Tooltip>
            <Tooltip content="置底" placement="right">
              <div
                :class="['icon-item',currentEditingModule && isLowest(currentEditingModule) == false ? '' : 'disable']"
                @click="movedown(currentEditingModule)"
              >
                <Icon type="ios-arrow-down" :size="20" :color="'white'" />
              </div>
            </Tooltip>
          </div>
        </div>
        <div class="property">
          <PaperProperty
            ref="myChild"
            :paperInfo="paperInfo"
            :currentEditingModule="currentEditingModule"
            @dataIsOk="myValidator"
          />
        </div>
      </div>
    </div>
    <div class="footbtn">
      <foot-button>
        <!-- <button
          style="width: 65px;height: 17px;line-height: 1;outline: none;border: none;color: #464c5b;background: #fff;border-radius: 0;margin-right: 50px;cursor:pointer;position: relative;top: 3px;"
          @click="goBackToPosterSetting"
        >
          <Icon type="ios-arrow-round-back" color="#081221" :size="24" />上一步
        </button>-->
        <Button
          type="primary"
          @click="save"
          style="width: 70px;height:32px;margin-left:0"
          perm="poster.operate"
          :loading="isLoading"
        >保存</Button>
      </foot-button>
    </div>
  </div>
</template>
<script>
import ModuleHelper from "./components/modules-for-design/ModuleHelper";
import ModuleRender from "./components/modules-for-render/module-render";
import PaperProperty from "./components/modules-for-design/PaperProperty";
import footButton from "@/views/shop/components/button/foot-button.vue";
import vuescroll from "vuescroll";
import axios from "axios";

let $ = window.$;
export default {
  components: {
    ModuleRender,
    PaperProperty,
    footButton,
    vuescroll
  },
  data() {
    return {
      paperInfo: {
        id: 0,
        type: 1,
        name: "",
        template: "",
        keyword: "",
        desc: "",
        background: "",
        modules: []
      },
      currentEditingModule: null,
      ops: {
        //自定义的滚动条，参考 https://vuescrolljs.yvescoding.org/guide
        rail: {
          opacity: "0.6",
          background: "#f5f5f5",
          border: "1px solid #eee",
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
      },
      myValidatorResult: false,
      isLoading: false
    };
  },
  mounted() {
    this.loadTemplate();
  },
  methods: {
    loadTemplate() {
      // 点击编辑跳转进来
      if (this.$route.query.id) {
        axios
          .get("/shop/admin/sharepaper/mobi/paper/info", {
            params: { id: this.$route.query.id }
          })
          .then(res => {
            if (res.code == 200) {
              this.paperInfo.desc = res.data.paperInfo.desc;
              this.paperInfo.name = res.data.paperInfo.name;
              this.paperInfo.template = res.data.paperInfo.template;
              this.paperInfo.id = res.data.paperInfo.id;
              this.paperInfo.keyword = res.data.paperInfo.keyword;
              this.paperInfo.background = res.data.paperInfo.background;
              for (const key in res.data.paperInfo.modules) {
                const element = res.data.paperInfo.modules[key];
                this.paperInfo.modules.push(element);
              }
            }
          });
      } else {
        let tempdata = JSON.parse(window.localStorage.getItem("template"));
        this.paperInfo.template = JSON.parse(
          window.localStorage.getItem("template")
        );
        this.paperInfo.background = JSON.parse(
          window.localStorage.getItem("background")
        );
        this.paperInfo.modules = [
          ...JSON.parse(window.localStorage.getItem("modules"))
        ];
        // 点击编辑进到设计界面，获取不到模板时id重新赋值，避免新生成海报
        // this.paperInfo.id = this.$store.state.templateData.id;
      }
    },
    getTopMostModule() {
      var zIndex = -999999999;
      var mIndex = -1;
      this.paperInfo.modules.forEach((item, index) => {
        if (item.zIndex >= zIndex) {
          zIndex = item.zIndex;
          mIndex = index;
        }
      });
      if (mIndex > -1) return this.paperInfo.modules[mIndex];
    },
    getLowestModule() {
      var zIndex = 999999999;
      var mIndex = -1;
      this.paperInfo.modules.forEach((item, index) => {
        if (item.zIndex < zIndex) {
          zIndex = item.zIndex;
          mIndex = index;
        }
      });
      if (mIndex > -1) return this.paperInfo.modules[mIndex];
    },
    isTopMost(module) {
      var topModule = this.getTopMostModule();
      return topModule && topModule.id == module.id;
    },
    isLowest(module) {
      var lowModule = this.getLowestModule();
      return lowModule && lowModule.id == module.id;
    },
    hasModule(type) {
      var found = false;
      this.paperInfo.modules.forEach((item, index) => {
        if (item.module_type == type) {
          found = true;
        }
      });
      return found;
    },
    moveup(module) {
      var topModule = this.getTopMostModule();
      if (topModule) module.zIndex = topModule.zIndex + 1;
      else module.zIndex += 1;
    },
    movedown(module) {
      var lowModule = this.getLowestModule();
      if (lowModule) module.zIndex = lowModule.zIndex - 1;
      else module.zIndex -= 1;
    },
    getModuleName(type) {
      var ret = {
        ModuleNickName: "昵称",
        ModuleHead: "头像",
        ModuleQrcode: "二维码",
        ModuleImage: "图片",
        ModuleText: "文本"
      };
      return ret[type];
    },
    addModule(type) {
      if (["ModuleNickName", "ModuleHead", "ModuleQrcode"].indexOf(type) > -1) {
        if (this.hasModule(type)) {
          this.$Message.error({
            content: "只能添加一个 " + this.getModuleName(type) + " 模块",
            duration: 2
          });
          return;
        }
      }
      this.paperInfo.modules.push(ModuleHelper.newModule(type));
    },
    editModule(module) {
      this.currentEditingModule = module;
    },
    delModule(moduleIndex) {
      this.$Modal.confirm({
        title: "提示",
        content: "确认删除吗?",
        cancelText: "取消",
        onOk: () => {
          this.currentEditingModule = null;
          this.paperInfo.modules.splice(moduleIndex, 1);
        }
      });
    },
    myValidator(val) {
      this.myValidatorResult = val;
    },
    save() {
      this.$refs.myChild.myValidator();
      if (!this.myValidatorResult) {
        this.$refs.myChild.isHide = false;
        this.$Message.error({
          content: "保存失败",
          duration: 2
        });
        return;
      } else {
        this.isLoading = true;
        var parent = $(".module-list");
        var pWidth = parent.width();
        var pHeight = parent.height();
        var objToSave = Object.assign({}, this.paperInfo);
        objToSave.modules.forEach(item => {
          var itemDom = $("#" + item.id);
          item.width = ((itemDom.outerWidth() / pWidth) * 100).toFixed(4) + "%";
          item.height =
            ((itemDom.outerHeight() / pHeight) * 100).toFixed(4) + "%";
          item.top =
            (
              ((itemDom.offset().top - parent.offset().top) / pHeight) *
              100
            ).toFixed(4) + "%";
          item.left =
            (
              ((itemDom.offset().left - parent.offset().left) / pWidth) *
              100
            ).toFixed(4) + "%";
        });
        if (this.paperInfo.keyword) {
          objToSave.keyword = [{ value: this.paperInfo.keyword, type: 0 }];
        } else {
          delete objToSave.keyword;
        }
        this.$httpPost(
          "/shop/admin/sharepaper/mobi/paper/save?paper_id=" +
            this.paperInfo.id,
          { paperInfo: objToSave },
          res => {
            if (res.code == 200) {
              this.$Message.success({
                content: "保存成功！",
                duration: 2
              });
              if (res.data.paper_id) this.paperInfo.id = res.data.paper_id;
              this.$router.replace(
                "/store/store-poster-manage/store-poster-list"
              );
            } else {
              this.$Message.error({
                content: "保存失败：" + res.msg,
                duration: 2
              });
            }
          }
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  height: calc(100vh - 120px);
  padding-bottom: 0 !important;
  .main-content-title {
    border-bottom: 1px solid #eeeeee;
    &:first-child::before,
    .design::before {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 25px;
      border-radius: 50%;
      color: #fff;
    }
    &:first-child::before {
      content: "1";
      background: #707070;
    }
    .design::before {
      content: "2";
      margin-right: 10px;
      background: #4a6af5;
    }
    height: 60px;
    line-height: 60px;
    text-align: center;
    div {
      display: inline-block;
      font-size: 15px;
    }
  }

  .design-property {
    flex: 1;
    height: 100%;
    overflow: auto;
    .wrapper {
      display: flex;
      height: 100%;
      min-height: 640px;
      .modules {
        width: 210px;
        padding: 20px;
        background: #f9fbfd;
        h2 {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        p {
          font-size: 13px;
          color: #666;
          margin-bottom: 28px;
        }
        .mlist {
          display: grid;
          grid-template-columns: repeat(2, 50%);
          grid-auto-flow: row;
          justify-items: center;
          margin-top: 12px;

          > div {
            border: 1px dashed #e5e5e5;
            border-radius: 2px;
            width: 80px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            margin-bottom: 10px;
            margin-right: 10px;
            cursor: pointer;
            color: #333;
            background: white;
            font-size: 12px;
            background: white;
            &:nth-child(even) {
              margin-right: 0px;
            }

            &:hover {
              border-color: #4570ea;
              color: #4570ea;
            }
          }
        }
      }
      /deep/.design {
        flex: 1;
        background: #f2f4fd;
        display: flex;
        justify-content: center;
        align-items: center;
        .page-border {
          padding: 15px;
          background: #f9fbfd;
          border-radius: 10px;
          border: 1px solid #ccc;
          .paper-container {
            min-height: 450px;
            height: 563px;
            width: 375px;
            .paper {
              width: 100%;
              height: 100%;
              position: relative;
              background: white;
              z-index: 2;
              .background {
                width: 100%;
                height: 100%;
                /deep/img {
                  width: 100%;
                  height: 100%;
                  vertical-align: bottom;
                }
              }
              .__rail-is-vertical {
                display: none;
              }
              &:hover {
                .__rail-is-vertical {
                  display: block;
                }
              }
            }
          }
        }

        .gtoolbar {
          position: absolute;
          top: 40%;
          left: calc(50% + 142px);
          background: #999;
          width: 40px;
          z-index: 100;
          .ivu-tooltip {
            width: 100%;
          }
          .icon-item {
            cursor: pointer;
            width: 100%;
            height: 40px;
            line-height: 40px;
            text-align: center;

            &:hover {
              background: #666;
            }
            &.disable {
              opacity: 0.3;
              cursor: not-allowed;
            }
          }
        }
      }
      .property {
        width: 360px;
        overflow: auto;
      }
    }
  }
}
</style>
