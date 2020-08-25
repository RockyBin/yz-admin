<template>
  <div class="product-detail" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false" name="liveEdit">
      <TabPane
        :label="
          () => {
            return $createElement('div', `基础设置`);
          }
        "
        :index="1"
        :name="tabChangeArray[0]"
        tab="liveEdit"
      >
        <live-base
          ref="liveBase"
          :liveInfo="liveInfo"
          :verifyTime="verifyTime"
          v-model="formValidateBase"
        ></live-base>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `视频设置`);
          }
        "
        :index="2"
        :name="tabChangeArray[1]"
        tab="liveEdit"
      >
        <live-video
          ref="liveVideo"
          :loadingVideo="loadingVideo"
          v-model="formValidateVideo"
          :liveInfo="liveInfo"
        ></live-video>
      </TabPane>
      <TabPane
        class="product-detail-tabpane-graphic"
        :label="
          () => {
            return $createElement('div', `样式设置`);
          }
        "
        :index="3"
        :name="tabChangeArray[2]"
        tab="liveEdit"
      >
        <live-styles
          :disableChange="productDiableChange"
          ref="liveStyles"
          v-model="formValidateStyles"
        ></live-styles>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `商品`);
          }
        "
        :index="4"
        :name="tabChangeArray[3]"
        tab="liveEdit"
      >
        <live-products
          v-model="formValidateProducts.product"
          :product_list="product_list"
          ref="liveProducts"
        ></live-products>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `优惠券`);
          }
        "
        :index="5"
        :name="tabChangeArray[4]"
        tab="liveEdit"
      >
        <live-coupon
          ref="liveCoupon"
          v-model="formValidateCoupon.coupon"
          :coupon_list="coupon_list"
        ></live-coupon>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `公告`);
          }
        "
        :index="6"
        :name="tabChangeArray[5]"
        tab="liveEdit"
      >
        <live-announcement
          v-model="formValidateAnnouncement"
          ref="liveAnnouncement"
        ></live-announcement>
      </TabPane>
    </Tabs>

    <foot-button>
      <div class="product-detail-foot-button">
        <Button
          type="primary"
          :loading="saveLoading"
          @click="onProductDetailSave()"
          perm="live.operate"
          >保存</Button
        >
        <Button
          @click="$router.push({ name: 'liveManage' })"
          style="position: absolute;margin-left: 12px;left: 0;top: 50%;transform: translateY(-50%);border-radius: 5px;"
          perm="live.view"
        >
          <i class="iconfont icon-m-menu" style="vertical-align: middle;"></i>
          <span style="vertical-align: middle;margin-left:4px;"
            >返回直播间管理</span
          >
        </Button>
      </div>
    </foot-button>
  </div>
