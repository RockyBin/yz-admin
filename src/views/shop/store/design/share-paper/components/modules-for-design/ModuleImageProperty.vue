<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">图片模块</div>
    </div>
    <div class="form">
      <p class="info"><i class="iconfont icon-ios-information-circ1"></i>可以通过鼠标拖动改变组件大小</p>
      <div class="form-item">
        <div class="item-title">选择图片：</div>
        <div class="item-data">
          <fileSelectBtn :url="module.src" @fileSelected="onFilesSelected"></fileSelectBtn>
        </div>
      </div>
      <div class="form-item">
        <div class="item-title">图片边角：</div>
        <div class="item-data">
          <RadioGroup v-model="module.borderRadius">
            <Radio :label="'0'">直角</Radio>
            <Radio :label="'10px'">圆角</Radio>
            <Radio :label="'50%'">圆形</Radio>
          </RadioGroup>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import fileSelectBtn from './fileSelectBtn.vue';
export default {
  components: { fileSelectBtn },
  props: ["module"],
  data() {
    return {
    };
  },
  methods: {
    onFilesSelected(file) {
      this.module.src = file;
    },
  }
};
</script>
<style lang="less" scoped>
/deep/textarea.ivu-input{
  font-size: 13px;
}
.img-preview{
  width:50px;
  height: 50px;
  cursor:pointer;
  img {
    width:100%;
    height:100%;
  }
}
</style>
