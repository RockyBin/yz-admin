<template>
  <div class="areaagent-list">
    <div class="areaagent-list-head">
      <verticalLineTitlebar>
        <div>
          <span>目前拥有：</span><span>{{ total }}</span
          ><span>名区域代理商</span>
        </div>
      </verticalLineTitlebar>
    </div>
    <div class="areaagent-list-content">
      <add-more
        text="新增区代"
        perm="area.agent.operate"
        @onAddMoreClick="onAddAreaAgent"
      ></add-more>
      <search-list
        :searchParams="searchParams"
        :search-data="searchData"
        @on-change="onSearchSelectChange"
      >
      </search-list>
      <common-table
        ref="exportTable"
        :minWidth="1071"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-show="listData.length"
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
    <modal-add
      :modalType="modalType"
      v-model="modalAddStatus"
      :selectedMember="memberSelectData"
      :selectedArea="selectedAreaData"
      :areaBind="areaBind"
      ref="modalMemberSelect"
      @onSelectMemberClick="onSelectMemberClick"
      @onSelectAreaClick="onSelectAreaClick"
      @onConfirmClick="onConfirmClick"
    />
    <modal-add-area
      v-model="isShowAreaSelect"
      @onGetAreaData="onGetAreaData"
    ></modal-add-area>
    <select-modal
      title="选择会员"
      ref="memberSelectModal"
      :width="500"
      optionsText="全部会员"
      :columns="memberModalColumn"
      :searchData="memberSearchData"
      :headList="memberLevelData"
      headName="name"
      :selectData="memberSelectData"
      :tableData="tableMemberData"
      placeholder="昵称/姓名/手机号"
      v-model="memberModalStatus"
      @getList="onGetMemberList"
      @onGetSelectData="onGetMemberSelectData"
    />
  </div>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import cityData from "@/views/shop/components/cityDataThree";
