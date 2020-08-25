<template>
  <div>
    <Modal class="order-modify-freight-modal" v-model="isShow" :width="420" :mask-closable="false" title="修改订单运费">
      <Form ref="form" :model="formData" :rules="rules" :label-width="150">
        <FormItem label="原订单运费：">
          <span>￥{{orderInfo.ori_freight}}</span>
        </FormItem>
        <FormItem label="修改后的运费：" prop="money">
          <div class="input-wrapper">
            <InputNumber
              class="common-input-text-200" 
              v-model="formData.money" 
              :min="0"
              :max="Number(orderInfo.ori_freight)"
              :precision="2"
              placeholder="请输入修改后的订单运费"
            ></InputNumber>
            <span class="prefix">￥</span>
          </div>
        </FormItem>
        <FormItem label="商家改价优惠运费：">
          <span>￥{{formData.money!=null ? (Number(orderInfo.ori_freight)-Number(formData.money)).toFixed(2) : '--'}}</span>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="isShow=false">取消</Button>
        <Button type="primary" @click="modifyFreight">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
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
    return {
      isShow: false,
      formData: {
        money: null
      },
      rules: {
        money: [{required: true, type: "number", message: "请输入修改后的订单运费", trigger: 'blur'}]
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
        this.formData.money = Number(this.orderInfo.freight_manual_discount) ? Number(this.orderInfo.ori_freight) - Number(this.orderInfo.freight_manual_discount) : null;
      }
    }
  },
  methods: {
    modifyFreight() {
      this.$refs.form.validate(valid => {
        if(valid) {
          this.$httpPost("/shop/admin/order/freight/edit", {
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
.order-modify-freight-modal {
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