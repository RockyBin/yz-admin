<template>
  <div class="weixin">
    <Spin size="large" fix v-if="showLoading"></Spin>
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <div class="main-board">
        <div class="wrapper">
          <alert-warning>
            <p>绑定后，即可以在企业微信应用里进行授权登录和支付。</p>
          </alert-warning>
          <h3>
            <span>企业微信绑定</span>
          </h3>
          <Form ref="form" :model="formField" :rules="rules" :label-width="120">
            <FormItem label="企业ID：" prop="corp_id">
              <Input v-model="formField.corp_id" placeholder="请填写企业微信CorpId" />
            </FormItem>
            <FormItem label="应用AgentId：" prop="agent_id">
              <Input v-model="formField.agent_id" placeholder="请填写应用AgentId" />
            </FormItem>
            <FormItem label="应用Secret：" prop="secret">
              <Input v-model="formField.secret" placeholder="请填写应用Secret" />
            </FormItem>
            <FormItem label="Token：" prop="token">
              <Input v-model="formField.token" placeholder="请填写接收消息Token" />
            </FormItem>
            <FormItem label="EncodingAESKey：" prop="aes_key">
              <Input v-model="formField.aes_key" placeholder="请填写接收消息EncodingAESKey" />
            </FormItem>
            <FormItem label="域名选择：">
              <Select v-model="formField.domain" style="width:200px">
                <Option
                  v-for="(item, index) in domainList"
                  :value="item.domain"
                  :key="index"
                >{{ item.domain }}</Option>
              </Select>
            </FormItem>
            <FormItem label="接收消息URL：">
              <span id="url"
                class="copy-text"
              >{{formField.domain ? formField.url : "请先选择域名"}}</span>
              <Button
                class="copy-btn"
                type="primary"
                data-clipboard-action="copy"
                data-clipboard-target="#url"
                :disabled="!formField.url || !formField.domain"
              >复制</Button>
            </FormItem>
            <FormItem label="验证文件：" prop="verify" class="verify">
              <upload-button
                type="default"
                @fileSelected="formField.verify = $event"
                :url="formField.verify && ($store.state.siteComdataPath + formField.verify)"
              ></upload-button>
            </FormItem>
          </Form>
        </div>
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
import alertWarning from "@/views/shop/components/alert/alert-warning.vue";
import uploadButton from "@/views/shop/components/button/upload-button.vue";
import thirdMenuData from "../components/third-menu-for-channel-wxapp";
export default {
  components: {
    thirdMenu,
    alertWarning,
    uploadButton
  },
  data() {
    const validate = (rule, value, callback) => {
      if (!value) {
        callback(new Error("必须上传"));
      } else {
        callback();
      }
    };

    return {
      showLoading: false,
      domainList: [],
      thirdMenu: [],
      formField: {
        corp_id: "",
        agent_id: "",
        domain: "",
        url: "",
        secret: "",
        token: "",
        aes_key: "",
        verify: null
      },
      rules: {
        corp_id: [{ required: true, message: "必须填写", trigger: "blur" }],
        agent_id: [{ required: true, message: "必须填写", trigger: "blur" }],
        secret: [{ required: true, message: "必须填写", trigger: "blur" }],
        token: [{ required: true, message: "必须填写", trigger: "blur" }],
        aes_key: [{ required: true, message: "必须填写", trigger: "blur" }],
        verify: [{ required: true, validator: validate, trigger: "change" }]
      }
    };
  },
  watch: {
    "formField.verify": function() {
      this.$refs.form.validateField("verify");
    },
    "formField.domain": function() {
      this.formField.url = "http://" + this.formField.domain + "/core/wxwork/serve";
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
        e.clearSelection(); //清除复制后文字的选中状态
        if (e.text) {
          this.$Message.success("数据已复制到剪贴板");
        }
      }.bind(this)
    );
    clipboard.on(
      "error",
      function(e) {
        this.$Message.error("复制失败");
      }.bind(this)
    );
  },
  methods: {
    getConfig() {
      this.showLoading = true;
      this.$httpGet("/shop/admin/wxwork/config/info", {}, res => {
        this.showLoading = false;
        if (res.code == 200) {
          Object.assign(this.formField, res.data.config);
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
            if (key == "verify") {
              formData.append(key + "_file", this.formField[key]);
            } else {
              formData.append(key, this.formField[key]);
            }
          }
          this.showLoading = true;
          this.$httpUpload("/shop/admin/wxwork/config/save", formData, res => {
            this.showLoading = false;
            if (res.code == 200) {
              this.$Message.success("保存成功");
            } else {
              this.$Message.error(res.msg);
            }
          });
        } else {
          this.$Message.error("有未填写的表单字段！");
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
    overflow: auto;
    .verify {
      /deep/.ivu-form-item-error-tip {
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