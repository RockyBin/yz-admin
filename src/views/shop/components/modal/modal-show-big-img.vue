<template>
<div class="img-wrapper">
  <img :style="{width: imgWidth, height: imgWidth}" :src="formatURL(imgURL)" alt="">
  <div :style="{width: imgWidth, height: imgWidth, lineHeight: imgWidth}" @click="isShowBigImg=true" class="mask"><Icon type="ios-eye-outline" color="white" size="18"></Icon></div>
  <Modal class="big-img-modal" v-model="isShowBigImg" fullscreen footer-hide>
    <img :style="{width: bigImgWidth}" :src="formatURL(imgURL)" alt="">
  </Modal>
</div>
</template>
<script>
export default {
  props: {
    imgURL: {
      type: String,
      default: "http://placehold.it/300x200"
    },
    imgWidth: {
      type: String,
      default: "30px"
    },
    bigImgWidth: {
      type: String,
      default: "auto"
    }
  },
  data() {
    return {
      isShowBigImg: false
    }
  },
  methods: {
    formatURL(url){
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    }
  }
}
</script>
<style lang="less">
.img-wrapper {
  display:inline-block;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  line-height: 0;
  &:hover{
    .mask{
      display: block;
    }
  }
  .mask {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
  }
  img {
    object-fit: cover;
  }
}
  //点击查看大图弹窗样式
.big-img-modal {
  .ivu-modal-content {
    background: black;
    .ivu-modal-body {
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
  .ivu-icon-ios-close:hover {
    color: white;
  }
}
</style>