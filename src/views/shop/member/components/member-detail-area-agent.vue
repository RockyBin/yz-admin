<template>
  <div class="areaAgent-container">
    <!-- 头部 -->
    <div class="member-detail-agent-head">
      <div class="member-detail-agent-head-left">
        <div
          class="member-detail-agent-head-image"
          :style="`background-image: url(${getHeadImg(areaInfo.member_info.headurl)});`"
        ></div>
        <div class="member-detail-agent-head-info">
          <div>昵称：{{areaInfo.member_info.nickname}}</div>
          <div>姓名：{{areaInfo.member_info.name || "--"}}</div>
          <div>会员ID：{{areaInfo.member_info.id}}</div>
          <div>手机号：{{areaInfo.member_info.mobile}}</div>
        </div>
      </div>
      <div class="member-detail-agent-head-right">
        <div class="member-detail-agent-head-item">
          <titlebar title="区域代理订单概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>总订单数：</span>
              {{areaInfo.order_count.order_num || 0}}笔
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>总订单金额：</span>
              ￥{{areaInfo.order_count.order_money}}
            </div>
          </div>
        </div>
        <div class="member-detail-agent-head-item">
          <titlebar title="区域代理返佣概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>返佣总收益：</span>
              ￥{{areaInfo.commission.commission_total}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>可提现返佣：</span>
              ￥{{areaInfo.commission.commission_balance}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>预计到账返佣：</span>
              ￥{{areaInfo.commission.commission_unsettled}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>提现中返佣：</span>
              ￥{{areaInfo.commission.commission_check}}
            </div>
          </div>
        </div>
        <div class="member-detail-agent-head-item">
          <titlebar title="代理区域">
            <div
              slot="areaTitle"
              style="display:inline-block;marginLeft:7px;fontSize: 14px;fontWeight:700"
              v-if="areaInfo.area_agent_list[0].area_type > 8 && (areaInfo.area_agent_list.length > 1 || areaInfo.area_agent_list[0].provide.length > 0)"
            >
              (
              <span>共{{areaAgentCount.cityCount + areaAgentCount.distriyCount}}人/</span>
              <span
                v-if="areaInfo.area_agent_list[0].area_type > 9"
              >市代{{areaAgentCount.cityCount}}人/</span>
              <span>区代{{areaAgentCount.distriyCount}}人</span>)
            </div>
          </titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-flex">
              <Collapse accordion v-model="collapseSelectArray">
                <!-- 多身份代理 -->
                <Panel
                  :hide-arrow="true"
                  style="paddingBottom:10px"
                  :name="(index + 1).toString()"
                  v-for="(item,index) in areaInfo.area_agent_list"
                  :key="item.id"
                >
                  <collapse-item
                    :style="{'cursor': item.provide.length > 0 ? 'pointer' : 'default','marginLeft': item.provide.length == 0 && onStyleText(areaInfo.area_agent_list) ? '20px' : ''}"
                    :iconStatus="item.provide.length > 0"
                    :iconSelectStatus="collapseSelectArray.includes((index + 1).toString())"
                    :areaType="item.area_type"
                    :areaText="getAreaAgentText(item)"
                    :areaAgentId="item.id"
                    :cityCount="item.sub_count.city_count"
                    :districtCount="item.sub_count.district_count"
                    :areaItem="item"
                    @onChangeAreaType="onChangeAreaType"
                  ></collapse-item>
                  <div slot="content" v-show="item.provide.length">
                    <collapse-item
                      v-for="(v,k) in item.provide"
                      :key="k"
                      :areaType="v.area_type"
                      :areaText="getAreaAgentText(v)"
                      :cityCount="v.sub_count.city_count"
                      :districtCount="v.sub_count.district_count"
                      @onChangeAreaType="onChangeAreaType"
                      :areaItem="v"
                      :areaAgentId="v.id"
                    ></collapse-item>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="member-detail-agent-content">
      <!-- 筛选搜素部分 -->
      <div class="member-detail-agent-search" v-show="areaInfo.area_agent_list[0].area_type > 8">
        <search-list
          ref="searchList"
          :searchParams="searchParams"
          @on-change="onSearchSelectChange"
          :search-data="searchData"
          :onLine="true"
        />
      </div>
      <!--代理区域 团队人数头部数据 -->
      <div class="member-detail-team-title" v-show="areaInfo.area_child_list.area_type > 8">
        <titlebar title="代理区域"></titlebar>
        <div class="member-detail-area-agent-box">
          <span>{{getAreagentLevelText(areaInfo.area_child_list.area_type)}}</span>
          <span>{{areaInfo.area_child_list.area_text}}</span>
        </div>
        <div
          class="member-detail-area-agent-box area-agent-type"
          :class="activeTabIndex== index ? 'area-agent-box-active' : ''"
          @click="changeAreaAgentList(index,item.area_type)"
          v-for="(item,index) in areaInfo.area_child_list.tabsHeaderList"
          :key="index"
        >
          <div style="dispaly:inline-block">
            <span>{{item.type_text}}</span>
            <span class="area-agent-count">{{item.num}}</span>&nbsp;人
          </div>
        </div>
      </div>
      <!-- 表格部分 -->
      <common-table
        v-show="areaInfo.area_agent_list[0].area_type > 8"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="areaAgentListArray"
      ></common-table>
      <div class="bar-pager">
        <Page
          v-show="areaAgentListArray.length && areaInfo.area_agent_list[0].area_type > 8"
          :total="total"
          :page-size="pageSize"
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          show-elevator
          class="page-style"
          :transfer="true"
        />
      </div>
    </div>
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import searchList from "@/views/shop/components/search/search-list.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import cityData from "@/views/shop/components/cityDataThree";
import collapseItem from "./member-area-agent-collapse";
const getNewArea = list => {
  return list.map(item => {
    let item1 = { ...item };
    item1.id = item1.value;
    item1.value = item1.label;
    return item1;
  });
};
let province = getNewArea(cityData[0].provinceArr);
export default {
  components: {
    titlebar,
    searchList,
    commonTable,
    memberInfor,
    collapseItem
  },
  props: {
    areaInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    areaAgentCount: {
      type: Object,
      default() {
        return null;
      }
    },
    tabIndex: {
      type: String
    }
  },
  inject: ["target"],
  data() {
    return {
      collapseSelectArray: [], //多身份代理信息展开状态
      area_agent_id: "", //区域代理id
      params_area_agent: {}, //身份切换时的数据
      defaultImg: require("../../images/head-portrait.png"),
      searchParams: [
        //搜素筛选数据细信息
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword", //绑定的数据键名
          placeholder: "会员昵称/手机号"
        }
        // {
        //   type: 3,
        //   key: "area_type",
        //   name: "区域级别：",
        //   width:160,
        //   options: [
        //     { id: -1, value: "全部" },
        //     { id: 10, value: "省代"},
        //     { id: 9, value: "市代"},
        //     { id: 8, value: "区代"}
        //   ]
        // },
        // {
        //   type: 3,
        //   key: "province",
        //   combine: "agentarea",
        //   name: "代理区域：",
        //   placeholder: "请选择省",
        //   width:160,
        //   options: [{ id: -1, value: "所有省份" }, ...province]
        // },
        // {
        //   type: 3,
        //   key: "city",
        //   width:160,
        //   combine: "agentarea",
        //   placeholder: "请选择市",
        //   options: [{ id: -1, value: "所有城市" }]
        // },
        // {
        //   type: 3,
        //   key: "area",
        //   width:160,
        //   combine: "agentarea",
        //   placeholder: "请选择区/县",
        //   options: [{ id: -1, value: "所有区/县" }]
        // }
      ],
      searchData: {
        keyword: ""
        // area_type: "",
        // area: -1,
        // province: -1,
        // city: -1
      },
      columnsData: [
        {
          title: "区域信息",
          width: 340,
          render(h, params) {
            return h(memberInfor, {
              props: {
                id: Number(params.row.member_id),
                headurl: params.row.headurl,
                nickname: params.row.nickname,
                mobile: params.row.member_mobile,
                name: params.row.name || "--"
              }
            });
          }
        },
        {
          title: "级别/区域",
          key: "area_text"
        }
      ],
      tableLoading: false, //表格加载状态
      areaAgentListArray: [],
      activeTabIndex: 0,
      total: 10,
      currentPage: 1,
      pageSize: 20
    };
  },
  watch: {
    searchData: {
      //监听搜索的数据条件
      handler(value) {
        this.page = 1;
        this.getAreaAgentList();
      },
      deep: true
    },
    params_area_agent: {
      //监听搜索的数据条件
      handler(value) {
        this.searchData.area_type = this.params_area_agent.area_type;
        this.getAreaAgentList();
      },
      deep: true
    }
  },
  methods: {
    resetData(id) {
      //初始化数据及获取代理id
      this.area_agent_id = id;
      this.currentPage = 1;
      this.areaAgentListArray = [];
      this.searchData = {
        keyword: ""
        // area_type: -1,
        // area: -1,
        // province: -1,
        // city: -1
      };
    },
    getAreagentLevelText(value) {
      //判断代理身份
      if (value == 10) {
        return "省代：";
      } else if (value == 9) {
        return "市代：";
      } else {
        return "区代：";
      }
    },
    getAreaAgentText(obj) {
      //处理代理身份文字拼接
      let area_text;
      if (obj.area_type == 8) {
        area_text =
          obj.prov_text + "-" + obj.city_text + "-" + obj.district_text;
      } else if (obj.area_type == 9) {
        area_text = obj.prov_text + "-" + obj.city_text;
      } else {
        area_text = obj.prov_text;
      }
      return area_text;
    },
    changeAreaAgentList(index, type) {
      //切换区代身份人数时触发
      this.activeTabIndex = index;
      this.currentPage = 1;
      this.params_area_agent.area_type = type;
      this.getAreaAgentList();
    },
    getHeadImg(url) {
      //处理会员头像
      if (url) {
        if (!/^(http)/i.test(url)) {
          return this.$store.state.siteComdataPath + url;
        }
        return url;
      } else {
        return this.defaultImg;
      }
    },
    getAreaAgentList() {
      //获取下级代理列表数据
      this.tableLoading = true;
      if (!this.area_agent_id || this.areaInfo.area_agent_list[0].area_type < 9)    return;
      this.$httpPost(
        "/shop/admin/area/agent/sub/list",
        {
          member_id: this.$route.query.id,
          keyword: this.searchData.keyword ? this.searchData.keyword : "",
          area_type:
            this.params_area_agent.area_type == -1
              ? ""
              : this.params_area_agent.area_type,
          // area_type: (this.searchData.area_type && this.searchData.area_type != -1) ? this.searchData.area_type : "",
          // prov: this.searchData.province != -1 ? this.searchData.province : "",
          // city: this.searchData.city != -1 ? this.searchData.city : "",
          // district : this.searchData.area != -1 ? this.searchData.area : "",
          agent_id: this.params_area_agent.area_agent_id || this.area_agent_id,
          page: this.currentPage,
          page_size: this.pageSize
        },
        res => {
          if (res.code == 200) {
            this.tableLoading = false;
            if (res.data.list.lenght == 0) return;
            this.total = res.data.total ? res.data.total : 0;
            this.areaAgentListArray = res.data.list.map(item => {
              item.headurl = this.getHeadImg(item.headurl);
              item.area_text = this.getAreaAgentText(item);
              return { ...item };
            });
          } else {
            this.tableLoading = false;
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onSearchSelectChange(newData, oldData) {
      //搜索条件变化触发
      let provinceStatus = newData.province !== (oldData && oldData.province);
      let cityStatus = newData.city !== (oldData && oldData.city);
      // 如果是省或城市修改才需要改下拉框内容
      if (provinceStatus || cityStatus) {
        this.searchParams.forEach(item => {
          // 如果是修改了省才需要改市的选择
          if (provinceStatus && item.key === "city") {
            let options = [{ id: -1, value: "所有城市" }];
            let selectProvince = province.find(n => n.id === newData.province);
            if (selectProvince && selectProvince.children) {
              options.push(...getNewArea(selectProvince.children));
            }
            this.$set(item, "options", options);
            this.$set(newData, "city", -1);
            this.$set(newData, "area", -1);
          }
          // 不管是改省或市都需要更新市的选择
          if (cityStatus && item.key === "area") {
            let options = [{ id: -1, value: "所有区/县" }];
            let selectProvince = province.find(n => n.id === newData.province);
            if (selectProvince && selectProvince.children) {
              let selectCity = getNewArea(selectProvince.children).find(
                n => n.id === newData.city
              );
              if (selectCity && selectCity.children) {
                options.push(...getNewArea(selectCity.children));
              }
            }
            this.$set(item, "options", options);
            this.$set(newData, "area", -1);
          }
        });
      }
    },
    onStyleText(arry) {
      //处理样式对齐
      let s1,
        s2 = null;
      if (arry.length > 1) {
        arry.forEach(item => {
          if (item.provide.length > 0) {
            s1 = true;
          } else {
            s2 = true;
          }
        });
        return s1 && s2;
      }
    },
    onChangeAreaType(params) {
      this.params_area_agent = params;
      this.activeTabIndex = params.activeIndex;
      this.target.getAreaTabsArray(params.info);
    },
    onPageChange(value) {
      //列表页数切换触发
      this.currentPage = value;
      this.getAreaAgentList();
    },
    onPageSizeChange(value) {
      //当前页面显示数量改变触发
      this.pageSize = value;
      this.currentPage = 1;
      this.getAreaAgentList();
    }
  }
};
</script>

<style lang="less" scoped>
@border-color: #e9eaf2;
.areaAgent-container {
  padding: 24px;
  color: #464c5b;
  // 头部样式
  .member-detail-agent-head {
    display: flex;
    // margin-bottom: 30px;
    .member-detail-agent-head-left {
      width: 220px;
      height: 240px;
      box-sizing: border-box;
      text-align: center;
      padding-top: 20px;
      border: 1px solid @border-color;
      border-radius: 5px 0 0 5px;
      background-color: #fcfcfd;
      .member-detail-agent-head-image {
        width: 63px;
        height: 63px;
        border-radius: 5px;
        margin: 0 auto 12px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .member-detail-agent-head-info {
        line-height: 22px;
        text-align: left;
        font-size: 13px;
        padding: 0 20px;
        color: #657180;
        & > div {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .member-detail-agent-head-right {
      display: flex;
      width: calc(100% - 200px);
      height: 240px;
      .member-detail-agent-head-item {
        padding-left: 16px;
        border: 1px solid @border-color;
        border-left: none;
        /deep/.vertical-line-titlebar-wrapper {
          font-size: 14px;
          margin-bottom: 15px;
          margin-top: 10px;
        }
        &:nth-child(1) {
          width: 250px;
        }
        &:nth-child(2) {
          width: 252px;
        }
        &:nth-child(3) {
          flex: 1;
        }
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        .member-detail-agent-head-item-content {
          padding: 0 0 0 14px;
          .member-detail-agent-head-item-line {
            color: #657180;
            line-height: 28px;
            .notice-text {
              margin-top: -2px;
            }
          }
        }
      }
      .member-detail-agent-head-item-flex {
        height: 180px;
        overflow-y: auto;
        display: flex;
        & > div {
          min-width: 395px;
        }
        /deep/.ivu-collapse {
          border: none;
          padding: 0;
          background-color: #fff;
          .ivu-collapse-item {
            border: none;
            .ivu-collapse-header {
              height: 28px;
              line-height: 28px;
              padding: 0;
              border-bottom: none;
              color: #464c5b;
            }
          }
        }
        /deep/.ivu-collapse-content-box {
          padding: 0;
          margin-left: 5px;
        }
      }
    }
  }
  .member-detail-agent-search {
    padding: 24px 0 8px;
  }
  .member-detail-area-agent-box {
    display: inline-block;
    color: #657180;
    line-height: 28px;
    margin: 0 0 0 10px;
    &.area-agent-type {
      &:hover {
        cursor: pointer;
      }
      .area-agent-count {
        text-decoration: underline;
      }
    }
  }
  .area-agent-box-active {
    color: #2d8cf0;
  }
  .member-detail-team-title {
    display: flex;
    align-items: center;
    height: 58px;
    border: 1px solid #dcdee2;
    padding-left: 18px;
    margin-bottom: 20px;
    & > div {
      margin: 0 0 0 10px;
    }
  }
  /deep/.page-style.ivu-page {
    text-align: right;
    line-height: 56px;
  }
}
</style>