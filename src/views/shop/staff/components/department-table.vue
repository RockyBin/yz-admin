<template>
  <div class="department-table">
    <div class="table-header">
      <div class="table-column">
        部门名称
        <span
          style="color:#999;font-weight:normal;"
          v-if="hasPerm('department.operate')"
        >（*拖拽部门名称可以改变同级部门之间的排序）</span>
      </div>
      <div class="table-column">部门员工</div>
      <div class="table-column">操作</div>
    </div>
    <div v-if="data.length" class="table-body">
      <department-table-body :level="1" :data="data" :parent="null" v-on="$listeners"></department-table-body>
    </div>
    <div v-else class="table-body-empty">暂无数据</div>
  </div>
</template>
<script>
import departmentTableBody from "./department-table-body.vue";
export default {
  components: {
    departmentTableBody
  },
  props: {
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
        width: 440px;
      }
      &:nth-child(2) {
        width: 360px;
        text-align: center;
      }
      &:nth-child(3) {
        width: 360px;
        text-align: center;
      }
    }
  }
  .table-body {
    /deep/.table-column {
      &:nth-child(1) {
        width: 440px;
      }
      &:nth-child(2) {
        width: 360px;
        text-align: center;
      }
      &:nth-child(3) {
        width: 360px;
        text-align: center;
      }
    }
  }
  .table-body-empty {
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-size: 13px;
    color: #464c5b;
    border-right: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;
  }
}
</style>