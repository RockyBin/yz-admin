<template>
  <div class="live-setting-styles">
    <div class="container">
      <div
        class="videostyle"
        v-if="!value.live_style"
        :style="`background-image: url(${formatURL(liveStudioURL)});`"
      >
        <img src="../images/full-screen.png" alt />
        <div
          class="follow"
          v-if="value.button_display.indexOf(0) != -1"
        >{{ value.nav_list[0].name }}</div>
        <div class="more" v-if="value.button_display.indexOf(1) != -1">
          <div class="video-live-fans-icon">
            <img src="../images/Live.png" alt />
          </div>
          <div>更多</div>
        </div>
        <div class="btn home" v-if="value.button_display.indexOf(2) != -1">
          <div class="icon"></div>
        </div>
        <div class="cmment" v-if="value.button_display.indexOf(3) != -1">
          <span>说点什么...</span>
        </div>
        <div class="btn-nav">
          <div class="btn products" v-if="value.button_display.indexOf(4) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn coupon" v-if="value.button_display.indexOf(5) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn like" v-if="value.button_display.indexOf(6) != -1">
            <div class="icon"></div>
            <div class="tag">0</div>
          </div>
          <div class="btn share" v-if="value.button_display.indexOf(7) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn self" v-if="value.button_display.indexOf(8) != -1">
            <div class="icon"></div>
          </div>
        </div>
      </div>
      <div class="hearfVideostyle" v-if="value.live_style">
        <div
          class="hearfVideostyle-bg-top"
          :style="`background-image: url(${formatURL(liveStudioURL)});`"
        ></div>
        <div
          class="hearfVideostyle-bg-bottom"
          :style="`background-image: url(${formatURL(liveStudioURL)});`"
        ></div>
        <img src="../images/haref-size.png" alt />
        <Row class="manu-list">
          <i-col
            v-for="(item,index) in value.menu_list"
            :key="index"
            :span="24/value.menu_display.length"
            v-show="value.menu_display.indexOf(item.link_type) != -1"
          >{{ item.name }}</i-col>
        </Row>
        <div
          class="follow"
          v-if="value.button_display.indexOf(0) != -1"
        >{{ value.nav_list[0].name }}</div>
        <div class="btn more" v-if="value.button_display.indexOf(1) != -1">
          <div class="video-live-fans-icon">
            <img src="../images/Live.png" alt />
          </div>
          <div>更多</div>
        </div>
        <div class="cmment" v-if="value.button_display.indexOf(3) != -1">
          <span>说点什么...</span>
        </div>
        <div class="btn-nav">
          <div class="btn home" v-if="value.button_display.indexOf(2) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn products" v-if="value.button_display.indexOf(4) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn coupon" v-if="value.button_display.indexOf(5) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn like" v-if="value.button_display.indexOf(6) != -1">
            <div class="icon"></div>
            <div class="tag">0</div>
          </div>
          <div class="btn share" v-if="value.button_display.indexOf(7) != -1">
            <div class="icon"></div>
          </div>
          <div class="btn self" v-if="value.button_display.indexOf(8) != -1">
            <div class="icon"></div>
          </div>
        </div>
      </div>
      <div class="container-left">
        <verticalLineTitlebar :title="'样式设置'" />
        <Form
          ref="formValidateStyles"
          :model="value"
          :rules="ruleValidateStyles"
          :label-width="100"
          class="mall-add"
        >
          <FormItem label="样式选择：">
            <div class="dealer-setting-base-itme dealer-seting-base-ts">
              <RadioGroup v-model="value.live_style">
                <Radio :label="0">全屏</Radio>
                <Radio :label="1">半屏</Radio>
              </RadioGroup>
            </div>
          </FormItem>
          <div class="live-full-screen">
            <FormItem label="直播间封面：" prop="live_poster" class="margin-bottom-form">
              <div class="product-detail-item">
                <show-big-img-upload
                  imgSize="80px"
                  :class="{ 'has-error': coverError }"
                  :InitImgURLs="coverStudioURL"
                  v-model="value.live_poster"
                ></show-big-img-upload>
              </div>
            </FormItem>
            <Tabs type="card" name="navButton" :animated="false" v-model="tabSelect">
              <TabPane label="按钮导航" tab="navButton">
                <FormItem
                  label="按钮显示："
                  style="margin-bottom: 10px !important;margin-top: 20px !important;"
                  class="un-start"
                >
                  <div class="product-detail-tags">
                    <Tag
                      :checkable="true"
                      v-for="(item, index) in value.nav_list"
                      :name="index"
                      :key="index"
                      @on-change="getCheckedTags"
                      :checked="checkedNavBtn == index"
                    >
                      {{ item.button_name }}
                      <icon
                        class="iconfont icon-ios-checkmark-circle1"
                        v-if="value.button_display.indexOf(item.link_type) != -1"
                      ></icon>
                    </Tag>
                  </div>
                </FormItem>
                <div class="level-news">
                  <CheckboxGroup v-model="value.button_display">
                    <div
                      class="switch-titlebar"
                      style="margin-left: 100px;"
                      v-for="(item, index) in value.nav_list"
                      :key="index"
                      v-show="checkedNavBtn == index"
                    >
                      <div class="switch-titlebar-head">
                        <span
                          class="switch-titlebar-head-text"
                          style="margin-right: 13px;font-weight: bold;"
                        >按钮</span>
                        <Checkbox :label="item.link_type">显示</Checkbox>
                      </div>
                      <div class="news-container">
                        <FormItem label="名称：" v-if="item.link_type != 8" class="margin-bottom-form">
                          <Input
                            v-model="item.name"
                            class="common-input-text-310"
                            placeholder="请输入名称"
                            :disabled="item.link_type!=0"
                            :maxlength="2"
                          >
                            <span
                              slot="suffix"
                              style="line-height: 32px;"
                              v-if="item.link_type == 0"
                            >{{ item.name ? item.name.length : 0 }}/2</span>
                          </Input>
                        </FormItem>
                        <FormItem
                          label="名称："
                          prop="name"
                          v-if="item.link_type == 8"
                          class="margin-bottom-form"
                        >
                          <Input
                            v-model="item.name"
                            class="common-input-text-310"
                            placeholder="请输入名称"
                            :maxlength="20"
                          >
                            <span
                              slot="suffix"
                              style="line-height: 32px;"
                            >{{ item.name ? item.name.length : 0 }}/20</span>
                          </Input>
                        </FormItem>
                        <FormItem label="类型：" v-if="item.link_type == 8">
                          <div class="dealer-setting-base-itme dealer-seting-base-ts">
                            <RadioGroup v-model="item.extra_params.type">
                              <Radio :label="1">图片</Radio>
                              <Radio :label="2">文本</Radio>
                            </RadioGroup>
                          </div>
                        </FormItem>
                        <FormItem
                          label="图片："
                          class="margin-bottom-form"
                          v-if="item.link_type == 0"
                          :prop="'nav_list.'+index+'.value'"
                          :rules="{
                            required: true,trigger: 'change',
                            validator: (rule, formValidate, callback) => {
                              if (value.button_display.includes(item.link_type)){
                                if (typeof item.images === 'object'){
                                   if (item.images.length){
                                      return callback();
                                    }
                                    return callback('请上传图片');
                                }else{
                                  if (item.images){
                                    return callback();
                                  }
                                  return callback('请上传图片');
                                }
                              }
                              return callback();
                            }
                          }"
                        >
                          <div class="product-detail-item">
                            <show-big-img-upload
                              imgSize="80px"
                              :InitImgURLs="typeof item.images === 'object'?item.images.length?typeof item.images[0]==='object'?'':item.images[0]:'':item.images"
                              v-model="item.images"
                            ></show-big-img-upload>
                            <span
                              style="color: #999;line-height: 18px;position: absolute;bottom: 0;"
                            >建议上传公众号二维码或商城二维码</span>
                          </div>
                        </FormItem>
                        <FormItem
                          label="图片："
                          :prop="'nav_list.'+index+'.value'"
                          :rules="{
                            required: true,trigger: 'change',
                            validator: (rule, formValidate, callback) => {
                              if (value.button_display.includes(item.link_type)){
                                if (typeof item.extra_params.navigationImage === 'object'){
                                   if (item.extra_params.navigationImage.length){
                                      return callback();
                                    }
                                    return callback('请上传图片');
                                }else{
                                  if (item.extra_params.navigationImage){
                                    return callback();
                                  }
                                  return callback('请上传图片');
                                }
                              }
                              return callback();
                            }
                          }"
                          class="margin-bottom-form"
                          v-if="
                            item.link_type == 8 && item.extra_params.type == 1
                          "
                        >
                          <div class="product-detail-item">
                            <show-big-img-upload
                              imgSize="80px"
                              :InitImgURLs="typeof item.extra_params.navigationImage === 'object'?item.extra_params.navigationImage.length?typeof item.extra_params.navigationImage[0]==='object'?'':item.extra_params.navigationImage[0]:'':item.extra_params.navigationImage"
                              v-model="item.extra_params.navigationImage"
                            ></show-big-img-upload>
                          </div>
                        </FormItem>
                        <FormItem
                          label="文本："
                          ref="detailEditor"
                          class="live-full-navigation-text"
                          v-if="
                            item.link_type == 8 && item.extra_params.type == 2
                          "
                          :prop="'nav_list.'+index+'.value'"
                          :rules="{
                            required: true,trigger: 'change',
                            validator: (rule, formValidate, callback) => {
                              if (value.button_display.includes(item.link_type)){
                                if (item.extra_params.context){
                                  return callback();
                                }
                                return callback('请输入文本内容');
                              }
                              return callback();
                            }
                          }"
                        >
                          <div>
                            <div class="product-detail-editor">
                              <ue-editor
                                v-model="item.extra_params.context"
                                :setting="{ueSetting:true,autoHeightEnabled: false,initialFrameHeight:'100%'}"
                                ref="editor"
                              ></ue-editor>
                            </div>
                          </div>
                        </FormItem>
                      </div>
                    </div>
                  </CheckboxGroup>
                </div>
              </TabPane>
              <TabPane label="菜单导航" tab="navButton" v-if="value.live_style">
                <FormItem
                  label="导航菜单："
                  style="margin-bottom: 10px !important;margin-top: 20px !important;"
                  class="un-start"
                >
                  <div class="member-list-right" v-if="value.menu_list.length < 4">
                    <add-more text="添加自定义" @onAddMoreClick="onAddmember" perm="live.operate"></add-more>
                    <!--<more-message text=" 不选择链接则不跳转"></more-message>-->
                  </div>
                  <div class="product-detail-tags">
                    <Tag
                      :checkable="true"
                      v-for="(item, index) in value.menu_list"
                      :name="index"
                      :key="index"
                      @on-change="getCheckedMenu"
                      :checked="checkedMenuBtn == index"
                    >
                      {{ item.button_name }}
                      <icon
                        class="iconfont icon-ios-checkmark-circle1"
                        v-if="value.menu_display.indexOf(item.link_type) != -1"
                      ></icon>
                    </Tag>
                  </div>
                </FormItem>
                <div class="level-news">
                  <CheckboxGroup v-model="value.menu_display">
                    <div
                      class="switch-titlebar"
                      style="margin-left: 100px;"
                      v-for="(item, index) in value.menu_list"
                      :key="index"
                      v-show="checkedMenuBtn == index"
                    >
                      <div class="switch-titlebar-head">
                        <span
                          class="switch-titlebar-head-text"
                          style="margin-right: 13px;font-weight: bold;"
                        >菜单</span>
                        <Checkbox
                          v-if="item.link_type != 9 && item.link_type != 8"
                          :label="item.link_type"
                        >显示</Checkbox>
                        <span
                          @click="deleteLinkType(index)"
                          v-if="item.link_type == 8"
                          style="font-size: 12px;color: #4A6AF5;cursor: pointer;"
                        >删除</span>
                      </div>
                      <div class="news-container">
                        <FormItem label="名称：" class="margin-bottom-form">
                          <Input
                            v-model="item.name"
                            class="common-input-text-310"
                            placeholder="请输入名称"
                            :disabled="item.disable"
                            :maxlength="4"
                          >
                            <span
                              slot="suffix"
                              style="line-height: 32px;"
                            >{{ item.name ? item.name.length : 0 }}/4</span>
                          </Input>
                        </FormItem>
                        <FormItem label="类型：" v-if="item.link_type == 8">
                          <div class="dealer-setting-base-itme dealer-seting-base-ts">
                            <RadioGroup v-model="item.extra_params.type">
                              <Radio :label="1">图片</Radio>
                              <Radio :label="2">文本</Radio>
                              <Radio :label="3">链接</Radio>
                            </RadioGroup>
                          </div>
                        </FormItem>
                        <FormItem
                          label="链接："
                          v-if="
                            item.link_type == 8 &&
                              item.extra_params.type == 3"
                          :prop="'nav_list.'+index+'.value'"
                          :rules="{
                            required: true,trigger: 'change',
                            validator: (rule, formValidate, callback) => {
                              if (value.menu_display.includes(item.link_type)&&item.extra_params.type == 3){
                                if (industryList.link_desc){
                                  return callback();
                                }
                                return callback('请选择链接');
                              }
                              return callback();
                            }
                          }"
                        >
                          <LinkButton
                            class="link-btn common-input-text-310"
                            :context="industryList"
                            :text="industryList.link_desc"
                            :tagsIndex="index"
                            @onSelectLink="onLinkSelected"
                          ></LinkButton>
                        </FormItem>
                        <FormItem
                          label="图片："
                          :prop="'nav_list.'+index+'.value'"
                          :rules="{
                            required: true,trigger: 'change',
                            validator: (rule, formValidate, callback) => {
                              if (value.menu_display.includes(item.link_type)&&item.extra_params.type == 1){
                                if (typeof item.extra_params.navigationImage === 'object'){
                                   if (item.extra_params.navigationImage.length){
                                      return callback();
                                    }
                                    return callback('请上传图片');
                                }else{
                                  if (item.extra_params.navigationImage){
                                    return callback();
                                  }
                                  return callback('请上传图片');
                                }
                              }
                              return callback();
                            }
                          }"
                          class="margin-bottom-form"
                          v-if="
                            item.link_type == 8 && item.extra_params.type == 1
                          "
                        >
                          <div class="product-detail-item">
                            <show-big-img-upload
                              imgSize="80px"
                              :InitImgURLs="typeof item.extra_params.navigationImage === 'object'?item.extra_params.navigationImage.length?typeof item.extra_params.navigationImage[0]==='object'?'':item.extra_params.navigationImage[0]:'':item.extra_params.navigationImage"
                              v-model="item.extra_params.navigationImage"
                            ></show-big-img-upload>
                          </div>
                        </FormItem>
                        <FormItem
                          label="文本："
                          :prop="'nav_list.'+index+'.value'"
                          :rules="{
                            required: true,trigger: 'change',
                            validator: (rule, formValidate, callback) => {
                              if (value.menu_display.includes(item.link_type)&&item.extra_params.type == 2){
                                if (item.extra_params.context){
                                  return callback();
                                }
                                return callback('请输入文本内容');
                              }
                              return callback();
                            }
                          }"
                          class="live-full-navigation-text"
                          v-if="
                            item.link_type == 8 && item.extra_params.type == 2
                          "
                        >
                          <div>
                            <div class="product-detail-editor">
                              <ue-editor
                                v-model="item.extra_params.context"
                                :setting="{ueSetting:true,autoHeightEnabled: false,initialFrameHeight:'100%'}"
                                ref="editor"
                              ></ue-editor>
                            </div>
                          </div>
                        </FormItem>
                      </div>
                    </div>
                  </CheckboxGroup>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
