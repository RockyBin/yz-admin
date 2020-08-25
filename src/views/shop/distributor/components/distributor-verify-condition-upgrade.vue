<template>
  <div>
    <div class="item">
      <div class="key">申请分销商时间：</div>
      <div class="value">{{info.created_at?info.created_at:"--"}}</div>
    </div>
    <div class="item">
      <div class="key">升级等级：</div>
      <div class="value">{{JSON.parse(info.auto_upgrade_data).level_info.level_name}}</div>
    </div>
    <div class="item">
      <div class="key">自动升级条件：</div>
      <distributor-logic class="value" :logic="JSON.parse(info.auto_upgrade_data).text"></distributor-logic>
    </div>
  </div>
</template>
<script>
import distributorLogic from "@/views/shop/components/logic/logic-or-and.vue";
export default {
  props: ["info"],
  components: {
    distributorLogic
  }
};
</script>
<style lang="less" scoped>
.item {
  display: flex;
  .key {
    flex-shrink: 0;
  }
  .value > div:not(:last-child) {
    margin-bottom: 5px;
  }
  &:not(:last-child) {
    margin-bottom: 15px;
  }
}
</style>