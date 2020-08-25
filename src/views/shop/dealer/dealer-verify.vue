<template>
  <div class="agent-verify" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false">
      <TabPane
        :label="
          () => {
            return $createElement('div', `待审核`);
          }
        "
        :name="tabChangeArray[0]"
      ></TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `通过记录`);
          }
        "
        :name="tabChangeArray[1]"
      ></TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `拒绝记录`);
          }
        "
        :name="tabChangeArray[2]"
      ></TabPane>
    </Tabs>
    <div class="agent-verify-content">
      <search-list
        :searchParams="searchParams"
        :search-data="searchData"
        :onLine="true"
      />
      <common-table
        :minWidth="1158"
        :loading="tableLoading"
        :columnsData="
          tabIndex === 0
            ? columnsData1
            : tabIndex === 1
            ? columnsData2
            : columnsData3
        "
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
      v-if="selectMemberInfo"
      v-model="modalVerifyStatus"
      :title="verifyModalName"
      class="agent-verify-change-modal"
      :class="{ 'agent-verify-change-modal-verify': isVerify }"
      :width="600"
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
        <FormItem label="审核：" v-show="isVerify" style="margin-top: -10px;">
          <RadioGroup
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
        <FormItem class="left" v-show="initialMoney > 0 && verifySelect === 1">
          <div class="product-detail-item" v-if="offline_or_online">
            <p>请确认已收到加盟费！</p>
            <p style="color:#FE3737;">加盟费：￥{{ initialMoney }}</p>
          </div>
          <div class="product-detail-item" v-else-if="!offline_or_online">
            <p>已收到加盟费！</p>
            <p style="color:#FE3737;">加盟费：￥{{ initialMoney }}</p>
          </div>
          <Checkbox
            v-if="offline_or_online"
            v-model="receive_initial_money"
            @on-change="changeCheckStatus"
            :class="{ 'warning-text': isShowRedTextClass }"
            >我已收到线下付款</Checkbox
          >
        </FormItem>
        <FormItem class="right" v-show="initialMoney > 0 && verifySelect === 1">
          <div class="pay-order" v-if="!offline_or_online">
            <p>线上支付系统自动完成入账</p>
          </div>
          <div class="pay-order" v-else>
            支付凭证：
            <div
              style="display:inline-block;margin-right: 10px;"
              class="show-big-picture"
              v-for="(item, index) in initialPayCertificate"
              :key="index"
            >
              <div class="mask" @click="showBigImg(item)">
                <Icon type="ios-eye-outline" color="white" size="20"></Icon>
              </div>
              <img
                style="margin-left:0px;"
                :src="$store.state.siteComdataPath + item"
                alt
              />
            </div>
            <span style="color: #9EA4B1;">(点击查看大图)</span>
          </div>
          <div class="collect-account">
            收款账户：
            <!-- 余额支付 -->
            <div
              style="display:inline-block;vertical-align: top;"
              v-if="initialPayType == 1"
            >
              线上结算-余额
            </div>
            <!-- 微信支付 -->
            <div
              style="display:inline-block;vertical-align: top;"
              v-if="initialPayType == 2"
            >
              线上结算-微信
            </div>
            <!-- 支付宝支付 -->
            <div
              style="display:inline-block;vertical-align: top;"
              v-if="initialPayType == 3"
            >
              线上结算-支付宝
            </div>
            <!-- 通联支付 -->
            <div
              style="display:inline-block;vertical-align: top;"
              v-if="initialPayType == 11"
            >
              通联支付
            </div>
            <!-- 银行账户 -->
            <div
              style="display:inline-block;vertical-align: top;width:245px;"
              v-if="initialPayType == 9"
            >
              线下结算-银行账户
              <div style="word-break:break-all;">
                <span style="margin-top:10px;display:inline-block">{{
                  initialPayInfo.account_name + "/"
                }}</span>
                <span style="margin-top:10px;display:inline-block">{{
                  initialPayInfo.bank + "/"
                }}</span>
                <span style="margin-top:10px;display:inline-block">{{
                  initialPayInfo.account
                }}</span>
              </div>
            </div>
            <!-- 支付宝账户 -->
            <div
              style="display:inline-block;vertical-align: top;"
              v-if="initialPayType == 8"
            >
              线下结算-支付宝账户
              <div style="margin-top:10px;">
                {{ initialPayInfo.account_name + "/" + initialPayInfo.account }}
              </div>
            </div>
            <!-- 支付宝收款码 -->
            <div style="display:inline-block;" v-if="initialPayType == 7">
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
            <div style="display:inline-block;" v-if="initialPayType == 6">
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
        <div
          v-show="initialPayStatus == 1 && isVerify && verifySelect === -1"
          style="margin-bottom: 15px"
        >
          <Icon
            type="md-alert"
            style="color: #FF9900;font-size: 16px;margin-right: 8px;vertical-align:text-bottom;margin-left: 3px;"
          />
          <span
            v-if="initialPayStatus == 1 && offline_or_online"
            style="font-size:12px;color: #FE3737;line-height: initial;"
            >您可能已收取用户的加盟费，请到线下处理退款！</span
          >
          <span
            v-else-if="initialPayStatus == 1 && !offline_or_online"
            style="font-size:12px;color: #FE3737;line-height: initial;"
            >您已收取用户的加盟费，请到线下处理退款！</span
          >
        </div>
        <FormItem
          label="拒绝原因："
          style="margin-bottom: 30px;"
          prop="reason"
          v-show="isVerify && verifySelect === -1"
        >
          <Input
            class="common-input-text-260"
            placeholder="请输入拒绝原因"
            :maxlength="20"
            v-model="modalValidate.reason"
            type="textarea"
          />
          <div class="agent-verify-audit-modal-textarea-num">
            {{ modalValidate.reason.length }}/20
          </div>
          <p
            style="font-size:12px;color: #FE3737;line-height: initial;position: absolute;"
          >
            {{ modalValidate.errorPoint }}
          </p>
        </FormItem>
        <!-- 通过记录选项卡需要显示的数据 -->
        <!-- 加盟费支付信息 -->
        <div
          class="jiameng-info"
          v-if="isShowJiamengPayInfo && initialMoney > 0"
        >
          <vertical-title
            title="加盟费支付信息"
            style="font-size:13px;margin-bottom:10px;"
          ></vertical-title>
          <div class="jiameng-info-content">
            <div class="product-detail-item">
              <p>
                加盟费：
                <span style="color:#FE3737;font-size:14px;"
                  >￥{{ initialMoney
                  }}{{
                    modalValidate.initial_payee
                      ? "(上级经销商收取）"
                      : "（公司收取）"
                  }}</span
                >
              </p>
            </div>
            <div class="collect-account">
              收款账户：
              <!-- 余额支付 -->
              <div
                style="display:inline-block;vertical-align: top;"
                v-if="initialPayType == 1"
              >
                线上结算-余额
              </div>
              <!-- 微信支付 -->
              <div
                style="display:inline-block;vertical-align: top;"
                v-if="initialPayType == 2"
              >
                线上结算-微信
              </div>
              <!-- 支付宝支付 -->
              <div
                style="display:inline-block;vertical-align: top;"
                v-if="initialPayType == 3"
              >
                线上结算-支付宝
              </div>
              <!-- 通联支付 -->
              <div
                style="display:inline-block;vertical-align: top;"
                v-if="initialPayType == 11"
              >
                通联支付
              </div>
              <!-- 银行账户 -->
              <div
                style="display:inline-block;vertical-align: top;width:245px;"
                v-if="initialPayType == 9"
              >
                线下结算-银行账户
                <div style="margin-top:10px;word-break:break-all;">
                  {{
                    initialPayInfo.account_name +
                      "/" +
                      initialPayInfo.bank +
                      "/" +
                      initialPayInfo.account
                  }}
                </div>
              </div>
              <!-- 支付宝账户 -->
              <div
                style="display:inline-block;vertical-align: top;width:250px;"
                v-if="initialPayType == 8"
              >
                线下结算-支付宝账户
                <div style="margin-top:10px;word-break:break-all;">
                  {{
                    initialPayInfo.account_name + "/" + initialPayInfo.account
                  }}
                </div>
              </div>
              <!-- 支付宝收款码 -->
              <div style="display:inline-block;" v-if="initialPayType == 7">
                线下结算-支付宝收款码
                <img
                  style="width:30px;height:30px"
                  :src="$store.state.siteComdataPath + initialPayInfo.account"
                  alt
                />
              </div>
              <!-- 微信收款码 -->
              <div style="display:inline-block;" v-if="initialPayType == 6">
                线下结算-微信收款码
                <img
                  style="width:30px;height:30px"
                  :src="$store.state.siteComdataPath + initialPayInfo.account"
                  alt
                />
              </div>
            </div>
            <div
              class="pay-order"
              v-if="
                initialPayType == 9 ||
                  initialPayType == 8 ||
                  initialPayType == 7 ||
                  initialPayType == 6
              "
            >
              支付凭证：
              <div
                style="display:inline-block;margin-right:10px;"
                class="show-big-picture"
                v-for="(item, index) in initialPayCertificate"
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
        <!-- 申请经销商的审核情况 -->
        <div
          class="agent-verify-audit-modal-info"
          :class="{ 'agent-verify-audit-modal-info-verify': tabIndex === 0 }"
        >
          <vertical-title
            :title="
              !applyEaxist && selectMemberInfo.auto_upgrade_data
                ? '自动升级经销商情况'
                : '申请经销商的审核情况'
            "
          ></vertical-title>
          <div class="agent-verify-audit-modal-info-content">
            <div class="agent-verify-audit-modal-info-left">
              <dealer-verify-status
                :value="selectMemberInfo"
              ></dealer-verify-status>
            </div>
            <div class="agent-verify-audit-modal-info-right">
              <div class="agent-verify-audit-modal-info-member">
                <img
                  :src="
                    selectMemberInfo.headurl
                      ? getHeadImg(selectMemberInfo.headurl)
                      : require('../images/head-portrait.png')
                  "
                />
                <div style="margin-bottom: 12px;">
                  <member-infor
                    :id="selectMemberInfo.member_id"
                    :nickname="selectMemberInfo.nickname"
                    :mobile="selectMemberInfo.member_mobile"
                    :name="selectMemberInfo.name || '--'"
                  ></member-infor>
                </div>
              </div>
              <div class="agent-verify-audit-modal-info-apply">
                <p>
                  <span>
                    申请等级：
                    <dd style="display: inline;color: #FE3737;">
                      {{
                        (selectMemberInfo.apply_condition &&
                          selectMemberInfo.apply_condition
                            .dealer_apply_level_name) ||
                          selectMemberInfo.level_name ||
                          "暂无"
                      }}
                    </dd>
                  </span>
                </p>
                <p>
                  <span>
                    申请类型：
                    <dd style="display: inline;">
                      {{ ["个人", "企业"][selectMemberInfo.business_type] }}
                    </dd>
                  </span>
                </p>
                <p>
                  <span>申请时间：{{ selectMemberInfo.created_at }}</span>
                </p>
                <p v-if="!applyEaxist">
                  <span v-if="!selectMemberInfo.auto_upgrade_data"
                    >申请条件：无条件</span
                  >
                  <template v-else>
                    <span>自动升级条件：</span>
                    <span style="max-width: calc(100% - 84px);">
                      <span
                        v-if="selectMemberInfo.auto_upgrade_data.text.or.length"
                        >【</span
                      >
                      <template
                        v-for="(item, index) in selectMemberInfo
                          .auto_upgrade_data.text.or"
                      >
                        <span
                          v-if="index !== 0"
                          :key="'ort' + index"
                          style="margin: 0 9px;color: #4A6AF5;"
                          >或</span
                        >
                        <span :key="'or' + index">{{ item }}</span>
                      </template>
                      <span
                        v-if="selectMemberInfo.auto_upgrade_data.text.or.length"
                        >】</span
                      >
                      <template
                        v-for="(item, index) in selectMemberInfo
                          .auto_upgrade_data.text.and"
                      >
                        <span
                          :key="'andt' + index"
                          v-if="
                            index !== 0 ||
                              selectMemberInfo.auto_upgrade_data.text.or.length
                          "
                          style="margin: 0 9px;color: #4A6AF5;"
                          >与</span
                        >
                        <span :key="'and' + index">【{{ item }}】</span>
                      </template>
                    </span>
                  </template>
                </p>
                <template v-else>
                  <p>
                    <span>申请条件：提交申请资料</span>
                  </p>
                  <p>
                    <span
                      >提交资料：类型-{{
                        selectMemberInfo.business_type ? "企业" : "个人"
                      }}</span
                    >
                  </p>
                </template>

                <template v-for="(item, index) in applyData">
                  <p :key="index" v-if="applyShowParams(index)">
                    <span>{{ item }}：</span>
                    <span
                      class="agent-verify-audit-modal-info-apply-img"
                      v-if="
                        ['idcard_file', 'business_license_file'].includes(index)
                      "
                      @click="
                        (imageViewSrc = selectMemberInfo[index]) &&
                          (imageViewStatus = true)
                      "
                    >
                      &nbsp;
                      <img :src="getHeadImg(selectMemberInfo[index])" />
                      <span>
                        <i
                          data-v-4e63a2bc
                          class="ivu-icon ivu-icon-ios-eye-outline"
                        ></i>
                      </span>
                    </span>
                    <!-- 性别 -->
                    <span v-else-if="index === 'sex'">{{
                      ["保密", "男", "女"][selectMemberInfo[index]]
                    }}</span>
                    <!-- 地址 -->
                    <template v-else-if="index === 'address'">
                      <span
                        style="max-width: calc(100% - 72px);display: inline-block;"
                        >{{
                          getAddressShow(
                            selectMemberInfo.prov,
                            selectMemberInfo.city,
                            selectMemberInfo.area
                          )
                        }}</span
                      >
                      <div style="margin-top: 15px;">
                        <span>详细地址：</span>
                        <span>{{ selectMemberInfo[index] }}</span>
                      </div>
                    </template>
                    <!-- 其他 -->
                    <span v-else>{{ selectMemberInfo[index] }}</span>
                  </p>
                </template>
                <template v-if="selectMemberInfo.extend_fields">
                  <template
                    v-for="(item, index) in JSON.parse(
                      selectMemberInfo.extend_fields
                    )"
                  >
                    <p :key="index" v-if="item.value">
                      <span>{{ item.name }}：{{ item.value }}</span>
                    </p>
                  </template>
                </template>
              </div>
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
        :src="$store.state.siteComdataPath + currentImage"
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
import dealerVerifyStatus from "./components/dealer-verify-status";
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
  review_process: -1,
  beingTime: {
    startTime: "",
    endTime: ""
  }
};

