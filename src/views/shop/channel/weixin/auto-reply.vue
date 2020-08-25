<template>
  <div class="weixin">
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <blank v-show="loaded" v-if="!isBound" msg="绑定公众号后，即可使用自动回复功能" />
      <div v-show="loaded" v-else class="main-board">
        <Tabs :value="replayType + ''" :animated="false" @on-click="switchTab">
          <TabPane label="关键词回复" name="2">
            <div class="wrapper wrapper1">
              <!--<Button-->
                <!--class="btn-add"-->
                <!--type="primary"-->
                <!--shape="circle"-->
                <!--icon="md-add"-->
                <!--@click="$router.push('/channel/weixin/auto-reply/addKeywordReply?type=2')"-->
                <!--perm="mp.reply.operate"-->
              <!--&gt;新增关键词</Button>-->
              <add-more text="新增关键词" @onAddMoreClick="onAddCoupons" perm="coupon.operate"></add-more>
              <div class="search">
                <!-- <label for>关键词：</label> -->
                <Input
                  class="keyword"
                  v-model="keyword"
                  placeholder="请输入关键词"
                  prefix="ios-search"
                  @on-enter="search"
                ></Input>
                <label for>更新时间：</label>
                <DatePicker class="date" type="datetime" v-model="startDate" placeholder="请选择日期"></DatePicker>
                <span class="line"></span>
                <DatePicker class="date" type="datetime" v-model="endDate" placeholder="请选择日期"></DatePicker>
                <Button class="btn-search" type="primary" @click="search">查询</Button>
              </div>
              <Table border :columns="columns1" :loading="loading" :data="replyList[2]"></Table>
              <div class="bar-pager">
                <Page
                  v-if="pager[2].total"
                  :total="pager[2].total"
                  :current="pager[2].page"
                  :page-size="pager[2].size"
                  show-sizer
                  show-elevator
                  :transfer="true"
                  @on-change="currentPageChange(2,$event)"
                  @on-page-size-change="pageSizeChange(2,$event)"
                />
              </div>
            </div>
          </TabPane>
          <TabPane label="收到信息回复" name="1">
            <div class="wrapper wrapper2">
              <Button
                class="btn-add"
                type="primary"
                shape="circle"
                icon="md-add"
                v-if="replyList[1].length === 0"
                @click="$router.push('/channel/weixin/auto-reply/addMessageReply?type=1')"
                perm="mp.reply.operate"
              >新增消息回复</Button>
              <Table border :columns="columns2" :loading="loading" :data="replyList[1]"></Table>
            </div>
            <!-- <div class="footer">
                <Page
                  v-if="pager[1].total"
                  :total="pager[1].total"
                  :current="pager[1].page"
                  :page-size="pager[1].size"
                  show-sizer
                  show-elevator
                  @on-change="currentPageChange(1,$event)"
                  @on-page-size-change="pageSizeChange(1,$event)"
                />
            </div>-->
          </TabPane>
          <TabPane label="被关注回复" name="0">
            <div class="wrapper wrapper3">
              <Button
                class="btn-add"
                type="primary"
                shape="circle"
                icon="md-add"
                v-if="replyList[0].length === 0"
                @click="$router.push('/channel/weixin/auto-reply/addFocusReply?type=0')"
                perm="mp.reply.operate"
              >新增关注回复</Button>
              <Table border :columns="columns2" :loading="loading" :data="replyList[0]"></Table>
            </div>
            <!-- <div class="footer">
                <Page
                  v-if="pager[0].total"
                  :total="pager[0].total"
                  :current="pager[0].page"
                  :page-size="pager[0].size"
                  show-sizer
                  show-elevator
                  @on-change="currentPageChange(0,$event)"
                  @on-page-size-change="pageSizeChange(0,$event)"
                />
            </div>-->
          </TabPane>
        </Tabs>
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
    const renderAction = (h, p) => {
      var routes = ["editFocusReply", "editMessageReply", "editKeywordReply"];
      return [
        h(
          "router-link",
          {
              style: {
                  marginRight: "10px"
              },
            props: {
              to: {
                name: routes[p.row.type],
                query: {
                  type: p.row.type,
                  id: p.row.id
                }
              }
            }
          },
          !p.row.paper_id ? "编辑" : ""
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
              perm: "mp.reply.operate"
            },
            on: {
              click: () => {
                this.deleteItem(p);
              }
            }
          },
          !p.row.paper_id ? "删除" : ""
        ),
        p.row.paper_id
          ? [
              h("span", {
                style: {
                  width: "5px",
                  height: "1px",
                  marginLeft: "-15px",
                  display: "inline-block",
                  background: "#666"
                }
              }),
              h("span", {
                style: {
                  width: "5px",
                  height: "1px",
                  marginLeft: "3px",
                  display: "inline-block",
                  background: "#666"
                }
              })
            ]
          : ""
      ];
    };
    const renderKeyword = (h, p) => {
      return h(
        "span",
        p.row.data.keyword
          .map(item => {
            return (
              item.value + "（" + (item.type ? "模糊匹配" : "精确匹配") + "）"
            );
          })
          .join("、")
      );
    };
    const renderReplyType = (h, p) => {
      var types = ["文本", "图文", "图片"];
      if (
        p.row.reply_type == 99 &&
        p.row.reply_data &&
        p.row.reply_data.callback.indexOf("SharePaper") > -1
      )
        return h("span", "分享海报");
      else return h("span", types[p.row.reply_type]);
    };
    return {
      isBound: false,
      loading: false,
      keyword: "",
      startDate: "",
      endDate: "",
      thirdMenu: [],
      columns1: [
        {
          title: "规则名称",
          key: "name",
          align: "center",
          render: (h, p) => {
            return h(
              "div",
              {
                style: {
                  display: "block",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }
              },
              p.row.paper_id
                ? [
                    // 规则名称
                    h(
                      "span",
                      {
                        style: {
                          width: "100%",
                          height: "16px",
                          display: "inline-block",
                          marginBottom: "3px"
                        }
                      },
                      p.row.name ? p.row.name : ""
                    ),
                    // 默认同步标签
                    h(
                      "span",
                      p.row.name
                        ? {
                            style: {
                              width: "55px",
                              height: "17px",
                              lineHeight: "16px",
                              display: "inline-block",
                              border: "1px solid #FBA219",
                              color: "#FBA219"
                            }
                          }
                        : "",
                      p.row.name ? "默认同步" : ""
                    )
                  ]
                : p.row.name
            );
          }
        },
        {
          title: "关键词",
          key: "keyword",
          width: 410,
          align: "center",
          render: renderKeyword
        },
        {
          title: "消息回复类型",
          key: "reply_type",
          align: "center",
          render: renderReplyType
        },
        {
          title: "更新时间",
          key: "updated_at",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          width: 122,
          align: "center",
          render: renderAction
        }
      ],
      columns2: [
        {
          title: "规则名称",
          key: "name",
          align: "center"
        },
        {
          title: "消息回复类型",
          key: "reply_type",
          align: "center",
          render: renderReplyType
        },
        {
          title: "更新时间",
          key: "updated_at",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          width: 122,
          align: "center",
          render: renderAction
        }
      ],
      replyList: [[], [], []],
      pager: [
        {
          total: 0,
          page: 1,
          size: 20
        },
        {
          total: 0,
          page: 1,
          size: 20
        },
        {
          total: 0,
          page: 1,
          size: 20
        }
      ],
      replayType: 2,
      loaded: false
    };
  },
  created() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    if (typeof this.$route.query.type != "undefined") {
      this.replayType = this.$route.query.type;
    }
    for (var type = 0; type < 3; type++) {
      this.getReplyList(type, 1, 20);
    }
  },
  methods: {
    switchTab(name) {
      this.$router.replace({
        name: "autoReply",
        query: {
          type: name
        }
      });
    },
    formatString(date) {
      if (Object.prototype.toString.call(date) == "[object Date]") {
        return (
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate() +
          " " +
          date.getHours() +
          ":" +
          date.getMinutes() +
          ":" +
          date.getSeconds()
        );
      } else {
        return "";
      }
    },
    search() {
      this.pager[2].page = 1;
      this.pager[2].size = 20;
      this.getReplyList(2, 1, 20);
    },
    currentPageChange(type, page) {
      this.pager[type].page = page;
      this.getReplyList(type, page, this.pager[type].size);
    },
    pageSizeChange(type, size) {
      this.pager[type].size = size;
      this.getReplyList(type, this.pager[type].page, size);
    },
    deleteItem(p) {
      this.$Modal.confirm({
        title: "提示",
        content: "是否确定删除该条自动回复内容？",
        onOk: () => {
          axios
            .post("/shop/admin/wx/reply/delete", {
              id: p.row.id
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("删除成功");
                var type = p.row.type;
                var page = this.pager[type].page;
                var size = this.pager[type].size;
                this.getReplyList(type, page, size);
                // this.replyList[p.row.type].splice(p.index, 1);
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
    getReplyList(type, page, size) {
      this.loading = true;
      this.$store.state.COMMON_loading = true
      axios
        .post("/shop/admin/wx/reply/list", {
          page: page,
          page_size: size,
          keyword: this.keyword,
          type: type,
          updated_at_start: this.formatString(this.startDate),
          updated_at_end: this.formatString(this.endDate)
        })
        .then(res => {
          if (res.code == 200) {
            this.$nextTick(() => {
              this.$set(this.replyList, type, res.data.list);
              this.isBound = res.data.config_full;
              this.pager[type].total = res.data.total;
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        })
        .finally(() => {
          this.loading = false;
          this.loaded = true;
          this.$store.state.COMMON_loading = false
        });
    },
    onAddCoupons(){
        this.$router.push('/channel/weixin/auto-reply/addKeywordReply?type=2');
    }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .main-content {
    height: 100%;
    flex: 1;
  }
}
.main-board {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: white;
  /deep/.ivu-tabs {
    overflow: visible;
  }
  /deep/.ivu-tabs-bar {
    flex-shrink: 0;
    margin-bottom: 0px;
    padding-left: 24px;
  }
  .wrapper {
    padding: 24px 24px 0px;
    height: calc(100vh - 120px);
    overflow: auto;
    .add-more-btn{
      /deep/.ivu-btn-primary{
        width: 100px;
      }
    }
    .search {
      margin-bottom: 20px;
      label {
        margin-right: 5px;
      }
      .keyword {
        width: 211px;
        height: 32px;
        margin-right: 16px;
      }
      .date {
        width: 181px;
        height: 32px;
      }
      .line {
        display: inline-block;
        width: 7px;
        height: 1px;
        background: #9ea4b1;
        margin: 0 10px;
        vertical-align: middle;
      }
      .btn-search {
        margin-left: 16px;
        width: 58px;
        height: 32px;
      }
    }
    /deep/table {
      min-width: 1000px;
      width: 100% !important;
      table-layout: auto;
    }
    /deep/.ivu-table td {
      color: #657180;
      font-size: 12px;
    }
    /deep/.ivu-table-header th {
      background: #f8f9fd;
    }
    /deep/.ivu-table-body td a {
      color: #3f66d3;
      &:hover {
        text-decoration: underline;
      }
    }
    /deep/td:last-child a:first-child {
      margin-right: 16px;
    }
  }
  .footer {
    // position: absolute;
    // left: 25px;
    // bottom: 0;
    // width:calc(100% - 50px);
    padding: 0 25px;
    height: 70px;
    line-height: 70px;
    text-align: right;
  }
  // .wrapper1/deep/.ivu-table-body {
  //   max-height: calc(100vh - 395px);
  //   overflow:hidden;
  // overflow-y: scroll;
  // overflow-x:hidden;
  // }
  // .wrapper3/deep/.ivu-table-body,
  // .wrapper2/deep/.ivu-table-body {
  // max-height: calc(100vh - 347px);
  // overflow:auto;
  // overflow-y: scroll;
  // overflow-x:hidden;
  // }
  .btn-add {
    width: 123px;
    height: 32px;
    font-size: 13px;
    padding: 0;
    margin-bottom: 24px;
  }
}
</style>