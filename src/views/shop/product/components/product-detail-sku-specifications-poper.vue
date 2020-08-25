<template>
  <div class="product-detail-specifications-poper">
    <Poptip
      trigger="hover"
      popper-class="product-detail-specifications-poper-content"
      placement="bottom"
      :transfer="true"
      word-wrap
    >
      <img :src="url ? url:require('@/views/shop/css/images/class_default.png')">

      <div slot="content">
        <Upload
          :disabled="disabled"
          action
          accept="image/png, image/jpeg, image/jpg"
          :before-upload="onImageFileChange"
          :show-upload-list="false"
        >
          <div class="preview">
            <img v-show="url" :src="url">
            <span v-show="!url">添加图片</span>
          </div>
        </Upload>
      </div>
    </Poptip>
  </div>
</template>

<script>
import { getImageData } from "@/views/shop/utils/utils.js";
export default {
  props: {
    value: {
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      url: ""
    };
  },
  watch: {
    value: {
      handler(val) {
        if (typeof val === "string") {
          this.url =
            (val.substring(0, 10) !== "data:image"
              ? val
                ? this.$store.state.siteComdataPath + "/"
                : ""
              : "") + val;
        } else if (val && typeof val === "object") {
          getImageData([val], file => {
            this.url = file[0];
          });
        } else {
          this.url = "";
        }
      },
      immediate: true
    }
  },
  methods: {
    onImageFileChange(file) {
      this.$emit("input", file);
      return false;
    }
  }
};
</script>

<style lang="less" scoped>
.product-detail-specifications-poper {
  width: 22px;
  height: 22px;
  line-height: 0;
  display: inline-block;
  vertical-align: top;
  position: absolute;
  left: 4px;
  top: 4px;
  z-index: 3;
  /deep/.ivu-poptip-rel {
    img {
      height: 22px;
      width: 22px;
    }
  }
}
</style>
<style lang="less">
.product-detail-specifications-poper-content {
  min-width: auto;
  .ivu-poptip-body {
    padding: 5px;
  }
  .ivu-poptip-inner {
    line-height: 0;
  }

  .ivu-upload-select{
    display: block;
  }

  .ivu-poptip-body-content-word-wrap {
    white-space: initial;
  }

  .preview {
    display: block;
    cursor: pointer;
    img {
      display: block;
      width: 78px;
      height: 78px;
    }

    span {
      font-size:12px;
      display: block;
      width: 76px;
      height: 76px;
      padding: 21px 26px;
      background-color: #f5f6f7;
      line-height: 1.5;
      user-select: none;
    }
  }
}
</style>