const searchParams = [
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
    name: "申请等级：",
    options: [{ id: -1, value: "全部" }]
  },
  {
    type: 2,
    key: "beingTime",
    name: "申请经销商时间："
  }
];
const stepParam = {
  type: 3,
  key: "review_process",
  name: "审核进度：",
  options: [
    { id: -1, value: "全部" },
    { id: 1, value: "公司审核中" },
    { id: 2, value: "上级审核中" },
    { id: 3, value: "推荐人审核中" }
  ]
};
export default {
  components: {
    searchList,
    commonTable,
    verticalTitle,
    memberInfor,
    dealerVerifyStatus
  },
  inject: ["yunzhiHome"],
  data() {
    searchData.keyword = this.$route.query.keyword || "";
    let tabNameArray = ["audit", "passed", "reject"];
    let stepColumn = {
      title: "审核进度",
      minWidth: 114,
      render: (h, params) => {
        return h("div", [
          // 上级不是同一个的才有推荐人审核通过
          params.row.invite_review_member > 0 &&
          params.row.invite_review_member !== params.row.parent_review_member &&
          params.row.invite_review_status === 1
            ? h("div", "推荐人审核通过")
            : "",
          // 上级是会员的就有上级审核
          params.row.parent_review_member > 0 &&
          params.row.parent_review_status === 1
            ? h("div", "上级审核通过")
            : "",
          // 只要当前审核状态下及之后不是会员都是公司审核中
          (params.row.invite_review_member === 0 &&
            params.row.invite_review_status === 0 &&
            params.row.parent_review_member === 0) ||
          (params.row.invite_review_status === 1 &&
            params.row.parent_review_status === 0 &&
            params.row.parent_review_member === 0) ||
          (params.row.invite_review_status === 1 &&
            params.row.parent_review_status === 1)
            ? h("div", "公司审核中")
            : "",
          // 上级审核是会员(推荐人审了，或者没有推荐人，或者推荐人是同一个人)
          (params.row.invite_review_status === 1 ||
            params.row.invite_review_member === 0 ||
            params.row.invite_review_member ===
              params.row.parent_review_member) &&
          params.row.parent_review_member > 0 &&
          params.row.parent_review_status === 0
            ? h("div", "上级审核中")
            : "",
          // 推荐人审核通过一样
          params.row.invite_review_member > 0 &&
          params.row.invite_review_member !== params.row.parent_review_member &&
          params.row.invite_review_status === 0
            ? h("div", "推荐人审核中")
            : ""
        ]);
      }
    };
    return {
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[this.$route.query.tab || 0]
        ? tabNameArray[this.$route.query.tab || 0]
        : tabNameArray[0],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      isVerify: false, // 是否是审核弹窗
      modalVerifyStatus: false,
      modalVerifyLoading: true,
      selectMemberInfo: null,
      initialPayType: null,
      initialPayStatus: null, //判断是否支付加盟费
      initialMoney: "0.00",
      initialPayInfo: "",
      initialPayCertificate: [], //支付凭证
      isShowBigImg: false, //显示大图
      isShowRedTextClass: false,
      isShowJiamengPayInfo: false, //是否显示加盟支付信息
      currentImage: "", //当前图片
      imageViewStatus: false,
      imageViewSrc: "",
      applyData,
      verifySelect: 1, //审核通过与拒绝
      receive_initial_money: false, //线下付款确认
      offline_or_online: 0, //线上或线下支付
      selectTableData: [],
      modalValidate: {
        reason: "",
        errorPoint: ""
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
                this.modalValidate.errorPoint = "请输入拒绝原因";
                return callback(new Error("请输入拒绝原因"));
              }
              this.modalValidate.errorPoint = "";
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
      searchParams: searchParams.concat(),
      tableLoading: false,
      searchData: Object.assign({}, searchData),
      columnsData1: (() => {
        let showColumns = this.getColumnsData(0);
        showColumns.splice(showColumns.length - 2, 0, stepColumn);
        return showColumns;
      })(),
      columnsData2: this.getColumnsData(1),
      columnsData3: this.getColumnsData(2),
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
        name: "dealerVerify",
        query: {
          tab: this.tabIndex
        }
      });
      this.agentList = [];
      this.total = 0;
      this.currentPage = 1;
      this.setSearchParams();
      this.searchParams.forEach(item => {
        if (item.key === "beingTime") {
          this.$set(
            item,
            "name",
            ["申请经销商时间：", "通过时间：", "拒绝时间："][this.tabIndex]
          );
        }
      });
      this.searchData = Object.assign({}, searchData);
    }
  },
  computed: {
    /**
     * 审核弹窗标题
     */
    verifyModalName() {
      // 如果是还没有审核的情况
      if (this.selectMemberInfo.status === 0) {
        // 如果一级还没有审核
        if (this.selectMemberInfo.invite_review_status === 0) {
          // 如果上级和推荐人一样
          if (
            this.selectMemberInfo.invite_review_member ===
            this.selectMemberInfo.parent_review_member
          ) {
            return this.selectMemberInfo.invite_review_member > 0
              ? "待上级审核"
              : "待公司审核";
          } else {
            return "待推荐人审核";
          }
          // 如果上级还没有审核
        } else if (this.selectMemberInfo.parent_review_status === 0) {
          return this.selectMemberInfo.parent_review_member > 0
            ? "待上级审核"
            : "待公司审核";
          // 设置了必须公司审核
        } else {
          return "待公司审核";
        }
      } else {
        return this.selectMemberInfo.status === 1
          ? "成为经销商详情"
          : "拒绝记录";
      }
    },
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
    this.searchData.keyword = this.$route.query.keyword || "";
    this.setSearchParams();
    this.getDealerLevelList().then(() => {
      this.getList();
    });
  },
  methods: {
    setSearchParams() {
      if (this.tabIndex === 0) {
        this.searchParams.splice(2, 0, stepParam);
      } else {
        let index = this.searchParams.findIndex(
          n => n.key === "review_process"
        );
        index > -1 && this.searchParams.splice(2, 1);
      }
    },
    /**
     * 获取表格列
     */
    getColumnsData(index) {
      return [
        {
          title: "申请人信息",
          minWidth: [292, 296, 296][index],
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.member_id),
                headurl:
                  this.padImgUrl(params.row.headurl) ||
                  "images/head-portrait.png",
                nickname: params.row.nickname,
                mobile: params.row.member_mobile,
                  name:params.row.name||'--'
              },
              attrs: {
                perm: "member.detail.view"
              }
            });
          }
        },
        {
          title: "申请等级",
          minWidth: [150, 154, 154][index],
          render: (h, params) => {
            return h(
              "div",
              (params.row.apply_condition &&
                params.row.apply_condition.dealer_apply_level_name) ||
                params.row.level_name ||
                "暂无"
            );
          }
        },
        {
          title: "经销商推荐人",
          minWidth: [182, 208, 192][index],
          render: (h, params) => {
            return h("div", [
              params.row.invite_review_member
                ? h(
                    "div",
                    {
                      style: {
                        display: "-webkit-box",
                        overflow: "hidden",
                        "-webkit-box-orient": "vertical",
                        "text-overflow": "ellipsis",
                        "-webkit-line-clamp": 1
                      }
                    },
                    params.row.invite_nickname
                  )
                : "",
              params.row.invite_mobile
                ? h("div", params.row.invite_mobile)
                : "",
              params.row.invite_dealer_level
                ? ""
                : h(
                    "div",
                    {
                      style: {
                        display: "inline-block",
                        padding: "0px 4px",
                        backgroundColor: "#dcdee2"
                      }
                    },
                    !params.row.invite_review_member && !params.row.invite1 ?  "公司" : "非经销商"
                  )
            ]);
          }
        },
        {
          title: "上级领导",
          minWidth: [182, 208, 192][index],
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: {
                    display: "-webkit-box",
                    overflow: "hidden",
                    "-webkit-box-orient": "vertical",
                    "text-overflow": "ellipsis",
                    "-webkit-line-clamp": 1
                  }
                },
                params.row.parent_nickname
              ),
              params.row.parent_mobile ? h("div", params.row.parent_mobile) : ""
            ]);
          }
        },
        {
          minWidth: [98, 100, 100][index],
          renderHeader: h => {
            return h(
              "div",
              this.tabIndex === 0
                ? "申请时间"
                : this.tabIndex === 1
                ? "通过时间"
                : "拒绝时间"
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
          minWidth: [82, 86, 86][index],
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
          width: [56, 106, 134][index],
          render: (h, params) => {
            let columnElm = [
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm:
                      params.row.status == 0 && params.row.is_show_review
                        ? "dealer.review.operate"
                        : "dealer.review.view"
                  },
                  on: {
                    click: () => {
                      this.isVerify =
                        params.row.status === 0 && !!params.row.is_show_review;
                      this.verifySelect = 1;
                      this.receive_initial_money = false;
                      this.selectMemberInfo = this.agentList[params.index];
                      this.initialPayType = this.selectMemberInfo
                        .initial_pay_type
                        ? this.selectMemberInfo.initial_pay_type
                        : null;
                      this.offline_or_online = this.selectMemberInfo.offline_or_online;
                      this.initialPayStatus = this.selectMemberInfo
                        .initial_pay_status
                        ? this.selectMemberInfo.initial_pay_status
                        : null;
                      this.initialPayInfo = this.selectMemberInfo.initial_pay_history_info;
                      this.initialMoney = 0; //this.selectMemberInfo.initial_money;

                      this.isShowJiamengPayInfo =
                        this.selectMemberInfo.initial_money != null;
                      this.initialPayCertificate = this.selectMemberInfo.initial_pay_certificate;
                      this.modalVerifyStatus = true;
                    }
                  }
                },
                params.row.status === 0
                  ? params.row.is_show_review
                    ? "审核"
                    : "查看"
                  : params.row.status === 1
                  ? "查看申请条件"
                  : "查看原因"
              )
            ];
            if (params.row.status === -1) {
              columnElm.push(
                h(
                  "span",
                  {
                    style: {
                      marginLeft: "10px",
                      marginRight: "10px"
                    },
                    class: {
                      "table-operation": true
                    }
                  },
                  "|"
                )
              );
              columnElm.push(
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true
                    },
                    attrs: {
                      perm: "dealer.review.operate"
                    },
                    on: {
                      click: () => {
                        this.$Modal.confirm({
                          title: "删除",
                          content: "确定删除该经销商审核记录？",
                          okText: "删除",
                          cancelText: "取消",
                          onOk: () => {
                            this.$httpPost(
                              "/shop/admin/apply/dealer/reject/delete",
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
                  },
                  "删除"
                )
              );
            }
            return h("div", columnElm);
          }
        }
      ];
    },
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
    /**
     * 获取经销商等级
     */
    getDealerLevelList() {
      return new Promise(resolve => {
        this.$httpPost("/shop/admin/dealer/level/list", { is_hide: 0 }, res => {
          resolve();
          if (res.code === 200) {
            this.$set(
              this.searchParams.find(item => item.key === "level"),
              "options",
              [{ id: -1, value: "全部" }].concat(
                res.data.list.map(item => ({
                  id: item.id,
                  value: item.name
                }))
              )
            );
          }
        });
      });
    },
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/apply/dealer/list",
        {
          page: this.currentPage,
          page_size: this.pageSize,
          keyword: this.searchData.keyword,
          review_process:
            this.searchData.review_process === -1
              ? ""
              : this.searchData.review_process,
          dealer_apply_level:
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
        this.initialPayType > 3 &&
        this.initialPayType < 11
      ) {
        this.$Message.error("审核失败，请确认已收到线下付款");
        this.isShowRedTextClass = true;
        this.resetModalLoading();
        return;
      }
      if (this.verifySelect == -1) {
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
      this.$httpPost("/shop/admin/dealer/verify", data, res => {
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
    max-height: 490px;
    overflow-y: auto;
    .agent-verify-audit-modal-info {
      &.agent-verify-audit-modal-info-verify {
        background-color: #f5f6f7;
        border-radius: 4px;
        .vertical-line-titlebar-wrapper {
          border-bottom: 1px solid #dcdee2;
          padding-left: 20px;
          .bg-vert-line {
            display: none;
          }
        }
      }
      .vertical-line-titlebar-wrapper {
        height: 40px;
        line-height: 40px;
        font-size: 13px;
      }
      .agent-verify-audit-modal-info-content {
        display: flex;
        padding: 20px;
        background-color: #f5f6f7;
        border-radius: 4px;
        .agent-verify-audit-modal-info-left {
          width: 200px;
        }
        .agent-verify-audit-modal-info-right {
          position: relative;
          margin-left: 16px;
          flex: 1;
          .agent-verify-audit-modal-info-member {
            img {
              height: 48px;
              width: 48px;
              display: block;
              margin-bottom: 2px;
              border-radius: 5px;
            }
          }
          .agent-verify-audit-modal-info-apply {
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
          .ivu-radio-wrapper {
            margin-right: 20px;
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
      }
    }

    .right.ivu-form-item {
      display: inline-block;
      .ivu-form-item-content {
        /*width: 310px;*/
        margin-left: 20px !important;
        &::before {
          content: "";
          height: 100px;
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
          img {
            vertical-align: middle;
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

// 库存信息弹窗
.cloud-stock {
  /deep/.ivu-form-item {
    .ivu-form-item-content {
      margin-left: 0 !important;
      .cloud-store-title {
        margin-left: 34px;
      }

      .cloud-store-info {
        margin-left: 34px;
        background: #f7f7f7;
        .list-item {
          display: flex;
          padding-right: 20px;
          border: 1px solid #ccc;
          img {
            width: 60px;
            height: 60px;
            margin: 9px 10px 0 13px;
          }
          .container-box {
            flex: 1;
            display: inline-block;
            .title {
              margin-top: 15px;
              margin-bottom: 6px;
            }
            .tag {
              color: #999;
              font-size: 12px;
            }
            .first {
              margin-right: 5px;
            }
            .count {
              display: block;
              color: #666;
              font-size: 13px;
            }
          }

          .stock-status {
            display: flex;
            align-items: center;
            padding-left: 20px;
            border-left: 1px solid #ccc;
          }
        }
      }
    }
  }
}
</style>
