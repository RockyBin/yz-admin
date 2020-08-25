<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container-nobtn">
      <div class="member">
        <add-more
          v-if="certList.length < 10"
          text="添加证书"
          @onAddMoreClick="onAddMoreClick"
          perm="ssl.config.operate"
        ></add-more>
        <div class="wrapper">
          <Table border :columns="certColumns" :data="certList" align="center" class="cert-table"></Table>
        </div>
        <div class="bar-pager">
          <Page
            v-if="Number(total) > pageSize"
            :total="Number(total)"
            :page-size="pageSize"
            :current="Number(current)"
            @on-change="onChangePage"
            show-elevator
            show-sizer
            :transfer="true"
            @on-page-size-change="onPageSizeChange"
          ></Page>
        </div>
        <Modal v-model="showModal" title="添加证书" :width="678" class="modal-wrap" @on-cancel="cancel">
          <alert-warning style="margin-bottom:24px;">
            <p>1.为了保证在各种浏览器上HTTPS都能正常访问，上传的证书文件必须包含中间证书。</p>
            <p>2.上传Nginx格式下的证书文件与Key文件；上传后将会在5分钟内生效，届时请刷新页面。</p>
          </alert-warning>
          <Form
            ref="formValidateBase"
            :model="formValidate"
            class="formroom"
            :rules="ruleValidateBase"
            :label-width="90"
            :show-message="true"
          >
            <FormItem label="证书文件：" prop="cert_file">
              <div class="level-common">
                <upload-button
                    ref="uploadCertFile"
                  type="default"
                  @fileSelected="formValidate.cert_file = $event"
                  :url="formValidate.cert_file && ($store.state.siteComdataPath + formValidate.cert_file)"
                ></upload-button>
                <span class="tips">证书文件是由证书颁发机构发给你的文件, 一般是 .crt , .cer , .pem 等后缀的</span>
              </div>
            </FormItem>
            <FormItem label="证书私钥：" prop="key_file">
              <div class="level-common">
                <upload-button
                    ref="uploadKeyFile"
                  type="default"
                  @fileSelected="formValidate.key_file = $event"
                  :url="formValidate.key_file && ($store.state.siteComdataPath + formValidate.key_file)"
                ></upload-button>
                <span class="tips">证书私钥是在申请证书时利用工具生成或由证书颁发机构提供，一般是 .pem , .key 等后缀</span>
              </div>
            </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancel">取消</Button>
            <Button type="primary" @click="onSubmit" :loading="loading" perm="ssl.config.operate">保存</Button>
          </div>
        </Modal>
      </div>
    </div>
  </div>
</template>

