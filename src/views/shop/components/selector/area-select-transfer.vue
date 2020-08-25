<template>
  <div class="areaselect-container ivu-transfer-list-container ivu-transfer">
    <!-- 左侧 -->
    <div class="ivu-transfer-list" style="height: 100%; width: 100%;">
      <div class="ivu-transfer-list-header">
        <span class="ivu-transfer-list-header-title">选择地区</span>
        <span class="right-num" v-text="selectedNum" style="float:right;"></span>
      </div>
      <div class="ivu-transfer-list-body ivu-transfer-list-body-with-search">
        <div class="ivu-transfer-list-body-search-wrapper">
          <Input
            type="text"
            @on-search="searchCity"
            v-model="searchVal"
            size="small"
            class="city-search-input"
            search
            placeholder="请输入搜索内容"
          />
        </div>
        <Tree
          :data="listData"
          show-checkbox
          multiple
          class="ivu-transfer-list-container"
          @on-check-change="selectChange"
          @on-select-change="onSelectChange"
          ref="permissionTree"
          v-if="showTree"
        ></Tree>
      </div>
    </div>
  </div>
</template>
<script>
const listDataOrigin = require("COMPONENTS/citydata.js").default.provinceArr;
import "@/assets/scrollbar.less";
export default {
  props: ["editData", "addOrEditStates", "disableCodes"],
  data() {
    return {
      showTree: true,
      listData: listDataOrigin,
      searchVal: "",
      selectedNum: 0,
      areas: []
    };
  },
  watch: {
    editData: {
      handler: function(now, old) {
        this.selectedNum = 0;
        this.listData = listDataOrigin;
        if (now) {
          this.listData.forEach(item => {
            let isExpand = false;
            item.children.forEach(jar => {
              if (now.areas.includes(jar.area)) {
                jar.checked = true;
                this.selectedNum++;
                isExpand = true;
              } else {
                jar.checked = false;
              }
            });
            if (!isExpand) {
              if (item.expand) {
                item.expand = false;
                item.indeterminate = false;
              }
            } else {
              this.selectedNum++;
            }
          });
        }
      },
      immediate: true,
      deep: true //深度监听
    },
    addOrEditStates: function(now, old) {
      this.searchVal = "";
      this.listData = listDataOrigin;
      if (now === "0") {
        // 是新增状态进来
        if (this.listData) {
          // 设置全部反选
          const listDataArr = this.listData.concat();
          this.showTree = false;
          this.areas = [];
          this.selectedNum = 0;
          listDataArr.forEach(item => {
            item.checked = false;
            if (this.disableCodes.indexOf(item.area) > -1) {
              item.disabled = true;
            } else {
              item.disabled = false;
            }
            item.children.forEach(jar => {
              jar.checked = false;
            });
          });
          this.$nextTick(() => {
            this.listData = listDataArr;
            this.showTree = true;
          });
        }
      } else if (now === "1") {
        // 编辑进来
        this.showTree = false;
        const listDataArr = this.listData.concat();
        listDataArr.forEach(item => {
            item.checked = false;
          if (this.disableCodes.indexOf(item.area) > -1) {
            item.disabled = true;
          } else {
            item.disabled = false;
              item.checked = false;
          }
        });
        this.$nextTick(() => {
          this.listData = listDataArr;
          this.showTree = true;
        });
      }
    }
  },
  methods: {
    searchCity() {
      // 为空则列出所有
      if (this.searchVal === "") {
        this.listData = listDataOrigin;
      } else {
        const searchListData = [];
        listDataOrigin.forEach(item => {
          // 如果是省的结果，把子节点也筛出来
          if (item.title.indexOf(this.searchVal) > -1) {
            searchListData.push(item);
            return true;
          }
          // 查找市节点
          let searchChildList = []; // 搜索到的子节点列表
          item.children.forEach(child => {
            if (child.title.indexOf(this.searchVal) > -1) {
              searchChildList.push(child);
            }
          });
          // 如果有搜索到子节点 则把省节点也列出来
          if (searchChildList.length > 0) {
            let searchRes = item;
            searchRes.children = searchChildList;
            searchListData.push(searchRes);
          }
        });
        this.temporaryData = this.listData;
        this.listData = searchListData;
      }
    },
    // 移动到右边触发
    selectChange(arr) {
      this.areas = this.$refs.permissionTree.getCheckedAndIndeterminateNodes();
      this.selectedNum = this.$refs.permissionTree.getCheckedAndIndeterminateNodes().length;
      if (this.areas) {
          this.$emit("getAreas", this.areas);
      }
    },
      //获取被选中节点
    onSelectChange(arr){
        if (arr.length > 0) {
            this.areas.push(arr[0]);
            arr[0].children.forEach((item) => {
                this.areas.push(item);
            })
            this.selectedNum = this.areas.length;
            arr[0].checked = true;
            arr[0].selected = false;
            if (this.areas){
                this.$emit("getAreas", this.areas)
            }
        }
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-transfer-list-container {
  .ivu-transfer-list-header {
    background: #f8f9fb;
  }
  /deep/.ivu-tree {
    overflow: auto;
    max-height: 308px;
    overflow-x: hidden;
    padding: 0px 4px 6px 7px;
  }
  .ivu-tree-empty {
    text-align: center;
  }
  /deep/.ivu-tree > .ivu-tree-children {
    zoom: 1;
    position: relative;
    padding: 0 0 3px 0px;
    & > li {
      height: 8px;
      margin: 12px 0;
    }
    .ivu-tree-arrow {
      float: left;
      margin-right: 2px;
      width: 10px;
      line-height: 17px;
    }
    .ivu-tree-arrow i {
      height: 0;
      width: 0;
      border-right: 4px solid transparent;
      border-bottom: 6px solid #4c5362;
      border-left: 4px solid transparent;
      transform: rotate(90deg);
    }
    .ivu-tree-arrow-open i {
      transform: rotate(180deg);
    }
    .ivu-icon-ios-arrow-forward:before {
      content: unset;
    }
    .ivu-checkbox-wrapper {
      float: left;
    }
    .ivu-tree-title {
      float: left;
      padding-top: 1px;
      & + ul {
        clear: both;
      }
    }
  }
  /deep/.ivu-tree > .ivu-tree-children:after {
    content: "";
    display: block;
    clear: both;
  }
  /deep/.ivu-tree > .ivu-tree-children:before {
    content: "";
    display: block;
    position: absolute;
    left: -7px;
    bottom: -4px;
    width: calc(100% + 11px);
    height: calc(100% - 23px);
    background-color: #c6c6ca;
    opacity: 0.1;
  }
  /deep/.ivu-tree-children li ul {
    float: left;
  }
  /deep/ul ul.ivu-tree-children {
    margin-left: 20px;
    margin-right: -20px;
    line-height: 14px;
    padding-top: 7px;
  }
}
</style>
