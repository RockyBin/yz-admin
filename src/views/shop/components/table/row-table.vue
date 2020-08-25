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
              <Checkbox :value="checkedAll" @click.native="checkAll" class="checkbox" :disabled="!listData.length"></Checkbox>
              {{ item.title }}
            </th>
            <th
              :key="index"
              :style="{width: item.width,'text-align': item.align}"
              class="container-padding"
              v-else
            >
              {{ item.title }}
              <more-message
                v-if="item.tooltip"
                :text="item.tooltip"
                :max-width="330"
                style="height:auto;vertical-align:unset;padding-left:5px;font-weight: normal;"
              ></more-message>
              <label v-if="item.titleLabel" style="font-size: 12px">{{ item.titleLabel }}</label>
            </th>
          </template>
        </tr>
        <tr v-if="listData.length" style="height:10px"></tr>
      </thead>
      <tbody v-if="listData.length === 0">
        <tr>
          <td :colspan="columnsData.length" class="no-data" v-if="!loading">暂无数据</td>
        </tr>
      </tbody>
      <template v-for="(row, index) in listData" v-else>
        <tbody :key="index" class="tobdy-margin">
          <tr>
            <td :colspan="columnsData.length">
              <Checkbox v-model="row.checked" class="checkbox"></Checkbox>
              <label v-for="(data, keyIndex) in headData[index]" :key="keyIndex">
                <label v-for="(datas, keyIndexs) in headData[index].a" :key="keyIndexs">
                  <label>{{data[keyIndexs].key}}</label>
                  <label>{{data[keyIndexs].value}}</label>
                  <tagMessage v-if="data[keyIndexs].tag" style="margin-left: 12px;" :backgroundColor="'#FF9900'" :tagName="data[keyIndexs].tag" />
                  <!--<label style="margin-left: 12px;" class="table-back" v-if="data[keyIndexs].tag">{{data[keyIndexs].tag}}</label>-->
                </label>
              </label>
            </td>
          </tr>
          <tr v-if="!row.item_list">
            <td
              v-for="(columns, indexs) in columnsData"
              :key="indexs"
              :style="{width: columns.width, padding: columns.padding, 'text-align': columns.align}"
              class="container-padding"
            >
              <expand v-if="columns.render" :row="row" :render="columns.render"></expand>
              {{row[columns.key]}}
            </td>
          </tr>
          <template v-for="(rows, indexes) in row.item_list" v-else>
            <tr :key="indexes">
              <template v-for="(columns, indexs) in columnsData">
                <td
                  :key="indexs"
                  :rowspan="columns.rowSpan ? row.item_list.length : false"
                  v-if="indexes < 1 && columns.rowSpan"
                  :style="{width: columns.width, padding: columns.padding, 'min-width': columns.minWidth, 'max-width': columns.maxWidth,'text-align': columns.align}"
                  class="container-padding"
                >
                  <expand
                    v-if="columns.render && !columns.showIndex && !columns.rowSpan  && !columns.levelData"
                    :row="rows"
                    :render="columns.render"
                  ></expand>
                  <expand
                    v-if="columns.render && columns.levelData"
                    :row="row"
                    :render="columns.render"
                  ></expand>
                  <expand
                    v-if="columns.render && !columns.showIndex && columns.rowSpan && indexes < 1 && !columns.levelData"
                    :row="rows"
                    :render="columns.render"
                  ></expand>
                  <div v-if="columns.showIndex && indexes < 1">
                    <component :is="columns.expandComponents" :datas="row" :status="columns.status"></component>
                  </div>
                  {{rows[columns.key]}}
                </td>
                <td
                  :key="indexs"
                  :rowspan="columns.rowSpan ? row.item_list.length : false"
                  v-if="!columns.rowSpan"
                  :style="{width: columns.width, padding: columns.padding, 'min-width': columns.minWidth, 'max-width': columns.maxWidth,'text-align': columns.align}"
                  class="container-padding"
                >
                  <expand
                    v-if="columns.render && !columns.showIndex && !columns.rowSpan && !columns.levelData"
                    :row="rows"
                    :render="columns.render"
                  ></expand>
                  <expand
                    v-if="columns.render && columns.levelData"
                    :row="row"
                    :render="columns.render"
                  ></expand>
                  <expand
                    v-if="columns.render && !columns.showIndex && columns.rowSpan && indexes < 1 && !columns.levelData"
                    :row="rows"
                    :render="columns.render"
                  ></expand>
                  <div v-if="columns.showIndex && indexes < 1">
                    <component :is="columns.expandComponents" :datas="row" :status="columns.status"></component>
                  </div>
                  {{rows[columns.key]}}
                </td>
              </template>
            </tr>
          </template>
          <Spin fix size="large" v-if="loading">
            <slot name="loading"></slot>
          </Spin>
        </tbody>
      </template>
    </table>
  </div>
</template>
<script>
import expand from "iview/src/components/table/expand.js";
import orderGoodsComponent from "./order-goods-component.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
import tagMessage from "@/views/shop/components/label/label.vue";
export default {
  components: {
    expand,
    orderGoodsComponent,
    moreMessage,
    tagMessage
  },
  props: {
    // 动态组件
    expandComponents: {
      type: Array,
      default: () => []
    },
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
    idName: {
      type: String,
      default: "id"
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
      let status = false;
      this.listData.forEach(item => {
        if (item.checked) {
          this.checkData.push(item[this.idName]);
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
          commonExpand = expandMember;
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
        }
      }
    }
    .tobdy-margin:not(:first-child) {
      color: #657180;
    }
    .tobdy-margin:hover {
      tr:not(:first-child) {
        td {
          background-color: #F8F9FD;
        }
      }
    }
    tbody.tobdy-margin::before {
      content: "";
      display: block;
      margin-bottom: 14px;
    }
    tbody.tobdy-margin {
      tr {
        td {
          height: 80px;
          border-bottom: 1px solid #e8eaec;
          border-left: 1px solid #e8eaec;
        }
      }
      tr:nth-child(2) {
        td:last-child {
          border-right: 1px solid #e8eaec;
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