import modalAdd from "./components/areaagent-list-modal-add";
import modalAddArea from "./components/areaagent-list-modal-add-area";
import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
const getNewArea = (list) => {
  return list.map((item) => {
    let item1 = { ...item };
    item1.id = item1.value;
    item1.value = item1.label;
    return item1;
  });
};
let province = getNewArea(cityData[0].provinceArr);
const dropDownName = ["edit", "cancel"];
const searchData = {
  keyword: "",
  area_type: -1,
  prov: -1,
  city: -1,
  district: -1,
  beingTime: {
    startTime: "",
    endTime: "",
  },
  status: 1,
};
export default {
  components: {
    verticalLineTitlebar,
    addMore,
    searchList,
    commonTable,
    modalAdd,
    modalAddArea,
    selectModal,
  },
  data() {
    return {
      currentRow: null,
      isdropDownVisible: false,
      modalType: "add", //add新增区代,modify修改区代, recover恢复区代资格
      areaBind: false, //是否绑定区域，用于恢复时的判断
      modalAddStatus: false,
      isShowAreaSelect: false,
      memberModalColumn: [
        {
          title: "会员信息",
          minWidth: 227,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.id),
                headurl:
                  this.formatURL(params.row.headurl) ||
                  require("@/views/shop/images/head-portrait.png"),
                nickname: params.row.nickname,
                mobile: params.row.mobile,
                name: params.row.name || "--",
              },
              attrs: {
                perm: "member.detail.view",
              },
            });
          },
        },
        {
          title: "会员等级",
          width: 142,
          key: "level_name",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.level > 0 ? params.row.level_name : "--"),
              params.row.status == 0
                ? h("span", { class: "table-error" }, "封号")
                : null,
            ]);
          },
        },
      ],
      memberSearchData: {
        searchName: "",
        selectClass: 0,
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      memberLevelData: [],
      memberSelectData: null,
      selectedAreaData: [],
      tableMemberData: [],
      memberModalStatus: false,
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "昵称/姓名/手机",
          prefixIcon: "ios-search",
        },
        {
          type: 3,
          key: "area_type",
          width: 98,
          name: "区域级别：",
          options: [
            { id: -1, value: "全部" },
            { id: 10, value: "  省代" },
            { id: 9, value: "市代" },
            { id: 8, value: "区代" },
          ],
        },
        {
          type: 3,
          key: "prov",
          combine: "agentarea",
          width: 140,
          name: "代理区域：",
          options: [{ id: -1, value: "所有省份" }, ...province],
        },
        {
          type: 3,
          key: "city",
          combine: "agentarea",
          width: 140,
          options: [{ id: -1, value: "所有城市" }],
        },
        {
          type: 3,
          key: "district",
          combine: "agentarea",
          width: 140,
          options: [{ id: -1, value: "所有区/县" }],
        },
        {
          type: 2,
          key: "beingTime",
          name: "成为区代时间：",
        },
        {
          type: 3,
          key: "status",
          width: 98,
          name: "状态：",
          options: [
            { id: -1, value: "全部" },
            { id: 1, value: "启用" },
            { id: -2, value: "禁用" },
          ],
        },
      ],
      searchData: Object.assign(JSON.parse(JSON.stringify(searchData)), {
        keyword: this.$route.params.keyword || ""
      }),
      tableLoading: false,
      columnsData: [
        {
          title: "区域代理信息",
          minWidth: 286,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.member_id),
                headurl:
                  this.formatURL(params.row.headurl) ||
                  require("@/views/shop/images/head-portrait.png"),
                nickname: params.row.nickname,
                mobile: params.row.member_mobile,
                name: params.row.name || "--",
              },
              attrs: {
                perm: "member.detail.view",
              },
            });
          },
        },
        {
          title: "级别/区域",
          minWidth: 240,
          render: (h, params) => {
            return params.row.area_list && params.row.area_list.length ? h("Tooltip",
              {
                props: {
                  placement: "top",
                  "max-width": 500,
                  transfer: true
                }
              },
              [
                h("div", {}, this.getAreaNodeList(h, params.row.area_list)),
                h("div", {slot: "content"}, this.getAreaNodeList(h, params.row.area_list, true))
              ]
            ) : h("div", "--");
          },
        },
        {
          title: "返佣总收益/可提现",
          minWidth: 180,
          render: (h, params) => {
            return h("div", [
              h("div", "总收益：￥" + params.row.commission_total),
              h("div", "可提现：￥" + params.row.commission_can_use),
            ]);
          },
        },
        {
          title: "成为区代时间",
          minWidth: 160,
          align: "center",
          render: (h, params) => {
            return params.row.created_at
              ? h(
                  "div",
                  {
                    style: {
                      marginLeft: "-5px",
                    },
                  },
                  [
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          marginLeft: "5px",
                        },
                      },
                      params.row.created_at.split(/\s/)[0]
                    ),
                    h("br"),
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          marginLeft: "5px",
                        },
                      },
                      params.row.created_at.split(/\s/)[1]
                    ),
                  ]
                )
              : h("div", "- - -");
          },
        },
        {
          title: "状态",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "div",
              {
                class:
                  params.row.status === -2 ? "table-error" : "table-success",
              },
              params.row.status === -2 ? "禁用" : "启用"
            );
          },
        },
        {
          title: "操作",
          align: "center",
          minWidth: 172,
          render: (h, params) => {
            let detailBtn = h(
              "span",
              {
                class: {
                  "table-operation": true,
                },
                attrs: {
                  perm: "member.detail.view",
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "memberDetail",
                      query: {
                        id: params.row.member_id,
                        tab: 4,
                      },
                    });
                  },
                },
              },
              "查看详情"
            );
            let line = h(
              "span",
              {
                style: {
                  margin: "0 10px",
                },
                class: {
                  "table-operation": true,
                },
              },
              "|"
            );
            let createDropdownItem = function(name, text, perm) {
              return h(
                "DropdownItem",
                {
                  props: {
                    name: name,
                  },
                  style: {
                    width: "60px",
                    padding: "3px 0",
                    fontSize: "12px !important",
                  },
                  attrs: {
                    class: "ivu-dropdown-item primary-hover-font-bg",
                    perm: perm + "",
                  },
                },
                text
              );
            };
            let dropTimer = null;
            let dropdown = h(
              "Dropdown",
              {
                props: {
                  trigger: "click",
                  transfer: true,
                },
                style: {
                  width: "60px",
                },
                on: {
                  "on-click": (name) => {
                    this.onDropDownClick(name, params.row);
                  },
                  "on-visible-change": (visible) => {
                    this.isdropDownVisible = visible;
                    this.currentRow = params.row;

                    // 在关闭下拉显示的时候会有一瞬间的跳动，需要手动等待动画结束时隐藏一下
                    window.clearTimeout(dropTimer);
                    if (!visible) {
                      dropTimer = window.setTimeout(() => {
                        dropdown.componentInstance.$refs["drop"].$el &&
                          (dropdown.componentInstance.$refs[
                            "drop"
                          ].$el.style.display = "none");
                      }, 300);
                    }
                  },
                },
              },

              [
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true,
                    },
                  },
                  [
                    "更多",
                    h("Icon", {
                      props: {
                        type:
                          this.isdropDownVisible &&
                          this.currentRow == params.row
                            ? "ios-arrow-up"
                            : "ios-arrow-down",
                      },
                    }),
                  ]
                ),
                h(
                  "DropdownMenu",
                  {
                    slot: "list",
                    style: { margin: "-5px 0", minWidth: "60px" },
                  },
                  [
                    createDropdownItem(
                      dropDownName[0],
                      "修改区域",
                      "area.agent.operate"
                    ),
                    createDropdownItem(
                      dropDownName[1],
                      params.row.status === 1 ? "取消资格" : "恢复资格",
                      "area.agent.operate"
                    ),
                  ]
                ),
              ]
            );
            return h("div", [
              params.row.status === -2 ? "" : detailBtn,
              params.row.status === -2 ? "" : line,
              dropdown,
            ]);
          },
        },
      ],
      listData: [],
      formItem: null,
      total: 0,
      pageSize: 20,
      currentPage: 1,
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    console.log(this.$route)
    this.getAreaagentList();
  },
  watch: {
    searchData: {
      handler() {
        this.onPageChange(1);
      },
      deep: true,
    },
  },
  methods: {
    formatURL(url) {
      return url
        ? /^http/.test(url)
          ? url
          : this.$store.state.siteComdataPath + url
        : "";
    },
    /**
     * 获取区代区域展示虚拟节点
     */
    getAreaNodeList(h, list, isToolTip) {
      var provList = list.filter(item => item.area_type == 10);
      var cityList = list.filter(item => item.area_type == 9);
      var districtList = list.filter(item => item.area_type == 8);
      return [
        provList.length && h("div", {
          style: { display: "flex" }
        }, [
          h("span", { style: { "flex-shrink": 0 } }, "省代："),
          h("span", { class: isToolTip ? "" : "one-hide" }, provList.map(item => item.prov_text).join("；"))
        ]),
        cityList.length && h("div", {
          style: { display: "flex" }
        }, [
          h("span", { style: { "flex-shrink": 0 } }, "市代："),
          h("span", { class: isToolTip ? "" : "one-hide" }, cityList.map(item => item.prov_text + "-"+ item.city_text).join("；"))
        ]),
        districtList.length && h("div", {
          style: { display: "flex" }
        }, [
          h("span", { style: { "flex-shrink": 0 } }, "区代："),
          h("span", { class: isToolTip ? "" : "one-hide" }, districtList.map(item => item.prov_text + "-"+ item.city_text + "-" + item.district_text).join("；"))
        ])
      ].filter(item => item);
    },
    /**
     * 获取搜索条件
     */
    getSearrchData() {
      let data = { ...this.searchData };
      ["area_type", "prov", "city", "district", "status"].forEach((n) => {
        if (data[n] === -1) {
          data[n] = "";
        }
      });
      data.created_at_start = data.beingTime.startTime;
      data.created_at_end = data.beingTime.endTime;
      delete data.beingTime;
      return data;
    },
    /**
     * 获取列表数据
     */
    getAreaagentList() {
      let data = {
        page_size: this.pageSize,
        page: this.currentPage,
        ...this.getSearrchData(),
      };
      this.tableLoading = true;
      this.$httpPost("/shop/admin/area/agent/list", data, (res) => {
        this.$store.state.COMMON_loading = false;
        this.tableLoading = false;
        if (res.code === 200) {
          this.listData = res.data.list || [];
          this.currentPage = Number(res.data.current);
          this.pageSize = Number(res.data.page_size);
          this.total = Number(res.data.total);
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 选择会员
     */
    onSelectMemberClick() {
      this.memberModalStatus = true;
    },
    /**
     * 选择区域
     */
    onSelectAreaClick() {
      this.isShowAreaSelect = true;
    },
    addNewErrorCallback() {
      this.$Message.error("请通知会员绑定手机号才能新增身份");
      this.$refs.modalMemberSelect.modalLoading = false;
      this.$nextTick(() => {
        this.$refs.modalMemberSelect.modalLoading = true;
      });
    },
    /**
     * 新增/修改/恢复操作
     */
    onConfirmClick(info, callback) {
      let data = {
        member_id: this.memberSelectData.member_id || this.memberSelectData.id,
        area_list: this.selectedAreaData.map(item => {
          return {
            area_type: item.area_type,
            prov: item.prov,
            city: item.city,
            district: item.district
          };
        })
      };
      if (this.modalType == "add") {
        if (!/^\d{11}$/.test(this.memberSelectData.mobile)) {
          this.addNewErrorCallback();
          return;
        }
        this.$httpPost("/shop/admin/area/agent/add", data, res => {
          if (res.code === 200) {
            callback();
            this.$Message.success("新增成功");
            this.onPageChange(1);
          } else if (res.code === 410) {
            callback();
            this.$Modal.confirm({
              title: "提示",
              okText: "前往处理",
              render: h => {
                return h(
                  "div",
                  `你所添加的区域代理【${
                    this.memberSelectData.nickname
                  }】，已是区域代理身份，但处于【禁用】状态，可前往<区代列表>对会员恢复区域代理资格。`
                );
              },
              onOk: () => {
                this.searchData = Object.assign(
                  JSON.parse(JSON.stringify(searchData)),
                  {
                    keyword:
                      this.memberSelectData.mobile ||
                      this.memberSelectData.nickname,
                    status: -2
                  }
                );
              },
            });
          } else if (res.code === 411) {
            callback();
            this.$Modal.confirm({
              title: "提示",
              okText: "前往处理",
              render: h => {
                return h(
                  "div",
                  `你所添加的区域代理【${
                    this.memberSelectData.nickname
                  }】已经提交了区域代理申请，可前往<区代审核-待审核>对会员进行区代代理审核处理。`
                );
              },
              onOk: () => {
                // 跳转到申请
                this.$router.push({
                  name: "areaagentVerify",
                  query: {
                    keyword:
                      this.memberSelectData.mobile ||
                      this.memberSelectData.nickname
                  }
                });
              }
            });
          } else if (res.code === 459) {
            this.addNewErrorCallback();
          } else {
            callback();
            this.$Message.error(res.msg);
          }
        });
      } else if (this.modalType == "modify") {
        this.$httpPost("/shop/admin/area/agent/modify/area", data, (res) => {
          callback();
          if (res.code === 200) {
            this.$Message.success("修改成功");
            this.getAreaagentList();
          } else {
            this.$Message.error(res.msg);
          }
        });
      } else {
        this.$httpPost("/shop/admin/area/agent/recover", data, (res) => {
          callback();
          if (res.code === 200) {
            this.$Message.success("恢复成功");
            this.getAreaagentList();
          } else {
            this.$Message.error(res.msg);
          }
        });
      }
    },
    /**
     * 添加区域
     */
    onGetAreaData(data) {
      this.selectedAreaData.unshift({
        area_type: data.area_type,
        prov: data.province,
        city: data.city,
        district: data.area
      });
    },
    /**
     * 获取会员选择ID
     */
    onGetMemberSelectData(data) {
      if (data && data.status == 0) {
        return this.$Message.error("该会员已被封号，请重新选择");
      }
      this.memberSelectData = data;
      this.memberModalStatus = false;
    },
    /**
     * 获取会员列表
     */
    onGetMemberList(searchData) {
      this.memberSearchData = searchData;
      let data = {
        keyword: searchData.searchName,
        page: searchData.currentPage,
        page_size: searchData.pageSize,
        is_area_agent: 0,
      };
      if (searchData.selectClass) {
        data.level = searchData.selectClass;
      }
      this.$httpPost("/shop/admin/member/list", data, (res) => {
        if (res.code === 200) {
          this.tableMemberData = res.data.list || [];
          this.memberLevelData = res.data.member_level_list || [];
          this.memberSearchData.currentPage = Number(res.data.current);
          this.memberSearchData.pageSize = Number(res.data.page_size);
          this.memberSearchData.total = Number(res.data.total);
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 更多按钮弹出的下拉按钮
     */
    onDropDownClick(name, data) {
      switch (name) {
        case dropDownName[0]:
          this.modalType = "modify";
          this.memberSelectData = {
            ...data,
            id: data.member_id,
            mobile: data.member_mobile,
          };
          this.selectedAreaData = data.area_list.map(item => {
            return {
              area_type: item.area_type,
              prov: item.prov,
              city: item.city,
              district: item.district,
            }
          });
          this.modalAddStatus = true;
          break;
        case dropDownName[1]:
          this.changeAreaagentStatus(data);
          break;
        default:
          break;
      }
    },
    /**
     * 修改区代状态
     */
    changeAreaagentStatus(data) {
      if (data.status === 1) {
        this.onCancelAreaagentClick(data);
      } else {
        this.onRecoverAreaagentClick(data);
      }
    },
    /**
     * 恢复区代资格
     */
    onRecoverAreaagentClick(data) {
      this.modalType = "recover";
      this.memberSelectData = {
        ...data,
        id: data.member_id,
        mobile: data.member_mobile,
      };
      this.selectedAreaData = data.area_list.map(item => {
        return {
          area_type: item.area_type,
          prov: item.prov,
          city: item.city,
          district: item.district,
        }
      });
      this.areaBind = data.area_list.length != 0;
      this.modalAddStatus = true;
    },
    /**
     * 取消区代资格
     */
    onCancelAreaagentClick(data) {
      let form;
      this.formItem = {
        bind: null,
      };
      this.$Modal.confirm({
        title: "提示",
        render: (h) => {
          form = h(
            "Form",
            {
              props: {
                model: this.formItem,
              },
            },
            [
              h(
                "FormItem",
                {
                  props: {
                    prop: "bind",
                    rules: {
                      validator: (rule, value, callback) => {
                        if (value !== null) {
                          return callback();
                        } else {
                          return callback("请选择是否继续绑定区域");
                        }
                      },
                    },
                  },
                },
                [
                  h(
                    "RadioGroup",
                    {
                      props: {
                        value: this.formItem.bind,
                      },
                      on: {
                        "on-change": (val) => {
                          this.$set(this.formItem, "bind", val);
                        },
                      },
                    },
                    [
                      h(
                        "Radio",
                        {
                          props: {
                            label: 0,
                          },
                        },
                        "绑定"
                      ),
                      h(
                        "Radio",
                        {
                          props: {
                            label: 1,
                          },
                        },
                        "不绑定"
                      ),
                    ]
                  ),
                ]
              ),
            ]
          );
          return h("div", [
            h(
              "div",
              `是否确定取消【${
                data.nickname
              }】的区域代理商资格，取消后，不能参与区域返佣；同时是否对代理的区域继续进行绑定？`
            ),
            form,
          ]);
        },
        loading: true,
        onOk: () => {
          form.componentInstance.validate((valid) => {
            if (valid) {
              this.cancelAreaagent({
                member_id: data.member_id,
                unbind: this.formItem.bind,
              });
            } else {
              this.$nextTick(() => {
                form.context.buttonLoading = false;
              });
            }
          });
        },
      });
    },
    cancelAreaagent(data) {
      this.$httpPost("/shop/admin/area/agent/cancel", data, (res) => {
        this.$Modal.remove();
        if (res.code === 200) {
          this.$Message.success("取消成功");
          this.getAreaagentList();
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 新增区代
     */
    onAddAreaAgent() {
      this.modalAddStatus = true;
      this.modalType = "add";
      this.memberSelectData = null;
      this.selectedAreaData = [];
      this.$refs["memberSelectModal"].resetData();
    },
    onSearchSelectChange(newData, oldData) {
      let provinceStatus = newData.prov !== (oldData && oldData.prov);
      let cityStatus = newData.city !== (oldData && oldData.city);
      // 如果是省或城市修改才需要改下拉框内容
      if (provinceStatus || cityStatus) {
        this.searchParams.forEach((item) => {
          // 如果是修改了省才需要改市的选择
          if (provinceStatus && item.key === "city") {
            let options = [{ id: -1, value: "所有城市" }];
            let selectProvince = province.find((n) => n.id === newData.prov);
            if (selectProvince && selectProvince.children) {
              options.push(...getNewArea(selectProvince.children));
            }
            this.$set(item, "options", options);
            this.$set(newData, "city", -1);
            this.$set(newData, "district", -1);
          }
          // 不管是改省或市都需要更新市的选择
          if (cityStatus && item.key === "district") {
            let options = [{ id: -1, value: "所有区/县" }];
            let selectProvince = province.find((n) => n.id === newData.prov);
            if (selectProvince && selectProvince.children) {
              let selectCity = getNewArea(selectProvince.children).find(
                (n) => n.id === newData.city
              );
              if (selectCity && selectCity.children) {
                options.push(...getNewArea(selectCity.children));
              }
            }
            this.$set(item, "options", options);
            this.$set(newData, "district", -1);
          }
        });
      }
    },
    /**
     * 分页跳转
     */
    onPageChange(index) {
      this.currentPage = index;
      this.getAreaagentList();
    },
    /**
     * 页数变化
     */
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getAreaagentList();
    },
  },
};
</script>
<style lang="less" scoped>
.areaagent-list {
  .areaagent-list-head {
    padding: 0 24px;
    border-bottom: 1px solid #eeeeee;
    /deep/.vertical-line-titlebar-wrapper {
      height: 50px;
      line-height: 50px;
      font-weight: bold;
      .title {
        span:nth-child(2) {
          color: #ff9900;
          margin-right: 3px;
        }
      }
    }
  }
  .areaagent-list-content {
    padding: 24px 24px 0;
  }
}
</style>
