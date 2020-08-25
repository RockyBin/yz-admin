<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu"/>
    <div class="container">
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="106"
        class="merchant-add"
      >
        <div class="level-news">
          <verticalLineTitlebar :title="titles[0]"/>
          <div class="padding-form">
            <FormItem label="商户名称：" prop="store_name" class="margin-bottom-form">
              <i-input
                v-model="formValidate.store_name"
                class="common-input-text-310"
                placeholder="请输入商户名称"
                :maxlength="20"
              >
                <span slot="suffix" class="name-length">{{store_name_length}}/20</span>
              </i-input>
            </FormItem>
            <FormItem label="企业名称：" prop="company_name" class="margin-bottom-form">
              <i-input
                v-model="formValidate.company_name"
                class="common-input-text-310"
                placeholder="请输入企业名称"
                :maxlength="20"
              >
                <span slot="suffix" class="name-length">{{company_name_length}}/20</span>
              </i-input>
            </FormItem>
            
            <FormItem label="联系人：" prop="store_contacts" class="margin-bottom-form">
              <Input
                v-model="formValidate.store_contacts"
                class="common-input-text-310"
                placeholder="请输入联系人"
                :maxlength="20"
              />
            </FormItem>
            <FormItem label="电话：" prop="store_mobile" class="margin-bottom-form">
              <Input
                v-model="formValidate.store_mobile"
                class="common-input-text-310"
                placeholder="请输入联系电话"
                @on-change="limitLength('store_mobile',30)"
              />
            </FormItem>
            <FormItem label="地址：" prop="store_address" class="store_address margin-bottom-form">
              <Input
                type="textarea"
                :rows="3"
                :maxlength="50"
                v-model="formValidate.store_address"
                class="common-input-text-310"
                placeholder="请输入地址"
              />
            </FormItem>
          </div>
        </div>
        <div class="upgrade-conditions">
          <verticalLineTitlebar :title="titles[1]"/>
          <div class="padding-form">
            <FormItem label="收货人姓名：" prop="refunds_contacts" class="margin-bottom-form">
              <Input
                v-model="formValidate.refunds_contacts"
                class="common-input-text-310"
                placeholder="请输入收货人姓名"
                :maxlength="20"
              />
            </FormItem>
            <FormItem label="联系方式：" prop="refunds_mobile" class="margin-bottom-form">
              <Input
                v-model="formValidate.refunds_mobile"
                class="common-input-text-310"
                placeholder="请输入联系方式"
                @on-change="limitLength('refunds_mobile',30)"
              />
            </FormItem>
            <FormItem label="收货地址：" prop="refunds_address" class="margin-bottom-form">
              <Input
                v-model="formValidate.refunds_address"
                placeholder="请输入收货地址"
                type="textarea"
                :rows="3"
                :maxlength="50"
              />
            </FormItem>
            <FormItem label="退货说明：" prop="refunds_description" class="margin-bottom-form">
              <Input
                type="textarea"
                :rows="3"
                :maxlength="50"
                v-model="formValidate.refunds_description"
                placeholder="请输入退货说明"
              />
            </FormItem>
          </div>
        </div>
        <div class="level-news">
          <verticalLineTitlebar :title="titles[2]"/>
          <div class="padding-form">
            <FormItem label="联系方式：" prop="custom_mobile" class="margin-bottom-form">
              <Input
                v-model="formValidate.custom_mobile"
                class="common-input-text-310"
                placeholder="请输入客服联系方式"
                @on-change="limitLength('custom_mobile',30)"
              />
            </FormItem>
            <FormItem label="二维码：" class="margin-bottom-form" style="height: 42px;">
              <!-- <image-dragable
                v-model="qrcodeImage"
                :multiple="false"
              ></image-dragable> -->
              <show-big-img-upload 
                imgSize="40px"
                :InitImgURLs="formValidate.qrcode"
                v-model="qrcodeImage"
              ></show-big-img-upload>
            </FormItem>
          </div>
        </div>
      </Form>
      <div class="footer">
        <Button
          shape="circle"
          type="primary"
          @click="onSaveStart('formValidate')"
          perm="store.config.operate"
        >保存并启用</Button>
      </div>
    </div>
  </div>
