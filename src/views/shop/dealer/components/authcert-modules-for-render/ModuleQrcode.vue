<template>
  <div class="qrdiv">
    <img class="qrimg" src="images/share-paper/qrcode.png">
    <div class="logo" v-if="module.logo"><img :src="module.logo"></div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module","currentEditingModule"],
  data() {
    return {};
  },
  methods: {
    getStyle(){
      return {
        position: this.module.position,
        width: this.module.width,
        height: this.module.height,
        top: this.module.top,
        left: this.module.left
      }
    }
  }
};
</script>
<style lang="less" scoped>
.qrdiv {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.qrimg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo  {
  width: 40px;
  height: 40px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  img {
    width: 100%;
    height:100%;
    object-fit:contain;
  }
}
</style>