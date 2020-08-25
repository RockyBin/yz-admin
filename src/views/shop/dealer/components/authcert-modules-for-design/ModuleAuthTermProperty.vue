<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">授权期限</div>
    </div>
    <div class="form">
      <div class="info">
        <div><i class="iconfont icon-ios-information-circ1"></i>可以通过鼠标拖动改变组件大小和位置</div>
      </div>
	  <div class="form-item ivu-form-item ivu-form-item-required" :class="{'ivu-form-item-error':!module.term}">
        <div class="item-title item-title-2 ivu-form-item-label">授权期限：</div>
        <div class="item-data item-data-2">
		    <Input-number :max="36" :min="1" v-model="module.term"></Input-number><span style="margin-left:8px;">个月</span>
        <more-message text="授权期限：开始时间是成为经销商时间，结束时间是加上授权期限；期限最多只能填写36个月"></more-message>
        <div class="ivu-form-item-error-tip">请输入期限</div>
		</div>
      </div>
	  <div class="form-item">
        <div class="item-title item-title-2">是否自动续期：</div>
        <div class="item-data item-data-2">
			<RadioGroup v-model="module.autorenew">
			  <Radio :label="1">是</Radio>
			  <Radio :label="0">否</Radio>
			</RadioGroup>
		</div>
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
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: { moreMessage },
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
	.tips {color: #666;margin-top: 10px;}
}
.fontcount {
  position: absolute;
  right: 10px;
  bottom: 6px;
  color: #999;
  font-size: 12px;
}
.more-message {
	margin-left: 8px;
	margin-top: 1px;
}
.form {
  .form-item {
    margin-bottom: 30px !important;
    position: relative;
    &:not(.ivu-form-item-error) {
      .ivu-form-item-error-tip {
        display: none
      }
    }
    .item-title {
      margin-bottom: 20px !important;
    }
    // .item-title-2 {
    //   display: inline-block;
    //   width: 65px;
    //   text-align:right;
    // }
    // .item-data-2 {
    //   display: inline-block;
    //   width: 245px;
    // }
  }
}
</style>
