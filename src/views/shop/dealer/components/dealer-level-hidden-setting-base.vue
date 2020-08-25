<template>
  <Form ref="form" :model="settingData" :rules="rules" :label-width="121">
    <FormItem prop="parent_id" label="关联经销商等级：">
      <Select
        class="common-input-text-200"
        :disabled="!!settingData.id"
        v-model="settingData.parent_id"
        placeholder="请选择经销商等级"
      >
        <Option
          v-for="item in dealerLevelList"
          :key="item.id"
          :value="item.id"
          :disabled="!item.has_hide"
          >{{ item.name }}</Option
        >
      </Select>
    </FormItem>
    <FormItem prop="weight" ref="weight" label="等级权重：">
      <Select
        class="common-input-text-200"
        v-model="settingData.weight"
        placeholder="请选择等级权重"
      >
        <Option
          v-for="item in 99"
          :key="item"
          :value="Number(100 - item)"
          :disabled="hasUseList.includes(100 - item)"
          >{{ 100 - item }}</Option
        >
      </Select>
      <more-message
        text="经销商等级权重，数字越大等级越高"
        style="margin-left: 5px;"
      />
    </FormItem>
    <FormItem prop="name" label="隐藏等级名称：">
      <i-input
        class="common-input-text-200"
        type="text"
        :maxlength="10"
        v-model="settingData.name"
        placeholder="请输入隐藏等级名称"
      >
        <span slot="suffix">{{ settingData.name.length }}/10</span>
      </i-input>
    </FormItem>
    <FormItem prop="discount" label="云仓订货折扣：">
      <InputNumber
        class="common-input-text-200"
        :min="0"
        :max="100"
        :precision="3"
        v-model="settingData.discount"
        placeholder="请输入云仓订货折扣"
      /><span class="suffix">%</span>
    </FormItem>
	<FormItem label="首购最小金额：">
      <InputNumber
        class="common-input-text-200"
        :min="0"
        :max="9999999.99"
        :precision="2"
        v-model="settingData.min_purchase_money_first"
        placeholder="请输入首购最小金额"
      /><span class="suffix">元</span>
    </FormItem>
    <FormItem label="复购最小金额：">
      <InputNumber
        class="common-input-text-200"
        :min="0"
        :max="9999999.99"
        :precision="2"
        v-model="settingData.min_purchase_money"
        placeholder="请输入复购最小金额"
      /><span class="suffix">元</span>
    </FormItem>
	<FormItem label="首购最小进货量：">
      <InputNumber
        class="common-input-text-200"
        :min="0"
        :max="9999999"
        :precision="0"
        v-model="settingData.min_purchase_num_first"
        placeholder="请输入首购最小进货量"
      /><span class="suffix">件</span>
    </FormItem>
	<FormItem label="复购最小进货量：">
      <InputNumber
        class="common-input-text-200"
        :min="0"
        :max="9999999"
        :precision="0"
        v-model="settingData.min_purchase_num"
        placeholder="请输入复购最小进货量"
      /><span class="suffix">件</span>
    </FormItem>
    <FormItem label="最小提货量：">
      <InputNumber
        class="common-input-text-200"
        :min="0"
        :max="9999999"
        :precision="0"
        v-model="settingData.min_take_delivery_num"
        placeholder="请输入最小提货量"
      /><span class="suffix">件</span>
    </FormItem>
    <FormItem label="状态：" style="padding-bottom: 20px;">
      <RadioGroup v-model="settingData.status">
        <Radio :label="1">启用</Radio>
        <Radio :label="0" :disabled="!!settingData.dealer_count">禁用</Radio>
      </RadioGroup>
      <p class="tips" v-if="!!settingData.dealer_count">
        *该等级下有{{ settingData.dealer_count }}位经销商，暂不支持禁用。
      </p>
    </FormItem>
  </Form>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  props: ["settingData", "dealerLevelList"],
  components: {
    moreMessage,
  },
  data() {
    return {
      rules: {
        parent_id: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请选择关联经销商等级"));
            },
          },
        ],
        weight: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              } else {
                return callback(new Error("请选择等级权重"));
              }
            },
          },
          {
            trigger: "loaded",
            validator: (rule, value, callback) => {
              if (!this.hasUseList.includes(value)) {
                return callback();
              } else {
                return callback(new Error("该权重已被使用，请重置"));
              }
            },
          },
        ],
        name: [{ required: true, message: "请输入等级名称", trigger: "blur" }],
        discount: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请输入云仓订货折扣"));
            },
          },
        ],
      },
      hasUseList: [],
    };
  },
  watch: {
    "settingData.parent_id": {
      handler(val, old) {
        if (val) {
          this.hasUseList = [];
          this.onLevelChange();
        }
      },
      immediate: true,
    },
  },
  methods: {
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          if (valid) {
            resolve("base");
          } else {
            reject("base");
          }
        });
      });
    },
    /**
     * 等级权重变化时触发
     */
    onLevelChange() {
      this.$httpPost(
        "/shop/admin/dealer/level/enabled/weight",
        {
          parent_id: this.settingData.parent_id,
        },
        (res) => {
          if (res.code === 200) {
            // 编辑的时候排除自身
            this.hasUseList = res.data.weights.filter(
              (n) => n !== (this.settingData.id && this.settingData.weight)
            );
            this.$refs.weight.validate("loaded");
          }
        }
      );
    },
  },
};
</script>
<style lang="less" scoped>
.ivu-form {
  .suffix {
    margin-left: 5px;
  }
  .tips {
    position: absolute;
    top: 25px;
    color: #9ea7b4;
  }
  /deep/.ivu-input-suffix {
    padding-right: 10px;
    line-height: 32px;
    text-align: right;
    width: 40px;
  }
  /deep/.ivu-form-item .ivu-form-item-label {
    padding-right: 14px !important;
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
  }
}
</style>
