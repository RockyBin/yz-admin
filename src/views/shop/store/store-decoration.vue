<template>
  <div class="container">
    <Tabs v-model="tabSelect" :animated="false" name="decoration">
      <TabPane label="主页" :name="tabName[0]">
        <div class="store-decoration">
          <div
            class="store-decoration-welcome"
            v-if="!$store.state.hasHomePage"
          >
            <div class="store-decoration-welcome-title">
              hello，请创建您的店铺
            </div>
            <div class="store-decoration-welcome-content">
              <div class="store-decoration-welcome-item">
                <img
                  :src="require('@/views/shop/css/images/ios-image.png')"
                  alt
                />
                <div class="store-decoration-welcome-item-type">
                  快速创建模式
                </div>
                <div class="store-decoration-welcome-item-desc">
                  选择此模式，安装行业模板，只需做小修改就可快速
                  创建出美观的商城
                </div>
                <div class="store-decoration-welcome-item-button">
                  <Button type="primary" ghost shape="circle">选择</Button>
                  <Button
                    type="primary"
                    shape="circle"
                    @click="onQuickModuleClick"
                    >选择</Button
                  >
                </div>
              </div>
              <div class="store-decoration-welcome-between">或</div>
              <div class="store-decoration-welcome-item">
                <img
                  :src="
                    require('@/views/shop/css/images/zujian-zuoyouhuadongtu.png')
                  "
                  alt
                />
                <div class="store-decoration-welcome-item-type">自定义模式</div>
                <div class="store-decoration-welcome-item-desc">
                  选择此模式，您可以对界面做个性化的操作，打造出
                  属于您独一无二的商城
                </div>
                <div class="store-decoration-welcome-item-button">
                  <Button
                    type="primary"
                    ghost
                    shape="circle"
                    :loading="selectLoading"
                    >选择</Button
                  >
                  <Button
                    type="primary"
                    shape="circle"
                    :loading="selectLoading"
                    @click="onCustomModuleClick"
                    >选择</Button
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="store-decoration-view" v-else>
            <div class="store-decoration-view-iframe">
              <div class="phone-container">
                <div class="phone-head">
                  <img src="images/mobile-top.jpg" />
                  <div class="page-name">
                    {{ homePageInfo.title ? homePageInfo.title : "店铺主页" }}
                  </div>
                </div>
                <div class="phone-body">
                  <iframe
                    v-if="pageUrl"
                    :src="pageUrl"
                    frameborder="0"
                    scrolling="no"
                    width="100%"
                    height="100%"
                  ></iframe>
                  <div class="mask"></div>
                </div>
              </div>
            </div>
            <div class="store-decoration-view-btn">
              <div class="store-decoration-view-btn-content">
                <Button
                  type="primary"
                  shape="circle"
                  @click="onEditHomeClick"
                  perm="page.operate"
                  >编辑主页</Button
                >
              </div>
              <div class="store-decoration-view-btn-content">
                <Button
                  type="primary"
                  ghost
                  shape="circle"
                  @click="onPreviewHomeClick"
                  >预览</Button
                >
              </div>
              <div class="store-decoration-view-btn-content">
                <Poptip
                  v-model="poptipShow"
                  @on-popper-show="onShowPoptip"
                  placement="right-start"
                  :word-wrap="true"
                  :transfer="true"
                  padding="15px 22px"
                >
                  <Button type="primary" ghost shape="circle">推广</Button>
                  <div slot="content" :style="{ textAlign: 'left' }">
                    <div :style="{ marginBottom: '10px' }">商城主页推广链接</div>
                    <Icon
                      type="md-close"
                      @click="poptipShow = false"
                      style="position:absolute;top:10px;right:15px;font-size:20px;cursor:pointer"
                    ></Icon>
                    <div
                      style="margin-bottom:30px;display:flex;align-items: flex-end;"
                    >
                      <Input
                        :value="pageUrl"
                        :readonly="true"
                        style="width:244px"
                      />
                      <Button
                        type="primary"
                        style="height:32px;margin-left:5px"
                        @click="copyLinkUrl(pageUrl)"
                        >复制</Button
                      >
                    </div>
                    <div style="margin-bottom:20px">推广二维码</div>
                    <div>
                      <canvas ref="canvas"></canvas>
                    </div>
                  </div>
                </Poptip>
              </div>
            </div>
          </div>
        </div>
      </TabPane>
      <TabPane label="分类页" :name="tabName[1]">
        <div
          style="padding:24px;height:calc(100vh - 60px - 50px - 60px);overflow:auto"
        >
          <div class="product-class-view">
            <div style="line-height:32px;margin-bottom:20px;">
              <span style="font-size:16px;font-weight:bold">分类模板</span
              ><span
                >（当前使用<span style="color:red"> {{ titleTempID }} </span
                >）</span
              >
            </div>
            <div style="overflow:hidden;">
              <div class="product-class-preview">
                <img
                  style="    width: 100%;height: 535px;border: 1px solid #E9EBF2"
                  :src="
                    require(`@/views/shop/images/temp${productClassFormItem.tempID}.jpg`)
                  "
                />
                <div style="margin-top:16px;">模板示例效果图</div>
              </div>
              <div class="product-class-form">
                <Form
                  :label-width="80"
                  :model="productClassFormItem"
                  style="margin-top:30px;margin-left:30px;"
                >
                  <div>
                    <FormItem label="开启功能：">
                      <CheckboxGroup
                        v-model="productClassFormItem.relativeFunction"
                      >
                        <Checkbox label="search">
                          <span>顶部搜索栏</span></Checkbox
                        >
                        <Checkbox label="allproduct">
                          <span>全部商品</span></Checkbox
                        >
                      </CheckboxGroup>
                    </FormItem>
                  </div>
                  <div class="product-class-form-select-temp">
                    <FormItem label="选择模板：">
                      <span style="float:left"></span>
                      <RadioGroup
                        style="display:flex;width:380px;flex-wrap:wrap;"
                        v-model="productClassFormItem.tempID"
                      >
                        <div
                          class="product-calss-form-fixed"
                          @click="onSelectPageClick(1)"
                        >
                          <img
                            class="product-class-form-img"
                            :src="require('@/views/shop/images/temp1.jpg')"
                            alt
                          />
                          <Radio :label="1" class="product-class-form-Radio"
                            ><span>模板一</span></Radio
                          >
                        </div>
                        <div
                          class="product-calss-form-fixed"
                          @click="onSelectPageClick(2)"
                        >
                          <img
                            class="product-class-form-img"
                            :src="require('@/views/shop/images/temp2.jpg')"
                            alt
                          />
                          <Radio :label="2" class="product-class-form-Radio"
                            ><span>模板二</span></Radio
                          >
                        </div>
                        <div
                          class="product-calss-form-fixed"
                          @click="onSelectPageClick(3)"
                        >
                          <img
                            class="product-class-form-img"
                            :src="require('@/views/shop/images/temp3.jpg')"
                            alt
                          />
                          <Radio :label="3" class="product-class-form-Radio"
                            ><span>模板三</span></Radio
                          >
                        </div>
                        <div
                          class="product-calss-form-fixed"
                          @click="onSelectPageClick(4)"
                        >
                          <img
                            class="product-class-form-img"
                            :src="require('@/views/shop/images/temp4.jpg')"
                            alt
                          />
                          <Radio :label="4" class="product-class-form-Radio"
                            ><span>模板四</span></Radio
                          >
                        </div>
                        <div
                          class="product-calss-form-fixed"
                          @click="onSelectPageClick(5)"
                        >
                          <img
                            class="product-class-form-img"
                            :src="require('@/views/shop/images/temp5.jpg')"
                            alt
                          />
                          <Radio :label="5" class="product-class-form-Radio"
                            ><span>模板五</span></Radio
                          >
                        </div>
                        <div
                          class="product-calss-form-fixed"
                          @click="onSelectPageClick(6)"
                        >
                          <img
                            class="product-class-form-img"
                            :src="require('@/views/shop/images/temp6.jpg')"
                            alt
                          />
                          <Radio :label="6" class="product-class-form-Radio"
                            ><span>模板六</span></Radio
                          >
                        </div>
                      </RadioGroup>
                    </FormItem>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
        <div class="action-bar">
          <Button
            class="btn-save"
            type="primary"
            shape="circle"
            @click="saveProductClassForm"
            perm="nav.operate"
            >保存并发布</Button
          >
        </div>
      </TabPane>
      <TabPane label="个人中心" :name="tabName[2]">
        <div class="store-decoration">
          <div class="store-decoration-view">
            <div class="store-decoration-view-iframe">
              <div class="phone-container">
                <div class="phone-head">
                  <img src="images/mobile-top.jpg" />
                  <div class="page-name">
                    {{ pageInfo.title ? pageInfo.title : "会员中心" }}
                  </div>
                </div>
                <div
                  class="phone-body"
                  style="overflow-y: auto;background: #f7f7f7;"
                >
                  <module-render
                    :modules="modules"
                    style="overflow: hidden;"
                    :class="
                      'theme-color ' +
                        (memberInfo.color_config
                          ? 'theme-color-' + memberInfo.color_config
                          : '')
                    "
                    :editMode="false"
                    :memberInfo="memberInfo"
                  ></module-render>
                </div>
              </div>
            </div>
            <div class="store-decoration-view-btn">
              <div class="store-decoration-view-btn-content">
                <Button
                  type="primary"
                  shape="circle"
                  @click="$router.push({ name: 'storeDesignMemberMobile' })"
                  perm="page.operate"
                  >编辑个人中心</Button
                >
              </div>
            </div>
          </div>
        </div>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import "@/views/shop/css/iconfont-front/iconfont.css";
