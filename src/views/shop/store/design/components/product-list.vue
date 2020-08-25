<template>
  <div class="list">
    <Modal
      class="list-modal"
      v-model="modalStatus"
      ref="modal"
      :width="620"
      :styles="{top: '50px'}"
      title="从商品库选择"
      @on-cancel="onCancelClick"
    >
      <div class="mglr">
        <i-input v-model="productName" placeholder="请输入商品名称/编码" style="margin-bottom: 16px;margin-top: 26px;">
          <tree-select
            :data="classList"
            slot="prepend"
            ref="clstree"
            @on-check-change="onSelectClass"
          ></tree-select>
          <!-- <Select v-model="productSelectClass" slot="prepend" style="width: 100px">
            <Option value="0">全部</Option>
            <Option :value="item.id" v-for="item in classList" :key="item.id">{{item.class_name}}</Option>
          </Select> -->
          <Button slot="append" icon="ios-search" style="width: 42px;" @click="onSearchClick"></Button>
        </i-input>
      </div>
      <div class="list-table">
        <common-table
          height="358"
          :columnsData="columnsData"
          :listData="listData"
          :loading="tableLoading"
          :hasBorder="true"
        ></common-table>
      </div>
      <div class="mglr">
        <Page
          style="text-align: right;margin-top: 20px;"
          :total="total"
          size="small"
          :page-size="20"
          :current="currentPage"
          @on-change="onPageChange"
          show-elevator
        />
      </div>
      <div
        v-show="selectedProducts.length > 0"
        class="list-show-select mglr"
      >已选择 {{selectedProducts.length}} 个商品</div>
      <div
        v-show="selectedProducts.length == 0 && confirmClicked"
        class="list-show-select mglr"
        style="color:red;"
      >请至少选择一个商品</div>
      <div slot="footer">
        <Button @click="onCancelClick" type="text">取消</Button>
        <Button @click="onComfrimClick" type="primary">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import "@/assets/scrollbar.less";
