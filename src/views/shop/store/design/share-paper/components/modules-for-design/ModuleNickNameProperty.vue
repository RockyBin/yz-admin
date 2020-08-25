<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">昵称模块</div>
    </div>
    <div class="form">
      <div class="form-item">
        <div class="item-title">文字颜色：</div>
        <div class="item-data">
          <ColorPicker v-model="module.color" recommend editable alpha/>
        </div>
      </div>
      <div class="form-item">
        <div class="item-title">文字大小：</div>
        <div class="item-data">
          <Slider v-model="module.fontSize" :step="1" :min="12" :max="30" show-input></Slider>
        </div>
      </div>
      <div class="form-item">
        <div class="item-title">文字对齐方式：</div>
        <div class="item-data">
          <RadioGroup v-model="module.textAlign">
            <Radio :label="'left'">居左</Radio>
            <Radio :label="'center'">居中</Radio>
            <Radio :label="'right'">居右</Radio>
          </RadioGroup>
        </div>
      </div>
      <div class="form-item">
        <div class="item-title">字体样式：</div>
        <div class="item-data">
          <RadioGroup v-model="module.bold">
            <Radio :label="0">常规</Radio>
            <Radio :label="1">加粗</Radio>
          </RadioGroup>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: ["module"],
  data() {
    return {

    };
  },
  methods: {
    onContentChange(content) {
      module.text = content;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/textarea.ivu-input{
  font-size: 13px;
}
</style>
