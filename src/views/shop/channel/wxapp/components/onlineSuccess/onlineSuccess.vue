<template>
  <div class="issue-success">
    <div class="issue-success-box">
      <div class="issue-success-left">
        <h4 class="common_shop_color">在线上传成功</h4>
        <div class="issue-img">
          <img src="./images/issue-success.png" width="150px">
        </div>
        <div class="basic-info">
          <p>
            <span class="span-left">当前版本号：</span>
            <span class="versions-span-right">{{uploadParams.version}}</span>
          </p>
          <p>
            <span class="span-left">项目备注：</span>
            <span class="desc-span-right">{{uploadParams.remark}}</span>
          </p>
          <div class="message-tip">
            <span class="span-left">提交审核：</span><span style="margin-right: 20px;padding-left: 12px;">您需要登录微信小程序平台对当前代码提交审核</span>
            <a href="http://help.yz168.com/NewsDetail/514475.html" style="color: #5D7AF7;" target="_blank">提交审核说明</a>
          </div>
        </div>
        <div class="input-groups">
          <Button type="primary" class="toAudit" @click="toAudit">去审核</Button>
          <Button id="again-issue" class="btn btn-success" @click="reChoose">重新上传</Button>
        </div>
      </div>
      <div class="issue-success-right">
        <h4>预览码</h4>
        <p class="qrcode-countdown-time common_shop_color" v-if="countDownTime">
          此预览码在<span class="twenty-minute">{{minute}}分{{second}}秒</span>后失效
        </p>
        <p class="have-lose-efficacy" v-if="loseEfficacy">此预览码已失效</p>
        <div class="qercore">
          <img class="img-qrcode" width="200" :src="previewQRcode">
          <img class="lose-efficacy" v-if="loseEfficacy" src="./images/lose-efficacy.png">
        </div>
        <p class="please">请使用开发者微信扫码</p>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: ['uploadParams', 'previewQRcode'],
  data() {
    return {
      loseEfficacy: false, // 二维码失效开关
      minute: 20, // 分钟
      second: '00', // 秒
      countDownTime: true
    }
  },
  mounted() {
    let _this = this;
    let timeOut = setInterval(() => {
      if (this.second > 0) {
        _this.second--;
        if (_this.second <= 9) {
          _this.second = '0' + _this.second;
        }
      } else if (_this.second <= 0 && _this.minute > 0) {
        _this.minute--;
        if (_this.minute <= 9) {
          _this.minute = '0' + _this.minute;
        };
        _this.second = 59;
      } else if (_this.second === '00' && _this.minute === '00') {
        _this.countDownTime = false;
        _this.loseEfficacy = true;
        document.querySelectorAll('.img-qrcode')[0].style.opacity = 0.2;
        clearInterval(timeOut);
      }
    }, 1000)
  },
  methods: {
    // 去审核
    toAudit() {
      window.open('https://mp.weixin.qq.com', '_blank');
    },
    // 重新上传
    reChoose() {
      this.$emit('selectAgain')
    }
  }
}
</script>
<style lang="less" scoped>
  @import url('./onlineSuccess.less');
</style>
