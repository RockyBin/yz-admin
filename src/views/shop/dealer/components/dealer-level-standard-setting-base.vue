<template>
  <Form ref="form" :model="settingData" :rules="rules" :label-width="107">
    <FormItem prop="weight" label="等级权重：">
      <Select class="common-input-text-200" v-model="settingData.weight" placeholder="请选择等级权重">
        <Option v-for="item in 99" :key="item" :value="100-item" :disabled="usedWeight.includes(100-item)">{{100-item}}</Option>
      </Select>
      <more-message style="vertical-align:initial;margin-left:5px;" text="经销商等级权重，数字越大等级越高"></more-message>
    </FormItem>
    <FormItem prop="name" label="等级名称：">
      <Input class="common-input-text-200" type="text" :maxlength="10" v-model="settingData.name" placeholder="请输入等级名称"><span slot="suffix">{{settingData.name.length}}/10</span></Input>
    </FormItem>
    <FormItem prop="discount" label="云仓订货折扣：">
      <InputNumber class="common-input-text-200" :min="0" :max="100" :precision="3" v-model="settingData.discount" placeholder="请输入云仓订货折扣"/><span class="suffix">%</span>
    </FormItem>
    <!-- <FormItem label="加盟费：">
      <InputNumber class="common-input-text-200" :min="0" :max="9999999.99" :precision="2" v-model="settingData.initial_fee" placeholder="请输入加盟费"/><span class="suffix">元</span>
    </FormItem> -->
	<FormItem label="首购最小金额：">
      <InputNumber class="common-input-text-200" :min="0" :max="9999999.99" :precision="2" v-model="settingData.min_purchase_money_first" placeholder="请输入首购最小金额"/><span class="suffix">元</span>
    </FormItem>
    <FormItem label="复购最小金额：">
      <InputNumber class="common-input-text-200" :min="0" :max="9999999.99" :precision="2" v-model="settingData.min_purchase_money" placeholder="请输入复购最小金额"/><span class="suffix">元</span>
    </FormItem>
	<FormItem label="首购最小进货量：">
      <InputNumber class="common-input-text-200" :min="0" :max="9999999" :precision="0" v-model="settingData.min_purchase_num_first" placeholder="请输入首购最小进货量"/><span class="suffix">件</span>
    </FormItem>
	<FormItem label="复购最小进货量：">
      <InputNumber class="common-input-text-200" :min="0" :max="9999999" :precision="0" v-model="settingData.min_purchase_num" placeholder="请输入复购最小进货量"/><span class="suffix">件</span>
    </FormItem>
    <FormItem label="最小提货量：">
      <InputNumber class="common-input-text-200" :min="0" :max="9999999" :precision="0" v-model="settingData.min_take_delivery_num" placeholder="请输入最小提货量"/><span class="suffix">件</span>
    </FormItem>
    <FormItem label="等级状态：">
      <RadioGroup v-model="settingData.status">
        <Radio :label="1">启用</Radio>
        <Radio :label="0" :disabled="!!$route.query.id && !!settingData.dealer_count">禁用</Radio>
      </RadioGroup>
      <p class="tips" v-if="$route.query.id && settingData.dealer_count">*该等级下有{{settingData.dealer_count}}位经销商，暂不支持禁用。</p>
    </FormItem>
    <FormItem v-if="hasLicensePerm('ENABLE_DEALER_HIDE_LEVEL')" label="隐藏等级：">
      <RadioGroup v-model="settingData.has_hide" @on-change="warnUser">
        <Radio :label="1">使用</Radio>
        <Radio :label="0">不使用</Radio>
      </RadioGroup>
    </FormItem>
  </Form>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    moreMessage
  },
  props: ["settingData"],
  data() {
    const validator = (rule, value, callback) => {
      if(rule.field == "weight") {
        if(!value) {
          return callback("请选择等级权重")
        }
        if(this.invalidField == "weight") {
          return callback("等级权重不能重复")
        }
      }
      if(rule.field == "name") {
        if(!value) {
          return callback("请输入等级名称")
        }
        if(this.invalidField == "name") {
          return callback("该名称已存在，请重新输入")
        }
      }
      if(rule.field == "discount" && !value) {
        callback("请输入云仓订货折扣")
      }
      callback()
    }
    return {
      invalidField: "",
      usedWeight: [],
      rules: {
        weight: [{required: true, type:"number", trigger: "change", validator}],
        name: [{required: true, trigger: "blur", validator}],
        discount: [{required: true, type: "number", trigger: "blur", validator}]
      }
    }
  },
  created() {
    this.getUsedWeight();
  },
  methods: {
    warnUser(val) {
      if(!val && this.settingData.hide_count && this.settingData.hide_dealer_count) {
        this.$nextTick(() => {
          this.settingData.has_hide = 1
          this.$Modal.confirm({
            title: "提示",
            content: `当前经销商等级下设置了${this.settingData.hide_count}个隐藏等级，共拥有【${this.settingData.hide_dealer_count}位】经销商。如切换为【不使用】隐藏等级，则订货价按照经销商等级执行，是否确定切换？`,
            onOk: () => {
              this.settingData.has_hide = 0
            }
          })
        })
      }
    },
    validate(invalidField) {
      this.invalidField = invalidField;
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if(valid) {
            resolve("base")
          } else {
            reject("base")
          }
        })
      })
    },
    getUsedWeight() {
      this.http.post("/shop/admin/dealer/level/enabled/weight", {
        parent_id: 0
      }).then(res => {
        if(res.code == 200) {
          this.usedWeight = res.data.weights
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
 .ivu-form {
   .suffix {
      margin-left: 5px;
    }
    .tips {
      color: #9EA7B4;
      position: absolute;
      top: 25px;
    }
    /deep/.ivu-radio-wrapper {
      margin-right: 20px;
    }
    /deep/.ivu-input-suffix {
      padding-right: 10px;
      line-height: 32px;
      text-align: right;
      width: 40px;
    }
 } 
</style>