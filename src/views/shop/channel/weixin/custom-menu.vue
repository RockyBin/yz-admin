<template>
  <div class="weixin">
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <blank v-show="loaded" v-if="!isBound" msg="绑定公众号后，即可使用自定义菜单功能" />
      <div v-show="loaded" v-else class="main-board">
        <div style="height:100%;">
          <div class="main">
            <div class="wrapper">
              <alert-warning>
                <p>1. 微信对于公众号自定义菜单有一定缓存时间，发布菜单后如果想及时看到菜单修改，可以取消关注后再重新关注公众号即可快速的看到新菜单。</p>
                <p>2. 最多可设置3个主菜单，每个主菜单下最多可设置5个子菜单。</p>
              </alert-warning>
              <div class="flex">
                <div class="frame">
                  <div class="bottom">
                    <div class="icon">
                      <img src="images/jianpan.png" alt />
                    </div>
                    <div
                      v-for="(menu,index) in menus"
                      :key="index"
                      :class="['main-menu',currentMenuItem==menu?'selected':'']"
                      :style="{width:menuWidth}"
                      @click="setCurrentMenu(menu)"
                    >
                      <div class="item">{{menu.name||`主菜单`}}</div>
                      <Icon @click.stop="deleteMenu(index)" type="md-close-circle" size="18" />
                      <div
                        class="sub-wrapper"
                        v-if="currentMenuItem==menu||menu.items.indexOf(currentMenuItem)>-1"
                      >
                        <triangle class="arrow-s" :width="16" :height="8" :border-width="1" />
                        <div
                          v-for="(subMenu,subIndex) in menu.items"
                          :key="subIndex"
                          :class="['sub-menu',currentMenuItem==subMenu?'selected':'']"
                          @click.stop="setCurrentMenu(subMenu)"
                        >
                          <div class="item">{{subMenu.name||`子菜单`}}</div>
                          <Icon
                            @click.stop="deleteMenu(index,subIndex)"
                            type="md-close-circle"
                            size="18"
                          />
                        </div>
                        <div
                          v-if="menu.items.length<5"
                          class="add-sub-menu"
                          @click.stop="addMenu(index)"
                        >
                          <Icon type="md-add" size="20" />
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="menus.length<3"
                      class="add-main-menu"
                      :style="{width:menuWidth}"
                      @click="addMenu()"
                    >
                      <Icon type="md-add" size="20" />
                    </div>
                  </div>
                </div>
                <div style="position:relative; border: solid 1px #e5e5e5;max-height: 545px;">
                  <triangle class="arrow" :width="20" :height="10" :border-width="1" />
                  <div class="board">
                    <div v-if="currentMenuItem" class="form-wrapper">
                      <Form class="form" ref="form" :model="currentMenuItem" :rules="rules">
                        <div class="label required">
                          {{currentMenuItem.items?'主菜单名称':'子菜单名称'}}
                          <span
                            v-if="currentMenuItem.items&&currentMenuItem.items.length>0"
                            class="warning"
                          >（已有子菜单，无法设置主菜单功能）</span>
                        </div>
                        <FormItem prop="name">
                          <Input
                            class="name-field"
                            ref="name"
                            v-model="currentMenuItem.name"
                            :maxlength="currentMenuItem.items?4:10"
                            :placeholder="currentMenuItem.items?'请输入主菜单名称':'请输入子菜单名称'"
                          >
                            <span
                              slot="suffix"
                            >{{currentMenuItem.name.length}}/{{currentMenuItem.items?4:10}}</span>
                          </Input>
                          <!-- <Tooltip
                            :transfer="true"
                            placement="top"
                            :content="currentMenuItem.items?'主菜单名称不超过4个汉字或8个字符':'子菜单名称不超过10个汉字或20个字符'"
                          >
                            <Icon type="ios-information-circle-outline" size="16" color="#b1b1b2"/>
                          </Tooltip>-->
                        </FormItem>
                        <div
                          v-if="!currentMenuItem.items||currentMenuItem.items.length==0"
                          class="form-item"
                        >
                          <div class="label required">
                            菜单功能
                            <span style="color:#9ea4b1;">（单选）</span>
                          </div>
                          <FunctionSelect
                            :currentItem="currentMenuItem"
                            :menu="1"
                            :showPoster="true"
                            :materialGroup="true"
                            @setCallbackType="setCallbackType"
                            @setCallbackPaperId="setCallbackPaperId"
                            @clearPaperId="clearPaperId"
                          />
                        </div>
                      </Form>
                    </div>
                    <div v-else class="tips">点击左侧 [ + ] 按钮添加主菜单</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!--<foot-button  @onSaveClick="saveMenu"></foot-button>-->
          <div class="footer">
            <Button
              class="save-btn"
              type="primary"
              shape="circle"
              @click="saveMenu"
              perm="mp.menu.operate"
            >保存</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FunctionSelect from "./function-select.vue";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import blank from "./blank.vue";
