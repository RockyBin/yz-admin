<template>
  <div class="agent-verify" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false">
      <TabPane :label="() => {return $createElement('div', `待审核`)}" :name="tabChangeArray[0]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `通过记录`)}" :name="tabChangeArray[1]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `拒绝记录`)}" :name="tabChangeArray[2]"></TabPane>
    </Tabs>
    <div class="agent-verify-content">
      <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true">
        <Button v-show="tabIndex === 0" @click="onBatchRejectClick" perm="agent.review.operate">批量拒绝</Button>
      </search-list>
      <common-table
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="tabIndex === 0 ? columnsData1 : columnsData2"
        :listData="agentList"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-show="agentList.length"
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
    <!-- 审核弹窗 -->
    <Modal
      v-model="modalVerifyStatus"
      :title="selectMemberInfo ? isVerify ? '审核' : '成为代理详情' : '批量拒绝'"
      class="agent-verify-change-modal"
      :class="{'agent-verify-change-modal-verify': isVerify}"
      :width="selectMemberInfo ? 600 : 400"
      :loading="modalVerifyLoading"
      @on-visible-change="onVerifyModalChange"
      @on-ok="onVerifyComfirmClick"
    >
      <Form
        ref="modalValidate"
        :model="modalValidate"
        :show-message="false"
        :rules="ruleValidate"
        :label-width="88"
      >
        <!-- 审核头部 -->
        <FormItem label="审核：" v-show="selectMemberInfo && isVerify" style="margin-top: -10px;">
          <RadioGroup
            v-if="selectMemberInfo"
            v-model="verifySelect"
            @on-change="$refs['modalValidate'].resetFields()"
          >
            <Radio :label="1" style="margin-right:20px !important;">
              <span>通过</span>
            </Radio>
            <Radio :label="-1">
              <span>拒绝</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <!-- 加盟费确认 -->
        <FormItem class="left" v-show="isShowJiameng&&initialMoney>0&&verifySelect===1">
          <div class="product-detail-item" v-if="offline_or_online">
            <p>请确认已收到加盟费！</p>
            <p style="color:#FE3737;">加盟费：￥{{initialMoney}}</p>
          </div>
          <div class="product-detail-item" v-else-if="!offline_or_online">
            <p>已收到加盟费！</p>
            <p style="color:#FE3737;">加盟费：￥{{initialMoney}}</p>
          </div>
          <Checkbox
            v-if="offline_or_online"
            v-model="receive_initial_money"
            @on-change="changeCheckStatus"
            :class="{'warning-text':isShowRedTextClass}"
          >我已收到线下付款</Checkbox>
        </FormItem>
        <FormItem class="right" v-show="isShowJiameng&&initialMoney>0&&verifySelect===1">
          <div class="pay-order" v-if="!offline_or_online">
            <p>线上支付系统自动完成入账</p>
          </div>
          <div class="pay-order" v-else>
            支付凭证：
            <div
              style="display:inline-block;margin-right: 10px;"
              class="show-big-picture"
              v-for="(item,index) in initialPayCertificate"
              :key="index"
            >
              <div class="mask" @click="showBigImg(item)">
                <Icon type="ios-eye-outline" color="white" size="20"></Icon>
              </div>
              <img style="margin-left:0px;" :src="$store.state.siteComdataPath + item" alt />
            </div>
            <span style="color: #9EA4B1;">(点击查看大图)</span>
          </div>
          <div class="collect-account">
            收款账户：
            <!-- 余额支付 -->
            <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==1">
              线上结算-余额
            </div>
            <!-- 微信支付 -->
            <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==2">
              线上结算-微信
            </div>
            <!-- 支付宝支付 -->
            <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==3">
              线上结算-支付宝
            </div>
			<!-- 通联支付 -->
            <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==11">
              通联支付
            </div>
            <!-- 银行账户 -->
            <div
              style="display:inline-block;vertical-align: top;width:245px;"
              v-if="initialPayType==9"
            >
              线下结算-银行账户
              <div style="word-break:break-all;">
                <span
                  style="margin-top:10px;display:inline-block"
                >{{initialPayInfo.account_name+'/'}}</span>
                <span style="margin-top:10px;display:inline-block">{{initialPayInfo.bank+'/'}}</span>
                <span style="margin-top:10px;display:inline-block">{{initialPayInfo.account}}</span>
              </div>
            </div>
            <!-- 支付宝账户 -->
            <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==8">
              线下结算-支付宝账户
              <div
                style="margin-top:10px;"
              >{{initialPayInfo.account_name+'/'+initialPayInfo.account}}</div>
            </div>
            <!-- 支付宝收款码 -->
            <div style="display:inline-block;" v-if="initialPayType==7">
              线下结算-支付宝收款码
              <div class="hover-img">
                <img
                  style="width:30px;height:30px"
                  :src="$store.state.siteComdataPath + initialPayInfo.account"
                  alt
                />
                <div class="mask" @click="showBigImg(initialPayInfo.account)">
                  <Icon type="ios-eye-outline" color="white" size="20"></Icon>
                </div>
              </div>
            </div>
            <!-- 微信收款码 -->
            <div style="display:inline-block;" v-if="initialPayType==6">
              线下结算-微信收款码
              <div class="hover-img">
                <img
                  style="width:30px;height:30px"
                  :src="$store.state.siteComdataPath + initialPayInfo.account"
                  alt
                />
                <div class="mask" @click="showBigImg(initialPayInfo.account)">
                  <Icon type="ios-eye-outline" color="white" size="20"></Icon>
                </div>
              </div>
            </div>
          </div>
        </FormItem>
        <!-- 拒绝原因 -->
        <div v-show="initialPayStatus==1&&(isVerify && verifySelect === -1 || !selectMemberInfo)" style="margin-bottom: 15px">
          <Icon type="md-alert" style="color: #FF9900;font-size: 16px;margin-right: 8px;vertical-align:text-bottom;margin-left: 3px;" />
          <span v-if="initialPayStatus==1&&offline_or_online" style="font-size:12px;color: #FE3737;line-height: initial;">您可能已收取用户的加盟费，请到线下处理退款！</span>
          <span v-else-if="initialPayStatus==1&&!offline_or_online" style="font-size:12px;color: #FE3737;line-height: initial;">您已收取用户的加盟费，请到线下处理退款！</span>
        </div>
        <FormItem
          label="拒绝原因："
          :class="{'agent-verify-audit-modal-textarea': !selectMemberInfo}"
          style="margin-bottom: 30px;"
          prop="reason"
          v-show="isVerify && verifySelect === -1 || !selectMemberInfo"
        >
          <Input
            class="common-input-text-260"
            placeholder="请输入拒绝原因"
            :maxlength="20"
            v-model="modalValidate.reason"
            type="textarea"
          />
          <div class="agent-verify-audit-modal-textarea-num">{{modalValidate.reason.length}}/20</div>
          <p style="font-size:12px;color: #FE3737;line-height: initial;position: absolute;">{{modalValidate.errorPoint}}</p>
        </FormItem>
        <!-- 通过记录选项卡需要显示的数据 -->
        <!-- 加盟费支付信息 -->
        <div class="jiameng-info" v-if="isShowJiamengPayInfo&&initialMoney>0">
          <vertical-title title="加盟费支付信息" style="font-size:13px;margin-bottom:10px;"></vertical-title>
          <div class="jiameng-info-content">
            <div class="product-detail-item">
              <p>
                加盟费：
                <span style="color:#FE3737;font-size:14px;">￥{{initialMoney}}</span>
              </p>
            </div>
            <div class="collect-account">
              收款账户：
              <!-- 余额支付 -->
              <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==1">
                线上结算-余额
              </div>
              <!-- 微信支付 -->
              <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==2">
                线上结算-微信
              </div>
              <!-- 支付宝支付 -->
              <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==3">
                线上结算-支付宝
              </div>
			  <!-- 通联支付 -->
              <div style="display:inline-block;vertical-align: top;" v-if="initialPayType==11">
                通联支付
              </div>
              <!-- 银行账户 -->
              <div
                style="display:inline-block;vertical-align: top;width:245px;"
                v-if="initialPayType==9"
              >
                线下结算-银行账户
                <div
                  style="margin-top:10px;word-break:break-all;"
                >{{initialPayInfo.account_name+'/'+initialPayInfo.bank+'/'+initialPayInfo.account}}</div>
              </div>
              <!-- 支付宝账户 -->
              <div
                style="display:inline-block;vertical-align: top;width:250px;"
                v-if="initialPayType==8"
              >
                线下结算-支付宝账户
                <div
                  style="margin-top:10px;word-break:break-all;"
                >{{initialPayInfo.account_name+'/'+initialPayInfo.account}}</div>
              </div>
              <!-- 支付宝收款码 -->
              <div style="display:inline-block;" v-if="initialPayType==7">
                线下结算-支付宝收款码
                <div class="hover-img">
                  <img
                    style="width:30px;height:30px"
                    :src="$store.state.siteComdataPath + initialPayInfo.account"
                    alt
                  />
                  <div class="mask" @click="showBigImg(initialPayInfo.account)">
                    <Icon type="ios-eye-outline" color="white" size="20"></Icon>
                  </div>
                </div>
              </div>
              <!-- 微信收款码 -->
              <div style="display:inline-block;" v-if="initialPayType==6">
                线下结算-微信收款码
                <div class="hover-img">
                  <img
                    style="width:30px;height:30px"
                    :src="$store.state.siteComdataPath + initialPayInfo.account"
                    alt
                  />
                  <div class="mask" @click="showBigImg(initialPayInfo.account)">
                    <Icon type="ios-eye-outline" color="white" size="20"></Icon>
                  </div>
                </div>
              </div>
            </div>
            <div class="pay-order" v-if="initialPayType ==9 || initialPayType ==8 || initialPayType ==7 || initialPayType ==6">
              支付凭证：
              <div
                style="display:inline-block;margin-right:10px;"
                class="show-big-picture"
                v-for="(item,index) in initialPayCertificate"
                :key="index"
              >
                <div class="mask" @click="showBigImg(item)">
                  <Icon type="ios-eye-outline" color="white" size="20"></Icon>
                </div>
                <img :src="$store.state.siteComdataPath + item" alt />
              </div>
              <span style="color:#9ea4b1">(点击查看大图)</span>
            </div>
          </div>
        </div>
        <!-- 申请代理的审核情况 -->
        <div class="agent-verify-audit-modal-info" v-if="selectMemberInfo">
          <vertical-title
            :title="!applyEaxist && selectMemberInfo.auto_upgrade_data ? '自动升级代理情况' : '申请代理的审核情况'"
          ></vertical-title>
          <div class="agent-verify-audit-modal-info-content">
            <div class="agent-verify-audit-modal-info-member">
              <img
                :src="selectMemberInfo.headurl ? getHeadImg(selectMemberInfo.headurl) : require('../images/head-portrait.png')"
              />
              <div>
                <div
                  style="display: inline-block;text-align: left;max-width: 100%;padding: 0 15px;"
                >
                  <member-infor
                    :id="selectMemberInfo.member_id"
                    :nickname="selectMemberInfo.nickname"
                    :mobile="selectMemberInfo.member_mobile"
                    :name="selectMemberInfo.name || '--'"
                  ></member-infor>
                </div>
              </div>
            </div>
            <div class="agent-verify-audit-modal-info-apply">
              <p>
                <span>
                  申请代理等级：
                  <dd
                    style="display: inline;color: #FE3737;"
                  >{{levelName[selectMemberInfo.agent_apply_level - 1] || "暂无"}}</dd>
                </span>
              </p>
              <p>
                <span>申请代理时间：{{selectMemberInfo.created_at}}</span>
              </p>
              <p v-if="!applyEaxist">
                <span v-if="!selectMemberInfo.auto_upgrade_data">申请条件：无条件</span>
                <template v-else>
                  <span>自动升级条件：</span>
                  <span style="max-width: calc(100% - 84px);">
                    <span v-if="selectMemberInfo.auto_upgrade_data.text.or.length">【</span>
                    <template v-for="(item, index) in selectMemberInfo.auto_upgrade_data.text.or">
                      <span
                        v-if="index !== 0"
                        :key="'ort' + index"
                        style="margin: 0 9px;color: #4A6AF5;"
                      >或</span>
                      <span :key="'or' + index">{{item}}</span>
                    </template>
                    <span v-if="selectMemberInfo.auto_upgrade_data.text.or.length">】</span>
                    <template v-for="(item, index) in selectMemberInfo.auto_upgrade_data.text.and">
                      <span
                        :key="'andt' + index"
                        v-if="index !== 0 || selectMemberInfo.auto_upgrade_data.text.or.length"
                        style="margin: 0 9px;color: #4A6AF5;"
                      >与</span>
                      <span :key="'and' + index">【{{item}}】</span>
                    </template>
                  </span>
                </template>
              </p>
              <template v-else>
                <p>
                  <span>申请条件：提交申请资料</span>
                </p>
                <p>
                  <span>提交资料：类型-{{selectMemberInfo.business_type ? "企业" : "个人"}}</span>
                </p>
              </template>

              <template v-for="(item,index) in applyData">
                <p :key="index" v-if="applyShowParams(index)">
                  <span>{{item}}：</span>
                  <span
                    class="agent-verify-audit-modal-info-apply-img"
                    v-if="['idcard_file', 'business_license_file'].includes(index)"
                    @click="(imageViewSrc = selectMemberInfo[index]) && (imageViewStatus = true)"
                  >
                    &nbsp;
                    <img :src="getHeadImg(selectMemberInfo[index])" />
                    <span>
                      <i data-v-4e63a2bc class="ivu-icon ivu-icon-ios-eye-outline"></i>
                    </span>
                  </span>
                  <!-- 性别 -->
                  <span v-else-if="index === 'sex'">{{["保密", "男", "女"][selectMemberInfo[index]]}}</span>
                  <!-- 地址 -->
                  <template v-else-if="index === 'address'">
                    <span
                      style="max-width: calc(100% - 72px);display: inline-block;"
                    >{{getAddressShow(selectMemberInfo.prov,selectMemberInfo.city,selectMemberInfo.area)}}</span>
                    <div style="margin-top: 15px;">
                      <span>详细地址：</span>
                      <span>{{selectMemberInfo[index]}}</span>
                    </div>
                  </template>
                  <!-- 其他 -->
                  <span v-else>{{selectMemberInfo[index]}}</span>
                </p>
              </template>
              <template v-if="selectMemberInfo.extend_fields">
                <template v-for="(item,index) in JSON.parse(selectMemberInfo.extend_fields)">
                  <p :key="index" v-if="item.value">
                    <span>{{item.name}}：{{item.value}}</span>
                  </p>
                </template>
              </template>
            </div>
          </div>
        </div>
      </Form>
    </Modal>

    <Modal fullscreen v-model="imageViewStatus" footer-hide>
      <img
        style="display: block;position: absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;max-width: calc(100vw - 48px);max-height: calc(100vh - 48px);"
        :src="getHeadImg(imageViewSrc)"
        v-if="imageViewSrc"
        alt
      />
    </Modal>

    <!-- 显示大图弹窗 -->
    <Modal class="big-img-modal" v-model="isShowBigImg" fullscreen footer-hide>
      <img
        v-if="currentImage"
        style="display: block;position: absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;max-width: calc(100vw - 48px);max-height: calc(100vh - 48px);"
        :src="$store.state.siteComdataPath+currentImage"
        alt
      />
    </Modal>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import verticalTitle from "@/views/shop/components/titlebar/vertical-line-titlebar.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import cityData from "@/views/shop/components/cityDataThree";
