<template>
  <div class="distributor-setting-list">
    <Modal
      class="distributor-setting-list-modal"
      v-model="modalStatus"
      footer-hide
      :width="620"
      title="商品详情"
    >
      <Form :model="productData" :label-width="88" :show-message="false">
        <FormItem label="商品名称：">
          <div class="product-detail-item">{{productData.productName}}</div>
        </FormItem>
        <FormItem label="商品图：">
          <div class="product-detail-item product-detail-image">
            <img v-for="(item, index) in productData.pruductImage" :key="index" :src="item">
          </div>
        </FormItem>
        <FormItem label="运费：">
          <div
            class="product-detail-item"
          >{{productData.productFreight === '0' ? "免运费" : freightTemplateList.filter(item => item.id === productData.freightTemplate).map(item => item.template_name).join("")}}</div>
        </FormItem>
        <FormItem label="销售价：" prop="productPrice">
          <div class="product-detail-item">{{productData.productPrice}}元</div>
        </FormItem>
        <FormItem label="重量：" v-show="productData.weight !== null">
          <div
            class="product-detail-item"
          >{{productData.weight}}kg</div>
        </FormItem>
        <FormItem label="图文详情：" style="margin-bottom: 0;" prop="productDetail">
          <div class="product-detail-item">
            <iframe ref="productView"></iframe>
            <div></div>
          </div>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    productInfo: {
      type: Object
    },
    freightTemplateList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      modalStatus: false,
      imageIsError: false,
      productData: {
        productName: "",
        pruductImage: [],
        productPrice: "",
        weight: null,
        productFreight: "0",
        freightTemplate: "0",
        productDetail: ""
      }
    };
  },
  watch: {
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
        // 清除验证提示
        // 当打开弹窗时获取产品信息显示
        if (this.modalStatus) {
          this.getProductInfo(this.productInfo);
        }
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    /**
     * 获取产品信息显示
     */
    getProductInfo(val) {
      let info = val || {};
      this.productData = {
        id: info.id || "",
        productName: info.name || "",
        pruductImage: Array.isArray(info.image)
          ? info.image
          : (info.small_images &&
              info.small_images
                .split(",")
                .map(item => this.$store.state.siteComdataPath + item)) ||
            [],
        productPrice: info.price || "",
        productFreight:
          (info.freight_id &&
            (info.freight_id.toString() === "0" ? "0" : "1")) ||
          "0",
        weight: info.weight || (info.weight === 0 ? 0 : null),
        freightTemplate: info.freight_id || "0",
        productDetail: info.detail || ""
      };
      this.$refs["productView"].contentWindow.document.querySelector(
        "body"
      ).innerHTML =
        "<style>*{margin: 0;padding:0;}img{max-width: 100%;}</style>" +
        this.productData.productDetail;
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-setting-list-modal {
  /deep/.ivu-modal-wrap {
    .ivu-modal-body {
      padding: 24px 30px 30px;

      .ivu-radio-wrapper {
        margin-right: 27px;
      }

      .ivu-form-item {
        margin-bottom: 6px;
        .ivu-form-item-label{
          height: 32px;
        }
      }

      .product-detail-image {
        display: flex;
        flex-wrap: wrap;
        img {
          height: 88px;
          width: 88px;
          border-radius: 5px;
          display: block;
          margin-right: 10px;
          &:nth-child(n + 5) {
            margin-top: 10px;
          }
        }
      }

      iframe {
        width: 100%;
        height: fill-available;
        border: 0;
        max-height: 300px;
        overflow-y: auto;
      }

      textarea {
        min-height: 77px;
      }
    }
  }
}
</style>
