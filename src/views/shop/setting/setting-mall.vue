<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu"/>
    <div class="container" style="padding-bottom: 50px;">
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="113"
        class="mall-add"
      >
        <div class="level-news">
          <!-- <verticalLineTitlebar :title="titles[0]"/> -->
          <switch-titlebar
            style="margin-bottom: 20px;"
            :value="1"
            :switchShow="false"
            hasBorder
            title="商城信息"
          >
            <div class="news-container">
              <FormItem label="商城名称：" prop="name" class="margin-bottom-form">
                <Input
                  v-model="formValidate.name"
                  class="common-input-text-310"
                  placeholder="请输入商城名称"
                  :maxlength="20"
                >
                  <span slot="suffix">{{formValidate.name?formValidate.name.length:0}}/20</span>
                </Input>
                <more-message text="建议设置5个字之内商城简称，以便有更好的用户体验。"></more-message>
              </FormItem>
              <FormItem label="商城LOGO：" prop="logo" class="margin-bottom-form">
                <more-message :text="tips.logo"></more-message>
                <!-- <div class="product-detail-item">
                  <div class="product-detail-base-image-select">
                    <image-dragable
                      :class="{'has-error': imageIsError}"
                      v-model="formValidate.logo"
                      :pictureNumber="1"
                    ></image-dragable>
                  </div>
                </div> -->
                <div class="product-detail-item">
                  <show-big-img-upload 
                    imgSize="80px"
                    :class="{'has-error': imageIsError}"
                    :InitImgURLs="logoURL"
                    v-model="formValidate.logo"
                  ></show-big-img-upload>
                </div>
              </FormItem>
              <FormItem
                label="行业："
                prop="industry_id"
                :class="{'margin-bottom-form': formValidate.industry_id !== 0, 'margin-select-bottom-form': formValidate.industry_id === 0}"
              >
                <Select
                  v-model="formValidate.industry_id"
                  class="common-input-text-310"
                  @on-change="onSelectChange"
                >
                  <Option
                    v-for="(item, index) in industryList"
                    :value="item.id"
                    :key="index"
                  >{{ item.name }}</Option>
                  <Option :value="0">其他</Option>
                </Select>
              </FormItem>
              <FormItem
                prop="industry_name"
                v-show="formValidate.industry_id === 0"
                class="margin-bottom-form"
              >
                <Input
                  placeholder="请输入行业"
                  v-model="formValidate.industry_name"
                  class="common-input-text-310"
                />
              </FormItem>
              <FormItem label="商城描述：" prop="describe">
                <more-message :text="tips.describe"></more-message>
                <div class="product-detail-item">
                  <Input
                    v-model="formValidate.describe"
                    type="textarea"
                    :maxlength="200"
                    placeholder="请输入商城描述"
                  />
                  <span class="textarea-num">{{(formValidate.describe + '').length}}/200</span>
                </div>
              </FormItem>
            </div>
          </switch-titlebar>
        </div>
        <div class="upgrade-conditions">
          <!-- <verticalLineTitlebar :title="titles[1]"/> -->
          <switch-titlebar
            style="margin-bottom: 0px;"
            v-model="formValidate.register_isshow"
            :true-value="1" 
            :false-value="0"
            hasBorder
            title="是否开启注册协议功能"
          >
            <div class="conditions-container">
              <!-- <FormItem label="开启注册协议：" prop="register_isshow" class="margin-bottom-form">
                <i-switch v-model="formValidate.register_isshow" :true-value="1" :false-value="0">
                  <span slot="open">开</span>
                  <span slot="close">关</span>
                </i-switch>
              </FormItem> -->
              <FormItem
                label="注册协议："
                prop="register_protocol"
                v-show="formValidate.register_isshow === 1"
              >
                <div class="product-detail-item">
                  <div class="product-detail-editor">
                    <ue-editor
                      v-model="formValidate.register_protocol"
                      :setting="ueSetting"
                      :hideImageSelector="true"
                      ref="editor"
                    ></ue-editor>
                  </div>
                </div>
              </FormItem>
            </div>
          </switch-titlebar>
        </div>
      </Form>
      <div class="footer">
        <Button
          shape="circle"
          type="primary"
          @click="onSaveStart('formValidate')"
          perm="shop.config.operate"
        >保存并启用</Button>
      </div>
    </div>
  </div>
