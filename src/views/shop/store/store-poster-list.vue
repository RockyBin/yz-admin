<template>
  <div class="main-board">
    <!-- 内容 -->
    <div class="content">
      <!-- 创建海报按钮栏 -->
      <add-more
        :text="texts"
        @onAddMoreClick="onAddMoreClick"
        perm="poster.operate"
      ></add-more>
      <!--<Button type="primary" shape="circle" icon="md-add" perm="poster.operate" @click="isShowModal = true">创建海报</Button>-->
      <!-- 中间查询栏 -->
      <div class="row" style="margin-bottom:20px">
        <Input
          class="input-role"
          v-model="posterName"
          prefix="ios-search"
          placeholder="海报名称"
          @on-enter="loadOrSearchPosterInfo"
        />
        <Button
          perm="poster.view"
          type="primary"
          style="width:58px;height:32px;font-size:12px"
          @click="loadOrSearchPosterInfo(1)"
          >查询</Button
        >
        <Button
          perm="poster.operate"
          style="width:80px;height:32px;margin-left:12px;font-size:12px"
          @click="onDeletePoster(1)"
          >批量删除</Button
        >
      </div>
      <!-- Table栏 -->
      <common-table
        ref="posterTable"
        :minWidth="846"
        :loading="tableLoading"
        :columnsData="posterColumns"
        :listData="posterList"
        @onSortChange="onSortChange"
        @selectData="onSelectionChange"
      ></common-table>
      <!-- 底部分页条 -->
      <div class="bar-pager">
        <Page
          v-if="posterTotal"
          :current="posterCurrentPage"
          :total="posterTotal"
          :page-size="posterPageSize"
          show-elevator
          show-sizer
          :transfer="true"
          @on-change="changeList"
          @on-page-size-change="
            posterPageSize = $event;
            loadOrSearchPosterInfo();
          "
        />
      </div>
    </div>
    <template-choose-modal v-model="isShowModal"></template-choose-modal>
  </div>
</template>
<script>
import axios from "axios";
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import templateChooseModal from "./components/template-choose-modal.vue";

