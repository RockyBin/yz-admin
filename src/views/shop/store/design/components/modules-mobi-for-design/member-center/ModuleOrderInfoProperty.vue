<template>
  <div class="property-container">
    <h3>
      <span>订单信息设置</span>
    </h3>
    <div class="property-container-content">
      <Form>
        <FormItem>
          <div class="property-container-title">*该模块由系统根据设置自动展现，无需编辑</div>
          <div
            class="property-container-title"
            style="padding-top: 0;font-size: 12px;"
            v-show="!designData.retail_status"
          >*未激活的功能请到&lt;通用设置-开启零售功能>激活生效</div>
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