</template>
<script>
// import imageDragable from "COMPONENTS/image-select/image-select-dragable.vue";
import ueEditor from "COMPONENTS/editor/editor.vue";
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import moreMessage from "COMPONENTS/more-message/more-message";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue"
let defaultImg = require("../images/head-portrait.png");
let defaultFromData = {
  name: "",
  logo:"",
  register_isshow: 1,
  register_protocol: "",
  industry_id: null,
  industry_name: "",
  describe: ""
};
export default {
  components: {
    // imageDragable,
    ueEditor,
    footButton,
    verticalLineTitlebar,
    moreMessage,
    thirdMenu,
    switchTitlebar,
    showBigImgUpload
  },
  data() {
    return {
      imageIsError: false,
      logoURL: "",
      thirdMenu: [],
      ueSetting: {
        toolbars: [
          [
            "source",
            "|",
            "undo",
            "redo",
            "|",
            "bold",
            "italic",
            "underline",
            "forecolor",
            "backcolor",
            "fontborder",
            "strikethrough",
            "superscript",
            "subscript",
            "removeformat",
            "formatmatch",
            "autotypeset",
            "blockquote",
            "pasteplain",
            "|",
            "insertorderedlist",
            "insertunorderedlist",
            "selectall",
            "cleardoc",
            "|",
            "rowspacingtop",
            "rowspacingbottom",
            "lineheight",
            "|",
            "customstyle",
            "paragraph",
            "fontfamily",
            "fontsize",
            "|",
            "directionalityltr",
            "directionalityrtl",
            "indent",
            "|",
            "justifyleft",
            "justifycenter",
            "justifyright",
            "justifyjustify",
            "|",
            "touppercase",
            "tolowercase",
            "|",
            "horizontal",
            "|",
            "deletetable",
            "insertparagraphbeforetable",
            "insertrow",
            "deleterow",
            "insertcol",
            "deletecol",
            "mergecells",
            "mergeright",
            "mergedown",
            "splittocells",
            "splittorows",
            "splittocols"
          ]
        ]
      },
      formValidate: Object.assign({}, defaultFromData),
      ruleValidate: {
        name: [
          { required: true, message: "商户名称不能为空", trigger: "change" }
        ],
        industry_id: [
          {
            required: true,
            type: "number",
            message: "行业不能为空",
            trigger: "change"
          }
        ],
        industry_name: [
          {
            required: true,
            message: "行业不能为空",
            trigger: "change",
            validator: (rule, value, callback) => {
              if (this.formValidate.industry_id === 0 && !value.trim()) {
                callback(new Error("行业不能为空"));
              } else {
                callback();
              }
            }
          }
        ],
        register_isshow: [
          {
            validator: (rule, value, callback) => {
              if (value && !this.$refs.editor.getCurrContent()) {
                callback("开启了注册协议，协议内容不能为空");
              } else {
                callback();
              }
            }
          }
        ],
        register_protocol: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if(value || !this.formValidate.register_isshow) {
                callback();
              } else {
                callback("注册协议不能为空");
              }
            }
          }
        ],
        logo: [
          {
            required: true,
            validator: (rule, formValidate, callback) => {
              if (formValidate.length) {
                this.imageIsError = false;
                return callback();
              }
              this.imageIsError = true;
              return callback(new Error("请上传商城LOGO"));
            }
          }
        ]
      },
      industryList: [],
      tips: {
        logo: "*推荐上传750*750的高清图片",
        describe: "用于分享商城时的简介说明"
      }
    };
  },
  methods: {
    onSelectChange() {
      if (
        this.formValidate.industry_id !== 0 &&
        (this.formValidate.industry_name === "" ||
          this.formValidate.industry_name === null)
      ) {
        this.formValidate.industry_name = "";
      }
    },
    /** 保存启用按钮 */
    onSaveStart(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let formData = new FormData();
          if (this.formValidate.logo[0] === defaultImg) {
            this.formValidate.logo[0] = "";
          }
          formData.append("logo", this.formValidate.logo[0]);
          formData.append("name", this.formValidate.name);
          formData.append("industry_id", this.formValidate.industry_id);
          formData.append("register_isshow", this.formValidate.register_isshow);
          formData.append("industry_name", this.formValidate.industry_name);
          formData.append(
            "register_protocol",
            this.$refs.editor.getCurrContent()
          );
          formData.append("describe", this.formValidate.describe || "");
          this.$httpUpload("/shop/admin/shopconfig/edit", formData, res => {
            if (res.code === 200) {
              this.$Message.success("保存成功");
              this.getData();
            } else {
              this.$Message.error("保存失败");
            }
          });
        } else {
          this.$Message.error("保存失败");
        }
      });
    },
    /** 获取数据 */
    getData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/shopconfig/info", "", res => {
        if (res.code === 200) {
          this.$store.state.COMMON_loading = false;
          if (!res.data.info.describe) res.data.info.describe = ""; //将null强行转为空字符串
          if (res.data.info.logo) {
            res.data.info.logo = [res.data.info.logo];
            this.logoURL = res.data.info.logo
          }
          this.formValidate = Object.assign(
            {},
            ...Object.keys(defaultFromData).map(item => {
              return {
                [item]:
                  res.data.info[item] !== null
                    ? res.data.info[item]
                    : defaultFromData[item]
              };
            })
          );
          this.industryList = res.data.industry;
          this.$refs.editor.ue.ready(() => {
            this.$refs.editor.setCurrContent(
              this.formValidate.register_protocol
            );
          });
        } else {
          this.$Message.error(res.msg);
        }
      });
    }
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getData();
  }
};
</script>
<style lang="less" scoped>
.mall-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .container {
    height: 100%;
    flex: 1;
    .margin-select-bottom-form {
      margin-bottom: 14px;
    }
  }
}
.container {
  background: #fff;
  .mall-add {
    padding: 24px;
    padding-bottom: 74px;
    text-align: left;
    overflow-y: auto;
    overflow-x: hidden;
    background: white;
    width: 100%;
    /*height: calc(100vh - 120px);*/
    .level-news {
      .news-container {
        & > div:nth-child(2) {
          margin: 30px 0;
        }
        /deep/.ivu-input-wrapper {
          margin-right: 10px;
        }
        /deep/.ivu-input-suffix {
          right: 5px;
          line-height: 32px;
        }
        .product-detail-item {
          margin-top: 8px;
          /deep/.ivu-input-wrapper {
            width: 350px;
          }
          span.textarea-num {
            font-size: 12px;
            color: #999999;
            margin-left: 10px;
            vertical-align: bottom;
            position: relative;
            bottom: -10px;
          }
        }
        /deep/.ivu-form-item-label {
          width: 120px;
        }
      }
    }
    .upgrade-conditions {
      .conditions-container {
        & > div:nth-child(2) {
          margin: 30px 0;
        }
        /deep/.ivu-form-item-label {
          width: 120px;
        }
      }
      /deep/.ivu-radio {
        margin-right: 8px;
      }
    }
  }
  /deep/.ivu-input-wrapper textarea.ivu-input {
    width: 350px;
    height: 80px;
  }
  /deep/.ivu-select-dropdown {
    max-height: 150px;
  }
  .product-detail-editor {
    // display: inline-block;
    width: calc(100% - 190px);
  }
}
// 图标
.common-icon {
  vertical-align: middle;
  font-size: 18px;
  margin-left: 10px;
}
.footer {
  position: fixed;
  bottom: 10px;
  height: 50px;
  line-height: 50px;
  width: calc(100% - 260px);
  background-color: #fff;
  text-align: center;
  border-top: 1px solid #eee;
  z-index: 100;
  button {
    width: 100px;
    height: 32px;
  }
}
  /*.footer{*/
    /*height: 50px;*/
    /*line-height: 50px;*/
    /*text-align: center;*/
    /*border-top: 1px solid #eee;*/
    /*background: white;*/
    /*button{*/
      /*width: 100px;*/
    /*}*/
  /*}*/
</style>