import axios from "axios";
import triangle from "../../store/design/components/triangle.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
import thirdMenuData from "../components/third-menu-for-channel-weixin";
export default {
  components: {
    FunctionSelect,
    thirdMenu,
    alertWarning,
    blank,
    triangle
  },
  data() {
    const validate = (rule, value, callback) => {
      var limit = this.currentMenuItem && this.currentMenuItem.items ? 8 : 20;
      var length = value.replace(/[^\x00-\xff]/g, "**").length;
      if (!(value && value.trim())) {
        callback(
          new Error(limit == 8 ? "请输入主菜单名称！" : "请输入子菜单名称！")
        );
      } else if (length > limit) {
        callback(
          new Error(
            limit == 8
              ? "主菜单名称不超过4个汉字或8个字符"
              : "子菜单名称不超过10个汉字或20个字符"
          )
        );
      } else {
        callback();
      }
    };
    return {
      isBound: false,
      loaded: false,
      menus: [],
      currentMenuItem: null,
      rules: {
        name: [{ required: true, trigger: "blur", validator: validate }]
      },
      thirdMenu: [],
      paperId: 0
    };
  },
  computed: {
    menuWidth() {
      var count = this.menus.length < 3 ? this.menus.length + 1 : 3;
      return `calc(${100 / count}% - ${44 / count}px)`;
    }
  },
  created() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.$store.state.COMMON_loading = true;
    axios
      .get("/shop/admin/wx/menu/list")
      .then(res => {
        if (res.code == 200) {
          this.menus = res.data.list;
          this.isBound = res.data.config_full;
        } else {
          this.$Message.error(res.msg);
        }
      })
      .catch(err => {
        this.$Message.error(err);
      })
      .finally(() => {
        this.loaded = true;
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    setCurrentMenu(menu) {
      if (menu != this.currentMenuItem) {
        this.currentMenuItem = menu;
        this.$nextTick(() => {
          this.$refs.form.fields[0].validateState = "";
        });
      }
    },
    addMenu(index) {
      let menu = {
        name: "",
        type: 0,
        data: {
          url: "",
          url_name: "",
          content: "",
          image: "",
          news_item_id: "",
          news_item_title: "",
          news_item_image: ""
        }
      };
      if (index != undefined) {
        //添加子菜单
        this.menus[index].items.push(menu);
      } else {
        //添加主菜单
        menu.items = [];
        this.menus.push(menu);
      }
      this.setCurrentMenu(menu);
    },
    deleteMenu(index, subIndex) {
      let deletedItem = null;
      if (subIndex === undefined) {
        this.$Modal.confirm({
          title: "确认删除",
          content: "确认删除该菜单吗？",
          onOk: () => {
            [deletedItem] = this.menus.splice(index, 1);
            if (this.currentMenuItem == deletedItem) {
              if (index) {
                this.setCurrentMenu(this.menus[index - 1]);
              } else {
                this.currentMenuItem = null;
              }
            }
          }
        });
      } else {
        [deletedItem] = this.menus[index].items.splice(subIndex, 1);
      }
      if (this.currentMenuItem == deletedItem) {
        if (subIndex) {
          this.setCurrentMenu(this.menus[index].items[subIndex - 1]);
        } else {
          this.setCurrentMenu(this.menus[index]);
        }
      }
    },
    checkName(menu) {
      let limit = menu.items ? 8 : 20;
      let length =
        ((menu.name && menu.name.trim()) || 0) &&
        menu.name.replace(/[^\x00-\xff]/g, "**").length;
      if (length > limit || length == 0) {
        return false;
      }
      return true;
    },
    checkMenuItem(menu) {
      let data = {};
      let status = true;
      // 检测名称是否有错
      if (!this.checkName(menu)) {
        status = false;
        data.type = -1;
        // 没有下级菜单的菜单
      } else if (!(menu.items && menu.items.length)) {
        // 链接
        if (menu.type == 0 && !menu.data.url) {
          status = false;
        }
        // 文本
        if (menu.type == 1 && !menu.data.content) {
          status = false;
        }
        // 图文消息
        if (menu.type == 2 && !menu.data.news_item_id && !menu.data.news_id) {
          status = false;
        }
        // 图片
        if (menu.type == 3 && !menu.data.image) {
          status = false;
        }
        // 小程序
        if (menu.type == 4 && (!menu.data.appid || !menu.data.page)) {
          status = false;
        }
        // 海报
        if (menu.type == 99 && menu.callback_type == 1 && !menu.paper_id) {
          status = false;
        }
        data.type = menu.type;
      }
      data.checked = status;
      return data;
    },
    checkMenu(callback) {
      let emptyMenu = null;
      for (let i = 0; i < this.menus.length; i++) {
        let menu = this.menus[i];
        // 检查当前菜单
        if (!this.checkMenuItem(menu).checked) {
          emptyMenu = menu;
          break;
        } else if (menu.items && menu.items.length) {
          // 检查下级菜单
          emptyMenu = menu.items.find(subMenu => {
            return !this.checkMenuItem(subMenu).checked;
          });
          if (emptyMenu) {
            break;
          }
        }
      }
      if (emptyMenu) {
        this.currentMenuItem = emptyMenu;
        this.$nextTick(() => {
          this.$refs.form.validate(() => {});
        });
        callback(false);
      } else {
        callback(true);
      }
    },
    saveMenu() {
      this.checkMenu(valid => {
        if (valid) {
          //所有菜单项功能都不为空
          this.$Spin.show();
          axios
            .post("/shop/admin/wx/menu/save", {
              menus: this.menus
            })
            .then(res => {
              this.$Spin.hide();
              if (res.code == 200) {
                this.$Message.success("保存成功");
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Spin.hide();
              this.$Message.error(err);
            });
        } else {
          //当前菜单项菜单功能为空或菜单名称过长
          let data = this.checkMenuItem(this.currentMenuItem);
          switch (data.type) {
            case -1:
              this.$Modal.error({
                title: "保存失败",
                content:
                  this.currentMenuItem.name && this.currentMenuItem.name.trim()
                    ? "菜单名称过长"
                    : "菜单名称不能为空"
              });
              break;
            case 0:
              this.$Modal.error({
                title: "保存失败",
                content: "跳转链接不能为空"
              });
              break;
            case 1:
              this.$Modal.error({
                title: "保存失败",
                content: "回复消息文本不能为空"
              });
              break;
            case 2:
              this.$Modal.error({
                title: "保存失败",
                content: "回复图文消息不能为空"
              });
              break;
            case 3:
              this.$Modal.error({
                title: "保存失败",
                content: "回复图片不能为空"
              });
              break;
            case 4:
              this.$Modal.error({
                title: "保存失败",
                content: "小程序AppId或页面路径不能为空"
              });
              break;
            case 99:
              this.$Modal.error({
                title: "保存失败",
                content: "分享海报不能为空"
              });
              break;
            default:
              break;
          }
        }
      });
    },
    setCallbackType(type) {
      this.$set(this.currentMenuItem, "callback_type", type);
    },
    setCallbackPaperId(paper) {
      this.$set(this.currentMenuItem, "paper_id", paper.id);
      this.$set(this.currentMenuItem, "paper_name", paper.name);
    },
    clearPaperId(){
      this.$set(this.currentMenuItem, "paper_id", 0);
    }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  width: 100%;
  height: calc(100vh - 84px);
  background: #f2f4fd;
  display: flex;
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.main-board {
  width: 100%;
  height: 100%;
  background: #fff;
  .main {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
    .wrapper {
      height: 100%;
    }
    .flex {
      display: flex;
      margin-top: 24px;
      height: calc(100% - 143px);
    }
    .frame {
      position: relative;
      width: 300px;
      max-height: 545px;
      margin-right: 42px;
      background-color: #f7f7f7;
      background-image: url("../../../../../public/images/channel/BG.png");
      background-size: 300px 530px;
      background-repeat: no-repeat;
      min-height: 400px;
      .bottom {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 44px;
        display: flex;
        background: #fff;
        outline: 1px solid #e5e5e5;
        .icon {
          width: 44px;
          height: 44px;
          line-height: 44px;
          text-align: center;
          img {
            vertical-align: middle;
          }
        }
        .main-menu {
          border-right: 1px solid transparent;
        }
        .main-menu,
        .add-main-menu {
          position: relative;
          flex-shrink: 0;
          height: 44px;
          line-height: 44px;
          text-align: center;
          background: #fff;
          cursor: pointer;
          &:before {
            content: "";
            position: absolute;
            left: 0;
            top: 13px;
            width: 1px;
            height: 20px;
            background: #e5e5e5;
          }
        }
        .sub-menu,
        .add-sub-menu {
          position: relative;
          height: 44px;
          line-height: 44px;
          max-width: 150px;
          background: white;
        }
        .sub-wrapper {
          position: absolute;
          z-index: 10;
          bottom: 55px;
          left: 50%;
          transform: translate(-50%, 0);
          min-width: 100%;
          min-width: 84px;
          border: 1px solid #e8e8e8;
          .sub-menu:not(:last-child) {
            border-bottom: 1px solid #eaeaea;
          }
        }
        .main-menu,
        .sub-menu {
          /deep/.ivu-icon-md-close-circle {
            display: none;
            position: absolute;
            top: -9px;
            right: -9px;
            z-index: 12;
            background: white;
            border-radius: 18px;
          }
        }
        .item {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item:hover {
          z-index: 11;
          outline: 1px solid #4570ea !important;
          & + .ivu-icon-md-close-circle {
            display: block;
          }
        }
        .ivu-icon-md-close-circle:hover {
          display: block;
        }
        .sub-menu.selected > .item,
        .main-menu.selected > .item {
          z-index: 10;
          outline: 1px solid #4570ea !important;
        }
      }
    }
    .arrow {
      position: absolute;
      left: -15px;
      bottom: 23px;
      transform: rotate(-90deg);
    }
    .arrow-s {
      position: absolute;
      z-index: 2;
      left: 50%;
      bottom: -8px;
      transform: rotate(180deg);
      transform-origin: 50% 50%;
    }
    .board {
      position: relative;
      flex-grow: 1;
      width: 500px;
      height: 100%;
      overflow: auto;
      background: #f9fbfd;
      .form-wrapper {
        padding: 20px;
        font-size: 13px;
        .form {
          margin-bottom: 20px;
          /deep/.ivu-form-item {
            margin-bottom: 12px;
          }
          /deep/.ivu-form-item-label {
            display: block;
            float: none;
            text-align: left;
            padding: 10px 0 20px 0;
          }
          /deep/.ivu-input-suffix {
            margin-right: 5px;
          }
          /deep/textarea {
            display: none;
          }
          .form-item {
            margin-top: 30px;
          }
          .label {
            color: #657180;
            margin-bottom: 20px;
            line-height: 1;
          }
          .required:before {
            content: "*";
            display: inline-block;
            margin-right: 4px;
            line-height: 1;
            font-family: SimSun;
            font-size: 13px;
            color: #ed4014;
          }
          .warning {
            font-size: 12px;
            color: #9ea4b1;
          }
          .name-field {
            width: 322px;
            height: 32px;
            line-height: 32px;
            margin-right: 12px;
          }
        }
        /deep/.edui-editor {
          width: 410px !important;
          .edui-editor-iframeholder {
            width: 410px !important;
          }
        }
      }
      .tips {
        font-size: 14px;
        color: #9ea4b1;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .footer {
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #e9e9e9;
    .save-btn {
      width: 70px;
      height: 32px;
    }
  }
}
</style>