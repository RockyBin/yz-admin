<template>
  <div id="module-list" :class="{ 'module-list-edit': editMode }">
    <div
      v-for="m in modules"
      :key="m.id"
      :publish="m.publish"
      :id="'module_' + m.id"
      :type="m.module_type"
      :class="{
        'module-item': true,
        [m.module_type]: true,
        'module-item-edit': editMode,
        'fixed-top-edit': m.fix_top && editMode,
        'fixed-top': m.fix_top && !editMode,
        cansort: editMode && !m.fix_top && !(nosort && nosort.includes(m.module_type)),
        active: editMode && currentEditingModule && currentEditingModule.id == m.id
      }"
      v-show="
        !(
          m.module_type === 'ModuleGroupBuying' &&
          !hasLicensePerm('ENABLE_GROUP_BUYING')
        )
      "
      :style="{
        padding:
          m.padding_top_bottom +
          'px ' +
          (m.module_type == 'ModuleProductList' ? 0 : m.padding_left_right) +
          'px',
        background: m.background
      }"
      @click="editModule(m.id)"
    >
      <!--编辑模式下的相应工具条等-->
      <div class="mask" v-if="editMode"></div>
      <div class="toolbar" v-if="editMode&&m.module_type != 'ModuleWxSubscribe'">
        <div class="toolbar-mask"></div>
        <div class="toolbar">
          <div class="module-name">{{ getModuleName(m) }}</div>
          <div class="module-del" @click="delModule(m.id, $event)">删除</div>
        </div>
      </div>
      <!--分割线模块-->
      <ModuleLine
        v-if="m.module_type == 'ModuleLine'"
        :module="m"
        :editMode="editMode"
      ></ModuleLine>
      <!--富文本模块 -->
      <ModuleText
        v-if="m.module_type == 'ModuleText'"
        :module="m"
        :editMode="editMode"
      ></ModuleText>
      <!--辅助空白模块 -->
      <ModuleBlank
        v-if="m.module_type == 'ModuleBlank'"
        :module="m"
        :editMode="editMode"
      ></ModuleBlank>
      <!--公告模块 -->
      <ModuleNotice
        v-if="m.module_type == 'ModuleNotice'"
        :module="m"
        :editMode="editMode"
      ></ModuleNotice>
      <!--公告模块 -->
      <ModuleVideo
        v-if="m.module_type == 'ModuleVideo'"
        :module="m"
        :editMode="editMode"
      ></ModuleVideo>
      <!--标题模块 -->
      <ModuleTitle
        v-if="m.module_type == 'ModuleTitle'"
        :module="m"
        :editMode="editMode"
      ></ModuleTitle>
      <!--橱窗模块 -->
      <ModuleShopwindow
        v-if="m.module_type == 'ModuleShopwindow'"
        :module="m"
        :editMode="editMode"
      ></ModuleShopwindow>
      <!--导航模块 -->
      <ModuleLink
        v-if="m.module_type == 'ModuleLink'"
        :module="m"
        :editMode="editMode"
      ></ModuleLink>
      <!--幻灯片模块 -->
      <ModuleSlider
        v-if="m.module_type == 'ModuleSlider'"
        :module="m"
        :editMode="editMode"
      ></ModuleSlider>
      <!--搜索模块 -->
      <ModuleSearch
        v-if="m.module_type == 'ModuleSearch'"
        :module="m"
        :editMode="editMode"
      ></ModuleSearch>
      <!--产品模块 -->
      <ModuleProductList
        v-if="m.module_type == 'ModuleProductList'"
        :module="m"
        :editMode="editMode"
      ></ModuleProductList>
      <!--优惠券模块 -->
      <ModuleCoupon
        v-if="m.module_type == 'ModuleCoupon'"
        :module="m"
        :editMode="editMode"
      ></ModuleCoupon>
      <!-- 拼团模块 -->
      <ModuleGroupbuying
        v-if="
          hasLicensePerm('ENABLE_GROUP_BUYING') &&
            m.module_type == 'ModuleGroupBuying'
        "
        :module="m"
        :editMode="editMode"
      ></ModuleGroupbuying>

      <!-- 会员部分 -->
      <!--会员信息模块 -->
      <ModuleMemberInfo
        v-if="m.module_type == 'ModuleMemberInfo'"
        :module="m"
        @showPoster="$emit('showPoster')"
        :memberInfo="memberInfo"
      ></ModuleMemberInfo>
      <!--绑定手机号 -->
      <!--<ModuleBindMobile-->
          <!--v-if="m.module_type == 'ModuleBindMobile'"-->
          <!--:module="m"-->
          <!--:memberInfo="memberInfo"-->
      <!--&gt;</ModuleBindMobile>-->
      <!--资金信息模块 -->
      <ModuleCapitalInfo
        v-if="m.module_type == 'ModuleCapitalInfo'"
        :module="m"
        :memberInfo="memberInfo"
      ></ModuleCapitalInfo>
      <!--资金信息模块 -->
      <ModuleOrderInfo
        v-if="m.module_type == 'ModuleOrderInfo'"
        :module="m"
        :memberInfo="memberInfo"
      ></ModuleOrderInfo>
      <!--订阅公众号-->
      <ModuleSubscription
          v-if="m.module_type == 'ModuleWxSubscribe'"
          :module="m"
          :memberInfo="memberInfo"
      ></ModuleSubscription>
      <!--资金信息模块 -->
      <ModuleEssentialTools
        v-if="m.module_type == 'ModuleMemberTools'"
        :module="m"
        :memberInfo="memberInfo"
      ></ModuleEssentialTools>
    </div>
    <div class="no-modules" v-if="editMode && modules.length < 1">
      <div class="image">
        <img src="images/icon-store.gif" />
      </div>
      <div class="text">选择左边的组件 <br />搭建你的个性化店铺</div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import ModuleLine from "./ModuleLine";
