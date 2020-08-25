<template>
  <Modal
    v-model="showModal"
    title="设置新的推荐人"
    class="member-detail-modal-invite"
    width="648"
    :mask-closable="false"
    :footer-hide="true"
    :loading="loading"
  >
    <div class="member-detail-modal-invite-head">
      <div>
        <verticalLineTitlebar :title="'会员信息'"/>
        <div class="member-detail-base-head-info">
          <div
            class="member-detail-base-avator"
            :style="`background-image: url(${getHeadImg(dataInfo.headurl)});`"
          ></div>
          <div class="member-detail-base-head-msg">
            <div>昵称：{{dataInfo.nickname}}</div>
            <div>姓名：{{dataInfo.name||'--'}}</div>
            <div>手机：{{dataInfo.mobile}}</div>
            <div>ID：{{dataInfo.id}}</div>
          </div>
        </div>
      </div>
      <div style="margin-left: 20px;padding-left: 13px;">
        <verticalLineTitlebar :title="'原推荐人'"/>
        <div class="member-detail-base-head-info" v-if="dataInfo.parent_nickname">
          <div
                  class="member-detail-base-avator"
                  :style="`background-image: url(${getHeadImg(dataInfo.parent_headurl)});`"
          ></div>
          <div class="member-detail-base-head-msg">
            <div>昵称：{{dataInfo.parent_nickname}}</div>
            <div>姓名：{{dataInfo.parent_name||'--'}}</div>
            <div>手机：{{dataInfo.parent_mobile}}</div>
            <div>ID：{{dataInfo.parent_id}}</div>
          </div>
        </div>
        <div class="member-detail-base-head-info" v-else>{{!dataInfo.invite1 && !dataInfo.has_bind_invite ? '--' : '总店'}}</div>
      </div>
      <div class="member-detail-modal-invite-btn" @click="onSetInviteClick()">设&lt;总店&gt;为推荐人</div>
    </div>
    <div>
      <search-list ref="searchList" :searchParams="searchParams" @getChangeLevel="getChangeLevel" :search-data="searchData" />
    </div>
    <common-table
      :hasBorder="true"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
      :height="300"
    ></common-table>
    <Page
      style="text-align: right;margin: 20px 10px -4px 0;"
      :total="total"
      size="small"
      :page-size="pageSize"
      :current="currentPage"
      @on-change="getPageChange"
      @on-page-size-change="onPageSizeChange"
      show-elevator
    />
  </Modal>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