let areaData = {
  prov: {},
  city: {},
  area: {}
};
cityData[0].provinceArr.forEach(item => {
  areaData.prov[item.value] = item;
  item.children.forEach(item1 => {
    areaData.city[item1.value] = item1;
    item1.children.forEach(item2 => {
      areaData.area[item2.value] = item2;
    });
  });
});
const applyData = {
  company: "公司名称",
  business_license: "营业执照号",
  business_license_file: "上传营业执照",
  idcard: "身份证号",
  idcard_file: "上传身份证",
  applicant: "申请人",
  mobile: "手机号码",
  sex: "性别",
  address: "地址信息",
  remark: "备注"
};
const searchData = {
  keyword: "",
  level: -1,
  beingTime: {
    startTime: "",
    endTime: ""
  }
};
const levelName = ["一级代理", "二级代理", "三级代理"];
export default {
  components: {
    searchList,
    commonTable,
    verticalTitle,
    memberInfor
  },
  inject: ["yunzhiHome"],
  data() {
    searchData.keyword = this.$route.query.keyword || ""
    let tabNameArray = ["audit", "passed", "reject"];
    const columns = [
      {
        title: "申请人",
        render: (h, params) => {
            return h(memberInfor, {
                props:{
                    id:Number(params.row.member_id),
                    headurl:this.padImgUrl(params.row.headurl) ||
                        "images/head-portrait.png",
                    nickname:params.row.nickname,
                    mobile:params.row.member_mobile,
                    name:params.row.name ||'--'
                },
                attrs: {
                    perm: "member.detail.view"
                }
            });
        }
      },
      {
        title: "身份/等级",
        align: "left",
        render: (h, params) => {
          return h("div", [
            h("div", "会员：" + (params.row.level_name || "--")),
            this.hasLicensePerm("ENABLE_DISTRIBUTION")
              ? h(
                  "div",
                  params.row.distribution_level
                    ? {}
                    : {
                        style: {
                          display: "inline-block",
                          padding: "0 4px",
                          backgroundColor: "#DCDEE2"
                        }
                      },
                  params.row.distribution_level
                    ? "分销商：" + params.row.distribution_level
                    : "非分销商"
                )
              : ""
          ]);
        }
      },
      {
        title: "申请代理等级",
        key: "agent_level",
        align: "left",
        render: (h, params) => {
          return h(
            "div",
            levelName[params.row.agent_apply_level - 1] || "暂无"
          );
        }
      },
      {
        align: "left",
        renderHeader: h => {
          return h(
            "div",
            this.tabIndex === 0
              ? "申请代理时间"
              : this.tabIndex === 1
              ? "审核时间"
              : "拒绝申请时间"
          );
        },
        render: (h, params) => {
          let time =
            params.row.status === 0
              ? params.row.created_at
              : params.row.passed_at;
          return h(
            "div",
            {
              style: {
                margin: "0 -3px"
              }
            },
            time
              ? [
                  h(
                    "div",
                    {
                      style: {
                        display: "inline-block",
                        margin: "0 3px"
                      }
                    },
                    time.split(/\s/)[0]
                  ),
                  h(
                    "div",
                    {
                      style: {
                        display: "inline-block"
                      }
                    },
                    time.split(/\s/)[1]
                  )
                ]
              : "- - -"
          );
        }
      },
      {
        title: "状态",
        align: "center",
        render: (h, params) => {
          return h("div", [
            h(
              "span",
              {
                class:
                  params.row.status === 0
                    ? "table-warning"
                    : params.row.status === 1
                    ? "table-success"
                    : "table-error"
              },
              params.row.status === 0
                ? "待审核"
                : params.row.status === 1
                ? "已通过"
                : "已拒绝"
            )
          ]);
        }
      },
      {
        title: "操作",
        align: "center",
        width: 120,
        render: (h, params) => {
          let columnElm = [
            h(
              "span",
              {
                style: {
                  marginRight: params.row.status === 1 ? "" : "10px"
                },
                class: {
                  "table-operation": true
                },
                attrs: {
                  perm:
                    params.row.status === 0
                      ? "member.detail.view"
                      : "agent.review.view"
                },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      this.$router.push({
                        name: "memberDetail",
                        query: {
                          id: params.row.member_id,
                          tab: params.row.status === 1 ? 2 : 0
                        }
                      });
                    } else if (params.row.status === 1) {
                      this.isVerify = false;
                      this.selectMemberInfo = this.agentList[params.index];
                      this.initialPayType = this.selectMemberInfo
                        .initial_pay_type
                        ? this.selectMemberInfo.initial_pay_type
                        : null;
                      this.initialPayStatus = this.selectMemberInfo
                        .initial_pay_status
                        ? this.selectMemberInfo.initial_pay_status
                        : null;
                      this.initialPayInfo = this.selectMemberInfo.initial_pay_history_info;
                      this.initialMoney = this.selectMemberInfo.initial_money;

                      this.initialPayCertificate = this.selectMemberInfo.initial_pay_certificate;
                      this.modalVerifyStatus = true;
                      this.selectMemberInfo.initial_money != null
                        ? (this.isShowJiamengPayInfo = true)
                        : (this.isShowJiamengPayInfo = false);
                      this.isShowJiameng = false;
                    } else {
                      this.$Modal.info({
                        title: "拒绝原因",
                        render: h => {
                          return h(
                            "div",
                            { style: { wordBreak: "break-all" } },
                            params.row.reject_reason
                          );
                        }
                      });
                    }
                  }
                }
              },
              params.row.status === 0
                ? "查看详情"
                : params.row.status === 1
                ? "查看详情"
                : "查看原因"
            )
          ];
          if (params.row.status !== 1) {
            columnElm.push(
              h(
                "span",
                {
                  style: {
                    marginRight: "10px"
                  },
                  class: {
                    "table-operation": true
                  }
                },
                "|"
              )
            );
          }
          if (params.row.status !== 1) {
            columnElm.push(
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "agent.review.operate"
                  },
                  on: {
                    click: () => {
                      if (params.row.status === 0) {
                        this.isVerify = true;
                        this.verifySelect = 1;
                        this.receive_initial_money = false;
                        this.selectMemberInfo = this.agentList[params.index];
                        this.initialPayType = this.selectMemberInfo
                          .initial_pay_type
                          ? this.selectMemberInfo.initial_pay_type
                          : null;
                        this.offline_or_online = this.selectMemberInfo.offline_or_online
                        this.initialPayStatus = this.selectMemberInfo
                          .initial_pay_status
                          ? this.selectMemberInfo.initial_pay_status
                          : null;
                        this.initialPayInfo = this.selectMemberInfo.initial_pay_history_info;
                        this.initialMoney = this.selectMemberInfo.initial_money;

                        this.isShowJiamengPayInfo = false;
                        this.isShowJiameng = true;
                        this.initialPayCertificate = this.selectMemberInfo.initial_pay_certificate;
                        this.modalVerifyStatus = true;
                      } else {
                        this.$Modal.confirm({
                          title: "删除",
                          content: "确定删除该代理审核记录？",
                          okText: "删除",
                          cancelText: "取消",
                          onOk: () => {
                            this.$httpPost(
                              "/shop/admin/apply/agent/reject/delete",
                              { member_id: params.row.member_id },
                              res => {
                                if (res.code === 200) {
                                  this.$Message.success("删除成功");
                                  this.currentPage = 1;
                                  this.getList();
                                } else {
                                  this.$Message.error(res.msg);
                                }
                              }
                            );
                          }
                        });
                      }
                    }
                  }
                },
                params.row.status === 0 ? "审核" : "删除"
              )
            );
          }
          return h("div", columnElm);
        }
      }
    ];
    return {
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[this.$route.query.tab || 0] ? tabNameArray[this.$route.query.tab || 0] : tabNameArray[0],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      isVerify: false, // 是否是审核弹窗
      modalVerifyStatus: false,
      modalVerifyLoading: true,
      verifyStockStatus: false, //是否弹出库存提示弹窗
      selectMemberInfo: null,
      initialPayType: null,
      initialPayStatus:null,//判断是否支付加盟费
      initialMoney: "0.00",
      initialPayInfo: "",
      initialPayCertificate: [], //支付凭证
      isShowBigImg: false, //显示大图
      isShowRedTextClass: false,
      isShowJiameng: false, //是否显示加盟费
      isShowJiamengPayInfo: false, //是否显示加盟支付信息
      currentImage: "", //当前图片
      imageViewStatus: false,
      imageViewSrc: "",
      levelName,
      applyData,
      verifySelect: 1, //审核通过与拒绝
      receive_initial_money: false, //线下付款确认
      offline_or_online:0,//线上或线下支付
      selectTableData: [],
      modalValidate: {
        reason: "",
        errorPoint:''
      },
      ruleValidate: {
        reason: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (
                (!this.selectMemberInfo || this.verifySelect === -1) &&
                !value.trim().length
              ) {
                  this.modalValidate.errorPoint = '请输入拒绝原因';
                return callback(new Error("请输入拒绝原因"));
              }
              this.modalValidate.errorPoint = '';
              return callback();
            },
            trigger: "blur"
          }
        ],
        receive_initial_money: {
          validator: (rule, value, callback) => {
            if (!this.receive_initial_money) {
              return callback(new Error("请勾选我已收到线下付款"));
            }
            return callback();
          }
        }
      },
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机号"
        },
        {
          type: 3,
          key: "level",
          name: "申请代理等级：",
          options: [
            { id: -1, value: "全部" },
            { id: 1, value: levelName[0] },
            { id: 2, value: levelName[1] },
            { id: 3, value: levelName[2] }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "申请代理时间："
        }
      ],
      tableLoading: false,
      searchData: Object.assign({}, searchData),
      columnsData1: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          className: "agent-list-selection",
          align: "center"
        },
        ...columns
      ],
      columnsData2: columns,
      agentList: []
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    },
    tabChangeFlag() {
      this.$router.replace({
        name: "agentVerify",
        query: {
          tab: this.tabIndex
        }
      });
      this.agentList = [];
      this.total = 0;
      this.currentPage = 1;
      this.searchParams.forEach(item => {
        if (item.key === "beingTime") {
          this.$set(
            item,
            "name",
            ["申请代理时间：", "审核时间：", "拒绝申请时间："][this.tabIndex]
          );
        }
      });
      this.searchData = Object.assign({}, searchData);
    }
  },
  computed: {
    tabIndex() {
      return this.tabChangeArray.findIndex(n => n === this.tabChangeFlag);
    },
    /**
     * 申请部分需要显示的字段
     */
    applyShowParams() {
      return key => {
        return (
          this.selectMemberInfo &&
          (this.selectMemberInfo.business_type ||
            !["company", "business_license", "business_license_file"].includes(
              key
            )) &&
          this.selectMemberInfo[key]
        );
      };
    },
    applyEaxist() {
      let status =
        this.selectMemberInfo &&
        (Object.keys(applyData).filter(
          n => this.applyShowParams(n) && this.selectMemberInfo[n]
        ).length ||
          JSON.parse(this.selectMemberInfo.extend_fields || "[]").filter(
            n => n.value
          ).length);
      return !!status;
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    // 初始化时清空一下时间选择框
    this.searchData.beingTime.startTime = "";
    this.searchData.beingTime.endTime = "";
    this.getList();
  },
  methods: {
    changeCheckStatus() {
      this.isShowRedTextClass = false;
    },
    // 显示大图片
    showBigImg(image) {
      this.currentImage = image;
      this.isShowBigImg = true;
    },
    getAddressShow(...list) {
      if (
        areaData.prov[list[0]] &&
        areaData.city[list[1]] &&
        areaData.area[list[2]]
      ) {
        return [
          areaData.prov[list[0]].label,
          areaData.city[list[1]].label,
          areaData.area[list[2]].label
        ].join("");
      } else {
        return "";
      }
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    padImgUrl(url) {
      if (!url) {
        return;
      }
      if (/^http/i.test(url)) {
        return url;
      } else {
        return this.$store.state.siteComdataPath + url;
      }
    },
    onPageChange(page) {
      this.currentPage = page;
      this.getList();
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getList();
    },
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/apply/agent/list",
        {
          page: this.currentPage,
          page_size: this.pageSize,
          keyword: this.searchData.keyword,
          agent_apply_level:
            this.searchData.level === -1 ? "" : this.searchData.level,
          [this.tabIndex === 0 ? "created_at_start" : "passed_at_start"]: this
            .searchData.beingTime.startTime,
          [this.tabIndex === 0 ? "created_at_end" : "passed_at_end"]: this
            .searchData.beingTime.endTime,
          status: [0, 1, -1][this.tabIndex]
        },
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          this.selectTableData = [];
          if (res.code === 200) {
            this.agentList = res.data.list;
            this.agentList.forEach(item => {
              if (item.auto_upgrade_data) {
                item.auto_upgrade_data = JSON.parse(item.auto_upgrade_data);
              }
            });

            this.pageSize = res.data.page_size;
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
    },
    /**
     * 批量拒绝
     */
    onBatchRejectClick() {
      if (!this.selectTableData.length) {
        this.$Message.error("请选择还没有审核的会员");
        return;
      } else {
        this.isVerify = true;
        this.selectMemberInfo = null;
        this.modalVerifyStatus = true;
        this.isShowJiameng = false;
      }
    },
    /**
     * 选中的数据
     */
    onSelectionChange(selectData) {
      this.selectTableData = selectData;
    },
    /**
     * 状态改变还原验证
     */
    onVerifyModalChange(status) {
      if (status) {
        this.$refs["modalValidate"].resetFields();
      }
    },
    // 点击确定
    onVerifyComfirmClick() {
      if (!this.isVerify) {
        this.modalVerifyStatus = false;
        return;
      }
      let status = true;
      this.$refs["modalValidate"].validate(valid => {
        status = valid;
      });

      if (!status) {
        this.$Message.error("审核失败");
        this.resetModalLoading();
        return;
      }

      if (
        !this.receive_initial_money &&
        this.verifySelect === 1 &&
        this.initialMoney > 0 &&
        this.initialPayType >3 && this.initialPayType < 11
      ) {
        this.$Message.error("审核失败，请确认已收到线下付款");
        this.isShowRedTextClass = true;
        this.resetModalLoading();
        return;
      }

      if (!this.selectMemberInfo) {
        this.rejectMember({
          member_id: this.selectTableData.map(item => item.member_id),
          status: -1,
          reject_reason: this.modalValidate.reason
        });
      } else if (this.verifySelect == -1) {
        this.rejectMember({
          member_id: this.selectMemberInfo.member_id,
          status: -1,
          reject_reason: this.modalValidate.reason
        });
      } else {
        let data = {
          member_id: this.selectMemberInfo.member_id,
          status: this.verifySelect,
          reject_reason: this.modalValidate.reason,
          receive_initial_money: this.receive_initial_money ? 1 : 0
        };
        this.rejectMember(data);
      }
    },
    rejectMember(data) {
      this.$httpPost("/shop/admin/agent/verify", data, res => {
        if (res.code === 200) {
          this.$Message.success(data.status === 1 ? "审核成功" : "拒绝成功");
          this.modalVerifyStatus = false;
          this.currentPage = 1;
          this.getList();
        } else {
          this.resetModalLoading();
          this.$Message.error(res.msg);
        }
      });
    },
    resetModalLoading() {
      this.modalVerifyLoading = false;
      this.$nextTick(() => {
        this.modalVerifyLoading = true;
      });
    },
    // 关闭库存弹窗前做判断
    agentAddConfirmed(val) {
      if (val) {
        let data = {
          member_id: this.selectMemberInfo.member_id,
          status: this.verifySelect,
          reject_reason: this.modalValidate.reason,
          ignore_no_sell: 1
        };
        this.rejectMember(data);
      } else {
        this.modalVerifyStatus = false;
        this.verifyStockStatus = false;
        this.$Message.error("审核失败");
      }
    }
  }
};
</script>
<style lang="less" scoped>
.agent-verify {
  /deep/.ivu-tabs {
    .ivu-tabs-bar {
      margin-bottom: 0;
      padding: 0 24px;
    }
  }

  /deep/.ivu-table-wrapper {
    /deep/.ivu-table-row {
      & > td {
        &:last-child {
          .ivu-table-cell {
            padding: 0px;
          }
        }
      }
    }
  }
  .agent-verify-content {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
  }

  /*/deep/.agent-list-selection {*/
    /*& + th .ivu-table-cell,*/
    /*& + td .ivu-table-cell {*/
      /*padding-left: 0;*/
    /*}*/
  /*}*/
}
// 审核弹窗
.agent-verify-change-modal {
  &:not(.agent-verify-change-modal-verify) {
    /deep/.ivu-modal-footer .ivu-btn-text {
      display: none;
    }
  }
  /deep/.ivu-modal-body {
    padding: 24px;
    .agent-verify-audit-modal-info {
      background-color: #F5F6F7;
      border-radius: 4px;
      .vertical-line-titlebar-wrapper {
        height: 40px;
        line-height: 40px;
        padding-left: 9px;
        font-size: 13px;
        border-bottom: 1px solid #DCDEE2;
      }
      .agent-verify-audit-modal-info-content {
        position: relative;
        padding: 20px 0;
        display: flex;

        .agent-verify-audit-modal-info-member {
          width: 200px;
          text-align: center;
          img {
            height: 48px;
            width: 48px;
            display: block;
            margin: 4px auto 12px;
            border-radius: 5px;
          }
        }
        .agent-verify-audit-modal-info-apply {
          width: calc(100% - 200px);
          padding-right: 14px;
          box-sizing: border-box;
          p {
            position: relative;
            word-break: break-all;
            & > span {
              vertical-align: top;
              &:last-child {
                display: inline-block;
                position: relative;
                max-width: calc(100% - 72px);
              }
              &.agent-verify-audit-modal-info-apply-img {
                img {
                  position: absolute;
                  top: 50%;
                  left: 0;
                  transform: translateY(-50%);
                  width: 42px;
                  height: 26px;
                  cursor: pointer;
                }
                span {
                  max-width: initial;
                  position: absolute;
                  width: 42px;
                  height: 26px;
                  top: 50%;
                  left: 0;
                  transform: translateY(-50%);
                  display: none;
                  text-align: center;
                  cursor: pointer;
                  background-color: rgba(0, 0, 0, 0.5);
                  i {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                    width: 20px;
                    height: 20px;
                    font-size: 20px;
                    color: #fff;
                  }
                }
                &:hover {
                  span {
                    display: block;
                  }
                }
              }
            }
            & + p {
              margin-top: 15px;
            }
          }
        }
      }
    }

    .ivu-form-item {
      margin-bottom: 20px;
      .ivu-form-item-label {
        height: 32px;
      }
      .ivu-form-item-content {
        .product-detail-item {
          font-size: 14px;
          font-weight: bold;
        }
        .ivu-radio-group {
          // font-size: 0;
          vertical-align: baseline;
          .ivu-radio-wrapper{
            margin-right:20px;
            vertical-align: baseline;
          }
        }

        .warning-text {
          color: #f00;
          /deep/.ivu-checkbox {
            border: 1px solid #f00;
            height: 15px;
            vertical-align: text-bottom;
          }
        }
      }
    }

    .left.ivu-form-item {
      display: inline-block;
      margin-right: 38px;
      .ivu-form-item-content {
        margin-left: 37px !important;
        &::after {
          content: "";
          top: 0;
          bottom: 0;
          right: -38px;
          position: absolute;
          border-left: 1px dashed #f7f7f7;
          background: #ccc;
        }
      }
    }

    .right.ivu-form-item {
      display: inline-block;
      .ivu-form-item-content {
        /*width: 310px;*/
        margin-left: 20px !important;
        &::before {
          content: "";
          top: 0;
          bottom: 0;
          margin-left: -21px;
          position: absolute;
          border-left: 1px dashed #f7f7f7;
          background: #ccc;
        }
        img {
          width: 40px;
          height: 40px;
          display: inline-block;
          vertical-align: middle;
          border-radius: 4px;
          margin-left: 10px;
        }
        .collect-account {
          margin-top: 10px;
          line-height: 1;
          .hover-img {
            position: relative;
            display: inline-block;
            .mask {
              cursor: pointer;
              display: none;
              position: absolute;
              top: 0;
              width: 30px;
              height: 30px;
              line-height: 27px;
              margin-left: 10px;
              border-radius: 4px;
              text-align: center;
              background: rgba(0, 0, 0, 0.5);
            }
            &:hover {
              .mask {
                display: block;
              }
            }
          }
        }
      }

      .show-big-picture {
        .mask {
          cursor: pointer;
          display: none;
          position: absolute;
          width: 40px;
          height: 40px;
          line-height: 36px;
          margin-right: 10px;
          border-radius: 4px;
          text-align: center;
          background: rgba(0, 0, 0, 0.5);
        }
        &:hover {
          .mask {
            display: block;
          }
        }
      }
    }

    .ivu-input-wrapper {
      height: 50px;
      textarea {
        width: 250px;
        height: 50px;
        resize: none;
      }
    }
    .agent-verify-audit-modal-textarea-num {
      position: absolute;
      font-size: 12px;
      line-height: 12px;
      color: #9ea4b1;
      left: 212px;
      top: 30px;
    }
    .agent-verify-audit-modal-textarea {
      margin: 10px 0 24px;
      .ivu-input-wrapper {
        height: 80px;
        textarea {
          height: 80px;
        }
      }
    }

    .jiameng-info {
      .jiameng-info-content {
        border: 1px dashed #e3e5e8;
        margin-bottom: 28px;
        border-radius: 4px;
        padding: 20px 0 20px 20px;

        .pay-order {
          margin-top: 16px;
          .show-big-picture {
            margin-right: 10px;
            vertical-align: middle;
            img {
              width: 40px;
              height: 40px;
            }
            .mask {
              cursor: pointer;
              display: none;
              position: absolute;
              width: 40px;
              height: 40px;
              line-height: 36px;
              border-radius: 4px;
              text-align: center;
              background: rgba(0, 0, 0, 0.5);
            }
            &:hover {
              .mask {
                display: block;
              }
            }
          }
        }

        .collect-account {
          margin-top: 16px;
          .hover-img {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            margin-left: 10px;
            font-size: 0;
            .mask {
              cursor: pointer;
              display: none;
              position: absolute;
              top: 0;
              left: 0;
              width: 30px;
              height: 30px;
              line-height: 27px;
              border-radius: 4px;
              text-align: center;
              background: rgba(0, 0, 0, 0.5);
            }
            &:hover {
              .mask {
                display: block;
              }
            }
          }
        }
      }
    }
  }
}

.big-img-modal {
  /deep/.ivu-modal-content {
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
