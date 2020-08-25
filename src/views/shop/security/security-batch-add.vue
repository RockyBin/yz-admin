<template>
  <div class="security-batch-add" v-show="!$store.state.COMMON_loading">
    <verticalLineTitlebar title="填写防伪批次信息" />
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="144">
      <FormItem label="防伪码数量：" prop="num" class="margin-bottom-form">
        <InputNumber
          :max="100000"
          :min="1"
          :step="1"
          :precision="0"
          v-model="formValidate.num"
          style="width: 300px;"
          placeholder="请输入数量"
        />
        <div class="security-batch-add-tip">*防伪码一个批次最多可生成10万张，一旦生成后，不允许修改，请仔细核对好数量</div>
      </FormItem>
      <FormItem label="选择商品：" class="margin-bottom-form">
        <div>
          <Button type="primary" @click="onSelectBtnClick" v-show="!listData.length">选择商品</Button>
          <common-table
            v-show="listData.length"
            :width="491"
            type="border"
            hasBorder
            :columnsData="columnsData"
            :listData="listData"
          ></common-table>
        </div>
      </FormItem>
    </Form>
    <modal-select-list
      v-model="modalStatus"
      :selectInfo="selectInfo"
      @onGetProductInfo="onGetProductInfo"
    ></modal-select-list>
    <foot-button perm="security.operate" @onSaveClick="onSaveClick" :loading="loading"></foot-button>
  </div>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import commonTable from "@/views/shop/components/table/common-table.vue";
import modalSelectList from "COMPONENTS/modal/modal-product-select-list";
import footButton from "@/views/shop/components/button/foot-button.vue";
const selectInfo = {
  selectDesignatedProductID: 0,
  selectDesignatedProductName: ""
};
export default {
  components: {
    verticalLineTitlebar,
    commonTable,
    modalSelectList,
    footButton
  },
  data() {
    return {
      formValidate: {
        num: null
      },
      loading: false,
      ruleValidate: {
        num: [
          {
            required: true,
            type: "number",
            message: "请输入要生成的防伪码数量",
            trigger: "blur"
          }
        ]
      },
      listData: [],
      columnsData: [
        {
          title: "商品信息",
          width: 385,
          render: (h, params) => {
            return h("div", {}, [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    marginRight: "8px",
                    verticalAlign: "middle"
                    // border: "1px solid #eeeeee"
                  }
                },
                [
                  h("img", {
                    attrs: {
                      src:
                        params.row.small_images &&
                        params.row.small_images.split(",").length
                          ? this.$store.state.siteComdataPath +
                            params.row.small_images.split(",")[0]
                          : ""
                    },
                    style: {
                      height: "40px",
                      width: "40px",
                      display: "block",
                      objectFit: "contain"
                    }
                  })
                ]
              ),
              h(
                "div",
                {
                  style: {
                    width: "calc(100% - 50px)",
                    overflow: "hidden",
                    "text-overflow": "ellipsis",
                    verticalAlign: "middle",
                    textAlign: "left",
                    display: "-webkit-inline-box",
                    "-webkit-line-clamp": 2,
                    "-webkit-box-orient": "vertical",
                    "line-height": "21px"
                  }
                },
                [
                  h(
                    "Tooltip",
                    {
                      props: {
                        content: params.row.name,
                        transfer: true,
                        placement: "top",
                        maxWidth: "300px"
                      }
                    },
                    params.row.name
                  )
                ]
              )
            ]);
          }
        },
        {
          title: "操作",
          width: 104,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                class: {
                  "table-operation": true
                },
                attrs: {
                  perm: "member.detail.view"
                },
                on: {
                  click: () => {
                    this.listData.splice(params.index, 1);
                    this.selectInfo = Object.assign({}, selectInfo);
                  }
                }
              },
              "删除"
            );
          }
        }
      ],
      selectInfo: Object.assign({}, selectInfo),
      modalStatus: false
    };
  },
  methods: {
    onSelectBtnClick() {
      this.modalStatus = true;
    },
    onGetProductInfo(val) {
      console.log(val)
      this.listData = val;
    },
    onSaveClick() {
      this.$refs.formValidate.validate(status => {
        if (status) {
          this.loading = true;
          this.$Message.success({
            content: "正在生成防伪码，请稍候！",
            duration: 0
          });
          this.$httpPost(
            "/shop/admin/security/code/batch/add",
            {
              batch_count: this.formValidate.num,
              product_id: this.listData.length ? this.listData[0].id : ""
            },
            res => {
              if (res.code === 200) {
                this.$Message.success({
                  content: "生成成功",
                  onClose: () => {
                    this.loading = false;
                    this.$router.push({
                      name: "securityBatch"
                    });
                  }
                });
              } else {
                this.loading = false;
                this.$Message.error(res.msg);
              }
            }
          );
          window.setTimeout(() => {}, 2000);
        } else {
          this.$Message.error("保存失败");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.security-batch-add {
  padding: 24px;
  .security-batch-add-tip {
    margin-top: 2px;
    font-size: 12px;
    line-height: 16px;
    color: #9ea7b4;
  }
  /deep/.ivu-form{
    .margin-bottom-form:first-child{
      margin-top: 20px !important;
    }
  }
}
</style>