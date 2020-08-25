<template>
  <div class="security-batch">
    <div>
      <add-more text="新增防伪码批次" @onAddMoreClick="$router.push({name: 'securityBatchAdd'})" perm="security.operate"/>
    </div>
    <search-list
      ref="searchList"
      :searchParams="searchParams"
      :searchData="searchData"
      class="marketing-search"
    />
    <div class="security-batch-content">
      <common-table
        :minWidth="1158"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
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
import commonFunction from "@/views/shop/components/common-function.js";
const initialSearchData = {
  keyword: "",
  createTime: {
    // 注册时间
    startTime: "",
    endTime: ""
  }
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
      columnsData: [
        {
          title: "防伪码批次号",
          minWidth: 179,
          render: (h, params) => {
            return h("div", params.row.batch_code);
          }
        },
        {
          title: "关联商品名称",
          minWidth: 408,
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
                        marginRight: "14px",
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
          title: "防伪码数量",
          align: "center",
          minWidth: 117,
          render: (h, params) => {
            return h("div", params.row.batch_count);
          }
        },
        {
          title: "创建时间",
          key: "created_at",
          minWidth: 170,
          align: "center",
          render: (h, params) => {
            return h("div", { style: { marginLeft: "-5px" } }, [
              h(
                "span",
                { style: { marginLeft: "5px", display: "inline-block" } },
                params.row.created_at && params.row.created_at.split(/\s/)[0]
              ),
              h(
                "span",
                { style: { marginLeft: "5px", display: "inline-block" } },
                params.row.created_at && params.row.created_at.split(/\s/)[1]
              )
            ]);
          }
        },
        {
          title: "导出次数",
          minWidth: 104,
          align: "center",
          render: (h, params) => {
            return h("div", params.row.export_times);
          }
        },
        {
          title: "操作",
          minWidth: 180,
          render: (h, params) => {
            let line = h(
              "span",
              {
                class: {
                  "table-operation": true
                },
                style: {
                  margin: "0 10px",
                  cursor: "default"
                }
              },
              "|"
            );
            return params.row.code_create_status
              ? h("div", [
                  h(
                    "span",
                    {
                      class: {
                        "table-operation": true
                      },
                      attrs: {
                        perm: "security.view"
                      },
                      on: {
                        click: () => {
                          this.$router.push({
                            name: "securityCode",
                            params: {
                              keyword: params.row.batch_code
                            }
                          })
                        }
                      }
                    },
                    "查看"
                  ),
                  line,
                  h(
                    "span",
                    {
                      class: {
                        "table-operation": true
                      },
                      attrs: {
                        perm: "security.view"
                      },
                      on: {
                        click: () => {
                          commonFunction.exportTable(
                            { batch_code: params.row.batch_code },
                            this.http,
                            "/shop/admin/security/code/export"
                          );
                        }
                      }
                    },
                    "导出"
                  ),
                  line,
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
                            content:
                              `此操作会删除该批次下所有的防伪码！删除后将不可恢复，并不再有查询结果！是否确定删除【批次：${params.row.batch_code}】?`,
                            loading: true,
                            onOk: () => {
                              this.$httpPost(
                                "/shop/admin/security/code/batch/delete",
                                { batch_id: params.row.id },
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
                            }
                          });
                        }
                      }
                    },
                    "删除"
                  )
                ])
              : h(
                  "div",
                  {
                    style: {
                      color: "#ED4014"
                    }
                  },
                  "生成中，请稍后刷新！"
                );
          }
        }
      ],
      listData: [], // 列表数据
      searchData: Object.assign({}, initialSearchData),
      page_size: 20, // 每页显示数量
      page: 1, // 页码
      total: 0, // 总数
      //头部查询模块参数数据
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "防伪码批次号/商品名称",
          prefixIcon: "ios-search"
        },
        {
          type: 2,
          name: "创建时间：",
          key: "createTime"
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
    this.getList();
  },
  methods: {
    getImageUrl(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
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
      this.$httpGet(
        "/shop/admin/security/code/batch/list",
        {
          keyword: this.searchData.keyword,
          created_at_start: this.searchData.createTime.startTime,
          created_at_end: this.searchData.createTime.endTime,
          page: this.page,
          page_size: this.page_size
        },
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.total = res.data.total;
            this.page = Number(res.data.current);
            this.page_size = Number(res.data.page_size);
            this.listData = res.data.list;
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
.security-batch {
  padding: 24px;
}
</style>
