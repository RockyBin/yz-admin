import ModuleText from "./ModuleText";
import ModuleHead from "./ModuleHead";
import ModuleQrcode from "./ModuleQrcode";
import ModuleNickName from "./ModuleNickName";
import ModuleImage from "./ModuleImage";
import ModuleLevel from "./ModuleLevel";
import ModuleAuthDate from "./ModuleAuthDate";
import ModuleAuthCode from "./ModuleAuthCode";
import ModuleAuthTerm from "./ModuleAuthTerm";
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
    } else if (type == "ModuleLevel") {
      return ModuleLevel.createNew(options);
    } else if (type == "ModuleAuthDate") {
      return ModuleAuthDate.createNew(options);
    } else if (type == "ModuleAuthCode") {
      return ModuleAuthCode.createNew(options);
    } else if (type == "ModuleAuthTerm") {
      return ModuleAuthTerm.createNew(options);
    }
  }
};
