<template>
  <div>
    <Modal class="order-modify-price-modal" v-model="isShow" :width="430" :mask-closable="false" title="修改订单金额">
      <Form ref="form" :model="formData" :rules="rules" :label-width="150">
        <FormItem label="原订单金额(包运费)：">
          <span>￥{{originalMoney.toFixed(2)}}</span>
        </FormItem>
        <FormItem label="修改订单金额(包运费)：" prop="money">
          <div class="input-wrapper">
            <InputNumber
              class="common-input-text-200" 
              v-model="formData.money" 
              :min="0"
              :max="originalMoney"
              :precision="2"
              placeholder="请输入修改后的订单金额"
            ></InputNumber>
            <more-message :maxWidth="350" style="margin-left: 10px;" text="修改订单金额必须要大于运费，小于或等于原订单金额。"></more-message>
            <span class="prefix">￥</span>
          </div>
        </FormItem>
        <FormItem label="优惠金额：">
          <span>￥ {{formData.money!=null ? (originalMoney-formData.money).toFixed(2) : '--'}}</span>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="isShow=false">取消</Button>
        <Button type="primary" @click="modifyPrice">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    moreMessage
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    const validator = (rule, value, callback) => {
      if(!value) {
        callback("请输入修改后的订单金额");
      } else if(value < Number(this.orderInfo.freight)) {
        callback("修改订单金额必须要大于运费");
      } else {
        callback();
      }
    }
    return {
      isShow: false,
      formData: {
        money: null
      },
      rules: {
        money: [{required: true, type: "number", validator, trigger: 'blur'}]
      }
    }
  },
  watch: {
    value(val) {
      this.isShow = val;
    },
    isShow(val) {
      this.$emit('input', val)
      if(val) {
        this.formData.money = Number(this.orderInfo.manual_discount) || Number(this.orderInfo.freight_manual_discount) ? Number(this.orderInfo.money) : null;
      }
    }
  },
  computed: {
    originalMoney() {
      return  Number(this.orderInfo.money) + Number(this.orderInfo.manual_discount) + Number(this.orderInfo.ori_freight) - Number(this.orderInfo.freight);
    }
  },
  methods: {
    modifyPrice() {
      this.$refs.form.validate(valid => {
        if(valid) {
          this.$httpPost("/shop/admin/order/money/edit", {
            order_id: this.orderInfo.id,
            money: this.formData.money
          }, res => {
            this.isShow = false;
            this.$emit('on-modal-confirm');
            if(res.code == 200) {
              this.$Message.success("修改成功");
            } else {
              this.$Message.error(res.msg);
            }
          });
        } else {
          this.$Message.error("修改失败");
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
.order-modify-price-modal {
  .input-wrapper {
    position: relative;
    /deep/input {
      padding-left: 20px;
    }
    .prefix {
      position: absolute;
      left: 5px;
      top: 3px;
    }
  }
}
</style>