<template>
  <div class="member-list">
    <search-list
      ref="searchList"
      :searchParams="searchParams"
      :searchData="searchData"
      class="marketing-search"
    ></search-list>
    <div class="member-list-content">
      <common-table
        ref="memberTable"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
      ></common-table>
    </div>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="page"
        :page-size="page_size"
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
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const initialSearchData = {
  searchType: "0",
  keyword: "", //模糊查询关键字
  subscribe_time: {
    // 注册时间
    startTime: "",
    endTime: ""
  },
  status: "-1" // 账号状态
};
export default {
  components: { searchList, commonTable },
  data() {
    return {
      buttonLoading: false,
      tableLoading: true,
      constants,
      //底部table展示数据
      columnsData: [
        {
          title: "粉丝信息",
          align: "left",
          minWidth: 350,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: params.row.openid,
                idname: "OpenID",
                goDetail: false,
                memberId: Number(params.row.member_id),
                headurl: params.row.headimgurl
                  ? params.row.headimgurl
                  : require("../images/head-portrait.png"),
                nickname: params.row.nickname,
                mobile: params.row.mobile ? params.row.mobile : "--"
              }
            });
          }
        },
        {
          title: "邀请人信息",
          align: "left",
          minWidth: 250,
          render: (h, params) => {
            return h("div", [
              h(memberInfor, {
                style: { display: params.row.invite_id ? "block" : "none" },
                props: {
                  id: Number(params.row.invite_id),
                  headurl: params.row.invite_headurl
                    ? this.getHeadImg(params.row.invite_headurl)
                    : require("../images/head-portrait.png"),
                  nickname: params.row.invite_nickname,
                  mobile: params.row.invite_mobile?params.row.invite_mobile:"--",
                    name:params.row.invite_name || "--"
                }
              }),
              h(
                "div",
                {
                  style: { display: !params.row.invite_id ? "block" : "none" }
                },
                "总店"
              )
            ]);
          }
        },
          {
              title: "所属员工",
              align: "left",
              minWidth: 110,
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
          title: "关注公众号时间",
          key: "subscribe_time",
          minWidth: 150,
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                params.row.subscribe==1?params.row.subscribe_time:"未关注公众号"
              )
            ]);
          }
        },
		    {
          title: "注册会员时间",
          key: "register_at",
          minWidth: 150,
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                params.row.register_at ? params.row.register_at:"未注册会员"
              )
            ]);
          }
        },
        {
          title: "绑定状态",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: params.row.has_bind ?"#589A0A":"#F5222D",
                  "background-color": params.row.has_bind ?"#E1FBC3":"#FFF1F0",
                  border: params.row.has_bind ?"1px solid #78C122":"1px solid #FFA39E",
                  width: "52px",
                  height: "22px",
                  "line-height": "22px",
                  "text-align": "center",
                  "border-radius": "4px"
                }
              },
              params.row.has_bind ? "已绑定" : "未绑定 "
            );
          }
        }
      ],
      listData: [], // 列表数据
      searchData: Object.assign({}, initialSearchData,{
          keyword: this.$route.query.keyword || "",
          searchType: this.$route.query.search_type?this.$route.query.search_type==1?"1":this.$route.query.search_type:"0",
      }),
      page_size: 10, // 每页显示数量
      page: 1, // 页码
      total: 10, // 总数
      //头部查询模块参数数据
      searchParams: [
        {
          type: 10,
          key: "keyword",
            placeholder: {
                0:"昵称/手机号",
                1:"昵称/姓名/手机号",
                2:"姓名/手机号"
            },
          prefixIcon: "ios-search",
          optionKey: "searchType",
          options: [
            {
              id: "0",
              value: "粉丝"
            },
            {
              id: "1",
              value: "邀请人"
            },
              {
                  id: "2",
                  value: "员工"
              }
          ]
        },
        // {
        //   type: 3,
        //   name: "状态：",
        //   key: "status",
        //   options: [
        //     {
        //       id: "-1",
        //       value: "全部"
        //     },
        //     {
        //       id: "0",
        //       value: "未注册"
        //     },
        //     {
        //       id: "1",
        //       value: "已注册"
        //     }
        //   ]
        // },
        {
          type: 3,
          name: "绑定状态：",
          key: "status",
          options: [
            {
              id: "-1",
              value: "全部"
            },
            {
              id: "0",
              value: "未绑定"
            },
            {
              id: "1",
              value: "已绑定"
            }
          ]
        },
        {
          type: 2,
          name: "注册时间：",
          key: "subscribe_time"
        }
      ],
      commonFunction
    };
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.dealWithData();
  },
  watch: {
    searchData: {
      handler() {
        this.page = 1;
        this.dealWithData();
      },
      deep: true
    }
  },
  methods: {
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    // 处理提交的数据
    dealWithData() {
      let obj = {};
      if (this.searchData.subscribe_time.startTime) {
        obj.starttime = this.searchData.subscribe_time.startTime;
      } else {
        obj.starttime = "";
      }
      if (this.searchData.subscribe_time.endTime) {
        obj.endtime = this.searchData.subscribe_time.endTime;
      } else {
        obj.endtime = "";
      }
      obj.page = this.page;
      obj.page_size = this.page_size;
      obj.search_type = this.searchData.searchType;
      obj.keyword = this.searchData.keyword;
      obj.status = this.searchData.status;
      this.getList(obj);
    },
    // 分页
    changePage(val) {
      this.page = val;
      this.dealWithData();
    },
    // 条数
    changePageSize(val) {
      this.page = 1;
      this.page_size = val;
      this.dealWithData();
    },
    // 判断是否全选
    onCheckAllChange(val) {
      this.checkedAll = !val;
      if (this.checkedAll) {
        this.listData.forEach((item, index) => {
          if (this.rowChecked.indexOf(index) === -1) {
            this.rowChecked.push(item.id);
          }
        });
      } else {
        this.rowChecked = [];
      }
    },
    // 获取列表数据
    getList(obj) {
      this.tableLoading = true;
      this.$httpGet("/shop/admin/member/fans/list", obj, res => {
        this.$store.state.COMMON_loading = false;
        this.tableLoading = false;
        if (res.code === 200) {
          this.listData = res.data.list;
          this.total = Number(res.data.total);
          this.page_size = Number(res.data.page_size);
          this.page = Number(res.data.current);
        } else {
          this.$Message.error(res.msg);
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.member-list {
  position: relative;
  padding: 24px 24px 0;
  height: 100%;
  overflow: auto;
  .marketing-search {
    /deep/.data-list-search-btn {
      display: inline-block;
      margin-bottom: 0;
    }
    /deep/.data-list-search-item:nth-child(5) {
      .ivu-select {
        width: 100px;
      }
    }
  }
  .member-list-content {
    /deep/.table-container {
      height: 80px;
    }
  }
  /deep/.show-active {
    .show-transform {
      transform: rotate(90deg);
      -ms-transform: rotate(90deg);
      -moz-transform: rotate(90deg);
      -webkit-transform: rotate(90deg);
      -o-transform: rotate(90deg);
    }
  }
  /deep/.ivu-cascader-arrow {
    left: 168px;
  }
  /deep/.ivu-tabs-nav {
    margin-left: 24px;
  }
  /deep/.ivu-tabs-bar {
    margin-bottom: 20px;
  }
  /deep/.ivu-tabs-tabpane {
    text-align: left;
    padding: 0 24px;
  }
  .marketing-search {
    /deep/.data-list-search-item:nth-child(5) {
      .ivu-select {
        width: 100px;
      }
    }
    .data-list-search-btn {
      display: inline-block;
    }
  }
  /deep/.ivu-table-column-center:last-child .ivu-table-cell {
    padding: 0;
  }
  /deep/.show-underLine:hover {
    text-decoration: underline;
  }
  /deep/.ivu-checkbox-focus {
    box-shadow: 0 0 0 1px rgba(74, 106, 245, 0.2);
  }
}
.common-modal-style {
  /deep/.ivu-input-wrapper {
    margin-right: 5px;
    width: auto;
  }
}
</style>
