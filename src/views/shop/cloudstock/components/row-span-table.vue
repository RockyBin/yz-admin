<template>
<div class="row-span-table">
<table ref="table" cellspacing="0" cellpadding="0" border="0" :style="{minWidth:minWidth + 'px'}">
  <colgroup>
    <col :width="Math.max(column.minWidth||0,column.width||0,averageWidth)" v-for="(column, index) in columnsData" :key="index">
  </colgroup>
  <thead>
    <tr>
      <th 
        v-for="(column, index) in columnsData" 
        :style="{textAlign: column.align}" 
        :key="index"
      >
        <Checkbox 
          v-if="selectable && !index" 
          @on-change="checkAll" 
          :disabled="listDataCopy.filter(item => !disableItem(item)).length == 0"
          :indeterminate="selectedID.filter(id=>id).length>0 && selectedID.filter(id=>id).length<listDataCopy.filter(item => !disableItem(item)).length"
          :value="selectedID.filter(id=>id).length==listDataCopy.filter(item => !disableItem(item)).length && listDataCopy.filter(item => !disableItem(item)).length > 0"
        ></Checkbox>
        <span>{{column.title}}</span>
      </th>
    </tr>
  </thead>
  <tbody v-if="listDataCopy.length == 0" class="no-data">
    <tr>
      <td :colspan="columnsData.length">暂无数据</td>
    </tr>
  </tbody>
  <tbody v-else class="has-data">
    <tr v-for="(item, index) in listDataCopy" :key="index">
      <template v-for="(column, subIndex) in columnsData">
        <td 
          v-if="rowSpanKey.indexOf(column.key) == -1 || item._rowSpan && item._rowSpan[column.key]"
          :rowspan="rowSpanKey.indexOf(column.key) == -1 ? 1 : item._rowSpan && item._rowSpan[column.key]"
          :key="subIndex"
          :style="{textAlign: column.align}"
        >
          <div :class="{'flex-wrapper': selectable && !subIndex}" >
            <Checkbox 
              v-if="selectable && !subIndex" 
              @on-change="checkItem($event,item.id,index)" 
              :value="selectedID.indexOf(item.id) > -1 && !disableItem(item)"
              :disabled="disableItem(item)"
            ></Checkbox>
            <expand v-if="column.render" :row="item" :render="column.render"></expand>
            <span v-else>{{item[column.key]}}</span>
          </div>
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
export default {
  props: {
    minWidth: {
      type: Number,
      default: 1000
    },
    columnsData: {
      type: Array,
      default() {
        return []
      }
    },
    listData: {
      type: Array,
      default() {
        return []
      }
    },
    disableItem: {
      type: Function,
      default: () => false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    rowSpanKey: {
      type: Array,
      default() {
        return []
      }
    }
  },
  components: {
    expand,
  },
  data() {
    return {
      indeterminate: false,
      selectedID: [],
      averageWidth: 0,
      listDataCopy: []
    }
  },
  watch: {
    "listData": {
      handler() {
        this.listDataCopy = this.listData.concat();
        this.sortListData(this.listDataCopy, this.rowSpanKey)
      },
    },
    "columnsData": {
      handler() {
        this.calcColumnWidth();
      },
      immediate: true
    }
  },
  methods: {
    sortListData(list, keys){
      list.sort((item1, item2) => {
        for(var i=0;i<keys.length;i++){
          if(item1[keys[i]] > item2[keys[i]]){
            return 1
          } else if(item1[keys[i]] < item2[keys[i]]){
            return -1
          } else {
            continue;
          }
        }
        return 0
      })
      keys.forEach(key => {
        let temp = {};
        list.forEach(item => {
          if(!item._rowSpan){
            this.$set(item, '_rowSpan', {})
            // item._rowSpan = {}
          }
          if(item[key] === temp[key]){
            item._rowSpan[key] = 0
            temp._rowSpan[key]++
          } else {
            item._rowSpan[key] = 1
            temp = item
          }
        })
      })
    },
    calcColumnWidth() {
      // var tableWidth = this.$refs.table.offsetWidth;
      var width = 0, count = 0;
      this.columnsData.forEach(column => {
        if(column.minWidth) {
          width += column.minWidth;
        } else if(column.width) {
          width += column.width;
        } else {
          count++
        }
      })
      this.averageWidth = (this.minWidth - width) / count;
    },
    checkAll(val) {
      this.selectedID = val ? this.listDataCopy.filter(item => !this.disableItem(item)).map(item => item.id) : [];
      this.$emit("selectChange", this.selectedID.filter(id => id));
    },
    checkItem(val, id, index) {
      this.$set(this.selectedID, index, val ? id : undefined);
      this.$emit("selectChange", this.selectedID.filter(id => id));
    },
    clearSelect() {
      this.selectedID = [];
      this.$emit("selectChange", this.selectedID)
    }
  }
}
</script>
<style lang="less" scoped>
  .row-span-table {
    position: relative;
    table {
      width: 100%;
      font-size: 12px;
      table-layout: fixed;
      /deep/.ivu-checkbox-wrapper{
        margin-right: 28px;
      }
      thead {
        font-size: 13px;
        tr {
          height: 40px;
          background: #F8F8F9;
          th {
            padding: 0 14px;
            border-top: 1px solid #DCDEE2;
            border-bottom: 1px solid #DCDEE2;
            &:first-child {
              border-left: 1px solid #DCDEE2;
            }
            &:last-child {
              border-right: 1px solid #DCDEE2;
            }
          }
        }
      }
      .no-data {
        td {
          height: 80px;
          text-align: center;
          border: 1px solid #DCDEE2;
          border-top: none;
        }
      }
      .has-data {
        tr {
          height: 70px;
          td {
            line-height: 1.5;
            padding: 0 14px;
            vertical-align: middle;
            border-right: 1px solid #DCDEE2;
            border-bottom: 1px solid #DCDEE2;
            &:nth-child(1) {
              border-left: 1px solid #DCDEE2;
            }
          }
          .flex-wrapper{
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }
</style>