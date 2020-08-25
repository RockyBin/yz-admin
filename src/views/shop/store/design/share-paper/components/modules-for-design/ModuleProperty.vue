<template>
  <div class="module-property" v-if="module" :style="{maxHeight:isHide?'44px':'100%'}">
    <div class="title-mask" @click="isHide=!isHide">
      <Icon type="ios-arrow-down" size="15" :style="{transform:isHide?'rotate(-90deg)':'rotate(0deg)'}"></Icon>
    </div>
    <!--昵称模块-->
    <template v-if="module.module_type == 'ModuleNickName'">
      <ModuleNickNameProperty :module="module"></ModuleNickNameProperty>
    </template>
    <!--文本模块-->
    <template v-if="module.module_type == 'ModuleText'">
      <ModuleTextProperty :module="module"></ModuleTextProperty>
    </template>
    <!--图片模块-->
    <template v-if="module.module_type == 'ModuleImage'">
      <ModuleImageProperty :module="module"></ModuleImageProperty>
    </template>
    <!--二维码模块-->
    <template v-if="module.module_type == 'ModuleQrcode'">
      <ModuleQrcodeProperty :module="module"></ModuleQrcodeProperty>
    </template>
    <!--头像模块-->
    <template v-if="module.module_type == 'ModuleHead'">
      <ModuleHeadProperty :module="module"></ModuleHeadProperty>
    </template>
  </div>
</template>
<script type="text/ecmascript-6">
import ModuleTextProperty from "./ModuleTextProperty";
import ModuleNickNameProperty from "./ModuleNickNameProperty";
import ModuleImageProperty from "./ModuleImageProperty";
import ModuleQrcodeProperty from "./ModuleQrcodeProperty";
import ModuleHeadProperty from "./ModuleHeadProperty";
export default {
  components: {
    ModuleTextProperty,
    ModuleNickNameProperty,
    ModuleImageProperty,
    ModuleQrcodeProperty,
    ModuleHeadProperty
  },
  props: ["module"],
  data() {
    return {
      isHide: false
    };
  },
  methods: {}
};
</script>
<style lang="less">
@import "./property.less";
.module-property {
  position: relative;
  max-height: 100%;
  overflow: hidden;
  transition: max-height 0.3s;
  .title-mask {
    position:absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 44px;
    line-height: 44px;
    z-index: 99;
    padding-right: 14px;
    text-align: right;
    .ivu-icon-ios-arrow-down {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }
  }
}
</style>
