<template>
  <div>
    <div class="editor-wrapper" :id="id"></div>
    <FilesSelector v-model="showFilesSelector" :max="10" @onSelected="onFilesSelected"></FilesSelector>
    <LinkSelector v-model="showLinksSelector" @onSelected="onLinkSelected"></LinkSelector>
  </div>
</template>
<script>
// 编辑器
// props
/**
 *    setting 编辑器添加的配置 在此可以设置高度 {initialFrameHeight:300}
 *    @on-changeData   编辑器内容发生变化时触发
 *    所有数据设置和获取通过调用组件的setCurrContent和getCurrContent方法（this.$refs[该组件在父组件的ref名称][方法名称（如setCurrContent）]）
 */
import FilesSelector from "@/components/files/files";
import LinkSelector from "@/views/shop/components/links/links";
import Base64 from "js-base64";
// 加载配置
import configData from "./config.js";

// const INIT = 0;
// const CHANGED = 2;
export default {
  components: { FilesSelector, LinkSelector },
  props: {
    setting: {
      default() {
        return {};
      },
      type: Object
    }, // 编辑器添加的配置 在此可以设置高度
    value: {
      type: String,
      default: ""
    },
    elmClass: {
      type: String,
      default: ".matter"
    }, // 是否悬停头部，在弹窗上的编辑器要设置为false
    posTop: {
      type: String,
      default: "60px"
    },
    hideImageSelector: {
      // 是否禁用图片选择器
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      id: "editor-" + new Date().getMilliseconds(),
      selectImgLimit: 10,
      ue: null,
      styleElm: null,
      $textarea: null,
      isLock: false,
      hasReady: false,
      linkIframeDoc: null,
      showFilesSelector: false,
      showLinksSelector: false
    };
  },
  mounted: function() {
    const that = this;
    // 合并配置项
    let config = Object.assign({}, configData, this.setting);
    // 动态插入需要初始化的节点
    let inputScript = document.createElement("script");
    let container = document.getElementById(this.id);
    container.removeAttribute("id");
    inputScript.setAttribute("id", this.id);
    window.$(container).prepend(inputScript); // 通过jquery添加到节点中
    // 初始化编辑器
    this.ue = new window.baidu.editor.ui.Editor(config);
    // 是否禁用图片选择器
    this.ue.hideImageSelector = this.hideImageSelector;
    this.ue.render(this.id);
    this.ue.ready(() => {
      if (!this.ue) {
        return
      }
      this.hasReady = true;

      // 重写添加图片事件
      if (!this.hideImageSelector) {
        container.querySelector(
          ".edui-for-youzhanimage .edui-button-body"
        ).onclick = () => {
          this.showFilesSelector = true;
        };
      }

      // 监听链接选择器弹出事件，重绑链接输入框按钮事件
      this.getUeDialogIframe("linkDialog", iframeDoc => {
        that.linkIframeDoc = iframeDoc;
        that.linkIframeDoc.querySelector("#href").onclick = function() {
          that.showLinksSelector = true;
        };
      });
      this.initHeight();
      this.setPositionHead();

      this.setCurrContent(this.value);
      this.onGetInputChange();
    });
  },
  watch: {
    value(value) {
      if (this.ue && this.ue.textarea) {
        if (value !== this.getCurrContent()) this.setCurrContent(value);
      } else if (this.ue) {
        this.ue.ready(() => {
          if (value !== this.getCurrContent()) this.setCurrContent(value);
        });
      }
    }
  },
  methods: {
    initHeight() {
      if (this.setting.initialFrameHeight !== "100%") {
        return;
      }
      let target = null;
      function findChildAndSetHeight($elmArray, className) {
        if (!$elmArray) {
          return;
        }
        for (let i = 0; i < $elmArray.length; i++) {
          $elmArray[i].style.height = "100%";
          if ($elmArray[i].className.split(/\s/).includes(className)) {
            target = $elmArray[i];
            break;
          } else {
            findChildAndSetHeight($elmArray[i].children, className);
          }
        }
      }
      findChildAndSetHeight([this.$el], "edui-editor");
      target.style.display = "flex";
      target.style.flexDirection = "column";
      target.querySelector(".edui-editor-iframeholder").style.flex = 1;
    },
    /**
     * 设置头部悬停滚动
     */
    setPositionHead() {
      // 获取滚动条位置
      let that = this;
      let scrollTop = window.$(this.elmClass).scrollTop();

      /**
       * 获取滚动事件需要用到的元素
       */
      const toolbarBox = this.ue.ui.getDom("toolbarbox");
      this.styleElm = document.createElement("style");
      document.body.appendChild(this.styleElm);
      window
        .$(this.elmClass)
        .off("scroll." + that.id)
        .on("scroll." + that.id, function() {
          // 比较与前一次滚动条位置是否有变化，防止进入死循环
          if (scrollTop === window.$(that.elmClass).scrollTop()) {
            return;
          }
          scrollTop = window.$(that.elmClass).scrollTop();
          // 如果编辑器没有菜单项则注销事件
          if (toolbarBox.length === 0) {
            window.$(that.elmClass).off("scroll." + that.id);
            return;
          }
          // 如果该组件是隐藏的，则返回不做操作，防止tab标签换页时出现头部定位不准问题，缺点时显示的时候可能需要菜单浮动而没有浮动，用户可以在显示的时候手动initToolbarBoxPosition方法
          if ($(that.ue.container).is(":hidden")) {
            // 强制恢复到菜单不浮动的效果
            if ($(toolbarBox).prev().length) {
              that.styleElm.innerHTML = `.editor-wrapper #${
                that.id
              } .edui-editor-toolbarbox{position: absolute !important;top: 0 !important;}`;
            } else {
              that.styleElm.innerHTML = "";
            }
            return;
          }
          that.initToolbarBoxPosition();
        });
    },
    initToolbarBoxPosition() {
      const toolbarBox = this.ue.ui.getDom("toolbarbox");
      // 触发ueditor在window绑定的scroll事件
      window.dispatchEvent(new Event("scroll"));

      // 从新计算头部菜单的位置
      this.styleElm.innerHTML = "";
      let posTop = parseInt($(toolbarBox).css("top"));
      let innerStyle = "";
      if (!isNaN(posTop) && posTop) {
        innerStyle = `.editor-wrapper #${
          this.id
        } .edui-editor-toolbarbox{top: ${this.posTop} !important;}`;
      } else if ($(toolbarBox).offset().top - parseInt(this.posTop) < 0) {
        innerStyle = `.editor-wrapper #${
          this.id
        } .edui-editor-toolbarbox{position: relative;z-index: 1;top: ${parseInt(
          this.posTop
        ) - $(toolbarBox).offset().top}px !important;}`;
      }
      this.styleElm.innerHTML = innerStyle;
    },
    /**
     * 监听百度编辑器内容变化
     */
    onGetInputChange() {
      this.ue.fireEvent("contentChange");
      // 获取输区域
      this.$textarea = $(this.ue.iframe)
        .contents()
        .find("body");

      let inputCallback = () => {};
      // 监听输入法开始
      this.$textarea[0].addEventListener(
        "compositionstart",
        this.onCompositionstart,
        false
      );
      // 监听输入法结束
      this.$textarea[0].addEventListener(
        "compositionend",
        this.onCompositionend,
        false
      );
      this.ue.addListener("contentChange", this.onEmitInputChange);
      this.$textarea.on("input." + this.id, this.onEmitInputChange);
    },
    onCompositionstart() {
      this.isLock = true;
    },
    onCompositionend() {
      this.isLock = false;
      this.onEmitInputChange();
    },
    onEmitInputChange() {
      if (this.isLock) return;
      this.$emit("input", this.getCurrContent());
    },

    /**
     *  获取百度编辑器内部定义的弹窗内容
     *  name  弹窗的名字（可以打印this.ue.ui._dialogs查看）
     *  callback 窗口实例化后的回调方法
     */
    getUeDialogIframe(name, callback) {
      // 监听链接选择器弹出事件，重绑链接输入框按钮事件
      var ueDialog = this.ue.ui._dialogs[name];
      ueDialog && ueDialog.on("show", () => {
        var ueIframe = window.$("#" + ueDialog.id).find("iframe")[0];
        // 获取弹窗初始化完成回调
        ueIframe.onload = ueIframe.onreadystatechange = function() {
          if (this.readyState && this.readyState != "complete") return;
          var iframeDoc = ueIframe.document || ueIframe.contentWindow.document;
          callback(iframeDoc);
        };
      });
    },
    /**
     *  强制设置文本编辑器内容
     */
    setCurrContent(val) {
      if (!this.hasReady) {
        this.ue.ready(() => {
          this.ue && this.ue.setContent(val || "");
        });
        return;
      }
      this.ue && this.ue.setContent(val || "");
    },
    /**
     *  获取当前文本编辑器的内容
     */
    getCurrContent() {
      return this.ue ? this.ue.getContent() : "";
    },
    // 插入选择的图片
    onFilesSelected(imageArray) {
      this.showFilesSelector = false;
      let execArray = [];
      if (imageArray && imageArray.length > 0) {
        imageArray.forEach(item => {
          execArray.push({
            src: item
          });
        });
        execArray.length && this.ue.execCommand("insertimage", execArray);
      }
    },
    /**
     * 链接选择器选中链接
     */
    onLinkSelected(linkInfo) {
      this.showLinksSelector = false;
      if (linkInfo && linkInfo.hasOwnProperty("name")) {
        this.linkIframeDoc.querySelector("#href").value = linkInfo["url"];
        this.linkIframeDoc.querySelector(
          "#linkinfo"
        ).value = Base64.Base64.encode(JSON.stringify(linkInfo));
      }
    }
  },
  beforeDestroy() {
    window.$(this.elmClass).off("scroll." + this.id);
    if (this.styleElm) {
      this.styleElm.remove();
    }
    this.$textarea.off("input." + this.id);
    this.$textarea[0].removeEventListener(
      "compositionstart",
      this.onCompositionstart,
      false
    );
    this.$textarea[0].removeEventListener(
      "compositionend",
      this.onCompositionend,
      false
    );
    this.ue && this.ue.destroy();

    // 如果 ueditor 有弹出层的时候，单纯销毁实例，可能不会销毁弹出层，所以这里还要做多一步.
    const eduiFixedlayer = document.querySelector("#edui_fixedlayer");
    if (eduiFixedlayer) {
      eduiFixedlayer.parentNode.removeChild(eduiFixedlayer);
    }
  }
};
</script>
<style lang="less" scoped>
.editor-wrapper {
  /deep/.edui-for-customstyle {
    .edui-button-body {
      width: 68px !important;
    }
  }
}
</style>

