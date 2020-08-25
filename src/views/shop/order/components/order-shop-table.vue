<template>
  <div class="row-table">
    <table class="gridtable" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <template v-for="(item, index) in columnsData">
            <th
              :key="index"
              :style="{width: item.width,'text-align': item.align}"
              v-if="index < 1"
              class="container-padding"
            >
              <Checkbox :value="checkedAll" @click.native="checkAll" class="checkbox" :disabled="listData.length === 0"></Checkbox>
              {{ item.title }}
            </th>
            <th
              :key="index"
              :style="{width: item.width,'text-align': item.align,padding: item.padding}"
              class="container-padding"
              v-else
            >
              {{ item.title }}
              <label
                v-if="item.titleLabel"
                style="font-size: 12px"
              >{{ item.titleLabel }}</label>
            </th>
          </template>
        </tr>
        <tr v-if="listData.length" style="height:10px"></tr>
      </thead>
      <tbody v-if="listData.length === 0">
        <tr v-if="!loading">
          <td :colspan="columnsData.length" class="no-data">暂无数据</td>
        </tr>
      </tbody>
      <template v-for="(row, index) in listData">
        <tbody :key="index" class="tobdy-margin">
          <tr>
            <td :colspan="columnsData.length">
              <Checkbox v-model="row.checked" class="checkbox"></Checkbox>
              <label v-for="(data, keyIndex) in headData[index]" :key="keyIndex">
                <label v-for="(datas, keyIndexs) in headData[index].a" :key="keyIndexs">
                  <label>{{data[keyIndexs].key}}</label>
                  <label>{{data[keyIndexs].value}}</label>
                  <tagMessage v-if="data[keyIndexs].tag" style="margin-left: 12px;" :backgroundColor="'#FF9900'" :tagName="data[keyIndexs].tag" />
                </label>
              </label>
            </td>
          </tr>
          <template v-for="(rows, indexes) in row.item_list">
            <tr :key="indexes">
              <template v-for="(columnRow, rowIndex) in columnsData">
                <td
                  :key="rowIndex"
                  :rowspan="columnRow.rowSpan ? row.item_list.length : false"
                  v-if="indexes < 1 && columnRow.rowSpan"
                  :style="{width: columnRow.width, padding: columnRow.padding,'text-align': columnRow.align, 'min-width': columnRow.minWidth, 'max-width': columnRow.maxWidth}"
                  :class="columnRow.isShowClass"
                  class="container-padding"
                >
                  <expand
                    v-if="columnRow.render && !columnRow.showIndex && !columnRow.levelData"
                    :row="rows"
                    :render="columnRow.render"
                  ></expand>
                  <expand
                    v-if="columnRow.render && columnRow.levelData"
                    :row="row"
                    :render="columnRow.render"
                  ></expand>
                  <div v-if="columnRow.showIndex && indexes < 1">
                    <component
                      :is="columnRow.expandComponents"
                      :datas="row"
                      :status="columnRow.status"
                    ></component>
                  </div>
                  {{rows[columnRow.key]}}
                </td>
                <td
                  :key="rowIndex"
                  :rowspan="columnRow.rowSpan ? row.item_list.length : false"
                  v-if="!columnRow.rowSpan && !columnRow.breakUp"
                  :style="{width: columnRow.width, padding: columnRow.padding,'text-align': columnRow.align,'min-width': columnRow.minWidth, 'max-width': columnRow.maxWidth}"
                  class="container-padding"
                >
                  <expand
                    v-if="columnRow.render && !columnRow.levelData"
                    :row="rows"
                    :render="columnRow.render"
                  ></expand>
                  <expand
                    v-if="columnRow.render && columnRow.levelData"
                    :row="row"
                    :render="columnRow.render"
                  ></expand>
                  {{rows[columnRow.key]}}
                </td>
                <td
                  :key="rowIndex"
                  :rowspan="rows.rowspan ? rows.rowspan : false"
                  v-if="!columnRow.rowSpan && rows.rowspan && columnRow.breakUp"
                  :style="{width: columnRow.width, padding: columnRow.padding,'text-align': columnRow.align,'min-width': columnRow.minWidth, 'max-width': columnRow.maxWidth}"
                  class="container-padding"
                >
                  <expand v-if="columnRow.render" :row="rows" :render="columnRow.render"></expand>
                  {{rows[columnRow.key]}}
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </template>
      <Spin fix size="large" v-if="loading">
        <slot name="loading"></slot>
      </Spin>
    </table>
  </div>
</template>
<script>
import expand from "iview/src/components/table/expand.js";
import orderGoodsComponent from "./order-goods-component.vue";
import tagMessage from "@/views/shop/components/label/label.vue";
export default {
  components: {
    expand,
    orderGoodsComponent,
    tagMessage
  },
  props: {
    columnsData: {
      type: Array,
      default: () => []
    },
    listData: {
      type: Array,
      default: () => []
    },
    headData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      single: false,
      checkData: []
    };
  },
  computed: {
    checkedAll() {
      this.chooseData();
      return this.listData.length &&
        this.listData.filter(item => item.checked).length ===
          this.listData.length
        ? true
        : false;
    }
  },
  methods: {
    // 返回选中的数据
    chooseData() {
      this.checkData = [];
      this.listData.forEach(item => {
        if (item.checked) {
          this.checkData.push(item.id);
        }
      });
      this.$emit("backChooseData", this.checkData);
    },
    // 按钮全选
    checkAll() {
      let status = this.checkedAll;
      this.listData.forEach(item => {
        this.$set(item, "checked", !status);
      });
    },
    // 动态组件
    changeComp(name) {
      let commonExpand = "";
      switch (name) {
        case "orderGoodsComponent":
          commonExpand = orderGoodsComponent;
          break;
        default:
          break;
      }
      return commonExpand;
    }
  }
};
</script>
<style lang="less" scoped>
.row-table {
  position: relative;
  font-size: 12px;
  .container-padding {
    padding: 0 14px;
  }
  .gridtable {
    .checkbox {
      margin: 0 13.5px;
    }
    height: auto;
    width: 100%;
    thead {
      tr {
        th {
          height: auto;
          // border-top: 1px solid #e8eaec;
          // border-bottom: 1px solid #e8eaec;
          padding: 11px 0;
          background: #f8f8f9;
          font-size: 13px;
          color: #464c5b;
          font-weight: bold;
        }
      }
    }
    tbody.tobdy-margin::before {
      content: "";
      display: block;
      margin-bottom: 15px;
    }
    .tobdy-margin:hover {
      tr:not(:first-child) {
        td {
          background-color: #F8F9FD;
        }
      }
    }
    tbody.tobdy-margin {
      tr {
        td {
          height: 80px;
          border-bottom: 1px solid #e8eaec;
          border-right: 1px solid #e8eaec;
          font-size: 12px;
          color: #657180;
        }
      }
      tr {
        td:first-child {
          border-left: 1px solid #e8eaec;
        }
      }
      tr:first-child {
        td:last-child {
          border: 1px solid #e8eaec;
          height: auto;
          padding: 9px 0;
          background: #f5f6f7;
        }
        td:first-child {
          color: #464c5b;
          & > label {
            & > label:not(:first-child) {
              margin-left: 30px;
            }
          }
        }
      }
    }
    tbody {
      tr {
        td.no-data {
          height: 80px;
          text-align: center;
          border: 1px solid #e8eaec;
          border-top: none;
        }
      }
    }
  }
}
</style>
