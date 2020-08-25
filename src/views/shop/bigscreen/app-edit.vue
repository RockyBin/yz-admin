<template>
  <div class="container">
    <Tabs value="main-nav">
      <TabPane label="广告屏APP编辑" name="main-nav">
        <div class="store-decoration" v-if="done">
          <div class="store-decoration-view">
            <div class="store-decoration-view-iframe">
              <div class="phone-container">
                <img class="background" src="images/ad-screen.png" />
                <img v-if="logoSrc" class="applogo" :src="logoSrc" />
              </div>
            </div>
            <div class="store-decoration-view-btn property-container">
              <h3>
                <span>页面设置</span>
              </h3>
              <Form
                ref="form"
                :model="appInfo"
                :rules="ruleValidate"
                :label-width="86"
              >
                <FormItem label="APP名称：" prop="name" class="margin-bottom-form">
                  <Input
                    v-model="appInfo.name"
                    class="common-input-text-310"
                    placeholder="请输入APP名称"
                    :maxlength="6"
                    style="width:236px;"
                  >
                    <span slot="suffix">{{appInfo.name ? appInfo.name.length:0}}/6</span>
                  </Input>
                </FormItem>
                <FormItem label="域名选择：" prop="domain" class="margin-bottom-form">
                  <Select v-model="appInfo.domain" style="width:236px">
                    <Option
                      v-for="(item, index) in appInfo.domains"
                      :value="item.domain"
                      :key="index"
                    >{{ item.domain }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="APP图标：" prop="logo" class="margin-bottom-form">
                  <div class="app-form-item-container">
                    <show-big-img-upload
                      imgSize="44px"
                      :class="{'has-error': imageIsError}"
                      :InitImgURLs="appLogo"
                      :useFilesSelector="true"
                      v-model="appInfo.logo"
                    ></show-big-img-upload>
                    <span class="imgtips">建议尺寸：96*96像素</span>
                  </div>
                </FormItem>
                <FormItem label="APP启动图：" prop="lunch_image" class="margin-bottom-form">
                  <div class="app-form-item-container">
                    <show-big-img-upload
                      class="start-up"
                      imgSize="44px"
                      :class="{'has-error': imageIsError}"
                      :InitImgURLs="lunchImage"
                      :useFilesSelector="true"
                      v-model="appInfo.lunch_image"
                    ></show-big-img-upload>
                    <span class="imgtips">建议尺寸：1080*1920像素</span>
                  </div>
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </TabPane>
    </Tabs>
    <div class="action-bar">
      <Button
        class="btn-save"
        type="primary"
        shape="circle"
        @click="submit"
        perm="bigscreen.app.operate"
      >保存并生成APP</Button>
    </div>
  </div>
</template>
<script>
import "@/views/shop/css/iconfont-front/iconfont.css";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
export default {
  components: { showBigImgUpload },
  data() {
    return {
      done: false,
      appInfo: {
        id: 0,
        name: "",
        domain: "",
        logo: "",
        lunch_image: ""
      },
      appLogo: "",
      lunchImage: "",
      imageIsError: false,
      ruleValidate: {
        name: [
          { required: true, message: "请输入APP名称", trigger: "change" }
        ],
        // domain: [{ required: true, message: "请选择域名", trigger: "change" }],
        logo: [
          {
            required: true,
            validator: (rule, image, callback) => {
              if (image.length) {
                this.imageIsError = false;
                return callback();
              }
              this.imageIsError = true;
              return callback(new Error("请上传APP图标"));
            }
          }
        ],
        lunch_image: [
          {
            required: true,
            validator: (rule, image, callback) => {
              if (image.length) {
                this.imageIsError = false;
                return callback();
              }
              this.imageIsError = true;
              return callback(new Error("请上传APP启动图"));
            }
          }
        ]
      }
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getAppInfo();
  },
  computed: {
    logoSrc() {
      if (Array.isArray(this.appInfo.logo)) {
        if (this.appInfo.logo[0] instanceof Object) return URL.createObjectURL(this.appInfo.logo[0]);
        else return this.appInfo.logo[0];
      } else {
        return this.appInfo.logo;
      }
    }
  },
  methods: {
    /**
     * 获取APP信息
     */
    getAppInfo() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/mobileapp/get?device_type=2"
        })
          .then(res => {
            if (res.code === 200) {
              this.done = true;
              this.$store.state.COMMON_loading = false;
              this.appInfo = res.data || {};
              this.appInfo.domain = this.appInfo.domains[0].domain;
              this.appLogo = this.appInfo.logo;
              this.lunchImage = this.appInfo.lunch_image;
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(() => {
            this.$Message.error("获取数据失败");
          })
          .finally(() => {
            resolve();
          });
      });
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saveAppInfo();
        } else {
          this.$Message.error("保存失败");
        }
      });
    },
    /**
     * 保存APP信息
     */
    saveAppInfo() {
      let formData = new FormData();
      formData.append("id", this.appInfo.id);
      formData.append("logo", this.appInfo.logo[0]);
      formData.append("lunch_image", this.appInfo.lunch_image[0]);
      formData.append("name", this.appInfo.name);
      formData.append("domain", this.appInfo.domain);
      this.$store.state.COMMON_loading = true;
      this.$httpUpload(
        "/shop/admin/mobileapp/save?device_type=2",
        formData,
        res => {
          console.log(res);
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            this.$Message.success("App生成成功");
            this.$router.push({ name: "bigscreenApp" });
          } else {
            this.$Message.error("保存失败");
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
@import "./property-container.less";
/deep/.ivu-tabs {
  height: calc(100vh - 122px);
}
.store-decoration {
  color: #333;
  .store-decoration-welcome {
    .store-decoration-welcome-title {
      font-size: 32px;
      padding: 80px 0;
    }
    .store-decoration-welcome-content {
      img {
        display: block;
      }
      .store-decoration-welcome-item {
        width: 338px;
        display: inline-block;
        vertical-align: top;
        .store-decoration-welcome-item-type {
          font-size: 18px;
          margin-top: 22px;
        }
        .store-decoration-welcome-item-desc {
          color: #999;
          font-size: 14px;
          text-align: center;
          margin-top: 16px;
        }
        .store-decoration-welcome-item-button {
          border-radius: 20px;
          width: 100px;
          height: 40px;
          display: inline-block;
          margin-top: 27px;
          button {
            width: 100px;
            height: 40px;
            font-size: 16px;
            &:not(.ivu-btn-ghost) {
              display: none;
            }
          }
          &:hover {
            button {
              display: none;
              &:not(.ivu-btn-ghost) {
                display: inline-block;
              }
            }
          }
        }
      }
      .store-decoration-welcome-between {
        display: inline-block;
        width: 106px;
        font-size: 24px;
        padding-top: 90px;
        vertical-align: top;
      }
    }
  }
  .store-decoration-view {
    display: flex;
    align-items: stretch;
    height: calc(100vh - 170px);
    background: #F2F4FD;
    .store-decoration-view-iframe {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      .phone-container {
        width: 294px;
        position: relative;
        .background {
          width: 294px;
          object-fit: contain;
        }
        .applogo {
          width: 40px;
          height: 40px;
          position: absolute;
          top: 115px;
          left: 75px;
          border-radius: 5px;
        }
      }
    }
    .store-decoration-view-btn {
      width: 362px;
      background: white;
      /deep/.ivu-form {
        padding: 20px;
      }
      .store-decoration-view-btn-content {
        height: 34px;
        border-radius: 17px;
        margin-bottom: 17px;
        button {
          min-width: 90px;
          height: 34px;
        }
      }
      .app-form-item-container {
        display: flex;
        align-items: flex-end;
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
        .start-up {
          /deep/.img-wrapper {
            height: 79px !important;
            img {
              height: 77px !important;
              object-fit: fill;
            }
          }
        }
        /deep/.show-big-img-upload {
          display: inline-block;
          .ivu-icon-md-add {
            font-size: 12px !important;
          }
        }
        .imgtips {
          color: #9EA4B1;
          line-height: normal;
        }
      }
      /deep/.ivu-form-item-label {
        width: 120px;
      }
      /deep/.ivu-input-suffix {
        right: 5px;
        line-height: 32px;
      }
    }
  }
}
.action-bar {
  height: 50px;
  width: 100%;
  line-height: 50px;
  background: white;
  text-align: center;
  border-top: 1px solid #ebebeb;
}
.action-bar .ivu-btn-primary {
  width: 119px;
  height: 30px;
}
</style>
