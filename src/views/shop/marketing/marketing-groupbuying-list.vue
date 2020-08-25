<template>
  <div class="marketing-groupbuying-list">
    <add-more
      text="创建活动"
      perm="group.buying.operate"
      @onAddMoreClick="onAddMoreClick"
    ></add-more>
    <search-list
      :searchParams="searchParams"
      :searchData="searchData"
      class="marketing-search"
    />
    <btn-group :data="filterData" v-model="name"></btn-group>
    <common-table
      ref="exportTable"
      :minWidth="1160"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
    ></common-table>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="currentPage"
        :page-size="pageSize"
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
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
import QRCode from "qrcode";
export default {
  components: {
    btnGroup,
    searchList,
    addMore,
    commonTable
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      tableLoading: false,
      total: 0, // 总数量
      currentPage: 1, // 当前页
      pageSize: 20, // 当前页数量
      listData: [],
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "活动名称",
          prefixIcon: "ios-search"
        }
      ],
      searchData: {
        // 优惠券搜索框的值
        keyword: ""
      },
      filterData: [
        {
          name: "全部",
          value: ""
        },
        {
          name: "未开始",
          value: "0"
        },
        {
          name: "进行中",
          value: "1"
        },
        {
          name: "已结束",
          value: "-1"
        }
      ],
      name: this.$route.query.tab || "", // 搜索的状态
      columnsData: [
        {
          title: "活动名称",
          minWidth: 180,
          render: (h, params) => {
            return h("div", [h("div", params.row.title)]);
          }
        },
        {
          renderHeader: h => {
            return h("div", [
              h("span", "活动商品数量"),
              h(moreMessage, {
                props: {
                  text: "是指参与活动的商品的SPU的数量"
                },
                style: {
                  fontWeight: "initial",
                  height: "14px",
                  lineHeight: "12px",
                  verticalAlign: "text-top"
                }
              })
            ]);
          },
          minWidth: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [h("div", params.row.product_count)]);
          }
        },
        {
          renderHeader: h => {
            return h("div", [
              h("span", "订单金额"),
              h(moreMessage, {
                props: {
                  text: "统计该场拼团活动带来的有效成团订单付款的\n金额"
                },
                style: {
                  fontWeight: "initial",
                  height: "14px",
                  lineHeight: "12px",
                  verticalAlign: "text-top"
                }
              })
            ]);
          },
          minWidth: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                params.row.status !== 0
                  ? "￥" + params.row.order_money_count
                  : "--"
              )
            ]);
          }
        },
        {
          renderHeader: h => {
            return h("div", [
              h("span", "成团订单数"),
              h(moreMessage, {
                props: {
                  text: "统计该场拼团活动真实成团的订单数量"
                },
                style: {
                  fontWeight: "initial",
                  height: "14px",
                  lineHeight: "12px",
                  verticalAlign: "text-top"
                }
              })
            ]);
          },
          minWidth: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.status !== 0 ? params.row.order_count : "--")
            ]);
          }
        },
        {
          title: "有效期",
          align: "center",
          minWidth: 170,
          render: (h, params) => {
            return h("div", [
              h("div", params.row.start_time),
              h("div", params.row.end_time)
            ]);
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-success": params.row.status === 1,
                  "table-warning": params.row.status === 0,
                  "table-end": params.row.status === -1
                }
              },
              params.row.status === 0
                ? "未开始"
                : params.row.status === 1
                ? "进行中"
                : "已结束"
            );
          }
        },
        {
          title: "操作",
          width: 240,
          render: (h, params) => {
            let editButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);",
                  perm: "group.buying.view"
                },
                on: {
                  click: () => {
                    this.onEditPage(params.row.id);
                  }
                }
              },
              "编辑"
            );
            let line = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);"
                },
                style: {
                  margin: "0 12px"
                }
              },
              "|"
            );
            let deleteButton = h(
              "a",
              {
                attrs: {
                  perm: "group.buying.operate"
                },
                on: {
                  click: () => {
                    this.onDeleteClick(params.row);
                  }
                }
              },
              "删除"
            );
            let extendButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);",
                  perm: "group.buying.view"
                }
              },
              "推广"
            );
            let endButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);",
                  perm: "group.buying.operate"
                },
                on: {
                  click: () => {
                    this.onEndClick(params.row);
                  }
                }
              },
              "结束"
            );
            let dataButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);",
                  perm: "group.buying.view"
                },
                on: {
                  click: () => {
                    this.onViewDataClick(params.row.title);
                  }
                }
              },
              "数据"
            );
            let url =
              this.http.defaults.baseURL +
              "/shop/front/#/groupbuying/special-field?id=" +
              params.row.id;
            let poperInput = h("Input", {
              props: {
                value: url,
                readonly: true
              },
              style: { width: "244px" }
            });

            let poperContent = h(
              "div",
              {
                slot: "content",
                style: { textAlign: "left", marginTop: "28px" }
              },
              [
                h("div", { style: { marginBottom: "20px" } }, "推广链接"),
                h("Icon", {
                  props: {
                    type: "md-close"
                  },
                  style: {
                    position: "absolute",
                    top: "20px",
                    right: "10px",
                    fontSize: "20px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      poper.child.handleClose();
                    }
                  }
                }),
                h("div", { style: { marginBottom: "30px" } }, [
                  poperInput,
                  h(
                    "Button",
                    {
                      props: { type: "primary" },
                      style: { height: "32px", marginLeft: "5px" },
                      on: {
                        click: () => {
                          this.copyLinkUrl(url);
                        }
                      }
                    },
                    "复制"
                  )
                ]),
                h("div", { style: { marginBottom: "20px" } }, "推广二维码"),
                h("div", {}, [
                  h("canvas", {
                    style: {
                      width: "110px",
                      height: "110px"
                    }
                  })
                ])
              ]
            );

            let poper = h(
              "Poptip",
              {
                "word-wrap": true,
                props: {
                  placement: "bottom-end",
                  padding: "15px 22px",
                  transfer: true
                },
                on: {
                  "on-popper-show": () => {
                    this.onShowPoptip(poperContent, url);
                  }
                }
              },
              [extendButton, poperContent]
            );
            let content = [];
            if (params.row.status !== -1) {
              content.push(editButton, line, poper);
            }
            if (params.row.status === 1) {
              content.push(line, endButton);
            }
            if (
              params.row.status === 1 ||
              (params.row.status === -1 &&
                (Number(params.row.order_money_count) !== 0 ||
                  params.row.order_count !== 0))
            ) {
              content.length
                ? content.push(line, dataButton)
                : content.push(dataButton);
            }

            if (
              params.row.status === 0 ||
              (params.row.status === -1 &&
                Number(params.row.order_money_count) === 0 &&
                params.row.order_count === 0)
            ) {
              content.length
                ? content.push(line, deleteButton)
                : content.push(deleteButton);
            }
            return h("div", content);
          }
        }
      ]
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    },
    name(val) {
      this.$router.replace({
        name: "marketingGroupbuyingList",
        query: val
          ? {
              tab: val
            }
          : {}
      });
      if (this.searchData.keyword !== "") {
        this.$set(this.searchData, "keyword", "");
      } else {
        this.currentPage = 1;
        this.getList();
      }
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getList();
  },
  methods: {
    // 分页条数
    changePageSize(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList();
    },
    // 翻页
    changePage(val) {
      this.currentPage = val;
      this.getList();
    },
    /**
     * 创建活动
     */
    onAddMoreClick() {
      this.$router.push({
        name: "marketingGroupbuyingCreate"
      });
    },
    /**
     * 编辑活动
     */
    onEditPage(id) {
      this.$router.push({
        name: "marketingGroupbuyingEdit",
        query: {
          id
        }
      });
    },
    /**
     * 获取列表数据
     */
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/group/buying/setting/list",
        {
          page: this.currentPage,
          page_size: this.pageSize,
          status: this.name ? Number(this.name) : "",
          keyword: this.searchData.keyword
        },
        res => {
          this.tableLoading = false;
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
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
    },
    /**
     * 结束活动
     */
    onEndClick(item) {
      this.$Modal.confirm({
        title: "提示",
        loading: true,
        content:
          "活动结束时间还没有到期，是否确定要结束该场活动【" +
          item.title +
          "】？",
        onOk: () => {
          this.$httpPost(
            "/shop/admin/group/buying/end",
            { id: item.id },
            res => {
              this.$Modal.remove();
              if (res.code === 200) {
                this.$Message.success("活动已结束");
                this.changePage(this.currentPage);
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        }
      });
    },
    /**
     * 删除活动
     */
    onDeleteClick({ id, title, status }) {
      this.$Modal.confirm({
        title: "提示",
        loading: true,
        content:
          status === 0
            ? "该场活动【" + title + "】尚未开始，是否确定删除？"
            : "该场活动【" + title + "】已结束，但没有数据，是否确定删除？",
        onOk: () => {
          this.$httpPost("/shop/admin/group/buying/delete", { id }, res => {
            this.$Modal.remove();
            if (res.code === 200) {
              this.$Message.success("删除成功");
              this.changePage(1);
            } else {
              this.$Message.error(res.msg);
            }
          });
        }
      });
    },
    /**
     * 查看活动数据内容
     */
    onViewDataClick(val) {
      this.$router.push({
        name: "marketingGroupbuyingData",
        params: {
          keyword: val
        }
      });
    },
    /**
     * 下拉框点击
     */
    onShowPoptip(poperContent, url) {
      QRCode.toCanvas(
        poperContent.elm.querySelector("canvas"),
        url,
        { margin: 1 },
        function(error) {
          if (error) console.error(error);
        }
      );
    },
    /**
     * 复制页面链接
     */
    copyLinkUrl(url) {
      var oInput = document.createElement("input");
      oInput.value = url;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.style.display = "none";
      document.body.removeChild(oInput);
      this.$Message.success("复制成功");
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-groupbuying-list {
  padding: 24px 24px 0;
}
</style>
