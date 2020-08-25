<template>
  <Modal
    v-model="showModal"
    class="modal"
    title="发货信息"
    width="391"
    :mask-closable="false"
    :footer-hide="logisticsInfo && logisticsInfo.isReadOnly"
  >
    <Form
      ref="formValidate"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="orderDetail.virtual_flag == 1 || formValidate.is_virtual == 1 ? 75 : 88"
    >
      <!--实物-->
      <div v-if="orderDetail.virtual_flag != 1 && formValidate.is_virtual != 1">
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
            v-model="formValidate.logistics_no"
            placeholder="请输入物流单号"
          />
        </FormItem>
        <div style="width:343px;background:#F5F6F7;padding:16px;">
          <p
            style="margin-bottom:10px;font-weight:bold;font-size:13px;line-height:16px;"
          >
            发货地址
          </p>
          <p style="line-height:32px;">
            <span style="margin-right:23px">{{
              orderDetail.receiver_name
            }}</span
            >{{ orderDetail.receiver_tel }}
          </p>
          <p>
            {{ orderDetail.prov || orderDetail.address && orderDetail.address.prov_text }} {{ orderDetail.city || orderDetail.address && orderDetail.address.city_text }}
            {{ orderDetail.area || orderDetail.address && orderDetail.address.area_text }} {{ orderDetail.receiver_address || orderDetail.address && orderDetail.address.address }}
          </p>
        </div>
      </div>
      <!--虚拟-->
      <div v-if="orderDetail.virtual_flag == 1 || formValidate.is_virtual == 1">
        <FormItem label="总订单号：" key="order_id">
          <span>{{ order_id }}</span>
        </FormItem>
        <FormItem label="买家信息：" key="member-info">
          <member-info
            class="member-info"
            :id="orderDetail.member_id"
            :headurl="
              padImgUrl(orderDetail.member_headurl) ||
                'images/head-portrait.png'
            "
          >
            <span
              style="color: #657180;font-size: 13px;line-height: 16px;"
              class="one-hide"
              >昵称：{{ orderDetail.member_nickname }}</span
            >
            <span
              style="color: #9ea7b4;font-size: 12px;line-height: 16px;"
              class="one-hide"
              >姓名：{{ orderDetail.member_name || "--" }}</span
            >
            <span
              style="display: block;color: #9ea7b4;font-size: 12px;line-height: 16px;"
              >手机：{{ orderDetail.member_mobile }}</span
            >
            <span
              style="display: block;color: #9ea7b4;font-size: 12px;line-height: 16px;"
              >ID：{{ orderDetail.member_id }}</span
            >
          </member-info>
        </FormItem>
        <FormItem label="发货内容：" key="textarea">
          <div 
            v-if="logisticsInfo && logisticsInfo.isReadOnly"
            style="line-height:18px;height: 133px;padding-top: 7px;"
          >{{formValidate.logistics_no || "暂无"}}</div>
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
        >{{logisticsInfo && logisticsInfo.isReadOnly ? '确定' : '确定发货'}}</Button
      >
    </div>
  </Modal>
</template>
<script>
import memberInfo from "@/views/shop/components/table/member-infor.vue";
export default {
  props: ["value", "order_id", "orderDetail", "logisticsInfo"],
  components: {
    memberInfo,
  },
  data() {
    return {
      showModal: false,
      logisticsCompany: Array.from(require("COMPONENTS/logisticsCompany.json")),
      loading: false,
      formValidate: {
        items: "",
        is_virtual: 0,
        logistics_no: "",
        logistics_company: 0,
        logistics_name: "",
      },
      ruleValidate: {
        logistics_no: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value.trim() === "" && this.orderDetail.virtual_flag != 1) {
                callback(new Error("物流单号不能为空"));
                /*} else if (
                (!/^[0-9a-zA-Z]+$/.test(value.trim()) ||
                value.trim().length > 20
              ) {
                callback(new Error("只能输入英文和数字，最多只能输入20位"));
              */
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
      if (this.showModal) {
      }
    },
    showModal(now) {
      if (now) {
        this.$refs.formValidate && this.$refs.formValidate.resetFields();
        this.formValidate = {
          items: "",
          is_virtual: 0,
          logistics_no: "",
          logistics_company: 0,
          logistics_name: "",
        };
        if (this.logisticsInfo) {
          this.formValidate.items = this.logisticsInfo.items;
          this.formValidate.is_virtual = this.logisticsInfo.is_virtual;
          this.formValidate.logistics_no = this.logisticsInfo.logistics_no;
          this.formValidate.logistics_company = this.logisticsInfo.logistics_company;
          this.formValidate.logistics_name = this.logisticsInfo.logistics_name;
        } else {
          this.formValidate.logistics_company =
            this.orderDetail.virtual_flag == 1 ? 0 : 6;
          this.formValidate.logistics_name =
            this.orderDetail.virtual_flag == 1 ? "虚拟商品物流" : "";
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
      this.$emit("closeShowModal");
    },
    onCommit() {
      if(this.logisticsInfo && this.logisticsInfo.isReadOnly) {
        return this.showModal = false;
      }
      this.loading = true;
      this.$refs["formValidate"].validate((valid) => {
        if (valid) {
          const data = this.formValidate;
          data.id = this.order_id;
          let httpUrl = "/shop/admin/order/deliver";
          if (this.logisticsInfo && this.logisticsInfo.logistics_id) {
            // 修改物流信息
            data.logistics_id = this.logisticsInfo.logistics_id;
            httpUrl = "/shop/admin/logistics/edit";
          }
          this.$httpGet(httpUrl, data, (res) => {
            this.loading = false;
            if (res.code === 200) {
              this.showModal = false;
              if (data.logistics_id) {
                this.$Message.success("修改成功");
              } else {
                this.$Message.success("发货成功");
              }
              this.$emit("changeShowModal");
            } else {
              this.$Message.error("发货失败");
            }
          });
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
    .ivu-modal-body {
      padding: 24px;
      .member-info {
        line-height: 20px;
        border: 1px solid #dcdee2;
        border-radius: 5px;
        padding-left: 14px;
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
