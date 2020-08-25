import ModuleText from "./ModuleText";
import ModuleHead from "./ModuleHead";
import ModuleQrcode from "./ModuleQrcode";
import ModuleNickName from "./ModuleNickName";
import ModuleImage from "./ModuleImage";
export default {
  newModule: function(type,options) {
    if (type == "ModuleText") {
      return ModuleText.createNew(options);
    } else if (type == "ModuleHead") {
      return ModuleHead.createNew(options);
    } else if (type == "ModuleNickName") {
      return ModuleNickName.createNew(options);
    } else if (type == "ModuleQrcode") {
      return ModuleQrcode.createNew(options);
    } else if (type == "ModuleImage") {
      return ModuleImage.createNew(options);
    }
  }
};