</template>
<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
// import imageDragable from "@/views/shop/components/image-select/image-select-dragable.vue";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue"
let defaultFormData = {
  store_name: "",
  company_name: "",
  store_contacts: "",
  store_address: "",
  store_mobile: "",
  refunds_contacts: "",
  refunds_mobile: "",
  refunds_address: "",
  refunds_description: "",
  custom_mobile: "",
  qrcode: ""
};
export default {
  components: { 
    footButton, 
    verticalLineTitlebar, 
    thirdMenu, 
    // imageDragable, 
    showBigImgUpload 
  },
  data() {
    return {
      titles: ["商户资料", "售后收货设置", "客服联系"],
      qrcodeImage: [], // 二维码图片
      formValidate: defaultFormData,
      ruleValidate: {
        store_name: [
          { required: true, message: "请输入商户名称", trigger: "change" },
          {
            type: "string",
            message: "最多输入20个字",
            trigger: "blur"
          }
        ],
        company_name: [
          {
            type: "string",
            message: "最多输入20个字",
            trigger: "blur"
          }
        ],
        refunds_contacts: [
          { required: true, message: "请输入收货人姓名", trigger: "change" }
        ],
        refunds_mobile: [
          { required: true, message: "请输入联系方式", trigger: "change" }
        ],
        refunds_address: [
          { required: true, message: "请输入收货地址", trigger: "change" }
        ]
      },
      thirdMenu: []
    };
  },
  computed: {
    store_name_length: function() {
      return this.formValidate.store_name.length;
    },
    company_name_length: function() {
      return this.formValidate.company_name.length;
    }
  },
  methods: {
    // 保存
    async onSaveStart(name) {
      if (this.qrcodeImage[0] && typeof this.qrcodeImage[0] === 'object') {
        // 上传图片
        await new Promise((resolve) => {
          let formData = new FormData();
          formData.append("qrcode_img", this.qrcodeImage[0]);
          this.$httpPost("/shop/admin/storeconfig/uplode/qrcode", formData, res => {
            if (res.code === 200) {
              // 更新数据
              this.qrcodeImage = [this.$store.state.siteComdataPath + res.data.qrcode];
              this.formValidate.qrcode = res.data.qrcode;
              resolve();
            } else {
              this.$Message.error(res.msg);
            }
          })
        })
      } else if (!this.qrcodeImage.length) {
        // 清除数据
        this.formValidate.qrcode = null;
      }
      // 保存数据
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$httpPost(
            "/shop/admin/storeconfig/edit",
            this.formValidate,
            res => {
              if (res.code === 200) {
                this.$Message.success("保存成功");
                this.getData();
              } else {
                this.$Message.success(res.msg);
              }
            }
          );
        }
      });
    },
    // 获取数据
    getData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/storeconfig/info", "", res => {
        this.$store.state.COMMON_loading = false;
        this.formValidate = Object.assign(
          {},
          ...Object.keys(defaultFormData).map(item => {
            return {
              [item]:
                res.data[item] !== null ? res.data[item] : defaultFormData[item]
            };
          })
        );
        this.formValidate.qrcode && (this.qrcodeImage = [this.$store.state.siteComdataPath + this.formValidate.qrcode]);
      });
    },
    limitLength(prop, length) {
      this.$nextTick(() => {
        this.formValidate[prop] = this.formValidate[prop].substring(0, length);
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
  height: calc(100vh - 132px);
  background: #f2f4fd;
  display: flex;
  .container {
    height: 100%;
    flex: 1;
  }
}
.container {
  .merchant-add {
    padding: 24px 0 16px 24px;
    text-align: left;
    overflow: hidden;
    height: calc(100vh - 120px);
    overflow: auto;
    background: white;
    .level-news {
      /deep/.ivu-form-item-label {
        width: 120px;
      }
      /deep/.image-select-dragable {
        width: 200px;
        padding-bottom: 0;
        .image-select-dragable-content {
          margin-bottom: 0;
          .image-select-dragable-dragable-add {
            margin-bottom: 0;
          }
          .image-select-dragable-list {
            width: 42px;
            height: 42px;
            margin-bottom: 0;
            .image-select-dragable-item {
              height: 40px;
              width: 40px;
              .ivu-upload-drag {
                height: 40px;
              }
            }
          }
        }
        
        .upload-file {
          .image-select-dragable-dragable-add-content .iconfont {
            font-size: 20px;
          }
          .image-select-dragable-dragable-add-content {
            height: 40px;
            width: 40px;
            line-height: 40px;
          }
        } 
      }
    }
    .upgrade-conditions {
      /deep/.ivu-form-item-label {
        width: 120px;
      }
      /deep/.ivu-radio {
        margin-right: 8px;
      }
      /deep/.ivu-input-wrapper {
        textarea {
          width: 310px;
        }
      }
    }
    /deep/.ivu-input-wrapper {
      textarea {
        width: 310px;
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    }
    /deep/.ivu-input-suffix {
      width: 40px;
      text-align: center;
    }
    /deep/.ivu-input-with-suffix {
      padding-right: 40px;
    }
    .store_address{
      /deep/.common-input-text-310{
        height:auto;
      }
    }
    .name-length {
      color: #999999;
      font-size: 12px;
      line-height: 32px;
    }
  }
}
  .footer{
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #eee;
    background: white;
    button{
      width: 100px;
    }
  }
</style>
