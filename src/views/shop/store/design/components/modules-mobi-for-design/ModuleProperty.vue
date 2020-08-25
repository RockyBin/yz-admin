<template>
  <div class="module-property" v-if="module">
    <!-- <div>当前模块：{{module.module_type}} 模块ID：{{module.id}}</div> -->
    <!--分割线模块-->
    <template v-if="module.module_type == 'ModuleLine'">
      <ModuleLineProperty :module="module"></ModuleLineProperty>
    </template>
    <!--富文本模块-->
    <template v-if="module.module_type == 'ModuleText'">
      <ModuleTextProperty :module="module"></ModuleTextProperty>
    </template>
    <!--辅助空白模块-->
    <template v-if="module.module_type == 'ModuleBlank'">
      <ModuleBlankProperty :module="module"></ModuleBlankProperty>
    </template>
    <!--公告模块-->
    <template v-if="module.module_type == 'ModuleNotice'">
      <ModuleNoticeProperty :module="module"></ModuleNoticeProperty>
    </template>
    <!--视频模块-->
    <template v-if="module.module_type == 'ModuleVideo'">
      <ModuleVideoProperty :module="module"></ModuleVideoProperty>
    </template>
    <!--标题模块-->
    <template v-if="module.module_type == 'ModuleTitle'">
      <ModuleTitleProperty :module="module"></ModuleTitleProperty>
    </template>
    <!--橱窗模块-->
    <template v-if="module.module_type == 'ModuleShopwindow'">
      <ModuleShopwindowProperty :module="module"></ModuleShopwindowProperty>
    </template>
    <!--导航模块-->
    <template v-if="module.module_type == 'ModuleLink'">
      <ModuleLinkProperty :module="module"></ModuleLinkProperty>
    </template>
    <!--幻灯片模块-->
    <template v-if="module.module_type == 'ModuleSlider'">
      <ModuleSliderProperty :module="module"></ModuleSliderProperty>
    </template>
    <!--搜索模块-->
    <template v-if="module.module_type == 'ModuleSearch'">
      <ModuleSearchProperty :module="module"></ModuleSearchProperty>
    </template>
    <!--产品模块-->
    <template v-if="module.module_type == 'ModuleProductList'">
      <ModuleProductListProperty :module="module"></ModuleProductListProperty>
    </template>
    <!--优惠券模块-->
    <template v-if="module.module_type == 'ModuleCoupon'">
      <ModuleCouponProperty :module="module"></ModuleCouponProperty>
    </template>
    <!-- 拼团模块 -->
    <template
      v-if="
        hasLicensePerm('ENABLE_GROUP_BUYING') &&
          module.module_type == 'ModuleGroupBuying'
      "
    >
      <ModuleGroupbuyingProperty :module="module"></ModuleGroupbuyingProperty>
    </template>

    <!-- 会员部分 -->
    <template v-if="module.module_type == 'ModuleMemberInfo'">
      <ModuleMemberInfoProperty :module="module"></ModuleMemberInfoProperty>
    </template>
    <template v-else-if="module.module_type == 'ModuleCapitalInfo'">
      <ModuleCapitalInfoProperty :module="module" :designData="designData"></ModuleCapitalInfoProperty>
    </template>
    <template v-else-if="module.module_type == 'ModuleOrderInfo'">
      <ModuleOrderInfoProperty :module="module" :designData="designData"></ModuleOrderInfoProperty>
    </template>
    <template v-else-if="module.module_type == 'ModuleWxSubscribe'">
      <ModuleSubscriptionProperty :module="module" :designData="designData"></ModuleSubscriptionProperty>
    </template>
    <template v-else-if="module.module_type == 'ModuleMemberTools'">
      <ModuleEssentialToolsProperty :module="module" :designData="designData"></ModuleEssentialToolsProperty>
    </template>
  </div>
</template>
<script type="text/ecmascript-6">
import ModuleLineProperty from "./ModuleLineProperty";
import ModuleTextProperty from "./ModuleTextProperty";
import ModuleBlankProperty from "./ModuleBlankProperty";
import ModuleNoticeProperty from "./ModuleNoticeProperty";
import ModuleVideoProperty from "./ModuleVideoProperty";
import ModuleTitleProperty from "./ModuleTitleProperty";
import ModuleShopwindowProperty from "./ModuleShopwindowProperty";
import ModuleLinkProperty from "./ModuleLinkProperty";
import ModuleSliderProperty from "./ModuleSliderProperty";
import ModuleSearchProperty from "./ModuleSearchProperty";
import ModuleProductListProperty from "./ModuleProductListProperty";
import ModuleCouponProperty from "./ModuleCouponProperty";
import ModuleGroupbuyingProperty from "./ModuleGroupbuyingProperty";

// 会员
import ModuleMemberInfoProperty from "./member-center/ModuleMemberInfoProperty";
import ModuleCapitalInfoProperty from "./member-center/ModuleCapitalInfoProperty";
import ModuleOrderInfoProperty from "./member-center/ModuleOrderInfoProperty";
import ModuleSubscriptionProperty from "./member-center/ModuleSubscriptionProperty";
import ModuleEssentialToolsProperty from "./member-center/ModuleEssentialToolsProperty";
export default {
  components: {
    ModuleLineProperty,
    ModuleTextProperty,
    ModuleBlankProperty,
    ModuleNoticeProperty,
    ModuleVideoProperty,
    ModuleTitleProperty,
    ModuleShopwindowProperty,
    ModuleLinkProperty,
    ModuleSliderProperty,
    ModuleSearchProperty,
    ModuleProductListProperty,
    ModuleCouponProperty,
    ModuleGroupbuyingProperty,

    ModuleMemberInfoProperty,
    ModuleCapitalInfoProperty,
    ModuleOrderInfoProperty,
    ModuleSubscriptionProperty,
    ModuleEssentialToolsProperty
  },
  props: ["module", "designData"],
  data() {
    return {};
  },
  methods: {}
};
</script>
<style lang="less">
@import "./property-container.less";
.module-property {
  width: 100%;
  height: 100%;
  /* padding: 10px; */
}
.ivu-form-item-content {
  text-align: left;
}
</style>
