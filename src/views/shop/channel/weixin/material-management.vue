<template>
  <div class="weixin">
    <third-menu :list="thirdMenu"/>
    <div class="main-content">
      <blank v-show="loaded" v-if="!isBound" msg="绑定公众号后，即可使用素材管理功能"/>
      <div v-show="loaded" v-else class="main-board">
        <!--<Button-->
          <!--class="btn-add"-->
          <!--type="primary"-->
          <!--shape="circle"-->
          <!--icon="md-add"-->
          <!--@click="$router.push('/channel/weixin/material-management/add-material')"-->
          <!--perm="mp.media.operate"-->
        <!--&gt;新增素材</Button>-->
        <add-more text="新增素材" @onAddMoreClick="onAddCoupons" perm="mp.media.operate"></add-more>
        <div class="wrapper">
          <Table :loading="loading" :columns="columns" :data="data"></Table>
        </div>
        <div class="bar-pager">
          <Page
            v-if="pager.total"
            :total="pager.total"
            :page-size="pager.size"
            show-sizer
            show-elevator
            @on-change="pageChange"
            @on-page-size-change="sizeChange"
            :transfer="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import blank from "./blank.vue";
import axios from "axios";
import thirdMenuData from "../components/third-menu-for-channel-weixin";
export default {
  components: {
    thirdMenu,
    blank,
      addMore
  },
  data() {
    return {
      loaded: false,
      isBound: false,
      loading: false,
      thirdMenu: [],
      columns: [
        {
          title: "图文封面图",
          key: "image",
          render: (h, p) => {
            return h("img", {
              attrs: {
                src:
                  this.$store.state.siteComdataPath + p.row.image ||
                  "images/sample/placeholder.png"
              }
            });
          }
        },
        {
          title: "图文标题",
          key: "title"
        },
        {
          title: "文章数",
          key: "count",
          align: "center",
          render(h, p) {
            return h("span", p.row.items.length);
          }
        },
        {
          title: "更新时间",
          key: "updated_at",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 120,
          render: (h, p) => {
            return [
              h(
                "router-link",
                {
                    style: {
                        marginRight: "10px"
                    },
                  class: {
                    "table-operation": true
                  },
                  props: {
                    to: {
                      name: "editMaterial",
                      query: {
                        id: p.row.id
                      }
                    }
                  }
                },
                "编辑"
              ),
                h(
                    "span",
                    {
                        style: {
                            marginRight: "10px"
                        }
                    },
                    !p.row.paper_id ? "|" : ""
                ),
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0)",
                    perm: "mp.media.operate"
                  },
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.deleteItem(p);
                    }
                  }
                },
                "删除"
              )
            ];
          }
        }
      ],
      data: [],
      pager: {
        total: 100,
        page: 1,
        size: 20
      }
    };
  },
  created() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getNewsData();
  },
  methods: {
    pageChange(page) {
      this.pager.page = page;
      this.getNewsData();
    },
    sizeChange(size) {
      this.pager.size = size;
      this.getNewsData();
    },
    deleteItem(item) {
      this.$Modal.confirm({
        title: "提示",
        content: "是否确定删除该组图片素材？",
        onOk: () => {
          axios
            .post("/shop/admin/wx/news/delete", {
              id: item.row.id
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("删除成功");
                this.getNewsData();
                // this.data.splice(item.index,1);
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        }
      });
    },
    getNewsData() {
      this.loading = true;
      this.$store.state.COMMON_loading = true
      axios
        .post("/shop/admin/wx/news/list", {
          page: this.pager.page,
          page_size: this.pager.size
          // is_push:0,
          // item_total:0,
          // keyword: ""
        })
        .then(res => {
          if (res.code == 200) {
            this.data = [];
            this.$nextTick(() => {
              this.data = res.data.list;
              this.isBound = res.data.config_full;
              this.pager.total = res.data.total;
              this.loading = false;
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        }).finally(() => {
          this.loaded = true;
          this.$store.state.COMMON_loading = false
        });
    },
      onAddCoupons(){
          this.$router.push('/channel/weixin/material-management/add-material');
      }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  // position: absolute;
  // overflow: hidden;
  // width: 100%!important;
  height: calc(100vh - 70px);
  background: #f2f4fd;
  display: flex;
  .wrapper {
    /deep/a:hover {
      color: #3f66d3;
    }
  }
  .main-content {
    flex: 1;
    // height: 100%;
    overflow: auto;
  }
}
.main-board {
  height: 100%;
  overflow: auto;
  background: white;
  padding: 24px 24px 0;
  .btn-add {
    width: 102px;
    height: 32px;
    margin-bottom: 24px;
  }
  .wrapper {
    min-height: calc(100% - 133px);
    /deep/.ivu-table {
      &:before,
      &:after {
        display: none;
      }
    }
    /deep/.ivu-table-wrapper {
      border-left: none !important;
      border-top: 0px;
      /deep/.ivu-table-header{
        th{
          border-bottom: 0px;
        }
      }
      th {
        background: #f8f9fd;
      }
    }
    // /deep/.ivu-table-body{
    // max-height: calc(100vh - 287px);
    // overflow-y: auto;
    // overflow-x:hidden;
    // }
  }
  .footer {
    height: 70px;
    line-height: 70px;
    text-align: right;
  }
  /deep/.ivu-table td {
    color: #657180;
    font-size: 12px;
  }
  /deep/.ivu-table-header th:last-child {
    text-align: center;
  }
  /deep/.ivu-table-row {
    height: 90px;
    td:first-child {
      font-size: 0;
      img {
        width: 100px;
        height: 56px;
        object-fit: cover;
      }
    }
    td:last-child {
      text-align: center;
      .ivu-table-cell {
        padding: 0;
      }
      a:first-child {
        margin-right: 16px;
      }
    }
  }
}
</style>