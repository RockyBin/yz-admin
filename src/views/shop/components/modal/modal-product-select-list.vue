<template>
  <div class="distributor-setting-list">
    <Modal
      class="distributor-setting-list-modal height-model"
      v-model="modalStatus"
      :width="630"
      :transition-names="['false']"
      :mask-closable="false"
      :title="text"
      ref="modal"
    >
      <div class="mglr">
        <i-input
          v-model="productName"
          placeholder="请输入商品名称/编码"
          style="margin-bottom: 16px;margin-top: 26px;"
        >
          <tree-select
            :data="sortedClass"
            slot="prepend"
            ref="clstree"
            @on-check-change="onSelectClass"
          ></tree-select>
          <Button slot="append" icon="ios-search" style="width: 42px;" @click="onSearchClick"></Button>
        </i-input>
      </div>
      <div
        class="distributor-setting-list-table"
        :class="{'distributor-setting-list-table-width': listData.length <= 4}"
      >
        <common-table
          style="width: 570px;"
          :columnsData="columnsData"
          :listData="listData"
          :loading="tableLoading"
          :hasBorder="true"
          border="1"
        ></common-table>
      </div>
      <div class="mglr">
        <Page
          style="text-align: right;margin-top: 16px;"
          :total="total"
          size="small"
          :page-size="20"
          :current="currentPage"
          @on-change="onPageChange"
          show-elevator
        />
      </div>
      <div
        v-show="selectCcacheInfo.selectDesignatedProductID > 0"
        class="distributor-setting-list-show-select mglr"
      >已选：{{selectCcacheInfo.selectDesignatedProductName}}</div>
      <div slot="footer">
        <Button type="text" @click="onCancelClick">取消</Button>
        <Button type="primary" @click="onComfrimClick">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
