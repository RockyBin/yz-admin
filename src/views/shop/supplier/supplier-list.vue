<template>
  <div class="supplier-list" v-show="!$store.state.COMMON_loading">
    <verticalLineTitlebar>
      <h3 style="color:#464C5B;font-size:13px;">目前拥有：<span style="color:#FF9900;">{{total}}</span> 名供应商</h3>
      <div>供应商后台链接地址：<span id="copy" style="display: inline-block;vertical-align:text-bottom;line-height: 14px;">{{supplierUrl}}</span>
        <Button class="search-style" perm="supplier.list.view" @click="copyLinkUrl()">复制</Button>
      </div>
    </verticalLineTitlebar>
    <div>
      <add-more :text="texts" @onAddMoreClick="onAddSupplier" perm="supplier.list.operate"></add-more>
      <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData"></search-list>
      <common-table
          ref="supplierTable"
          :minWidth="1158"
          :loading="tableLoading"
          :columnsData="columnsData"
          :listData="supplierListArray"
      ></common-table>
      <div class="bar-pager">
        <Page
            v-show="supplierListArray.length"
            :total="total"
            :page-size="pageSize"
            show-elevator
            show-sizer
            :current="currentPage"
            @on-change="onPageChange"
            @on-page-size-change="onPageSizeChange"
            class="page-style"
            :transfer="true"
        />
      </div>
      <modal-member-select
          ref="newSupplierModal"
          title="新增供应商"
          v-model="newSupplierStatus"
          @onModalComfrimClick="onModalComfrimClick"
          @onSelectMemberClick="onSelectMemberClick"
          :selectData="memberSelectData"
          :isSupplier="true"
      ></modal-member-select>
      <select-modal
          title="选择会员"
          ref="memberSelectModal"
          :width="500"
          optionsText="全部会员"
          :columns="memberModalColumn"
          :searchData="memberSearchData"
          :headList="memberLevelData"
          headName="name"
          :selectData="memberSelectData"
          :tableData="tableMemberData"
          placeholder="昵称/姓名/手机号"
          v-model="memberModalStatus"
          @getList="onGetMemberList"
          @onGetSelectData="onGetMemberSelectData"
      ></select-modal>
    </div>
  </div>
