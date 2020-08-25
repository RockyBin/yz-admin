<template>
  <div class="member-detail" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" class="member-detail-tabs" :animated="false" name="memberDetail">
      <TabPane
        :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `基础信息`)}"
        :name="tabChangeArray[0]"
        :index="0"
      >
        <detail-base v-model="memberInfo" :configInfo="settingConfig"></detail-base>
      </TabPane>
      <TabPane
        :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, hasLicensePerm('ENABLE_DISTRIBUTION') && isDistributor ? `分销概况` : `会员概况`)}"
        :name="tabChangeArray[1]"
        :index="1"
      >
        <!-- tabIndex为了解决tab标签切换几次后table头部宽度不对的问题（实在没办法在这里解决） -->
        <detail-distribute
          ref="detailDistribute"
          :tabIndex="tabChangeFlag"
          v-model="distributorInfo"
          :configInfo="settingConfig"
        ></detail-distribute>
      </TabPane>
      <TabPane
        v-if="hasLicensePerm('ENABLE_AGENT') && isAgent || tabIndex === 2"
        :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `代理概况`)}"
        :name="tabChangeArray[2]"
        :index="2"
      >
        <!-- tabIndex为了解决tab标签切换几次后table头部宽度不对的问题（实在没办法在这里解决） -->
        <detail-agent
          ref="detailAgent"
          v-model="agentInfo"
          :configInfo="settingConfig"
          :tabIndex="tabChangeFlag"
        ></detail-agent>
      </TabPane>
      <TabPane
        v-if="hasLicensePerm('ENABLE_CLOUDSTOCK') && isDealer || tabIndex === 3"
        :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `经销商概况`)}"
        :name="tabChangeArray[3]"
        :index="3"
      >
        <!-- tabIndex为了解决tab标签切换几次后table头部宽度不对的问题（实在没办法在这里解决） -->
        <detail-dealer
          ref="detailDealer"
          v-model="dealerInfo"
          :configInfo="settingConfig"
          :tabIndex="tabChangeFlag"
        ></detail-dealer>
      </TabPane>
      <!-- 区域代理概况 -->
      <TabPane
        v-if="hasLicensePerm('ENABLE_AREA_AGENT') && isAreaAgent || tabIndex === 4"
        :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `区域代理概况`)}"
        :name="tabChangeArray[4]"
        :index="4"
      >
        <detail-area-agent
          :areaInfo="areaAgentInfo"
          :areaAgentCount="areaAgentCount"
          :tabIndex="tabChangeFlag"
          ref="detailAreaAgent"
        ></detail-area-agent>
      </TabPane>
      <!-- 供应商概况 -->
      <TabPane
        v-if="hasLicensePerm('ENABLE_SUPPLIER') && isSupplier || tabIndex === 5"
        :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `供应商概况`)}"
        :name="tabChangeArray[5]"
        :index="5"
      >
        <detail-supplier v-model="supplierInfo" :tabIndex="tabChangeFlag" ref="detailSupplier"></detail-supplier>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import detailBase from "./components/member-detail-base";