import commonTable from "@/views/shop/components/table/common-table.vue";
import ClassUtil from "@/views/shop/product/components/class-util";
import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
import jQuery from "jquery";
export default {
  components: {
    commonTable,
    treeSelect
  },
  props: {
    multipleSelect:{
      type:Boolean,
      default:true
    },
    confirmCheck: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      required: true
    },
    url: {
      type: String,
      default: "/shop/admin/product/list"
    },
    // 配合url使用，不需要传个空对象
    options: {
      type: Object,
      default() {
        return {
          status: 1, // 只列出出售中的产品
          order_by: {
            column: "sell_at",
            order: "desc"
          }
        };
      }
    },
    productIds: {
      type: Array
    }
  },
  data() {
    return {
      confirmClicked: false,
      selectedProducts: [],
      hasSelectedAll: false,
      modalStatus: false,
      currentPage: 1,
      total: 0,
      classList: [],
      tableLoading: false,
      productName: "",
      checkAllDisable: false,
      productNameCopy: "",
      allClassSelectStatus: true,
      productSelectClass: [-1],
      productSelectClassCopy: [-1],
      columnsData: [
        {
          align: "center",
          width: 43,
          renderHeader: h => {
            let checkBoxOption = {
              on: {
                "on-change": value => {
                  this.hasSelectedAll = value;
                  let modalElm = jQuery(this.$refs["modal"].$el);
                  if (!value) {
                    modalElm.find(".cb-item .ivu-checkbox-input:checked").click();
                  } else {
                    modalElm.find(
                      ".cb-item .ivu-checkbox-input:not(:checked)"
                    ).click();
                  }
                }
              },
              props: { 
                value: this.hasSelectedAll ,
                disabled:!this.multipleSelect || this.checkAllDisable
              }
            };
            return h("div", {}, [h("Checkbox", checkBoxOption, "")]);
          },
          render: (h, params) => {
            let checkBoxOption = {
              on: {
                "on-change": value => {
                  if(this.multipleSelect){
                    if (!value) this.hasSelectedAll = false;
                    if (value) this.selectedProducts.push(params.row);
                    else
                      this.selectedProducts.splice(
                        this.selectedProducts.findIndex((item)=>{return item.id==params.row.id}),
                        1
                      );
                  }else{
                    this.selectedProducts=[];
                    this.selectedProducts.push(params.row);
                  }
                  
                }
              },
              key:params.row.id,
              props: {
                value: this.productIds.indexOf(params.row.id) > -1||this.selectedProducts.findIndex((item)=>{return item.id==params.row.id})>-1,
                disabled: this.productIds.indexOf(params.row.id) > -1
              },
              class: "cb-item"
            };
            return h("div", {}, [h("Checkbox", checkBoxOption, "")]);
          }
        },
        {
          title: "商品信息",
          minWidth: 260,
          render: (h, params) => {
            return h("div", {}, [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    // border: "1px solid #eeeeee"
                  }
                },
                [
                  h("img", {
                    attrs: {
                      src:
                        params.row.small_images &&
                        params.row.small_images.split(",").length
                          ? this.$store.state.siteComdataPath +
                            params.row.small_images.split(",")[0]
                          : ""
                    },
                    style: { height: "50px", width: "50px", display: "block", objectFit: "contain"}
                  })
                ]
              ),
              h(
                "div",
                {
                  style: {
                    width: "160px",
                    display: "inline-block"
                  }
                },
                [
                  h(
                    "Tooltip",
                    {
                      props: {
                        content: params.row.name,
                        placement: "top",
                        transfer: true,
                        maxWidth: "300px"
                      }
                    },
                    [
                      h(
                        "div",
                        {
                          style: {
                            verticalAlign: "middle",
                            textAlign: "left",
                            overflow: "hidden",
                            "text-overflow": "ellipsis",
                            display: "-webkit-inline-box",
                            "-webkit-line-clamp": 2,
                            "-webkit-box-orient": "vertical"
                          }
                        },
                        params.row.name
                      )
                    ]
                  )
                ]
              )
            ]);
          }
        },
        {
          title: "商品分类",
          width: 140,
          align: "center",
          render: (h, params) => {
            let text = params.row.product_class
              .map(item => item.class_name)
              .join(",");
            return h(
              "Tooltip",
              {
                props: {
                  content: text,
                  placement: "top",
                  transfer: true,
                  maxWidth: "300px"
                }
              },
              text
            );
          }
        },
        {
          title: "销售价",
          width: 108,
          align: "center",
          render: (h, params) => {
            return h("div", {}, "￥" + params.row.price);
          }
        }
      ],
      listData: [],
      productInfo: null
    };
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      if (val) {
        this.selectedProducts = [];
        this.changeCheckboxStatus();
        this.currentPage = 1;
        this.productNameCopy = "";
        this.allClassSelectStatus = true;
        this.productSelectClassCopy = [-1];
        this.getProductList();
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    onSelectClass() {
      let list = this.$refs["clstree"].getCheckedNodes();
      let classArray = [];
      list.forEach(item => {
        classArray.push(item.data.id);
      });
      // 只能有全选或多选（多于一个的时候有可能全选和多选都存在，根据标识去掉一种情况，如果没有选中则是都没有选，此时应该标识成全选）
      if (classArray.length > 1 && this.allClassSelectStatus) {
        classArray = classArray.filter(item => item !== -1);
        this.allClassSelectStatus = false;
        this.classList[0].checked = false;
      } else if (!classArray.length) {
        classArray = [-1];
        this.allClassSelectStatus = true;
        this.classList[0].checked = true;
      }
      this.productSelectClass = classArray;
    },
    /**
     * 取消的时候还原数据
     */
    onCancelClick() {
      this.modalStatus = false
      this.confirmClicked = false
    },
    /**
     * 提交到上级组件
     */
    onComfrimClick() {
      if(!this.selectedProducts.length && this.confirmCheck){
        return this.confirmClicked = true
      }
      this.$emit("onGetProductInfo", this.selectedProducts);
      this.modalStatus = false
      this.confirmClicked = false
    },
    /**
     * 获取产品列表
     */
    getProductList() {
      this.tableLoading = true;
      let data = {
        page: this.currentPage,
        keyword: this.productNameCopy,
        ...this.options
      };
      if (this.productSelectClassCopy[0] !== -1) {
        data.class = this.productSelectClassCopy;
      }
      this.$httpPost(this.url, data, res => {
        this.tableLoading = false;
        if (res.code === 200) {
          this.setClassData(res.data.classList || []);
          this.currentPage = Number(res.data.productList.current);
          this.total = res.data.productList.total;
          this.listData =
            (res.data.productList && res.data.productList.list) || [];
          this.changeCheckboxStatus();
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 多选分类
     */
    setClassData(list) {
      let data = [];
      var clsTree = ClassUtil.newIntance(list).getTreeList();
      let sortedClassList = {
        title: "全部分类",
        data: { id: -1, class_name: "全部分类" },
        checked: this.productSelectClassCopy.findIndex(item => item === -1) > -1
      };
      if (clsTree.length > 0) {
        clsTree.forEach(item => {
          var titem = { title: item.class_name };
          titem.children = [];
          titem.expand = true;
          titem.data = { id: item.id, class_name: item.class_name };
          titem.checked =
            this.productSelectClassCopy.findIndex(n => n === item.id) >
            -1;
          item.children.forEach(item1 => {
            titem.children.push({
              title: item1.class_name,
              data: { id: item1.id, class_name: item1.class_name },
              checked:
                this.productSelectClassCopy.findIndex(
                  item => item === item1.id
                ) > -1
            });
          });
          data.push(titem);
        });
      }
      this.classList = [sortedClassList, ...data];
    },
    /**
     * 修改全选按钮的选中和禁用状态
     */
    changeCheckboxStatus() {
      this.$nextTick(() => {
        let modalElm = jQuery(this.$refs["modal"].$el);
        // 全选按钮的选中状态
        if (this.listData.length && modalElm.find(".cb-item .ivu-checkbox-input:checked").length === this.listData.length) {
          this.hasSelectedAll = true;
        } else {
          this.hasSelectedAll = false;
        }
        // 全选按钮的禁用状态
        this.checkAllDisable = !this.listData.length || (modalElm.find(".cb-item .ivu-checkbox-input:disabled").length === this.listData.length);
      });
    },
    /**
     * 分页切换
     */
    onPageChange(index) {
      this.currentPage = index;
      this.getProductList();
    },
    /**
     * 开始搜索
     */
    onSearchClick() {
      this.productNameCopy = this.productName;
      this.productSelectClassCopy = this.productSelectClass;
      this.currentPage = 1;
      this.getProductList();
    }
  }
};
</script>
<style lang="less" scoped>
.list-modal {
  /deep/.ivu-modal-content {
    height: 600px;
  }
  /deep/.ivu-modal-wrap {
    .ivu-modal-body {
      padding: 0;
      height: calc(100% - 95px);
      box-sizing: border-box;
      overflow: hidden;
      .list-show-select {
        position: absolute;
        bottom: 21px;
      }
      .ivu-table-tip table {
        min-height: 296px;
      }
      .mglr {
        margin-left: 30px;
        margin-right: 30px;
        .ivu-input-group-prepend {
          .ivu-select {
            width: 99px;
          }
          .ivu-select-dropdown {
            width: 260px;
            text-align: left;
            .ivu-select-dropdown-list>.ivu-select-item:first-child {
              display: none;
            }
          }
        }
      }
      table {
        .ivu-table-row {
          button {
            span {
              display: block;
            }
          }
        }
        .ivu-tooltip-rel {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-inline-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          vertical-align: middle;
        }
      }
    }
  }
  /deep/.ivu-table-cell {
    padding-left: 0;
  }
  .list-table {
    padding: 0 30px;
  }
}
</style>
