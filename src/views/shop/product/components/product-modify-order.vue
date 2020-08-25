<template>
  <Modal class="product-modify-order" v-model="isShow" :width="350" title="编辑商品排序" :mask-closable="false">
    <div class="product-info">
      <img :src="productInfo && productInfo.small_images ? this.$store.state.siteComdataPath + productInfo.small_images.split(',')[0] : ''" alt="">
      <div class="text three-hide">{{productInfo && productInfo.name}}</div>
    </div>
    <Form ref="form" :model="formData" :rules="rules" :label-width="83">
      <FormItem label="原排序号：">
        <span>{{productInfo && productInfo.sort}}</span>
      </FormItem>
      <FormItem label="修改排序：" prop="sort">
        <InputNumber class="common-input-text-210" v-model="formData.sort" :min="0" :max="9999999" :precision="0" placeholder="请输入新的排序号"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="isShow=false">取消</Button>
      <Button type="primary" @click="confirm">确定</Button>
    </div>
  </Modal>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    productInfo: {
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
        sort: null
      },
      rules: {
        sort: [{required: true, type: "number", message: "请输入新的排序号", trigger: "blur"}]
      }
    }
  },
  watch: {
    value(val) {
      this.isShow = val;
    },
    isShow(val) {
      this.$emit("input", val);
      if(!val) {
        this.$refs.form.resetFields();
      }
    }
  },
  methods: {
    confirm() {
      this.$refs.form.validate(valid => {
        if(valid) {
          this.$httpPost("/shop/admin/product/sort/edit", {
            id: this.productInfo.id,
            sort: this.formData.sort
          }, res => {
            if(res.code == 200) {
              this.isShow = false;
              this.$emit("refresh");
              this.$Message.success("修改成功");
            } else {
              this.$Message.error(res.msg);
            }
          })
        } else {
          this.$Message.error("修改失败");
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
.product-modify-order {
  .product-info {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border-radius: 5px;
    border: 1px solid #DCDEE2;
    margin-bottom: 20px;
    img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .text {
      color: #657180;
      font-size: 12px;
      margin-left: 14px;
    }
  }
}
</style>