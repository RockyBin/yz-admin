<template>
  <Modal
    v-model="modalStatus"
    class="product-detail-modal-supplier"
    :loading="modalLoading"
    title="审核商品"
    :width="440"
    :closable="closable"
    :mask-closable="false"
    @on-ok="onModalConfirmClick"
  >
    <Form
      ref="formValidate"
      :model="formItem"
      :label-width="80"
      :rules="ruleValidate"
      style="margin-right: -20px;"
    >
      <FormItem label="审核：">
        <RadioGroup v-model="formItem.pass">
          <Radio :label="1">通过</Radio>
          <Radio :label="-1">拒绝</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="商品状态："
        v-show="formItem.pass === 1"
        style="margin-bottom: 0 !important;"
      >
        <RadioGroup v-model="formItem.status">
          <Radio :label="1">上架</Radio>
          <Radio :label="0">下架</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="拒绝原因：" v-show="formItem.pass !== 1" prop="reason">
        <div>
          <Input
            v-model="formItem.reason"
            style="width: 280px;min-height: 70px;"
            type="textarea"
            :maxlength="200"
            placeholder="请输入拒绝原因"
          />
          <div class="textarea-suffix-num">
            {{ formItem.reason.length }}/200
          </div>
        </div>
      </FormItem>
    </Form>
  </Modal>
</template>
<script>
const formItem = {
  status: 1,
  pass: 1,
  reason: ""
}
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalStatus: false,
      modalLoading: true,
      closable: true,
      formItem: { ...formItem },
      ruleValidate: {
        reason: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.formItem.pass === 1 || value.trim()) {
                return callback();
              }
              return callback("请输入拒绝原因");
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      if (val) {
        this.formItem = {
          ...formItem
        };
      }
    },
    modalStatus(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onModalConfirmClick() {
      this.$refs.formValidate.validate(valid => {
        if (valid) {
          this.closable = false;
          this.$emit("onConfirmClick", this.formItem, () => {
            this.closable = true;
            this.modalStatus = false;
          });
        } else {
          this.modalLoading = false;
          this.$nextTick(() => {
            this.modalLoading = true;
          });
        }
      });
    }
  }
}
</script>
<style lang="less" scoped>
.product-detail-modal-supplier {
  /deep/textarea {
    width: 280px;
    min-height: 70px;
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
  }
}
</style>
