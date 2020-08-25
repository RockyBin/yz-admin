<template>
  <div class="main-board">
    <!-- 内容 -->
    <div class="content">
      <!-- 创建证书按钮栏 -->
      <div class="row">
        <Button
          type="primary"
          shape="circle"
          icon="md-add"
          perm="dealer.authcert.operate"
          @click="isShowModal = true"
        >创建证书</Button>
      </div>
      <!-- 中间查询栏 -->
      <div class="row" style="margin-bottom:20px">
        <Input
          class="input-role"
          v-model="posterName"
          prefix="ios-search"
          placeholder="证书名称"
          @on-enter="loadOrSearchPosterInfo"
        />
        <Button
          perm="dealer.authcert.view"
          type="primary"
          style="width:60px;height:32px;font-size:12px"
          @click="loadOrSearchPosterInfo(1)"
        >查询</Button>
        <Button
          perm="dealer.authcert.operate"
          style="width:80px;height:32px;margin-left:12px;font-size:12px"
          @click="onDeleteCert(1)"
        >批量删除</Button>
      </div>
      <!-- Table栏 -->
      <common-table
        ref="posterTable"
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
          @on-page-size-change="posterPageSize=$event;loadOrSearchPosterInfo()"
        />
      </div>
    </div>
    <template-choose-modal v-model="isShowModal"></template-choose-modal>
  </div>
</template>
<script>
import axios from "axios";
import commonTable from "@/views/shop/components/table/common-table.vue";
import templateChooseModal from "./components/template-choose-modal.vue";

export default {
  components: {
    commonTable,
    templateChooseModal
  },
  data() {
    return {
      // 查询条件
      roleID: -1,
      status: -1,
      isShowModal: false,
      posterName: "",
      // 证书信息分页
      posterTotal: 0,
      posterCurrentPage: 1,
      posterPageSize: 20,
      posterIndex: [],
      tableLoading: false,
      selectTableData: [], // 批量删除证书
      posterList: [],
      posterColumns: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "证书序号",
          key: "poster_num",
          align: "left",
          minWidth: 170,
          render: (h, params) => {
            return h("span", params.row.id);
          }
        },
        {
          title: "证书标题",
          key: "poster_img",
          align: "left",
          minWidth: 285,
          render: (h, params) => {
            return params.row.preview_image
              ? [
                  h("img", {
                    style: {
                      width: "34px",
                      height: "60px",
                      cursor: "pointer",
                      marginTop: "4px",
                      marginRight: "9px"
                    },
                    class: "show-big-img",
                    attrs: {
                      src:
                        this.http.defaults.baseURL +
                        params.row.preview_image
                    }
                  }),
                  h(
                    "div",
                    {
                      style: {
                        width: "10px",
                        height: "10px",
                        border: "10px solid",
                        borderRight: "15px solid",
                        marginLeft: "-40px",
                        marginBottom: "-7px",
                        borderColor:
                          "transparent transparent #dcdcdc transparent",
                        display: "inline-block",
                        opacity: "0",
                        zIndex: "4",
                        position: "relative"
                      }
                    },
                    [
                      h("span", {
                        style: {
                          width: "15px",
                          height: "10px",
                          border: "10px solid",
                          borderRight: "15px solid",
                          borderColor:
                            "transparent transparent white transparent",
                          display: "inline-block",
                          opacity: "0",
                          bottom: "-12px",
                          left: "-10px",
                          position: "absolute"
                        }
                      })
                    ]
                  ),
                  h("img", {
                    style: {
                      width: "121px",
                      height: "182px",
                      position: "absolute",
                      marginLeft: "-35px",
                      marginTop: "68px",
                      display: "none",
                      zIndex: "3",
                      background: "#fff"
                    },
                    class: "big-img",
                    attrs: {
                      src:
                        this.http.defaults.baseURL +
                        params.row.preview_image
                    }
                  }),
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
          title: "更新时间",
          key: "update_time",
          align: "left",
          minWidth: 240,
          render: (h, params) => {
            return h("span", params.row.updated_at);
          }
        },
        {
          title: "应用状态",
          key: "used",
          align: "left",
          minWidth: 240,
          render: (h, params) => {
            return h("span", {
              class: params.row.used ? "table-success" : "table-warning"
            }, params.row.used ? "使用中" : "未使用");
          }
        },
        {
          title: "操作",
          key: "action",
          align: "left",
          minWidth: 182,
          render: (h, params) => {
            var self = this;
            var edit = h(
              "a",
              {
                attrs: {
                  perm: "dealer.authcert.view"
                },
                style: { "margin-right": "20px" },
                on: {
                  click() {
                    self.$router.push({
                      path: "/dealer/dealer-authcert-design",
                      query: { id: params.row.id }
                    });
                  }
                }
              },
              "编辑"
            );
            var delimiter = h("span", {
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
            });
            var del = h(
              "a",
              {
                attrs: {
                  perm: "dealer.authcert.operate"
                },
                on: {
                  click() {
                    self.onDeleteCert(2, params.row.id);
                  }
                }
              },
              "删除"
            );
            return [edit, delimiter, del];
            // return params.row.used ? [edit] : [edit, delimiter, del]
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
    // 获取证书列表或查询证书
    loadOrSearchPosterInfo(search) {
      this.tableLoading = true;
      this.$store.state.COMMON_loading = true;
      axios
        .get("/shop/admin/dealer/authcert/list", {
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
              // this.posterList.forEach(item => {
              //   this.$set(item,"_disabled",!!item.used)
              // })
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

    // 选择证书批量删除
    onSelectionChange(selectData) {
      this.selectTableData = [];
      for (const key in selectData) {
        this.selectTableData.push(selectData[key].id);
      }
    },

    // 批量删除证书或单个删除证书
    onDeleteCert(status, deleteId) {
      if (status === 1) {
        if (!this.selectTableData.length) {
          this.$Message.error("请选择要批量删除的证书");
          return;
        }
        this.commonDeleteShowModal(
          "是否确定批量删除证书？",
          this.selectTableData
        );
      } else if (status === 2) {
        let tempDelete = [];
        tempDelete.push(deleteId);
        this.commonDeleteShowModal("是否确定删除该证书？", tempDelete);
      }
    },

    // 公共删除弹窗提示
    commonDeleteShowModal(text, deleteArr) {
      this.$Modal.confirm({
        title: "提示",
        content: text,
        okText: "确定",
        onOk: () => {
          axios
            .post("/shop/admin/dealer/authcert/delete", {
              id: deleteArr
            })
            .then(res => {
              if (res.code == 200) {
                if (this.posterList.length == deleteArr.length && this.posterCurrentPage > 1) {
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
    .show-big-img:hover {
      & + div + img {
        display: inline-block !important;
      }

      & + div,
      & + div > span {
        opacity: 1 !important;
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