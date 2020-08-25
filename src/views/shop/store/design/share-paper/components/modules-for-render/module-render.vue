<template>
  <div class="module-list">
    <div
      v-for="m in modules"
      :key="m.id"
      :class="['module-item',m.module_type,currentEditingModule && currentEditingModule.id == m.id ? 'active':'']"
      :id="m.id"
      :style="getStyle(m)"
    >
      <!--删除按钮-->
      <div
        v-if="m.module_type != 'ModuleQrcode'"
        :key="'del-' + m.id"
        class="btn-del"
        @click="delModule(m.id,$event)"
      >
        <img src="images/share-paper/del.png">
      </div>
      <!--头像本模块 -->
      <ModuleHead
        v-if="m.module_type == 'ModuleHead'"
        :module="m"
        :currentEditingModule="currentEditingModule"
      ></ModuleHead>
      <!--昵称模块 -->
      <ModuleNickName
        v-if="m.module_type == 'ModuleNickName'"
        :module="m"
        :currentEditingModule="currentEditingModule"
      ></ModuleNickName>
      <!--文本模块-->
      <ModuleText
        v-if="m.module_type == 'ModuleText'"
        :module="m"
        :currentEditingModule="currentEditingModule"
      ></ModuleText>
      <!--二维码模块 -->
      <ModuleQrcode
        v-if="m.module_type == 'ModuleQrcode'"
        :module="m"
        :currentEditingModule="currentEditingModule"
      ></ModuleQrcode>
      <!--图片模块 -->
      <ModuleImage
        v-if="m.module_type == 'ModuleImage'"
        :module="m"
        :currentEditingModule="currentEditingModule"
      ></ModuleImage>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import ModuleText from "./ModuleText";
import ModuleHead from "./ModuleHead";
import ModuleQrcode from "./ModuleQrcode";
import ModuleNickName from "./ModuleNickName";
import ModuleImage from "./ModuleImage";
let $ = window.$;
export default {
  components: {
    ModuleText,
    ModuleHead,
    ModuleQrcode,
    ModuleNickName,
    ModuleImage
  },
  props: ["modules", "currentEditingModule"],
  data() {
    return {};
  },
  mounted() {
    setTimeout(() => {
      this.initEvent();
    }, 100);
    this.initKeyMove();
  },
  beforeDestroy(){
    this.stopKeyMove();
  },
  updated() {
    this.$nextTick(() => {
      this.initEvent();
    });
  },
  methods: {
    initEvent() {
      var that = this;
      $(".module-item").resizable({
        minHeight: 20,
        minWidth: 20,
        autoHide: true,
        handles: "all",
        resize: function( event, ui ) {
          if (ui.element.hasClass("ModuleHead") || ui.element.hasClass("ModuleQrcode")) {
            ui.element.height(ui.size.width);
          }
        }
      });
      $(".module-item").draggable({
        containment: ".paper"
      });
      $(".module-item")
        .off("click")
        .on("click", function() {
          that.editModule($(this).attr("id"));
        });
    },
    initKeyMove(){
      $(document).on("keydown.moveobj", function(e) {
        var obj = $('.module-item.active');
        if(obj.length > 0){
          var limitX=$('.module-list').width()-obj.width();
          var limitY=$('.module-list').height()-obj.height();
          var position = obj.position();
          switch (e.keyCode) {
            case 37:
              e.preventDefault();
              position.left -= 1;
              break;
            case 38:
              e.preventDefault();
              position.top -= 1;
              break;
            case 39:
              e.preventDefault();
              position.left += 1;
              break;
            case 40:
              e.preventDefault();
              position.top += 1;
              break;
            default:
              break;
          }
          position.left=Math.min(limitX,Math.max(0,position.left))
          position.top=Math.min(limitY,Math.max(0,position.top))
          obj.css({
            left:position.left+'px',
            top:position.top+'px'
          })
        }
      });
    },
    stopKeyMove(){
      $(document).off("keydown.moveobj");
    },
    getStyle(module) {
      return {
        position: module.position,
        width: module.width,
        height: module.height,
        top: module.top,
        left: module.left,
        "z-index": module.zIndex
      };
    },
    findModule(idOrObj) {
      var id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
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
    editModule(id) {
      var m = this.findModule(id)[0];
      this.$emit("on-edit", m);
    },
    delModule(id, event) {
      event.stopPropagation();
      var index = this.findModule(id)[1];
      this.$emit("on-del", index);
    }
  },
  beforeDestroy() {
    window.removeEventListener("keydown",this.onKeyDown)
  }
};
</script>
<style lang="less" scoped>
.module-list {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  overflow: hidden;
}
/deep/.module-item {
  cursor: move;
  box-sizing: border-box;
  &:hover {
    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      border: 2px dashed #4570ea;
      z-index: 1;
    }
    .btn-del {
      display: block;
      z-index: 2;
    }
  }
  &.active {
    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      border: 2px dashed #4570ea;
      z-index: 2;
    }
  }
  .btn-del {
    width: 16px;
    height: 16px;
    position: absolute;
    top: 0;
    right: 0;
    display: none;
    cursor: pointer;
  }
  .ui-resizable-nw {
    border: 1px solid #4570ea;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    background: white;
  }
  .ui-resizable-ne {
    border: 1px solid #4570ea;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    background: white;
  }
  .ui-resizable-sw {
    border: 1px solid #4570ea;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    background: white;
  }
  .ui-resizable-se {
    background-image: none !important;
    border: 1px solid #4570ea;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    right: -5px;
    bottom: -5px;
    background: white;
  }
}
.ModuleText {
  text-align: left;
  display: flex;
  align-items: center;
}
.ModuleNickName {
  text-align: left;
  display: flex;
  align-items: center;
}
</style>