<script>
import addMore from "COMPONENTS/button/add-more.vue";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "../components/third-menu-for-setting-mall";
import uploadButton from "@/views/shop/components/button/upload-button.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue";
export default {
  components: { addMore, uploadButton, alertWarning, thirdMenu },
  data() {
    const validateCertFile = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请上传证书文件"));
      } else {
        callback();
      }
    };
    const validateKeyFile = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请上传证书私钥"));
      } else {
        callback();
      }
    };

    return {
      certList: [],
      total: 0,
      current: 0,
      pageSize: 10,
      loading: false,
      showTable: true,
      showModal: false,
      thirdMenu: [],
      formValidate: {
        id: "",
        cert_file: "",
        key_file: ""
      },
      ruleValidateBase: {
        cert_file: [
          { required: true, validator: validateCertFile, trigger: "change" }
        ],
        key_file: [
          { required: true, validator: validateKeyFile, trigger: "change" }
        ]
      },
      certColumns: [
        {
          title: "证书域名",
          key: "domains",
          align: "center",
          minWidth: 200
        },
        {
          title: "证书过期时间",
          key: "expiry_at",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("span", params.row.expiry_at);
          }
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-warning": params.row.status === 0,
                    "table-error": params.row.status === 2,
                    "table-success": params.row.status === 1
                  }
                },
                params.row.statusText
              ),
              h(
                "a",
                {
                  style: {
                    display:
                      Number(params.row.status) === 0 && !params.row.checking
                        ? "inline-block"
                        : "none",
                    padding: "0 10px"
                  },
                  on: {
                    click: () => {
                      this.checkStatus(params.row);
                    }
                  }
                },
                "检测"
              ),
              h(
                "span",
                {
                  style: {
                    display: params.row.checking ? "inline-block" : "none",
                    padding: "0 10px"
                  }
                },
                "正在检测，请稍候..."
              )
            ]);
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
                    "primary-font-color": true
                  },
                  style: {
                    cursor: "pointer",
                    marginLeft: "10px"
                  },
                  attrs: {
                    perm: "ssl.config.operate"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "删除可能会导致小程序无法正常使用，确定是否要删除？",
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
      ]
    };
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.onRefushList();
  },
  methods: {
    onPageSizeChange(num) {
      this.onRefushList(this.page, num);
    },
    removeListData(id, index) {
      this.$httpGet("/core/siteadmin/setting/ssl/delete", { id }, res => {
        if (res.code) {
          this.certList.splice(index, 1);
          if (this.certList.length === 1 && this.page > 1) {
            this.page - 1;
          }
          this.$Message.success("删除成功");
          this.onRefushList(this.page);
          this.$Modal.remove();
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
    // TODO: 刷新列表
    onRefushList(page = 1, page_size = 10) {
      this.$httpGet(
        "/core/siteadmin/setting/ssl/list",
        { page, page_size },
        res => {
          // 成功
          if (res.msg === this.$store.state.SUCCESS) {
            this.certList = [];
            this.$nextTick(() => {
              this.certList = res.data.list;
              this.total = res.data.total;
              this.current = res.data.current;
              this.pageSize = res.data.page_size;
            });
          }
        }
      );
    },
    // TODO: 检测证书的生效情况
    checkStatus(info) {
      this.$set(info, "checking", true);
      this.$httpGet(
        "/core/siteadmin/setting/ssl/check",
        { id: info.id },
        res => {
          this.$set(info, "checking", false);
          if (res.code === 200) {
            info.status = res.data.status;
			if(info.status == 1) info.statusText = "已生效";
			if(info.status == 2) info.statusText = "已过期";
            this.$Message.info(res.msg);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    // 提交保存的方法
    onSubmit() {
      this.$refs["formValidateBase"].validate(valid => {
        if (valid) {
          let formData = new FormData();
          for (let key in this.formValidate) {
            if (key == "cert_file" || key == "key_file") {
              formData.append(key, this.formValidate[key]);
            } else {
              formData.append(key, this.formValidate[key]);
            }
          }
          this.$httpPost("/core/siteadmin/setting/ssl/edit", formData, res => {
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
    /* 显示modal框 */
    onAddMoreClick() {
      this.showModal = true;
      this.formValidate = {
        id: "",
        cert_file: "",
        key_file: ""
      };
      this.$refs["formValidateBase"].resetFields();
    },
    /* 取消 */
    cancel() {
      this.$refs["uploadCertFile"].$refs["upload"].value= "";
      this.$refs["uploadKeyFile"].$refs["upload"].value= "";
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
.modal-wrap {
  /deep/.ivu-modal-body {
    height: 400px;
    overflow: auto;
    overflow-x: hidden;
  }
  /deep/.ivu-btn-loading {
    span {
      display: inline;
    }
  }
}
.cert-table {
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
}
.level-common {
  & > div > label:first-child {
    margin-right: 0 !important;
  }
  /deep/.ivu-radio-wrapper {
    .ivu-radio {
      margin-right: 5px !important;
    }
  }
}
.min-width {
  width: 240px;
}
.tips {
  color: #999;
  display: inline-block;
  padding: 3px;
}
</style>