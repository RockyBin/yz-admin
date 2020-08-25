<template>
  <div class="main-board">
    <div class="content">
      <div class="row">
        <add-more text="新增员工" @onAddMoreClick="onAddCoupons" perm="staff.operate" v-show="showAdd"></add-more>
      </div>
      <div class="row" style="margin-bottom:20px">
        <Input
          class="input-role"
          v-model="keyword"
          prefix="ios-search"
          placeholder="姓名/账号/手机"
          @on-enter="(staffCurrentPage = 1) && searchTaffData()"
        />
        <span class="label">部门：</span>
        <singleSelect class="select-role" v-model="departmentID" :levelList="departmentList" />
        <span class="label">角色：</span>
        <Select class="select-role" v-model="roleID">
          <Option :value="-1">全部角色</Option>
          <Option v-for="(role, index) in allRoleList" :value="role.id" :key="index">{{ role.name }}</Option>
        </Select>
        <span class="label">状态：</span>
        <Select class="select-status" v-model="status" style="width: 100px;">
          <Option :value="-1">全部</Option>
          <Option :value="1">启用</Option>
          <Option :value="0">禁用</Option>
        </Select>
        <Button
          type="primary"
          style="width:58px;height:32px;margin-right:15px;"
          @click="searchTaffData"
        >查询</Button>
        <Button type="default" @click="onExportTableList">导出</Button>
      </div>
      <div class="wrapper1" style="min-width: 1158px;">
        <Table
          ref="staff"
          border
          :columns="staffColumns"
          :data="staffList"
          @on-selection-change="onSelectChange"
        ></Table>
      </div>
    </div>
    <div class="bar-pager">
      <Page
        v-if="staffTotal"
        :current="staffCurrentPage"
        :total="staffTotal"
        :page-size="staffPageSize"
        show-elevator
        show-sizer
        :transfer="true"
        @on-change="
          staffCurrentPage = $event;
          loadStaffData();
        "
        @on-page-size-change="
          staffPageSize = $event;
          staffCurrentPage = 1;
          loadStaffData();
        "
      />
    </div>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportList"
      @cancelExportList="cancelExportList"
    ></export-modal>
    <transfer-modal
      v-model="transferStatus"
      :dataInfo="dataInfo"
      :levelList="departmentList"
      :levelObj="departmentObj"
      @on-ok="onConfirmDeleteClick"
    ></transfer-modal>
  </div>
