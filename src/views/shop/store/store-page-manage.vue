<template>
  <div class="store-page-manage" v-show="!$store.state.COMMON_loading">
    <div class="store-page-manage-head">
      <div class="store-page-manage-head-content">
        <div class="store-page-manage-head-icon">
          <div>
            <i class="iconfont icon-md-home"></i>
          </div>
          <div class="store-page-manage-head-text">
            <div>当前主页： {{pageInfo.id ? pageInfo.title : "您还没有设置主页哦~"}}</div>
            <div v-show="pageInfo.id">创建时间：{{pageInfo.created_at}}</div>
          </div>
        </div>
        <div class="store-page-manage-head-btn" v-show="pageInfo.id">
          <div class="store-page-manage-head-btn-edit">
            <a href="javascript:void(0)" @click="onEditPage(pageInfo.id, pageInfo.type)" perm="page.operate">编辑主页</a>
          </div>
          <div class="store-page-manage-head-btn-view">
            <a href="javascript:void(0)" @click="onPreviewPage(pageInfo.id)">预览</a>
          </div>
        </div>
      </div>
    </div>
    <div class="store-page-manage-search">
      <add-more :text="texts" @onAddMoreClick="onAddNewPageClick" perm="page.operate"></add-more>
      <!--<Button class="btn-add" type="primary" @click="onAddNewPageClick" shape="circle" icon="md-add" perm="page.operate">新增页面</Button>-->
      <div class="store-page-manage-search-content">
        <search-list :searchParams="searchParams" :searchData="searchData" :onLine="true">
          <Button @click="onBatchPageDeleteClick" perm="page.operate">批量删除</Button>
        </search-list>
      </div>
      <common-table
        ref="exportTable"
        :minWidth="1000"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          :page-size="pageSize"
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          show-elevator
          :transfer="true"
        />
      </div>
    </div>
  </div>
