<template>
  <div class="product-comments">
    <!-- <common-tabs></common-tabs> -->
    <div class="wrapper">
      <Button
        class="btn-add"
        type="primary"
        shape="circle"
        icon="md-add"
        @click="showCommentModal=true"
        perm="product.comment.operate"
      >新增评价</Button>
      <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData">
        <Button
          @click="promptForVerify(selectedItem.join(','),1)"
          perm="product.comment.operate"
        >批量通过</Button>
        <Button
          @click="promptForVerify(selectedItem.join(','),-1)"
          perm="product.comment.operate"
        >批量不通过</Button>
      </search-list>
      <Table border :loading="isLoading" :columns="columns" :data="commentData"></Table>
      <div class="bar-pager">
        <Page
          v-if="pager.totalPage>0"
          :current="pager.currentPage"
          :page-size="pager.pageSize"
          :total="pager.totalPage"
          show-sizer
          show-elevator
          transfer
          @on-change="pager.currentPage=$event,getCommentsList()"
          @on-page-size-change="pager.pageSize=$event,getCommentsList()"
        ></Page>
      </div>
    </div>

    <comments-add v-model="showCommentModal" @success="refresh"></comments-add>
    <Modal class="reply-modal" v-model="showReplyModal" title="回复评价" width="390">
      <Form ref="replyForm" :model="replyForm" :label-width="90">
        <FormItem
          prop="replyContent"
          :rules="{required:true,message:'请输入回复内容',trigger:'blur'}"
          label="回复内容："
        >
          <Input
            v-model="replyForm.replyContent"
            type="textarea"
            :maxlength="100"
            placeholder="请输入回复内容"
          />
          <span class="suffix">{{replyForm.replyContent.length}}/100</span>
        </FormItem>
      </Form>
      <div slot="footer" class="footer">
        <Button type="text" @click="showReplyModal=false">取消</Button>
        <Button type="primary" @click="replyComment(currentCommentId,replyForm.replyContent)">确定</Button>
      </div>
    </Modal>
    <Modal
      class="verify-modal"
      v-model="showVerifyModal"
      title="审核"
      width="390"
      @on-ok="verifyComment(currentCommentId,verifyPassed)"
      @on-cancel="showVerifyModal=false"
    >
      <RadioGroup v-model="verifyPassed">
        <Radio :label="1">通过</Radio>
        <Radio :label="-1">不通过</Radio>
      </RadioGroup>
    </Modal>
    <Modal class="big-img-modal" v-model="showBigImg" fullscreen footer-hide>
      <img :src="$store.state.siteComdataPath+currentImg" alt />
    </Modal>
  </div>
