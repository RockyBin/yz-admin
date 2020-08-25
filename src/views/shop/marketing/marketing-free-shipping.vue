<template>
<div class="marketing-free-shipping">
  <div class="main-content">
    <switch-titlebar 
      v-model="status" 
      title="是否开启包邮功能" 
      :tipShow="status" 
      tipText="开启后，该包邮活动生效，则商品的单品运费规则将被覆盖掉。"
    />
    <div class="free-shipping-title" v-if="status">
        <titlebar title="包邮设置"></titlebar>
    </div>
    <Form v-if="status" ref="form" :model="formData" :labelWidth="100">
      <FormItem class="ivu-form-item-required" label="包邮条件：" required>
        <div style="display:flex">
            订单金额满&nbsp;&nbsp;&nbsp;
            <FormItem  prop="money" :rules="[{ trigger: 'blur', validator: validator}]">
            <InputNumber v-model="formData.money"
                style="width:210px"
                :max="9999999.99"
                :min="0"
                :precision="2"
                :step="1"
                placeholder="请输入包邮金额"
            ></InputNumber>
            </FormItem>
            &nbsp;&nbsp; 元，包邮。
        </div>
      </FormItem>
    </Form>
  </div>
  <div class="footer">
    <Button type="primary" shape="circle" @click="validate" :loading="loading" perm="free.shipping.operate">保存</Button>
  </div>
</div>
</template>
<script>
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
const validator = (rule, value, callback) => {
    if (value || value === 0) {
      return callback();
    }
    return callback(new Error("请输入包邮金额"));
}
export default {
  components: {
    switchTitlebar, titlebar
  },
  data() {
    return {
      status: 0,
      validator,
      loading:false,
      formData:{
        money: null,
      }
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getSetting();
  },
  methods: {
    getSetting() {
      this.$httpGet("/shop/admin/activities/freefreight/info",null , res => {
         this.$store.state.COMMON_loading = false;
         if(res.code == 200) {
            this.status = res.data.status || 0
            res.data && res.data.money ? this.formData.money = Number(res.data.money) : ''
        } else {
          this.$Message.error(res.msg);
        }
      })
    },
    validate() {
      this.loading = true
      this.status ? this.$refs.form.validate((valid) => {
          if(valid) {
            this.saveSetting()
          } else {
            this.loading = false
            this.$Message.error("保存失败");
          }
        }) : this.saveSetting()
    },
    saveSetting() {
      this.$httpGet("/shop/admin/activities/freefreight/edit",{
        status: this.status,
        money: this.formData.money
      }, res => {
        this.loading = false
        if(res.code == 200) {
          this.$Message.success("保存成功");
        } else {
          this.$Message.error(res.msg);
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .marketing-free-shipping {
    .free-shipping-title{
        padding-bottom: 20px;
    }
    .main-content {
      padding: 24px;
      height: calc(100vh - 120px);
      overflow: auto;
      /deep/.ivu-form {
        .ivu-btn-primary {
          width: 90px;
          height: 32px;
          padding: 5px 10px;
          vertical-align: baseline;
          margin-right: 20px;
        }
      }
    }
    .footer{
      height:50px;
      line-height:50px;
      text-align:center;
      border-top:1px solid #eee;
      .ivu-btn{
        width: 70px;
      }
    }
  }
</style>