</template>
<script>
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
const dropDownName = ["edit", "extend", "preview", "delete"];
export default {
  components: {
    searchList,
    commonTable,
    addMore
  },
  data() {
    return {
      tableLoading: false, // table的loading
       texts:'新增页面',
      searchParams: [
        {
          type: 1,
          // name: "页面名称：",
          key: "pageName",
          placeholder: "请输入页面名称",
          prefixIcon: "ios-search"
        },
        {
          type: 2,
          key: "updateTime",
          name: "更新时间："
        }
      ],
      searchData: {
        pageName: "",
        updateTime: {
          startTime: "",
          endTime: ""
        }
      },
      pageInfo: {},
      columnsData: [
        // table的column
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "页面编号",
          minWidth: 96,
          key: "name",
          align: "left",
          render: (h, params) => {
            return h("div", [h("div", params.row.id)]);
          }
        },
        {
          title: "页面标题",
          minWidth: 214,
          key: "price",
          render: (h, params) => {
            let textShow = [h("div",
              {
                style: {
                  display:"inline-block",
                  marginRight:"4px"
                }
              },
             params.row.title || "")];
            if (params.row.type === 1) {
              textShow.push(
                h(
                  "div",
                  {
                    class: "table-success",
                  },
                  "店铺主页"
                )
              );
            }
            return h(
              "div",
              {
                style: {
                  position: "relative",
                  display: "inline-block",
                  minHeight: "18px"
                }
              },
              textShow
            );
          }
        },
        // {
        //   title: "使用模板",
        //   key: "name",
        //   align: "center",
        //   render(h,params){
        //     return h('span',params.row.template_id?params.row.name:'自定义模板')
        //   }
        // },
        {
          title: "页面描述",
          key: "description",
          minWidth: 402
        },
        {
          title: "更新时间",
          align: "center",
          minWidth: 160,
          render: (h, params) => {
            return h("div", [
              (params.row.saved_at &&
                params.row.saved_at.split(/\s/)[0].replace(/-/g, ".")) ||
                "",
              " ",
              (params.row.saved_at && params.row.saved_at.split(/\s/)[1]) || ""
            ]);
          }
        },
        {
          title: "操作",
          width: 258,
          render: (h, params) => {
            let homeButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);",
                  perm: "page.operate"
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: "提示",
                      content: "是否确定把所选页面切换为商城主页？",
                      onOk: () => {
                        this.setHomePage(params.row.id);
                      }
                    });
                  }
                }
              },
              "设为主页"
            );
            let editButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);",
                  perm: "page.operate"
                },
                on: {
                  click: () => {
                    this.onEditPage(params.row.id, params.row.type);
                  }
                }
              },
              "编辑"
            );
              let line = h(
                  "a",
                  {
                      attrs: {
                          href: "javascript:void(0);",
                          perm: "page.operate"
                      }
                  },
                  "|"
              );
            let deleteButton = h(
              "a",
              {
                attrs: {
                  perm: "page.operate"
                },
                on: {
                  click: () => {
                    this.onDeletePageClick(params.row.id);
                  }
                }
              },
              "删除"
            );
            let extendButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);"
                }
              },
              "推广"
            );
            let previewButton = h(
              "a",
              {
                attrs: {
                  href: "javascript:void(0);"
                },
                on: {
                  click: () => {
                    this.onPreviewPage(params.row.id);
                  }
                }
              },
              "预览"
            );
            let poperInput = h("Input", {
              props: {
                value: "",
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
                          this.copyLinkUrl(
                            poperInput.componentInstance.$refs["input"].value
                          );
                        }
                      }
                    },
                    "复制"
                  )
                ]),
                h("div", { style: { marginBottom: "20px" } }, "推广二维码"),
                h("div", {}, [
                  h("img", {
                    attrs: {
                      src: ""
                    },
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
                    this.onShowPoptip(poperContent, params.row.id);
                  }
                }
              },
              [extendButton, poperContent]
            );
            let content;
            if (params.row.type == 1) {
              content = [editButton,line, poper,line, previewButton];
            } else {
              content = [
                editButton,
                line,
                poper,
                line,
                previewButton,
                line,
                homeButton,
                line,
                deleteButton
              ];
            }
            return h("div", content);
          }
        }
      ],
      listData: [], // 列表数据
      selectData: [],
      total: 0,
      pageSize: 20,
      currentPage: 1
    };
  },
  watch: {
    searchData: {
      handler() {
        this.getPageData(true);
      },
      deep: true
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getHomePageInfo(), this.getPageData()]).then(() => {
      this.$store.state.COMMON_loading = false;
    });
  },
  methods: {
    onCustomModuleClick() {},
    onPreviewModuleClick() {},
    onAddNewPageClick() {
      this.$router.push({
        //name: "storePageNew"
        path: "/store/template?tabName=新增页面"
      });
    },
    /**
     * 获取主页信息
     */
    getHomePageInfo() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/ui/design/mobile/page/home"
        })
          .then(res => {
            if (res.code === 200) {
              this.pageInfo = res.data.page || {};
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(() => {
            this.$Message.error("获取数据失败");
          })
          .finally(() => {
            resolve();
          });
      });
    },
    /**
     * 获取页面数据
     */
    getPageData(search) {
      if (search) {
        this.currentPage = 1;
      }
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/ui/design/mobile/page/list",
          method: "POST",
          data: {
            page: this.currentPage,
            page_size: this.pageSize,
            keyword: this.searchData.pageName,
            start_date: this.searchData.updateTime.startTime,
            end_date: this.searchData.updateTime.endTime
          }
        })
          .then(res => {
            if (res.code === 200) {
              this.listData = [];
              this.$nextTick(() => {
                this.total = res.data.total;
                this.pageSize = res.data.page_size;
                this.currrentPage = res.data.current;
                this.listData = res.data.list || [];
              });
              // this.sortAndStick();
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(() => {
            this.$Message.error("获取数据失败");
          })
          .finally(() => {
            resolve();
          });
      });
    },
    /**
     * 设置首页
     */
    setHomePage(id) {
      this.http({
        url: "/shop/admin/ui/design/mobile/page/set/home",
        method: "POST",
        data: {
          page_id: id
        }
      })
        .then(res => {
          if (res.code === 200) {
            this.listData.forEach(item => {
              if (item.id === id) {
                this.$set(item, "type", 1);
              } else if (item.type === 1) {
                this.$set(item, "type", 99);
              }
            });
            // this.sortAndStick();
            this.getHomePageInfo();
            this.getPageData(true);
            this.$Message.success("设置成功");
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(() => {
          this.$Message.error("设置失败");
        });
    },
    // sortAndStick() {
    //   if (this.listData.length) {
    //     //倒序排列
    //     this.listData.sort((item1, item2) => {
    //       return item2.id - item1.id;
    //     });
    //     //主页置顶
    //     this.listData.some((item, index) => {
    //       if (item.type == 1) {
    //         this.listData.splice(index, 1);
    //         this.listData.unshift(item);
    //         return true;
    //       }
    //     });
    //   }
    // },
    /**
     * 批量删除
     */
    onBatchPageDeleteClick() {
      if (!this.selectData.length) {
        this.$Message.error("请选择要批量删除的页面");
        return;
      }
      this.$Modal.confirm({
        title: "提示",
        content: "删除后不能恢复，是否确定删除所选页面？",
        okText: "删除",
        cancelText: "取消",
        loading: true,
        onOk: () => {
          this.onDeletePage(this.selectData.map(item => item.id));
        }
      });
    },
    /**
     * 选择改变
     */
    onSelectionChange(list) {
      this.selectData = list;
    },
    /**
     * 单个删除
     */
    onDeletePageClick(id) {
      this.$Modal.confirm({
        title: "提示",
        content: "删除后不能恢复，是否确定删除该页面？",
        okText: "删除",
        cancelText: "取消",
        loading: true,
        onOk: () => {
          this.onDeletePage([id]);
        }
      });
    },
    /**
     * 删除页面
     */
    onDeletePage(list) {
      this.http({
        url: "/shop/admin/ui/design/mobile/page/delete",
        method: "POST",
        data: {
          page_ids: list
        }
      })
        .then(res => {
          if (res.code === 200) {
            this.$Message.success("删除成功");
            this.currentPage = 1;
            this.getPageData();
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(() => {
          this.$Message.error("删除失败");
        })
        .finally(() => {
          this.$Modal.remove();
        });
    },
    /**
     * 下拉框点击
     */
    onShowPoptip(poperContent, id) {
      this.$httpGet(
        "/shop/admin/ui/design/mobile/page/qrcode?page_id=" +
          id +
          "&isMobile=1",
        {
          size: 200,
          margin: 1
        },
        res => {
          poperContent.elm.querySelector("input").value = res.data.url;
          poperContent.elm.querySelector("img").src = res.data.image;
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
    },
    /**
     * 页脚
     */
    onPageChange(page) {
      this.currentPage = page;
      this.getPageData();
    },
    onPageSizeChange(size) {
      this.currentPage = 1;
      this.pageSize = size;
      this.getPageData();
    },
    onEditPage(id, type) {
      let name = type == 1 ? "storeDesignHomeMobile":"storeDesignMobile";
      this.$router.push({ name: name, query: {id: id}});
    },
    onPreviewPage(id) {
      window.open("preview.html?id=" + id);
    }
  }
};
</script>
<style lang="less" scoped>
.store-page-manage {
  // 头部
  .store-page-manage-head {
    padding: 24px 24px 0px;
    // border-bottom: 1px solid #dcdee2;
    .store-page-manage-head-content {
      background-color: #f8f9fd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 30px;
      height: 110px;
      .store-page-manage-head-icon {
        display: flex;
        align-items: center;
        & > div {
          &:first-child {
            color: #fff;
            width: 43px;
            height: 43px;
            border-radius: 50%;
            background: #737373;
            line-height: 43px;
            text-align: center;
            i {
              font-size: 22px;
            }
          }
          &.store-page-manage-head-text {
            color: #333333;
            font-size: 16px;
            margin-left: 20px;
            div:last-child {
              color: #999999;
              font-size: 12px;
              margin-top: 2px;
            }
          }
        }
      }
      .store-page-manage-head-btn {
        display: flex;
        line-height: 1.2;
        a {
          color: #4a6af5;
        }
        .store-page-manage-head-btn-edit {
          // height: 34px;
          // width: 100px;
          // border-radius: 17px;
          // margin-right: 9px;
          // button {
          //   height: 34px;
          //   width: 100px;
          // }
          padding-right: 16px;
          margin-right: 16px;
          border-right: 1px solid #a6a6a6;
        }
        .store-page-manage-head-btn-view {
          // height: 34px;
          // width: 80px;
          // border-radius: 17px;
          // button {
          //   height: 34px;
          //   width: 80px;
          // }
        }
      }
    }
  }
  // 搜索部分
  .store-page-manage-search {
    position: relative;
    min-height: calc(100vh - 232px);
    padding: 24px 24px 0;
    .store-page-manage-search-content {
      /deep/.data-list-search {
        display: flex;
        align-items: flex-end;
        .data-list-search-item {
          &:nth-last-child(2) {
            margin-right: 10px;
          }
        }
      }
    }
  }
  /deep/table {
    td a {
      color: rgba(69, 112, 234, 1);
      margin-right: 10px;
    }
    .ivu-table-column-center{
      .ivu-table-cell-with-selection{
        padding: 0 13px;
        .ivu-checkbox-wrapper{
          width: 14px;
        }
      }
    }
    .ivu-table-column-left{
      width: 14%;
    }
    tr>th:nth-child(3),tr>td:nth-child(3){
      width: 21%;
    }
    tr>th:nth-child(4),tr>td:nth-child(4){
      width: 21%;
    }
    tr>th:nth-child(5),tr>td:nth-child(5){
      width: 15%;
      text-align: unset;
    }
    tr>th:nth-child(6),tr>td:nth-child(6){
      width: 26%;
      text-align: unset;
    }
    .ivu-table-row>td:last-child{
      .ivu-table-cell{
        padding-right: 0;

      }
    }
    .ivu-dropdown {
      text-align: right;
      .ivu-select-dropdown {
        border-radius: 0;
        text-align: center;
      }
    }
  }
  /deep/.ivu-poptip-body {
    padding: 20px !important;
  }
}
</style>
