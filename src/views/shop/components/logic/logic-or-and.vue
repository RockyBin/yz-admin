<template>
  <div v-if="logic">
    <!-- 与逻辑显示 -->
    <span v-if="logic.or.length">【</span>
    <template v-for="(item, index) in logic.or">
      <span v-if="index !== 0" :key="'ort' + index" style="margin: 0 9px;color: #4A6AF5;">或</span>
      <span :key="'or' + index">{{item}}</span>
    </template>
    <span v-if="logic.or.length">】</span>
    <!-- 与或逻辑之间的文字 -->
    <span
      v-if="logic.and.length &&  logic.or.length"
      style="margin: 0 9px;color: #4A6AF5;"
    >与</span>
    <!-- 或逻辑显示 -->
    <template v-for="(item, index) in logic.and">
      <span :key="'andt' + index" v-if="index !== 0" style="margin: 0 9px;color: #4A6AF5;">与</span>
      <span :key="'and' + index">【{{item}}】</span>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    logic: {
      type: Object,
      default() {
        return {
          or: [],
          and: []
        }
      }
    }
  },
  data() {
    return {}
  }
}
</script>