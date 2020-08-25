<template>
  <div class="marketing-express">
    <div class="marketing-express-head">
      <div class="marketing-express-head-left">
        <img src="images/marketing/express.png" alt />
        <div>
          <div>快递100快递管家</div>
          <div>
            快递100官方应用，批量打印发货，自动跟踪快递单及时查找异常件，专属查询页手机号查询快递，支持菜鸟电子面单，备货单，协议月结，统一对账。
          </div>
          <a href="https://b.kuaidi100.com/" target="blank"
            >官网：https://b.kuaidi100.com/</a
          >
        </div>
      </div>
      <div class="marketing-express-head-right">
        <a
          href="http://help.wfenxian.com/NewsDetail/2070569.html"
          target="blank"
        >
          <i class="iconfont icon-ios-help-circle-outl"></i>
          <span>帮助中心</span>
        </a>
      </div>
    </div>
    <div class="marketing-express-content" v-if="dataInfo">
      <switch-titlebar
        v-model="dataInfo.status"
        title="启用快递管家打单"
      ></switch-titlebar>
      <Form
        ref="formValidate"
        :model="dataInfo"
        :rules="ruleValidate"
        :label-width="106"
        v-show="dataInfo.status"
      >
        <div>
          <verticalLineTitlebar title="接口配置" />
          <FormItem label="APP Key：" prop="app_key">
            <Input
              style="width: 300px"
              v-model="dataInfo.app_key"
              placeholder="请输入APP Key"
            />
          </FormItem>
          <FormItem label="APP secret：" prop="app_secret">
            <Input
              style="width: 300px"
              v-model="dataInfo.app_secret"
              placeholder="请输入APP Secret"
            />
          </FormItem>
          <FormItem label="域名选择：" prop="redirect_domain">
            <Select style="width: 300px" v-model="dataInfo.redirect_domain">
              <Option
                v-for="(item, index) in dataInfo.domain_list"
                :value="item.domain"
                :key="index"
                >{{ item.domain }}</Option
              >
            </Select>
          </FormItem>
          <FormItem label="回调URL：">
            <Input
              style="width: 300px"
              v-model="dataInfo.callback_full_url"
              readonly
            />
            <Button
              type="primary"
              style="margin-left: 10px;"
              v-if="dataInfo.callback_full_url"
              @click="copyText(dataInfo.callback_full_url)"
              >复制</Button
            >
            <Button
              type="primary"
              :disabled="dataInfo.authorize_status === 1"
              style="margin-left: 10px;"
              perm="express.operate"
              @click="getAuthorize"
            >
              {{
                dataInfo.authorize_status === 1
                  ? "已授权"
                  : dataInfo.authorize_status === -1
                  ? "重新授权"
                  : "授权"
              }}
            </Button>
          </FormItem>
        </div>
        <div>
          <verticalLineTitlebar title="发货设置" />
          <FormItem label="寄件人：" prop="sender_name">
            <Input
              style="width: 300px"
              v-model="dataInfo.sender_name"
              placeholder="请输入寄件人名称"
            />
          </FormItem>
          <FormItem label="电话：" prop="sender_tel">
            <Input
              style="width: 300px"
              v-model="dataInfo.sender_tel"
              placeholder="请输入电话"
            />
          </FormItem>
          <FormItem label="所在地区：" prop="area">
            <Cascader
              style="width: 300px"
              :transfer="true"
              :data="provinceArr"
              v-model="dataInfo.area"
            ></Cascader>
          </FormItem>
          <FormItem label="详细地址：" prop="address">
            <Input
              style="width: 300px"
              v-model="dataInfo.address"
              type="textarea"
              placeholder="请输入详细地址"
            />
          </FormItem>
        </div>
      </Form>
      <foot-button
        :loading="saveLoading"
        perm="express.operate"
        @onSaveClick="onSaveBtnClick"
      ></foot-button>
    </div>
    <Modal
      :mask-closable="false"
      title="授权"
      :width="540"
      v-model="modalStatus"
      @on-ok="onModalConfrimClick"
    >
      <div
        style="width: 430px;margin: auto;text-align: center;background: #f7fafc;"
      >
        <iframe
          style="height: 378px;display: block;margin: auto;"
          v-if="authorizeUrl"
          scrolling="no"
          :src="authorizeUrl"
          frameborder="0"
        ></iframe>
      </div>
    </Modal>
  </div>