</template>
<script>
  import searchList from "@/views/shop/components/search/search-list.vue";
  import addMore from "COMPONENTS/button/add-more.vue";
  import commonTable from "@/views/shop/components/table/common-table.vue";
  import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
  import modalMemberSelect from "@/views/shop/components/modal/modal-member-select";
  import memberInfor from "@/views/shop/components/table/member-infor.vue";
  import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
  export default {
    components: {
      searchList,
      commonTable,
      selectModal,
      modalMemberSelect,
      addMore,
      verticalLineTitlebar
    },
    data() {
      return {
        tableLoading: false,
        newSupplierStatus: false,
        memberModalStatus: false,
        selectModalStatus: false,
        comfirmDeleteStatus: false,
        // 会员选择数据
        memberSelectData: null,
        supplierUrl:"",
        texts: "新增供应商",
        memberModalColumn: [
          {
            title: "会员信息",
            minWidth: 227,
            render: (h, params) => {
              return h(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center"
                  }
                },
                [
                  h("img", {
                    style: {
                      width: "40px",
                      height: "40px",
                      borderRadius: "4px",
                      marginRight: "14px"
                    },
                    attrs: {
                      src: params.row.headurl
                        ? this.formatURL(params.row.headurl)
                        : "images/head-portrait.png"
                    }
                  }),
                  h(
                    "div",
                    {
                      style: {
                        width: "calc(100% - 50px)",
                        padding:"8px 0"
                      }
                    },
                    [
                      h(
                        "div",
                        {
                          style: {
                            overflow: "hidden",
                            "text-overflow": "ellipsis",
                            "white-space": "nowrap",
                            color: "#657180",
                            fontSize: "13px"
                          }
                        },
                        params.row.nickname
                      ),
                      h(
                        "div",
                        {
                          style: {
                            overflow: "hidden",
                            "text-overflow": "ellipsis",
                            "white-space": "nowrap",
                            color: "#9EA7B4",
                            fontSize: "12px"
                          }
                        },
                        params.row.name?"姓名："+ params.row.name : '姓名：--'
                      ),
                      h(
                        "div",
                        {
                          style: {
                            color: "#9EA7B4",
                            fontSize: "12px"
                          }
                        },
                        "手机：" + params.row.mobile || ""
                      ),
                      h(
                        "div",
                        {
                          style: {
                            color: "#9EA7B4",
                            fontSize: "12px"
                          }
                        },
                        "ID：" + params.row.id
                      )
                    ]
                  )
                ]
              );
            }
          },
          {
            title: "会员等级",
            width: 142,
            key: "level_name",
            align: "center",
            render: (h, params) => {
              return h(
                "div",
                [
                  h("div", params.row.level > 0 ? params.row.level_name : "--"),
                  params.row.status == 0 ? h("span", {class:"table-error"}, "封号") : null
                ]
              );
            }
          }
        ],
        memberSearchData: {
          searchName: "",
          selectClass: 0,
          currentPage: 1,
          pageSize: 20,
          total: 0
        },
        tableMemberData: [],
        currentExpendIndex: "", // 当前展开的需要操作的分销商index
        // 分页数据
        total: 0,
        pageSize: 20,
        currentPage: 1,
        // 搜索初始化
        searchParams: [
          {
            type: 10,
            name: "",
            prefixIcon: "ios-search",
            key: "keyword",
            optionWidth: 80,
            width:223,
            optionKey: "keyword_type",
            placeholder: {
              1:"昵称/姓名/手机号",
              2:"姓名/手机号",
              3:"平台名称"
            },
            options:[
              { id: 1, value: "会员" },
              { id: 2, value: "员工" },
              { id: 3, value: "供应平台" }
            ]
          },
          {
            type: 3,
            key: "status",
            name: "状态：",
            options: [
              { id: -99, value: "全部" },
              { id: 1, value: "启用" },
              { id: -1, value: "禁用" }
            ]
          },
          {
            type: 2,
            key: "beingTime",
            // search_new_line: true,
            name: "成为供应商时间："
          }
        ],
        // 搜索数据
        searchData: {
          keyword_type: 1, //1会员，2员工
          keyword: this.$route.query.mobile || this.$route.params.keyword || "",
          status: 1,
          beingTime: {
            startTime: "",
            endTime: ""
          },
        },
        // 列表模板名称
        expandComponents: "expandSupplier",
        // 渲染列表节点
        columnsData: [
          {
            title: "供应商信息",
            minWidth: 220,
            render: (h, params) => {
              return h(memberInfor, {
                  props:{
                    id:Number(params.row.member_id),
                    headurl:params.row.headurl?this.formatURL(params.row.headurl):
                      require("@/views/shop/images/head-portrait.png"),
                    nickname:params.row.nickname,
                    mobile:params.row.member_mobile,
                    name:params.row.name || '--'
                  },
                  attrs: {
                    perm: "member.detail.view"
                  }
                }
              );
            }
          },
          {
            title: "供应平台名称",
            minWidth: 143,
            render: (h, params) => {
              return h("div", [
                h("i",{
                  class:"iconfont icon-gonghuoshang",
                  style:{
                    color:"#41B44D",
                    "margin-right":"5px",
                    "vertical-align":"middle"
                  }
                }),
                h("span",{style:{"vertical-align":"middle"}},params.row.supplier_name?params.row.supplier_name:'--')
              ]);
            }
          },
          {
            title: "总商品/上架/待审",
            minWidth: 133,
            className: "supplier-list-deal-time",
            render: (h, params) => {
              return h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    "text-align": "left"
                  }
                },
                [
                  h("div", "总数 ：" + params.row.product_count.total || 0),
                  h("div", [
                    h("span", `上架 ：`),
                    h(
                      "a",
                      {
                        style: {
                          "text-decoration": "underline",
                          color: "#3f66d3",
                          cursor: "pointer",
                        },
                        attrs: {
                          perm: "product.view"
                        },
                        on: {
                          click: () => {
                            this.$router.push({
                              name: "productManage",
                              params: {
                                keyword: params.row.supplier_name,
                                keyword_type: "2"
                              }
                            });
                          }
                        }
                      },
                      params.row.product_count.sell_count || 0
                    )
                  ]),
                  h("div", [
                    h("span", `待审 ：`),
                    h(
                      "a",
                      {
                        style: {
                          "text-decoration": "underline",
                          color: "#3f66d3",
                          cursor: "pointer",
                        },
                        attrs: {
                          perm: "supplier.product.verify.view"
                        },
                        on: {
                          click: () => {
                            this.$router.push({
                              name: "supplierProductVerify",
                              params: {
                                keyword: params.row.supplier_name,
                              }
                            });
                          }
                        }
                      },
                      params.row.product_count.wait_review_count || 0
                    )
                  ])
                ]
              );
            }
          },
          {
            title: "已结算/待结算/可提现",
            minWidth: 160,
            render: (h, params) => {
              return h("div", [
                h("div", "已结算：￥" + params.row.money.total || 0),
                h("div", "待结算：￥" + params.row.money.freeze || 0),
                h("div", "可提现：￥" + params.row.money.can_use)
              ]);
            }
          },
          {
            title: "所属员工",
            align: "left",
            minWidth: 140,
            render: (h, params) => {
              return params.row.admin_name||params.row.admin_mobile? h("div", [
                h(
                  "div",
                  params.row.admin_name
                ),
                h(
                  "div",
                  params.row.admin_mobile
                )
              ]):h("div","--");
            }
          },
          {
            title: "成为供应商时间",
            minWidth: 120,
            align: "center",
            render: (h, params) => {
              return params.row.created_at
                ? h(
                  "div",
                  {
                    style: {
                      marginLeft: "-5px"
                    }
                  },
                  [
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          marginLeft: "5px"
                        }
                      },
                      params.row.created_at.split(/\s/)[0]
                    ),
                    h("br"),
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          marginLeft: "5px"
                        }
                      },
                      params.row.created_at.split(/\s/)[1]
                    )
                  ]
                )
                : h("div", "- - -");
            }
          },
          {
            title: "状态",
            align: "center",
            minWidth: 90,
            render: (h, params) => {
              return h(
                "div",
                {
                  class:
                    params.row.status === -1 ? "table-error" : "table-success"
                },
                params.row.status === -1 ? "禁用" : "启用"
              );
            }
          },
          {
            title: "操作",
            align: "center",
            minWidth: 152,
            render: (h, params) => {
              return h("div", [
                h(
                  "span",
                  {
                    style: {
                      marginRight: "10px",
                    },
                    attrs: {
                      perm: "member.detail.view"
                    },
                    class: {
                      "table-operation": true
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          path: "/member/detail",
                          query: {
                            id: params.row.member_id,
                            tab: 5
                          }
                        });
                      }
                    }
                  },
                  "查看详情"
                ),
                h(
                  "span",
                  {
                    style: {
                      marginRight: "10px",
                    },
                    class: {
                      "table-operation": true
                    }
                  },
                  "|"
                ),
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true
                    },
                    attrs: {
                      perm: "supplier.list.operate"
                    },
                    style: {
                      display: params.row.status == 1 ? "" : "none"
                    },
                    on: {
                      click: () => {
                        this.deActive(params.index);
                      }
                    }
                  },
                  "取消资格"
                ),
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true
                    },
                    attrs: {
                      perm: "supplier.list.operate"
                    },
                    style: {
                      display: params.row.status == -1 ? "" : "none"
                    },
                    on: {
                      click: () => {
                        this.reActive(params.index);
                      }
                    }
                  },
                  "恢复资格"
                )
              ]);
            }
          }
        ],
        supplierListArray: [],
        // 会员等级列表
        memberLevelData: []
      };
    },
    watch: {
      searchData: {
        handler() {
          this.currentPage = 1;
          this.getSupplierList();
        },
        deep: true
      },
      newSupplierStatus(val) {
        if (val) {
          this.resetModalData();
        }
      },
      selectModalStatus(val) {
        if (val) {
          this.$refs["supplierSelectModal"].resetData();
        }
      }
    },
    computed: {
    },
    mounted() {
      var domain = location.host;
      if (domain.indexOf("localhost") > -1 || !domain) {
        domain = "shop.test.72dns.net";
      }
      this.supplierUrl = "http://"+domain+"/shop/supplier";
    },
    created() {
      this.$store.state.COMMON_loading = true;
      Promise.all([
        this.getMemberLevelList()
      ]).then(() => {
        this.getSupplierList();
      });
    },
    // mounted() {
    //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "1380px";
    // },
    methods: {
      formatURL(url) {
        return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
      },
      /**
       * 复制页面链接
       */
      copyLinkUrl() {
        var val = document.getElementById("copy");
        window.getSelection().selectAllChildren(val);
        document.execCommand("Copy"); // 执行浏览器复制命令
        this.$Message.success("数据已复制到剪切板");
      },
      /**
       * 获取会员等级列表
       */
      getMemberLevelList() {
        return new Promise(resolve => {
          this.http({
            url: "/shop/admin/member/level/list"
          })
            .then(res => {
              if (res.code === 200) {
                this.memberLevelData = res.data.list || [];
              } else {
                this.$Message.error(res.msg);
              }
              resolve();
            })
            .catch(e => {
              this.$Message.error(e);
              this.$store.state.COMMON_loading = false;
            });
        });
      },
      /**
       * 获取供应商列表
       */
      getSupplierList() {
        let data = this.getSearchParams();
        return new Promise(resolve => {
          this.tableLoading = true;
          this.http({
            url: "/shop/admin/supplier/list",
            data,
            method: "POST"
          })
            .then(res => {
              if (res.code === 200) {
                this.supplierListArray = [];
                this.$nextTick(() => {
                  let supplierList = res.data.list || [];
                  this.supplierListArray = supplierList;
                  this.total = res.data.total;
                  this.tableLoading = false;
                  resolve();
                });
              } else {
                this.tableLoading = false;
                this.$Message.error(res.msg);
              }
            })
            .catch(e => {
              this.$Message.error(e);
            })
            .finally(() => {
              this.$store.state.COMMON_loading = false;
            });
        });
      },
      /**
       * 获取列表搜条件
       */
      getSearchParams() {
        let data = {
          keyword_type: this.searchData.keyword_type,
          keyword: this.searchData.keyword,
          status:
            this.searchData.status === -99 ? null : this.searchData.status,
          created_at_start: this.searchData.beingTime.startTime,
          created_at_end: this.searchData.beingTime.endTime,
          page: this.currentPage,
          page_size: this.pageSize
        };
        return data;
      },
      /**
       * 分页改变重新拉取数据
       */
      onPageChange(val) {
        this.currentPage = val;
        this.getSupplierList();
      },
      onPageSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.getSupplierList();
      },
      /**
       * 供应商取消资格
       */
      deActive(index) {
        // var subtotal = 0;
        // this.$httpGet(
        //   "/shop/admin/distribution/distributor/info",
        //   { type: 2, id: this.supplierListArray[index].member_id },
        //   res => {
        //     if (res.code === 200) {
              // subtotal = res.data.base_info.subordinate_distributor;
              var tips =
                "取消资格后，该供应商所有的商品将做全部下架处理，旧的订单依旧可以继续完成。是否确定取消【" +
                this.supplierListArray[index].nickname +
                "】的供应商资格？";
              // if (subtotal)
                // tips =
                //   "该分销商共有下级分销商" +
                //   subtotal +
                //   "人，取消【" +
                //   this.supplierListArray[index].nickname +
                //   "】的分销资格后，仅取消该分销商资格，不会影响其他分销商的资格。是否确定要取消？";
              this.$Modal.confirm({
                title: "提示",
                content: tips,
                loading: true,
                onOk: () => {
                  this.deActiveData({
                    member_id: this.supplierListArray[index].member_id
                  });
                }
              });
        //     } else {
        //       this.$Message.error(res.msg);
        //     }
        //   }
        // );
      },
      /**
       * 供应商恢复资格
       */
      reActive(index) {
        this.$Modal.confirm({
          title: "提示",
          content:
            "恢复资格后，如有需要请到【商品列表上架该供应商的商品】。是否确定恢复【" +
            this.supplierListArray[index].nickname +
            "】的供应商资格？",
          loading: true,
          onOk: () => {
            this.reActiveData({
              member_id: this.supplierListArray[index].member_id
            });
          }
        });
      },
      /**
       * 确认是否删除
       */
      onComfirmDeleteDirectly(index) {
        this.currentExpendIndex = index;
        this.comfirmDeleteStatus = true;
      },
      /**
       * 取消分销商资格接口
       */
      deActiveData(data) {
        return new Promise(resolve => {
          this.$httpPost(
            "/shop/admin/supplier/cancel",
            data,
            res => {
              this.$Modal.remove();
              resolve();
              if (res.code === 200) {
                this.$Message.success("取消成功");
                this.getSupplierList();
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        });
      },
      /**
       * 恢复分销商资格接口
       */
      reActiveData(data) {
        return new Promise(resolve => {
          this.$httpPost(
            "/shop/admin/supplier/recover",
            data,
            res => {
              this.$Modal.remove();
              resolve();
              if (res.code === 200) {
                this.$Message.success("恢复成功");
                this.getSupplierList();
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        });
      },
      /**
       * 新增分销商
       */
      onAddSupplier() {
        this.newSupplierStatus = true;
      },
      /**
       * 获取会员选择ID
       */
      onGetMemberSelectData(data) {
        if (data && data.status == 0) {
          return this.$Message.error("该会员已被封号，请重新选择");
        }
        this.memberSelectData = data;
        this.memberModalStatus = false;
      },
      /**
       * 获取会员列表
       */
      onGetMemberList(searchData) {
        this.memberSearchData = searchData;
        let data = {
          keyword: searchData.searchName,
          page: searchData.currentPage,
          page_size: searchData.pageSize,
          is_supplier: 0
        };
        if (searchData.selectClass) {
          data.level = searchData.selectClass;
        }
        this.http({
          url: "/shop/admin/member/list",
          method: "POST",
          data
        }).then(res => {
          if (res.code === 200) {
            this.tableMemberData = res.data.list || [];
            this.memberSearchData.currentPage = Number(res.data.current);
            this.memberSearchData.pageSize = Number(res.data.page_size);
            this.memberSearchData.total = Number(res.data.total);
          } else {
            this.$Message.error(res.msg);
          }
        });
      },
      /**
       * 选择会员
       */
      onSelectMemberClick() {
        this.memberModalStatus = true;
      },
      addNewErrorCallback() {
        this.$Message.error("请通知会员绑定手机号才能新增身份");
        this.$refs.newSupplierModal.modalLoading = false;
        this.$nextTick(() => {
          this.$refs.newSupplierModal.modalLoading = true;
        });
      },
      /**
       * 新增供应商
       */
      onModalComfrimClick(data) {
        if (!/^\d{11}$/.test(this.memberSelectData.mobile)) {
          this.addNewErrorCallback();
          return;
        }
        this.http({
          url: "/shop/admin/supplier/add",
          method: "POST",
          data: data
        }).then((res) => {
          if(res.code == 410) {
            this.newSupplierStatus = false;
            this.$Modal.confirm({
              title: "提示",
              content:
                `你所添加的供应商【${this.memberSelectData.nickname}】已是供应商身份，但处于【禁用】状态，可前往<供应商列表>对会员恢复供应商资格。`,
              okText: "前往处理",
              onOk: () => {
                this.searchData.keyword = this.memberSelectData.mobile;
                this.searchData.status = -99;
                this.getSupplierList();
              }
            })
          } else if (res.code == 200){
            this.newSupplierStatus = false;
            this.$Message.success("添加成功！");
            this.getSupplierList();
          } else if (res.code === 459) {
            this.addNewErrorCallback();
          } else {
            this.$Message.error(res.msg);
            this.newSupplierStatus = false;
          }
        });
      },
      /**
       * 重置会员数据
       */
      resetModalData() {
        this.memberSelectData = null;
        this.$refs["newSupplierModal"].resetData();
        this.$refs["memberSelectModal"].resetData();
      }
    }
    // beforeDestroy() {
    //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "";
    // }
  };
</script>
<style lang="less" scoped>
  .supplier-list {
    padding: 24px;
    height: 100%;
    overflow: auto;
    .vertical-line-titlebar-wrapper {
      height:50px;
      line-height:50px;
      margin:-24px -24px 24px;
      padding-left:24px;
      border-bottom:1px solid #eee;
      /deep/.title{
        width: calc(100% - 80px);
        h3{
          display: inline-block;
        }
        div{
          margin-left: 24px;
          display: inline-block;
          font-size: 12px;
          color: #657180;
          button{
            width: 42px;
            height: 22px;
            border: 1px solid #4A6AF5;
            color: #4A6AF5;
            padding: unset;
            margin-left: 5px;
          }
        }
      }
    }
    /deep/.data-list-search {
      // padding: 16px 16px 2px;
      // margin-right: 0;
      // margin-bottom: 24px;
      // background-color: #f8f9fd;

      .data-list-search-item {
        &:nth-child(2) {
          .ivu-select-item {
            width: 210px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        &:nth-child(3) {
          .ivu-select {
            width: 100px;
          }
        }
        & > span:not(.date-line) {
          width: auto;
        }
      }
    }
    .ivu-table-wrapper {
      // padding-bottom: 80px;
      /deep/table {
        tr:not(.ivu-table-row) .ivu-table-expanded-cell {
          padding: 20px 1.74%;
          background: #f8f9fd;
        }
        tr.ivu-table-row td {
          /*&.supplier-list-deal-time .ivu-table-cell {*/
            /*display: block;*/
          /*}*/
          /*&:last-child .ivu-table-cell {*/
            /*padding: 0;*/
          /*}*/
        }
        /*tr th:nth-child(1) .ivu-table-cell {*/
          /*padding: 0;*/
        /*}*/
        tr td > div.ivu-table-cell-with-expand {
          display: none;
        }
        // .ivu-table-row {
        //   position: relative;
        // }
      }
    }
  }
  /*/deep/.common-table-noborder .ivu-table-cell {*/
    /*padding: 0 !important;*/
    /*margin-left: 14px;*/
  /*}*/
  /deep/.ivu-page {
    /deep/.ivu-page-options {
      margin-top: -4px;
    }
  }
</style>
