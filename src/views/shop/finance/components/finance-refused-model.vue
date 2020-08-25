<template>
  <Modal v-model="modalStatus"
    title="拒绝提现" 
    width="390">
    <Form ref="formItem" :model="formItem" :rules="ruleCustom" :label-width="90" style="text-align:left;">
      <FormItem label="拒绝原因：" prop="about" class="parent-textarea">
        <Input v-model="formItem.about" type="textarea" :autosize="{maxRows: 3,minRows: 3}" placeholder="请输入拒绝原因" :maxlength="20" class="input-textarea"/>
        <span style="color: #999;">{{formItem.about.length}}/20</span>
      </FormItem>
    </Form> 
    <div slot="footer">
      <Button type="text" size="large" @click="cancel">取消</Button>
      <Button type="primary" size="large" @click="ok" :loading="buttonRefusedLoading">
        <label v-if="!buttonRefusedLoading">确认</label></Button>
    </div>
  </Modal>
</template>
<script>
export default {
  props: ["value", "buttonRefusedLoading"],
  data() {
    return {
      formItem: {
        about: ""
      },
      modalStatus: false,
      ruleCustom: {
        about: [
          {
            //   validator(rule, value, callback) {
            //     if (value.trim()) {
            //       let maxLength = 20;
            //       let len = 0;
            //       let status = false;
            //       for (let i in value.trim()) {
            //         len += 1;
            //         if (len > maxLength) {
            //           status = true;
            //           break;
            //         }
            //       }
            //       if (status) {
            //         callback(new Error("最多可输入20个字"));
            //       } else {
            //         callback();
            //       }
            //     } else {
            //       callback(new Error("请输入拒绝原因"));
            //     }
            //   },
            required: true,
            message: "请输入拒绝原因",
            trigger: "change"
          }
        ]
      }
    };
  },
  watch: {
    value(newVal) {
      this.modalStatus = newVal;
      if (newVal) {
        this.$refs["formItem"].resetFields();
      }
    },
    modalStatus(val) {
      if (val !== this.value) this.$emit("input", val);
    }
  },
  methods: {
    ok() {
      this.$refs["formItem"].validate(valid => {
        if (valid) {
          this.$emit("successRefusedButton", this.formItem.about.trim());
        }
      });
    },
    cancel() {
      this.$emit("cancelRefusedButton");
    }
  }
};
</script>
<style lang="less" scoped>
.modal-text {
  line-height: 32px;
  margin-left: 14px;
}
.parent-textarea {
  position: relative;
  span {
    position: absolute;
    bottom: 0;
    right: 16px;
  }
  /deep/ textarea {
    resize: none;
  }
}
</style>
