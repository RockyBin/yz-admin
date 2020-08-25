<template>
  <div class="class-tree-select">
    <i-select
      ref="select"
      :placeholder="placeholder"
      :transfer="transfer"
      :transfer-class-name="transferClassName"
      :not-found-text="notFoundText"
      class="class-selector"
    >
      <template v-for="(item, index) in treeData">
        <class-options
          :key="index"
          :showItem="item"
          :isDisabled="item.isDisabled"
          @expandChange="onExpandChange"
          @on-change="onCheckChange"
        ></class-options>
        <collapse-transition :key="'t' + index">
          <ul v-if="item.children && item.children.length" v-show="item.expand">
            <class-options
              v-for="(item1, index) in item.children"
              :key="index"
              :secondChild="true"
              :showItem="item1"
              :isDisabled="item1.isDisabled"
              @expandChange="onExpandChange"
              @on-change="onCheckChange"
            ></class-options>
          </ul>
        </collapse-transition>
      </template>
      <div slot="input">
        <Tooltip
          :disabled="!getCheckedLabel"
          :content="getCheckedLabel"
          :placement="placement"
          transfer
          :max-width="210"
        >
          <span
            :class="getCheckedLabel?'ivu-select-selected-value':'ivu-select-placeholder'"
          >{{getCheckedLabel || placeholder}}</span>
        </Tooltip>
        <Icon type="ios-arrow-down" :class="['ivu-select-arrow']"></Icon>
      </div>
    </i-select>
  </div>
</template>
<script>
import classOptions from "./class-tree-select-options";
import collapseTransition from "iview/src/components/base/collapse-transition";
export default {
  components: {
    classOptions,
    collapseTransition
  },
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    placeholder: {
      type: String,
      default: "请选择分类"
    },
    transferClassName: {
      type: String,
      default: "class-tree-select-transfer"
    },
    transfer: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: "top-start"
    },
    notFoundText: {
      type: String,
      default: ""
    },
    initialData: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      status: true,
      treeData: []
    };
  },
  watch: {
    initialData: {
      handler(val) {
        var data = JSON.parse(JSON.stringify(val))
        this.treeData = this.initTreeData(data);
        this.treeData[0].children.forEach(item => {
          var checked = this.value ? this.value.includes(item.data.id) : false
          this.$set(item, "checked", checked);
        })
      },
      immediate: true
    },
    treeData() {
      var model = this.value.filter(item => {
        return this.treeData[0].children.map(item => item.data.id).includes(item)
      })
      this.$emit("input", model);
    }
  },
  computed: {
    getCheckedLabel() {
      return this.getShowSelect(this.treeData)
        .map(item => item.data.class_name)
        .join("，");
    }
  },
  methods: {
    initTreeData(data, checked = false) {
      data.forEach(item => {
        if (checked) {
          this.$set(item, "checked", checked);
        }
        if (item.children) {
          this.initTreeData(item.children, item.checked);
        }
      })
      return data;
    },
    onExpandChange(item, status) {
      this.$set(item, "expand", status);
    },
    onCheckChange() {
      var model = this.getCheckedNodes().map(item => item.data.id).filter(n => n !== -1);
      this.$nextTick(() => {
        this.$parent.validate && this.$parent.validate("change")
      })
      this.$emit("input", model);
    },
    getCheckedNodes() {
      let checkedNode = [];
      let data = this.getChildSelect(this.treeData);
      data.forEach(item => {
        if (item.children && item.children.length) {
          checkedNode.push(...item.children);
          delete item.children;
        }
        checkedNode.push(item);
      });
      return checkedNode;
    },
    /**
     * 获取需要显示的class
     */
    getShowSelect(val) {
      let arrayData = [];
      val.forEach(item => {
        if (item.children && item.children.length) {
          let itemSelect = this.getShowSelect(item.children);
          if (
            item.children.every(
              (a, index) =>
                a.data.id === (itemSelect[index] && itemSelect[index].data.id)
            )
          ) {
            arrayData.push(Object.assign({}, item, { children: [] }));
          } else {
            arrayData.push(...itemSelect);
          }
        } else {
          if (item.checked) {
            arrayData.push(item);
          }
        }
      });
      return arrayData;
    },
    /**
     * 获取所有选中的class
     */
    getChildSelect(val) {
      let arrayData = [];
      val.forEach(item => {
        if (item.children && item.children.length) {
          let itemSelect = this.getChildSelect(item.children);
          if (
            item.children.every(
              (a, index) =>
                a.data.id === (itemSelect[index] && itemSelect[index].data.id)
            )
          ) {
            let childArray = [];
            itemSelect.forEach(item => {
              if (item.children) {
                childArray.push(...item.children);
                delete item.children;
              }
              childArray.push(Object.assign({}, item));
            });
            arrayData.push(Object.assign({}, item, { children: childArray }));
          } else {
            itemSelect.forEach(item => {
              if (item.children) {
                arrayData.push(...item.children);
                delete item.children;
              }
              arrayData.push(Object.assign({}, item));
            });
          }
        } else {
          if (item.checked) {
            arrayData.push(item);
          }
        }
      });
      return arrayData;
    }
  }
};
</script>
<style lang="less" scoped>
.class-tree-select {
  display: inline-block;
  /deep/.ivu-tooltip {
    width: 100%;
    .ivu-tooltip-inner {
      white-space: pre-wrap;
    }
  }
  /deep/.ivu-select-dropdown {
    width: 100%;
    li {
      text-overflow: initial;
      overflow: hidden;
    }
  }
}
</style>
