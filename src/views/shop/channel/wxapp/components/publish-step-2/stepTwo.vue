<template>
  <div class="tbChooseWay">
    <div class="tbChooseWay-box">
      <div class="onilne-issue">
        <div class="online-issue-left">
          <img src="./images/img-sc.png" alt />
        </div>
        <div class="online-issue-right">
          <div class="online-issue-title">
            <span>在线上传</span>
          </div>
          <p class="online-issue-tip">一键上传新版本到微信平台</p>
          <Button type="primary" perm="wxapp.config.operate" @click="onlineUpload">立即上传</Button>
        </div>
      </div>
      <div class="manual-issue">
        <div class="manual-issue-left">
          <img src="./images/img-xz.png" alt />
        </div>
        <div class="manual-issue-right">
          <div class="manual-issue-title">
            <span>手动上传(下载代码包)</span>
          </div>
          <p class="manual-issue-tip">一键生成新代码包</p>
          <Button type="primary" perm="wxapp.config.operate" @click="download">去下载</Button>
        </div>
      </div>
    </div>
    <div class="foot-button">
      <Button type="primary" @click="reselect">上一步</Button>
    </div>
  </div>
</template>
<script>
export default {
  props: ["formItem", "newItem"],
  data() {
    return {};
  },
  methods: {
    // 立即上传
    onlineUpload() {
      this.$emit("stepThreeFinish", { uploadType: 1 });
    },
    reselect() {
      this.$emit('previousStep')
    },
    // 去下载
    download() {
      let _this = this;
      if (this.$store.state.COMMON_loading) return;
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/wxapp/config/package", null, res => {
        _this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          _this.$emit("stepThreeFinish", {
            uploadType: 2,
            package: res.data.file
          });
        } else {
          _this.$Message.error("下载失败!" + res.msg);
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import url("stepTwo.less");
</style>
