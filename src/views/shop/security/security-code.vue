<template>
  <div class="security-code">
    <search-list
      ref="searchList"
      :searchParams="searchParams"
      :searchData="searchData"
      class="marketing-search"
    >
      <Button @click="onBatchClick" perm="security.operate">批量删除</Button>
    </search-list>
    <div class="security-code-content">
      <common-table
        :minWidth="1158"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
        @selectData="onSelectChange"
      ></common-table>
    </div>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="page"
        :page-size="page_size"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        show-sizer
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
  </div>
</template>
<script>
import addMore from "@/views/shop/components/button/add-more.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
const initialSearchData = {
  keyword: ""
};
export default {
  components: {
    addMore,
    searchList,
    commonTable
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      tableLoading: true,
      //底部table展示数据
      selectData: [],
      columnsData: [
        {
          type: "selection",
          width: 40,
          align: "center"
        },
        {
          title: "防伪码编号",
          minWidth: 138,
          render: (h, params) => {
            return h("div", params.row.code);
          }
        },
        {
          title: "当前批次",
          align: "center",
          minWidth: 188,
          render: (h, params) => {
            return h("div", params.row.batch_code);
          }
        },
        {
          title: "关联商品名称",
          minWidth: 416,
          render: (h, params) => {
            return h(
              "div",
              Number(params.row.product_id)
                ? [
                    h("img", {
                      attrs: {
                        src: this.getImageUrl(params.row.images && params.row.images.split(',')[0])
                      },
                      style: {
                        width: "40px",
                        height: "40px",
                        "vertical-align": "middle",
                        display: "inline-block",
                        marginRight: "16px",
                        borderRadius: "4px"
                      }
                    }),
                    h(
                      "div",
                      {
                        class: "two-hide",
                        style: {
                          display: "-webkit-inline-box",
                          "vertical-align": "middle",
                          width: "calc(100% - 56px)"
                        }
                      },
                      params.row.product_name
                    )
                  ]
                : [
                    h(
                      "div",
                      {
                        class: "table-error"
                      },
                      "无关联商品"
                    )
                  ]
            );
          }
        },
        {
          title: "最后查询时间",
          minWidth: 178,
          align: "center",
          render: (h, params) => {
            return params.row.last_query_at
              ? h("div", { style: { marginLeft: "-5px" } }, [
                  h(
                    "span",
                    { style: { marginLeft: "5px", display: "inline-block" } },
                    params.row.last_query_at.split(/\s/)[0]
                  ),
                  h(
                    "span",
                    { style: { marginLeft: "5px", display: "inline-block" } },
                    params.row.last_query_at.split(/\s/)[1]
                  )
                ])
              : h("div", "--");
          }
        },
        {
          title: "查询次数",
          minWidth: 112,
          align: "center",
          render: (h, params) => {
            return h("div", params.row.query_times);
          }
        },
        {
          title: "操作",
          minWidth: 87,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "security.operate"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: `删除后将不可恢复，并不再有查询结果！是否确定删除【防伪码：${params.row.code}】?`,
                        loading: true,
                        onOk: () => {
                          this.deleteList(params.row.id);
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      listData: [], // 列表数据
      searchData: Object.assign({}, initialSearchData),
      page_size: 20, // 每页显示数量
      page: 1, // 页码
      total: 10, // 总数
      //头部查询模块参数数据
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "防伪码编号/批次号/商品名称",
          prefixIcon: "ios-search"
        }
      ]
    };
  },
  watch: {
    searchData: {
      handler() {
        this.page = 1;
        this.getList();
      },
      deep: true
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    if (this.$route.params.keyword) {
      this.searchData.keyword = this.$route.params.keyword;
    } else {
      this.getList();
    }
  },
  methods: {
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
    },
    deleteList(ids) {
      this.$httpPost(
        "/shop/admin/security/code/delete",
        {
          code_id: ids
        },
        res => {
          if (res.code === 200) {
            this.$Modal.remove();
            this.$Message.success("删除成功");
            this.page = 1;
            this.getList();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 批量删除
     */
    onBatchClick() {
      if (!this.selectData.length) {
        this.$Message.error("请选择要批量操作的防伪码");
      } else {
        this.$Modal.confirm({
          title: "提示",
          content: "删除后将不可恢复，并不再有查询结果！是否确定删除？",
          loading: true,
          onOk: () => {
            this.deleteList(this.selectData.map(n => n.id));
          }
        });
      }
    },
    /**
     * 批量选择
     */
    onSelectChange(val) {
      this.selectData = val;
    },
    getImageUrl(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    // 分页
    changePage(val) {
      this.page = val;
      this.getList();
    },
    // 条数
    changePageSize(val) {
      this.page_size = val;
      this.page = 1;
      this.getList();
    },
    // 获取列表数据
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/security/code/list",
        {
          keyword: this.searchData.keyword,
          page: this.page,
          page_size: this.page_size
        },
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.listData = res.data.list;
            this.total = res.data.total;
            this.page = Number(res.data.current);
            this.page_size = Number(res.data.page_size);
            this.selectData = [];
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.security-code {
  padding: 24px;
  .security-code-head {
    margin-bottom: 24px;
  }
}
</style>
