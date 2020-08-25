<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">经销商等级</div>
    </div>
    <div class="form">
      <div class="info">
        <div><i class="iconfont icon-ios-information-circ1"></i>可以通过鼠标拖动改变组件大小和位置</div>
		    <div class="tips">经销商等级是拉取会员的经销商等级</div>
      </div>
      <div class="form-item">
        <div class="item-title">文字颜色：</div>
        <div class="item-data">
          <ColorPicker v-model="module.color" recommend editable alpha />
        </div>
      </div>
      <div class="form-item">
        <div class="item-title">文字大小：</div>
        <div class="item-data">
          <Slider v-model="module.fontSize" :step="1" :max="30" show-input></Slider>
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
    return {};
  },
  methods: {}
};
</script>
<style lang="less" scoped>
/deep/textarea.ivu-input {
  font-size: 13px;
}
.info {
	.tips {
    color: #9EA4B1;
    font-size: 13px;
    margin-top: 10px;
    &:before {
      content: '*';
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      // font-family: SimSun;
      font-size: 13px;
      // color: #ed4014;
    }
  }
}
.fontcount {
  position: absolute;
  right: 7px;
  bottom: 3px;
  color: #999;
  font-size: 12px;
}

.form {
  .form-item {
    margin-bottom: 30px !important;
    .item-title {
      margin-bottom: 20px !important;
    }
  }
}
</style>
