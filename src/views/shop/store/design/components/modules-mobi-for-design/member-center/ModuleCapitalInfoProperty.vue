<template>
  <div class="property-container">
    <h3>
      <span>资金信息设置</span>
    </h3>
    <div class="property-container-content">
      <Form>
        <FormItem>
          <div class="property-container-title">显示内容</div>
          <div
            class="property-container-title"
            style="padding-top: 0;font-size: 12px;"
            v-show="!designData.retail_status"
          >*未激活的功能请到&lt;通用设置-开启零售功能>激活生效</div>
          <div>
            <Checkbox :true-value="1" :false-value="0" v-model="module.my_balance_is_show">我的余额</Checkbox><br>
            <Checkbox :true-value="1" :false-value="0" v-model="module.my_point_is_show">我的积分</Checkbox><br>
            <Checkbox :true-value="1" :false-value="0" v-model="module.my_coupon_is_show" :disabled="!designData.retail_status">优惠券</Checkbox>
          </div>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script>
export default {
  props: ["module", "designData"],
  data() {
    return {}
  }
};
</script>
<style lang="less" scoped>
</style>