const searchData = {
  keyword: "",
  level: -1,
    level_type:"1"
};
export default {
  components: {
    searchList,
    commonTable,
      verticalLineTitlebar
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    dataInfo: {
      type: Object,
      default() {
        return null;
      }
    },
  },
  data() {
    return {
      showModal: false,
      loading: true,
      defaultImg: require("../../images/head-portrait.png"),
      tableLoading: false,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      columnsData: [
        {
          title: "会员信息",
          align: "left",
          width: 268,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  paddingRight: "28px",
                }
              },
              [
                h("img", {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  attrs: {
                    src: params.row.headurl
                      ? this.getHeadImg(params.row.headurl)
                      : require("@/views/shop/images/head-portrait.png")
                  },
                  style: {
                    width: "44px",
                    height: "44px",
                    "vertical-align": "middle",
                    display: "inline-block",
                    marginRight: "12px"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      display: "inline-block",
                      "vertical-align": "middle",
                      width: "calc(100% - 56px)"
                    }
                  },
                  [
                    h("div", "昵称：" + params.row.nickname),
                      params.row.name?h("div", "姓名：" + params.row.name):h("div", "姓名：--"),
                      params.row.mobile?h("div", "手机：" + params.row.mobile):h("div", "手机：--"),
                    h("div", "ID：" + params.row.id)
                  ]
                )
              ]
            );
          }
        },
        {
          title: "等级",
          align: "left",
          width: 200,
          render: (h, params) => {
            let paramArray = [];
            paramArray.push(
              h("div", "会员：" + (params.row.level_name || "--"))
            );
            this.hasLicensePerm("ENABLE_DISTRIBUTION") && params.row.is_distributor && params.row.distribution_level_name &&
              paramArray.push(
                h("div", "分销商：" + params.row.distribution_level_name)
              );
            this.hasLicensePerm("ENABLE_AGENT") && params.row.agent_level_name &&
              paramArray.push(h("div", "代理商：" + params.row.agent_level_name));
              this.hasLicensePerm("ENABLE_CLOUDSTOCK") && params.row.dealer_level_name &&
              paramArray.push(h("div", "经销商：" + params.row.dealer_level_name));
            return h("div", paramArray);
          }
        },
        {
          title: "",
          align: "left",
          renderHeader: h => {
            return h("div");
          },
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                    ghost: true
                  },
                  style: {
                    fontSize: "12px"
                  },
                  on: {
                    click: () => {
                      this.onSetInviteClick(params.row);
                    }
                  }
                },
                "设为推荐人"
              )
            ]);
          }
        }
      ],
      listData: [],
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机号"
        },
          {
              type: 12,
              key: "level",
              optionKey: "level_type",
              options:[],
              optionsType: [
                  {
                      id: "1",
                      value: "会员等级"
                  },
                  this.hasLicensePerm("ENABLE_DISTRIBUTION")?{
                      id: "2",
                      value: "分销商等级"
                  }:null,
                  this.hasLicensePerm("ENABLE_AGENT")?{
                      id: "3",
                      value: "代理商等级"
                  }:null,
                  this.hasLicensePerm("ENABLE_CLOUDSTOCK")?{
                      id: "4",
                      value: "经销商等级"
                  }:null
              ]
          },
        // {
        //   type: 3,
        //   key: "level",
        //   placeholder: "请选择会员等级",
        //   name: "",
        //   options: getLevelData("会员全部等级")
        //
        // },
        // this.hasLicensePerm("ENABLE_DISTRIBUTION") ? {
        //   type: 3,
        //   key: "distributorLevel",
        //   placeholder: " 请选择分销等级",
        //   name: "",
        //   options: getLevelData("分销商全部等级")
        // } : null
      ].filter(item => item),
      searchData: Object.assign({}, searchData)
    };
  },
  watch: {
    value(val) {
      this.showModal = val;
      if (val) {
        this.total = 0;
        this.currentPage = 1;
        this.listData = [];
          this.searchData = Object.assign({}, searchData);
      }
    },
    showModal(val) {
      this.$emit("input", val);
    },
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    }
  },
  methods: {
    getPageChange(val) {
      this.currentPage = val;
      this.getList();
    },
    onPageSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList();
    },
    /**
     * 获取头像
     */
    getHeadImg(url) {
      if (url) {
        if (!/^(http)/i.test(url)) {
          url = this.$store.state.siteComdataPath + url;
        }
        return url;
      }
      return this.defaultImg;
    },
    onSetInviteClick(val = { id: 0, nickname: "总店" }) {
      this.$Modal.confirm({
        title: "提示",
        loading: true,
        content: `是否确定将【${val.nickname}】设置为【${this.dataInfo.nickname}】的推荐人？`,
        onOk: () => {
          this.editData(val);
        }
      });
    },
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/member/list",
        {
          keyword: this.searchData.keyword,
          level: this.searchData.level,
          level_type: this.searchData.level_type,
          no_member_id: this.$route.query.id,
          exclude_member_id: this.dataInfo.invite1,
          page: this.currentPage,
          page_size: this.pageSize
        },
        res => {
          this.tableLoading = false;
          if (res.code === 200) {
              if (this.searchData.level_type==1){
                  this.getChangeLevel(1);
              }
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.listData = res.data.list;
            this.$el.querySelector(".ivu-table-overflowY") &&
              this.$el.querySelector(".ivu-table-overflowY").scrollTo(0, 0);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
      //获取搜索列表所选等级
      getChangeLevel(val){
          this.$httpGet("/shop/admin/member/level/type/list", {type:val}, res => {
              if (res.code === 200) {
                  this.$nextTick(() => {
                      let arrs = [
                          {
                              id: -1,
                              value: "全部"
                          }
                      ];
                      for (let i = 0; i < res.data.length; i++) {
                          arrs.push({
                              id: res.data[i].id,
                              value: res.data[i].name
                          });
                      }
                      this.$set(this.searchParams[1], "options", arrs);
                      if (this.$refs["searchList"].searchDataCopy.level_type!=val){
                          this.$set(this.$refs["searchList"].searchDataCopy,"level",-1)
                          this.$set(this.$refs["searchList"].searchDataCopy, "level_type", val);
                      }
                  });
              } else {
                  this.$Message.error(res.msg);
              }
          });
      },
    editData(val) {
      this.$httpPost(
        "/shop/admin/member/edit",
        {
          id: this.$route.query.id,
          parent_id: val.id
        },
        res => {
          this.$Modal.remove();
          if (res.code === 200) {
              this.$Message.success("设置成功");
            this.$Modal.remove();
            this.showModal = false;
            // this.target.distributorInfo = {};
            this.$set(this.dataInfo, "invite1", val.id);
            if (val.id){
                this.$set(this.dataInfo, "parent_nickname", val.nickname);
                this.$set(this.dataInfo, "parent_name", val.name);
                this.$set(this.dataInfo, "parent_mobile", val.mobile);
                this.$set(this.dataInfo, "parent_headurl", val.headurl);
                this.$set(this.dataInfo, "parent_id", val.id);
				this.$set(this.dataInfo, "has_bind_invite", 1);
            }else{
                this.$set(this.dataInfo, "parent_nickname", null);
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.member-detail-modal-invite {
  /deep/.data-list-search {
    margin-top: 24px;
    .ivu-btn {
      margin-right: 0px;
    }
    .data-list-search-item .ivu-select {
      width: 140px;
    }
  }
  .member-detail-modal-invite-head {
    position: relative;
    display: flex;
    padding: 15px;
    border-radius: 5px;
    font-size: 13px;
    background-color: #f7f8fd;
    &>div:nth-child(2){
      position: relative;
      &::before{
        content: '';
        width: 1px;
        height: 106px;
        background-color: #DCDEE2;
        position: absolute;
        left: 0;
        top: 15px;
      }
    }
    .member-detail-base-avator {
      width: 60px;
      height: 60px;
      border-radius: 5px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
    .member-detail-base-head-info {
      display: flex;
      /*align-items: flex-end;*/
      padding-left: 0;
      margin-top: 9px;
      .member-detail-base-head-msg {
        margin-left: 13px;
        font-size: 12px;
        color: #657180;
        width: calc(100% - 80px);
        &>div{
          line-height: 20px;
        }
        &>div:first-child,&>div:nth-child(1){
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 150px;
        }
      }
    }
    .member-detail-modal-invite-avator {
      width: 60px;
      height: 60px;
      border-radius: 5px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
    .member-detail-modal-invite-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 12px;
      & > div:first-child {
        margin-bottom: 5px;
      }
      span:first-child {
        font-weight: bold;
      }
    }
    .member-detail-modal-invite-btn {
      position: absolute;
      right: 22px;
      top: 30px;
      transform: translateY(-50%);
      width: 136px;
      height: 32px;
      line-height: 32px;
      border-radius: 5px;
      text-align: center;
      background-color: #ec8f1d;
      color: #fff;
      cursor: pointer;
    }
  }
}
</style>
