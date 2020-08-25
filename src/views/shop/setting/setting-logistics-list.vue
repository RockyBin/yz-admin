<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container-nobtn">
      <div class="member">
        <add-more :text="text" @onAddMoreClick="onAddMoreClick" perm="logistics.operate"></add-more>
        <div class="wrapper">
          <Table
            border
            :columns="deliveryColumns"
            :data="deliveryList"
            align="center"
            class="delivery-table"
          ></Table>
        </div>
        <!-- 分页组件 -->
        <div class="bar-pager">
          <Page
            v-if="Number(total) > 10"
            :total="Number(total)"
            :page-size="10"
            :current="Number(current)"
            @on-change="onChangePage"
            show-elevator
            show-sizer
            :transfer="true"
            @on-page-size-change="onPageSizeChange"
          ></Page>
        </div>
        <!-- <Row type="flex" justify="start" class="code-row-bg">
          <i-col span="24">
            <div
              v-if="Number(total) > 10"
              style="margin:0 10px;overflow: hidden;vertical-align: bottom;display:inline-block"
            >
              <Page
                v-if="Number(total) > 10"
                :total="Number(total)"
                :page-size="10"
                :current="Number(current)"
                @on-change="onChangePage"
                show-elevator
                show-sizer
                :transfer="true"
                @on-page-size-change="onPageSizeChange"
              ></Page>
            </div>
          </i-col>
        </Row>-->
        <Modal v-model="showModal" title="新增运费模板" :width="678" class="modal-wrap">
          <Form
            ref="formValidateBase"
            :model="formValidate"
            class="formroom"
            :rules="ruleValidateBase"
            :label-width="90"
            :show-message="true"
          >
            <FormItem label="模板名称：" prop="template_name">
              <div class="level-common">
                <Input
                  v-model.trim="formValidate.template_name"
                  class="modal-input-set"
                  style="width:260px;"
                  :maxlength="20"
                  placeholder="请输入模板名称"
                >
                  <span slot="suffix">{{formValidate.template_name.length}}/20</span>
                </Input>
              </div>
            </FormItem>

            <FormItem label="计价方式：">
              <div class="level-common">
                <RadioGroup v-model="formValidate.fee_type" @on-change="onfee_type">
                  <Radio label="0">
                    <span>按重量计算</span>
                  </Radio>
                  <Radio label="1" class="margin-common">
                    <span>按数量计算</span>
                  </Radio>
                  <Radio label="2" class="margin-common">
                    <span>固定价格</span>
                  </Radio>
                </RadioGroup>
              </div>
            </FormItem>

            <FormItem label="指定地区：" style="margin-bottom: 16px;">
              <div class="level-common">
                <RadioGroup v-model="formValidate.delivery_type" @on-change="onChangeDeliveryType">
                  <Radio label="0">
                    <span>全国统一</span>
                  </Radio>
                  <Radio label="1" class="margin-common">
                    <span>指定地区</span>
                  </Radio>
                </RadioGroup>
              </div>
            </FormItem>
            <!-- 选择地区 -->
            <FormItem label="选择地区：" v-if="formValidate.delivery_type === '1'">
              <div class="row">
                <Button
                  type="primary"
                  @click="onShowChooseAreaShowModal()"
                  perm="logistics.operate"
                >新增地区</Button>
              </div>
            </FormItem>
            <Table
              border
              :columns="areaListColumns"
              :data="delivery_area"
              align="center"
              class="area-list-table"
              v-if="showTable"
            ></Table>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancel">取消</Button>
            <Button type="primary" @click="onSubmit" :loading="loading" perm="logistics.operate">保存</Button>
          </div>
        </Modal>

        <modalAreaSelector
          v-model="chooseAreaShowModal"
          @submit="onGetData"
          :editData="editData"
          :addOrEditStates="addOrEditStates"
          @reSetAddOrEditStates="reSetAddOrEditStates"
          :disableCodes="disableCodes"
          @reSetDisableCodes="reSetDisableCodes"
        />
      </div>
    </div>
  </div>
</template>

