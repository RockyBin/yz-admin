<template>
<div class="container">
  <draggable :list="data" v-bind="dragOption" @start="startDrag" @sort="endDrag">
    <div class="drag" :class="{open: item.isOpen}" v-for="(item,index) in data" :key="index">
      <div :class="{'table-row':true,'sub-item':level>1}" @click="toggle(item)">
        <div 
          class="table-column" 
          :style="`padding-left: ${27*level}px`"
        >
          <Icon 
            v-if="level==1" 
            :class="{open: item.isOpen}"
            type="md-arrow-dropdown" 
            :color="item.sub_list&&item.sub_list.length?'#686868':'#fff'"
            size="20"
          ></Icon>
          <span v-else class="custom-icon"></span>
          <span class="content">{{item.name}}</span>
        </div>
        <div class="table-column">{{level==1?'共':''}}<span class="table-operation" style="margin:0 5px;" perm="staff.view" @click="goToStaffList(item.id)">{{item.admin_count}}</span>人</div>
        <div class="table-column">
          <span class="table-operation" perm="department.operate" v-if="level==1" @click.stop="add(item,parent)">添加二级</span>
          <span class="table-operation" v-if="level==1">|</span>
          <span class="table-operation" perm="department.operate" @click.stop="edit(item,parent)">编辑</span>
          <span class="table-operation">|</span>
          <span class="table-operation" perm="department.operate" @click.stop="del(item,parent)">删除</span>
        </div>
      </div>
      <department-table-body
        v-if="item.sub_list && item.sub_list.length"
        :data="item.sub_list"
        :level="level + 1"
        :parent="item"
        v-on="$listeners"
      ></department-table-body>
    </div>
  </draggable>
</div>
</template>
<script>
import draggable from "vuedraggable";
export default {
  name: "department-table-body",
  components: {
    draggable
  },
  props: {
    level: {
      type: Number,
      default: 1
    },
    parent: {
      type: Object,
      default: null
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      dragOption: {
        emptyInsertThreshold: 10,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        handle: ".drag",
        sort: this.hasPerm("department.operate")
      }
    };
  },
  methods: {
    toggle(item) {
      if(item.sub_list && item.sub_list.length) {
        item.isOpen = !item.isOpen;
      }
    },
    add(item, parent) {
      this.$emit("addDepartment", item, parent);
    },
    edit(item, parent) {
      this.$emit("editDepartment", item, parent);
    },
    del(item, parent) {
      this.$emit("deleteDepartment", item, parent);
    },
    startDrag() {
      if (!this.hasPerm("department.operate")) {
        this.$root.$children[0].showPermModal = true;
      }
    },
    endDrag() {
      this.$emit("sortDepartment")
    },
    goToStaffList(departmentId) {
      this.$router.push({
        name: "staffList",
        query: { id: departmentId}
      })
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  .drag {
    height: 48px;
    overflow: hidden;
    &.open {
      height: auto;
    }
  }
  .table-row {
    display: flex;
    align-items: center;
    background: white;
    height: 48px;
    line-height: 48px;
    border-right: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;
    &:hover {
      background: #f8f9fd;
    }
    &.sub-item {
      .table-column {
        color: #657180;
      }
    }
    .table-column {
      color: #464c5b;
      font-size: 12px;
      flex-grow: 1;
      padding: 0 20px;
      &:nth-child(2) {
        font-size: 13px;
      }
      .ivu-icon {
        margin-right: 10px;
        transform: rotate(-90deg);
        transition: all 0.2s;
        &.open {
          transform: rotate(0deg);
        }
      }
      .custom-icon {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-left: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        margin-right: 8px;
      }
      .table-operation:nth-child(2n) {
        margin: 0 12px;
        cursor: default;
        font-size: 13px;
        text-decoration: none;
      }
    }
  }
}
</style>