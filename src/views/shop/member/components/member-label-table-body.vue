<template>
  <div class="container">
    <draggable
      :list="data"
      :options="dragOption"
      @start="startDrag"
      @sort="endDrag"
    >
      <div class="dragable" v-for="(item, index) in data" :key="index">
        <div :class="{ 'table-row': true }">
          <div class="table-column">
            <div class="table-column-center">
              {{ item.name }}({{ item.member_relation_label_count }})
            </div>
          </div>
          <div class="table-column">
            <div
              style="text-align: left;margin: -4px 0 0 -8px;padding: 8px 0px;"
              class="table-column-center"
            >
              <div
                style="backgroundColor: #F7F7F9;border: 1px solid #EFEFEF;borderRadius: 3px;display: inline-block;padding: 0 10px;margin: 8px 0 0 8px;lineHeight: 20px;cursor: default;"
                v-for="(item1, index1) in item.children"
                :key="index1"
              >
                {{ item1.name }}({{ item1.member_relation_label_count }})
              </div>
            </div>
          </div>
          <div class="table-column">
            <div class="table-column-center">
              <span
                class="table-operation"
                perm="member.label.operate"
                @click="edit(item)"
                >编辑</span
              >
              <span class="table-operation">|</span>
              <span
                class="table-operation"
                perm="member.label.operate"
                @click="del(item)"
                >删除</span
              >
            </div>
          </div>
        </div>
      </div>
    </draggable>
  </div>
</template>
<script>
import draggable from "vuedraggable";
export default {
  components: {
    draggable
  },
  props: {
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
        sort: this.hasPerm("member.label.operate")
      }
    };
  },
  methods: {
    edit(item) {
      this.$emit("edit", item);
    },
    del(item) {
      this.$emit("del", item);
    },
    startDrag() {
      if (!this.hasPerm("member.label.operate")) {
        this.$root.$children[0].showPermModal = true;
      }
    },
    endDrag({ oldIndex, newIndex }) {
      this.$emit("sort", oldIndex, newIndex);
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  .table-row {
    display: flex;
    min-height: 70px;
    align-items: center;
    background: white;
    border-right: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;
    &:hover {
      background: #f8f9fd;
    }
    .table-column {
      position: relative;
      flex-grow: 1;
      align-self: stretch;
      color: #464c5b;
      font-size: 12px;
      padding: 0 14px;
      border-right: 1px solid #e8eaec;
      .table-column-center {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
      }
      &:last-child {
        border-right: none;
      }
      .ivu-icon {
        margin-right: 10px;
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
        text-decoration: none;
      }
    }
  }
}
</style>