const tabName = ["main-nav", "product-class", "member-center"];
import ModuleRender from "./design/components/modules-mobi-for-render/module-render";
import memberMixin from "./design/components/mixin-member-center.js";
import QRCode from "qrcode";
export default {
  components: {
    ModuleRender,
    QRCode
  },
  mixins: [memberMixin],
  data() {
    return {
      homePageInfo: {},
      tabName,
      tabSelect: tabName[Number(this.$route.query.tab)] || tabName[0],
      pageUrl: "",
      selectLoading: false,
      productClassFormItem: {
        tempID: 1,
        relativeFunction: []
      },
      pageInfo: {
        id: 0,
        title: "会员首页"
      },
      titleTempID: "模板一",
      chinaLevel: ["一", "二", "三", "四", "五", "六"],
      productClassPreviewSrc: "@/views/shop/images/temp1.jpg",
      poptipShow: false
    };
  },
  created() {
    this.getHomePageInfo();
    this.getProductClassFormInfo();
    this.loadMemberpageInfo();
  },
  watch: {
    tabSelect() {
      this.$router.replace({
        name: "storeDecoration",
        query: {
          tab: tabName.findIndex(n => n === this.tabSelect)
        }
      });
    }
  },
  mounted() {
    var domain = location.host;
    if (domain.indexOf("localhost") > -1 || !domain) {
      domain = "shop.test.72dns.net";
    }
    this.pageUrl = "http://" + domain + "/shop/front/";
  },
  methods: {
    /**
     * 选择模板
     */
    onSelectPageClick(index) {
      this.productClassFormItem.tempID = index;
    },
    /**
     * 获取主页信息
     */
    getHomePageInfo() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/ui/design/mobile/page/home"
        })
          .then(res => {
            if (res.code === 200) {
              this.$store.state.hasHomePage = !!res.data.page;
              this.homePageInfo = res.data.page || {};
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
    onCustomModuleClick() {
      this.selectLoading = true;
      this.$httpGet(
        "/shop/admin/ui/design/mobile/page/add/blank",
        null,
        res => {
          this.selectLoading = false;
          if (res.code === 200) {
            this.$router.push({
              name: "storeDesignMobile",
              query: { id: res.data.id }
            });
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onQuickModuleClick() {
      this.$router.push({
        name: "storeTemplate"
      });
    },
    onEditHomeClick() {
      this.$router.push({
        name: "storeDesignHomeMobile"
      });
    },
    onPreviewHomeClick() {
      window.open("preview.html");
    },
    getProductClassFormInfo() {
      this.$httpGet("/shop/admin/storeconfig/info", null, res => {
        if (res.code === 200) {
          var data = res.data.product_class_setting;
          if (data) {
            this.$nextTick(() => {
              this.productClassFormItem.tempID = data.tempID;
            });
            this.titleTempID = "模板" + this.chinaLevel[data.tempID - 1];
            this.productClassFormItem.relativeFunction = [];
            if (data.relativeFunction.search == 1)
              this.productClassFormItem.relativeFunction.push("search");
            if (data.relativeFunction.allproduct == 1)
              this.productClassFormItem.relativeFunction.push("allproduct");
          }
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    saveProductClassForm() {
      var relativeFunction = { search: 0, allproduct: 0 };
      if (this.productClassFormItem.relativeFunction.length > 0) {
        this.productClassFormItem.relativeFunction.forEach(item => {
          if (item == "search") relativeFunction.search = 1;
          if (item == "allproduct") relativeFunction.allproduct = 1;
        });
      }
      let obj = JSON.parse(JSON.stringify(this.productClassFormItem));
      obj.relativeFunction = relativeFunction;
      this.$httpPost(
        "/shop/admin/storeconfig/edit",
        { product_class_setting: JSON.stringify(obj) },
        res => {
          if (res.code === 200) {
            this.$Message.success("保存成功");
            this.getProductClassFormInfo();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 复制页面链接
     */
    copyLinkUrl(url) {
      var oInput = document.createElement("input");
      oInput.value = url;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.style.display = "none";
      document.body.removeChild(oInput);
      this.$Message.success("复制成功");
    },
    onShowPoptip() {
      var canvas = this.$refs.canvas;
      QRCode.toCanvas(canvas, this.pageUrl, { margin: 1 }, function(error) {
        if (error) console.error(error);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-tabs {
  /deep/.ivu-tabs-bar {
    margin-bottom: 0;
    .ivu-tabs-nav-scroll {
      // padding-left: 24px;
    }
  }
}

.store-decoration {
  text-align: center;
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
          text-align: left;
          text-align: justify;
          margin-top: 16px;
        }
        .store-decoration-welcome-item-button {
          border-radius: 20px;
          width: 90px;
          height: 40px;
          display: inline-block;
          margin-top: 27px;
          button {
            width: 90px;
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
    height: calc(100vh - 144px);
    text-align: left;
    padding: 24px;
    .store-decoration-view-iframe {
      height: calc(100vh - 204px);
      width: 377px;
      display: inline-block;
      position: relative;
      .phone-container {
        display: flex;
        flex-direction: column;
        border: 1px solid #efefef;
        height: 100%;
        .phone-head {
          width: 100%;
          position: relative;
          .page-name {
            position: absolute;
            width: 100%;
            top: 30px;
            text-align: center;
            font-size: 16px;
          }
        }
        .phone-body {
          flex: 1;
          position: relative;
          .mask {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: 99;
          }
        }
      }
    }
    .store-decoration-view-btn {
      display: inline-block;
      vertical-align: top;
      padding: 34px 42px;
      .store-decoration-view-btn-content {
        height: 34px;
        border-radius: 17px;
        margin-bottom: 17px;
        button {
          min-width: 90px;
          height: 34px;
        }
      }
    }
    .theme-color {
      // 遮罩层
      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
      &.theme-color-red {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #fd4d66, #fe3737) !important;
        }
      }
      &.theme-color-orange {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #ff9602, #ff5407) !important;
        }
      }
      &.theme-color-blue {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #2dadfc, #637bfb) !important;
        }
      }
      &.theme-color-green {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #86d677, #05c160) !important;
        }
      }
      &.theme-color-golden {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #e0bb7e, #cd9038) !important;
        }
      }
      &.theme-color-pink {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #ff4aad, #ff1269) !important;
        }
      }
      &.theme-color-black {
        /deep/.theme-gr-bg-color {
          background: linear-gradient(to right, #333333, #000000) !important;
        }
      }
    }
  }
}
.product-class-view {
  color: #333;
  .product-class-form {
    height: 538px;
    width: 500px;
    background-color: #f8f9fb;
    float: left;
    border-radius: 5px;
  }
  .product-class-form-img {
    height: 158px;
    width: 88px;
    border: 1px solid #f2f2f2;
  }
  .product-calss-form-fixed {
    width: 88px;
    margin-left: 41px;
    text-align: center;
    cursor: pointer;
  }
  .product-class-form-select-temp {
    /deep/.ivu-form-item-content {
      line-height: 0px;
    }
  }
  .product-calss-form-fixed:nth-child(3n-2) {
    margin-left: 0px;
  }
  .product-calss-form-fixed:nth-child(n + 4) {
    margin-top: 26px;
  }
  .product-class-form-Radio {
    margin-top: 12px;
  }
  /deep/.ivu-checkbox-group-item {
    display: block;
  }
  .product-class-preview {
    height: 100%;
    width: 301px;
    float: left;
    margin-right: 24px;
    text-align: center;
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
  width: 100px;
  height: 34px;
}
</style>
