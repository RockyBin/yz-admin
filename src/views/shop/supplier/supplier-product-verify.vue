<template>
  <div class="supplier-product-verify" v-show="!$store.state.COMMON_loading">
    <search-list :searchParams="searchParams" :search-data="searchData">
      <Button perm="product.operate" @click="onBatchVerifyClick"
        >批量审核</Button
      >
    </search-list>
    <common-table
      ref="exportTable"
      :minWidth="1071"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
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
    <modal-verify
      v-model="verifyModalStatus"
      :dataInfo="currentRow"
      @onConfirmClick="onModalConfirmClick"
    ></modal-verify>
    <page-select
      v-model="pageSelectStatus"
      @on-select="onPageTypeSelect"
    ></page-select>
  </div>
</template>

<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import modalVerify from "./components/supplier-product-verify-modal";
import pageSelect from "@/views/shop/components/modal/modal-page-select";
const searchData = {
  keyword: "",
  keyword_type: 1,
  createTime: {
    startTime: "",
    endTime: ""
  }
};

export default {
  components: {
    commonTable,
    searchList,
    modalVerify,
    pageSelect
  },
  data() {
    return {
      currentRow: null,
      pageSelectStatus: false,
      pageSelectVal: 0,
      total: 0,
      currentPage: 1,
      tableLoading: false,
      pageSize: localStorage.getItem("supplier-product-verify-page-size")
        ? parseInt(localStorage.getItem("supplier-product-verify-page-size"))
        : 20,
      verifyModalStatus: false,
      selectTableData: [],
      searchData: {
        ...JSON.parse(JSON.stringify(searchData)),
        keyword: this.$route.params.keyword || ""
      },
      columnsData: [
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
                  alignItems: "center"
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
                    }
                  },
                  [
                    h("img", {
                      attrs: {
                        src: params.row.image
                          ? this.$store.state.siteComdataPath + params.row.image
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
                      },
                      props: {
                        content: params.row.product_name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      }
                    },
                    [h("div", params.row.product_name)]
                  ),
                  params.row.sku_code &&
                  parseInt(params.row.sku_code.replace(",", ""))
                    ? h(
                        "div",
                        { style: { color: "#9EA7B4", "font-size": "12px" } },
                        `多规格：${params.row.sku_count}种规格`
                      )
                    : ""
                ])
              ]
            );
          }
        },
        {
          title: "供应商平台",
          minWidth: 80,
          render: (h, params) => {
            return h("div", [
              h("i", {
                class: "iconfont icon-gonghuoshang",
                style: "color: #41B44D;margin-right: 5px;"
              }),
              h("span", params.row.supplier_name)
            ]);
          }
        },
        {
          title: "销售价",
          align: "center",
          minWidth: 80,
          render: (h, params) => {
            return h("div", {}, "￥" + (params.row.price || ""));
          }
        },
        {
          title: "供货价",
          align: "center",
          minWidth: 80,
          render: (h, params) => {
            return h("div", {}, "￥" + (params.row.supplier_price || ""));
          }
        },
        {
          title: "成本价",
          align: "center",
          minWidth: 80,
          render: (h, params) => {
            return h("div", {}, "￥" + (params.row.supply_price || ""));
          }
        },
        {
          title: "库存",
          align: "center",
          minWidth: 60,
          render: (h, params) => {
            return h("div", params.row.inventory || 0);
          }
        },
        {
          title: "申请时间",
          align: "center",
          minWidth: 80,
          render: (h, params) => {
            let dateTime = params.row.submit_verify_at;
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
                class: {
                  "table-operation": true
                },
                attrs: {
                  perm: "product.operate"
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "supplierProductDetail",
                      query: {
                        id: params.row.id
                      }
                    });
                  }
                }
              },
              "查看商品"
            );
            let line = h(
              "span",
              {
                style: {
                  margin: "0 12px"
                },
                class: {
                  "table-operation": true
                }
              },
              "|"
            );

            let verifyButton = h(
              "span",
              {
                style: {
                  marginRight: "10px"
                },
                attrs: {
                  perm: "product.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.getVeirfyData(params.row.id, params.row.image);
                  }
                }
              },
              "审核"
            );

            return h("div", [editButton, line, verifyButton]);
          }
        }
      ],
      listData: [],
      searchParams: [
        // 查询
        {
          type: 10,
          key: "keyword",
          prefixIcon: "ios-search",
          optionWidth: 80,
          width: 223,
          placeholder: {
            1: "平台名称",
            2: "商品名称/商品编码"
          },
          optionKey: "keyword_type",
          options: [
            {
              id: 1,
              value: "供应平台"
            },
            {
              id: 2,
              value: "商品"
            }
          ]
        },
        {
          type: 2,
          name: "申请时间：",
          key: "createTime"
        }
      ]
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getProductList();
      },
      deep: true
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getProductList();
  },
  methods: {
    /**
     * 选择审核当前页还是所有页
     */
    onPageTypeSelect(val) {
      this.pageSelectVal = val;
      this.pageSelectStatus = false;
      this.verifyModalStatus = true;
      this.currentRow = null;
    },
    /**
     * 批量审核
     */
    onBatchVerifyClick() {
      if (!this.selectTableData.length) {
        this.$Message.error("请选择要审核的商品");
        return;
      }
      if (this.selectTableData.length === this.listData.length) {
        this.pageSelectStatus = true;
        return;
      }
      this.verifyModalStatus = true;
      this.currentRow = null;
    },
    /**
     * 获取审核商品数据
     */
    getVeirfyData(id, image) {
      this.$httpPost(
        "/shop/admin/supplier/product/verify/info",
        { id },
        res => {
          if (res.code === 200) {
            this.verifyModalStatus = true;
            res.data.image = image;
            this.currentRow = res.data;
          } else if ([411, 500].includes(res.code)) {
            this.$Message.error(res.msg);
            this.onPageChange(1);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 获取搜索条件
     */
    getSearchData() {
      let data = {
        keyword: this.searchData.keyword,
        keyword_type: this.searchData.keyword_type,
        created_at_start: this.searchData.createTime.startTime,
        created_at_end: this.searchData.createTime.endTime
      };
      return data;
    },
    /**
     * 获取商品列表
     */
    getProductList() {
      this.tableLoading = true;
      let data = this.getSearchData();
      data.page = this.currentPage;
      data.page_size = this.pageSize;
      this.$httpPost("/shop/admin/supplier/product/verify/list", data, res => {
        this.tableLoading = false;
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.listData = res.data.list;
          this.total = res.data.total;
          this.selectTableData = [];
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 审核商品
     */
    onModalConfirmClick(data, callback) {
      if (
        this.selectTableData.length === this.listData.length &&
        this.pageSelectVal
      ) {
        data = {
          is_all: 1,
          ...this.getSearchData(),
          ...data
        };
      } else {
        data = {
          ids: this.currentRow
            ? this.currentRow.id
            : this.selectTableData.map(n => n.id),
          ...data
        };
      }
      this.$httpPost("/shop/admin/supplier/product/verify", data, res => {
        callback();
        if (res.code === 200) {
          this.$Message.success("审核成功");
          this.onPageChange(1);
        } else if ([411, 500].includes(res.code)) {
          this.$Message.error(res.msg);
          this.onPageChange(1);
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * table选择变化时触发
     */
    onSelectionChange(selectData) {
      this.selectTableData = selectData;
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
      localStorage.setItem("supplier-product-verify-page-size", this.pageSize);
      this.getProductList();
    }
  }
};
</script>

<style lang="less" scoped>
.supplier-product-verify {
  padding: 24px 24px 20px;
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
  /deep/table {
    .ivu-table-cell {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>
