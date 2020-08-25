<template>
  <div class="container">
    <div class="design-property">
      <div class="wrapper">
        <div class="modules">
          <h2>组件库</h2>
          <p>选择组件点击直接添加</p>
          <div class="mlist">
            <div @click="addModule('ModuleAuthTerm')">授权期限</div>
            <div @click="addModule('ModuleAuthCode')">授权编码</div>
            <div @click="addModule('ModuleAuthDate')">授权日期</div>
            <div @click="addModule('ModuleLevel')">经销商等级</div>
            <div @click="addModule('ModuleHead')">头像</div>
            <div @click="addModule('ModuleNickName')">昵称</div>
            <div @click="addModule('ModuleQrcode')">二维码</div>
            <div @click="addModule('ModuleImage')">图片</div>
            <div @click="addModule('ModuleText')">文本</div>
          </div>
        </div>
        <div class="design">
          <div class="page-border">
            <div class="paper-container" :style="info.background ? 'height: auto;':''">
              <vuescroll class="paper" :ops="ops" ref="vs">
                <div class="background">
                  <img v-if="info.background" :src="info.background" />
                </div>
                <ModuleRender
                  :modules="info.modules"
                  :currentEditingModule="currentEditingModule"
                  @on-edit="editModule"
                  @on-del="delModule"
                ></ModuleRender>
              </vuescroll>
            </div>
          </div>
          <div class="gtoolbar" v-if="info.modules.length > 1">
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
            :info="info"
            :currentEditingModule="currentEditingModule"
            @dataIsOk="myValidator"
          />
        </div>
      </div>
    </div>
    <div class="footbtn">
      <foot-button>
        <Button
          type="primary"
          @click="save"
          style="width: 70px;height:32px;margin-left:0"
          perm="dealer.authcert.operate"
          :loading="isLoading"
        >保存</Button>
      </foot-button>
    </div>
  </div>
</template>
<script>
import ModuleHelper from "./components/authcert-modules-for-design/ModuleHelper";
import ModuleRender from "./components/authcert-modules-for-render/module-render";
import PaperProperty from "./components/authcert-modules-for-design/PaperProperty";
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
      info: {
        id: 0,
        name: "",
        template: "",
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
          .get("/shop/admin/dealer/authcert/info", {
            params: { id: this.$route.query.id }
          })
          .then(res => {
            if (res.code == 200) {
              this.info.name = res.data.info.name;
              this.info.template = res.data.info.template;
              this.info.id = res.data.info.id;
              this.info.background = res.data.info.background;
              for (const key in res.data.info.modules) {
                const element = res.data.info.modules[key];
                this.info.modules.push(element);
              }
            }
          });
      } else {
        // this.info.template = JSON.parse(window.localStorage.getItem("template"));
        this.info.background = JSON.parse(
          window.localStorage.getItem("background")
        );
        this.info.modules = JSON.parse(window.localStorage.getItem("modules"));
      }
    },
    getTopMostModule() {
      var zIndex = -999999999;
      var mIndex = -1;
      this.info.modules.forEach((item, index) => {
        if (item.zIndex >= zIndex) {
          zIndex = item.zIndex;
          mIndex = index;
        }
      });
      if (mIndex > -1) return this.info.modules[mIndex];
    },
    getLowestModule() {
      var zIndex = 999999999;
      var mIndex = -1;
      this.info.modules.forEach((item, index) => {
        if (item.zIndex < zIndex) {
          zIndex = item.zIndex;
          mIndex = index;
        }
      });
      if (mIndex > -1) return this.info.modules[mIndex];
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
      this.info.modules.forEach((item, index) => {
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
        ModuleAuthTerm: "授权期限",
        ModuleAuthCode: "授权编码",
        ModuleAuthDate: "授权日期",
        ModuleLevel: "经销商等级",
        ModuleNickName: "昵称",
        ModuleHead: "头像",
        ModuleQrcode: "二维码",
        ModuleImage: "图片",
        ModuleText: "文本"
      };
      return ret[type];
    },
    addModule(type) {
      if (
        [
          "ModuleAuthTerm",
          "ModuleAuthCode",
          "ModuleAuthDate",
          "ModuleLevel",
          "ModuleNickName",
          "ModuleHead",
          "ModuleQrcode"
        ].indexOf(type) > -1
      ) {
        if (this.hasModule(type)) {
          this.$Message.error({
            content: "只能添加一个 " + this.getModuleName(type) + " 模块",
            duration: 2
          });
          return;
        }
      }
      var newModule = ModuleHelper.newModule(type);
      if (newModule.module_type == "ModuleQrcode") {
        newModule.showlink = 1;
        newModule.linkinfo.link_desc = "链接到 授权查询";
        newModule.linkinfo.link_type = "authcert_query";
        newModule.linkinfo.link_data = 0;
        newModule.linkinfo.link_url = "/dealer/dealer-authcert-query";
      }
      this.info.modules.push(newModule);
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
          this.info.modules.splice(moduleIndex, 1);
        }
      });
    },
    myValidator(val) {
      this.myValidatorResult = val;
    },
    //验证授权期限
    validateAuthTerm() {
      var modu = this.info.modules.find(item => {
        return item.module_type == "ModuleAuthTerm";
      });
      if (modu && !modu.term) {
        this.currentEditingModule = modu;
        return false;
      } else {
        return true;
      }
    },
    save() {
      this.$refs.myChild.myValidator();
      if (!this.myValidatorResult || !this.validateAuthTerm()) {
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
        var objToSave = Object.assign({}, this.info);
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
        this.$httpPost(
          "/shop/admin/dealer/authcert/save?id=" + this.info.id,
          { info: objToSave },
          res => {
            if (res.code == 200) {
              this.$Message.success({
                content: "保存成功！",
                duration: 2
              });
              if (res.data.id) this.info.id = res.data.id;
              this.$router.replace("/dealer/dealer-authcert-manage");
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
      min-height: 700px;
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
            min-height: 500px;
            height: 667px;
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
                img {
                  width: 100%;
                  height: 100%;
                  vertical-align: bottom;
                  object-fit: contain;
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
