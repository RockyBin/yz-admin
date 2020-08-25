<template>
  <div class="product-list" v-show="!$store.state.COMMON_loading">
    <Tabs :animated="false" v-model="tabNameSelect" @on-click="dataList">
      <!-- <Button class="btn-import" @click="isShowImportStock = true"
        >导入库存</Button
      >-->
      <div class="btn-import">
        <Select v-model="batchSelectValue" ref="batchBtn" @on-change="onBatchImportChange">
          <Option :value="0">导入商品</Option>
          <Option :value="1">导入库存</Option>
        </Select>
        <span>
          <i class="iconfont icon-daoru"></i>批量导入
        </span>
      </div>
      <div class="product-list-add">
        <!--<Button-->
        <!--class="btn-add"-->
        <!--type="primary"-->
        <!--@click="onAddProduct"-->
        <!--shape="circle"-->
        <!--icon="md-add"-->
        <!--perm="product.operate"-->
        <!--&gt;新增商品</Button>-->
        <add-more :text="texts" @onAddMoreClick="onAddProduct" perm="product.operate"></add-more>
      </div>
      <search-list :searchParams="searchParams" :search-data="searchData">
        <Button
          v-if="tabNameSelectIndex === 2"
          @click="onBatchProductStatusChange(1)"
          perm="product.operate"
        >批量上架</Button>
        <Button
          v-if="
            tabNameSelectIndex === 0 ||
              tabNameSelectIndex === 1 ||
              tabNameSelectIndex === 3
          "
          @click="onBatchProductStatusChange(0)"
          perm="product.operate"
        >批量下架</Button>
        <Button
          v-if="tabNameSelectIndex === 2"
          @click="onBatchProductStatusChange(-9)"
          perm="product.operate"
        >批量删除</Button>
        <Button @click="onExportTableList">导出</Button>
      </search-list>
      <common-table
        ref="exportTable"
        :minWidth="1071"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
        @onSortChange="onSortChange"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-show="listData.length"
          :page-size="pageSize"
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          show-elevator
          class="page-style"
          :transfer="true"
        />
      </div>
      <TabPane
        :label="
          () => {
            return $createElement('div', `出售中(${totalNum.sell || 0})`);
          }
        "
        name="selling"
      ></TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `仓库中(${totalNum.warehouse || 0})`);
          }
        "
        name="warehouse"
      ></TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', [
              `已售罄(${totalNum.sold_out || 0})`,
              $createElement(moreMessage, {
                props: { text: '上架并且库存为0的商品', placement: 'top' },
                style: {
                  marginLeft: '5px',
                  height: '20px',
                  lineHeight: 1,
                  verticalAlign: 'unset'
                }
              })
            ]);
          }
        "
        name="soldout"
      ></TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', [
              $createElement('i', {
                class: 'iconfont icon-ios-warning',
                style: {
                  color: '#ed9218',
                  marginRight: '5px',
                  fontSize: '18px',
                  lineHeight: '20px'
                }
              }),
              `库存预警(${totalNum.warning || 0})`,
              $createElement(moreMessage, {
                props: { text: '上架并且达到库存预警的商品', placement: 'top' },
                style: {
                  marginLeft: '5px',
                  height: '20px',
                  lineHeight: 1,
                  verticalAlign: 'unset'
                }
              })
            ]);
          }
        "
        name="skuWarming"
      ></TabPane>
    </Tabs>
    <Modal v-model="tableListExportStatus" title="导出" @on-ok="onExportTableComfirm" :width="430">
      <RadioGroup v-model="exportTableStatus" vertical>
        <Radio label="0" style="height: 44px;line-height: 44px;">导出当前页面所有内容</Radio>
        <Radio label="1" style="height: 44px;line-height: 44px;">导出全部页面所有内容</Radio>
      </RadioGroup>
    </Modal>
    <modal-import v-model="isShowImportStock" @refresh="refresh"></modal-import>
    <modal-product-import v-model="productImportStatus" @refresh="refresh"></modal-product-import>
    <modal-stock @reload="getProductList" :info="productInfo" v-model="stockStatus"></modal-stock>
    <batch-intro v-model="batchStatus" @onUpload="productImportStatus = true"></batch-intro>
    <modify-order v-model="isShowModifyOrder" :productInfo="currentRow" @refresh="getProductList"></modify-order>
  </div>
