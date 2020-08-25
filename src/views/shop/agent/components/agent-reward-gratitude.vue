<template>
  <div class="agent-setting-gratitude">
    <Form ref="form" :labelWidth="110" :model="formData" :rules="rules">
      <switch-titlebar
        style="margin: 0 0 20px;"
        v-model="enable"
        :true-value="1"
        :false-value="0"
        :tipShow="!baseSetting"
        title="是否开启感恩奖功能"
        tipText="请前往【代理设置>基础设置】开启代理功能后，感恩奖功能才生效。"
      />
      <div v-if="enable">
        <FormItem class="special-align" label="感恩奖比例：" prop="commision">
          <div>
            <span style="margin-right:10px;">一级代理平级比例</span>
            <InputNumber
              :min="0"
              :max="99"
              :step="1"
              :precision="3"
              placeholder="请输入比例"
              v-model="formData.commision"
            ></InputNumber>
            <span style="margin-left:10px;">%</span>
          </div>
        </FormItem>
        <FormItem label="往上最多分：" prop="people_num">
          <div>
            <InputNumber
              :min="1"
              :max="9999999"
              :step="1"
              :precision="0"
              placeholder="请输入人数"
              v-model="formData.people_num"
            ></InputNumber>
            <span style="margin-left:10px;">个平级代理商</span>
          </div>
        </FormItem>
      </div>
    </Form>
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="saveSetting"
        :loading="saveLoading"
        perm="agent.config.operate"
        >保存</Button
      >
    </div>
  </div>
</template>
<script>
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
export default {
  components: {
    switchTitlebar,
  },
  data() {
    return {
      enable: 1,
      baseSetting: false,
      saveLoading: false,
      formData: {
        commision: null,
        people_num: null,
      },
      rules: {
        commision: [{ required: true, min: 0.001, type: "number", message: "请输入平级感恩奖比例", trigger: "blur" }],
        people_num: [{ required: true, min: 1, type: "number", message: "请输入人数", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getSetting();
  },
  methods: {
    getSetting() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/agent/other/reward/setting/info", {}, res => {
        this.$store.state.COMMON_loading = false;
        if(res.code == 200) {
          this.enable = res.data.status;
          this.baseSetting = res.data.baseSetting;
          this.formData.commision = res.data.commision ? Number(res.data.commision) : null;
          this.formData.people_num = res.data.people_num ? Number(res.data.people_num) : null;
        } else {
          this.$Message.error(res.msg);
        }
      })
    },
    saveSetting() {
      this.$refs.form.validate(valid => {
        if(valid) {
          this.$store.state.COMMON_loading = true;
          this.$httpPost("/shop/admin/agent/other/reward/setting/save", {
            status: this.enable,
            commision: this.formData.commision,
            people_num: this.formData.people_num
          }, res => {
            this.$store.state.COMMON_loading = false;
            if(res.code == 200) {
              this.$Message.success("保存成功");
            } else {
              this.$Message.error(res.msg);
            }
          })
        } else {
          this.$Message.error("保存失败");
        }
      })
    },
  },
};
</script>
<style lang="less" scoped>
.agent-setting-gratitude {
  /deep/.ivu-form {
    padding: 24px;
    height: calc(100vh - 120px);
    .special-align {
      .ivu-form-item-error-tip {
        left: 105px;
      }
    }
    .ivu-input-number {
      width: 120px;
    }
  }
  .footer {
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #eee;
    button {
      width: 70px;
      height: 32px;
    }
  }
}
</style>