</template>
<script>
import axios from "axios";
import addMore from "@/views/shop/components/button/add-more.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import transferModal from "./components/setting-account-modal-transfer";
import singleSelect from "@/views/shop/components/selector/single-tree-select.vue";
export default {
  components: {
    addMore,
    exportModal,
    transferModal,
    singleSelect
  },
  data() {
    return {
      // 查询条件
      roleID: this.$route.params.role_id || -1,
      departmentID: -1,
      transferStatus: false,
      dataInfo: null,
      status:
        this.$route.params.status === undefined
          ? -1
          : this.$route.params.status,
      keyword: "",
      defaultImg: require("@/views/shop/images/head-portrait.png"),
      // 员工信息分页
      staffTotal: 0,
      staffCurrentPage: 1,
      staffPageSize: 20,
      selectedStaff: [],
      tableListExportStatus: false,
      exportData: {},
      staffSearchData: null,
      staffHasLoadLevel: false, // 判断是否加载过等级数据
      allRoleList: [],
      departmentList: [{ id: -1, name: "全部" }],
      departmentObj: {},
      staffList: [],
      showAdd: true,
      staffColumns: [
        {
          type: "selection",
          width: 40
        },
        {
          title: "员工信息",
          minWidth: 220,
          render: (h, params) => {
            return h(
              memberInfor,
              {
                props: {
                  idname: "OpenID",
                  goDetail: false,
                  headurl: this.getHeadImg(params.row.headurl)
                },
                attrs: {
                  perm: "member.detail.view"
                }
              },
              [
                h(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center"
                    }
                  },
                  [
                    h("div", { class: "one-hide" }, params.row.name),
                    params.row.role_id == 0
                      ? h(
                          "div",
                          {
                            class: "table-warning",
                            style: {
                              marginLeft: "10px"
                            }
                          },
                          "超管"
                        )
                      : ""
                  ]
                ),
                ,
                params.row.position
                  ? h(
                      "div",
                      {
                        style: {
                          color: "#9ea7b4",
                          fontSize: "12px"
                        }
                      },
                      "职位：" + params.row.position
                    )
                  : "",
                params.row.mobile
                  ? h(
                      "div",
                      {
                        style: {
                          color: "#9ea7b4",
                          fontSize: "12px"
                        }
                      },
                      "手机：" + params.row.mobile
                    )
                  : ""
              ]
            );
          }
        },
        {
          title: "登录账号",
          key: "username",
          minWidth: 180,
          align: "center"
        },
        {
          title: "部门",
          align: "center",
          minWidth: 146,
          render: (h, params) => {
            let department = this.departmentObj[params.row.department_id];
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                }
              },
              department
                ? [
                    h(
                      "div",
                      department.parent_id
                        ? department.parent_name
                        : department.name
                    ),
                    department.parent_id
                      ? h(
                          "div",
                          {
                            class: "table-second-level"
                          },
                          department.name
                        )
                      : ""
                  ]
                : "--"
            );
          }
        },
        {
          title: "发展会员",
          align: "center",
          minWidth: 180,
          render: (h, params) => {
            return h("div", [
              h("div", [
                "总会员：",
                h(
                  "span",
                  {
                    attrs: {
                      perm: params.row.member_count ? "member.view" : ""
                    },
                    style: params.row.member_count
                      ? ""
                      : "cursor: default;text-decoration: none;",
                    class: "table-operation",
                    on: {
                      click: () => {
                        params.row.member_count &&
                          this.$router.push({
                            name: "memberList",
                            params: {
                              keyword: params.row.mobile || params.row.name,
                              keyword_type: "2"
                            }
                          });
                      }
                    }
                  },
                  params.row.member_count
                )
              ]),
              this.hasLicensePerm("ENABLE_DISTRIBUTION") &&
              Number(params.row.distributor_count)
                ? h("div", [
                    "分销商：",
                    h(
                      "span",
                      {
                        attrs: {
                          perm: params.row.distributor_count
                            ? "member.view"
                            : ""
                        },
                        style: params.row.distributor_count
                          ? ""
                          : "cursor: default;text-decoration: none;",
                        class: "table-operation",
                        on: {
                          click: () => {
                            params.row.distributor_count &&
                              this.$router.push({
                                name: "memberList",
                                params: {
                                  keyword: params.row.mobile || params.row.name,
                                  keyword_type: "2",
                                  level_type: "2"
                                }
                              });
                          }
                        }
                      },
                      params.row.distributor_count
                    )
                  ])
                : "",
              this.hasLicensePerm("ENABLE_AGENT") &&
              Number(params.row.agent_count)
                ? h("div", [
                    "代理商：",
                    h(
                      "span",
                      {
                        attrs: {
                          perm: params.row.agent_count ? "member.view" : ""
                        },
                        style: params.row.agent_count
                          ? ""
                          : "cursor: default;text-decoration: none;",
                        class: "table-operation",
                        on: {
                          click: () => {
                            params.row.agent_count &&
                              this.$router.push({
                                name: "memberList",
                                params: {
                                  keyword: params.row.mobile || params.row.name,
                                  keyword_type: "2",
                                  level_type: "3"
                                }
                              });
                          }
                        }
                      },
                      params.row.agent_count
                    )
                  ])
                : "",
              this.hasLicensePerm("ENABLE_AREA_AGENT") &&
              Number(params.row.area_agent_count)
                ? h("div", [
                    "区域代理：",
                    h(
                      "span",
                      {
                        attrs: {
                          perm: params.row.area_agent_count ? "member.view" : ""
                        },
                        style: params.row.area_agent_count
                          ? ""
                          : "cursor: default;text-decoration: none;",
                        class: "table-operation",
                        on: {
                          click: () => {
                            params.row.area_agent_count &&
                              this.$router.push({
                                name: "memberList",
                                params: {
                                  keyword: params.row.mobile || params.row.name,
                                  keyword_type: "2",
                                  level_type: "5"
                                }
                              });
                          }
                        }
                      },
                      params.row.area_agent_count
                    )
                  ])
                : "",
              this.hasLicensePerm("ENABLE_CLOUDSTOCK") &&
              Number(params.row.dealer_count)
                ? h("div", [
                    "经销商：",
                    h(
                      "span",
                      {
                        attrs: {
                          perm: params.row.dealer_count ? "member.view" : ""
                        },
                        style: params.row.dealer_count
                          ? ""
                          : "cursor: default;text-decoration: none;",
                        class: "table-operation",
                        on: {
                          click: () => {
                            params.row.dealer_count &&
                              this.$router.push({
                                name: "memberList",
                                params: {
                                  keyword: params.row.mobile || params.row.name,
                                  keyword_type: "2",
                                  level_type: "4"
                                }
                              });
                          }
                        }
                      },
                      params.row.dealer_count
                    )
                  ])
                : "",
              this.hasLicensePerm("ENABLE_SUPPLIER") &&
              Number(params.row.supplier_count)
                ? h("div", [
                    "供应商：",
                    h(
                      "span",
                      {
                        attrs: {
                          perm: params.row.supplier_count ? "member.view" : ""
                        },
                        style: params.row.supplier_count
                          ? ""
                          : "cursor: default;text-decoration: none;",
                        class: "table-operation",
                        on: {
                          click: () => {
                            params.row.supplier_count &&
                              this.$router.push({
                                name: "memberList",
                                params: {
                                  keyword: params.row.mobile || params.row.name,
                                  keyword_type: "2",
                                  level_type: "6"
                                }
                              });
                          }
                        }
                      },
                      params.row.supplier_count
                    )
                  ])
                : ""
            ]);
          }
        },
        {
          title: "角色权限",
          key: "role_name",
          minWidth: 180,
          align: "center"
        },
        {
          title: "状态",
          key: "status",
          minWidth: 90,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                class: params.row.status ? "enabled" : "disabled"
              },
              params.row.status ? "启用" : "禁用"
            );
          }
        },
        {
          title: "操作",
          key: "action",
          minWidth: 160,
          align: "center",
          render: (h, params) => {
            var self = this;
            return [
              h(
                "a",
                {
                  attrs: {
                    class: "edit-link",
                    href: "javascript:void(0)"
                  },
                  on: {
                    click() {
                      self.$router.push({
                        name: "editStaff",
                        query: { staffId: params.row.id }
                      });
                    }
                  }
                },
                "编辑"
              ),
              params.row.role_type != 9 &&
                h(
                  "a",
                  {
                    style: {
                      marginRight: "10px"
                    }
                  },
                  "|"
                ),
              params.row.role_type != 9 &&
                h(
                  "a",
                  {
                    attrs: {
                      href: "javascript:void(0)",
                      perm: "staff.operate"
                    },
                    on: {
                      click() {
                        self.toggleStatus(params.row);
                      }
                    }
                  },
                  params.row.status ? "禁用" : "启用"
                ),
              params.row.role_type != 9 &&
                !params.row.status &&
                h(
                  "a",
                  {
                    style: {
                      margin: "0 10px"
                    }
                  },
                  "|"
                ),
              params.row.role_type != 9 &&
                !params.row.status &&
                h(
                  "a",
                  {
                    attrs: {
                      href: "javascript:void(0)",
                      perm: "staff.operate"
                    },
                    on: {
                      click() {
                        self.onDeleteRoleClick(params.row);
                      }
                    }
                  },
                  "删除"
                )
            ];
          }
        }
      ]
    };
  },
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.departmentID = this.$route.query.id;
    }
    this.searchTaffData();
  },
  methods: {
    onSelectChange(selectedStaff) {
      this.selectedStaff = selectedStaff;
    },
    // 取消导出
    cancelExportList() {
      this.tableListExportStatus = false;
    },
    // 导出当前页 0 导出所有 1
    exportList(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
        this.exportData.ids = undefined;
      } else {
        this.selectedStaff.forEach(item => {
          this.exportData.ids.push(item.id);
        });
      }
      commonFunction.exportTable(
        this.exportData,
        this.http,
        "shop/admin/staff/export"
      );
      this.tableListExportStatus = false;
    },
    // 导出功能
    onExportTableList() {
      if (this.selectedStaff.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.staffList.length > this.selectedStaff.length) {
        this.exportData.ids = [];
        this.selectedStaff.forEach(item => {
          this.exportData.ids.push(item.id);
        });

        commonFunction.exportTable(
          this.exportData,
          this.http,
          "shop/admin/staff/export"
        );
      } else {
        this.tableListExportStatus = true;
      }
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
    /**
     * 修改搜索条件并加载数据
     */
    searchTaffData() {
      this.staffSearchData = {
        status: this.status,
        role_id: this.roleID === -1 ? "" : this.roleID,
        department_id: this.departmentID === -1 ? "" : this.departmentID,
        keyword: this.keyword
      };
      this.loadStaffData();
    },
    /**
     * 点击删除
     */
    async onDeleteRoleClick(item) {
      if (!item.member_count) {
        this.$Modal.confirm({
          title: "提示",
          content: `是否确定删除员工【${item.name}】？`,
          onOk: () => {
            this.deleteRole(
              {
                id: item.id,
                delete_type: 0
              },
              "删除成功"
            );
          }
        });
      } else {
        let radioValue = 0;
        let okText = ["解绑并删除", "前往转移并删除"];
        this.$Modal.confirm({
          title: "提示",
          render: h => {
            let render = h("div", [
              h(
                "div",
                "删除员工【马云】后，员工将不能再访问您的后台系统，同时对绑定该员工的所有会员做以下操作："
              ),
              h(
                "RadioGroup",
                {
                  props: {
                    vertical: true,
                    value: radioValue
                  },
                  style: {
                    marginTop: "10px"
                  },
                  on: {
                    "on-change": val => {
                      radioValue = val;
                      render.context._data.okText = okText[val];
                    }
                  }
                },
                [
                  h(
                    "Radio",
                    {
                      props: {
                        label: 0
                      }
                    },
                    "把与该员工绑定的会员全部解绑"
                  ),
                  h(
                    "Radio",
                    {
                      props: {
                        label: 1
                      }
                    },
                    "转移给其他员工"
                  )
                ]
              )
            ]);
            return render;
          },
          okText: okText[0],
          onOk: () => {
            if (radioValue === 0) {
              this.deleteRole({
                id: item.id,
                delete_type: 0
              });
            } else {
              this.transferStatus = true;
              this.dataInfo = item;
            }
          }
        });
      }
    },
    onConfirmDeleteClick(id) {
      this.deleteRole({
        id: this.dataInfo.id,
        other_admin_id: id,
        delete_type: 1
      });
    },
    /**
     * 删除员工
     */
    deleteRole(data, text) {
      this.$httpPost("/shop/admin/staff/delete", data, res => {
        this.$Modal.remove();
        this.transferStatus = false;
        if (res.code === 200) {
          this.$Message.success(
            text || (data.delete_type ? "转移并删除成功" : "解绑并删除成功")
          );
          this.staffCurrentPage = 1;
          this.loadStaffData();
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    //获取员工列表
    loadStaffData() {
      this.$store.state.COMMON_loading = true;
      axios
        .get("/shop/admin/staff/list", {
          params: Object.assign(
            {
              page: this.staffCurrentPage,
              page_size: this.staffPageSize,
              show_role_list: this.staffHasLoadLevel ? 0 : 1,
              show_department_list: this.staffHasLoadLevel ? 0 : 1
            },
            this.staffSearchData
          )
        })
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            this.staffList = [];
            this.$nextTick(() => {
              this.staffList = res.data.list;
              this.staffTotal = res.data.total;
              this.showAdd = res.data.show_add;
              if (!this.staffHasLoadLevel) {
                this.allRoleList = res.data.role_list;
                let departmentList = [{ id: -1, name: "全部" }];
                let departmentObj = {};
                res.data.department_list.forEach(m => {
                  departmentList.push(m);
                  departmentObj[m.id] = m;
                  m.sub_list.forEach(n => {
                    departmentList.push(n);
                    departmentObj[n.id] = Object.assign({}, n, {
                      parent_name: m.name
                    });
                  });
                });
                this.departmentList = departmentList;
                this.departmentObj = departmentObj;
                this.staffHasLoadLevel = true;
              }
            });
          } else {
            this.roleTotal = 0;
            this.staffTotal = 0;
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.roleTotal = 0;
          this.staffTotal = 0;
          this.$store.state.COMMON_loading = false;
          this.$Message.error(err);
        });
    },
    //切换员工账号的启用禁用状态
    toggleStatus(staff) {
      this.$Modal.confirm({
        title: "提示",
        render: h => {
          return h(
            "div",
            staff.status
              ? [
                  h("span", `员工【${staff.name}】绑定了`),
                  h(
                    "span",
                    {
                      style: {
                        color: "#F5222D"
                      }
                    },
                    `${staff.member_count}`
                  ),
                  h(
                    "span",
                    "个会员，禁用后员工将不能再访问您的后台系统，是否确定禁用？"
                  )
                ]
              : [
                  `启用员工【${staff.name}】后，员工可以继续访问您的后台系统，是否确定启用？`
                ]
          );
        },
        onOk: () => {
          axios
            .post("/shop/admin/staff/status", {
              id: staff.id,
              status: staff.status ? 0 : 1
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success(staff.status ? "禁用成功" : "启用成功");
                staff.status = staff.status ? 0 : 1;
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        }
      });
    },
    onAddCoupons() {
      this.$router.push("/staff/add-staff");
    }
  }
};
</script>
<style lang="less" scoped>
.main-board {
  padding: 24px;
  .select-role {
    width: 210px;
    height: 32px;
    margin-right: 15px;
  }
  .input-role {
    width: 211px;
    height: 32px;
    margin-right: 15px;
  }
  .select-status {
    width: 210px;
    height: 32px;
    margin-right: 15px;
  }
  .row {
    // margin-bottom: 24px;
    .label {
      margin-right: 5px;
    }
  }
  /deep/.table-second-level {
    padding-left: 14px;
    position: relative;
    margin-top: 4px;
    &:before,
    &:after {
      content: "";
      display: block;
      position: absolute;
      left: 0;
      top: 8px;
      background-color: #ccc;
    }
    &:before {
      top: -2px;
      width: 1px;
      height: 10px;
    }
    &:after {
      width: 10px;
      height: 1px;
    }
  }
  /deep/.ivu-table-header th {
    background: #f8f9fd;
    &:first-child {
      border-right: none;
    }
  }
  /deep/.ivu-table-body td {
    font-size: 12px;
    color: #657180;
    &:first-child {
      border-right: none;
    }
  }
  /deep/.ivu-table-body a {
    color: #3f66d3;
  }
  .wrapper1 {
    /deep/.ivu-table-body tr {
      height: 80px;
    }
  }
  .ivu-table-wrapper/deep/table {
    min-width: 1093px;
    width: 100% !important;
    table-layout: auto;
  }
  /deep/.enabled {
    display: inline-block;
    height: 22px;
    line-height: 22px;
    padding: 0 8px;
    font-size: 12px;
    border-radius: 4px;
    color: #589a0a;
    background: #e1fbc3;
    border: 1px solid #78c122;
    white-space: nowrap;
  }
  /deep/.disabled {
    display: inline-block;
    height: 22px;
    line-height: 22px;
    padding: 0 8px;
    font-size: 12px;
    border-radius: 4px;
    color: #f5222d;
    background: #fff1f0;
    border: 1px solid #ffa39e;
    white-space: nowrap;
  }
  /deep/.edit-link:not(:last-child) {
    margin-right: 10px;
  }
}
</style>
