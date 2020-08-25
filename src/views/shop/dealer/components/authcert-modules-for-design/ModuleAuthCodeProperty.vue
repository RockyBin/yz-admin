<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">授权编码</div>
    </div>
    <div class="form">
      <div class="info">
        <div><i class="iconfont icon-ios-information-circ1"></i>可以通过鼠标拖动改变组件大小和位置</div>
		    <div class="tips">授权编码规则：前缀+时间+会员ID</div>
      </div>
	  <div class="form-item">
        <div class="item-title item-title-2">编号前缀：</div>
        <div class="item-data item-data-2">
		  <Input
            v-model="module.prefix"
            placeholder="请输入内容"
            :maxlength="10"
            @on-change="filterText"
          />
          <div class="fontcount" style>{{module.prefix ? module.prefix.length : 0}}/10</div>
		</div>
      </div>
	  <div class="form-item">
        <div class="item-title item-title-2">时间：</div>
        <div class="item-data item-data-2">读取成为经销的时间</div>
      </div>
	  <div class="form-item">
        <div class="item-title item-title-2">会员ID：</div>
        <div class="item-data item-data-2">读取会员ID后6位</div>
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
export default {
  props: ["module"],
  data() {
    return {};
  },
  methods: {
    filterText(event) {
      // console.log(1111,this.module.prefix)
      this.$nextTick(() => {
        this.module.prefix = this.module.prefix.replace(/[^a-zA-Z]/g,"");
      })
      // event.target.value = this.module.prefix;
      // console.log(2222,this.module.prefix)
    }
  }
};
</script>
<style lang="less" scoped>
/deep/textarea.ivu-input {
  font-size: 13px;
}
.info {
  .tips {
    font-size: 13px;
    color: #9EA4B1;
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
  right: 10px;
  bottom: 6px;
  color: #999;
  font-size: 12px;
}

.form {
  .form-item {
    margin-bottom: 30px !important;
	position: relative;
    .item-title {
      margin-bottom: 20px !important;
    }
	// .item-title-2 {
  //     display: inline-block;
	//   width: 65px;
	//   text-align:right;
  //   }
	// .item-data-2 {
  //     display: inline-block;
	//   width: 245px;
  //   }
  }
}
</style>
