<template>
  <div class="live-setting-base">
    <div class="container">
      <Form
        ref="formValidateBase"
        :model="value"
        :rules="ruleValidateBase"
        :label-width="100"
        class="mall-add"
      >
        <div class="level-news">
          <div class="news-container">
            <FormItem label="排序：">
              <InputNumber
                v-model="value.sort"
                :min="0"
                :max="9999999"
                class="common-input-text-310"
              >
              </InputNumber>
              <more-message
                style="margin-left: 10px;"
                text="序号越大，排在直播列表的前面"
              ></more-message>
            </FormItem>
            <FormItem
              label="直播间标题："
              prop="title"
              class="margin-bottom-form"
            >
              <Input
                v-model="value.title"
                class="common-input-text-310"
                placeholder="请输入标题"
                :maxlength="20"
              >
                <span slot="suffix"
                  >{{ value.title ? value.title.length : 0 }}/20</span
                >
              </Input>
            </FormItem>
            <FormItem label="直播间介绍：" prop="intro">
              <div class="product-detail-item">
                <Input
                  v-model="value.intro"
                  type="textarea"
                  :maxlength="50"
                  placeholder="请输入介绍"
                />
                <span class="textarea-num"
                  >{{ value.intro ? value.intro.length : 0 }}/50</span
                >
              </div>
            </FormItem>
            <FormItem label="预播时间：" prop="expected_live_time">
              <DatePicker
                type="datetime"
                format="yyyy-MM-dd HH:mm:ss"
                :value="value.expected_live_time"
                :options="startDateOptions"
                placeholder="请选择预播时间"
                @on-change="getChangeTima"
                :disabled="liveInfo.status == 1 || liveInfo.status == 2"
              ></DatePicker>
              <more-message
                style="margin-left: 10px;"
                text="预播时间，只用于前台展示，具体直播时间以操作台【开始时间】为准"
              ></more-message>
            </FormItem>
            <FormItem
              label="直播员昵称："
              prop="live_nickname"
              class="margin-bottom-form"
            >
              <Input
                v-model="value.live_nickname"
                class="common-input-text-310"
                placeholder="请输入直播员昵称"
                :maxlength="16"
              >
                <span slot="suffix"
                  >{{
                    value.live_nickname ? value.live_nickname.length : 0
                  }}/16</span
                >
              </Input>
            </FormItem>
            <FormItem
              label="直播员头像："
              prop="live_headurl"
              class="margin-bottom-form"
            >
              <!--<more-message :text="tips.headurl"></more-message>-->
              <div class="product-detail-item">
                <show-big-img-upload
                  imgSize="80px"
                  :class="{ 'has-error': imageIsError }"
                  :InitImgURLs="headurlURL"
                  v-model="value.live_headurl"
                ></show-big-img-upload>
                <span
                  style="color: #999;line-height: 18px;position: absolute;bottom: 0;"
                  >建议上传比例为1:1的图片</span
                >
              </div>
            </FormItem>
            <FormItem
              label="直播广场封面："
              prop="list_poster"
              class="margin-bottom-form"
            >
              <!--<more-message :text="tips.headurl"></more-message>-->
              <div class="product-detail-item">
                <show-big-img-upload
                  imgSize="80px"
                  :class="{ 'has-error': squareCoverError }"
                  :InitImgURLs="squareCoverURL"
                  v-model="value.list_poster"
                ></show-big-img-upload>
                <span
                  style="color: #999;line-height: 18px;position: absolute;bottom: 0;"
                  >建议上传比例为1:1的图片</span
                >
              </div>
            </FormItem>
            <FormItem label="直播助手昵称：" class="margin-bottom-form">
              <Input
                v-model="value.live_helper_name"
                :maxlength="10"
                class="common-input-text-310"
              >
                <span slot="suffix"
                  >{{
                    value.live_helper_name ? value.live_helper_name.length : 0
                  }}/10</span
                >
              </Input>
            </FormItem>
            <FormItem label="观看基数：" prop="base_online_num">
              <InputNumber
                v-model="value.base_hits"
                :min="0"
                :max="9999999"
                placeholder="请输入合理的观看基数"
                class="common-input-text-310"
              >
              </InputNumber>
              <more-message
                style="margin-left: 10px;"
                text=" 可合理填写观看直播的基数，最大可填写9999999人"
              ></more-message>
            </FormItem>
            <FormItem label="直播广场显示：">
              <div class="dealer-setting-base-itme">
                <RadioGroup v-model="value.show_live_list">
                  <Radio :label="1">是</Radio>
                  <Radio :label="2">否</Radio>
                </RadioGroup>
              </div>
            </FormItem>
          </div>
        </div>
      </Form>
      <!--<div class="footer">-->
      <!--<Button-->
      <!--shape="circle"-->
      <!--type="primary"-->
      <!--@click="onSaveStart('formValidate')"-->
      <!--perm="live.config.operate"-->
      <!--&gt;保存</Button>-->
      <!--</div>-->
    </div>
  </div>
