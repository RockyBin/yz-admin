<template>
  <Modal
    v-model="showModal"
    class="modal"
    title="发货信息"
    width="391"
    :mask-closable="false"
    @on-cancel="onCancel"
    :footer-hide="isReadOnly"
  >
    <Form
      ref="formValidate"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="is_virtual?75:88"
    >
      <div v-if="!is_virtual">
        <FormItem
          label="物流公司："
          prop="logistics_company"
          :class="{ 'common-mb-10': formValidate.logistics_company === 0 }"
        >
          <Select
            v-model="formValidate.logistics_company"
            placeholder="请选择物流公司"
          >
            <Option
              v-for="(item, index) in logisticsCompany"
              :key="index"
              :value="index"
              >{{ item }}</Option
            >
          </Select>
        </FormItem>
        <FormItem
          prop="logistics_name"
          v-if="formValidate.logistics_company === 0"
        >
          <Input
            v-model="formValidate.logistics_name"
            placeholder="请输入快递公司名称"
          />
        </FormItem>
        <FormItem label="物流单号：" prop="logistics_no">
          <Input
            :maxlength="20"
            v-model="formValidate.logistics_no"
            @on-keyup="
              formValidate.logistics_no = formValidate.logistics_no.replace(
                /[^\a-\z\A-\Z0-9\@\.]/g,
                ''
              )
            "
            placeholder="请输入物流单号"
          />
        </FormItem>
        <div
          style="width:343px;background:#F5F6F7;padding:16px;border-radius:4px;"
        >
          <p
            style="margin-bottom:10px;font-weight:bold;font-size:13px;line-height:16px;"
          >
            发货地址
          </p>
          <p style="line-height:32px;">
            <span style="margin-right:23px">{{
              orderDetail.receiver_name
            }}</span>
            {{ orderDetail.receiver_tel }}
          </p>
          <p>
            {{ orderDetail.prov }} {{ orderDetail.city }}
            {{ orderDetail.area }} {{ orderDetail.receiver_address }}
          </p>
        </div>
        `
      </div>
      <div v-if="is_virtual">
        <FormItem label="提货单号：" key="order_id">
          <span>{{ orderDetail.order_id || orderDetail.id }}</span>
        </FormItem>
        <FormItem label="买家信息：" key="member-info">
          <div class="member-info">
            <img
              :src="
                padImgUrl(orderDetail.headurl) || 'images/head-portrait.png'
              "
              alt=""
            />
            <div class="right">
              <span
                style="color: #657180;font-size: 13px;line-height: 16px;"
                class="one-hide"
                >昵称：{{ orderDetail.nickname }}</span
              >
              <span
                style="color: #9ea7b4;font-size: 12px;line-height: 16px;"
                class="one-hide"
                >姓名：{{ orderDetail.name || "--" }}</span
              >
              <span
                style="display: block;color: #9ea7b4;font-size: 12px;line-height: 16px;"
                >手机：{{ orderDetail.mobile }}</span
              >
              <span
                style="display: block;color: #9ea7b4;font-size: 12px;line-height: 16px;"
                >ID：{{ orderDetail.member_id }}</span
              >
            </div>
          </div>
        </FormItem>
        <FormItem label="发货内容：" key="textarea">
          <div
            v-if="isReadOnly"
            style="line-height:18px;height: 133px;padding-top: 7px;word-break:break-all;"
          >
            {{ formValidate.logistics_no || "暂无" }}
          </div>
          <Input
            v-else
            class="no-resize"
            type="textarea"
            :rows="4"
            v-model="formValidate.logistics_no"
            placeholder="请输入发货内容"
          />
        </FormItem>
      </div>
    </Form>
    <div slot="footer" class="modalFooter">
      <Button type="text" @click="onCancel">取消</Button>
      <Button
        type="primary"
        @click="onCommit"
        class="ivu-btn-large"
        :loading="loading"
      >
        {{ isReadOnly ? "确定" : "确定发货" }}
      </Button>
    </div>
  </Modal>
</template>
<script>
import memberInfo from "@/views/shop/components/table/member-infor.vue";
export default {
  components: {
    memberInfo,
  },
  props: [
    "value",
    "orderDetail",
    "product_id", //单独发货时的商品id，可以区分单独发货与批量发货
    "product_ids", //批量发货时的商品id数组
    "logisticsInfo",
    "is_virtual", //0实物商品，1虚拟商品
    "isReadOnly",
  ],
  data() {
    return {
      showModal: false,
      logisticsCompany: Array.from(require("COMPONENTS/logisticsCompany.json")),
      loading: false,
      formValidate: {
        logistics_no: "",
        logistics_company: 6,
        logistics_name: "",
      },
      ruleValidate: {
        logistics_no: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (!value) {
                callback("物流单号不能为空");
              } else if (!/^[^\u4e00-\u9fa5]{1,20}$/.test(value)) {
                callback("只能输入英文和数字，最多只能输入20位");
              } else {
                callback();
              }
            },
          },
        ],
        logistics_name: [
          {
            required: true,
            message: "快递公司不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    value(newVal) {
      this.showModal = newVal;
    },
    showModal(now) {
      if (now) {
        this.$refs.formValidate.resetFields();
        if (this.logisticsInfo) {
          this.formValidate.logistics_no = this.logisticsInfo.logistics_no;
          this.formValidate.logistics_company = this.logisticsInfo.logistics_company;
          this.formValidate.logistics_name = this.logisticsInfo.logistics_name;
        } else {
          this.formValidate.logistics_company = this.is_virtual == 1 ? 0 : 6;
          this.formValidate.logistics_name =
            this.is_virtual == 1 ? "虚拟商品物流" : "";
          this.formValidate.logistics_no = "";
        }
      }
      this.$emit("input", now);
    },
  },
  methods: {
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
    onCancel() {
      this.showModal = false;
      this.$emit("deliverCanceled");
    },
    onCommit() {
      if (this.isReadOnly) {
        return (this.showModal = false);
      } else if (this.logisticsInfo) {
        this.modifyLogistics();
      } else {
        this.confirmDeliver();
      }
    },
    confirmDeliver() {
      this.loading = true;
      this.$refs["formValidate"].validate((valid) => {
        if (valid) {
          const data = this.formValidate;
          data.is_virtual = this.is_virtual;
          data.order_id = this.orderDetail.id || this.orderDetail.order_id;
          data.items = this.product_id ? [this.product_id] : this.product_ids;
          this.$httpPost(
            "/shop/admin/cloudstock/take/delivery/order/deliver",
            data,
            (res) => {
              this.loading = false;
              if (res.code === 200) {
                this.showModal = false;
                this.$Message.success("发货成功");
                this.$emit("deliverSuccess");
              } else {
                this.$Message.error("发货失败");
              }
            }
          );
        } else {
          this.loading = false;
        }
      });
    },
    modifyLogistics() {
      this.loading = true;
      this.$refs["formValidate"].validate((valid) => {
        if (valid) {
          const data = this.formValidate;
          data.is_virtual = this.is_virtual;
          data.order_id = this.orderDetail.id || this.orderDetail.order_id;
          data.id = this.logisticsInfo.logistics_id;
          this.$httpPost(
            "/shop/admin/cloudstock/take/delivery/order/logistics/edit",
            data,
            (res) => {
              this.loading = false;
              if (res.code === 200) {
                this.showModal = false;
                this.$Message.success("修改成功");
                this.$emit("deliverSuccess");
              } else {
                this.$Message.error("修改失败");
              }
            }
          );
        } else {
          this.loading = false;
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
.modal {
  /deep/.ivu-modal {
    /deep/.ivu-modal-body {
      padding: 24px;
      .member-info {
        display: flex;
        line-height: 20px;
        border: 1px solid #dcdee2;
        border-radius: 5px;
        padding: 8px 8px 8px 14px;
        align-items: center;
        img {
          width: 40px;
          height: 40px;
          margin-right: 14px;
          border-radius: 4px;
        }
      }
      .no-resize {
        /deep/textarea {
          resize: none;
        }
      }
    }
  }
}
</style>
