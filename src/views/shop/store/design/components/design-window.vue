<template>
  <div class="mobile-page-design" :class="type ? 'mobile-page-design-' + type : ''">
    <div class="mobile-page-design-panel">
      <div class="modules">
        <div>
          <div class="components-title">组件库</div>
          <div class="components-tips">选择组件点击添加</div>
        </div>
        <div class="components" v-if="!type">
          <Tabs value="base-components" name="tab2">
            <TabPane label="基础组件" name="base-components" tab="tab2">
              <div class="base-components">
                <div @click="addModule('ModuleSearch')">搜索栏</div>
                <div @click="addModule('ModuleText')">文本</div>
                <div @click="addModule('ModuleLink')">导航栏</div>
                <div @click="addModule('ModuleSlider')">图片轮播</div>
                <div @click="addModule('ModuleProductList')">商品列表</div>
                <div @click="addModule('ModuleShopwindow')">图片组</div>
                <div @click="addModule('ModuleNotice')">公告栏</div>
                <div @click="addModule('ModuleTitle')">标题栏</div>
                <div @click="addModule('ModuleLine')">分隔线</div>
                <div @click="addModule('ModuleVideo')">视频</div>
                <div @click="addModule('ModuleBlank')">辅助空白</div>
              </div>
            </TabPane>
            <TabPane label="营销组件" name="marketing-components" tab="tab2">
              <div class="marketing-components">
                <div @click="addModule('ModuleCoupon')">优惠券</div>
                <div
                  v-if="hasLicensePerm('ENABLE_GROUP_BUYING')"
                  @click="addModule('ModuleGroupBuying')"
                >
                  多人拼团
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
        <div class="components" v-else-if="type === 'member'">
          <div class="base-components">
            <div @click="addModule('ModuleMemberInfo')">会员信息</div>
            <div @click="addModule('ModuleCapitalInfo')">资金信息</div>
            <div @click="addModule('ModuleOrderInfo')">订单信息</div>
            <div @click="addModule('ModuleMemberTools')">必备工具</div>
          </div>
        </div>
      </div>
      <div ref="module-container" class="module-container">
        <div :class="{'page-area':true,'big-screen':deviceType==2}">
          <div class="page-header" @click="editPage">
            <span class="page-name">{{ pageInfo.title }}</span>
          </div>
          <ModuleRender
            :style="'background:' + (type ? '#f7f7f7' : pageInfo.background)"
            :class="'theme-color ' + (memberInfo.color_config ? 'theme-color-' + memberInfo.color_config : '')"
            :modules="modules"
            :editMode="true"
            :memberInfo="memberInfo"
            :nosort="nosortModules"
            :currentEditingModule="currentEditingModule"
            @onEditModule="editModule"
            @onDelModule="deleteModule"
          ></ModuleRender>
          <div 
            class="gtoolbar" 
            :style="gToolbarStyle" 
            v-if="modules.length > 1"
          >
            <Tooltip content="上移组件" placement="right">
              <div 
                :class="['icon-item', canMoveTop ? '' : 'disable']" 
                @click="moveup"
              >
                <Icon type="ios-arrow-up" :size="20" :color="'white'" />
              </div>
            </Tooltip>
            <Tooltip content="下移组件" placement="right">
              <div 
                :class="['icon-item', canMoveBottom ? '' : 'disable']" 
                @click="movedown"
              >
                <Icon type="ios-arrow-down" :size="20" :color="'white'" />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <div v-if="currentEditingModule" class="property">
        <ModuleProperty
          v-if="currentEditingModule"
          :module="currentEditingModule"
          :designData="designData"
          :key="currentEditingModule.id"
        ></ModuleProperty>
      </div>
      <div v-show="!currentEditingModule&&!type" class="property">
        <PageProperty :pageInfo="pageInfo"></PageProperty>
      </div>
      <div 
        v-if="type === 'member'" 
        v-show="!currentEditingModule" 
        class="property"
      >
        <MemberProperty 
          ref="memberProperty" 
          :pageInfo="pageInfo"
        ></MemberProperty>
      </div>
    </div>
    <div class="savebar" v-if="!type">
      <Button @click="preview">预览</Button>
      <Button
        type="primary"
        :loading="saveLoading"
        @click="save(0, 0)"
        :perm="deviceType == 2 ? 'bigscreen.page.operate':'page.operate'"
      >保存</Button>
      <Button
        type="success"
        :loading="publishLoading"
        @click="save(0, 1)"
        :perm="deviceType == 2 ? 'bigscreen.page.operate':'page.operate'"
      >发布</Button>
    </div>
    <div class="savebar" v-else-if="type === 'member'">
      <Button
        type="primary"
        @click="save(0, 1)"
        :perm="deviceType == 2 ? 'bigscreen.page.operate':'page.operate'"
      >保存并发布</Button>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
