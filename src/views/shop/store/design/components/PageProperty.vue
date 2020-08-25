<template>
  <div class="page-info property-container">
    <h3>
      <span>页面设置</span>
    </h3>
    <div class="form">
      <div class="item-title">页面标题</div>
      <Input v-model="pageInfo.title" placeholder="请输入页面标题" style="width:100%" :maxlength="10">
        <span slot="suffix">{{pageInfo.title?pageInfo.title.length:0}}/10</span>
      </Input>
      <div class="item-title">页面描述</div>
      <div class="wrapper">
        <Input
          v-model="pageInfo.description"
          type="textarea"
          style="width:100%;"
          placeholder="请输入页面描述"
          :maxlength="30"
        />
        <div class="fontcount">{{pageInfo.description ? pageInfo.description.length : 0}}/30</div>
      </div>
      <div class="item-title">页面背景</div>
      <div style="position: relative">
        <ColorPicker v-model="pageInfo.background" recommend editable alpha/>
        <a class="reset-link" style="margin-left: 10px" @click="pageInfo.background = initialColor">重置</a>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: ["pageInfo"],
  data() {
    return {
      initialColor: this.pageInfo.background,
    };
  }
};
</script>
<style lang="less" scoped>

.form {
  padding: 30px 20px;

  .item-title {
    font-size: 13px;
    line-height: 1;
    margin-bottom:20px;
    color: #999999;
    &:not(:first-child){
      margin-top:30px;
    }
  }
  .wrapper{
    position:relative;
    /deep/textarea{
      height:72px;
    }
  }
  .fontcount {
    position:absolute;
    right:10px;
    bottom:5px;
    font-size: 12px;
    margin-top: 6px;
    color: #999999;
    text-align: right;
  }
  /deep/.ivu-input-suffix{
    line-height:32px;
    margin-right:5px;
    color:#999;
  }
  /deep/textarea.ivu-input {
    font-size: 13px;
  }
  /deep/.ivu-select-dropdown/deep/.ivu-color-picker-confirm-color{
    width:162px !important;
  }
  /deep/.ivu-select-dropdown/deep/.ivu-btn{
    width:40px !important;
    height:24px !important;
  }
}
</style>