export default {
  components: {
    commonTable,
    templateChooseModal,
    addMore
  },
  data() {
    return {
      // 查询条件
      roleID: -1,
      status: -1,
      texts: "创建海报",
      isShowModal: false,
      posterName: "",
      // 海报信息分页
      posterTotal: 0,
      posterCurrentPage: 1,
      posterPageSize: 20,
      posterIndex: [],
      tableLoading: false,
      selectTableData: [], // 批量删除海报
      posterList: [],
      posterColumns: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "海报编号",
          key: "poster_num",
          align: "left",
          minWidth: 120,
          render: (h, params) => {
            return h("span", params.row.id);
          }
        },
        {
          title: "海报标题",
          key: "poster_img",
          align: "left",
          minWidth: 210,
          render: (h, params) => {
            return params.row.preview_image
              ? [
                  h(
                    "Poptip",
                    {
                      props: {
                        placement: "bottom",
                        trigger: "hover"
                      }
                    },
                    [
                      h("img", {
                        style: {
                          width: "40px",
                          height: "60px",
                          cursor: "pointer",
                          marginTop: "4px",
                          marginRight: "9px"
                        },
                        class: "show-big-img",
                        attrs: {
                          src:
                            this.http.defaults.baseURL +
                            "/" +
                            params.row.preview_image
                        }
                      }),
                      h(
                        "div",
                        {
                          slot: "content"
                        },
                        [
                          h("img", {
                            style: {
                              display: "block",
                              width: "121px",
                              height: "182px",
                              background: "#fff"
                            },
                            attrs: {
                              src:
                                this.http.defaults.baseURL +
                                "/" +
                                params.row.preview_image
                            }
                          })
                        ]
                      )
                    ]
                  ),
                  h(
                    "span",
                    {
                      style: {
                        position: "relative",
                        top: "-25px",
                        left: "25px"
                      }
                    },
                    params.row.name
                  )
                ]
              : "";
          }
        },
        {
          title: "页面描述",
          key: "page_desc",
          align: "left",
          minWidth: 208,
          render: (h, params) => {
            return h("span", params.row.desc ? params.row.desc : "");
          }
        },
        {
          title: "更新时间",
          key: "update_time",
          align: "left",
          minWidth: 150,
          render: (h, params) => {
            return h("span", params.row.updated_at);
          }
        },
        {
          title: "操作",
          key: "action",
          align: "left",
          minWidth: 114,
          render: (h, params) => {
            var self = this;
            return [
              h(
                "a",
                {
                  attrs: {
                    perm: "poster.operate"
                  },
                  style: { "margin-right": "20px" },
                  on: {
                    click() {
                      self.$router.push({
                        path:
                          "/store/store-poster-manage/store-poster-list/poster-design",
                        query: { id: params.row.id }
                      });
                    }
                  }
                },
                "编辑"
              ),
              h("span", {
                style: {
                  width: "1px",
                  "margin-bottom": "-1px",
                  "margin-left": "-11px",
                  "margin-right": "10px",
                  height: "11px",
                  background: "#3f66d3",
                  opacity: ".6",
                  display: "inline-block"
                }
              }),
              h(
                "a",
                {
                  attrs: {
                    perm: "poster.operate"
                  },
                  on: {
                    click() {
                      self.onDeletePoster(2, params.row.id);
                    }
                  }
                },
                "删除"
              )
            ];
          }
        }
      ]
    };
  },
  created() {
    this.loadOrSearchPosterInfo();
  },
  watch: {},
  methods: {
    changeList(val) {
      this.posterCurrentPage = val;
      this.loadOrSearchPosterInfo();
    },
    // 获取海报列表或查询海报
    loadOrSearchPosterInfo(search) {
      this.tableLoading = true;
      this.$store.state.COMMON_loading = true;
      axios
        .get("/shop/admin/sharepaper/mobi/paper/list", {
          params: {
            page: search ? 1 : this.posterCurrentPage,
            page_size: this.posterPageSize,
            name: this.posterName ? this.posterName : ""
          }
        })
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            this.posterList = [];
            this.$nextTick(() => {
              this.selectTableData = [];
              this.posterList = res.data.list;
              this.posterTotal = res.data.total;
              this.posterCurrentPage = res.data.current;
            });
          } else {
            this.posterTotal = 0;
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.posterTotal = 0;
          this.$store.state.COMMON_loading = false;
          this.$Message.error(err);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    // 排序回调
    onSortChange(data) {},

    // 选择海报批量删除
    onSelectionChange(selectData) {
      this.selectTableData = [];
      for (const key in selectData) {
        this.selectTableData.push(selectData[key].id);
      }
    },

    // 批量删除海报或单个删除海报
    onDeletePoster(status, deleteId) {
      if (status === 1) {
        if (!this.selectTableData.length) {
          this.$Message.error("请选择要批量删除的海报");
          return;
        }
        this.commonDeleteShowModal(
          "是否确定批量删除海报？",
          this.selectTableData
        );
      } else if (status === 2) {
        let tempDelete = [];
        tempDelete.push(deleteId);
        this.commonDeleteShowModal("是否确定删除该海报？", tempDelete);
      }
    },
    onAddMoreClick() {
      this.isShowModal = true;
    },
    // 公共删除弹窗提示
    commonDeleteShowModal(text, deleteArr) {
      this.$Modal.confirm({
        title: "提示",
        content: text,
        okText: "确定",
        onOk: () => {
          axios
            .post("/shop/admin/sharepaper/mobi/paper/delete", {
              delete_id: deleteArr
            })
            .then(res => {
              if (res.code == 200) {
                if (
                  this.posterList.length == deleteArr.length &&
                  this.posterCurrentPage > 1
                ) {
                  this.posterCurrentPage -= 1;
                }
                this.loadOrSearchPosterInfo();
                this.$Message.success("删除成功");
                this.changeList(this.posterCurrentPage);
              } else {
                this.$Message.error("删除失败");
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.main-board {
  /deep/.ivu-table-tbody {
    tr.ivu-table-row-hover td {
      background: #f8f9fd !important;
    }
  }

  /deep/.ivu-table th {
    border-bottom: none;
  }

  /deep/.ivu-tabs-bar {
    margin-bottom: 0;
    padding-left: 24px;
  }
  .content {
    padding: 24px 24px 0;
    // min-height: calc(100vh - 202px);

    /deep/.ivu-table-wrapper {
      overflow: visible;
      border: none;
    }
  }
  .input-role {
    width: 200px;
    height: 30px;
    margin-right: 12px;
  }
  .row {
    margin-bottom: 24px;
    .label {
      margin-right: 6px;
    }
    /deep/.ivu-btn-primary {
      font-size: 12px !important;
    }
  }
  /deep/.ivu-table-header th {
    background: #f8f9fd;
  }
  /deep/.ivu-table-body td {
    font-size: 12px;
    color: #657180;
  }
  /deep/.ivu-table-body a {
    color: #3f66d3;
  }
  .pager {
    height: 70px;
    padding: 0 24px;
    line-height: 70px;
    text-align: right;
  }

  /deep/.ivu-table-body {
    .ivu-poptip-popper {
      min-width: 130px;
      .ivu-poptip-body {
        padding: 5px;
      }
    }
    

    .ivu-table-row:hover {
      background: #f8f9fd;
    }

    .big-img {
      border: 1px solid #dcdcdc;
      border-radius: 5px;
      padding: 5px;
      background: #fff;
      cursor: pointer;
      display: none;
    }
  }
}
</style>
