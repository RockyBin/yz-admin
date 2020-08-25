<template>
  <div class="weixin">
    <Spin size="large" fix v-if="showLoading"></Spin>
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <div class="main-board">
        <div class="wrapper">
          <alert-warning>
            <p>1. 绑定后，即可以在这里管理您的公众号。</p>
            <p>2. 为了正常使用微信的功能，请绑定已认证的服务号。 没有账号，<a href="https://mp.weixin.qq.com/" target="_blank">去设置</a></p>
            <p>3. 绑定后，除非必要，请不要随意更改已绑定的公众号。<span v-if="isBound">需要更改，<a href="javascript:void(0)" @click="unbind">去解绑</a>
            </span></p>
          </alert-warning>
          <h3>
            <span>公众号绑定</span>
          </h3>
          <Form ref="form" :model="formField" :rules="rules" :label-width="120">
            <FormItem label="公众号名称：" prop="name">
              <!-- <span v-if="isBound">{{formField.name}}</span> -->
              <Input v-model="formField.name" :disabled="isBound" placeholder="请输入公众号名称" />
            </FormItem>
            <FormItem label="原始ID：" prop="wxid">
              <!-- <span v-if="isBound">{{formField.wxid}}</span> -->
              <Input v-model="formField.wxid" :disabled="isBound" placeholder="请输入原始ID" />
            </FormItem>
            <FormItem label="公众号微信号：" prop="wx_no">
              <!-- <span v-if="isBound">{{formField.wx_no}}</span> -->
              <Input v-model="formField.wx_no" :disabled="isBound" placeholder="请输入公众号微信号" />
            </FormItem>
            <FormItem label="AppID：" prop="appid">
              <!-- <span v-if="isBound">{{formField.appid}}</span> -->
              <Input v-model="formField.appid" :disabled="isBound" placeholder="请输入AppID" />
            </FormItem>
            <FormItem label="AppSecret：" prop="appsecret">
              <Input v-model="formField.appsecret" placeholder="请输入APPSecret" />
            </FormItem>
            <FormItem label="域名选择：">
              <Select v-model="formField.domain" style="width:200px">
                <Option
                  v-for="(item,index) in domainList"
                  :value="item.domain"
                  :key="index"
                >{{ item.domain }}</Option>
              </Select>
            </FormItem>
            <FormItem label="接口URL：">
              <span
                v-if="formField.domain&&formField.url"
                id="url"
                class="copy-text"
              >{{'http://'+formField.domain+formField.url}}</span>
              <Button
                class="copy-btn"
                type="primary"
                data-clipboard-action="copy"
                data-clipboard-target="#url"
                :disabled="!formField.url||!formField.domain"
              >复制</Button>
            </FormItem>
            <FormItem label="Token：">
              <span v-if="formField.token" id="token" class="copy-text">{{formField.token}}</span>
              <Button
                class="copy-btn"
                type="primary"
                data-clipboard-action="copy"
                data-clipboard-target="#token"
                :disabled="!formField.token"
              >复制</Button>
            </FormItem>
            <FormItem label="公众号logo：" prop="logo">
              <show-big-img-upload
                imgSize="40px"
                :InitImgURLs="formField.logo"
                v-model="logo"
              ></show-big-img-upload>
            </FormItem>
            <FormItem label="公众号二维码：" prop="qrcode">
              <show-big-img-upload
                imgSize="40px"
                :InitImgURLs="formField.qrcode"
                v-model="qrcode"
              ></show-big-img-upload>
            </FormItem>
            <FormItem label="验证文件：" prop="mp_verify" class="verify">
              <upload-button
                type="default"
                @fileSelected="formField.mp_verify=$event"
                :url="formField.mp_verify&&($store.state.siteComdataPath+formField.mp_verify)"
              ></upload-button>
            </FormItem>
          </Form>
        </div>
        <!--<foot-button  @onSaveClick="submit"></foot-button>-->
        <div class="footer">
          <Button
            class="save-btn"
            type="primary"
            shape="circle"
            @click="submit"
            perm="mp.config.operate"
          >保存</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Clipboard from "clipboard";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
