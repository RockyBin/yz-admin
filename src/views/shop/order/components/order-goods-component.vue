<template>
  <div>
    <div v-if="status === 'news'" class="news-style" perm="member.detail.view" @click="$router.push({name: 'memberDetail', query: {id: datas.member_id}})">
      <div>
        <label>昵称：</label>
        <label>{{ datas.member_nickname }}</label>
      </div>
      <div>
        <label>姓名：</label>
        <label>{{ datas.member_name||'--' }}</label>
      </div>
      <div>
        <label>手机：</label>
        <label>{{ datas.member_mobile }}</label>
      </div>
    </div>
    <div v-if="status === 'order'">
      <div>
        <label>￥</label>
        <label>{{ datas.money }}</label>
      </div>
      <div v-if="datas.virtual_flag!=1">
        <div v-if="datas.freight && datas.freight !== '0.00'">(含运费￥ {{datas.freight}} )</div>
        <div v-else>(包邮)</div>
      </div>
    </div>
    <div v-if="status === 'remark'">
      <div>
        <label>{{ datas.remark ? datas.remark : "-" }}</label>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    datas: {
      type: Object,
      default: () => {}
    },
    status: {
      type: String,
      default: ""
    }
  }
};
</script>
<style lang="less" scoped>
.common-order-style {
  cursor: pointer;
}
.news-style {
  display: inline-block;
  text-align: left;
  cursor: pointer;
  * {
    cursor: pointer;
  }
}
</style>
