<template>
  <div class="member-achievement">
    <search-list
      :searchParams="searchParams"
      :searchData="searchData"
    ></search-list>
    <common-table
      :minWidth="1093"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
    ></common-table>
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
        :transfer="true"
      />
    </div>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components: {
    searchList,
    commonTable,
  },
  data() {
    return {
      page: 1,
      page_size: 20,
      total: 0,
      tableLoading: false,
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机",
        },
        {
          type: 3,
          key: "time_type",
          name: "",
          options: [
            {
              id: 0,
              value: "付款时间",
            },
            {
              id: 1,
              value: "过维权期时间",
            },
            {
              id: 2,
              value: "下单时间",
            }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "：",
        },
        {
          type: 3,
          key: "order_valid_condition",
          name: "统计数据：",
          options: [
            {
              id: 0,
              value: "付款后",
            },
            {
              id: 1,
              value: "维权期后",
            },
          ]
        }
      ],
      searchData: {
        keyword: "",
        beingTime: {
          startTime: "",
          endTime: "",
        },
        time_type: 0, //0 付款时间 1 过维权期时间 2 下单时间
        order_valid_condition: 0,
      },
      listData: [],
      columnsData: [
        {
          title: "会员信息",
          width: 300,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.id),
                headurl:
                  this.padImgUrl(params.row.headurl) ||
                  "images/head-portrait.png",
                nickname: params.row.nickname,
                mobile: params.row.mobile,
                name: params.row.name || "--",
              }
            });
          },
        },
        {
          title: " 所有推荐人的伞下业绩（不包括自购订单/不包括不参与分佣的商品）",
          minWidth: 400,
          align: "center",
          render: (h, params) => {
            return h("div", "￥" + params.row.total)
          },
        }
      ],
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
    this.getList(true);
  },
  methods: {
    padImgUrl(url) {
      if (!url) {
        return;
      }
      if (/^http/i.test(url)) {
        return url;
      } else {
        return this.$store.state.siteComdataPath + url;
      }
    },
    changePage(page) {
      this.page = page;
      this.getList();
    },
    changePageSize(page_size) {
      this.page = 1;
      this.page_size = page_size;
      this.getList();
    },
    getList(initial) {
      this.tableLoading = true;
      this.$httpPost("/shop/admin/custom/member/sub/order/money", {
        page: this.page,
        page_size: this.page_size,
        keyword: this.searchData.keyword,
        order_valid_condition: this.searchData.order_valid_condition,
        time_type: this.searchData.time_type,
        time_start: this.searchData.beingTime.startTime,
        time_end: this.searchData.beingTime.endTime
      }, res => {
        this.tableLoading = false;
        if(res.code == 200) {
          this.listData = [];
          this.$nextTick(() => {
            this.listData = res.data.list;
            this.total = res.data.total;
          });
          if(initial) {
            this.searchData.order_valid_condition = res.data.order_valid_condition;
          }
        } else {
          this.$Message.error(res.msg);
        }
      })
    }
  },
};
</script>
<style lang="less" scoped>
.member-achievement {
  padding: 24px 24px 0;
  /deep/.data-list-search-item {
    &:nth-child(2) {
      margin-right: 5px;
      .ivu-select {
        width: 110px;
      }
    }
    &:nth-child(3) {
      .data-list-search-span {
        margin-right: 0px;
      }
      .date-line {
        margin: 0 10px;
      }
    }
  }
}
</style>
