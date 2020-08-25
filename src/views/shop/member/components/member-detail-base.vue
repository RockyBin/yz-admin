<template>
  <div class="member-detail-base">
    <div class="member-detail-base-flex member-detail-base-head">
      <div class="member-detail-base-flex-item member-detail-base-head-info">
        <div
          class="member-detail-base-avator"
          :style="`background-image: url(${getHeadImg(value.headurl)});`"
        ></div>
        <div class="member-detail-base-head-msg">
          <div>
            昵称：<span>{{value.nickname?value.nickname:value.mobile?value.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"):''}}</span>
            <a
              href="jvacript:;"
              @click="modalInfoStatus = true"
            >修改昵称</a>
          </div>
          <div>姓名：{{value.name || '--'}}</div>
          <div>手机：{{value.mobile}}</div>
          <div class="member-detail-base-head-info-nickname">
            <span>（</span>
            <span>会员ID：</span>
            {{value.id}}）
          </div>
        </div>
      </div>
      <div class="member-detail-base-flex-item member-detail-base-flex-parentinfo">
        <div class="member-detail-base-flex-label">推荐人：
          <a href="jvacript:;" @click="modalInviteStatus = true" perm="member.detail.operate">修改</a>
        </div>
        <div class="member-detail-base-head-info" v-if="value.parent_nickname">
          <div
              class="member-detail-base-avator"
              @click="$router.push({name: 'memberDetail',query:{id: value.parent_id}})"
              :style="`background-image: url(${getHeadImg(value.parent_headurl)});`"
          ></div>
          <div class="member-detail-base-head-msg">
            <div>
              昵称：{{value.parent_nickname}}
            </div>
            <div>姓名：{{value.parent_name||'--'}}</div>
            <div>手机：{{value.parent_mobile}}</div>
            <div class="member-detail-base-head-info-nickname">
              <span>（</span>
              <span>会员ID：</span>
              {{value.parent_id}}）
            </div>
          </div>
        </div>
        <div v-else>{{!value.invite1 && !value.has_bind_invite ? '--' : '总店'}}</div>
      </div>
      <div class="member-detail-base-flex-item" style="position: relative;">
        <div class=" member-detail-base-flex-parentinfo">
          <div class="member-detail-base-flex-label">所属员工：
            <a href="jvacript:;" @click="modalEmployeesStatus = true" perm="member.detail.operate">修改</a>
          </div>
          <div class="member-detail-base-head-info" v-if="value.admin_id">
            <div
                    class="member-detail-base-avator"
                    :style="`background-image: url(${getHeadImg(value.admin_headurl)});`"
            ></div>
            <div class="member-detail-base-head-msg">
              <div>
                姓名：{{value.admin_name}}
              </div>
              <div>职位：{{value.position||"--"}}</div>
              <div>手机：{{value.admin_mobile||"--"}}</div>
            </div>
          </div>
          <div v-else>--</div>
        </div>
        <div style="margin-top: 10px;">
          <span class="member-detail-base-flex-label">会员状态：</span>
          <span>{{value.status === 1 ? '正常' : '封号'}}</span>
          <a
                  href="jvacript:;"
                  @click="onChangeMemberStatusClick"
                  perm="member.detail.operate"
          >{{value.status === 1 ? '封号' : '解封'}}</a>
        </div>
      </div>
    </div>
    <div class="member-detail-base-titlebar">
      <titlebar title="会员标签"></titlebar>
      <a href="jvacript:;" @click="modalTagsStatus = true">修改</a>
    </div>
    <div class="member-detail-base-flex member-detail-base-member-tags">
      <template>
        <span v-if="value.label&&!value.label.length">暂无标签</span>
        <Tag :checked="false" v-for="(item,index) in value.label" :key="index">{{item}}</Tag>
      </template>
    </div>
    <div class="member-detail-base-titlebar">
      <titlebar title="个人信息"></titlebar>
      <a href="jvacript:;" @click="modalInfoStatus = true">修改</a>
    </div>
    <div class="member-detail-base-flex">
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">性别：</span>
          <span>{{value.sex === 1 ? '男' : value.sex === 2 ? '女' : '保密'}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">生日：</span>
          <span>{{value.birthday || '--'}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label" style="vertical-align: text-bottom;">备注：</span>
          <!--<template>-->
            <Tooltip max-width="70%" v-if="value.about" :content="value.about">
              {{value.about}}
            </Tooltip>
          <span style="vertical-align: text-bottom;" v-else>--</span>
          <!--</template>-->
        </div>
      </div>
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line" style="padding: 7px 0;line-height: 18px;display: flex;">
          <span class="member-detail-base-flex-label">城市：</span>
          <span style="width: calc(100% - 40px);">{{value.prov_text + value.city_text + value.area_text || '--'}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">终端来源：</span>
          <span>{{value.terminal_type}}</span>
        </div>
      </div>
      <div class="member-detail-base-flex-item">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">绑定微信：</span>
          <span>{{value.bind_weixin || '--'}}</span>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">OpenID：</span>
          <span>{{value.openid || '--'}}</span>
        </div>
      </div>
    </div>
    <div class="member-detail-base-titlebar">
      <titlebar title="会员身份"></titlebar>
    </div>
    <div
      :class="{
        'member-detail-base-flex': true,
        'show-spliter':
          (( hasLicensePerm('ENABLE_DISTRIBUTION') && value.is_distributor ) || ( hasLicensePerm('ENABLE_AGENT') && value.agent_level ))  &&
          (( hasLicensePerm('ENABLE_AGENT') && value.agent_level ) ||  hasLicensePerm('ENABLE_CLOUDSTOCK') && value.dealer_level) &&
          (( hasLicensePerm('ENABLE_CLOUDSTOCK') && value.dealer_level) || hasLicensePerm('ENABLE_AREA_AGENT') && value.area_agent && value.area_agent.status) &&
          (( hasLicensePerm('ENABLE_DISTRIBUTION') && value.is_distributor ) ||  hasLicensePerm('ENABLE_CLOUDSTOCK') && value.dealer_level) &&
          (( hasLicensePerm('ENABLE_AGENT') && value.agent_level ) || hasLicensePerm('ENABLE_AREA_AGENT') && value.area_agent && value.area_agent.status) &&
          (( hasLicensePerm('ENABLE_DISTRIBUTION') && value.is_distributor) || hasLicensePerm('ENABLE_AREA_AGENT') && value.area_agent && value.area_agent.status),
        'member-detail-base-flex-one':
          dealerHideLevelShow && isDealerLevelChange,
        'member-detail-base-flex-two':
          dealerHideLevelShow && isDealerHideLevelChange,
        'member-detail-base-flex-hide-level': dealerHideLevelShow
      }"
      style="padding-bottom: 30px;"
    >
      <!--基本-->
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
            <!--<Option :value="0">&#45;&#45;</Option>-->
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
      </div>
      <!--分销-->
      <div class="member-detail-base-flex-item" v-if="hasLicensePerm('ENABLE_DISTRIBUTION') && value.is_distributor">
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
      </div>
      <!--代理-->
      <div class="member-detail-base-flex-item" v-if="hasLicensePerm('ENABLE_AGENT') && value.agent_level">
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
       <!--区域代理代理-->
      <div class="member-detail-base-flex-item" v-if="hasLicensePerm('ENABLE_AREA_AGENT') && value.area_agent && value.area_agent.status">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">区域代理等级：</span>
          <span>{{value.area_agent.level_name}}</span>
          <!-- <a
            href="jvacript:;"
            @click="$refs.areaAgentForm.create(2)"
            perm="member.detail.operate"
          >修改</a> -->
        </div>
        <!-- <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">{{value.area_agent.area_type_text}}：</span>
          <span>{{value.area_agent.area_path}}</span>
        </div> -->
        <div class="member-detail-base-flex-line">
          <span>成为区域代理时间：</span>
          <span>{{value.area_agent.created_at}}</span>
        </div>
      </div>
      <!--经销商-->
      <div class="member-detail-base-flex-item" v-if="hasLicensePerm('ENABLE_CLOUDSTOCK') && value.dealer_level">
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">经销商等级：</span>
          <span v-if="!isDealerLevelChange">{{getDealerLevelName(value.dealer_level)}}</span>
          <Select
            v-show="isDealerLevelChange"
            v-model="value.dealer_level"
            @on-change="dealer_hide_level_edit = 0"
            style="width:185px;vertical-align: top;"
          >
            <Option
              v-for="item in dealerLevel"
              :key="item.id"
              :value="item.id"
            >{{item.name}}</Option>
          </Select>
          <a
            href="jvacript:;"
            @click="onDealerLevelChangeClick()"
            perm="member.detail.operate"
          >{{isDealerLevelChange ? '确认' : '修改'}}</a>
        </div>
        <div v-if="dealerHideLevelShow" class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">隐藏等级：</span>
          <span
            v-if="!isDealerHideLevelChange"
          >{{getDealerLevelName(value.dealer_hide_level)}}</span>
          <Select
            v-show="isDealerHideLevelChange"
            v-model="dealer_hide_level_edit"
            style="width:185px;vertical-align: top;"
          >
            <Option :value="0">无</Option>
            <Option v-for="item in dealerHideLevel" :key="item.id" :value="item.id">{{item.name}}</Option>
          </Select>
          <a
            href="jvacript:;"
            @click="onDealerHideLevelChangeClick()"
            perm="member.detail.operate"
          >{{isDealerHideLevelChange ? '确认' : '修改'}}</a>
        </div>
        <div class="member-detail-base-flex-line">
          <span class="member-detail-base-flex-label">成为经销商时间：</span>
          <span>{{value.dealer_passed_at}}</span>
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
    <modal-info v-model="modalInfoStatus" :data="value"></modal-info>
    <modal-invite v-model="modalInviteStatus" :dataInfo="value"></modal-invite>
    <modal-employees v-model="modalEmployeesStatus" :dataInfo="value"></modal-employees>
    <modalAreaAgent @on-changeInfo="areaAgentInfo" ref="areaAgentForm"></modalAreaAgent>
    <modal-tags v-model="modalTagsStatus" :dataInfo="value"></modal-tags>
    <Modal
      v-model="isShowStatus"
      title="注意"
      :width="430"
      ok-text="前往处理"
      class="common-modal-style"
      @on-ok="onJumpDistributeClick"
    >
      <p v-if="types === 1">当前会员是分销商。若坚持对该会员进行封号操作，请先前往【分销商列表】取消该分销商资格。</p>
      <p v-if="types === 2">当前会员是代理商。若坚持对会员进行封号操作，请先前往【代理商列表】取消该代理商资格。</p>
      <p v-if="types === 3">当前会员是经销商。若坚持对会员进行封号操作，请先前往【经销商列表】取消该经销商资格。</p>
      <p v-if="types === 4">当前会员是区域代理商。若坚持对会员进行封号操作，请先前往【区代列表】取消该区域代理商资格。</p>
      <p v-if="types === 5">当前会员是供应商。若坚持对会员进行封号操作，请先前往【区代列表】取消该供应商资格。</p>
    </Modal>
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import baseCapital from "./member-detail-base-capital";
import baseTrade from "./member-detail-base-trade";
import modalInfo from "./member-detail-modal-info";
import modalInvite from "./member-detail-invite";
import modalEmployees from "./member-detail-employees";
import modalTags from "./member-detail-tags";
import modalAreaAgent from "./member-detail-area-agent-modal"
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
    modalAreaAgent,
    modalEmployees,
      modalTags
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
      defaultImg: require("../../images/head-portrait.png"),
      tabSelect: 0,
      types: 0,
      modalInfoStatus: false,
      levelName,
      modalInviteStatus: false,
        modalEmployeesStatus:false,
        modalTagsStatus:false,
      dealer_hide_level_edit: 0,
      isShowStatus: false,
      levelChangeShow: Object.assign({}, levelChangeShow),
      isDealerLevelChange: false,
      isDealerHideLevelChange: false
    };
  },
  computed: {
    dealerLevel: function() {
      let levels = Object.assign([], (this.configInfo && this.configInfo.dealer_level) || []);
      var l = levels.filter(item => item.parent_id === 0 && item.status === 1).sort((a, b) => b.weight - a.weight);
      return l;
    },
    dealerHideLevel: function() {
      let levels = Object.assign([], (this.configInfo && this.configInfo.dealer_level) || []);
      var l = levels.filter(item => item.parent_id === this.value.dealer_level && item.status === 1).sort((a, b) => b.weight - a.weight);
      return l;
    },
    dealerHideLevelShow() {
      return (
        this.hasLicensePerm("ENABLE_DEALER_HIDE_LEVEL") &&
        this.configInfo &&
        this.configInfo.dealer_level &&
        this.configInfo.dealer_level[this.value.dealer_level] &&
        this.configInfo.dealer_level[this.value.dealer_level].has_hide
      );
    }
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
    onJumpDistributeClick() {
      let data = null;
      switch (this.types) {
        case 1:
          data = {
            name: "distributorList",
            params: { keyword: this.value.mobile }
          };
          break;
        case 2:
          data = {
            name: "agentList",
            params: { keyword: this.value.mobile }
          };
          break;
        case 3:
          data = {
            name: "dealerList",
            params: { keyword: this.value.mobile }
          };
          break;
        case 4:
          data = {
            name: "areaAgentList",
            params: { keyword: this.value.mobile }
          };
        case 5:
          data = {
            name: "supplierList",
            params: { keyword: this.value.mobile }
          };
          break;
        default:
          break;
      }
      data && this.$router.push(data);
    },
    getHeadImg(url) {
      if (url) {
        if (!/^(http)/i.test(url)) {
          url = this.$store.state.siteComdataPath + url;
        }
        return url;
      }
      return this.defaultImg;
    },
    getDealerLevelName(id) {
      if (this.configInfo && this.configInfo.dealer_level[id])
        return this.configInfo.dealer_level[id].name;
      else return "--";
    },
    onDealerLevelChangeClick() {
      if (!this.isDealerLevelChange) {
        this.isDealerLevelChange = true;
        return;
      } else {
        this.$httpPost(
          "/shop/admin/member/edit",
          {
            id: this.value.id,
            dealer_level: this.value.dealer_level
          },
          res => {
            if (res.code == 200) {
              this.$Message.success("修改成功");
              this.isDealerLevelChange = false;
              this.value.dealer_hide_level = 0;
            } else {
              this.$Message.error(res.msg);
            }
          }
        );
      }
    },
    onDealerHideLevelChangeClick() {
      if (!this.isDealerHideLevelChange) {
        this.isDealerHideLevelChange = true;
        this.dealer_hide_level_edit = this.dealerHideLevel.find(
          n => n.id === this.value.dealer_hide_level
        )
          ? this.value.dealer_hide_level
          : 0;
        return;
      } else {
        this.$httpPost(
          "/shop/admin/member/edit",
          {
            id: this.value.id,
            dealer_hide_level: this.dealer_hide_level_edit
          },
          res => {
            if (res.code == 200) {
              this.$Message.success("修改成功");
              this.isDealerHideLevelChange = false;
              this.$set(
                this.value,
                "dealer_hide_level",
                this.dealer_hide_level_edit
              );
            } else {
              this.$Message.error(res.msg);
            }
          }
        );
      }
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
              Object.keys(this.target.distributorInfo).length
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
          this.changeStatus(this.value.status, this.value.id);
        }
      });
    },
    // 修改解封，封号状态
    changeStatus(status, id) {
      let statusChange = status;
      if (statusChange !== 0) {
        this.types = this.value.is_distributor
          ? 1
          : this.value.agent_level
          ? 2
          : this.value.dealer_level
          ? 3
          : this.value.is_area_agent === 1
          ? 4 
          : this.value.is_supplier === 1 
          ? 5
          : 0;
        if (this.types) {
          this.isShowStatus = true;
          return;
        }
      }
      statusChange = statusChange ? 0 : 1;
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
    // 区域代理信息修改
    areaAgentInfo(data) {
      console.log(data)
    }
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
    flex-wrap: wrap;
    position: relative;
    &.show-spliter {
      &::before {
        position: absolute;
        content: "";
        border-bottom: 1px solid #e8eaec;
        top: 88px;
        width: calc(100% - 16px);
        margin-left: 16px;
      }
      &.member-detail-base-flex-hide-level
        > div:nth-child(n + 4)
        .member-detail-base-flex-line {
        height: auto;
        padding: 7px 0;
        line-height: 18px;
        display: flex;
        align-items: center;
      }
    }
    &.member-detail-base-flex-one:not(.show-spliter)
      .member-detail-base-flex-item
      .member-detail-base-flex-line:nth-child(1) {
      height: 46px;
      padding: 7px 0;
      line-height: 18px;
      display: flex;
      align-items: center;
    }
    &.member-detail-base-flex-two:not(.show-spliter)
      .member-detail-base-flex-item
      .member-detail-base-flex-line:nth-child(2) {
      height: 46px;
      padding: 7px 0;
      line-height: 18px;
      display: flex;
      align-items: center;
    }
    .member-detail-base-flex-item {
      width: calc((100% - 32px) / 3);
      box-sizing: border-box;
      padding-left: 22px;
      & + .member-detail-base-flex-item {
        margin-left: 16px;
      }
      &:nth-child(4) {
        margin-left: 0px;
      }
      &:nth-child(n + 4) {
        margin-top: 20px;
      }
      .member-detail-base-flex-label {
        font-weight: bold;
      }
      .member-detail-base-flex-line {
        height: 32px;
        line-height: 32px;
        /deep/.ivu-tooltip{
          width: 85%;
          vertical-align: text-bottom;
          height: 32px;
          .ivu-tooltip-rel{
            width: 250px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .ivu-tooltip-popper{
            left: 0 !important;
            .ivu-tooltip-content{
              .ivu-tooltip-arrow{
                left: 20%;
              }
              .ivu-tooltip-inner{
                max-width: unset;
              }
            }
          }
        }
      }

    }
  }
  .member-detail-base-member-tags{
    padding: 15px 22px 19px;
    .ivu-tag{
      border: 1px solid #9DD4F2;
      background: #E7F6FF;
      border-radius: 3px;
      padding: 3px 10px;
      font-size: 12px;
      height: unset;
      line-height: unset;
      margin: 0 8px 8px 0;
      /deep/.ivu-tag-text{
        color: #56A5E5 !important;
      }
    }
  }
  // 头部样式
  .member-detail-base-flex.member-detail-base-head {
    padding: 30px 0;
    vertical-align: text-bottom;
    /*align-items: flex-end;*/
    /*.member-detail-base-flex-item {*/
      /*& + .member-detail-base-flex-item {*/
        /*margin-bottom: 16px;*/
      /*}*/
    /*}*/
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
      /*align-items: flex-end;*/
      padding-left: 0;
      .member-detail-base-head-msg {
        margin-left: 30px;
        font-size: 13px;
        color: #464c5b;
        &>div{
          line-height: 20px;
        }
        &>div:first-child span{
          display: inline-block;
          max-width: 100px;
          overflow: hidden;
          vertical-align: middle;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .member-detail-base-head-info-nickname {
          font-size: 12px;
          color: #657180;
        }
      }
    }
    .member-detail-base-flex-parentinfo{
      .member-detail-base-flex-label{
        float: left;
        &>a{
          display: block;
          margin-left: 0;
        }
      }
      .member-detail-base-head-info{
        align-items: unset;
        .member-detail-base-avator{
          width: 40px;
          height: 40px;
        }
        .member-detail-base-head-msg{
          margin-left: 16px;
          width: calc(100% - 65px);
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
}
</style>
