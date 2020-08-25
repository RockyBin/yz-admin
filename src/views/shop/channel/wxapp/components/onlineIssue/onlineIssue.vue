<template>
  <div class="write-versions">
    <div class="step-title">在线上传</div>
    <!--<p class="step-tip">请填写小程序的版本号和备注，并扫码上传！</p>-->
    <div class="versions-box-content">
      <Form :model="formItem" ref="onlineIssueValidate" :label-width="165" :rules="ruleInline">
        <FormItem label="版本号：" prop="version">
          <Input v-model="formItem.version" style="width: 400px;" placeholder="请填写小程序版本号！(限字母和数字，例如 1.0.0)"/>
        </FormItem>
        <FormItem label="项目备注：" prop="remark">
          <Input v-model="formItem.remark" style="width: 400px;" placeholder="请填写小程序版本项目备注" :maxlength="30"/>
        </FormItem>
        <FormItem>
          <div class="btn-groups">
            <Button type="primary" id="upload-code" @click="upload" perm="wxapp.config.operate">授权上传</Button>
            <a class="download-tool common_shop_color" style="float:right;" href="http://help.yz168.com/NewsDetail/518115.html" target="_blank">在线上传说明</a>
            <!--<Button @click="reselect">返回上一步</Button>-->
          </div>
        </FormItem>
      </Form>
    </div>
    <div class="foot-button">
      <Button type="primary" @click="reselect">上一步</Button>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    var version = function (rule, value, callback) {
      var reg = /^[0-9a-zA-Z\.]+$/ig; // 验证版本号
      if (!value) {
        return callback(new Error('请填写版本号！'));
      } else if (!reg.test(value)) {
        return callback(new Error('请填写正确的版本号！'));
      } else {
        callback();
      }
    };
    return {
      formItem: {
        version: '',
        remark: ''
      },
      ruleInline: {
        version: [
          {required: true, validator: version, trigger: 'blur'}
        ],
        remark: [
          {required: true, message: '请填写项目备注！', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 返回上一步
    reselect() {
      this.$emit('reSelect')
    },
    // 授权上传
    upload() {
      let _this = this;
      this.$refs.onlineIssueValidate.validate((valid) => {
        if (valid) {
          _this.$emit('accept', {info: _this.formItem})
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
  @import url('./onlineIssue.less');
</style>