</template>
<script>
import liveBase from "./components/live-setting-base.vue";
import liveStyles from "./components/live-setting-styles.vue";
import liveVideo from "./components/live-setting-video.vue";
import liveAnnouncement from "./components/live-setting-announcement.vue";
import liveCoupon from "./components/live-setting-coupon.vue";
import liveProducts from "./components/live-setting-products.vue";
import footButton from "@/views/shop/components/button/foot-button.vue";
const tabChangeArray = [
  "liveBase",
  "liveVideo",
  "liveStyles",
  "liveProducts",
  "liveCoupon",
  "liveAnnouncement"
];
export default {
  components: {
    liveBase,
    liveStyles,
    liveVideo,
    liveAnnouncement,
    liveCoupon,
    liveProducts,
    footButton
  },
  data() {
    return {
      liveId: 0,
      liveInfo: {}, //原始的从数据库加载到的直播信息
      finish: false,
      imageArrow: require("@/views/shop/css/images/arrow-left.png"),
      saveLoading: false,
      skuValidSet: {},
      verifyTime: false,
      loadingVideo: false, //是否正在获取视频地址
      maxCommision: 0, // 最大分佣比例
      productDiableChange: false,
      product_list: [],
      coupon_list: [],
      formValidateBase: {
        sort: null,
        title: "",
        intro: "",
        expected_live_time: "",
        live_nickname: "",
        live_headurl: "", //直播员头像
        list_poster: "", //直播广场封面
        base_hits: null, //观看人数基数
        live_helper_name: "直播助手", //直播助手昵称
        show_live_list: 1 //直播广场显示
      },
      formValidateAnnouncement: {
        notice: "",
        notice_link: ""
      },
      formValidateVideo: {
        live_platform: null, // 第三方直播平台
        live_src: "", // 第三方直播地址
        open_vod: 0, // 是否开启会放
        vod_src: "" //回播地址
      },
      formValidateProducts: {
        product: []
      },
      formValidateCoupon: {
        coupon: []
      },
      formValidateStyles: {
        live_style: 0,
        live_poster: "", //直播间封面
        button_display: [1, 2, 3, 4, 5, 6, 7], // 全屏默认显示
        menu_display: [9, 4, 5], // 半屏菜单默认显示
        nav_list: [
          {
            nav_type: 0,
            button_name: "关注",
            name: "关注",
            link_type: 0,
            images: ""
          },
          {
            nav_type: 0,
            name: "更多直播",
            button_name: "更多直播",
            link_type: 1
          },
          {
            nav_type: 0,
            name: "商城主页",
            button_name: "商城主页",
            link_type: 2
          },
          {
            nav_type: 0,
            name: "评论",
            button_name: "评论",
            link_type: 3
          },
          {
            nav_type: 0,
            name: "商品",
            button_name: "商品",
            link_type: 4
          },
          {
            nav_type: 0,
            name: "优惠券",
            button_name: "优惠券",
            link_type: 5
          },
          {
            nav_type: 0,
            name: "点赞",
            button_name: "点赞",
            link_type: 6
          },
          {
            nav_type: 0,
            name: "分享",
            button_name: "分享",
            link_type: 7
          },
          {
            nav_type: 0,
            name: "自定义",
            button_name: "自定义",
            link_type: 8,
            extra_params: {
              type: 1,
              context: "",
              navigationImage: ""
            }
          }
        ],
        menu_list: [
          {
            nav_type: 1,
            name: "互动",
            button_name: "互动",
            link_type: 9
          },
          {
            nav_type: 1,
            name: "商品",
            button_name: "商品",
            link_type: 4
          },
          {
            nav_type: 1,
            name: "优惠券",
            button_name: "优惠券",
            link_type: 5
          }
        ]
      },
      tabChangeFlag: tabChangeArray[0],
      tabChangeArray: tabChangeArray,
      checkFormObject: {},
      imagePath: "",
      imagePath1: "",
      imagePath2: "",
      imagePath3: "",
      imagePath4: ""
    };
  },
  computed: {
    tabIndex() {
      return this.tabChangeArray.findIndex(el => el === this.tabChangeFlag);
    }
  },
  mounted() {
    // 添加需要验证的form表单
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "liveBase"),
      this.$refs["liveBase"].$refs["formValidateBase"]
    );
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "liveVideo"),
      this.$refs["liveVideo"].$refs["formValidateVideo"]
    );
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "liveStyles"),
      this.$refs["liveStyles"].$refs["formValidateStyles"]
    );

    this.liveId = this.$route.query.live_id
      ? Number(this.$route.query.live_id)
      : 0;
    this.$store.state.COMMON_loading = true;
    this.getProductInfo();
  },
  methods: {
    //根据某一值排序
    sortId(a, b) {
      let list = [0,1, 2, 3, 4, 5, 6, 7, 8,];
      return list.indexOf(a.link_type) - list.indexOf(b.link_type);
    },
    sortLinkType(a, b) {
      let list = [9, 4, 5, 8];
      return list.indexOf(a.link_type) - list.indexOf(b.link_type);
    },
    /**
     * 获取商品数据
     */
    getProductInfo() {
      if (this.liveId) {
        this.$httpGet("/shop/admin/live/info", { id: this.liveId }, res => {
          if (res.code != 200) {
            this.$Message.error(res.msg);
            this.$router.push({
              name: "liveManage"
            });
            this.$store.state.COMMON_loading = false;
            return;
          }
          this.product_list = [];
          this.coupon_list = [];
          if (res.data.productList.length) {
            res.data.productList.forEach(item => {
              item.product &&
                this.product_list.push({
                  id: item.id,
                  product_id: item.product.id,
                  type: item.product.type
                });
            });
          }
          if (res.data.couponList.length) {
            res.data.couponList.forEach(item => {
              this.coupon_list.push({
                id: item.id,
                coupon_id: item.coupon.id
              });
            });
          }
          this.liveInfo = res.data.liveInfo;
          // 基础信息
          this.formValidateBase = {
            sort: res.data.liveInfo.sort,
            title: res.data.liveInfo.title,
            intro: res.data.liveInfo.intro,
            expected_live_time: res.data.liveInfo.expected_live_time,
            live_nickname: res.data.liveInfo.live_nickname,
            live_headurl: res.data.liveInfo.live_headurl, //直播员头像
            list_poster: res.data.liveInfo.list_poster, //直播间封面
            base_hits: res.data.liveInfo.base_hits, //观看人数基数
            live_helper_name: res.data.liveInfo.live_helper_name,
            show_live_list: res.data.liveInfo.show_live_list //直播广场显示
          };
          this.formValidateVideo = {
            live_platform: res.data.liveInfo.live_platform, // 第三方直播平台
            live_src: res.data.liveInfo.live_src, // 第三方直播地址
            open_vod: res.data.liveInfo.open_vod, // 是否开启会放
            vod_src: res.data.liveInfo.vod_src //回播地址
          };
            this.formValidateAnnouncement = {
              notice: res.data.liveInfo.notice,
              notice_link: res.data.liveInfo.notice_link
            };
          if (res.data.liveInfo.notice_link) {
            this.$refs["liveAnnouncement"].industryList = JSON.parse(
              res.data.liveInfo.notice_link
            );
          }
          this.formValidateProducts = {
            product: res.data.productList
          };
          this.formValidateCoupon = {
            coupon: res.data.couponList
          };
          let menuListInfo; //菜单导航
          let navListInfo; //按钮导航
          navListInfo = res.data.menuList
            .filter(item => !item.nav_type)
            .map(item => item);
          menuListInfo = res.data.menuList
            .filter(item => item.nav_type)
            .map(item => item);
          this.formValidateStyles.nav_list =navListInfo.sort(this.sortId);
          this.formValidateStyles.nav_list.forEach(item=>{
            item.button_name = item.link_type==0?"关注"
              :item.link_type==1?"更多直播"
                :item.link_type==2?"商城主页"
                  :item.link_type==3?"评论"
                    :item.link_type==4?"商品"
                      :item.link_type==5?"优惠券"
                        :item.link_type==6?"点赞"
                          :item.link_type==7?"分享"
                            :item.link_type==8?"自定义":""
            if (item.link_type == 8) {
              if (item.extra_params.type == 1) {
                item.extra_params.navigationImage =
                  item.extra_params.content?item.extra_params.content:"";
                item.extra_params.context = ""
              } else {
                item.extra_params.context = item.extra_params.content;
                item.extra_params.navigationImage = ""
              }
            }
            if (item.link_type == 0) {
              item.images = item.image?item.image:"";
            }
          })
          if (res.data.liveInfo.live_style) {
            this.formValidateStyles.menu_list = menuListInfo.sort(this.sortLinkType);
            this.formValidateStyles.menu_list.forEach(item=>{
              item.button_name = item.link_type==9?"互动":item.link_type==4?"商品":item.link_type==5?"优惠券":item.link_type==8?"自定义":""
              if (item.link_type==8){
                if (item.extra_params.type == 1) {
                  item.extra_params.navigationImage =
                    item.extra_params.content;
                }else if (item.extra_params.type == 2){
                  item.extra_params.context = item.extra_params.content;
                } else if(item.extra_params.type == 3){
                  item.extra_params.links = item.extra_params.content;
                  this.$refs["liveStyles"].industryList = JSON.parse(item.extra_params.links);
                }
                if (!item.extra_params.navigationImage) {
                  item.extra_params.navigationImage = ""
                }
              }
            })
          }
          let buttonDis = res.data.menuList
            .filter(item => !item.nav_type && item.status)
            .map(item => item.link_type);
          let halfsizeDis = res.data.menuList
            .filter(item => item.nav_type && item.status)
            .map(item => item.link_type);
          this.formValidateStyles = {
            live_style: res.data.liveInfo.live_style,
            live_poster: res.data.liveInfo.live_poster, //直播间封面
            button_display:buttonDis,
            menu_display:res.data.liveInfo.live_style==1?
            halfsizeDis : [9, 4, 5],
            nav_list: this.formValidateStyles.nav_list,
            menu_list: this.formValidateStyles.menu_list
          };
          this.$refs["liveBase"].headurlURL = res.data.liveInfo.live_headurl;
          this.$refs["liveBase"].squareCoverURL = res.data.liveInfo.list_poster;
          this.$refs["liveStyles"].coverStudioURL =
            res.data.liveInfo.live_poster;

          this.$store.state.COMMON_loading = false;
        });
      } else {
        this.$store.state.COMMON_loading = false;
      }
    },
    /**
     * 设置保存的loading
     */
    setSaveLoading(status) {
      this.saveLoading = status;
    },
    /**
     * 检查下一步是否可跳转
     */
    checkNext() {
      let promiseArray = Object.keys(this.checkFormObject).map(item => {
        return new Promise(resolve => {
          this.checkFormObject[item].validate(valid => {
            resolve({ status: valid, index: item });
          });
        });
      });
      return Promise.all(promiseArray).then(valid => {
        let checkItem = valid.find(el => {
          return el.status === false;
        });
        if (checkItem) {
          this.tabChangeFlag = this.tabChangeArray[checkItem.index];
        }
        return !checkItem;
      });
    },
    /**
     * 保存商品信息
     */
    async onProductDetailSave() {
      if (this.verifyTime) {
        return;
      }
      if (!(await this.checkNext())) {
        this.$Message.error("保存失败");
        return;
      }
      this.setSaveLoading(true);
      // 上传直播员头像
      let promiseImageArray = [];
      let postImageData = [];
      let uploadImageFormData = new FormData();
      if (typeof this.formValidateBase.live_headurl==="object"){
        if (typeof this.formValidateBase.live_headurl[0]==="object"){
          uploadImageFormData.append("live_headurl", this.formValidateBase.live_headurl[0]);
        }
      }
      if (typeof this.formValidateBase.list_poster==="object"){
        if (typeof this.formValidateBase.list_poster[0]==="object"){
          uploadImageFormData.append("list_poster", this.formValidateBase.list_poster[0]);
        }
      }
      if (typeof this.formValidateStyles.live_poster==="object"){
        if (typeof this.formValidateStyles.live_poster[0]==="object"){
          uploadImageFormData.append("live_poster", this.formValidateStyles.live_poster[0]);
        }
      }
      promiseImageArray.push(
        new Promise(resolve => {
          this.$httpUpload(
            "/shop/admin/live/upload",
            uploadImageFormData,
            res => {
              if (res.code === 200) {
                postImageData = res.data;
                resolve();
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        })
      );
      this.formValidateStyles.nav_list.forEach((item, index) => {
        item.id = item.id ? item.id : 0;
        if (this.formValidateStyles.button_display.indexOf(item.link_type) !=-1) {
          item.status = 1;
        } else {
          item.status = 0;
        }
        if (item.link_type == 0) {
          if (typeof item.images === "object") {
            if (item.images.length){
              item.images.forEach((item1, index1) => {
                if (typeof item1 === "object") {
                  let imageFormData = new FormData();
                  imageFormData.append("nav_follow_image", item1);
                  promiseImageArray.push(
                    new Promise(resolve => {
                      this.$httpUpload(
                        "/shop/admin/live/upload",
                        imageFormData,
                        res => {
                          if (res.code === 200) {
                            this.formValidateStyles.nav_list[index]["image"] =
                              res.data.nav_follow_image;
                            resolve();
                          } else {
                            this.$Message.error(res.msg);
                          }
                        }
                      );
                    })
                  );
                } else {
                  item.image = item.images[0];
                }
              });
            }else{
              item.image = "";
            }
          } else {
            item.image = item.images;
          }
        } else if (item.link_type == 8) {
          if (item.extra_params.type == 1) {
            if (typeof item.extra_params.navigationImage === "object") {
              if (item.extra_params.navigationImage.length){
                item.extra_params.navigationImage.forEach((item1, index) => {
                  if (typeof item1 === "object") {
                    let imageFormData = new FormData();
                    imageFormData.append("image", item1);
                    if (item.id) {
                      imageFormData.append("id", item.id);
                    }
                    promiseImageArray.push(
                      new Promise(resolve => {
                        this.$httpUpload(
                          "/shop/admin/live/custom/upload",
                          imageFormData,
                          res => {
                            if (res.code === 200) {
                              item.extra_params.content = res.data;
                              resolve();
                            } else {
                              this.$Message.error(res.msg);
                            }
                          }
                        );
                      })
                    );
                  } else {
                    item.extra_params.content =
                      item.extra_params.navigationImage[0];
                  }
                });
              }else{
                item.extra_params.content ="";
              }
            } else {
              item.extra_params.content = item.extra_params.navigationImage;
            }
          } else {
            item.extra_params.content = item.extra_params.context;
          }
        }
      });
      if (this.formValidateStyles.live_style) {
        this.formValidateStyles.menu_list.forEach(item => {
          item.id = item.id ? item.id : 0;
          if (this.formValidateStyles.menu_display.indexOf(item.link_type) != -1) {
            item.status = 1;
          } else {
            item.status = 0;
          }
          if (item.link_type == 8) {
            if (item.extra_params.type == 1) {
              if (typeof item.extra_params.navigationImage == "object") {
                item.extra_params.navigationImage.forEach((item1, index) => {
                  if (typeof item1 === "object") {
                    let imageFormData = new FormData();
                    imageFormData.append("image", item1);
                    if (item.id) {
                      imageFormData.append("id", item.id);
                    }
                    promiseImageArray.push(
                      new Promise(resolve => {
                        this.$httpUpload(
                          "/shop/admin/live/custom/upload",
                          imageFormData,
                          res => {
                            if (res.code === 200) {
                              item.extra_params.content = res.data;
                              resolve();
                            } else {
                              this.$Message.error(res.msg);
                            }
                          }
                        );
                      })
                    );
                  } else {
                    item.extra_params.content =
                      item.extra_params.navigationImage[0];
                  }
                });
              } else {
                item.extra_params.content = item.extra_params.navigationImage;
              }
            } else {
              item.extra_params.content =
                item.extra_params.type == 3
                  ? item.extra_params.links
                  : item.extra_params.context;
            }
          }
        });
      }
      // 等待图片上传完成
      await Promise.all(promiseImageArray);
      let postProductData = {
        base_info: {
          // 基础部分
          sort: this.formValidateBase.sort,
          title: this.formValidateBase.title,
          intro: this.formValidateBase.intro,
          expected_live_time: this.formValidateBase.expected_live_time,
          live_nickname: this.formValidateBase.live_nickname,
          live_headurl:
            postImageData.live_headurl? postImageData.live_headurl
              : typeof this.formValidateBase.live_headurl === "object"?this.formValidateBase.live_headurl[0]:this.formValidateBase.live_headurl, //直播员头像
          list_poster:
            postImageData.list_poster? postImageData.list_poster
              : typeof this.formValidateBase.list_poster === "object"?this.formValidateBase.list_poster[0]:this.formValidateBase.list_poster, //直播广场封面
          base_hits: this.formValidateBase.base_hits, //观看人数基数
          live_helper_name: this.formValidateBase.live_helper_name,
          show_live_list: this.formValidateBase.show_live_list, //直播广场显示
          name: this.formValidateBase.productName,
          type: this.formValidateBase.productType,
          // sku
          notice: this.formValidateAnnouncement.notice,
          notice_link: this.formValidateAnnouncement.notice_link
            ? this.formValidateAnnouncement.notice_link
            : "",
          live_platform: this.formValidateVideo.live_platform,
          live_src: this.formValidateVideo.live_src,
          open_vod: this.formValidateVideo.open_vod,
          vod_src: this.formValidateVideo.vod_src,
          live_style: this.formValidateStyles.live_style, //直播间样式
          live_poster:
            postImageData.live_poster? postImageData.live_poster
              : typeof this.formValidateStyles.live_poster === "object"?this.formValidateStyles.live_poster[0]:this.formValidateStyles.live_poster //直播间封面
        },
        coupon_list: this.coupon_list.length ? this.coupon_list : [],
        product_list: this.product_list.length ? this.product_list : [],
        nav_list: this.formValidateStyles.nav_list.concat(
          this.formValidateStyles.menu_list
        )
      };
      this.verifyTime = true;
      let sentUrl;
      if (this.liveId || this.$route.query.live_id) {
        postProductData.id = this.liveId || this.$route.query.live_id;
        sentUrl = "/shop/admin/live/edit";
      } else {
        sentUrl = "/shop/admin/live/add";
      }
      this.http({
        url: sentUrl,
        data: postProductData,
        method: "POST"
      })
        .then(res => {
          if (res.code === 200) {
            this.$Message.success(this.$store.state.SUCCESS_MSG);
            this.verifyTime = false;
            if (sentUrl == "/shop/admin/live/add") {
              this.liveId = res.data.id;
            }
            this.setSaveLoading(false);
            this.getProductInfo();
          } else {
            this.setSaveLoading(false);
            this.verifyTime = false;
            this.$Message.error(res.msg);
          }
        })
        .finally(() => {
          this.verifyTime = false;
          this.setSaveLoading(false);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail {
  text-align: left;
  /deep/.ivu-tabs {
    min-height: calc(100vh - 172px);
    .product-detail-tabpane-graphic {
      height: 100%;
      overflow: auto;
    }
    .ivu-tabs-bar {
      margin-bottom: 0;
    }
    .ivu-tabs-nav {
      margin-left: 24px;
    }
    // tab内边距
    .ivu-tabs-tabpane {
      padding: 24px 24px 0;
    }
    // 内容区高度
    .ivu-tabs-content {
      height: calc(100vh - 170px);
      overflow: auto;
    }
  }

  /deep/.ivu-form-item {
    /*margin-top: 20px !important;*/
    margin-bottom: 20px !important;
    // 左边标签距离
  }
  /deep/.ivu-form .ivu-form-item-label {
    padding-right: 8px;
    height: 32px;
  }

  /deep/.product-detail-item {
    .ivu-radio-group {
      line-height: 32px;
      height: 32px;
      vertical-align: initial;
    }
    // 输入框宽度
    .ivu-input-wrapper,
    .ivu-select {
      width: 280px;
      vertical-align: top;
    }
    // 单选框右边距离
    .ivu-radio-wrapper {
      margin-right: 26px;
    }
    // 文字垂直居中（需要设置行高）
    .product-detail-verity {
      vertical-align: middle;
    }
    // 换行
    .product-detail-newsline {
      display: block;
      margin-top: 10px;
    }
    // 默认按钮高度样式
    button.ivu-btn-primary {
      line-height: 1;
      height: 32px;
      vertical-align: top;
      i {
        vertical-align: middle;
        font-size: 20px;
      }
      span {
        vertical-align: middle;
      }
    }
    // 悬停弹窗
    .ivu-poptip {
      .iconfont {
        font-size: 20px;
        margin-right: 10px;
      }
    }
    // 文本框数字下标
    span.textarea-num {
      font-size: 12px;
      color: #999999;
      margin-left: 10px;
      vertical-align: bottom;
      position: relative;
      bottom: -10px;
    }
  }
}
.product-detail-foot-button {
  /deep/button {
    & + button {
      margin-left: 0;
    }
    &.ivu-btn-primary {
      width: 70px;
    }
    &.ivu-btn-text {
      position: absolute;
      top: 50%;
      margin-top: -15px;
    }
    &.product-detail-foot-button-prev {
      margin-left: -133px;
      color: #464c5b;
      &:focus {
        box-shadow: none;
      }
      &:hover {
        text-decoration: unset;
      }
      img {
        margin-right: 7px;
      }
    }
    &.product-detail-foot-button-next {
      margin-left: 35px;
      color: #464c5b;
      &:focus {
        box-shadow: none;
      }
      &:hover {
        text-decoration: unset;
      }
      img {
        margin-left: 7px;
        transform: rotate(180deg);
      }
    }
    img {
      width: 20px;
      height: 11px;
      vertical-align: middle;
    }
    span {
      vertical-align: middle;
    }
  }
}
</style>
