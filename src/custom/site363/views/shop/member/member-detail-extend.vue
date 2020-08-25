<template>
  <div class="member-detail" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" class="member-detail-tabs" :animated="false" name="memberDetail">
      <TabPane
      :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `基础信息`)}"
      :name="tabChangeArray[0]"
      >
        <detail-base v-model="memberInfo" :configInfo="settingConfig"></detail-base>
      </TabPane>
      <TabPane
      v-if="hasLicensePerm('ENABLE_DISTRIBUTION')"
      :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, isDistributor ? `分销概况` : `会员概况`)}"
      :name="tabChangeArray[1]"
      >
        <detail-distribute
        ref="detailDistribute"
        :tabIndex="tabChangeFlag"
        v-model="distributorInfo"
        :configInfo="settingConfig"
        ></detail-distribute>
      </TabPane>
      <TabPane v-if="hasLicensePerm('ENABLE_AGENT') && isAgent"
      :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `代理概况`)}"
      :name="tabChangeArray[2]"
      >
        <detail-agent ref="detailAgent" v-model="agentInfo" :configInfo="settingConfig" :tabIndex="tabChangeFlag"></detail-agent>
      </TabPane>
      <TabPane v-if="open_operation_center"
      :label="() => {return $createElement('div', {class: 'primary-hover-normal-color'}, `运营中心`)}"
      :name="tabChangeArray[3]"
      >
        <detail-extend ref="detailExtend" v-model="extendInfo" ></detail-extend>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
  import detailBase from "./components/member-detail-base";
  import detailDistribute from "@/views/shop/member/components/member-detail-distribute";
  import detailAgent from "@/views/shop/member/components/member-detail-agent";
  import detailExtend from "./components/member-order-extend";
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
      detailExtend
    },
    data() {
      let tabNameArray = ["base", "distributor", "agent", "extend"];
      return {
        tabChangeArray: tabNameArray,
        tabChangeFlag: tabNameArray[0],
        settingConfig: null,
        memberInfo: {},
        distributorInfo: {},
        agentInfo: {},
        extendInfo: {
          member_id: 0,
        },
        open_operation_center: false,
      };
    },
    created() {
      if (!this.$route.query.id) return;
      this.extendInfo.member_id = this.$route.query.id;
      this.setTabSelect();
      this.getMemberData([this.getSettingConfig()]);
      this.getMemberExtendInfo();
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
          (this.memberInfo && this.memberInfo.is_distributor) ||
          (this.distributorInfo && this.distributorInfo.is_distributor) ||
          (this.agentInfo && this.agentInfo.is_distributor)
        );
      },
      isAgent() {
        return (
          (this.memberInfo && this.memberInfo.agent_level) ||
          (this.distributorInfo && this.distributorInfo.agent_level) ||
          (this.agentInfo && this.agentInfo.agent_level)
        );
      }
    },
    watch: {
      memberID(val) {
        if (val) {
          this.memberInfo = {};
          this.distributorInfo = {};
          this.agentInfo = {};
          this.extendInfo = {};
          this.setTabSelect();
          this.getMemberData();
        }
      },
      tabChangeFlag() {
        // 正在加载数据则直接返回
        if (this.$store.state.COMMON_loading) {
          return;
        }
        this.getMemberData();
      }
    },
    methods: {
      /**
       * 根据路由切换tab
       */
      setTabSelect() {
        // 根据query切换标签（这步有可能触发tabChangeFlag监听，需要在监听那里做拦截，防止多一次请求）
        if ([0, 1, 2].includes(parseInt(this.$route.query.tab))) {
          this.tabChangeFlag = this.tabChangeArray[
            parseInt(this.$route.query.tab)
            ];
        }
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
        data.push(!Object.keys(this.memberInfo).length ? [this.getMemberInfo] : []);
        // 第二个页面初始化需要的所有promise请求数据
        data.push(!Object.keys(this.distributorInfo).length ? [this.getDistributorInfo] : []);
        // 第三个页面初始化需要的所有promise请求数据
        data.push(!Object.keys(this.agentInfo).length ? [this.getAgentInfo] : []);
        data.push([]);
        if (data[this.tabIndex].length) {
          if (this.tabIndex === 1) {
            this.$nextTick(() => {
              this.$refs.detailDistribute && this.$refs.detailDistribute.resetData();
            });
          } else if (this.tabIndex === 2) {
            this.$nextTick(() => {
              this.$refs.detailAgent && this.$refs.detailAgent.resetData();
            });
          }
        }

        return data[this.tabIndex].map(item => item());
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
      // 扩展信息
      getMemberExtendInfo() {
        this.$httpPost(
          "shop/admin/custom/member/extend/info",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              this.open_operation_center = res.data.is_open_operation_center ? true : false;
            }
          }
        );
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