import ModuleText from "./ModuleText";
import ModuleBlank from "./ModuleBlank";
import ModuleNotice from "./ModuleNotice";
import ModuleVideo from "./ModuleVideo";
import ModuleTitle from "./ModuleTitle";
import ModuleShopwindow from "./ModuleShopwindow";
import ModuleLink from "./ModuleLink";
import ModuleSlider from "./ModuleSlider";
import ModuleSearch from "./ModuleSearch";
import ModuleProductList from "./ModuleProductList";
import ModuleCoupon from "./ModuleCoupon";
import ModuleGroupbuying from "./ModuleGroupbuying";

import ModuleMemberInfo from "./member-center/ModuleMemberInfo";
import ModuleCapitalInfo from "./member-center/ModuleCapitalInfo";
import ModuleOrderInfo from "./member-center/ModuleOrderInfo";
import ModuleSubscription from "./member-center/ModuleSubscription";
import ModuleEssentialTools from "./member-center/ModuleEssentialTools";
export default {
  components: {
    ModuleLine,
    ModuleText,
    ModuleBlank,
    ModuleNotice,
    ModuleVideo,
    ModuleTitle,
    ModuleShopwindow,
    ModuleLink,
    ModuleSlider,
    ModuleSearch,
    ModuleProductList,
    ModuleCoupon,
    ModuleGroupbuying,

    ModuleMemberInfo,
    ModuleCapitalInfo,
    ModuleOrderInfo,
    ModuleSubscription,
    ModuleEssentialTools
  },
  props: ["modules", "editMode", "currentEditingModule", "nosort", "memberInfo"],
  data() {
    return {};
  },
  methods: {
    editModule(id) {
      if (this.editMode){
        this.$emit("onEditModule", id);
      }
    },
    delModule(id, event) {
      event.stopPropagation();
      if (this.editMode) {
        this.$emit("onDelModule", id);
        return false;
      }
    },
    getModuleName(module) {
      if (module.module_type.indexOf("ModuleSearch") > -1) return "搜索栏";
      if (module.module_type.indexOf("ModuleText") > -1) return "文本";
      if (module.module_type.indexOf("ModuleLink") > -1) return "导航栏";
      if (module.module_type.indexOf("ModuleSlider") > -1) return "图片轮播";
      if (module.module_type.indexOf("ModuleProductList") > -1) return "商品列表";
      if (module.module_type.indexOf("ModuleShopwindow") > -1) return "图片组";
      if (module.module_type.indexOf("ModuleTitle") > -1) return "标题栏";
      if (module.module_type.indexOf("ModuleLine") > -1) return "分隔线";
      if (module.module_type.indexOf("ModuleVideo") > -1) return "视频";
      if (module.module_type.indexOf("ModuleBlank") > -1) return "辅助空白";
      if (module.module_type.indexOf("ModuleCoupon") > -1) return "优惠券";
      if (module.module_type.indexOf("ModuleGroupBuying") > -1) return "多人拼团";
      if (module.module_type.indexOf("ModuleNotice") > -1) return "公告栏";

      if (module.module_type.indexOf("ModuleMemberInfo") > -1) return "会员信息";
      if (module.module_type.indexOf("ModuleCapitalInfo") > -1) return "资金信息";
      if (module.module_type.indexOf("ModuleOrderInfo") > -1) return "订单信息";
      if (module.module_type.indexOf("ModuleMemberTools") > -1) return "必备工具";
      return "";
    }
  }
};
</script>
<style lang="less" scoped>
@import url("module-common.css");
.module-list-edit {
  user-select: none;
}
.module-item-edit {
  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    top: 0;
    left: 0;
  }
  .toolbar {
    height: 30px;
    position: absolute;
    display: none;
    top: 0;
    left: 0;
    width: 100%;
    font-size: 12px;
    z-index: 10;

    .toolbar-mask {
      height: 30px;
      background: #fff;
      position: absolute;
      top: 1px;
      left: 1px;
      width: calc(100% - 2px);
      opacity: 0.7;
      z-index: 9;
    }
    .module-name {
      height: 30px;
      line-height: 30px;
      position: absolute;
      left: 10px;
      margin-left: 10px;
      color: #4570ea;
      font-size: 12px;
      top: 0;
    }
    .module-del {
      height: 30px;
      line-height: 30px;
      float: right;
      margin-right: 10px;
      cursor: pointer;
      color: #4570ea;
      font-size: 12px;
      position: absolute;
      right: 10px;
      top: 0;
    }
  }
  &:hover {
    .toolbar {
      display: block;
    }
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 1px solid #4570ea;
      z-index: 2;
    }
  }
}
.module-item {
  &.active {
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 1px solid #4570ea;
      z-index: 2;
    }
  }
}
</style>
