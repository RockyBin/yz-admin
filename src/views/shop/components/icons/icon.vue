<template>
  <i :class="['iconfont iconfont1',type]" :style="{'color':color,'font-size':size+'px'}"></i>
</template>
<script>
export default {
  props:['type','size','color'],
}
</script>
<style lang="less" scoped>
  
</style>