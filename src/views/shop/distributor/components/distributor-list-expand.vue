<template>
  <div class="distributor-list-expand">
    <!-- 头像和ID -->
    <div style="width: 13.03%;">
      <img
        :src="member_info.headurl || require('../../images/head-portrait.png')"
        alt
        style="width: 80px;height: 80px;borderRadius: 5px;marginBottom: 4px;"
      >
      <div>{{base_info.nickname}}</div>
      <div>手机号：{{member_info.mobile || ""}}</div>
      <div class="distributor-list-expand-line-color">ID：{{base_info.member_id}}</div>
    </div>
    <!-- 信息 -->
    <div style="width: 24.186%;box-sizing:border-box;padding: 0 1.86%;">
      <div class="distributor-list-expand-head">会员信息：</div>
      <div>
        <span class="distributor-list-expand-line-height">
          <div>会员等级：{{base_info.member_level_name || '---'}}</div>
          <div>会员状态：{{['冻结','正常'][member_info.status] || ''}}</div>
          <div>注册时间：{{member_info.created_at || ""}}</div>
          <div>终端来源：{{terminalArray[member_info.terminal_type] || (Object.keys(member_info).length ? "手工录入" : '')}}</div>
          <div>绑定微信：{{member_info.bind_weixin || ""}}</div>
          <div>所在城市：{{member_info.provname && member_info.cityname && member_info.areaname ? member_info.provname + member_info.cityname + member_info.areaname : ""}}</div>
          <div>性别：{{member_info.sex === 1 ? "男" : member_info.sex === 2 ? "女" : '保密'}}</div>
          <div>年龄：{{member_info.age || "--"}}</div>
        </span>
      </div>
    </div>
    <!-- 分割线 -->
    <div style="position: relative;height: 100%;">
      <div class="distributor-list-dotted-line"></div>
    </div>
    <!-- 会员信息 -->
    <div style="width: 24.65%;box-sizing:border-box;padding: 0 1.86%;">
      <div class="distributor-list-expand-head">分销商信息：</div>
      <div>
        <span class="distributor-list-expand-line-height">
          <div>成为分销商时间：{{base_info.passed_at || ""}}</div>
          <div>
            分销商等级：
            <Select
              not-found-text
              style="width: 150px;"
              transfer
              :value="base_info.level"
              @on-change="onDistributorLevelChange"
              perm="distributor.operate"
            >
              <Option :value="item.id" v-for="item in levelData" :key="item.id" perm="distributor.operate">{{item.name}}</Option>
            </Select>
          </div>
          <div>
            推荐人：
            <Button
              style="width: 150px;"
              @click="onChangeParentDistributor"
              perm="distributor.operate"
            >{{parent_info.nickname || '总店'}}</Button>
          </div>
        </span>
      </div>
    </div>
    <!-- 分割线 -->
    <div style="position: relative;height: 100%;">
      <div class="distributor-list-dotted-line"></div>
    </div>
    <!-- 分销情况 -->
    <div style="width: 22.33%;box-sizing:border-box;padding: 0 0 0 1.86%;">
      <div class="distributor-list-expand-head">分销情况：</div>
      <div>
        <span class="distributor-list-expand-line-height">
          <div>佣金总收益：￥{{base_info.total_commission}}</div>
          <div>团队总付款：{{base_info.subordinate_buy_times+"次/￥"+base_info.subordinate_buy_money}}</div>
          <div>团队总成交：{{base_info.subordinate_deal_times+"次/￥"+base_info.subordinate_deal_money}}</div>
          <div>一级分销团队付款：{{base_info.directly_under_buy_times+"次/￥"+base_info.directly_under_buy_money}}</div>
          <div>一级分销团队成交：{{base_info.directly_under_deal_times+"次/￥"+base_info.directly_under_deal_money}}</div>
          <div>自购付款：{{member_info.buy_times+"次/￥"+member_info.buy_money}}</div>
          <div>自购成交：{{member_info.deal_times+"次/￥"+member_info.deal_money}}</div>
        </span>
      </div>
    </div>
    <!-- 分销情况 -->
    <div style="width: auto;padding: 0 0 0 1.86%;">
      <div class="distributor-list-expand-head"></div>
      <div>
        <span class="distributor-list-expand-line-height">
          <div>团队总数量：{{base_info.total_team}}</div>
          <div>会员总数量：{{base_info.subordinate_member}}</div>
          <div>分销商总数量：{{base_info.subordinate_distributor}}</div>
          <div>一级会员数量：{{base_info.directly_under_member}}</div>
          <div>一级分销商数量：{{base_info.directly_under_distributor}}</div>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      required: true,
      type: Number
    },
    levelData: {
      required: true,
      type: Array,
      default() {
        return [];
      }
    },
    selectID: {
      required: true,
      type: Number
    },
    memberLevelData: {
      required: true,
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      terminalArray: {
        1: "PC",
        2: "H5",
        3: "微信公众号",
        4: "微信小程序"
      }, // 终端来源
      base_info: {
        name: "",
        member_id: "",
        status: "",
        passed_at: "",
        level: "",
        total_commission: "",
        total_deal_times: "",
        total_deal_money: "",
        directly_under_deal_times: "",
        directly_under_deal_money: "",
        subordinate_deal_times: "",
        subordinate_deal_money: "",
        subordinate_buy_money:0.00,
        total_team: "",
        directly_under_distributor: "",
        directly_under_member: "",
        subordinate_distributor: "",
        subordinate_member: "",
        subordinate_buy_times: 0,
        directly_under_buy_times: 0,
        directly_under_buy_money:0.00,
        
      },
      member_info: {
        buy_times:0,
        deal_times:0,
        buy_money:0.00,
        deal_money:0.00,
        headurl: "",
        mobile: "",
        level: "",
        sex: "",
        age: "",
        provname: "",
        areaname: "",
        regfrom: "",
        created_at: "",
        bind_weixin: ""
      },
      parent_info: {
        name: ""
      }
    };
  },
  mounted() {
    this.getDistributorInfo();
  },
  methods: {
    /**
     * 获取分销商信息
     */
    getDistributorInfo() {
      this.$httpGet(
        "/shop/admin/distribution/distributor/info",
        {
          id: this.id,
          type: 2
        },
        res => {
          this.base_info = res.data.base_info || {};
          this.member_info = res.data.member_info || {};
          this.parent_info = res.data.parent_info || {};
        }
      );
    },
    /**
     * 改变父级分销商
     */
    onChangeParentDistributor() {
      this.$emit("onChangeParentDistributor", this.parent_info);
    },
    // 修改分销商等级
    onDistributorLevelChange(level) {
      if (this.base_info.level !== level) {
        this.$emit(
          "onChangeLevel",
          this.levelData.filter(item => item.id === level)[0]
        );
      }
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-list-expand {
  height: 100%;
  & > div {
    float: left;
  }

  .distributor-list-expand-line-color {
    color: #9ea4b1;
  }
  /deep/.ivu-btn,
  /deep/.ivu-select-selected-value{
    font-size: 12px;
  }

  .distributor-list-expand-line-height {
    line-height: 23px;
  }

  .distributor-list-expand-head {
    height: 30px;
    font-size: 13px;
    margin-top: -2px;
    color: #464c5b;
  }

  .distributor-list-dotted-line {
    border-left: dashed 1px #d1d1d1;
    width: 1px;
    overflow: hidden;
    position: absolute;
    height: calc(50% + 10px);
    transform: translateY(50%) scaleY(2);
    top: -10px;
    left: 50%;
  }

  button {
    height: 20px;
    padding: 0 5px;
    width: 176px;
    text-align: left;
    line-height: 1;
  }

  .ivu-select.ivu-select-single {
    height: 20px;
    width: 164px;

    /deep/ .ivu-select-selection {
      height: 20px;

      .ivu-select-placeholder,
      .ivu-select-selected-value {
        height: 20px;
        line-height: 20px;
      }
    }
  }
}
</style>
