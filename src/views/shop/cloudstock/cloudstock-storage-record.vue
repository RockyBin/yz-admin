<template>
  <div class="cloudstock-storage-record">
    <!-- 头部信息 -->
    <div class="cloudstock-storage-record-head">
      <titlebar :title="$route.query.nickname +' 的云仓出入库记录'"></titlebar>
    </div>
    <div class="cloudstock-storage-record-content">
      <div class="cloudstock-storage-record-search">
        <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true" />
      </div>

      <common-table
        :minWidth="962"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
      ></common-table>
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
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
const agentLevelText = ["一级经销商", "二级经销商", "三级经销商"];
const searchData = {
  keyword: "",
  type: -1,
  beingTime: {
    startTime: "",
    endTime: ""
  }
};
export default {
  components: {
    titlebar,
    searchList,
    commonTable
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "商品名称"
        },
        {
          type: 3,
          key: "type",
          placeholder: "请选择",
          name: "类型：",
          options: [
            { id: -1, value: "全部" },
            { id: "in:1", value: "进货增加库存" },
            { id: "out:3", value: "提货扣减库存" },
            { id: "in:4", value: "取消提货单返还库存" },
            { id: "out:2", value: "下级进货扣减库存" },
            { id: "in:9", value: "手动增加库存" },
            { id: "out:9", value: "手动减少库存" },
            // { id: "in:2", value: "首次开通云仓赠送" }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "操作时间："
        }
      ],
      agentLevelText,
      searchData: JSON.parse(JSON.stringify(searchData)),
      tableLoading: false,
      columnsData: [
        {
          title: "商品信息",
          align: "left",
          minWidth: 300,
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
                h("img", {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  attrs: {
                    src: this.getHeadImg(params.row.product_image)
                  },
                  style: {
                    width: "40px",
                    height: "40px",
                    marginRight: "14px",
                    objectFit: "contain"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 56px)",
                      "min-height": "44px"
                    }
                  },
                  [
                    h("div", {
                      style: {
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        display: "-webkit-box",
                        "-webkit-line-clamp": 2,
                        "-webkit-box-orient": "vertical"
                      }
                    }, params.row.product_name),
                    params.row.sku_name && params.row.sku_name.length ? h("div", {
                      style: {
                        color: "#9EA7B4",
                        "margin-top": "5px"
                      }
                    }, this.yzArrayToString(params.row.sku_name)) : ""
                  ]
                )
              ]
            );
          }
        },
        {
          title: "类型",
          align: "left",
          minWidth: 124,
          render: (h, params) => {
            return h("div", params.row.num_after - params.row.num_before >= 0 ? params.row.in_type_text : params.row.out_type_text);
          }
        },
        {
          title: "变更前库存",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("div", params.row.num_before);
          }
        },
        {
          title: "变更库存",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("div", (params.row.num_after - params.row.num_before >= 0 ? '+' : '') + params.row.num);
          }
        },
        {
          title: "变更后库存",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("div", params.row.num_after);
          }
        },
        {
            title: "摘要",
            align: "left",
            minWidth: 214,
            render: (h, params) => {
                return h("div", params.row.about);
            }
        },
        {
          title: "操作时间",
          align: "left",
          width: 160,
          render: (h, params) => {
            return h("div", params.row.created_at);
          }
        }
      ],
      listData: [],
      total: 0,
      currentPage: 1,
      pageSize: 20
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    }
  },
  created() {
    this.getList();
  },
  methods: {
    onPageChange(val) {
      this.currentPage = val;
      this.getList();
    },
      getHeadImg(url) {
          if (!/^(http)/i.test(url)) {
              url = this.$store.state.siteComdataPath + url;
          }
          return url;
      },
    onPageSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getList();
    },
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/cloudstock/skuloglist",
        {
          member_id: this.$route.query.id,
          keyword: this.searchData.keyword,
          type: this.searchData.type === -1 ? "" : this.searchData.type,
          created_at_min: this.searchData.beingTime.startTime,
          created_at_max: this.searchData.beingTime.endTime,
          page: this.currentPage,
          page_size: this.pageSize
        },
        res => {
          this.tableLoading = false;
          if (res.code === 200) {
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.listData = res.data.list;
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
    }
  }
};
</script>
<style lang="less" scoped>
@border-color: #e9eaf2;
.cloudstock-storage-record {
  padding: 24px;
  color: #464c5b;
  // 头部信息样式
  .cloudstock-storage-record-head {
    margin-bottom: 24px;
  }
  .cloudstock-storage-record-content {
    /deep/.page-style.ivu-page {
      text-align: right;
      line-height: 56px;
    }
  }
}
</style>
