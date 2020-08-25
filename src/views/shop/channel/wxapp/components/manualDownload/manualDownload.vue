<template>
  <div class="manaul-download">
    <div class="step-title common_shop_color">代码包已准备完毕</div>
    <div class="manaul-img">
      <img width="120px" src="./images/issue-success.png">
    </div>
    <div>
      <div style="position: relative;">
        <span style="font-size: 12px;color: #464C5B;">请将下载的代码加载到小程序的开发工具上预览并上传</span>
        <a class="download-tool common_shop_color" href="https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html" target="_blank">下载开发工具</a>
        <a class="download-tool common_shop_color" href="http://help.yz168.com/NewsDetail/518116.html" target="_blank">手动上传说明</a>
      </div>
      <div class="btn-groups">
        <a href="" class="ivu-btn-primary" type="primary" id="download-manaul" :download="file">下载</a>
        <!--<Button id="last-step" class="btn btn-success" @click="reselect">重新选择</Button>-->
      </div>
    </div>
    <div class="foot-button">
      <Button type="primary" @click="reselect">上一步</Button>
    </div>
  </div>
</template>
<script>
export default {
  props: ['file'],
  data () {
    return {}
  },
  mounted() {
    document.getElementById('download-manaul').setAttribute('href', this.file + '?rand=' + Math.random());
  },
  methods: {
    reselect() {
      this.$emit('reSelect')
    }
  }
}
</script>
<style lang="less" scoped>
  @import url('./manualDownload.less');
</style>
