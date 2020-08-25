<template>
  <div>
    <Modal 
      class="order-modify-receiver-modal" 
      v-model="isShow" 
      :width="430"
      title="修改收货人信息" 
      :mask-closable="false"
    > 
      <vertical-line-titlebar style="margin-top:0;margin-bottom:10px;font-size:13px;" title="原地址"></vertical-line-titlebar>
      <div class="old-address">
        <p class="line-row">
          <span class="prefix">收货人姓名：</span>
          {{ orderInfo.receiver_name }}
          <span></span>
        </p>
        <p class="line-row">
          <span class="prefix">收货人电话：</span>
          {{ orderInfo.receiver_tel }}
          <span></span>
        </p>
        <p class="line-row">
          <span class="prefix">收货人地址：</span>
          <span style="white-space: pre-wrap;"
            >{{ address.prov_text }}{{ address.prov_text === address.city_text ? '' : address.city_text }}{{ address.area_text
            }}{{ address.address }}</span>
        </p>
      </div>
      <vertical-line-titlebar style="margin-top:20px;margin-bottom:10px;font-size:13px;" title="修改地址"></vertical-line-titlebar>
      <Form ref="form" :model="formData" :rules="rules" :label-width="120">
        <FormItem label="收货人姓名：" prop="name">
          <Input class="common-input-text-260" v-model="formData.name" :maxlength="10" type="text" placeholder="请输入收货人姓名">
            <span slot="suffix">{{formData.name.length}}/10</span>
          </Input>
        </FormItem>
        <FormItem label="收货人电话：" prop="phone">
          <Input class="common-input-text-260" v-model="formData.phone" :maxlength="11" type="text" placeholder="请输入收货人电话" @on-change="filterInput">
            <span slot="suffix">{{formData.phone.length}}/11</span>
          </Input>
        </FormItem>
        <FormItem label="所在地区：" prop="addressCode">
          <Cascader class="common-input-text-260" :data="addressData" v-model="formData.addressCode" :transfer="true" placeholder="请选择所在地区"></Cascader>
        </FormItem>
        <FormItem label="详细地址：" prop="address">
          <Input v-model="formData.address" type="textarea" placeholder="请填写详细地址"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="isShow=false">取消</Button>
        <Button type="primary" @click="modifyReceiverInfo">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
  export default {
    components: {
      verticalLineTitlebar
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
      },
      address: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      const validator = (rule, value, callback) => {
        if(!value) {
          callback("请输入收货人电话");
        } else if(!value.match(/^1\d{10}$/)) {
          callback("请输入正确的收货人电话")
        } else {
          callback();
        }
      }
      return {
        isShow: false,
        addressData: [],
        formData: {
          name: "",
          phone: "",
          addressCode: [],
          address: ""
        },
        rules: {
          name: [{ required: true, message: "请输入收货人姓名", trigger: "blur"}],
          phone: [{ required: true, validator, trigger: "blur"}],
          addressCode: [{ required: true, type: "array", min: 1, message: "请选择所在地区", trigger: "change"}],
          address: [{ required: true, message: "请填写详细地址", trigger: "blur"}],
        }
      }
    },
    watch: {
      value(val) {
        this.isShow = val;
      },
      isShow(val) {
        this.$emit('input', val)
        if(!val) {
          this.$refs.form.resetFields();
        } else {
          setTimeout(() => {
            this.addressData = this.$cityData[0].provinceArr
          }, 300);
        }
      }
    },
    methods: {
      filterInput(event) {
        this.$nextTick(() => {
          this.formData.phone = event.target.value.replace(/[^0-9]/g, '');
        });
      },
      modifyReceiverInfo() {
        this.$refs.form.validate(valid => {
          if(valid) {
            this.$httpPost("/shop/admin/order/address/edit", {
              order_id: this.orderInfo.id,
              prov: this.formData.addressCode[0],
              city: this.formData.addressCode[1],
              area: this.formData.addressCode[2],
              address: this.formData.address,
              name: this.formData.name,
              phone: this.formData.phone
            }, res => {
              if(res.code == 200) {
                this.isShow = false;
                this.$emit('on-modal-confirm');
                this.$Message.success("修改成功");
              } else {
                this.$Message.error(res.msg);
              }
            });
            
          } else {
            this.$Message.error("修改失败");
          }
        });
      }
    }
  }
</script>
<style lang='less' scoped>
.order-modify-receiver-modal {
  .old-address {
    line-height: 19px;
    padding: 10px 14px;
    margin-left: 15px;
    background: #F8F8F9;
  }
  .ivu-form {
    /deep/.ivu-input-suffix {
      width: 45px;
      line-height: 32px;
    }
    /deep/textarea {
      height: 76px;
      resize: none;
      overflow: auto;
    }
  }
}
</style>