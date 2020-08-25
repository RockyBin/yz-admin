<template>
  <div>
    <Modal        
        :value="cancelCerification"
        :title="titles"
        width='430'
        @on-cancel="onCancelButton"      
        >
        <Form v-if="types === 1" ref="formValidate" :model="formValidate" :label-width="60">
          <FormItem label="状态：" prop="status">
            <RadioGroup v-model="formValidate.status">
                <Radio :label="1">已使用</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="备注：" prop="note" class="note">
            <Input v-model="formValidate.note" type="textarea" :rows="4" placeholder="请输入备注" :maxlength="65"></Input>
            <span class="suffix">{{formValidate.note.length}}/65</span>
          </FormItem>
        </Form>
        <div v-if="types === 2">
          <label>目标发送用户数为{{ member_count }}，目前优惠券总数量只有{{ coupon_count }}张。若坚持发送，则部分用户无法收到。是否继续进行发送？</label>
        </div>
        <div v-if="types === 3">
          <label>该优惠券被领取且尚未使用张数有{{ received_nouse }}张。如继续进行禁用操作，这些优惠券的使用状态将全部更改为“失效”。受影响用户有{{ member_count }}人。是否确认继续禁用操作？</label>
        </div> 
        <div slot="footer">          
          <Button @click="onClickCancel" :loading="buttonLoading" type="text"><label v-if="!buttonLoading">{{cancelTexts}}</label></Button>
          <Button @click="onClickDisable" type="primary">{{okTexts}}</Button>          
        </div>
    </Modal>
  </div>
</template>
<script>
export default {
  props: {
    cancelCerification: {
      type: Boolean,
      default: false
    },
    titles: {
      type: String,
      default: ""
    },
    buttonLoading: {
      type: Boolean,
      default: false
    },
    cancelTexts: {
      type: String,
      default: ""
    },
    okTexts: {
      type: String,
      default: ""
    },
    types: {
      type: Number,
      default: 1
    },
    coupon_count: {
      type: String,
      default: ""
    },
    member_count: {
      type: String,
      default: ""
    },
    received_nouse: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      formValidate: {
        status: 1,
        note: ""
      }
    };
  },
  watch: {
    // 清空上一次备注内容
    cancelCerification(newVal, oldVal) {
      if (newVal) {
        this.formValidate.note = "";
      }
    }
  },
  methods: {
    onClickDisable() {
      this.$emit("confirmClickButton", this.formValidate);
    },
    onClickCancel() {
      this.$emit("cancelClickButton");
    },
    onCancelButton() {
      this.$emit("clickCancelButton");
    }
  }
};
</script>
<style lang="less" scoped>
.note {
  position: relative;
  .suffix {
    position: absolute;
    bottom: -4px;
    right: 16px;
    font-size: 12px;
    color: #999999;
  }
}
</style>
