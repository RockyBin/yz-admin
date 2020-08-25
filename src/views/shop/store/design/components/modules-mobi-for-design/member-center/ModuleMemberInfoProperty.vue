<template>
  <div class="property-container">
    <h3>
      <span>会员信息设置</span>
    </h3>
    <div class="property-container-content">
      <Form>
        <FormItem>
          <div class="property-container-title">选择样式</div>
          <message-box>
            <div class="property-layout">
              <div class="property-layout-item" :class="{'active': module.layout === 1}" @click="module.layout = 1">
                <img :src="require('./images/member_information1.png')" alt="">
                <div>样式1</div>
              </div>
              <div class="property-layout-item" :class="{'active': module.layout === 2}" @click="module.layout = 2">
                <img :src="require('./images/member_information2.png')" alt="">
                <div>样式2</div>
              </div>
            </div>
          </message-box>
        </FormItem>
        <FormItem>
          <div class="property-container-title">显示内容</div>
          <div>
            <Checkbox :true-value="1" :false-value="0" v-model="module.invitation_code_is_show">邀请码展示在&lt;个人中心></Checkbox><br>
            <Checkbox :true-value="1" :false-value="0" v-model="module.member_level_is_show">会员等级</Checkbox>
          </div>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script>
import messageBox from "./components/message-box"
export default {
  props: ["module"],
  components: {
    messageBox
  },
  data() {
    return {}
  }
};
</script>
<style lang="less" scoped>
</style>