import detailDistribute from "./components/member-detail-distribute";
import detailAgent from "./components/member-detail-agent";
import detailDealer from "./components/member-detail-dealer";
import detailAreaAgent from "./components/member-detail-area-agent";
import detailSupplier from "./components/member-detail-supplier";
export default {
  provide() {
    return {
      target: this
    };
  },
  components: {
    detailBase,
    detailDistribute,
    detailAgent,
    detailDealer,
    detailAreaAgent,
    detailSupplier
  },
  data() {
    let tabNameArray = [
      "base",
      "distributor",
      "agent",
      "dealer",
      "areaAgent",
      "supplier"
    ];
    return {
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[this.getTabSelect()],
      settingConfig: null,
      memberInfo: {},
      distributorInfo: {},
      agentInfo: {},
      dealerInfo: {},
      areaAgentInfo: {
        member_info: {},
        order_count: {},
        commission: {},
        area_agent_list: [
          {
            id: "",
            area_type: "",
            district_text: "",
            city_text: "",
            prov_text: "",
            member_id: "",
            sub_count: {},
            provide: []
          }
        ],
        area_child_list: {
          area_type: "",
          area_text: "",
          tabsHeaderList: []
        }
      },
      areaAgentCount: {
        cityCount: 0,
        distriyCount: 0
      },
      supplierInfo: {}
    };
  },
  created() {
    if (!this.$route.query.id) return;
    this.getMemberData([this.getSettingConfig()]);
  },
  computed: {
    memberID() {
      return this.$route.query.id;
    },
    tabIndex() {
      return this.tabChangeArray.findIndex(n => n === this.tabChangeFlag);
    },
    isDistributor() {
      return (
        (this.memberInfo && this.memberInfo.is_distributor === 1) ||
        (this.distributorInfo && this.distributorInfo.is_distributor === 1) ||
        (this.agentInfo && this.agentInfo.is_distributor === 1) ||
        (this.dealerInfo && this.dealerInfo.is_distributor === 1) ||
        (this.areaAgentInfo &&
          this.areaAgentInfo.member_info &&
          this.areaAgentInfo.member_info.is_distributor === 1) ||
        (this.supplierInfo && this.supplierInfo.is_distributor === 1)
      );
    },
    isAgent() {
      return (
        (this.memberInfo && this.memberInfo.agent_level) ||
        (this.distributorInfo && this.distributorInfo.agent_level) ||
        (this.agentInfo && this.agentInfo.agent_level) ||
        (this.dealerInfo && this.dealerInfo.agent_level) ||
        (this.areaAgentInfo &&
          this.areaAgentInfo.member_info &&
          this.areaAgentInfo.member_info.agent_level) ||
        (this.supplierInfo && this.supplierInfo.agent_level)
      );
    },
    isDealer() {
      return (
        (this.memberInfo && this.memberInfo.dealer_level) ||
        (this.distributorInfo && this.distributorInfo.dealer_level) ||
        (this.agentInfo && this.agentInfo.dealer_level) ||
        (this.dealerInfo && this.dealerInfo.dealer_level) ||
        (this.areaAgentInfo &&
          this.areaAgentInfo.member_info &&
          this.areaAgentInfo.member_info.dealer_level) ||
        (this.supplierInfo && this.supplierInfo.dealer_level)
      );
    },
    isAreaAgent() {
      return (
        (this.memberInfo && this.memberInfo.is_area_agent === 1) ||
        (this.distributorInfo && this.distributorInfo.is_area_agent === 1) ||
        (this.agentInfo && this.agentInfo.is_area_agent === 1) ||
        (this.dealerInfo && this.dealerInfo.is_area_agent === 1) ||
        (this.areaAgentInfo &&
          this.areaAgentInfo.member_info &&
          this.areaAgentInfo.member_info.is_area_agent === 1) ||
        (this.supplierInfo && this.supplierInfo.is_area_agent === 1)
      );
    },
    isSupplier() {
      return (
        (this.memberInfo && this.memberInfo.is_supplier === 1) ||
        (this.distributorInfo && this.distributorInfo.is_supplier === 1) ||
        (this.agentInfo && this.agentInfo.is_supplier === 1) ||
        (this.dealerInfo && this.dealerInfo.is_supplier === 1) ||
        (this.areaAgentInfo &&
          this.areaAgentInfo.member_info &&
          this.areaAgentInfo.member_info.is_supplier === 1) ||
        (this.supplierInfo && this.supplierInfo.is_supplier === 1)
      );
    }
  },
  watch: {
    memberID(val) {
      if (val) {
        this.memberInfo = {};
        this.distributorInfo = {};
        this.agentInfo = {};
        this.dealerInfo = {};
        this.supplierInfo = {
          member_info: {}
        };
        (this.areaAgentInfo = {
          member_info: {},
          order_count: {},
          commission: {},
          area_agent_list: [
            {
              id: 0,
              area_type: "",
              district_text: "",
              city_text: "",
              prov_text: "",
              member_id: "",
              sub_count: {},
              provide: []
            }
          ],
          area_child_list: {
            area_type: "",
            area_text: "",
            tabsHeaderList: []
          }
        }),
          (this.tabChangeFlag = this.tabChangeArray[this.getTabSelect()]);
        this.getMemberData();
      }
    },
    tabChangeFlag() {
      // 正在加载数据则直接返回
      if (this.$store.state.COMMON_loading) {
        return;
      }
      this.$router.replace({
        name: "memberDetail",
        query: {
          id: this.$route.query.id,
          tab: this.tabIndex
        }
      });
      this.getMemberData();
    }
  },
  methods: {
    /**
     * 根据路由切换tab
     */
    getTabSelect() {
      // 根据query切换标签（这步有可能触发tabChangeFlag监听，需要在监听那里做拦截，防止多一次请求）
      if ([0, 1, 2, 3, 4, 5].includes(parseInt(this.$route.query.tab))) {
        return parseInt(this.$route.query.tab);
      }
      return 0;
    },
    /**
     * 拉取数据（用于当前页面跳转）
     */
    getMemberData(moreArray = []) {
      // 当前页面需要加载的数据列表
      let pagePromise = this.getPromiseGet();
      // 如果没有数据请求则直接返回
      if (!moreArray.length && !pagePromise.length) {
        return;
      }

      this.$store.state.COMMON_loading = true;
      Promise.all([...moreArray, ...pagePromise])
        .catch(e => {
          this.$Message.error(e);
        })
        .finally(() => {
          this.$store.state.COMMON_loading = false;
        });
    },
    /**
     * 根据tab获取当前页面需要拉取的数据
     */
    getPromiseGet() {
      let data = [];
      // 第一个页面初始化需要的所有promise请求数据
      data.push(
        !Object.keys(this.memberInfo).length ? [this.getMemberInfo] : []
      );
      // 第二个页面初始化需要的所有promise请求数据
      data.push(
        !Object.keys(this.distributorInfo).length
          ? [this.getDistributorInfo]
          : []
      );
      // 第三个页面初始化需要的所有promise请求数据
      data.push(!Object.keys(this.agentInfo).length ? [this.getAgentInfo] : []);
      // 第四个页面初始化需要的所有promise请求数据
      data.push(
        !Object.keys(this.dealerInfo).length ? [this.getDealerInfo] : []
      );
      data.push(
        !Object.keys(this.areaAgentInfo.member_info).length
          ? [this.getAreaAgentInfo]
          : []
      );
      data.push(
        !Object.keys(this.supplierInfo).length ? [this.getSupplierInfo] : []
      );
      // 如果当前页面需要重新拉取数据，则是新切换会员的页面，需要把参数重置（列表需要）
      if (data[this.tabIndex] && data[this.tabIndex].length) {
        if (this.tabIndex === 1) {
          this.$nextTick(() => {
            this.$refs.detailDistribute &&
              this.$refs.detailDistribute.resetData();
          });
        } else if (this.tabIndex === 2) {
          this.$nextTick(() => {
            this.$refs.detailAgent && this.$refs.detailAgent.resetData();
          });
        } else if (this.tabIndex === 3) {
          this.$nextTick(() => {
            this.$refs.detailDealer && this.$refs.detailDealer.resetData();
          });
        } else if (this.tabIndex === 4) {
          this.$nextTick(() => {
            this.$refs.detailAreaAgent &&
              this.$refs.detailAreaAgent.resetData();
          });
        } else if (this.tabIndex === 5) {
          this.$nextTick(() => {
            this.$refs.detailSupplier && this.$refs.detailSupplier.resetData();
          });
        }
      }

      return data[this.tabIndex] ? data[this.tabIndex].map(item => item()) : [];
    },
    /**
     * 获取公共信息
     */
    getSettingConfig() {
      return new Promise((resolve, reject) => {
        this.$httpPost("/shop/admin/member/info/config", {}, res => {
          if (res.code === 200) {
            resolve();
            let data = res.data;
            // 筛除禁用的选项
            // data.member_level = data.member_level.filter(item => item.status);
            // data.distribution_level = data.distribution_level.filter(
            //   item => item.status
            // );
            this.settingConfig = data;
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 获取会员基础信息
     */
    getMemberInfo() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/member/info/data",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.memberInfo = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /**
     * 获取会员分销概况
     */
    getDistributorInfo() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/member/distributor/info",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.distributorInfo = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /**
     * 获取代理概况
     */
    getAgentInfo() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/member/agent/info",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.agentInfo = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /**
     * 获取经销商概况
     */
    getDealerInfo() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/member/dealer/info",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              resolve();
              let listData = res.data.levels;
              let hiddenObj = {};
              let hiddenData = [];
              // 筛选出基础等级的
              let showData = listData
                .filter(n => {
                  let status = !n.parent_id;
                  // 如果有上级则区分出来
                  if (!status) {
                    if (hiddenObj[n.parent_id]) {
                      hiddenObj[n.parent_id].push(n);
                    } else {
                      hiddenObj[n.parent_id] = [n];
                    }
                  }
                  return status;
                })
                .sort((a, b) => b.weight - a.weight);
              // 根据基础等级的顺序筛选出隐藏等级的
              showData.forEach(n => {
                if (hiddenObj[n.id]) {
                  hiddenData.push(
                    ...hiddenObj[n.id].sort((a, b) => b.weight - a.weight)
                  );
                }
              });
              res.data.levels = [].concat(showData, hiddenData);
              this.dealerInfo = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /**
     * 获取会员等级
     */
    getMemberLevel() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/member/level/list", null, res => {
          if (res.code === 200) {
            resolve();
            this.memberLevel = res.data.list.filter(item => item.status);
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 获取分销商等级
     */
    getDistributorLevel() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/distribution/level/list", null, res => {
          if (res.code === 200) {
            resolve();
            this.distributorLevel = (res.data || []).filter(
              item => item.status
            );
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 获取代理概况
     */
    getAreaAgentInfo() {
      //获取基础信息
      return new Promise((resolve, reject) => {
        this.$httpGet(
          "/shop/admin/area/agent/info",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.areaAgentInfo.member_info = res.data.member_info;
              this.areaAgentInfo.order_count = res.data.order_count;
              this.areaAgentInfo.commission = res.data.commission;
              let provideList = [];
              let cityList = [];
              let distriyList = [];
              res.data.area_agent_list.forEach(item => {
                if (item.area_type == 10) {
                  provideList.push(item);
                  this.areaAgentCount.cityCount += Number(
                    item.sub_count.city_count || 0
                  );
                  this.areaAgentCount.distriyCount += Number(
                    item.sub_count.district_count || 0
                  );
                } else if (item.area_type == 9) {
                  this.areaAgentCount.distriyCount += Number(
                    item.sub_count.district_count || 0
                  );
                  cityList.push(item);
                } else {
                  distriyList.push(item);
                }
              });
              this.areaAgentInfo.area_agent_list.splice(0, 1);
              provideList.length
                ? this.areaAgentInfo.area_agent_list.push({
                    ...provideList[0],
                    provide: this.setAreaList(provideList)
                  })
                : "";
              cityList.length
                ? this.areaAgentInfo.area_agent_list.push({
                    ...cityList[0],
                    provide: this.setAreaList(cityList)
                  })
                : "";
              distriyList.length
                ? this.areaAgentInfo.area_agent_list.push({
                    ...distriyList[0],
                    provide: this.setAreaList(distriyList)
                  })
                : "";
              this.getAreaTabsArray(res.data.area_agent_list[0]);
              this.$nextTick(() => {
                  this.$refs["detailAreaAgent"].resetData(res.data.area_agent_list[0].id);
              })
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /**
     * 获取供应商概况
     */
    getSupplierInfo() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/supplier/count",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.supplierInfo = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    /* 
      处理多人代理身份方法
     */
    setAreaList(array) {
      let newArr = [];
      if (array.length > 1) {
        array.reduce((current, prve) => {
          newArr.push(prve);
        });
      }
      return newArr;
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
    getAreaTabsArray(item) {
      let array = [];
      let total;
      this.areaAgentInfo.area_child_list.area_type = item.area_type;
      this.areaAgentInfo.area_child_list.area_text = this.getAreaAgentText(
        item
      );
      let city_count = item.sub_count.city_count
        ? item.sub_count.city_count * 1
        : 0;
      let district_count = item.sub_count.district_count
        ? item.sub_count.district_count * 1
        : 0;
      if (item.area_type > 9) {
        total = city_count + district_count;
        array.push({ type_text: "总：", num: total, area_type: -1 });
        array.push({ type_text: "市代：", num: city_count, area_type: 9 });
        array.push({ type_text: "区代：", num: district_count, area_type: 8 });
      } else if (item.area_type > 8) {
        array.push({ type_text: "区代：", num: district_count, area_type: 8 });
      }
      this.$set(this.areaAgentInfo.area_child_list, "tabsHeaderList", array);
    }
  }
};
</script>
<style lang="less" scoped>
.member-detail {
  min-width: 1080px;
  color: #464c5b;
  /deep/.member-detail-tabs.ivu-tabs {
    min-height: calc(100vh - 86px);
    & > .ivu-tabs-bar {
      margin-bottom: 0;
      padding: 0 24px;
    }
  }
}
</style>