import ClassUtil from "../../product/components/class-util";
import commonFunction from "@/views/shop/components/common-function.js";
import jQuery from "jquery";
export default {
  components: {
    commonTable,
    treeSelect
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    cloud: {
        type: Boolean,
        default: false
    },
    selectInfo: {
      type: Array
    },
    url: {
      type: String,
      default: "/shop/admin/common/product/list"
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
    text: {
        default: "从商城商品库选择",
        type: String
    },
      multipleSelect:{
          type:Boolean,
          default:true
      }
  },
  data() {
    return {
      screenHeight: document.body.clientHeight,
      selectCcacheInfo: {
        selectDesignatedProductID: 0,
        selectDesignatedProductName: ""
      },
        hasSelectedAll: false,
        checkAllDisable: false,
      allClassSelectStatus: true,
      modalStatus: false,
      currentPage: 1,
      total: 0,
      classList: [],
      sortedClass: [],
      tableLoading: false,
      productName: "",
      productNameCopy: "",
      productSelectClass: [-1],
      productSelectClassCopy: [-1],
      selectTableData:[],
      actionColumn: {
          title: "",
          align: "center",
          minWidth: 86,
          renderHeader: h => {
            return h("div", [
                h("span", {style: {color: "transparent"}}, "&nbsp;")
            ]);
          },
        render: (h, params) => {
            let buttonOption = {
                style: {
                    height: "24px",
                    padding: 0,
                    width: "50px",
                    lineHeight: 0
                },
                on: {
                    click: () => {
                      this.selectCcacheInfo = {
                          selectDesignatedProductID: params.row.id,
                          selectDesignatedProductName: params.row.name
                      };
                      this.productInfo = this.listData[params.index];
                    }
                }
            };
            if (
                this.selectCcacheInfo.selectDesignatedProductID === params.row.id
            ) {
                buttonOption.props = {
                    type: "primary",
                    ghost: true
                };
                Object.assign(buttonOption.style, {
                    "box-shadow": "none"
                });
            } else {
                buttonOption.props = {
                    type: "primary"
                };
            }

            return h(
                "div",
                {
                    class:
                        this.selectCcacheInfo.selectDesignatedProductID ===
                        params.row.id
                            ? "distributor-setting-list-select"
                            : ""
                },
                [
                    h(
                        "Button",
                        buttonOption,
                        this.selectCcacheInfo.selectDesignatedProductID ===
                        params.row.id
                            ? "已选"
                            : "选择"
                    )
                ]
            );
        }
      },
      selectColumn:[{
          width: 40,
          align: 'center',
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
                              if (value) this.selectTableData.push(params.row);
                              else
                                  this.selectTableData.splice(
                                      this.selectTableData.findIndex((item)=>{return item.id==params.row.id}),
                                      1
                                  );
                          }else{
                              this.selectTableData=[];
                              this.selectTableData.push(params.row);
                          }
                      }
                  },
                  key:params.row.id,
                  props: {
                      value: this.selectInfo.indexOf(params.row.id) > -1||this.selectTableData.findIndex((item)=>{return item.id==params.row.id})>-1,
                      disabled: this.selectInfo.indexOf(params.row.id) > -1
                  },
                  class: "cb-item"
              };
              return h("div", {}, [h("Checkbox", checkBoxOption, "")]);
          }
      }],
      productColumnsData: [
        {
          title: "商品信息",
          minWidth: 244,
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
                    style: {
                      height: "40px",
                      width: "40px",
                      display: "block",
                      objectFit: "contain"
                    }
                  })
                ]
              ),
              h(
                "div",
                {
                  style: {
                    width: "166px",
                    overflow: "hidden",
                    "text-overflow": "ellipsis",
                    verticalAlign: "middle",
                    textAlign: "left",
                    display: "-webkit-inline-box",
                    "-webkit-line-clamp": 2,
                    "-webkit-box-orient": "vertical"
                  }
                },
                [
                  h(
                    "Tooltip",
                    {
                      props: {
                        content: params.row.name,
                        transfer: true,
                        placement: "top",
                        maxWidth: "300px"
                      }
                    },
                    params.row.name
                  )
                ]
              )
            ]);
          }
        },
        {
          title: "商品分类",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            let classObj = {};
            params.row.product_class.forEach(item => {
              classObj[item.id] = true;
            });
            let text = params.row.product_class
              .filter(item => !classObj[item.parent_id])
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
          minWidth: 108,
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
  computed: {
      columnsData() {
          if(this.cloud){
              return this.selectColumn.concat(this.productColumnsData)
          } else {
              return this.productColumnsData.concat(this.actionColumn)
          }
      }
  },
  watch: {
    // screenHeight(val) {
    //   if (!this.timer) {
    //     this.screenHeight = val;
    //     let modelHeight = document.querySelector(
    //       ".distributor-setting-list-modal .ivu-modal"
    //     );
    //     console.log(
    //       document.querySelector(
    //         ".distributor-setting-list-modal .ivu-modal .ivu-modal-content"
    //       ).style,
    //       "sss"
    //     );
    //     let modelStyle = document.querySelector(
    //       ".distributor-setting-list-modal .ivu-modal"
    //     );
    //     modelStyle.style.cssText =
    //       "position: absolute; top: 50%; left: 50%;    transform: translate(-50%, -50%);";
    //     if (this.screenHeight < 550) {
    //       modelStyle.style.cssText = "position: absolute; top: 50%; left: 50%;    transform: translate(-50%, -50%);"
    //       document.querySelector(
    //         ".distributor-setting-list-modal .ivu-modal"
    //       ).style.top =
    //         200 + "px";
    //     } else {
    //       document.querySelector(
    //         ".distributor-setting-list-modal .ivu-modal"
    //       ).style.top =
    //         100 + "px";
    //     }
    //     this.timer = true;
    //     let that = this;
    //     setTimeout(function() {
    //       that.timer = false;
    //     }, 400);
    //   }
    // },
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
      }
      if (val) {
        this.productInfo = null;
        this.selectTableData = [];
        this.productName = "";
        this.listData = [];
        this.total = 0;
        this.allClassSelectStatus = true;
        this.productSelectClassCopy = [-1];
        this.productSelectClass = [-1];
        this.changeCheckboxStatus();
        this.getProductList();
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    },
    selectInfo(val) {
      this.selectCcacheInfo = Object.assign({}, val);
    },
    classList(val) {
      let data = [];
      this.util = ClassUtil.newIntance(val);
      var clsTree = this.util.getTreeList();
      var sortedClassList = {
        title: "全部分类",
        data: { id: -1, class_name: "全部分类" },
        checked: this.productSelectClass.findIndex(item => item === -1) > -1
      };
      if (clsTree.length > 0) {
        clsTree.forEach(item => {
          var titem = { title: item.class_name };
          titem.children = [];
          titem.expand = true;
          titem.data = { id: item.id, class_name: item.class_name };
          titem.checked =
            this.productSelectClass.findIndex(n => n === item.id) >
            -1;
          item.children.forEach(item1 => {
            titem.children.push({
              title: item1.class_name,
              data: { id: item1.id, class_name: item1.class_name },
              checked:
                this.productSelectClass.findIndex(
                  item => item === item1.id
                ) > -1
            });
          });
          data.push(titem);
        });
      }
      this.sortedClass = [sortedClassList, ...data];
    }
  },
  mounted() {
    const that = this;
    window.onresize = () => {
      return (() => {
        window.screenHeight = document.body.clientHeight;
        that.screenHeight = window.screenHeight;
      })();
    };
    this.getProductList();
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
        this.sortedClass[0].checked = false;
      } else if (!classArray.length) {
        classArray = [-1];
        this.allClassSelectStatus = true;
        this.sortedClass[0].checked = true;
      }
      this.productSelectClass = classArray;
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
     * 取消的时候还原数据
     */
    onCancelClick() {
        this.modalStatus = false;
        this.selectTableData = [];
      this.selectCcacheInfo = Object.assign({}, this.selectInfo);
    },
    /**
     * 提交到上级组件
     */
    onComfrimClick() {
        this.modalStatus = false;
        if (this.cloud){
            if (this.selectTableData.length){
                this.$emit("onGetProductInfo", this.selectTableData);
            } else{
                this.$emit("onGetProductInfo");
            }
        } else{
            this.selectInfo.selectDesignatedProductID = this.selectCcacheInfo.selectDesignatedProductID;
            this.selectInfo.selectDesignatedProductName = this.selectCcacheInfo.selectDesignatedProductName;
            this.productInfo && this.$emit("onGetProductInfo", [this.productInfo]);
        }
    },
    /**
     * table选择变化时触发
     */
    // onSelectionChange(selectData) {
    //     this.selectTableData = selectData;
    // },
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
          this.classList = res.data.classList || [];
          this.currentPage = Number(res.data.productList.current);
          this.total = res.data.productList.total;
          this.listData =
            (res.data.productList && res.data.productList.list) || [];
          this.changeCheckboxStatus()
        } else {
          this.$Message.error(res.msg);
        }
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
      this.currentPage = 1;
      this.productNameCopy = this.productName;
      this.productSelectClassCopy = this.productSelectClass;
      this.getProductList();
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-setting-list-modal {
  /deep/.ivu-input-group-prepend,
  /deep/.ivu-input-group-append,
  /deep/.ivu-table-header th {
    background: #f8f9fd;
  }
  /deep/.ivu-modal-wrap {
    .ivu-modal-body {
      padding: 0 0;
      height: 485px;
      box-sizing: border-box;

      .distributor-setting-list-show-select {
        position: absolute;
        bottom: 21px;
        width: 454px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ivu-table-tip table {
        min-height: 312px;
      }

      .mglr {
        margin-left: 30px;
        margin-right: 30px;
        .ivu-input-group-prepend {
          .ivu-select {
            width: 99px;
            .ivu-select-dropdown {
              width: 260px;
              text-align: left;
              .ivu-select-item {
                text-overflow: ellipsis;
                overflow: hidden;
              }
              .ivu-select-dropdown-list>.ivu-select-item:first-child {
                display: none;
              }
            }
          }
        }
      }

      /* 列表滚动条 */
      /deep/.ivu-table-body {
        overflow-y: auto;
        height: 312px;
        overflow-x: hidden;
      }

      table {
        .ivu-table-row {
          button {
            display: none;

            span {
              display: block;
            }
          }

          &.ivu-table-row-hover,
          .distributor-setting-list-select {
            button {
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

  .distributor-setting-list-table {
    // height: 324px;
    // padding: 0 30px;
    // overflow-y: auto;
    margin: 0 30px;
    /deep/.ivu-table-wrapper {
      min-height: 100%;
    }
  }
  .distributor-setting-list-table-width {
    width: calc(100% - 60px);
  }
}
</style>