<script>
import addMore from "COMPONENTS/button/add-more.vue";
import modalAreaSelector from "./components/modal-area-selector";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
let tableColumns2Name = "固定价格（元，首）";
let tableColumns3Name = "续（元）"; // 固定价格
let tableColumns2NameByUnit = "首（元，1kg以内）";
let tableColumns3NameByUnit = "续（元/kg）"; // 按重量计算
let tableColumns2NameByNumber = "首（元，1件）";
let tableColumns3NameByNumber = "续（元/件）"; // 按数量计算
let operation_copy = null;
export default {
  components: { addMore, modalAreaSelector, thirdMenu },
  data() {
    const operation = {
      title: "操作",
      align: "center",
      width: 100,
      render: (h, params) => {
        return h("div", [
          h(
            "span",
            {
              props: {
                type: "error",
                size: "small"
              },
              attrs: {
                perm: "logistics.operate"
              },
              class: {
                "table-operation": true
              },
              style: {
                cursor: "pointer",
                marginRight: "7px"
              },
              on: {
                click: () => {
                  this.chooseAreaShowModal = true;
                  this.addOrEditStates = "1";
                  let deliveryAreaCodes = "";
                  this.delivery_area.forEach(item => {
                    if (params.row.area.indexOf(item.area) < 0) {
                      deliveryAreaCodes += item.area;
                    }
                  });
                  this.disableCodes = deliveryAreaCodes;
                  this.editData = {
                    areas: params.row.area,
                    index: params.index
                  };
                }
              }
            },
            "修改地区"
          ),
          h(
            "span",
            {
              props: {
                type: "error",
                size: "small"
              },
              attrs: {
                perm: "logistics.operate"
              },
              class: {
                "primary-font-color": true
              },
              style: {
                cursor: "pointer"
              },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: "提示",
                    content: "确认删除此项？",
                    loading: true,
                    onOk: () => {
                      this.delivery_area.splice(params.index, 1);
                      this.$Modal.remove();
                    }
                  });
                }
              }
            },
            "删除"
          )
        ]);
      }
    };
    operation_copy = Object.assign({}, operation);
    return {
      page: 1,
      loading: false,
      showTable: true,
      showModal: false, // 新增运费模板
      addOrEditStates: "",
      renewFeeMiddleData: "", // 用来存放切换中的值
      editData: "",
      disableCodes: "", // 不可选的地区编码
      chooseAreaShowModal: false,
      thirdMenu: [],
      formValidate: {
        template_name: "",
        fee_type: "2",
        delivery_type: "0"
      },
      ruleValidateBase: {
        template_name: [
          { required: true, message: "模板名称不能为空", trigger: "blur" }
        ]
      },
      text: "新增模板",
      deliveryColumns: [
        {
          title: "运费模板名称",
          key: "template_name",
          align: "center",
          minWidth: 140
        },
        {
          title: "计价方式",
          key: "fee_type",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "span",
              {
                on: {
                  click: () => {}
                }
              },
              (num => {
                switch (num) {
                  case 0:
                    return "按重量计价";
                    break;
                  case 1:
                    return "按数量计价";
                    break;
                  case 2:
                    return "固定价格";
                    break;
                  default:
                    break;
                }
              })(params.row.fee_type)
            );
          }
        },
        {
          title: "指定地区类型",
          key: "delivery_type",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "span",
              {
                on: {
                  click: () => {}
                }
              },
              Number(params.row.delivery_type) === 0 ? "全国统一" : "指定地区"
            );
          }
        },
        {
          title: "地区",
          align: "center",
          minWidth: 220,
          render: (h, params) => {
            if (Number(params.row.delivery_type) === 0) {
              return h("div", "全国统一");
            } else {
              return h(
                "div",
                ((render, params) => {
                  const rows = [];
                  const array = params.row.delivery_area_name || [];
                  array.forEach(item => {
                    rows.push(
                      h(
                        "Tooltip",
                        {
                          props: {
                            content: item,
                            placement: "top-start",
                            "max-width": 400,
                            transfer: true,
                            disabled: Number(params.row.delivery_type) === 0
                          }
                        },
                        [h("div", { class: "table-area-shape" }, item)]
                      )
                    );
                  });
                  return rows;
                })(h, params)
              );
            }
          }
        },
        {
          title: "首",
          key: "status",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "div",
              {
                class: "full-height"
              },
              ((render, params) => {
                const rows = [];
                const array = JSON.parse(params.row.delivery_area) || [];
                array.forEach(item => {
                  rows.push(
                    h(
                      "div",
                      {
                        class: "flex-box",
                        props: {}
                      },
                      `${item.firstFee}元`
                    )
                  );
                });
                return rows;
              })(h, params)
            );
          }
        },
        {
          title: "续",
          key: "status",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "div",
              {
                class: "full-height"
              },
              ((render, params) => {
                const rows = [];
                const array = JSON.parse(params.row.delivery_area) || [];
                array.forEach(item => {
                  let desc = "--";
                  switch (Number(params.row.fee_type)) {
                    case 0:
                      desc = item.renewFee + "/kg";
                      break;
                    case 1:
                      desc = item.renewFee + "/件";
                      break;
                    default:
                      break;
                  }
                  rows.push(
                    h(
                      "div",
                      {
                        class: "flex-box",
                        props: {}
                      },
                      desc
                    )
                  );
                });
                return rows;
              })(h, params)
            );
          }
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: 120,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  class: {
                    "table-operation": true
                  },
                  style: {
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.showModal = true;
                      this.toEdit(params.row);
                    }
                  }
                },
                "修改"
              ),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  style: {
                    marginLeft: "10px"
                  }
                },
                "|"
              ),
              h(
                "span",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  class: {
                    "primary-font-color": true
                  },
                  style: {
                    cursor: "pointer",
                    marginLeft: "10px"
                  },
                  attrs: {
                    perm: "logistics.operate"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "确认删除此项？",
                        loading: true,
                        onOk: () => {
                          this.removeListData(params.row.id, params.index);
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      deliveryList: [],
      areaListColumns: [
        {
          title: "地区",
          key: "name",
          align: "center",
          render: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: params.row.name,
                  placement: "top-start",
                  "max-width": 500,
                  disabled: Number(this.formValidate.delivery_type) === 0
                }
              },
              [h("span", {}, params.row.name)]
            );
          }
        },
        {
          title: tableColumns2Name,
          key: "firstFee",
          align: "center",
          render: (h, params) => {
            return h("Input", {
              props: {
                value: params.row.firstFee
              },
              attrs: {
                placeholder: "请输入金额"
              },
              class: {
                "ivu-form-item-error": params.row.isError ? true : false
              },
              on: {
                input: value => {
                  this.delivery_area[params.index] = params.row;
                  params.row.firstFee = value;
                  this.checkInsertNum(value, params.index, "isError");
                }
              }
            });
          }
        },
        {
          title: tableColumns3Name,
          key: "renewFee",
          align: "center"
        },
        operation
      ],
      middleData: [],
      // 提交到后台的数据
      delivery_area: [
        {
          name: "全国统一",
          firstFee: "",
          renewFee: "",
          area: "",
          isError: false,
          islastError: false
        }
      ],
      // 分页
      total: 0,
      current: 0,
      size: 0
    };
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.onRefushList();
  },
  methods: {
    checkInsertNum(value, index, key) {
      const reg = /^\d+(\.\d{1,2})?$/;
      if (!reg.test(value)) {
        this.$set(this.delivery_area[index], key, true);
        return false;
      } else {
        this.$set(this.delivery_area[index], key, false);
      }
    },
    onPageSizeChange(num) {
      this.onRefushList(this.page, num);
    },
    removeListData(id, index) {
      this.$httpGet("/shop/admin/freighttemplate/delete", { id }, res => {
        if (res.code) {
          this.deliveryList.splice(index, 1);
          if (this.deliveryList.length === 1 && this.page > 1) {
            this.page - 1;
          }
          this.$Message.success("删除成功");
          this.onRefushList(this.page);
          this.$Modal.remove();
          this.$Message.success("删除成功");
        } else {
          this.$Message.error(res.msg);
          this.$Modal.remove();
        }
      });
    },
    onChangePage(page) {
      this.page = page;
      this.onRefushList(page);
    },
    // 点击修改的时候
    // 大量匹配数据，获取相应数据信息
    toEdit(data) {
      this.$refs["formValidateBase"].resetFields();
      this.showTable = false;
      const logisicsData = Object.assign({}, data);
      if (
        logisicsData.delivery_type !== undefined &&
        logisicsData.delivery_type !== null
      ) {
        this.formValidate.delivery_type = logisicsData.delivery_type.toString();
      }
      if (this.formValidate.delivery_type === "1") {
        this.areaListColumns[3] = operation_copy;
      } else {
        delete this.areaListColumns[2].render;
        if (this.areaListColumns.length === 4) {
          this.areaListColumns.pop();
        }
      }
      if (
        logisicsData.delivery_type !== undefined &&
        logisicsData.delivery_type !== null
      ) {
        this.formValidate.fee_type = logisicsData.fee_type.toString();
      }
      if (this.formValidate.fee_type !== "2") {
        this.areaListColumns[2].render = (h, params) => {
          return h("Input", {
            props: {
              value: params.row.renewFee
            },
            attrs: {
              placeholder: "请输入金额"
            },
            class: {
              "ivu-form-item-error": params.row.isError ? true : false
            },
            on: {
              input: value => {
                this.delivery_area[params.index] = params.row;
                params.row.renewFee = value;
                this.checkInsertNum(value, params.index, "islastError");
              }
            }
          });
        };
      }
      if (this.formValidate.fee_type === "0") {
        this.areaListColumns[1].title = tableColumns2NameByUnit;
        this.areaListColumns[2].title = tableColumns3NameByUnit;
      } else if (this.formValidate.fee_type === "1") {
        this.areaListColumns[1].title = tableColumns2NameByNumber;
        this.areaListColumns[2].title = tableColumns3NameByNumber;
      } else {
        this.areaListColumns[1].title = tableColumns2Name;
        this.areaListColumns[2].title = tableColumns3Name;
      }
      if (logisicsData.id) {
        this.formValidate.id = logisicsData.id.toString();
      }
      if (logisicsData.template_name) {
        this.formValidate.template_name = logisicsData.template_name.toString();
      }
      this.delivery_area = JSON.parse(logisicsData.delivery_area);
      this.delivery_area.forEach((item, index) => {
        // 循环放置名称
        item.name =
          logisicsData.delivery_area_name[index] === null
            ? "全国统一"
            : logisicsData.delivery_area_name[index];
        item.renewFee = item.renewFee === "" ? "--" : item.renewFee;
      });
      this.$nextTick(() => {
        this.showTable = true;
      });
    },
    // 重置是否是新增或者编辑地区弹窗状态
    reSetAddOrEditStates(status) {
      this.addOrEditStates = status;
    },
    reSetDisableCodes(disableCodes) {
      this.disableCodes = disableCodes;
    },
    // TODO: 刷新列表
    // 因为是特殊列表必须刷新
    onRefushList(page = 1, page_size = 10) {
      this.$httpGet(
        "/shop/admin/freighttemplate/list",
        { page, page_size },
        res => {
          // 成功
          if (res.msg === this.$store.state.SUCCESS) {
            this.deliveryList = [];
            this.$nextTick(() => {
              this.deliveryList = res.data.list;
              this.total = res.data.total;
              this.current = res.data.current;
              this.size = res.data.page_size;
            });
          }
        }
      );
    },
    // 提交保存的方法
    onSubmit() {
      this.$refs["formValidateBase"].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.formValidate);
          data.delivery_area = this.delivery_area.map(item =>
            Object.assign({}, item)
          );
            let lock = false;
          if (!data.delivery_area.length){
              this.$Message.error("请至少选择一个地区！");
              lock = true;
          }
          data.delivery_area.forEach((item, index) => {
            if (item.firstFee === "") {
              this.$Message.error("请填写运费！");
              lock = true;
            }
            if (
              (item.renewFee === "" || item.renewFee === "--") &&
              data.fee_type !== "2"
            ) {
              this.$Message.error("请填写续件/续重运费！");
              lock = true;
            }
            if (item.isError || item.islastError) {
              lock = true;
              this.$Message.error("必须填入非负数字(最多两位小数)！");
            }
            item.renewFee = item.renewFee.replace("--", "");
            delete item.name;
            delete item._index;
            delete item._rowKey;
            delete item.isError;
            delete item.islastError;
          });

          if (lock) {
            // this.$Message.error("请填写完整信息！");
            return false;
          }
          data.delivery_area = JSON.stringify(data.delivery_area);
          this.loading = true;
          let api = "";
          if (Number(data.id) >= 0) {
            api = "edit";
          } else {
            api = "add";
          }
          this.$httpGet(`/shop/admin/freighttemplate/${api}`, data, res => {
            // 成功
            this.loading = false;
            if (res.msg === this.$store.state.SUCCESS) {
              this.$Message.success("保存成功");
              this.showModal = false;
              this.onRefushList();
            } else {
              this.$Message.error(res.msg);
            }
          });
        }
      });
    },
    onChangeDeliveryType() {
      this.showTable = false;
      if (this.formValidate.delivery_type === "1") {
        // 修复编辑之后再新增this.middleData被污染的问题
        this.middleData.forEach((item, index) => {
          if (item.area === "") {
            this.middleData.splice(index, 1);
          }
        });
        const listData = this.middleData.concat();
        this.middleData = this.delivery_area.concat();
        // 有数据的情况下，移动过来，没数据置空
        if (listData.length > 0) {
          this.delivery_area = listData;
        } else {
          this.delivery_area = [];
        }
        this.areaListColumns[3] = operation_copy;
      } else {
        // 交换数据
        // 等于零的情况下
        const listData =
          this.middleData.length > 0
            ? this.middleData.concat()
            : [
                {
                  name: "全国统一",
                  firstFee: "",
                  renewFee: "",
                  area: ""
                }
              ];
        this.middleData = this.delivery_area.concat();
        if (this.areaListColumns.length === 4) {
          this.areaListColumns.pop();
        }
        this.delivery_area = listData;
      }
      this.$nextTick(() => {
        this.showTable = true;
      });
    },
    onfee_type() {
      if (this.formValidate.fee_type === "2") {
        this.areaListColumns[1].title = tableColumns2Name;
        this.areaListColumns[2].title = tableColumns3Name;
        this.areaListColumns[2].render = (h, params) => {
          params.row.renewFee = "--";
          return h("span", params.row.renewFee);
        };
      } else if (this.formValidate.fee_type === "1") {
        this.areaListColumns[1].title = tableColumns2NameByNumber;
        this.areaListColumns[2].title = tableColumns3NameByNumber;
        this.delivery_area.renewFee = "";
        this.areaListColumns[2].render = (h, params) => {
          let value = "";
          if (typeof params.row.renewFee.replace === "function") {
            value = params.row.renewFee.replace("--", "");
          } else {
            value = params.row.renewFee;
          }
          return h("Input", {
            props: {
              value
            },
            attrs: {
              placeholder: "请输入金额"
            },
            class: {
              "ivu-form-item-error": params.row.islastError ? true : false
            },
            on: {
              input: value => {
                this.delivery_area[params.index] = params.row;
                params.row.renewFee = value;
                this.checkInsertNum(value, params.index, "islastError");
              }
            }
          });
        };
      } else {
        this.areaListColumns[1].title = tableColumns2NameByUnit;
        this.areaListColumns[2].title = tableColumns3NameByUnit;
        this.delivery_area.renewFee = "";
        this.areaListColumns[2].render = (h, params) => {
          let value = "";
          if (typeof params.row.renewFee.replace === "function") {
            value = params.row.renewFee.replace("--", "");
          } else {
            value = params.row.renewFee;
          }
          return h("Input", {
            props: {
              value
            },
            attrs: {
              placeholder: "请输入金额"
            },
            class: {
              "ivu-form-item-error": params.row.isError ? true : false
            },
            on: {
              input: value => {
                this.delivery_area[params.index] = params.row;
                params.row.renewFee = value;
                this.checkInsertNum(value, params.index, "islastError");
              }
            }
          });
        };
      }
    },
    onGetData(data, index) {
      let area = "";
      let name = "";
      // 先把1级的遍历出来
      const firstLevel = [];
      const secondLevel = [];
      data.forEach(item => {
        if (item.area.indexOf("0000") > -1) {
          firstLevel.push(item);
        } else {
          secondLevel.push(item);
        }
      });
      if (firstLevel.length > 0) {
        firstLevel.forEach(first => {
          area += `${first.area},`;
          name += `${first.title}:`;
          secondLevel.forEach(second => {
            if (second.area.substring(0, 2) === first.area.substring(0, 2)) {
              name += `${second.title},`;
              area += `${second.area},`;
            }
          });
        });
      } else {
        secondLevel.forEach(second => {
          name += `${second.title},`;
          area += `${second.area},`;
        });
      }
      if (index >= 0) {
        this.$set(this.delivery_area, index, {
          area,
          name,
          firstFee: this.delivery_area[index].firstFee || "",
          renewFee: this.delivery_area[index].renewFee || ""
        });
      } else {
        this.delivery_area.push({
          area,
          name,
          firstFee: "",
          renewFee: ""
        });
      }
    },
    // 新增按钮点击事件
    onShowChooseAreaShowModal() {
      this.addOrEditStates = "0";
      let areasCode = "";
      this.delivery_area.forEach(item => {
        areasCode += item.area;
      });
      this.disableCodes = areasCode;
      this.editData = {
          areas: []
      }
      this.chooseAreaShowModal = true;
    },
    /* 显示modal框 */
    onAddMoreClick() {
      this.showModal = true;
      this.formValidate = {
        template_name: "",
        fee_type: "2",
        delivery_type: "0"
      };
      this.delivery_area = [
        {
          name: "全国统一",
          firstFee: "",
          renewFee: "--",
          area: ""
        }
      ];
      if (this.areaListColumns.length === 4) {
        this.areaListColumns.pop();
      }
      this.areaListColumns[1].title = tableColumns2Name;
      this.areaListColumns[2].title = tableColumns3Name;
      this.areaListColumns[2].render = null;
      this.middleData = [];
      this.$refs["formValidateBase"].resetFields();
    },
    /* 取消 */
    cancel() {
      this.showModal = false;
    }
  }
};
</script>