//import draggable from "vuedraggable"; //使用方法参考 https://github.com/SortableJS/Vue.Draggable
import ModuleRender from "./modules-mobi-for-render/module-render";
import ModuleHelper from "./mobile-module-helper";
import ModuleProperty from "./modules-mobi-for-design/ModuleProperty";
import MemberProperty from "./MemberProperty";
import PageProperty from "./PageProperty";
import Sortable from "sortablejs";
import jQuery from "jquery";
import iView from "iview";
import { clearTimeout, setInterval, clearInterval } from "timers";
import "@/assets/scrollbar.less";
import { isNumber } from "util";
import memberMixin from "./mixin-member-center";
export default {
  name: "storeDesignMobile",
  components: {
    //draggable,
    ModuleRender,
    ModuleProperty,
    PageProperty,
    MemberProperty
  },
  props: {
    type: {
      type: String,
      default: ""
    },
    deviceType: {
      type: Number,
      default: 1
    }
  },
  mixins: [memberMixin],
  data() {
    let pageInfo = {};
    switch (this.type) {
      case "":
        pageInfo = {
          id: 0,
          title: "页面名称",
          description: "",
          background: "transparent"
        };
        break;
      case "member":
        pageInfo = {
          id: 0,
          title: "会员首页"
        };
        break;
      default:
        break;
    }
    return {
      moduleIndex: {}, //记录模块的显示顺序
      deletedModules: [], //记录删除的模块的ID
      modules: [], //记录当前页面有哪些模块
      currentEditingModule: null, //记录当前正在编辑的模块
      nosortModules: ["ModuleMemberInfo"], // 不允许拖拽的模块
      designData: {},
      pageInfo,
      isDraging: false, //当前是否正在进行拖动排序中，在排序时要动态处理一些样式等
      sortable: null, //排序组件的实例
      autoSaveTimer: null,
      pageLeave: false,
      saveLoading: false,
      publishLoading: false
    };
  },
  computed: {
    canMoveTop() {
      if (!this.currentEditingModule) {
        return false;
      }
      // 排除不可移动元素
      if (this.nosortModules.includes(this.currentEditingModule.module_type)) {
        return false;
      }
      // 第一个能移动的元素
      let topMoveIndex = this.modules.findIndex(
        n => !this.nosortModules.includes(n.module_type)
      );
      let index1 = topMoveIndex > -1 ? topMoveIndex : 0;
      // 在第一个可移动元素下方的才允许上移
      let index = this.findModule(this.currentEditingModule)[1];
      if (index > index1) {
        return true;
      }
      return false;
    },
    canMoveBottom() {
      if (!this.currentEditingModule) {
        return false;
      }
      // 排除不可移动元素
      if (this.nosortModules.includes(this.currentEditingModule.module_type)) {
        return false;
      }
      // 最后一个可移动元素上边的才允许下移
      let index = this.findModule(this.currentEditingModule)[1];
      if (index < this.modules.length - 1) {
        return true;
      }
      return false;
    },
    gToolbarStyle() {
      if (this.deviceType == 2) {
        return {
          left: "calc(50% + 263px)"
        };
      } else {
        return {};
      }
    }
  },
  created: function() {},
  mounted: function() {
    var that = this;
    if (this.$route.query.id) this.pageInfo.id = this.$route.query.id;
    this.loadPageInfo();
    // 如果是主页编辑
    switch (this.type) {
      case "":
        this.autoSaveTimer = setInterval(() => {
          this.save(2);
        }, 600 * 1000); //10分钟自动保存一次
        break;
      default:
        break;
    }
  },
  beforeDestroy() {
    clearInterval(this.autoSaveTimer);
  },
  updated: function() {
    var that = this;
    this.$nextTick(function() {
      if (that.modules.length > 0) {
        that.initSort();
      }
    });
  },
  /** 路由离开时自动保存 */
  beforeRouteLeave(to, from, next) {
    // 退出登录需要手动调用save(1)在跳出登录
    if (!this.pageLeave && to.name !== "login") {
      switch (this.type) {
        case "":
          this.save(1);
          break;
        default:
          break;
      }
      this.pageLeave = true;
    }
    next();
  },
  methods: {
    /**
     * 用于退出登录调用
     */
    beforeLeaveCallBack() {
      switch (this.type) {
        case "":
          return this.save(1);
          break;
        default:
          return Promise.resolve();
          break;
      }
    },
    initSort() {
      var that = this;
      if (that.sortable) that.sortable.destroy();
      that.sortable = Sortable.create(document.getElementById("module-list"), {
        delay: 50,
        emptyInsertThreshold: 5,
        direction: "vertical",
        draggable: ".cansort",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        scroll: true,
        scrollSpeed: 10,
        onStart: function() {
          that.isDraging = true;
        },
        onEnd: function(evt) {
          that.isDraging = false;

          if (evt.newIndex < evt.oldIndex) {
            that.modules.splice(evt.newIndex, 0, that.modules[evt.oldIndex]);
            that.modules.splice(evt.oldIndex + 1, 1);
          } else {
            that.modules.splice(
              evt.newIndex + 1,
              0,
              that.modules[evt.oldIndex]
            );
            that.modules.splice(evt.oldIndex, 1);
          }
        }
      });
    },
    loadPageInfo() {
      switch (this.type) {
        case "":
          this.loadHomepageInfo();
          break;
        case "member":
          this.loadMemberpageInfo();
          break;
        default:
          break;
      }
    },
    /**
     * 加载店铺主页信息
     */
    loadHomepageInfo() {
      this.$httpGet(
        "/shop/front/page/mobile/info?id=" + this.pageInfo.id,
        { device_type: this.deviceType },
        res => {
          this.modules = res.data.modules.modules;
          if (res.data.pageInfo) {
            this.pageInfo = res.data.pageInfo;
            if (this.pageInfo.device_type)
              this.deviceType = this.pageInfo.device_type;
          }
        }
      );
    },
    findModule(idOrObj) {
      var id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
      id = id.toString().replace("module_", "");
      var m = null;
      var index = 0;
      this.modules.forEach((item, i) => {
        if (item.id == id) {
          m = item;
          index = i;
        }
      });
      return [m, index];
    },
    hasModule(type) {
      var found = false;
      this.modules.forEach((item, index) => {
        if (item.module_type == type) {
          found = true;
        }
      });
      return found;
    },
    getUniqueModuleName() {
      return {
        ModuleMemberInfo: "会员信息",
        ModuleCapitalInfo: "资金信息",
        ModuleOrderInfo: "订单信息",
        ModuleMemberTools: "必备工具"
      };
    },
    addModule(type) {
      let moduleName = this.getUniqueModuleName();
      if (moduleName[type] && this.hasModule(type)) {
        this.$Message.error({
          content: "只能添加一个 " + moduleName[type] + " 模块",
          duration: 2
        });
        return false;
      }
      var m = ModuleHelper.newModule(type, this.type);
      if (!m) {
        alert("未能生成模块，请检查程序");
        return false;
      }
      if (this.nosortModules.includes(type)) {
        this.modules.unshift(m);
      } else {
        this.modules.push(m);
      }
      setTimeout(() => {
        var top =
          jQuery("#module_" + m.id).position().top +
          jQuery("#module-list").scrollTop();
        jQuery("#module-list").animate({ scrollTop: top }, 500);
        jQuery("#module_" + m.id).click();
      }, 300);
    },
    editModule(id) {
      var m = this.findModule(id)[0];
      this.currentEditingModule = m;
    },
    deleteModule(id) {
      this.$Modal.confirm({
        title: "提示",
        content: "确认删除吗?",
        cancelText: "取消",
        onOk: () => {
          var mInfo = this.findModule(id);
          if (
            this.currentEditingModule &&
            mInfo[0].id == this.currentEditingModule.id
          )
            this.currentEditingModule = null;
          this.deletedModules.push(mInfo[0].id);
          this.modules.splice(mInfo[1], 1);
          setTimeout(() => {
            this.fixTop();
          }, 200);
        }
      });
    },
    fixTop() {
      //修正固顶显示时的占位高度
      var hasFixTop = jQuery.find(".module-item.fixed-top-edit").length > 0;
      if (hasFixTop) {
        var height = jQuery(".module-item.fixed-top-edit").outerHeight();
        jQuery("#module-list").css("padding-top", height + "px");
      } else {
        jQuery("#module-list").css("padding-top", "0");
      }
    },
    swapArray(arr, index1, index2) {
      var tmp = arr[index1];
      arr.splice(index1, 1, arr[index2]);
      arr.splice(index2, 1, tmp);
    },
    /**
     * 上移模块
     */
    moveup() {
      if (!this.canMoveTop) return;
      var index1 = this.findModule(this.currentEditingModule)[1];
      var index2 = index1 - 1;
      this.swapArray(this.modules, index1, index2);
    },
    /**
     * 下移模块
     */
    movedown() {
      if (!this.canMoveBottom) return;
      var index1 = this.findModule(this.currentEditingModule)[1];
      var index2 = index1 + 1;
      this.swapArray(this.modules, index1, index2);
    },
    editPage() {
      this.currentEditingModule = null;
    },
    // 验证数据是否正确
    validiateData() {
      return new Promise(resolve => {
        switch (this.type) {
          case "member":
            this.$refs["memberProperty"].$refs["formValidate"].validate(
              valid => {
                if (!valid) {
                  this.currentEditingModule = null;
                }
                resolve(valid);
              }
            );
            break;
          default:
            resolve(true);
            break;
        }
      });
    },
    /**
     * 保存数据
     * @saveType int, 1 = 路由离开是自动保存，2 = 定时自动保存，0|undefined = 手动保存
     */
    async save(saveType, publish) {
      let status = await this.validiateData();
      if (!status) {
        return;
      }
      var that = this;
      var list = document.querySelectorAll(".cansort");
      list.forEach((item, index) => {
        var id = item.id.replace("module_", "");
        that.moduleIndex[id] = index;
      });
      var data = {
        modules: that.modules,
        sort: that.moduleIndex,
        deletedModules: that.deletedModules,
        pageInfo: this.pageInfo,
        publish: publish ? 1 : 0,
        device_type: this.deviceType
      };
      switch (this.type) {
        case "member":
          data.type = 2;
          break;
        default:
          break;
      }
      if(saveType == 0) {
        if(publish == 1) {
          this.publishLoading = true;
        } else {
          this.saveLoading = true;
        }
      }
      return new Promise(resolve => {
        let url = this.deviceType == 2 
          ? "/shop/admin/ui/design/mobile/bigscreen/page/save?page_id=" 
          : "/shop/admin/ui/design/mobile/page/save?page_id=";
        this.$httpPost(
          url + this.pageInfo.id,
          data,
          res => {
            this.publishLoading = false;
            this.saveLoading = false;
            if (res.code == 200) {
              //更新新增加的模块的ID
              for (var key in res.data.new_ids) {
                var mInfo = that.findModule(key);
                mInfo[0].id = res.data.new_ids[key];
              }
              if (saveType !== 1 && !publish) {
                iView.Message.success({
                  content: saveType ? "自动保存成功！" : "页面保存成功！",
                  duration: 2
                });
              } else if (publish) {
                iView.Message.success({
                  content: "保存并发布成功！",
                  duration: 2
                });
              }
              if (res.data.page_id) this.pageInfo.id = res.data.page_id;
            } else {
              iView.Message.error({
                content: "保存失败:" + res.msg,
                duration: 2
              });
            }
            resolve();
          }
        );
      });
    },
    /**预览 */
    preview() {
      window.open(
        "preview.html?id=" +
          this.pageInfo.id +
          "&noClick=1&fromCache=0&device_type=" +
          this.deviceType
      );
    }
  }
};
</script>
<style lang="less" scoped>
.mobile-page-design {
  .mobile-page-design-panel {
    display: flex; /*设为伸缩容器*/
    flex-flow: row; /*伸缩项目单行排列*/
    height: calc(100vh - 120px);
    .modules {
      display: block;
      width: 211px; /*固定宽度*/
      background: #f9fbfd;
      padding: 30px 20px 0;

      .components-title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      .components-tips {
        font-size: 14px;
        color: #666;
      }
      .components {
        margin-top: 25px;
        /deep/.ivu-tabs {
          .ivu-tabs-bar {
            border-bottom: 0;
          }
          .ivu-tabs-tab {
            font-size: 13px;
            font-weight: bold;
            padding: 10px 5px;
          }
          .ivu-tabs-tab-active {
            color: #4570ea;
          }
          .ivu-tabs-ink-bar {
            background: transparent;
          }
          .ivu-tabs-ink-bar::before {
            content: "";
            width: 25px;
            height: 3px;
            background: #4570ea;
            border-radius: 2px;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
          }
        }
        .base-components,
        .marketing-components {
          display: grid;
          grid-template-columns: repeat(2, 80px);
          grid-auto-flow: row;
          justify-items: center;
          grid-gap: 10px;
          margin-top: 12px;

          > div {
            border: 1px dashed #e5e5e5;
            border-radius: 2px;
            width: 80px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            cursor: pointer;
            color: #333;
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
    }
    .module-container {
      flex: 1;
      height: 100%;
      background: #f2f4fd;
      display: flex;
      flex-direction: column;
      position: relative;
      .page-area {
        width: 375px;
        margin: 0 auto;
        margin-bottom: 20px;
        border: 1px solid #e8eaec;
        flex: 1;
        display: flex;
        flex-direction: column;
        background: white;
        overflow: auto;
        &.big-screen {
          width: 500px;
          /deep/.fixed-top-edit {
            width: 498px;
          }
        }
        .page-header {
          height: 60px;
          cursor: pointer;
          background-image: url("../../../../../../public/images/mobile-top.jpg");
          background-size: 100%;
          text-align: center;

          .page-name {
            height: 27px;
            line-height: 27px;
            text-align: center;
            color: #333;
            font-size: 16px;
            margin: 25px auto 0 auto;
            display: inline-block;
          }
        }
        .theme-color {
          &.theme-color-red {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #fd4d66,
                #fe3737
              ) !important;
            }
          }
          &.theme-color-orange {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #ff9602,
                #ff5407
              ) !important;
            }
          }
          &.theme-color-blue {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #2dadfc,
                #637bfb
              ) !important;
            }
          }
          &.theme-color-green {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #86d677,
                #05c160
              ) !important;
            }
          }
          &.theme-color-golden {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #e0bb7e,
                #cd9038
              ) !important;
            }
          }
          &.theme-color-pink {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #ff4aad,
                #ff1269
              ) !important;
            }
          }
          &.theme-color-black {
            /deep/.theme-gr-bg-color {
              background: linear-gradient(
                to right,
                #333333,
                #000000
              ) !important;
            }
          }
        }
        /deep/#module-list {
          flex: 1;
          overflow-x: hidden;
          overflow-y: auto;

          .no-modules {
            position: absolute;
            top: 50%;
            text-align: center;
            transform: translateY(-50%);
            width: 100%;

            .image {
              margin-bottom: 30px;
            }
            .text {
              font-size: 16px;
              line-height: 36px;
              color: #333333;
              text-align: center;
            }
          }

          .module-item {
            cursor: default !important;
            min-height: 31px !important;
          }
        }
      }
      .gtoolbar {
        position: absolute;
        top: 50%;
        left: calc(50% + 213px);
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
      width: 362px; /*固定宽度*/
      height: 100%;
      overflow-y: auto;
    }
  }
  .savebar {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #ebebeb;
    > button {
      margin: 0 6px;
      border-radius: 20px;
      min-width: 70px;
    }
  }
  /deep/.ivu-icon-md-close-circle:before {
    background: white;
    border-radius: 10px;
  }
}
</style>
