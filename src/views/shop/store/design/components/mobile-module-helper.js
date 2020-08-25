import ModuleText from "./modules-mobi-for-design/ModuleText";
import ModuleLine from "./modules-mobi-for-design/ModuleLine";
import ModuleBlank from "./modules-mobi-for-design/ModuleBlank";
import ModuleNotice from "./modules-mobi-for-design/ModuleNotice";
import ModuleVideo from "./modules-mobi-for-design/ModuleVideo";
import ModuleTitle from "./modules-mobi-for-design/ModuleTitle";
import ModuleShopwindow from "./modules-mobi-for-design/ModuleShopwindow";
import ModuleLink from "./modules-mobi-for-design/ModuleLink";
import ModuleSlider from "./modules-mobi-for-design/ModuleSlider";
import ModuleSearch from "./modules-mobi-for-design/ModuleSearch";
import ModuleProductList from "./modules-mobi-for-design/ModuleProductList";
import ModuleCoupon from "./modules-mobi-for-design/ModuleCoupon";
import ModuleGroupbuying from "./modules-mobi-for-design/ModuleGroupbuying";

// 会员部分
import ModuleMemberInfo from "./modules-mobi-for-design/member-center/ModuleMemberInfo";
import ModuleCapitalInfo from "./modules-mobi-for-design/member-center/ModuleCapitalInfo";
import ModuleOrderInfo from "./modules-mobi-for-design/member-center/ModuleOrderInfo";
import ModuleSubscription from "./modules-mobi-for-design/member-center/ModuleSubscription";
import ModuleEssentialTools from "./modules-mobi-for-design/member-center/ModuleEssentialTools";
export default {
  newModule: function(type, target) {
    if (type == "ModuleText") {
      return ModuleText.createNew();
    } else if (type == "ModuleLine") {
      return ModuleLine.createNew();
    } else if (type == "ModuleBlank") {
      return ModuleBlank.createNew();
    } else if (type == "ModuleNotice") {
      return ModuleNotice.createNew();
    } else if (type == "ModuleVideo") {
      return ModuleVideo.createNew();
    } else if (type == "ModuleTitle") {
      return ModuleTitle.createNew();
    } else if (type == "ModuleShopwindow") {
      return ModuleShopwindow.createNew();
    } else if (type == "ModuleLink") {
      return ModuleLink.createNew();
    } else if (type == "ModuleSlider") {
      return ModuleSlider.createNew();
    } else if (type == "ModuleSearch") {
      return ModuleSearch.createNew();
    } else if (type == "ModuleProductList") {
      return ModuleProductList.createNew();
    } else if (type == "ModuleCoupon") {
      return ModuleCoupon.createNew();
    } else if (type == "ModuleGroupBuying") {
      return ModuleGroupbuying.createNew();
    }

    // 会员部分
    else if (type == "ModuleMemberInfo") {
      return ModuleMemberInfo.createNew(target);
    } else if (type == "ModuleCapitalInfo") {
      return ModuleCapitalInfo.createNew(target);
    } else if (type == "ModuleOrderInfo") {
      return ModuleOrderInfo.createNew(target);
    } else if (type == "ModuleWxSubscribe"){
      return ModuleSubscription.createNew(target);
    } else if (type == "ModuleMemberTools") {
      return ModuleEssentialTools.createNew(target);
    }
  }
};