</template>
<script>
import axios from "axios";
import commonTabs from "./components/common-tabs.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commentsAdd from "./product-comments-add.vue";
const statusMap = {
  "1": {
    className: "table-success",
    labelText: "通过未回复"
  },
  "-1": {
    className: "table-error",
    labelText: "不通过"
  },
  "0": {
    className: "table-warning",
    labelText: "待审核"
  }
  // "4":{
  //   className:"form-success",
  //   labelText:"审核通过并回复"
  // }
};
export default {
  components: {
    commonTabs,
    searchList,
    commentsAdd
  },
  data() {
    return {
      isLoading: false,
      showCommentModal: false,
      showProductModal: false,
      showReplyModal: false,
      showVerifyModal: false,
      showBigImg: false,
      currentImg: "",
      replyForm: {
        replyContent: ""
      },
      verifyPassed: 1, //1代表通过，-1代表不通过
      currentCommentId: 0,
      pager: {
        currentPage: 1,
        pageSize: 20,
        totalPage: 0
      },
      selectedItem: [],
      searchParams: [
        {
          type: 1,
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "商品名称"
        },
        {
          type: 3,
          key: "status",
          name: "状态：",
          options: [
            { id: -9, value: "全部" },
            { id: 0, value: "待审核" },
            // { id: 1, value: "已通过" },
            { id: -1, value: "不通过" },
            { id: 10, value: "通过未回复" },
            { id: 11, value: "通过已回复" }
          ]
        },
        {
          type: 3,
          key: "star",
          name: "评价星级：",
          options: [
            { id: 0, value: "全部" },
            { id: 1, value: "1星" },
            { id: 2, value: "2星" },
            { id: 3, value: "3星" },
            { id: 4, value: "4星" },
            { id: 5, value: "5星" }
          ]
        },
        {
          type: 3,
          key: "is_real",
          name: "评价类型：",
          options: [
            { id: 0, value: "全部" },
            { id: -1, value: "虚拟评价" },
            { id: 1, value: "真实评价" }
          ]
        },
        {
          type: 2,
          key: "startToEndTime",
          name: "评价时间："
        }
      ],
      searchData: {
        status: -9,
        keyword: "",
        star: 0,
        startToEndTime: {
          startTime: "",
          endTime: ""
        },
        is_real: 0
      },
      columns: [
        {
          key: "check",
          width: 40,
          renderHeader: (h, params) => {
            return h("Checkbox", {
              props: {
                value:
                  this.selectedItem.length != 0 &&
                  this.selectedItem.length ==
                    this.commentData.filter(item => {
                      return item.status == 0;
                    }).length,
                indeterminate:
                  this.selectedItem.length > 0 &&
                  this.selectedItem.length <
                    this.commentData.filter(item => {
                      return item.status == 0;
                    }).length,
                disabled:
                  this.commentData.filter(item => {
                    return item.status == 0;
                  }).length == 0
              },
              on: {
                "on-change": checked => {
                  if (checked) {
                    this.selectedItem = this.commentData
                      .filter(item => {
                        return item.status == 0;
                      })
                      .map(item => {
                        return item.id;
                      });
                  } else {
                    this.selectedItem = [];
                  }
                }
              }
            });
          },
          render: (h, params) => {
            return h("Checkbox", {
              props: {
                value: this.selectedItem.indexOf(params.row.id) > -1,
                disabled: params.row.status != 0
              },
              on: {
                "on-change": checked => {
                  let index = this.selectedItem.indexOf(params.row.id);
                  if (checked && index == -1) {
                    this.selectedItem.push(params.row.id);
                  }
                  if (!checked && index != -1) {
                    this.selectedItem.splice(index, 1);
                  }
                }
              }
            });
          }
        },
        {
          key: "product_name",
          title: "商品信息",
          minWidth: 200,
          render: (h, params) => {
            return h(
              "div",
              {
                class: "product-info"
              },
              [
                h("img", {
                  attrs: {
                    src:
                      this.$store.state.siteComdataPath +
                      params.row.product_small_images
                  }
                }),
                h(
                  "Tooltip",
                  {
                    props: {
                      content: params.row.product_name,
                      placement: "top",
                      maxWidth: 220,
                      transfer: true
                    }
                  },
                  [h("p", params.row.product_name)]
                )
              ]
            );
          }
        },
        {
          key: "content",
          title: "评价内容",
          minWidth: 275,
          renderHeader: (h, params) => {
            return h("div", [
              h("span", "评价内容"),
              h(moreMessage, {
                props: {
                  text: "只有审核通过的评价才展示在客户端"
                },
                style: {
                  fontWeight: "normal",
                  verticalAlign: "middle",
                  height: "auto",
                  marginLeft: "5px"
                }
              })
            ]);
          },
          render: (h, params) => {
            let content = [];
            if (params.row.images.length > 0) {
              content.push(
                h(
                  "div",
                  params.row.images
                    .map(image => {
                      return h(
                        "div",
                        {
                          class: "relative",
                          on: {
                            click: () => {
                              this.showBigImg = true;
                              this.currentImg = image;
                            }
                          }
                        },
                        [
                          h("Icon", {
                            props: {
                              type: "ios-eye-outline",
                              color: "white",
                              size: 20
                            }
                          }),
                          h("img", {
                            attrs: {
                              src: this.$store.state.siteComdataPath + image
                            }
                          })
                        ]
                      );
                    })
                    .concat([
                      h(
                        "span",
                        {
                          style: {
                            color: "#9ea7b4",
                            marginBottom: "5px"
                          }
                        },
                        "（点击查看大图）"
                      )
                    ])
                )
              );
            }

            content.push(
              h(
                "Tooltip",
                {
                  props: {
                    content: params.row.content,
                    placement: "top",
                    maxWidth: 366,
                    transfer: true
                  }
                },
                [
                  h(
                    "div",
                    {
                      class: "content"
                    },
                    params.row.content
                  )
                ]
              )
            );

            if (params.row.admin_reply) {
              content.push(
                h(
                  "Tooltip",
                  {
                    class: "reply-tooltip",
                    props: {
                      content: params.row.admin_reply,
                      placement: "top",
                      maxWidth: 366,
                      transfer: true
                    }
                  },
                  [
                    h(
                      "div",
                      {
                        class: "admin-reply"
                      },
                      "回复：" + params.row.admin_reply
                    )
                  ]
                )
              );

              content.push(
                h(
                  "a",
                  {
                    class: "table-operation",
                    attrs: {
                      href: "javascript:void(0)",
                      perm: "product.comment.operate"
                    },
                    on: {
                      click: () => {
                        this.deleteCommentReply(params.row.id);
                      }
                    }
                  },
                  "删除回复"
                )
              );
            }
            return h("div", { class: "comment-content" }, content);
          }
        },
        {
          key: "star",
          title: "评价星级",
          minWidth: 90,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.star + "星");
          }
        },
        {
          title: "评价时间",
          minWidth: 110,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.created_at
                ? [
                    h(
                      "div",
                      params.row.created_at.split(/\s/)[0]
                    ),
                    h(
                      "div",
                      params.row.created_at.split(/\s/)[1]
                    )
                  ]
                : "- - -"
            );
          }
        },
        {
          key: "member_nickname",
          title: "买家信息",
          minWidth: 160,
          render: (h, params) => {
            let nickname = h(
              "div",
              "昵称：" + (params.row.member_nickname || params.row.nickname)
            );
            let id = h("div", "ID：" + params.row.member_id);
            let mobile = h("div", "手机号：" + params.row.member_mobile);
            let tag = h("div", { class: "comment-tag" }, "虚拟评价");
            if (params.row.is_real == 1) {
              return h("div", [id, nickname, mobile]);
            } else {
              return h("div", [nickname, tag]);
            }
          }
        },
        {
          key: "status",
          title: "状态",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            let labelText = statusMap[params.row.status].labelText;
            if (params.row.status == 1 && params.row.admin_reply) {
              labelText = "通过已回复";
            }
            return h(
              "span",
              {
                class: statusMap[params.row.status].className
              },
              labelText
            );
          }
        },
        {
          key: "",
          title: "操作",
          align: "center",
          width: 120,
          render: (h, params) => {
            let verify = h(
              "a",
              {
                class: "table-operation",
                attrs: {
                  href: "javascript:void(0)",
                  perm: "product.comment.operate"
                },
                on: {
                  click: () => {
                    this.showVerifyModal = true;
                    this.currentCommentId = params.row.id;
                  }
                }
              },
              "审核"
            );
            let reply = h(
              "a",
              {
                class: "table-operation",
                attrs: {
                  href: "javascript:void(0)",
                  perm: "product.comment.operate"
                },
                on: {
                  click: () => {
                    this.showReplyModal = true;
                    this.currentCommentId = params.row.id;
                  }
                }
              },
              "回复"
            );
            let line = h(
              "span",
              {
                class: "table-operation",
                style: {
                  marginRight: "10px"
                }
              },
              "|"
            );
            let del = h(
              "a",
              {
                class: "table-operation",
                attrs: {
                  href: "javascript:void(0)",
                  perm: "product.comment.operate"
                },
                on: {
                  click: () => {
                    this.deleteComment(params.row.id);
                  }
                }
              },
              "删除"
            );
            let actions = [del];
            if (params.row.status == 1 && !params.row.admin_reply) {
              actions = [reply, line, del];
            }
            if (params.row.status == 0) {
              actions = [verify, line, del];
            }
            return h("span", {}, actions);
          }
        }
      ],
      commentData: []
    };
  },
  watch: {
    searchData: {
      handler() {
        this.pager.currentPage = 1;
        this.getCommentsList();
      },
      deep: true
    }
  },
  created() {
    this.getCommentsList();
  },
  methods: {
    refresh() {
      this.pager.currentPage = 1;
      this.getCommentsList();
    },
    promptForVerify(id, passed) {
      if (!id) {
        return this.$Message.warning("请选择还没有审核的评价");
      } else {
        this.$Modal.confirm({
          title: "提示",
          content: `是否确定对所选的评价做【${
            passed == 1 ? "通过" : "不通过"
          }】审核处理？`,
          onOk: () => {
            this.verifyComment(id, passed);
          }
        });
      }
    },
    verifyComment(id, passed) {
      axios
        .post("/shop/admin/product/comment/status", {
          id,
          status: passed
        })
        .then(res => {
          if (res.code == 200) {
            this.$Message.success(res.msg);
            this.getCommentsList();
            this.selectedItem = [];
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    replyComment(id, admin_reply) {
      this.$refs.replyForm.validate(valid => {
        if (valid) {
          axios
            .post("/shop/admin/product/comment/reply", {
              id,
              admin_reply
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("回复成功");
                this.getCommentsList();
                this.replyForm.replyContent = "";
                this.showReplyModal = false;
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        } else {
          this.$Message.error("请输入回复内容");
        }
      });
    },
    deleteCommentReply(id) {
      axios
        .post("/shop/admin/product/comment/reply", {
          id,
          admin_reply: ""
        })
        .then(res => {
          if (res.code == 200) {
            this.$Message.success("删除成功");
            this.getCommentsList();
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    deleteComment(id) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "删除后将不可恢复，也不再在客户端展示该评论！是否确定要删除？",
        onOk: () => {
          axios
            .post("/shop/admin/product/comment/delete", {
              id: id
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("删除成功");
                this.getCommentsList();
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
    getCommentsList() {
      let data = {
        page: this.pager.currentPage,
        page_size: this.pager.pageSize,
        created_at_min: this.searchData.startToEndTime.startTime,
        created_at_max: this.searchData.startToEndTime.endTime
      };
      this.isLoading = true;
      axios
        .get("/shop/admin/product/comment/list", {
          params: Object.assign(data, this.searchData)
        })
        .then(res => {
          this.isLoading = false;
          if (res.code == 200) {
            this.commentData = [];
            this.$nextTick(() => {
              this.commentData = res.data.list;
              this.pager.totalPage = res.data.total;
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
.product-comments {
  .wrapper {
    padding: 24px 24px 0;
    min-height: calc(100vh - 215px);
    // /deep/.data-list-search{
    //   padding:16px 16px 0;
    //   margin:24px 0;
    //   background:#f8f9fd;
    // }
    /deep/.ivu-table {
      .ivu-table-cell {
        padding-left: 14px;
        padding-right: 14px;
      }
      .ivu-checkbox-wrapper {
        margin-right: 0;
      }
      table {
        table-layout: auto;
        width: 100% !important;
        min-width: 1095px;
      }
      th {
        background: #f8f9fd;
        &:first-child {
          border-right: none;
        }
      }
      td {
        color: #657180;
        font-size: 12px;
        line-height: 18px;
        padding: 15px 0;
        &:first-child {
          border-right: none;
        }
        &:nth-child(3) {
          padding: 12px 0;
        }
        &:nth-child(5) {
          line-height: normal;
        }
      }
      .table-operation:not(:last-child) {
        margin-right: 10px;
      }
      th,
      td {
        &:nth-child(2) {
          .ivu-table-cell {
            padding-left: 0;
            .ivu-checkbox-wrapper {
              margin-right: 0;
            }
          }
        }
      }
      .product-info {
        display: flex;
        align-items: center;
        img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          margin-right: 8px;
          flex-shrink: 0;
          // border: 1px solid #dcdee2;
        }
        p {
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          overflow: hidden;
          -webkit-box-orient: vertical;
        }
      }
      .comment-content {
        .relative {
          display: inline-block;
          position: relative;
          margin-right: 3px;
          vertical-align: sub;
          .ivu-icon-ios-eye-outline {
            display: none;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            position: absolute;
            background: rgba(0, 0, 0, 0.5);
          }
          &:hover {
            cursor: pointer;
            .ivu-icon-ios-eye-outline {
              display: block;
            }
          }
        }
        img {
          width: 30px;
          height: 30px;
          object-fit: contain;
          // border: 1px solid #dcdee2;
        }
        .content {
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          overflow: hidden;
          -webkit-box-orient: vertical;
        }
        .admin-reply {
          // width:100%;
          // white-space:nowrap;
          // text-overflow: ellipsis;
          // overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          overflow: hidden;
          -webkit-box-orient: vertical;
          line-height: 30px;
          height: 30px;
          background: #eee;
          border-radius: 5px;
          padding: 0 6px;
          position: relative;
        }
        .reply-tooltip {
          width: 100%;
          margin: 6px 0;
        }
        .ivu-tooltip {
          display: block;
          .ivu-tooltip-rel {
            display: block;
          }
        }
      }
      .comment-tag {
        width: fit-content;
        padding: 2px 4px;
        background: #dcdee2;
        border: 1px solid #ccc;
        line-height: 1;
      }
    }
  }
  // .footer{
  //   height:70px;
  //   line-height:70px;
  //   text-align:right;
  //   padding:0 29px;
  // }
}
.reply-modal {
  /deep/.ivu-modal-body {
    padding: 20px 20px 40px;
    .ivu-form-item {
      margin-bottom: 0;
    }
    textarea {
      height: 84px;
      resize: none;
    }
    .suffix {
      position: absolute;
      right: 0px;
      bottom: -16px;
      color: #999;
      line-height: 1;
      font-size: 12px;
    }
  }
}
</style>
<style lang="less">
.big-img-modal {
  .ivu-modal-content {
    background: black;
    .ivu-modal-body {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .ivu-icon-ios-close:hover {
    color: white;
  }
}
</style>