</template>
<script>
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import footButton from "@/views/shop/components/button/foot-button.vue";
import cityDataThree from "@/views/shop/components/cityDataThree.js";
export default {
  components: {
    switchTitlebar,
    verticalLineTitlebar,
    footButton
  },
  data() {
    return {
      authorizeUrl: "",
      modalStatus: false,
      saveLoading: false,
      dataInfo: null,
      ruleValidate: {
        app_key: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value && value.trim()) {
                return callback();
              }
              return callback("请填写APP Key");
            }
          }
        ],
        app_secret: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value && value.trim()) {
                return callback();
              }
              return callback("请填写APP Secret");
            }
          }
        ],
        redirect_domain: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback("请选择域名");
            }
          }
        ],
        sender_name: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value && value.trim()) {
                return callback();
              }
              return callback("请填写寄件人");
            }
          }
        ],
        sender_tel: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value && value.trim()) {
                return callback();
              }
              return callback("请填写电话");
            }
          }
        ],
        area: [
          {
            required: true,
            type: "array",
            min: 1,
            trigger: "change",
            message: "请选择所在地区"
          }
        ],
        address: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value && value.trim()) {
                return callback();
              }
              return callback("请填写详细地址");
            }
          }
        ]
      },
      provinceArr: cityDataThree[0].provinceArr
    };
  },
  created() {
    this.getInfo();
  },
  methods: {
    onModalConfrimClick() {
      this.dataInfo = null;
      this.getInfo();
    },
    getAuthorize() {
      if (this.dataInfo.authorize_status === -1) {
        this.$httpPost("/shop/admin/express/setting/refresh/token", {}, res => {
          if (res.code === 200) {
            this.$Message.success("授权成功");
            this.$set(this.dataInfo, "authorize_status", 1);
          } else {
            this.$Message.error(res.msg);
          }
        });
      } else {
        this.$httpPost("/shop/admin/express/setting/authorize", {}, res => {
          if (res.code === 200) {
            this.authorizeUrl = res.data.url;
            this.modalStatus = true;
          } else {
            this.$Message.error(res.msg);
          }
        });
      }
    },
    /**
     * 复制
     */
    copyText(text) {
      var oInput = document.createElement("input");
      oInput.value = text;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.style.display = "none";
      document.body.removeChild(oInput);
      this.$Message.success("复制成功");
    },
    getInfo() {
      this.$store.state.COMMON_loading = true;
      this.$httpPost("/shop/admin/express/setting/info", {}, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          if (!res.data.redirect_domain) {
            res.data.callback_full_url = "";
          }
          this.dataInfo = Object.assign(
            {
              status: 0,
              app_key: "",
              app_secret: "",
              address: "",
              redirect_domain: "",
              area:
                res.data.prov && res.data.city && res.data.district
                  ? [
                      res.data.prov.toString(),
                      res.data.city.toString(),
                      res.data.district.toString()
                    ]
                  : []
            },
            res.data
          );
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    onSaveBtnClick() {
      if (this.dataInfo.status) {
        this.$refs.formValidate.validate(valid => {
          if (valid) {
            this.saveData();
          } else {
            this.$Message.error("保存失败");
          }
        });
      } else {
        this.saveData();
      }
    },
    saveData() {
      this.saveLoading = true;
      let {
        status,
        app_key,
        app_secret,
        address,
        redirect_domain,
        sender_name,
        sender_tel,
        area: [prov = null, city = null, district = null]
      } = this.dataInfo;
      this.$httpPost(
        "/shop/admin/express/setting/edit",
        {
          status,
          app_key,
          app_secret,
          prov,
          city,
          district,
          address,
          redirect_domain,
          sender_name,
          sender_tel
        },
        res => {
          this.saveLoading = false;
          if (res.code === 200) {
            this.$Message.success("保存成功");
            window.setTimeout(() => {
              this.dataInfo = null;
              this.getInfo();
            }, 100);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-express {
  padding: 24px;
  .marketing-express-head {
    display: flex;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #dcdee2;
    .marketing-express-head-left {
      display: flex;
      flex: 1;
      margin-right: 20px;
      img {
        display: block;
        margin-right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 4px;
      }
      & > div {
        color: #707070;
        font-size: 12px;
        & > div {
          &:nth-child(1) {
            line-height: 21px;
            font-size: 16px;
            margin-bottom: 13px;
          }
          &:nth-child(2) {
            line-height: 16px;
            margin-bottom: 4px;
          }
        }
        a {
          line-height: 16px;
        }
      }
    }
    .marketing-express-head-right {
      a {
        line-height: 16px;
        i {
          vertical-align: middle;
          font-size: 18px;
          margin-right: 2px;
        }
        span {
          vertical-align: middle;
        }
      }
    }
  }
  .marketing-express-content {
    /deep/input:read-only {
      background-color: #f5f6f7;
    }
    /deep/textarea {
      height: 56px;
    }
    /deep/.vertical-line-titlebar-wrapper {
      margin-bottom: 20px;
    }
    /deep/.ivu-form > div {
      padding-bottom: 24px;
    }
  }
}
</style>
