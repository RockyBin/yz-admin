<template>
  <div class="department-table">
    <div class="table-header">
      <div class="table-column">
        标签组名称
        <span
          style="color:#999;font-weight:normal;position: absolute;font-size: 12px;"
          v-if="hasPerm('department.operate')"
          >（*拖拽可以改变同级之间的排序）</span
        >
      </div>
      <div class="table-column">具体标签</div>
      <div class="table-column">操作</div>
    </div>
    <div v-if="data.length" class="table-body">
      <Spin class="ivu-spin-fix" size="large" v-if="loading"></Spin>
      <table-body :data="data" v-on="$listeners"></table-body>
    </div>
    <div v-else class="table-body-empty">
      <Spin class="ivu-spin-fix" v-if="loading" size="large"></Spin
      ><span v-else>暂无数据</span>
    </div>
  </div>
</template>
<script>
import tableBody from "./member-label-table-body.vue";
export default {
  components: {
    tableBody
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>
<style lang="less" scoped>
.department-table {
  border-top: 1px solid #e8eaec;
  border-left: 1px solid #e8eaec;
  .table-header {
    display: flex;
    align-items: center;
    background: #f5f6f7;
    height: 40px;
    line-height: 40px;
    border-right: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;
    .table-column {
      color: #464c5b;
      font-weight: bold;
      flex-grow: 1;
      padding: 0 20px;
      &:nth-child(1) {
        width: 200px;
        text-align: center;
      }
      &:nth-child(2) {
        width: 806px;
        text-align: center;
      }
      &:nth-child(3) {
        width: 150px;
        text-align: center;
      }
    }
  }
  .table-body {
    position: relative;
    /deep/.table-column {
      color: #657180;
      &:nth-child(1) {
        width: 200px;
        text-align: center;
      }
      &:nth-child(2) {
        width: 806px;
        text-align: center;
      }
      &:nth-child(3) {
        width: 150px;
        text-align: center;
      }
    }
  }
  .table-body-empty {
    position: relative;
    height: 80px;
    line-height: 80px;
    text-align: center;
    font-size: 13px;
    color: #464c5b;
    border-right: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;
  }
}
</style>
