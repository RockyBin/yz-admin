<template>
  <div class="property-container">
    <h3>
      <span>页面设置</span>
    </h3>
    <div class="property-container-content">
      <Form ref="formValidate" :model="pageInfo" :rules="ruleValidate">
        <FormItem prop="title">
          <div class="property-container-title property-container-title-required" style="margin-bottom: 10px;">页面标题</div>
          <div>
            <i-input v-model="pageInfo.title" placeholder="请输入页面标题" style="width:100%" :maxlength="10">
              <span slot="suffix">{{pageInfo.title?pageInfo.title.length:0}}/10</span>
            </i-input>
          </div>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: ["pageInfo"],
  data() {
    return {
      ruleValidate: {
        title: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value.trim()) {
                return callback();
              }
              return callback(new Error("请输入页面标题"));
            }
          }
        ]
      }
    };
  }
};
</script>
<style lang="less" scoped>
@import "./modules-mobi-for-design/property-container.less";
</style>