</template>
<script>
import moreMessage from "COMPONENTS/more-message/more-message";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
let defaultImg = require("../../images/head-portrait.png");
export default {
  components: {
    moreMessage,
    showBigImgUpload
  },
  props: {
    value: {
      required: true,
      type: Object
    },
    liveInfo: {
      required: false,
      type: Object
    }
  },
  data() {
    return {
      imageIsError: false,
      squareCoverError: false,
      headurlURL: "",
      squareCoverURL: "",
      thirdMenu: [],
      // 预播时间必须是未来时间
      startDateOptions: {
        disabledDate: function(date) {
          var d = new Date();
          var str =
            d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); //获取当前实际日期
          if (Date.parse(str) > Date.parse(date)) {
            //时间戳对比
            return 1;
          }
          return 0;
        }.bind(this)
      },
      ruleValidateBase: {
        title: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请输入标题"));
            }
          }
        ],
        intro: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请输入介绍"));
            }
          }
        ],
        expected_live_time: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (this.liveInfo.status == 1 || this.liveInfo.status == 2) {
                  return callback();
              }
              if (value) {
                var d = new Date();
                var str =
                  d.getFullYear() +
                  "-" +
                  (d.getMonth() + 1) +
                  "-" +
                  d.getDate() +
                  " " +
                  d.getHours() +
                  ":" +
                  d.getMinutes() +
                  ":" +
                  d.getSeconds(); //获取当前实际日期
                if (
                  Date.parse(str) > Date.parse(value) &&
                  this.liveInfo.status != 1
                ) {
                  //时间戳对比
                  return callback(
                    new Error("请选择预播时间 只能选择未来的预播时间")
                  );
                }
                return callback();
              }
              return callback(
                new Error("请选择预播时间 只能选择未来的预播时间")
              );
            }
          }
        ],
        live_nickname: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请输入直播员昵称"));
            }
          }
        ],
        live_headurl: [
          {
            required: true,
            trigger: "change",
            validator: (rule, formValidate, callback) => {
              if (formValidate.length) {
                this.imageIsError = false;
                return callback();
              }
              this.imageIsError = true;
              return callback(new Error("请上传直播员头像"));
            }
          }
        ],
        list_poster: [
          {
            required: true,
            trigger: "change",
            validator: (rule, formValidate, callback) => {
              if (formValidate.length) {
                this.squareCoverError = false;
                return callback();
              }
              this.squareCoverError = true;
              return callback(new Error("请上传直播间广场封面"));
            }
          }
        ],
        base_online_num: [
          {
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                if (/^\+?[1-9][0-9]*$/.test(value) !== true) {
                  callback(new Error("请输入非零整数"));
                }
                return callback();
              }
              return callback();
            }
          }
        ]
      },
      industryList: []
    };
  },
  methods: {
    getChangeTima(e) {
      this.$set(this.value, "expected_live_time", e);
    }
  }
};
</script>
<style lang="less" scoped>
.live-setting-base {
  /*position: absolute;*/
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
    /*padding: 0 0 74px;*/
    /*padding-bottom: 74px;*/
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
          height: 82px;
          .show-big-img-upload {
            display: inline-block;
          }
          /deep/.ivu-input-wrapper {
            width: 310px;
          }
          span.textarea-num {
            font-size: 12px;
            color: #999999;
            vertical-align: bottom;
            position: relative;
            margin-left: 0;
          }
        }
        /deep/.ivu-form-item-label {
          width: 120px;
        }
        .dealer-setting-base-itme {
          /deep/.ivu-radio-wrapper {
            margin-right: 20px;
          }
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
    resize: none;
  }
  /*/deep/.ivu-select-dropdown {*/
  /*max-height: 150px;*/
  /*}*/
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
  width: 100%;
  background-color: #fff;
  text-align: center;
  border-top: 1px solid #eee;
  button {
    width: 70px;
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