<style lang="less" scoped>
@border-line: #e8eaec;

.mall-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .container-nobtn {
    flex: 1;
    // width: 100%;
  }
}
.code-row-bg {
  /deep/.ivu-col-span-24 {
    text-align: right;
    margin: 20px 0;
  }
}

/deep/.ivu-table-wrapper {
  overflow: initial !important;
}

.area-list-table {
  /deep/.ivu-table-row .ivu-table-column-center:nth-child(4) {
    .ivu-table-cell {
      // padding: 0;
    }
  }
  /deep/.ivu-table-row .ivu-table-column-center:nth-child(1) {
    .ivu-table-cell {
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }
  }
}
.modal-wrap {
  /deep/.ivu-modal-body {
    height: 450px;
  }
  /deep/.ivu-modal-body {
    height: 450px;
    overflow: auto;
    overflow-x: hidden;
  }
  /deep/.ivu-btn-loading {
    span {
      display: inline;
    }
  }
  /deep/.ivu-input-suffix {
    width: 40px;
    line-height: 32px;
  }
  /deep/.ivu-input-with-suffix {
    padding-right: 40px;
  }
  /deep/th:not(:first-child) {
    .ivu-table-cell:before {
      content: "*";
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 13px;
      color: #ed4014;
      font-weight: normal;
    }
  }
}
.delivery-table {
  /deep/table {
    table-layout: auto;
    width: 100% !important;
    min-width: 961px;
    th {
      background: #f8f9fd;
    }
    td {
      color: #657180;
    }
  }
  /deep/.ivu-table-column-center:nth-child(4) {
    .ivu-table-cell {
      // padding: 0;
    }
  }
  /deep/.ivu-tooltip {
    display: block;
    width: 100%;
    height: 48px;
    line-height: 48px;
    padding: 0 18px;
    border-bottom: 1px solid #e8eaec;
  }
  /deep/.ivu-tooltip:last-child {
    border-bottom: none;
  }
  /deep/.table-area-shape {
    border-bottom: 1px solid @border-line;
    margin: 0 -18px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
  /deep/.table-area-shape:last-child {
    border-bottom: 0;
  }
  /deep/.full-height {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  /deep/.flex-box {
    height: 100%;
    width: 100%;
    height: 48px;
    line-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid @border-line;
  }
  /deep/.flex-box:last-child {
    border-bottom: 0;
  }
  /deep/.ivu-table-row .ivu-table-column-center:nth-child(5) .ivu-table-cell {
    height: 100%;
    // padding: 0;
  }
  /deep/.ivu-table-row .ivu-table-column-center:nth-child(6) .ivu-table-cell {
    height: 100%;
    // padding: 0;
  }
}
.modal-input-set {
  width: 220px;
}
.formroom {
  padding: 5px;
  /deep/.un-star .ivu-form-item-label:before {
    content: unset;
  }
}
.member {
  padding: 24px 24px 0;
  background: white;
  height: 100%;
  overflow: auto;
  text-align: left;
  // .add-more-btn {
  //   margin-bottom: 24px;
  // }
  // .wrapper {
  //   min-height: calc(100vh - 240px);
  // }
}
.discount-input {
  width: 120px;
  margin: 0 8px;
}
.consumption-money {
  width: 160px;
  margin: 0 10px;
}
.star-common {
  font-size: 20px;
  color: #f73610;
  vertical-align: -webkit-baseline-middle;
}
.level-common{
  &>div>label:first-child{
    margin-right: 0 !important;
  }
  /deep/.ivu-radio-wrapper{
    .ivu-radio{
      margin-right: 5px !important;
    }
  }
}
.margin-common {
  margin-left: 18px;
  margin-right: 0 !important;
}
.consumptions {
  padding-left: 128px;
  min-height: 50px;
}
.min-width {
  width: 240px;
}
</style>