<template>
  <div class="cloudstock-stock-detail" v-show="!$store.state.COMMON_loading">
    <!-- 头部信息 -->
    <div class="cloudstock-stock-detail-head">
      <div class="cloudstock-stock-detail-head-top">
        <titlebar title="云仓库存情况" style="width: 100px;display: inline-block;"></titlebar>
        <span style="font-size: 12px;margin-left: 14px;">
          库存总量：
          <span style="color:#ED4014;">{{value.total_inventory}}</span>
        </span>
        <Button
          type="primary"
          style="margin-left: 24px;"
          @click="$router.push({
            name: 'cloudstockStorageRecord', 
            query: {
              id: $route.query.id,
              nickname: value.nickname,
              parentPath: $route.path, 
              parentQuery: JSON.stringify($route.query)
            }
          })"
        >出入库记录</Button>
      </div>
      <div class="cloudstock-stock-detail-head-bottom">
        <div
          class="cloudstock-stock-detail-head-image"
          :style="`background-image: url(${value.headurl || 'images/head-portrait.png'});`"
        ></div>
        <div class="cloudstock-stock-detail-head-data">
          <div>昵称：{{value.nickname}}</div>
          <div>
            <span>姓名：{{ value.name || "--" }}</span>
            <span>手机号：{{ value.mobile }}</span>
            <span>会员ID：{{ value.member_id }}</span>
            <span
              >经销商等级：{{
                (value.level_name && value.level_name.join(" - ")) || "--"
              }}</span
            >
            <!--<span>云仓等级：{{stockLevelText[value.agent_level - 1] || "&#45;&#45;"}}</span>-->
          </div>
        </div>
      </div>
    </div>
    <div class="cloudstock-stock-detail-content">
      <div class="cloudstock-stock-detail-search">
        <add-more
            text="新增云仓商品"
            @onAddMoreClick="onAddNewAgentClick"
            perm="dealer.operate"
        ></add-more>
        <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true" />
      </div>
      <modal-product-select
        ref="modalMemberSelect"
        :title="addModelTitle"
        levelTitle="商品"
        :userInfo="value"
        :selectEditProduct="selectEditProduct"
        v-model="modalMemberSelectStatus"
      ></modal-product-select>
      <common-table
        :minWidth="962"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          :page-size="pageSize"
          v-show="listData.length"
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
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import addMore from "COMPONENTS/button/add-more.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import modalProductSelect from "@/views/shop/components/modal/modal-product-select";
const agentLevelText = ["一级经销商", "二级经销商", "三级经销商"];
const stockLevelText = ["一级云仓", "二级云仓", "三级云仓"];
const searchData = {
  keyword: ""
};
export default {
  components: {
    titlebar,
    searchList,
    modalProductSelect,
    addMore,
    commonTable
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 0,
      addModelTitle:'新增云仓商品库存',
      modalMemberSelectStatus: false,
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "商品名称"
        }
      ],
      agentLevelText,
      stockLevelText,
      searchData: Object.assign({}, searchData),
      tableLoading: false,
      columnsData: [
        {
          title: "商品信息",
          align: "left",
          minWidth: 382,
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
                    src: params.row.product_image
                  },
                  style: {
                    width: "40px",
                    height: "40px",
                    objectFit: "contain",
                    marginRight: "14px"
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
          title: "云仓虚拟库存",
          align: "left",
          minWidth: 256,
          render: (h, params) => {
            return h("div",params.row.inventory);
          }
        },
        {
            title: "操作",
            align: "left",
            minWidth: 256,
            render: (h, params) => {
              return h(
                  "div",
                  {
                      style: {
                          color:"#4A6AF5",
                          "font-size":"12px",
                          "cursor":"pointer"
                      },
                      on: {
                          click: () => {
                          this.selectEditProduct = [];
                              this.modalMemberSelectStatus = true;
                              this.addModelTitle = '修改库存';
                              this.selectEditProduct.push(params.row);
                          }
                      }
                  },"修改库存");
            }
        }
      ],
      value: {},
      listData: [],
      selectEditProduct:[]
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getLoadingList();
      },
      deep: true
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getStockDetail(), this.getList()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    onPageChange(page) {
      this.currentPage = page;
      this.getLoadingList();
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getLoadingList();
    },
    getStockDetail() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/cloudstock/info",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              this.value = res.data;
              resolve();
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    getLoadingList() {
      this.tableLoading = true;
      this.getList()
        .catch(e => {
          this.$Message.error(e);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    getList() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/cloudstock/skulist",
          {
            member_id: this.$route.query.id,
            keyword: this.searchData.keyword,
            page_size: this.pageSize,
            page: this.currentPage
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.total = res.data.total;
              this.listData = res.data.list;
              this.total = res.data.total;
              this.successCallBack();
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
    },
    /**
     * 新增云仓商品
     */
    onAddNewAgentClick() {
        this.modalMemberSelectStatus = true;
        this.addModelTitle = '新增云仓商品库存';
        this.selectEditProduct = [];
    },
  }
};
</script>
<style lang="less" scoped>
@border-color: #e9eaf2;
.cloudstock-stock-detail {
  padding: 24px;
  color: #464c5b;
  // 头部信息样式
  .cloudstock-stock-detail-head {
    margin-bottom: 24px;
    .cloudstock-stock-detail-head-top {
      margin-bottom: 20px;
      .ivu-btn.ivu-btn-primary{
        background-color: #fff;
        color: #4A6AF5;
      }
    }
    .cloudstock-stock-detail-head-bottom {
      display: flex;
      align-items: center;
      padding: 14px;
      border: 1px solid @border-color;
      border-radius: 5px;
      .cloudstock-stock-detail-head-image {
        width: 56px;
        height: 56px;
        border-radius: 5px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .cloudstock-stock-detail-head-data {
        display: flex;
        flex-direction: column;
        justify-content: center;
        line-height: 32px;
        flex: 1;
        text-align: left;
        font-size: 12px;
        padding: 0 20px;
        & > div {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          span {
            margin-right: 40px;
          }
        }
      }
    }
  }
  .cloudstock-stock-detail-content {
    /deep/.page-style.ivu-page {
      text-align: right;
      line-height: 56px;
    }
    /deep/.table-stock-edit::before{
      content: "\e608";
      width: 12px;
      height: 12px;
      margin-right: 5px;
    }
    .add-more-btn{
      /deep/.ivu-btn{
        border: 0;
      }
    }
  }
}
</style>
