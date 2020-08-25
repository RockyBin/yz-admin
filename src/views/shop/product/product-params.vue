<template>
  <div class="product-params">
    <!-- <common-tabs></common-tabs> -->
    <div class="content">
      <div class="row">
        <Button
          type="primary"
          perm="product.param.operate"
          shape="circle"
          icon="md-add"
          @click="$router.push('/product/setting/new-params')"
        >新增参数模板</Button>
        <div class="search">
          <Input v-model="keyword" prefix="ios-search" placeholder="参数模板名称" />
          <Button type="primary" @click="getParamsList(1,20)">查询</Button>
        </div>
      </div>
      <Table :loading="isLoading" :columns="columns" :data="paramsList"></Table>
      <div class="bar-pager">
        <Page
          v-if="page.total>0"
          :total="page.total"
          :pageSize="page.pageSize"
          :current="page.currentPage"
          transfer
          show-sizer
          show-elevator
          @on-change="getParamsList($event,page.pageSize)"
          @on-page-size-change="getParamsList(page.currentPage,$event)"
        ></Page>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import commonTabs from "./components/common-tabs.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    commonTabs
  },
  data() {
    return {
      isLoading: false,
      keyword: "",
      page: {
        total: 0,
        currentPage: 1,
        pageSize: 20
      },
      paramsList: [],
      columns: [
        {
          title: "参数模板名称",
          key: "name",
          align: "center",
          renderHeader: (h, p) => {
            return h("span", [
              "参数模板名称"
              // h(moreMessage,{
              //   props:{
              //     text:"商品引用参数模板后，参数数据独立，将不再与该模板的数据进行同步。"
              //   }
              // })
            ]);
          }
        },
        {
          title: "更新时间",
          key: "updated_at",
          align: "center"
        },
        {
          title: "操作",
          key: "",
          align: "center",
          render: (h, params) => {
            return h("span", [
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0)",
                    perm: "product.param.view"
                  },
                  class: "table-operation",
                  style: {
                    marginRight: "10px"
                  },
                  on: {
                    click: () => {
                      this.editParams(params.row.id);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "span",
                {
                  class: "table-operation",
                  style: {
                    marginRight: "10px"
                  }
                },
                "|"
              ),
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0)",
                    perm: "product.param.operate"
                  },
                  class: "table-operation",
                  on: {
                    click: () => {
                      this.deleteParams(params.row.id);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ]
    };
  },
  created() {
    this.getParamsList(1, 20);
  },
  methods: {
    editParams(id) {
      this.$router.push("/product/setting/edit-params?id=" + id);
    },
    deleteParams(id) {
      this.$Modal.confirm({
        title: "提示",
        content: "删除后将不可恢复，是否确定删除该参数模板？",
        onOk: () => {
          axios
            .post("/shop/admin/product/param/delete", {
              id: id
            })
            .then(res => {
              this.$Message.success("删除成功");
              this.getParamsList(this.page.currentPage, this.page.pageSize);
            })
            .catch(err => {
              this.$Message.error(err);
            });
        }
      });
    },
    getParamsList(page, pageSize) {
      this.isLoading = true;
      this.page.currentPage = page;
      this.page.pageSize = pageSize;
      axios
        .get("/shop/admin/product/param/list", {
          params: {
            page: this.page.currentPage,
            page_size: this.page.pageSize,
            keyword: this.keyword
          }
        })
        .then(res => {
          this.isLoading = false;
          if (res.code == 200) {
            // this.$Message.success(res.msg);
            this.paramsList = [];
            this.$nextTick(() => {
              this.paramsList = res.data.list;
              this.page.total = res.data.total;
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.product-params {
  .content {
    padding: 24px 24px 0;
    min-height: calc(100vh - 214px);
    .row {
      margin-bottom: 24px;
      .search {
        float: right;
        /deep/.ivu-btn-primary {
          height: 32px;
          width: 58px;
        }
        /deep/.ivu-input-wrapper {
          width: 210px;
          margin-right: 10px;
        }
      }
    }
    /deep/.ivu-table {
      font-size: 12px;
    }
    /deep/.ivu-table-header {
      th {
        background: #f8f9fd;
      }
      .more-message {
        height: auto;
        vertical-align: 1px;
        margin-left: 10px;
        font-weight: normal;
      }
    }
    // /deep/.ivu-table-body{
    //   /deep/.ivu-table-row-hover{
    //     td{
    //       background:#fcfcfd;
    //     }
    //   }
    // }
  }
  // .footer{
  //   padding:0 25px;
  //   height:70px;
  //   line-height:70px;
  //   text-align:right;
  //   vertical-align:middle;
  // }
}
</style>
