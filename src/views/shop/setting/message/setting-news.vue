<template>
<div class="flex-wrapper">
  <third-menu :list="thirdMenu"/>
  <div class="main-content">
    <div class="container">
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="106"
        class="merchant-add"
      >
        <div class="level-news">
          <verticalLineTitlebar :title="titles"/>
          <div class="padding-form">
            <FormItem label="ID：" prop="appid" class="margin-bottom-form">
              <Input v-model="formValidate.appid" class="common-input-text-260" placeholder="请输入ID"/>
            </FormItem>
            <FormItem label="KEY：" prop="appkey" class="margin-bottom-form">
              <Input v-model="formValidate.appkey" class="common-input-text-260" placeholder="请输入KEY"/>
            </FormItem>
            <FormItem label="商家手机号：" prop="mobile" class="margin-bottom-form">
              <Input v-model="formValidate.mobile" class="common-input-text-260" placeholder="请输入商家手机号"/>
            </FormItem>
            <FormItem label="短信签名：" prop="sign" class="margin-bottom-form">
              <Input v-model="formValidate.sign" class="common-input-text-260" placeholder="请输入短信签名"/>
            </FormItem>
          </div>
        </div>
      </Form>
      <!--<div class="footer">-->
        <!--<Button class="save-btn" type="primary" shape="circle" @click="onSaveStart('formValidate')" perm="sms.config.operate">保存</Button>-->
      <!--</div>-->
      <foot-button @onSaveClick="onSaveStart('formValidate')">
        <!--<Button class="save" @click="onSaveStart('formValidate')">保存</Button>-->
      </foot-button>
    </div>
  </div>
</div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import thirdMenuData from "../components/third-menu-for-setting-message";
export default {
  components: {
    footButton,
    thirdMenu,
    verticalLineTitlebar
  },
  data() {
    return {
      titles: "短信设置",
      thirdMenu:[],
      formValidate: {
        appkey: "",
        appid: "",
        sign: "",
        mobile: "",
        type: 1
      },
      ruleValidate: {
        appid: [{ required: true, message: "请输入ID号", trigger: "blur" }],
        mobile: [
          { required: true, message: "请输入商家手机号", trigger: "blur" },
          { pattern: /^\d{11}$/, message: "手机号码无效", trigger: "blur" }
        ],
        sign: [
		  { required: true, message: "请输入短信签名", trigger: "blur" },
		  { pattern: /^[\u4e00-\u9fa5]+$/, message: "短信签名必须全部是中文", trigger: "blur" }
		]
      }
    };
  },
  methods: {
    onSaveStart(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$httpGet(
            "/shop/admin/smsconfig/edit",
            this.formValidate,
            res => {
              if (res.code === 200) {
                this.$Message.success(this.$store.state.SUCCESS_MSG);
                this.getData();
              } else {
                this.$Message.error(this.$store.state.FAIL_MSG);
              }
            }
          );
        } else {
          this.$Message.error(this.$store.state.FAIL_MSG);
        }
      });
    },
    getData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/smsconfig/info", "", res => {
        this.$store.state.COMMON_loading = false;
        this.formValidate = res.data;
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
.flex-wrapper {
  width:100%;
  background: #f2f4fd;
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.footer {
  position:absolute;
  width:100%;
  bottom:0;
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #e9e9e9;
  .save-btn {
    width: 110px;
    height: 34px;
    background: #4570ea;
  }
}
.container {
  background: white;
  height: calc(100vh - 120px);
  .merchant-add {
    height: calc(100% - 70px);
    overflow: auto;
    padding: 24px 0 0 24px;
    text-align: left;
    overflow: hidden;
    .level-news {
      /deep/.ivu-form-item-label {
        width: 120px;
      }
    }
  }
}
// 图标
.common-icon {
  vertical-align: middle;
  font-size: 18px;
  margin-left: 10px;
}
</style>
