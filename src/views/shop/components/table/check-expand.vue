<template>
  <div>
    <div class="table-head">
      <div
        v-for="(item, index) in columnsData"
        :key="index"
        class="table-list"
        :style="{width: item.width || widths, 'text-align': item.align, 'min-width': item.minWidth, 'max-width': item.maxWidth, 'padding-left': item.paddingLeft || '14px'}"
        style="padding: 0 14px"
      >
        <span
          v-if="item.key==='checkbox'"
          :class="{'ivu-checkbox-checked': checkedAll, 'ivu-checkbox': true, 'ivu-checkbox-disabled': listData.length === 0}"
          @click="checkboxClass"
        >
          <span class="ivu-checkbox-inner ivu-checkbox-focus"></span>
          <input type="checkbox" class="ivu-checkbox-input" :disabled="listData.length === 0" />
        </span>
        {{ item.title }}
      </div>
    </div>
    <div style="position: relative">
      <div v-if="listData.length === 0" class="noDate">暂无数据</div>
      <div
        v-for="(row, index) in listData"
        :key="index"
        class="table-container"
        :class="{'expand': rowIndex.indexOf(index) !== -1  && row.openDetail, 'expand-style': rowIndex.indexOf(index) !== -1   && row.openDetail && expandComponents === 'expandFinanace'}"
      >
        <div
          v-for="(columns, indexs) in columnsData"
          :key="indexs"
          :style="{width: columns.width || widths, 'text-align': columns.align, 'min-width': columns.minWidth, 'max-width': columns.maxWidth, 'padding-left': columns.paddingLeft  || '14px'}"
          class="table-list"
          :class="{'no-wrap': columns.isShowWrap}"
          style="padding: 0 14px"
        >
          <expand v-if="columns.render" :render="columns.render" :index="index" :row="row"></expand>
          {{row[columns.key]}}
        </div>
        <transition name="transition-drop" mode="out-in" appear>
          <div
            v-if="row.openDetail"
            class="show-expand"
            :class="{'expand-finance': expandComponents === 'expandFinanace'}"
          >
            <component
              :detailsData="detailsData.filter(item => item.index === index)"
              :changeData="changeData.filter(item => item.index === index)"
              :saveDetails="saveDetails.filter(item => item.index === index)"
              :rowIndex="saveDetails.findIndex(item => item.index === index)"
              :is="commonExpand"
              @passBlurData="passBlurData"
              :resetData="resetData"
              :isShowInput="isShowInput.filter(item => item.index === index)"
              @resetInputData="resetInputData"
              :place="place"
              :password="password"
              :memberLevelList="memberLevelList"
              @rechange="rechange"
              @passwordBlurData="passwordBlurData"
            ></component>
          </div>
        </transition>
      </div>
      <Spin fix size="large" v-if="loading">
        <slot name="loading"></slot>
      </Spin>
    </div>
  </div>
</template>
<script>
import expand from "iview/src/components/table/expand.js";
import expandMember from "./expand-member.vue";
import expandFinance from "./expand-finance.vue";
export default {
  components: {
    expand,
    expandMember,
    expandFinance
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    detailsData: {
      type: Array,
      default() {
        return [];
      }
    },
    changeData: {
      type: Array,
      default() {
        return [];
      }
    },
    saveDetails: {
      type: Array,
      default() {
        return [];
      }
    },
    place: {
      type: Array,
      default() {
        return [];
      }
    },
    memberLevelList: {
      type: Array,
      default() {
        return [];
      }
    },
    isShowInput: {
      type: Array,
      default() {
        return [];
      }
    },
    resetData: {
      type: Object,
      default() {
        return {};
      }
    },
    detailIndex: {
      type: Number,
      default: 0
    },
    password: {
      type: String,
      default: ""
    },
    expandComponents: {
      type: String,
      default: ""
    },
    openDetail: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    // 显示某一行
    rowIndex: {
      type: Array,
      default() {
        return [];
      }
    },
    // 列表头部数据
    columnsData: {
      type: Array,
      default() {
        return [];
      }
    },
    // 列表需要显示的用户数据
    listData: {
      type: Array,
      default() {
        return [];
      }
    },
    // 判断时候全选
    checkedAll: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    return {
      commonExpand: expandMember
    };
  },
  computed: {
    // 计算宽度
    widths() {
      if (this.columnsData.length > 0) {
        let hasWidth = 0;
        let index = 0;
        this.columnsData.forEach(item => {
          if (item.width) {
            hasWidth += parseInt(item.width);
            index++;
          }
        });
        if (index === 0) {
          return (1 / this.columnsData.length) * 100 + "%";
        }
        return `calc((100% - ${hasWidth}px) / ${this.columnsData.length -
          index})`;
      }
    }
  },
  methods: {
    // 分页
    onPageChange(val) {
      this.$emit("onPageChange", val);
    },
    //
    checkboxClass() {
      this.$emit("onCheckAllChange", this.checkedAll);
    },
    // 动态组件
    changeComp(name) {
      switch (name) {
        case "expandMember":
          this.commonExpand = expandMember;
          break;
        case "expandFinanace":
          this.commonExpand = expandFinance;
          break;
        default:
          this.commonExpand = expandMember;
          break;
      }
    },
    // 接受重置组件失去焦点时传来的参数
    passBlurData(val) {
      this.$emit("passData", val);
    },
    // 修改密码
    passwordBlurData(val) {
      this.$emit("changePassword", val);
    },
    // 接受重置组件显示时的状态
    resetInputData(obj) {
      this.$emit("resetDataStatus", obj);
    },
    // 充值
    rechange(formItem) {
      this.$emit("rechange", formItem);
    }
  },
  mounted() {
    this.changeComp(this.expandComponents);
  }
};
</script>

<style lang="less" scoped>
.table-head {
  .table-list {
    color: #464c5b;
    /deep/.ivu-checkbox-focus {
      box-shadow: 0 0 0 0 transparent;
    }
  }
  background-color: #f8f8f9;
  height: 42px;
  line-height: 42px;
  // border-top: 1px solid #e8eaec;
  // border-bottom: 1px solid #e8eaec;
  display: flex;
  font-size: 13px;
  font-weight: bold;
}
.table-container {
  display: flex;
  min-height: 70px;
  align-items: center;
  border-bottom: 1px solid #e8eaec;
  font-size: 12px;
}
.table-container:hover {
  background-color: #F8F9FD;
}
.table-list {
  display: inline-block;
  color: #657180;
}
.no-wrap {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.expand {
  margin-bottom: 245px;
}
.expand-style {
  margin-bottom: 190px;
}
.show-expand {
  display: block;
  position: absolute;
  margin-top: 158px;
  height: 245px;
  width: 100%;
  // width: calc(100% - 46px);
  background: #f8f9fd;
  // overflow: hidden;
}
.expand-finance {
  margin-top: 139px;
  height: 190px;
  width: 100%;
  border-bottom: 1px solid #e8eaec;
}
.table-foot {
  text-align: right;
  margin-top: 70px;
}
.noDate {
  width: 100%;
  text-align: center;
  height: 70px;
  line-height: 70px;
  border-bottom: 1px solid #e8eaec;
  font-size: 12px;
}
</style>

