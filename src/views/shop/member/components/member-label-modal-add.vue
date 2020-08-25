<template>
  <Modal
    :width="742"
    :title="formValidate.id ? '编辑标签组' : '新增标签组'"
    class="member-label-modal-add"
    :loading="loading"
    :mask-closable="false"
    v-model="modalStatus"
    @on-ok="onModalComfrimClick"
    @on-visible-change="onVisibleChange"
  >
    <div style="margin-right: -20px;">
      <Form ref="formValidate" :model="formValidate">
        <FormItem
          label="标签组名称:"
          :label-width="90"
          prop="name"
          :rules="{
            required: true,
            message: '请输入标签组名称',
            trigger: 'blur'
          }"
        >
          <i-input
            v-model.trim="formValidate.name"
            style="width: 230px;"
            :maxlength="10"
            placeholder="请输入标签组名称"
          >
            <div slot="suffix" style="margin-right: -30px;">
              {{ formValidate.name.length }}/10
            </div>
          </i-input>
        </FormItem>
        <FormItem
          label="具体标签:"
          :label-width="90"
          class="ivu-form-item-required"
        >
          <add-more
            text="新增"
            @onAddMoreClick="onAddNewLabelClick"
            v-show="formValidate.children.length < 20"
          ></add-more>
          <span v-show="!tipShow" class=" member-label-modal-add-tip"
            >（*拖拽可以改变同级之间的排序）</span
          >
          <more-message
            v-show="!tipShow"
            style="margin-left: 3px;margin-top: -1px;"
            text="最多新增20个具体标签"
          />
          <div
            class="ivu-form-item-error-tip member-label-modal-add-error-tip"
            v-show="tipShow"
          >
            至少添加一个
          </div>
        </FormItem>
        <draggable :list="formValidate.children">
          <template v-for="(item, index) in formValidate.children">
            <FormItem
              class="member-label-modal-add-drag"
              :prop="'children.' + index + '.name'"
              v-if="!item.is_del"
              :key="item.id"
              :rules="{
                required: true,
                message: '请输入具体标签',
                trigger: 'blur'
              }"
            >
              <i-input
                style="width: 218px;"
                :maxlength="10"
                v-model.trim="formValidate.children[index].name"
                placeholder="请输入具体标签"
              >
                <div slot="suffix">
                  {{ formValidate.children[index].name.length }}/10
                </div>
                <div slot="append" @click="onLabelDeleteClick(index)">
                  <Icon
                    type="ios-loading"
                    size="16"
                    class="demo-spin-icon-load"
                    v-show="item.loading"
                  ></Icon>
                  <i class="iconfont icon-ios-close" v-show="!item.loading"></i>
                </div>
              </i-input>
            </FormItem>
          </template>
        </draggable>
      </Form>
    </div>
  </Modal>
</template>
<script>
import addMore from "@/views/shop/components/button/add-more.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import draggable from "vuedraggable";
export default {
  components: {
    addMore,
    moreMessage,
    draggable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    editData: {
      required: true
    }
  },
  data() {
    return {
      modalStatus: false,
      loading: true,
      formValidate: JSON.parse(JSON.stringify(this.editData)),
      tipShow: false
    };
  },
  watch: {
    modalStatus(val) {
      this.$emit("input", val);
    },
    value(val) {
      this.modalStatus = val;
    },
    editData() {
      this.formValidate = JSON.parse(JSON.stringify(this.editData));
    }
  },
  methods: {
    /**
     * 确定
     */
    onModalComfrimClick() {
      this.$refs.formValidate.validate(valid => {
        if (valid) {
          if (this.formValidate.children.filter(n => !n.is_del).length) {
            this.$emit(
              "on-ok",
              JSON.parse(JSON.stringify(this.formValidate)),
              val => {
                if (val) {
                  this.modalStatus = false;
                  this.$Message.success(
                    this.formValidate.id ? "编辑成功" : "新增成功"
                  );
                } else {
                  this.loading = false;
                  this.$nextTick(() => {
                    this.loading = true;
                  });
                }
              }
            );
          } else {
            this.tipShow = true;
            this.loading = false;
            this.$nextTick(() => {
              this.loading = true;
            });
          }
        } else {
          if (this.formValidate.children.length) {
            this.tipShow = false;
          } else {
            this.tipShow = true;
          }
          this.loading = false;
          this.$nextTick(() => {
            this.loading = true;
          });
        }
      });
    },
    /**
     * 新增标签
     */
    onAddNewLabelClick() {
      this.tipShow = false;
      this.formValidate.children.unshift({
        id: "new_" + Math.floor(Math.random() * 1000000), // 用于标识error提示，保存需要重置为0
        name: ""
      });
    },
    /**
     * 删除标签
     */
    onLabelDeleteClick(index) {
      let item = this.formValidate.children[index];
      if (item.loading) {
        return;
      }
      this.$set(item, "loading", true);
      // 如果是刚新加的则直接删除
      if (/new_/.test(item.id)) {
        this.formValidate.children.splice(index, 1);
        this.$set(item, "loading", false);
      } else {
        // 传需要删除的表示到服务器
        this.$httpPost(
          "/shop/admin/member/label/check",
          { id: item.id },
          res => {
            this.$set(item, "loading", false);
            if (res.code === 200) {
              if (res.data) {
                this.$Modal.confirm({
                  title: "提示",
                  loading: true,
                  render: h => {
                    return h("div", [
                      h("span", `该标签【${item.name}】共绑定了`),
                      h(
                        "span",
                        {
                          style: {
                            color: "#F5222D"
                          }
                        },
                        res.data
                      ),
                      h("span", "个会员，是否确定删除？")
                    ]);
                  },
                  onOk: () => {
                    this.$Modal.remove();
                    this.$set(
                      this.formValidate.children[index],
                      "is_del",
                      true
                    );
                  }
                });
              } else {
                this.$set(this.formValidate.children[index], "is_del", true);
              }
            } else {
              this.$Message.error(res.msg);
            }
          }
        );
      }
      if (!this.formValidate.children.length) {
        this.tipShow = true;
      }
    },
    /**
     * 还原是数据
     */
    onVisibleChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$refs.formValidate.resetFields();
          this.tipShow = false;
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
.member-label-modal-add {
  /deep/.add-more-btn .btn-add {
    margin: 0 6px 0 0;
  }
  /deep/.ivu-input-suffix {
    line-height: 32px;
    width: auto;
    margin-right: 42px;
    z-index: 3;
  }
  /deep/.ivu-input-group-append {
    cursor: pointer;
    padding: 3px;
    width: 32px;
    background-color: transparent !important;
    i {
      font-size: 24px;
    }
  }
  .member-label-modal-add-drag {
    display: inline-block;
  }
  .member-label-modal-add-drag:nth-child(3n + 1),
  .member-label-modal-add-drag:nth-child(3n + 2) {
    margin-right: 20px;
  }
  .member-label-modal-add-tip {
    color: #9ea7b4;
  }
  .member-label-modal-add-error-tip {
    padding: 0;
    top: 50%;
    transform: translateY(-50%);
    left: 78px;
  }
  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