import ueEditor from "COMPONENTS/editor/editor.vue";
import LinkButton from "./link-select-button";
import addMore from "@/views/shop/components/button/add-more.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
export default {
  components: {
    verticalLineTitlebar,
    ueEditor,
    showBigImgUpload,
    LinkButton,
    addMore,
    moreMessage
  },
  props: {
    value: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      tabSelect: 0,
      checkedNavBtn: null,
      checkedMenuBtn: null,
      coverError: false,
      coverStudioURL: "",
      liveStudioURL: "",
      industryList: {
        link_url: "",
        link_desc: "",
        link_type: "",
        link_data: null
      },
      ruleValidateStyles: {
        name: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (this.value.button_display.includes(8)) {
                if (this.value.nav_list[this.value.nav_list.length - 1].name) {
                  return callback();
                }
                return callback(new Error("请输入名称"));
              }
              return callback();
            }
          }
        ],
        live_poster: [
          {
            required: true,
            trigger: "change",
            validator: (rule, formValidate, callback) => {
              if (formValidate.length) {
                this.coverError = false;
                return callback();
              }
              this.coverError = true;
              return callback(new Error("请上传直播间封面图"));
            }
          }
        ]
      },
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
      }
    };
  },
  watch: {
    value: {
      handler(val) {
        if (!val.live_style) {
          this.tabSelect = 0;
        }
        if (typeof val.live_poster === "object") {
          if (typeof val.live_poster[0] === "object") {
            this.liveStudioURL = URL.createObjectURL(val.live_poster[0]);
          } else {
            this.liveStudioURL = val.live_poster;
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    formatURL(url) {
      var prefix = this.$store.state.siteComdataPath;
      return /^(http|blob)/.test(url) || url.indexOf(prefix) == 0
        ? url
        : prefix + url;
    },
    onLinkSelected(linkInfo, item, index) {
      this.$set(item, "link_desc", linkInfo.desc);
      this.$set(item, "link_type", linkInfo.type);
      this.$set(item, "link_data", linkInfo.data);
      this.$set(item, "link_url", linkInfo.url);
      this.$set(
        this.value.menu_list[index].extra_params,
        "links",
        JSON.stringify(item)
      );
    },
    getCheckedTags(checked, name) {
      this.checkedNavBtn = name;
    },
    deleteLinkType(keys) {
      this.value.menu_list.splice(keys, 1);
      this.value.menu_display.splice(this.value.menu_display.indexOf(8), 1);
      this.checkedMenuBtn = this.value.menu_list.length - 1;
    },
    getCheckedMenu(checked, name) {
      this.checkedMenuBtn = name;
    },
    onAddmember() {
      let array = [];
      array = this.value.menu_list;
      array.push({
        nav_type: 1,
        name: "自定义",
        button_name: "自定义",
        link_type: 8,
        extra_params: {
          type: 1,
          context: "",
          navigationImage: "",
          links: ""
        }
      });
      this.checkedMenuBtn = array.length - 1;
      this.$set(this.value, "menu_list", array);
      this.value.menu_display.push(8);
    }
  }
};
</script>

<style lang="less" scoped>
.live-setting-styles {
  height: 100%;
  .container {
    padding: 0 0 74px;
    display: flex;
    width: 100%;
    .container-left {
      width: calc(100% - 325px);
      /deep/.mall-add > textarea {
        border-width: 0 !important;
      }
      .dealer-setting-base-itme {
        /deep/.ivu-radio-wrapper {
          margin-right: 20px;
          .ivu-radio {
            margin-right: 5px;
          }
        }
      }
      .live-full-screen {
        /deep/.ivu-form-item-error {
          /deep/.ivu-form-item-content {
            /deep/.show-big-img-upload {
              .newbutton {
                border-color: #ed4014 !important;
              }
            }
          }
        }
        .product-detail-tags {
          .ivu-tag {
            width: 92px;
            height: 32px;
            background-color: #fff !important;
            border: 1px solid #dcdee2 !important;
            line-height: 28px;
            text-align: center;
            position: relative;
            overflow: unset;
            margin: 0 14px 10px 0;
            /deep/.ivu-tag-text {
              font-size: 12px !important;
              & > i {
                position: absolute;
                right: -9px;
                top: -10px;
                color: #4a6af5;
              }
            }
          }
          .ivu-tag-checked {
            border-color: #4a6af5 !important;
            overflow: unset;
            /deep/.ivu-tag-text {
              color: #4a6af5 !important;
            }
          }
        }
        .level-news {
          .switch-titlebar {
            width: 650px;
            margin-bottom: unset;
            border: 1px solid #dcdee2;
            border-radius: 5px;
          }
          .switch-titlebar-head {
            background-color: #fafbfd;
            padding: 12px 14px;
            margin-bottom: 10px;
            justify-content: space-between;
            border-radius: 5px 5px 0 0;
            display: flex;
            /deep/.ivu-checkbox-wrapper {
              .ivu-checkbox {
                margin-right: 5px;
              }
            }
          }
          .dealer-setting-base-itme {
            /deep/.ivu-radio-wrapper {
              margin-right: 20px;
            }
          }
        }
        /deep/.ivu-tabs {
          min-height: unset !important;
          .ivu-tabs-content {
            height: unset !important;
          }
        }
        .product-detail-item {
          height: 82px;
          .show-big-img-upload {
            display: inline-block;
          }
          .ivu-checkbox-group {
            .ivu-checkbox-wrapper {
              margin-right: 20px;
              /deep/.ivu-checkbox {
                margin-right: 5px;
              }
            }
          }
        }
        .product-detail-editor {
          width: 530px;
          height: 420px;
          /deep/.edui-editor-iframeholder {
            height: 250px !important;
          }
          /deep/.edui-editor-bottomContainer {
            display: none;
          }
        }
      }
    }
    .btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-left: 10px;
      .icon {
        width: 100%;
        height: 100%;
        background-size: 21px;
        background-position: center;
        background-repeat: no-repeat;
      }
    }
    .videostyle {
      width: 300px;
      height: 534px;
      margin-right: 25px;
      background-repeat: no-repeat;
      background-size: 100% 483px;
      background-position: bottom;
      background-color: #ccc;
      position: relative;
      border: 1px solid #E9EBF2;
      img {
        width: 100%;
        height: 100%;
      }
      .follow {
        position: absolute;
        width: 30px;
        height: 27px;
        line-height: 27px;
        text-align: center;
        background-color: #fe3737;
        border-radius: 14px;
        font-size: 12px;
        color: #fff;
        top: 60px;
        left: 90px;
      }
      .more {
        position: absolute;
        display: flex;
        width: 74px;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 30px 0 0 30px;
        align-items: center;
        justify-content: space-between;
        top: 90px;
        right: 0;
        color: #fff;
        .video-live-fans-icon {
          width: 30px;
          height: 30px;
          box-sizing: border-box;
          padding: 5px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.35);
          img {
            width: 20px;
            height: 20px;
          }
        }
        .video-live-fans-icon + div {
          padding-right: 15px;
          font-size: 12px;
        }
      }
      .home {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        top: 140px;
        right: 15px;
      }
      .cmment {
        position: absolute;
        left: 15px;
        bottom: 10px;
        width: 80px;
        height: 30px;
        line-height: 30px;
        margin-right: 15px;
        margin-right: 15px;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        text-align: center;
        span {
          font-size: 12px;
        }
      }
      .btn-nav {
        position: absolute;
        right: 15px;
        bottom: 7px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .products {
          background-image: linear-gradient(#fd4d66, #fe3737);
          animation: pulse 2s infinite linear;
        }
        .like {
          position: relative;
          .tag{
            position: absolute;
            bottom: 65%;
            left: 50%;
            width: 52px;
            height: 28px;
            line-height: 28px;
            border-radius: 28px;
            text-align: center;
            background: #fe3737;
            color: white;
            font-size: 16px;
            -webkit-transform: translateX(-50%) scale(0.5);
            transform: translateX(-50%) scale(0.5);
            &:after{
              content: "";
              position: absolute;
              top: 100%;
              left: 50%;
              width: 8px;
              height: 8px;
              background: #fe3737;
              -webkit-transform: translate(-50%, -50%) rotate(45deg);
              transform: translate(-50%, -50%) rotate(45deg);
            }
          }
        }
      }
    }
    .hearfVideostyle {
      width: 300px;
      height: 534px;
      margin-right: 25px;
      background-color: #ccc;
      position: relative;
      border: 1px solid #E9EBF2;
      .hearfVideostyle-bg-top {
        width: 100%;
        height: 210px;
        position: absolute;
        top: 50px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 210px;
      }
      .hearfVideostyle-bg-bottom {
        width: 100%;
        height: 240px;
        position: absolute;
        bottom: 0;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 240px;
        -webkit-filter: blur(15px);
        -moz-filter: blur(15px);
        -o-filter: blur(15px);
        -ms-filter: blur(15px);
        filter: blur(15px);
      }
      img {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 1;
      }
      .manu-list {
        position: absolute;
        display: flex;
        bottom: 245px;
        z-index: 2;
        width: 100%;
        .ivu-col {
          text-align: center;
        }
      }
      .follow {
        position: absolute;
        width: 30px;
        height: 27px;
        line-height: 27px;
        text-align: center;
        background-color: #fe3737;
        border-radius: 14px;
        font-size: 12px;
        color: #fff;
        top: 60px;
        left: 90px;
        z-index: 9;
      }
      .more {
        position: absolute;
        display: flex;
        width: 60px;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 30px 0 0 30px;
        align-items: center;
        justify-content: space-between;
        top: 64px;
        right: 0;
        color: #fff;
        height: auto !important;
        .video-live-fans-icon {
          width: 20px;
          height: 20px;
          box-sizing: border-box;
          padding-left: 5px;
          padding-top: 5px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.35);
          img {
            width: 10px;
            height: 10px;
          }
        }
        .video-live-fans-icon + div {
          padding-right: 15px;
          font-size: 12px;
        }
      }
      .cmment {
        position: absolute;
        width: 80px;
        height: 30px;
        line-height: 30px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        color: #fff;
        bottom: 10px;
        left: 15px;
        text-align: center;
        span {
          font-size: 12px;
        }
      }
      .btn-nav {
        position: absolute;
        right: 10px;
        bottom: 0;
        flex-direction: column;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .btn{
          margin-bottom: 10px;
        }
        .home {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
        }
        .products {
          background-color: #fd4d66;
          border-radius: 20px;
        }
        .like {
          position: relative;
          .tag{
            position: absolute;
            bottom: 65%;
            left: 50%;
            width: 52px;
            height: 28px;
            line-height: 28px;
            border-radius: 28px;
            text-align: center;
            background: #fe3737;
            color: white;
            font-size: 16px;
            -webkit-transform: translateX(-50%) scale(0.5);
            transform: translateX(-50%) scale(0.5);
            &:after{
              content: "";
              position: absolute;
              top: 100%;
              left: 50%;
              width: 8px;
              height: 8px;
              background: #fe3737;
              -webkit-transform: translate(-50%, -50%) rotate(45deg);
              transform: translate(-50%, -50%) rotate(45deg);
            }
          }
        }
      }
    }
    .home .icon {
      background-image: url(../images/home.png);
    }
    .products .icon {
      background-image: url(../images/commodit.png);
    }
    .coupon .icon {
      background-size: 25px;
      background-image: url(../images/coupon.png);
    }
    .like .icon {
      background-image: url(../images/heart1.png);
    }
    .share .icon {
      background-size: 19px;
      background-image: url(../images/share.png);
    }
    .self .icon {
      background-size: 18px;
      background-image: url(../images/more.png);
    }
  }
  .footer {
    position: fixed;
    bottom: 10px;
    height: 50px;
    line-height: 50px;
    width: 100%;
    background-color: #fff;
    text-align: center;
    border-top: 1px solid #eee;
    button {
      width: 70px;
      height: 32px;
    }
  }
}
</style>
