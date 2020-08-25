<template>
  <div class="multi-span-table">
    <table cellspacing="0" cellpadding="0" border="0">
      <colgroup>
        <col :width="column.width" v-for="(column, index) in columnsData" :key="index" />
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="(column, index) in columnsData"
            :style="{textAlign: column.align, minWidth: column.minWidth + 'px'}"
            :key="index"
          >
            <Checkbox
              v-if="selectable && !index"
              @on-change="checkAll"
              :indeterminate="false && selectedData.filter(item=>item).length>0 && selectedData.filter(item=>item).length<listData.length"
              :value="selectedData.filter(item=>item).length == listData.length && listData.length != 0"
              :disabled="!listData.length"
            ></Checkbox>
            <span>{{column.title}}</span>
          </th>
        </tr>
      </thead>
      <tbody v-if="listData.length == 0" class="no-data">
        <tr>
          <td :colspan="columnsData.length">暂无数据</td>
        </tr>
      </tbody>
      <tbody v-else v-for="(item, index) in listData" :key="index" class="has-data">
        <tr>
          <td :colspan="columnsData.length">
            <Checkbox
              v-if="selectable"
              @on-change="checkItem($event,item,index)"
              :value="selectedData.indexOf(item)>-1"
            ></Checkbox>
            <expand :row="item" :render="summaryRender"></expand>
          </td>
        </tr>
        <tr v-for="(subItem, subIndex) in item[subPropName]" :key="subIndex">
          <template v-for="(column, cellIndex) in columnsData">
            <td
              :key="cellIndex"
              :style="{textAlign: column.align, minWidth: column.minWidth + 'px', padding: column.rowSplit && '0px'}"
              v-if="!column.rowSpan || !subIndex"
              :rowspan="column.rowSpan ? item[subPropName].length : 1"
            >
              <expand
                v-if="column.render"
                :row="column.rowSpan ? item : subItem"
                :render="column.render"
              ></expand>
              <span v-else>{{column.rowSpan ? item[column.key] : subItem[column.key]}}</span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
    <Spin fix size="large" v-if="loading">
      <slot name="loading"></slot>
    </Spin>
  </div>
</template>
<script>
import expand from "iview/src/components/table/expand.js";
// import renderHeader from "iview/src/components/table/header.js";
export default {
  props: {
    columnsData: Array,
    listData: Array,
    summaryRender: Function,
    subPropName: String,
    selectable: Boolean,
    loading: Boolean
  },
  components: {
    expand
    // renderHeader
  },
  data() {
    return {
      indeterminate: false,
      selectedData: []
    };
  },
  methods: {
    checkAll(val) {
      this.selectedData = val ? this.listData.concat() : [];
      this.$emit("selectChange", this.selectedData);
    },
    checkItem(val, item, index) {
      this.$set(this.selectedData, index, val ? item : undefined);
      this.$emit("selectChange", this.selectedData.filter(item => item));
    }
  }
};
</script>
<style lang="less" scoped>
.multi-span-table {
  position: relative;
  table {
    width: 100%;
    font-size: 12px;
    thead {
      color: #464C5B;
      font-size: 13px;
      tr {
        height: 40px;
        background: #f8f8f9;
        th {
          padding: 0 14px;
        }
        /deep/.ivu-checkbox-wrapper {
          margin-right: 20px;
        }
      }
    }
    .no-data {
      td {
        color: #657180;
        height: 80px;
        text-align: center;
        border: 1px solid #dcdee2;
      }
    }
    .has-data {
      &:before {
        content: "";
        display: block;
        margin-top: 10px;
      }
      // .has-data:hover {
      //   tr:not(:first-child) {
      //     td {
      //       background-color: red;
      //     }
      //   }
      // }
      tr {
        height: 70px;
        &:nth-child(1) {
          height: 36px;
          background: #f5f6f7;
          td {
            color: #464c5b;
            border-top: 1px solid #dcdee2;
          }
        }
        td {
          color: #657180;
          line-height: 1.5;
          padding: 0 14px;
          vertical-align: middle;
          border-right: 1px solid #dcdee2;
          border-bottom: 1px solid #dcdee2;
          &:nth-child(1) {
            border-left: 1px solid #dcdee2;
          }
        }
        /deep/.ivu-checkbox-wrapper {
          float: left;
          margin-right: 20px;
        }
      }
    }
  }
}
.has-data:hover {
  tr:not(:first-child) {
    td {
      background-color: #F8F9FD;
    }
  }
}
</style>