<template>
  <div class="member-detail-base">
    <div class="member-detail-base-flex member-detail-base-head">
      <div class="member-detail-base-flex-item member-detail-base-head-info">
        <div
          class="member-detail-base-avator"
          :style="`background-image: url(${getHeadImg(value.headurl)});`"
        ></div>
        <div class="member-detail-base-head-msg">
          <div class="member-detail-base-head-info-nickname">
            {{value.nickname}}
            <a
              href="jvacript:;"
              @click="modalInfoStatus = true"
              perm="member.detail.operate"
            >修改昵称</a>
          </div>
          <div>
            <span>（</span>
            <span class="member-detail-base-flex-label">会员ID：</span>
            {{value.id}}）
          </div>
        </div>
      </div>
      <div class="member-detail-base-flex-item">
        <span class="member-detail-base-flex-label">推荐人：</span>
        <span>{{value.parent_nickname || "总店"}}</span>
        <a href="jvacript:;" @click="modalInviteStatus = true" perm="member.detail.operate">修改</a>
      </div>
      <div class="member-detail-base-flex-item">
        <span class="member-detail-base-flex-label">会员状态：</span>
        <span>{{value.status === 1 ? '正常' : '封号'}}</span>
        <a
          href="jvacript:;"
          @click="onChangeMemberStatusClick"
          perm="member.detail.operate"
        >{{value.status === 1 ? '封号' : '解封'}}</a>
      </div>
    </div>
    <div class="member-detail-base-titlebar">
      <titlebar title="个人信息"></titlebar>
      <a href="jvacript:;" @click="modalInfoStatus = true" perm="member.detail.operate">修改</a>
    </div>
    <div class="member-detail-base-flex">
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">手机号：</span>
          <span>{{value.mobile}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">性别：</span>
          <span>{{value.sex === 1 ? '男' : value.sex === 2 ? '女' : '保密'}}</span>
        </div>
      </div>
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">绑定微信：</span>
          <span>{{value.bind_weixin || '--'}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">生日：</span>
          <span>{{value.birthday || '--'}}</span>
        </div>
      </div>
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">终端来源：</span>
          <span>{{value.terminal_type}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">城市：</span>
          <span>{{value.prov_text + value.city_text + value.area_text || '--'}}</span>
        </div>
      </div>
    </div>
    <div class="member-detail-base-titlebar">
      <titlebar title="会员身份"></titlebar>
    </div>
    <div class="member-detail-base-flex" style="padding-bottom: 30px;">
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">会员等级：</span>
          <span
            v-show="!levelChangeShow[levelName[0] + '_show']"
          >{{(configInfo && configInfo.member_level.find(item => item.id === value.level) && configInfo.member_level.find(item => item.id === value.level).name) || "--"}}</span>
          <Select
            v-show="levelChangeShow[levelName[0] + '_show']"
            v-model="levelChangeShow[levelName[0]]"
            style="width:185px;vertical-align: top;"
            v-if="configInfo"
          >
            <Option :value="0">--</Option>
            <Option
              v-for="item in configInfo.member_level"
              :key="item.id"
              :value="item.id"
            >{{item.name}}</Option>
          </Select>
          <a
            href="jvacript:;"
            @click="onSelectChangeClick(levelName[0])"
            perm="member.detail.operate"
          >{{levelChangeShow[levelName[0] + '_show'] ? '确认' : '修改'}}</a>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">注册时间：</span>
          <span>{{value.created_at}}</span>
        </div>
        <div class="member-detail-base-flex-line" style="height: 80px;">
          <span class="member-detail-base-flex-label">我的证书：</span>
          <span style="display: inline-block;">
            <image-dragable v-model="cert" :pictureNumber="1"></image-dragable>
          </span>
          <a href="javascript:;" @click="onChangeCert()" perm="member.detail.operate">修改</a>
        </div>
      </div>
      <div class="member-detail-base-flex-item" v-if="value.is_distributor">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">分销等级：</span>
          <span
            v-show="!levelChangeShow[levelName[1] + '_show']"
          >{{(configInfo && configInfo.distribution_level.find(item => item.id === value.distributor_level) && configInfo.distribution_level.find(item => item.id === value.distributor_level).name) || "--"}}</span>
          <Select
            v-show="levelChangeShow[levelName[1] + '_show']"
            v-model="levelChangeShow[levelName[1]]"
            style="width:185px;vertical-align: top;"
            v-if="configInfo"
          >
            <Option
              v-for="item in configInfo.distribution_level"
              :key="item.id"
              :value="item.id"
            >{{item.name}}</Option>
          </Select>
          <a
            href="jvacript:;"
            @click="onSelectChangeClick(levelName[1])"
            perm="member.detail.operate"
          >{{levelChangeShow[levelName[1] + '_show'] ? '确认' : '修改'}}</a>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">成为分销商时间：</span>
          <span>{{value.distributor_passed_at}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">运营中心：</span>
          <span v-if="!OperationCenterChangeShow">{{is_open_operation_center ? "开启":"关闭"}}</span>
          <Select
            v-model="is_open_operation_center"
            style="width:185px;vertical-align: top;"
            v-if="OperationCenterChangeShow"
          >
            <Option :value="0">关闭</Option>
            <Option :value="1">开启</Option>
          </Select>
          <a
            href="jvacript:;"
            @click="onOperationCenterClick()"
            perm="member.detail.operate"
          >{{OperationCenterChangeShow ? '确认' : '修改'}}</a>
        </div>
      </div>
      <div class="member-detail-base-flex-item" v-if="value.agent_level">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">代理等级：</span>
          <span
            v-show="!levelChangeShow[levelName[2] + '_show']"
          >{{["一级代理", "二级代理", "三级代理"][value.agent_level - 1]}}</span>
          <Select
            v-show="levelChangeShow[levelName[2] + '_show']"
            v-model="levelChangeShow[levelName[2]]"
            style="width:185px;vertical-align: top;"
          >
            <Option :value="1">一级代理</Option>
            <Option :value="2">二级代理</Option>
            <Option :value="3">三级代理</Option>
          </Select>
          <a
            href="jvacript:;"
            @click="onSelectChangeClick(levelName[2])"
            perm="member.detail.operate"
          >{{levelChangeShow[levelName[2] + '_show'] ? '确认' : '修改'}}</a>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">成为代理时间：</span>
          <span>{{value.agent_passed_at}}</span>
        </div>
      </div>
    </div>
    <div>
      <Tabs type="card" :animated="false" v-model="tabSelect">
        <TabPane label="资金概况" tab="condition">
          <baseCapital v-model="value"></baseCapital>
        </TabPane>
        <TabPane label="交易概况" tab="condition">
          <base-trade v-model="value"></base-trade>
        </TabPane>
      </Tabs>
    </div>
    <modal-info v-model="modalInfoStatus" :data="value" />
    <modal-invite v-model="modalInviteStatus" :dataInfo="value" :configInfo="configInfo"></modal-invite>
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import baseCapital from "@/views/shop/member/components/member-detail-base-capital";
import baseTrade from "@/views/shop/member/components/member-detail-base-trade";
import modalInfo from "@/views/shop/member/components/member-detail-modal-info";
import modalInvite from "@/views/shop/member/components/member-detail-invite";
import imageDragable from "@/views/shop/components/image-select/image-select-dragable.vue";
import axios from "axios";
const levelName = ["level", "distributor_level", "agent_level"];
// 用于标识修改等级的显示状态
const levelChangeShow = {
  [levelName[0]]: "",
  [[levelName[0]] + "_show"]: false,
  [[levelName[0]] + "_loading"]: false,
  [levelName[1]]: "",
  [[levelName[1]] + "_show"]: false,
  [[levelName[1]] + "_loading"]: false,
  [levelName[2]]: "",
  [[levelName[2]] + "_show"]: false,
  [[levelName[2]] + "_loading"]: false
};
export default {
  components: {
    titlebar,
    baseCapital,
    baseTrade,
    modalInfo,
    modalInvite,
    imageDragable
  },
  props: {
    value: {
      type: Object,
      default() {
        return null;
      }
    },
    configInfo: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  inject: ["target"],
  data() {
    return {
      defaultImg: require("@/views/shop/images/head-portrait.png"),
      tabSelect: 0,
      modalInfoStatus: false,
      levelName,
      modalInviteStatus: false,
      levelChangeShow: Object.assign({}, levelChangeShow),
      cert: [],
      OperationCenterChangeShow: false,
      is_open_operation_center: 0
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.tabSelect = 0;
          if (this.$route.query.subTab) {
            this.tabSelect = 1;
          }
          this.levelChangeShow = Object.assign({}, levelChangeShow);
        }
      },
      immediate: true
    }
  },
  methods: {
    getHeadImg(url) {
      if (url) {
        if (!/^(http)/i.test(url)) {
          url = this.$store.state.siteComdataPath + url;
        }
        return url;
      }
      return this.defaultImg;
    },
    /**
     * 修改运营中心开启/关闭
     */
    onOperationCenterClick() {
      if (!this.OperationCenterChangeShow) {
        this.OperationCenterChangeShow = true;
      } else {
        this.$httpPost(
          "/shop/admin/custom/member/extend/save",
          {
            member_id: this.value.id,
            is_open_operation_center: this.is_open_operation_center
          },
          res => {
            if (res.code == 200) {
              this.$Message.success("保存成功");
            } else {
              this.loadOperationCenterInfo();
              this.$Message.error(res.msg);
            }
          }
        );
        this.OperationCenterChangeShow = false;
      }
    },
    /**
     * 读取用户的运营中心信息
     */
    loadOperationCenterInfo(id) {
      this.$httpPost(
        "/shop/admin/custom/member/extend/info",
        {
          member_id: id | this.value.id
        },
        res => {
          if (res.code == 200) {
            this.is_open_operation_center = res.data.is_open_operation_center;
          } else {
            this.$Message.error("加载运营中心信息出错：" + res.msg);
          }
        }
      );
    },
    /**
     * 修改等级
     */
    onSelectChangeClick(key) {
      if (this.levelChangeShow[key + "_loading"]) return;
      // 显示修改按钮
      if (!this.levelChangeShow[key + "_show"]) {
        this.$set(this.levelChangeShow, key, this.value[key]);
        this.$set(this.levelChangeShow, key + "_show", true);
        // 修改等级
      } else {
        this.levelChangeShow[key + "_loading"] = true;
        this.setLevelData(key).then(res => {
          this.levelChangeShow[key + "_loading"] = false;
          if (res.code === 200) {
            this.$set(this.levelChangeShow, key + "_show", false);
            // 进入代理需要重新拉取数据
            if (
              this.value[key] !== this.levelChangeShow[key] &&
              key === levelName[2]
            ) {
              this.target.agentInfo = {};
            }
            // 进入代理需要重新拉取数据
            if (
              this.value[key] !== this.levelChangeShow[key] &&
              (key === levelName[1] || key === levelName[0]) &&
              this.target.distributorInfo
            ) {
              this.$set(
                this.target.distributorInfo,
                key,
                this.levelChangeShow[key]
              );
            }
            this.$Message.success("修改成功");
            this.$set(this.value, key, this.levelChangeShow[key]);
          } else {
            this.$Message.error(res.msg);
          }
        });
      }
    },
    setLevelData(key) {
      return new Promise(resolve => {
        switch (key) {
          case levelName[0]:
            this.$httpPost(
              "/shop/admin/member/edit",
              {
                id: this.value.id,
                level: this.levelChangeShow[key]
              },
              res => {
                resolve(res);
              }
            );
            break;
          case levelName[1]:
            this.$httpPost(
              "/shop/admin/distribution/distributor/edit",
              {
                id: this.value.id,
                level: this.levelChangeShow[key]
              },
              res => {
                resolve(res);
              }
            );
            break;
          case levelName[2]:
            this.$httpPost(
              "/shop/admin/agent/level/set",
              {
                member_id: this.value.id,
                agent_level: this.levelChangeShow[key]
              },
              res => {
                resolve(res);
              }
            );
            break;
          default:
            break;
        }
      });
    },
    onChangeMemberStatusClick() {
      this.$Modal.confirm({
        title: "提示",
        content:
          this.value.status == 1
            ? "除非必要，请不要随意对会员封号，封号后，此会员将访问不了您的店铺！是否确定要对此会员封号？"
            : "解封此会员后，会员可以继续访问您的店铺！是否确定要解封此会员？",
        onOk: () => {
          this.changeStatus(
            this.value.status,
            this.value.id,
            this.value.is_distributor
          );
        }
      });
    },
    // 修改解封，封号状态
    changeStatus(status, id, is_distributor) {
      let statusChange = status;
      if (statusChange === 0) {
        statusChange = 1;
      } else {
        statusChange = 0;
        if (is_distributor === 1) {
          this.isShowStatus = true;
          this.titles = "注意";
          this.text = "前往处理";
          this.types = 2;
          return;
        }
      }
      this.$httpPost(
        "/shop/admin/member/status",
        { status: statusChange, id: id },
        res => {
          if (res.code === 200) {
            this.$Message.success(res.msg);
            this.$set(this.value, "status", status ? 0 : 1);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onChangeCert() {
      if (this.cert && this.cert.length > 0) {
        // 添加证件
        let formData = new FormData();
        formData.append("cert_data", this.cert[0]);
        formData.append("member_id", this.value.id);
        axios
          .post("/shop/admin/custom/member/cert/save", formData)
          .then(res => {
            if (res.code == 200) {
              this.$Message.success("保存成功");
            } else {
              this.$Message.error(res.msg);
            }
          });
      } else {
        // 删除证件
        this.http({
          url: "/shop/admin/custom/member/cert/delete",
          method: "POST",
          data: {
            member_id: this.value.id
          }
        })
          .then(res => {
            if (res.code === 200) {
              this.$Message.success("删除成功");
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(() => {
            this.$Message.error("操作失败");
          });
      }
    },
    loadCert(memberId) {
      var _this = this;
      this.http({
        url: "/shop/admin/custom/member/cert/info",
        method: "POST",
        data: {
          member_id: memberId
        }
      })
        .then(res => {
          if (res.code === 200) {
            if (res.data && res.data.cert) {
              _this.cert.push(
                _this.$store.state.siteComdataPath + res.data.cert
              );
            }
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(() => {
          this.$Message.error("获取数据失败");
        });
    }
  },
  mounted() {
    this.loadCert(this.$route.query.id);
    this.loadOperationCenterInfo(this.$route.query.id);
  }
};
</script>
<style lang="less" scoped>
.member-detail-base {
  color: #657180;
  padding: 0px 24px 40px;
  a {
    margin-left: 16px;
    font-size: 13px;
    color: #3f66d3;
    font-weight: initial;
  }
  // 列对齐布局
  .member-detail-base-flex {
    display: flex;
    padding: 15px 0 19px;
    .member-detail-base-flex-item {
      width: calc((100% - 32px) / 3);
      box-sizing: border-box;
      padding-left: 22px;
      & + .member-detail-base-flex-item {
        margin-left: 16px;
      }
      .member-detail-base-flex-label {
        font-weight: bold;
      }
      .member-detail-base-flex-line {
        height: 32px;
        line-height: 32px;
      }
    }
  }
  // 头部样式
  .member-detail-base-flex.member-detail-base-head {
    padding: 30px 0;
    vertical-align: text-bottom;
    align-items: flex-end;
    .member-detail-base-flex-item {
      & + .member-detail-base-flex-item {
        margin-bottom: 16px;
      }
    }
    .member-detail-base-avator {
      width: 80px;
      height: 80px;
      border-radius: 5px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
    .member-detail-base-head-info {
      display: flex;
      align-items: flex-end;
      padding-left: 0;
      a {
        vertical-align: text-bottom;
      }
      .member-detail-base-head-msg {
        margin-left: 30px;
        .member-detail-base-head-info-nickname {
          font-size: 16px;
          color: #464c5b;
          font-weight: bold;
          margin-bottom: 7px;
          margin-right: -400px;
          & + div {
            margin-bottom: 16px;
            margin-left: -2px;
          }
        }
      }
    }
  }
  // 标题样式
  .member-detail-base-titlebar {
    position: relative;
    padding: 0 12px;
    background-color: #f7f8fd;
    font-size: 14px;
    color: #464c5b;
    .vertical-line-titlebar-wrapper {
      height: auto;
      line-height: initial;
      /deep/label {
        height: 40px;
        line-height: 40px;
      }
    }
    a {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 76px;
    }
  }
  /deep/.ivu-tabs {
    .ivu-tabs-bar {
      margin-bottom: 0;
      .ivu-tabs-nav-container {
        height: 42px;
        .ivu-tabs-tab {
          width: 90px;
          height: 41px;
          padding: 11px 14px 10px;
          &.ivu-tabs-tab-active {
            height: 42px;
            color: #4570ea;
            border-color: #dcdee2;
          }
        }
        &:focus .ivu-tabs-tab-focused {
          border-color: #dcdee2 !important;
          outline: none;
        }
      }
    }
  }
}
</style>