import uploadButton from "@/views/shop/components/button/upload-button.vue";
import thirdMenuData from "../components/third-menu-for-channel-weixin";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue"
export default {
  components: {
    thirdMenu,
    alertWarning,
    uploadButton,
    showBigImgUpload
  },
  data() {
    const validate = (rule, value, callback) => {
      // debugger;
      if (!value) {
        callback(new Error("必须上传"));
      } else {
        callback();
      }
    };

    return {
      showLoading: false,
      isBound: false,
      domainList: [],
      thirdMenu: [],
      formField: {
        name: "",
        id: "",
        wxid: "",
        wx_no: "",
        appid: "",
        appsecret: "",
        domain: "",
        logo: null,
        qrcode: null,
        url: "",
        token: "",
        mp_verify: null
      },
      qrcode: [],
      logo: [],
      formFieldOri: {
        name: "",
        id: "",
        wxid: "",
        wx_no: ""
      },
      rules: {
        name: [{ required: true, message: "必须填写", trigger: "blur" }],
        wx_no: [{ required: true, message: "必须填写", trigger: "blur" }],
        wxid: [{ required: true, message: "必须填写", trigger: "blur" }],
        appid: [{ required: true, message: "必须填写", trigger: "blur" }],
        appsecret: [{ required: true, message: "必须填写", trigger: "blur" }],
        logo: [
          {
            required: true,
            validator: (rule, value, callback) => {
              console.log(this.logo);
              validate(rule, this.logo[0], callback);
            },
            trigger: "change"
          }
        ],
        qrcode: [
          {
            required: true,
            validator: (rule, value, callback) => {
              validate(rule, this.qrcode[0], callback);
            },
            trigger: "change"
          }
        ],
        mp_verify: [{ required: true, validator: validate, trigger: "change" }]
      }
    };
  },
  watch: {
    logo: function() {
      this.$refs.form.validateField("logo");
    },
    qrcode: function() {
      this.$refs.form.validateField("qrcode");
    },
    "formField.mp_verify": function() {
      this.$refs.form.validateField("mp_verify");
    },
    formFieldOri: {
      handler(newVal) {
        if (newVal.name && newVal.id && newVal.wxid && newVal.wx_no) {
          this.$store.commit("changeBoundState", true);
          this.isBound = true;
        } else {
          this.$store.commit("changeBoundState", false);
          this.isBound = false;
        }
      },
      deep: true
    }
  },
  created() {
    this.getConfig();
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    var clipboard = new Clipboard(".copy-btn");
    clipboard.on(
      "success",
      function(e) {
        // console.info("Action:", e.action);
        // console.info("Text:", e.text);
        // console.info("Trigger:", e.trigger);
        e.clearSelection(); //清除复制后文字的选中状态
        if (e.text) {
          this.$Message.success("数据已复制到剪贴板");
        }
      }.bind(this)
    );

    clipboard.on(
      "error",
      function(e) {
        // console.error("Action:", e.action);
        // console.error("Trigger:", e.trigger);
        this.$Message.error("复制失败");
      }.bind(this)
    );
  },
  methods: {
    getConfig() {
      this.showLoading = true;
      this.$httpGet("/shop/admin/wx/config/info", {}, res => {
        this.showLoading = false;
        if (res.code == 200) {
          this.logo = res.data.config.logo ? [res.data.config.logo] : [];
          this.qrcode = res.data.config.qrcode ? [res.data.config.qrcode] : [];
          Object.assign(this.formField, res.data.config);
          Object.assign(this.formFieldOri, res.data.config);
          this.formField.url = res.data.url;
          this.domainList = res.data.domain_list;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let formData = new FormData();
          for (let key in this.formField) {
            if (key == "logo" || key == "qrcode") {
              formData.append(key + "_file", this[key][0]);
            } else if (key == "mp_verify") {
              formData.append(key + "_file", this.formField[key]);
            } else {
              formData.append(key, this.formField[key]);
            }
          }
          this.showLoading = true;
          this.$httpUpload("/shop/admin/wx/config/save", formData, res => {
            this.showLoading = false;
            if (res.code == 200) {
              this.$Message.success("保存成功");
              Object.assign(this.formFieldOri, this.formField);
            } else {
              this.$Message.error(res.msg);
            }
          });
        } else {
          this.$Message.error("有未填写的表单字段！");
        }
      });
    },
    unbind() {
      this.$Modal.confirm({
        title: "提示",
        content:
          "除非必要，请不要随意更改已绑定的公众号，一旦更改，已经设置的【自定义菜单】、【自动回复】、【素材管理】数据，将会清空需要重设；已经绑定公众号的会员需要重新绑定。是否确定解绑，重新绑定到其他公众号",
        onOk: () => {
          this.$httpGet("/shop/admin/wx/config/unbind", {}, res => {
            if (res.code == 200) {
              this.$Message.success(res.msg);
              this.getConfig();
              // this.$refs.form.resetFields();
              // this.isBound=false;
            } else {
              this.$Message.error(res.msg);
            }
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  width: 100%;
  height: 100%;
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
  padding-bottom: 50px;
  .wrapper {
    padding: 24px;
    /*height: calc(100vh - 120px);*/
    overflow: auto;
    .verify{
      /deep/.ivu-form-item-error-tip{
        margin-top: 1px;
      }
    }
  }
  h3 {
    position: relative;
    height: 32px;
    line-height: 32px;
    margin: 24px 0;
    font-size: 14px;
    &:before {
      position: absolute;
      content: "";
      width: 4px;
      height: 18px;
      left: 0px;
      top: 6px;
      border-radius: 20px;
      background: #4570ea;
    }
    & > span {
      margin-left: 12px;
    }
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
      width: 70px;
      height: 32px;
    }
  }
  /*.footer {*/
    /*height: 50px;*/
    /*line-height: 50px;*/
    /*text-align: center;*/
    /*border-top: 1px solid #e9e9e9;*/
    /*.save-btn {*/
      /*width: 70px;*/
      /*height: 32px;*/
      /*// background: #4570ea;*/
    /*}*/
  /*}*/
  /deep/.ivu-form-item {
    margin-bottom: 30px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  /deep/.ivu-input-wrapper,
  /deep/.ivu-select {
    width: 260px !important;
    height: 32px !important;
  }
  /deep/.upload-wrapper + .ivu-form-item-error-tip {
    top: auto;
    bottom: 0;
    left: 50px;
  }
  .copy-text {
    display: inline-block;
    width: 250px;
    line-height: 25px;
    padding-top: 4px;
    vertical-align: top;
    word-break: break-all;
  }
  .copy-btn {
    width: 58px;
    height: 32px;
    margin-left: 10px;
  }
}
</style>