</template>

<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import ClassUtil from "./components/class-util";
import modalImport from "./components/product-list-modal-import";
import modalProductImport from "./components/product-list-modal-product-import";
import modalStock from "./components/product-list-modal-stock";
import batchIntro from "./components/product-list-modal-batch-intro";
import addMore from "COMPONENTS/button/add-more.vue";
import tagMessage from "@/views/shop/components/label/label.vue";
import modifyOrder from "./components/product-modify-order.vue"
const searchData = {
  class: [-1],
  is_supplier_product: "-1",
  keyword: "",
  keyword_type: "1",
  order_by: {
    column: "created_at",
    order: "desc"
  },
  type:-1
};
// 上架 删除 下架 推广
const dropDownName = ["grounding", "undercarriage", "extend", "delete"];

const orderType = ["change_at", "sold_out_at", "change_at", "sell_at", "sort"];
export default {
  components: {
    commonTable,
    searchList,
    modalStock,
    batchIntro,
    addMore,
    modalImport,
    modalProductImport,
    modifyOrder
  },
  data() {
    let tabNameArray = ["selling", "soldout", "warehouse", "skuWarming"];

    return {
      isShowModifyOrder: false,
      isShowImportStock: false,
      productImportStatus: false,
      currentRow: null,
      isdropDownVisible: false,
      util: null,
      total: 0,
      moreMessage,
      texts: "新增商品",
      currentPage: 1,
      batchSelectValue: null,
      batchStatus: false,
      tableListExportStatus: false,
      exportTableStatus: "0",
      tableLoading: false,
      tabNameArray: tabNameArray,
      tabNameSelect: tabNameArray[0],
      pageSize: localStorage.getItem("product-list-page-size")
        ? parseInt(localStorage.getItem("product-list-page-size"))
        : 20,
      selectTableData: [],
      searchData: Object.assign({}, searchData, {
        keyword: this.$route.params.keyword || "",
        keyword_type: this.$route.params.keyword_type || "1"
      }),
      classList: [],
      productInfo: null,
      stockStatus: false,
      initColumnsData: [
        // 表格信息
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "商品信息",
          minWidth: 180,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center"
                }
              },
              [
                h(
                  "div",
                  {
                    style: {
                      display: "inline-block",
                      marginRight: "14px",
                      verticalAlign: "middle"
                      // border: "1px solid #eeeeee"
                    }
                  },
                  [
                    h("img", {
                      attrs: {
                        src: params.row.small_images
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
                h("div", [
                  h(
                    "Tooltip",
                    {
                      style: {
                        display: "inline-block",
                        verticalAlign: "middle",
                        textAlign: "left"
                        // maxWidth: "calc(100% - 50px)"
                      },
                      props: {
                        content: params.row.name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      }
                    },
                    [h("div", params.row.name)]
                  ),
                  [
                    h("div", [
                      params.row.supplier_member_id
                        ? h("div", { style: { "line-height": "16px" } }, [
                            h("i", {
                              class: "iconfont icon-gonghuoshang",
                              style: {
                                color: "#41B44D",
                                "margin-right": "3px",
                                "vertical-align": "text-bottom"
                              }
                            }),
                            h(
                              "span",
                              {
                                style: { color: "#9EA7B4", "font-size": "12px" }
                              },
                              params.row.supplier_name
                            ),
                            params.row.supplier_status == -1
                              ? h(tagMessage, {
                                  props: { tagName: "禁用" },
                                  style: { "margin-left": "5px" }
                                })
                              : ""
                          ])
                        : ""
                      //   h(tagMessage, {
                      //   props: {
                      //     tagName: "自营",
                      //     backgroundColor:"#FF9900"
                      //   }
                      // })
                    ])
                  ]
                ])
              ]
            );
          }
        },
        // {
        //   title: "商品类型",
        //   align: "center",
        //   minWidth: 80,
        //   render: (h, params) => {
        //     return h("div", {}, productType[params.row.type]);
        //   }
        // },
        {
          title: "商品分类",
          minWidth: 120,
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
                  maxWidth: 300,
                  transfer: true,
                  content: text,
                  placement: "top"
                }
              },
              text
            );
          }
        },
        {
          title: "排序",
          key: "sort",
          align: "center",
          sortable: "custom",
          minWidth: 50,
          render: (h, params) => {
            return h("div", {}, [
              h("span", params.row.sort || 0),
              h("i", {
                class: "iconfont icon-edit1",
                style: {
                  visibility: "hidden",
                  color: "#ED9218",
                  fontSize: "12px",
                  marginLeft: "5px",
                  cursor: "pointer"
                },
                attrs: {
                  perm: "product.operate"
                },
                on: {
                  click: () => {
                    this.currentRow = params.row;
                    this.isShowModifyOrder = true;
                  }
                }
              })
            ]);
          }
        },
        {
          title: "销售价",
          key: "price",
          align: "center",
          sortable: "custom",
          minWidth: 80,
          render: (h, params) => {
            return h("div", {}, "￥" + (params.row.price || ""));
          }
        },
        {
          title: "库存",
          key: "inventory",
          name: "inventory",
          align: "center",
          sortable: "custom",
          minWidth: 60,
          renderHeader: (h, params) => {
            return h(
              "span",
              {},
              this.tabNameSelectIndex === 3
                ? params.column.title + "告急"
                : params.column.title
            );
          },
          render: (h, params) => {
            let editSku = params.row.supplier_member_id
              ? ""
              : h("span", {
                  class: "iconfont icon-edit1 product-list-edit",
                  attrs: {
                    perm: "product.view"
                  },
                  style: {
                    fontSize: "14px",
                    marginLeft: "4px",
                    color: "#ED9218",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.getProductSkusInfo(params.row.id);
                    }
                  }
                });
            return h(
              "div",
              {
                class: this.tabNameSelectIndex === 3 ? "color-error" : ""
              },
              this.tabNameSelectIndex === 3
                ? [
                    h("div", {}, "某sku库存告急"),
                    h("div", [
                      h("span", `仅剩${params.row.skus_inventory || 0}件`),
                      editSku
                    ])
                  ]
                : [h("span", params.row.inventory || 0), editSku]
            );
          }
        },
        {
          title: "销量",
          key: "sold_count",
          align: "center",
          sortable: "custom",
          minWidth: 50,
          render: (h, params) => {
            return h("div", params.row.sold_count || 0);
          }
        },
        {
          title: "售后数",
          key: "after_sale_count",
          align: "center",
          sortable: "custom",
          minWidth: 50,
          render: (h, params) => {
            return h("div", params.row.after_sale_count || 0);
          }
        },
        {
          title: "更新时间",
          name: "put_on_sale_time",
          align: "center",
          minWidth: 80,
          renderHeader: h => {
            return h(
              "div",
              ["更新时间", "售罄时间", "更新时间", "上架时间"][
                this.tabNameSelectIndex
              ]
            );
          },
          render: (h, params) => {
            let dateTime = params.row[orderType[this.tabNameSelectIndex]];
            return h(
              "div",
              {},
              dateTime && [
                h("div", {}, dateTime.split(/\s/)[0].replace(/-/g, ".")),
                h("div", {}, dateTime.split(/\s/)[1])
              ]
            );
          }
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            let editButton = h(
              "span",
              {
                style: {
                  marginRight: "10px"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$router.push({
                      path: "detail",
                      query: {
                        id: params.row.id,
                        tab: this.tabNameSelectIndex
                        // extraTitle: "编辑商品"
                      }
                    });
                  }
                }
              },
              "编辑"
            );
            let line = h(
              "span",
              {
                style: {
                  marginRight: "2px"
                },
                class: {
                  "table-operation": true
                }
              },
              "|"
            );
            // if (this.tabNameSelectIndex === 1) {
            //   return h("div", [editButton, deleteButton]);
            // }

            let poperInput = h("Input", {
              props: {
                value: "",
                readonly: true
              },
              style: { width: "244px" }
            });

            let poper = h(
              "Poptip",
              {
                "word-wrap": true,
                props: {
                  placement: "bottom-end",
                  padding: "15px 22px",
                  transfer: true
                },
                style: { float: "right", marginRight: "-16px" }
              },
              [
                h("div", { slot: "content", style: { textAlign: "left" } }, [
                  h("div", { style: { marginBottom: "20px" } }, "推广链接："),
                  h("Icon", {
                    props: {
                      type: "md-close"
                    },
                    style: {
                      position: "absolute",
                      top: "20px",
                      right: "10px",
                      fontSize: "20px",
                      cursor: "pointer"
                    },
                    on: {
                      click: () => {
                        poper.child.handleClose();
                      }
                    }
                  }),
                  h("div", { style: { marginBottom: "20px" } }, [
                    poperInput,
                    h(
                      "Button",
                      {
                        props: { type: "primary" },
                        style: { height: "32px", marginLeft: "5px" },
                        on: {
                          click: () => {
                            this.copyLinkUrl(
                              poperInput.componentInstance.$refs["input"].value
                            );
                          }
                        }
                      },
                      "复制"
                    )
                  ]),
                  h("div", { style: { marginBottom: "20px" } }, "推广二维码："),
                  h("div", {}, [
                    h("img", {
                      attrs: {
                        src: ""
                      },
                      style: {
                        width: "110px",
                        height: "110px"
                      }
                    })
                  ])
                ])
              ]
            );

            let createDropdownItem = function(name, text, perm) {
              return h(
                "DropdownItem",
                {
                  props: {
                    name: name
                  },
                  style: {
                    width: "50px",
                    padding: "3px 0",
                    fontSize: "12px"
                  },
                  attrs: {
                    class: "ivu-dropdown-item primary-hover-font-bg",
                    perm: perm + ""
                  }
                },
                text
              );
            };

            let dropTimer = null;
            let dropdown = h(
              "Dropdown",
              {
                props: {
                  trigger: "click",
                  transfer: true
                },
                style: {
                  width: "50px"
                },
                on: {
                  "on-click": name => {
                    this.onDropDownClick(name, poper, params.row.id,params.row.supplier_status,params.row.supplier_name);
                  },
                  "on-visible-change": visible => {
                    this.isdropDownVisible = visible;
                    this.currentRow = params.row;

                    // 在关闭下拉显示的时候会有一瞬间的跳动，需要手动等待动画结束时隐藏一下
                    window.clearTimeout(dropTimer);
                    if (!visible) {
                      dropTimer = window.setTimeout(() => {
                        dropdown.componentInstance.$refs["drop"].$el &&
                          (dropdown.componentInstance.$refs[
                            "drop"
                          ].$el.style.display = "none");
                      }, 300);
                    }
                  }
                }
              },

              [
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true
                    }
                  },
                  [
                    "更多",
                    h("Icon", {
                      props: {
                        type:
                          this.isdropDownVisible &&
                          this.currentRow == params.row
                            ? "ios-arrow-up"
                            : "ios-arrow-down"
                      }
                    })
                  ]
                ),
                h(
                  "DropdownMenu",
                  {
                    slot: "list",
                    style: { margin: "-5px 0", minWidth: "50px" }
                  },
                  this.tabNameSelectIndex === 2
                    ? [
                        createDropdownItem(
                          dropDownName[0],
                          "上架",
                          "product.operate"
                        ),
                        createDropdownItem(
                          dropDownName[3],
                          "删除",
                          "product.operate"
                        )
                      ]
                    : [
                        createDropdownItem(
                          dropDownName[1],
                          "下架",
                          "product.operate"
                        ),
                        createDropdownItem(dropDownName[2], "推广", "")
                      ]
                )
              ]
            );

            return h("div", [editButton, line, dropdown, poper]);
          }
        }
      ],
      listData: [],
      totalNum: {
        sell: 0, // 出售数量
        sold_out: 0, // 已售数量
        warehouse: 0, // 仓库数量
        warning: 0
      },
      allClassSelectStatus: true, // 用于标识上一次分类选择是否选中全部分类
      searchParams: [
        // 查询
        {
          type: 10,
          key: "keyword",
          prefixIcon: "ios-search",
          optionWidth: 80,
          width: 223,
          placeholder: {
            1: "商品名称/商品编码",
            2: "平台名称"
          },
          optionKey: "keyword_type",
          options: [
            {
              id: "1",
              value: "商品"
            },
            this.hasLicensePerm("ENABLE_SUPPLIER")
              ? {
                  id: "2",
                  value: "供应平台"
                }
              : null
          ]
        },
        {
          type: 8,
          key: "class",
          width: 180,
          placeholder: "请选择分类",
          data: [],
          onChange: (dataobj, list) => {
            let classArray = [];
            list.forEach(item => {
              classArray.push(item.data.id);
            });
            // 只能有全选或多选（多于一个的时候有可能全选和多选都存在，根据标识去掉一种情况，如果没有选中则是都没有选，此时应该标识成全选）
            if (classArray.length > 1 && this.allClassSelectStatus) {
              classArray = classArray.filter(item => item !== -1);
              this.allClassSelectStatus = false;
              this.searchParams[1].data[0].checked = false;
            } else if (!classArray.length) {
              classArray = [-1];
              this.allClassSelectStatus = true;
              this.searchParams[1].data[0].checked = true;
            }
            dataobj.class = classArray;
          }
        },
        this.hasLicensePerm("ENABLE_SUPPLIER")
          ? {
              type: 3,
              key: "is_supplier_product",
              name: "商品性质：",
              options: [
                {
                  id: "-1",
                  value: "全部"
                },
                {
                  id: "0",
                  value: "自营商品"
                },
                {
                  id: "1",
                  value: "供应商商品"
                }
              ]
            }
          : null,
        {
          type: 3,
          key: "type",
          width:120,
          name: "商品类型：",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 0,
              value: "实物商品"
            },
            {
              id: 1,
              value: "虚拟商品"
            }
          ]
        }
      ].filter(n => n)
    };
  },
  watch: {
    classList(val) {
      let data = [];
      this.util = ClassUtil.newIntance(val);
      var clsTree = this.util.getTreeList();
      var sortedClassList = {
        title: "全部分类",
        data: { id: -1, class_name: "全部分类" },
        checked: this.searchData.class.indexOf(-1) > -1
      };
      if (clsTree.length > 0) {
        clsTree.forEach(item => {
          var titem = { title: item.class_name };
          titem.children = [];
          titem.expand = true;
          titem.data = { id: item.id, class_name: item.class_name };
          titem.checked = this.searchData.class.indexOf(item.id) > -1;
          item.children.forEach(item1 => {
            titem.children.push({
              title: item1.class_name,
              data: { id: item1.id, class_name: item1.class_name },
              checked: this.searchData.class.indexOf(item1.id) > -1
            });
          });
          data.push(titem);
        });
      }
      this.searchParams[1].data = [sortedClassList, ...data];
    },
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getProductList();
      },
      deep: true
    }
  },
  computed: {
    tabNameSelectIndex() {
      return this.tabNameArray.findIndex(el => el === this.tabNameSelect);
    },
    columnsData() {
      if (this.tabNameSelect == "soldout") {
        return this.initColumnsData.filter(column => {
          return column.name != "inventory";
        });
      }
      if (this.tabNameSelect == "skuWarming") {
        return this.initColumnsData.filter(column => {
          return column.name != "put_on_sale_time";
        });
      }
      return this.initColumnsData;
    }
  },
  created() {
    let index = this.$route.query.index || 0;
    this.tabNameSelect = this.tabNameArray[index];

    this.$store.state.COMMON_loading = true;
  },
  mounted() {
    this.searchData = this.getSearchInitData();
  },
  methods: {
    /**
     * 批量导入
     */
    onBatchImportChange() {
      switch (this.batchSelectValue) {
        case 0:
          this.batchStatus = true;
          break;
        case 1:
          this.isShowImportStock = true;
          break;
        default:
          break;
      }
      this.$nextTick(() => {
        this.batchSelectValue = null;
        this.$refs["batchBtn"].focusIndex = -1;
      });
    },
    refresh() {
      this.currentPage = 1;
      this.getProductList();
    },
    /**
     * 获取商品规格数据
     */
    getProductSkusInfo(id) {
      this.$httpPost(
        "/shop/admin/product/sku/info",
        {
          product_id: id
        },
        res => {
          if (res.code === 200) {
            this.productInfo = res.data;
            this.stockStatus = true;
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 获取搜索参数
     */
    getSearchParams() {
      let status = 1;
      if (this.tabNameSelectIndex === 2) status = 0;
      if (this.tabNameSelectIndex === 1) status = -1;
      let data = {
        status,
        is_inventory: this.tabNameSelectIndex === 3 ? 1 : 0,
        keyword: this.searchData.keyword,
        order_by: this.searchData.order_by,
        is_supplier_product:
          this.searchData.is_supplier_product == -1
            ? null
            : this.searchData.is_supplier_product,
        keyword_type: this.searchData.keyword_type,
        page: this.currentPage,
        pageSize: this.pageSize
      };
      // if (this.searchData.level !== "-1") {
      //   data.type = this.searchData.level;
      // }
      if (this.searchData.type != -1){
        data.type = this.searchData.type;
      }
      data.class = this.searchData.class;
      if (data.class.indexOf(-1) > -1) data.class = [];
      return data;
    },
    /**
     * 获取商品列表
     */
    getProductList() {
      this.tableLoading = true;
      let data = this.getSearchParams();
      Promise.all([
        new Promise((resolve, reject) => {
          this.http({
            url: "/shop/admin/product/count"
          })
            .then(res => {
              this.totalNum = res.data || {};
              resolve();
            })
            .catch(() => {
              reject();
            });
        }),
        new Promise((resolve, reject) => {
          this.http({
            url: "/shop/admin/product/list",
            data: data,
            method: "POST"
          })
            .then(res => {
              if (res.data) {
                this.listData = [];
                this.$nextTick(() => {
                  this.selectTableData = [];
                  this.classList = res.data.classList || [];
                  this.listData =
                    (res.data.productList && res.data.productList.list) || [];
                  this.currentPage = res.data.productList.current;
                  this.pageSize = res.data.productList.page_size;
                  this.total = res.data.productList.total;
                });
              }
              resolve();
            })
            .catch(() => {
              reject();
            });
        })
      ]).finally(() => {
        this.tableLoading = false;
        this.$store.state.COMMON_loading = false;
      });
    },
    /**
     * 批量上传
     */
    onBatchProductStatusChange(status) {
      if (!this.selectTableData.length) {
        this.$Message.error("请选择要批量操作的商品");
        return;
      }
      let confirmTxt = "确定执行批量操作？";
      if (status === 0) {
        confirmTxt = "是否确定下架所选商品？";
      } else if (status === -9) {
        confirmTxt = "删除后将不可恢复，是否确定删除所选商品？";
      } else if (status === 1) {
        confirmTxt = "是否确定上架所选商品？";
      }
      let disableList = this.selectTableData.filter(
        item => item.supplier_status == -1
      );
      if (status === 1 && disableList.length) {
        this.$Modal.confirm({
          title: "提示",
          content:
            "选择上架的商品中，存在已经被取消供应商资格的供应商，暂不能上架该商品；如有需要，请检查并启用该供应商的资格后再上架商品。",
          okText: "知道了",
          cancelText: " "
        });
      } else {
        this.$Modal.confirm({
          title: "提示",
          content: confirmTxt,
          okText: "确定",
          loading: true,
          onOk: () => {
            this.changeProductStatus({
              productId: this.selectTableData.map(item => item.id),
              status: status
            });
          }
        });
      }
    },
    getSearchInitData() {
      let searchDataCopy = JSON.parse(JSON.stringify(searchData));
      searchDataCopy.order_by.column = orderType[this.tabNameSelectIndex];
      if (this.$route.params.keyword) {
        searchDataCopy.keyword = this.$route.params.keyword;
      }
      if (this.$route.params.keyword_type) {
        searchDataCopy.keyword_type = this.$route.params.keyword_type;
      }
      return searchDataCopy;
    },
    /* 切换标签 */
    dataList() {
      this.searchData = this.getSearchInitData();
      this.allClassSelectStatus = true;
      this.currentPage = 1;
      this.$refs["exportTable"].$refs["selection"].cloneColumns.forEach(
        item => {
          item._sortType = "normal";
        }
      );
      this.$router.replace({
        name: "productManage",
        query: {
          index: this.tabNameSelectIndex
        }
      });
    },
    /**
     * 跳转到商品详情
     */
    onAddProduct() {
      this.$router.push({ name: "productAdd" });
    },
    /**
     * 排序回调
     */
    onSortChange(data) {
      if (data.key === "member_price") {
        data.key = "price";
      } else if (data.key === "inventory" && this.tabNameSelectIndex === 3) {
        data.key = "skus_inventory";
      }
      this.searchData.order_by.column = data.key;
      this.searchData.order_by.order = data.order;
    },
    /**
     * table选择变化时触发
     */
    onSelectionChange(selectData) {
      this.selectTableData = selectData;
    },
    /**
     * 复制商品链接
     */
    copyLinkUrl(url) {
      var oInput = document.createElement("input");
      oInput.value = url;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.style.display = "none";
      document.body.removeChild(oInput);
      this.$Message.success("复制成功");
    },
    /**
     * 更多按钮弹出的下拉按钮
     */
    onDropDownClick(name, poper, id,supplier_status,supplier_name) {
      let dropDom = poper.componentInstance.$refs["popper"];
      switch (name) {
        case dropDownName[0]:
          if (supplier_status == -1) {
            this.$Modal.confirm({
              title: "提示",
              content: "该供应商【"+supplier_name+"】已经被取消了供应商资格，暂不能上架该商品；如有需要，请先启用该供应商的资格再上架商品。",
              okText: "知道了",
              cancelText: " "
            });
          } else {
            this.$Modal.confirm({
              title: "提示",
              content: "是否确定上架该商品？",
              okText: "确定",
              loading: true,
              onOk: () => {
                this.changeProductStatus({
                  productId: id,
                  status: 1
                });
              }
            });
          }

          break;
        case dropDownName[1]:
          this.$Modal.confirm({
            title: "提示",
            content: "是否确定下架该商品？",
            okText: "确定",
            loading: true,
            onOk: () => {
              this.changeProductStatus({
                productId: id,
                status: 0
              });
            }
          });

          break;
        case dropDownName[2]:
          this.$httpGet(
            "/shop/admin/product/qrcode/" + id,
            {
              size: 200,
              margin: 1
            },
            res => {
              // 修改弹窗内容
              dropDom.querySelector("input").value = res.data.url;
              dropDom.querySelector("img").src = res.data.image;
              this.$nextTick(() => {
                dropDom.style.marginTop = "28px";
                poper.elm.children[0].click();
                // 修改弹窗的位置
                window.setTimeout(() => {
                  dropDom.style.top = "310px";
                  dropDom.style.right = "6%";
                  dropDom.style.left = "";
                }, 0);
              });
            }
          );

          break;
        case dropDownName[3]:
          this.$Modal.confirm({
            title: "提示",
            content: "删除后将不可恢复，是否确定删除该商品？",
            okText: "确定",
            loading: true,
            onOk: () => {
              this.changeProductStatus({
                productId: id,
                status: -9
              });
            }
          });
          break;
      }
    },
    /**
     * 修改商品状态
     */
    changeProductStatus(data) {
      this.$httpPost("/shop/admin/product/status/edit", data, res => {
        this.$Modal.remove();
        if (res.code === 200) {
          this.currentPage = 1;
          if (data.status === 0) {
            this.$Message.success("下架成功");
          } else if (data.status === -9) {
            this.$Message.success("删除成功");
          } else if (data.status === 1) {
            this.$Message.success("上架成功");
          }
          this.getProductList();
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 导出商品列表
     */
    onExportTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      if (
        this.selectTableData.length > 0 &&
        this.listData.length > this.selectTableData.length
      ) {
        let data = this.getSearchParams();
        data.product_ids = this.selectTableData.map(item => item.id);
        this.exportTable(data);
        return;
      }
      this.tableListExportStatus = true;
    },
    /**
     * 分页跳转
     */
    onPageChange(index) {
      this.currentPage = index;
      this.getProductList();
    },
    /**
     * 页数变化
     */
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      localStorage.setItem("product-list-page-size", this.pageSize);
      this.getProductList();
    },
    /**
     * 导出列表
     */
    onExportTableComfirm() {
      let data = this.getSearchParams();
      if (this.exportTableStatus === "0") {
        data.product_ids = this.listData.map(item => item.id);
        this.exportTable(data);
        return;
      }
      data.page = 0;
      this.exportTable(data);
    },
    /**
     * 导出数据
     */
    exportTable(data) {
      this.http({
        url: "/shop/admin/product/list/export",
        method: "POST",
        data: data,
        responseType: "blob"
      }).then(res => {
        var fileName = res.headers["content-disposition"]
          .split(";")[1]
          .split("filename=")[1]
          .replace(/"/g, "");
        this.download(res.data, fileName);
      });
    },
    download(data, file_name) {
      if (!data) {
        return;
      }
      let csvData = new Blob([data]);
      // IE
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(csvData, file_name);
        return;
      }
      // 非IE
      let url = window.URL.createObjectURL(csvData);
      let link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", file_name);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
};
</script>

<style lang="less" scoped>
.product-list {
  padding: 0 0px 20px;
  /deep/.ivu-tabs-bar {
    margin-bottom: 24px;
    padding: 0 24px;
    .ivu-tooltip-rel {
      overflow: visible !important;
    }
  }
  /deep/.ivu-tabs-content {
    position: relative;
    padding: 24px 24px 0;
    .btn-import {
      position: absolute;
      top: -42px;
      right: 12px;
      width: 100px;
      .ivu-select-placeholder,
      .ivu-select-selected-value {
        visibility: hidden;
      }
      .ivu-select-selection {
        background-color: transparent;
        i {
          margin-top: -1px;
        }
      }
      & > span {
        pointer-events: none;
        position: absolute;
        top: 0;
        display: block;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-left: 8px;
        padding-right: 24px;
        i {
          margin-right: 5px;
          vertical-align: bottom;
        }
      }
      .ivu-select-visible {
        i,
        & + span {
          color: #4a6af5;
        }
      }
    }
  }
  /deep/.class-selector {
    .ivu-select-dropdown {
      .ivu-select-dropdown-list > li:first-child {
        display: none;
      }
    }
  }
  .list-search {
    text-align: left;
    margin-bottom: 20px;
  }
  .product-list-add {
    text-align: left;
    // margin-bottom: 24px;
  }
  /deep/.data-list-search {
    text-align: left;
    .data-list-search-btn {
      display: inline;
    }
    .ivu-select {
      width: 180px;
    }
    .data-list-search-item:nth-child(3) {
      .ivu-select {
        width: 120px;
      }
    }
    .data-list-search-item:nth-child(4) {
      .ivu-input-wrapper {
        width: 200px;
      }
    }
  }
  /deep/.ivu-tooltip {
    .ivu-tooltip-rel {
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      overflow: hidden;
      -webkit-box-orient: vertical;
      width: 100%;
    }
    .ivu-tooltip-inner {
      white-space: pre-wrap;
    }
  }

  /deep/.data-list-footer {
    text-align: left;
    margin-left: 12px;
  }
  /deep/.ivu-tabs-no-animation {
    min-height: calc(100vh - 104px);
  }
  /deep/table {
    .ivu-table-row-hover {
      .icon-edit1 {
        visibility: visible !important;
      }
    }
    .ivu-table-cell {
      padding-left: 0;
      padding-right: 0;
    }
    td {
      .product-list-edit {
        display: none;
      }
      &:hover {
        .product-list-edit {
          display: initial;
        }
      }
    }
    .ivu-select-dropdown {
      border-radius: 0;
    }
  }
}
// 公共的css
.common-margin {
  margin-right: 8px;
}
</style>
