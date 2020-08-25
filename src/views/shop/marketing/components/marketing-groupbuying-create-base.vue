<template>
  <div class="marketing-groupbuying-create-base">
    <Form
      :model="info.base_info"
      :label-width="100"
      ref="formValidate"
      :rules="ruleValidate"
    >
      <FormItem label="拼团类型：">
        <RadioGroup v-model="info.base_info.type">
          <Radio :label="0" :disabled="info.base_info.status === 1">
            <span>普通拼团</span>
            <more-message
              placement="top-end"
              :text="`不论新老客户都可以选择开团或凑团购买\n商品`"
            />
          </Radio>
          <Radio
            :label="1"
            class="marketing-groupbuying-create-12"
            :disabled="info.base_info.status === 1"
          >
            <span>老带新拼团</span>
            <more-message
              :text="`不论新老客户都可以开团，但只有新客户\n才可以凑团购买商品`"
            />
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="活动名称：" prop="title">
        <Input
          class="common-input-text-260"
          :maxlength="20"
          v-model="info.base_info.title"
          placeholder="请输入活动名称"
        /><span class="marketing-groupbuying-suffix"
          >{{ info.base_info.title.length }}/20</span
        >
      </FormItem>
      <FormItem
        label="活动时间："
        style="display: inline-block;"
        prop="start_time"
        :class="{ 'ivu-form-item-error': activityTimeErrorShow }"
      >
        <DatePicker
          type="datetime"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.start_time"
          format="yyyy-MM-dd HH:mm"
          placeholder="请选择开始时间"
          class="common-input-text-200"
          :options="{
            disabledDate: disabledDate
          }"
        ></DatePicker>
        <span
          style="margin: 0px 8px;width: 8px;display: inline-block;height: 1px;background-color: #707070;vertical-align: middle;"
        ></span>
        <div class="ivu-form-item-error-tip" v-show="activityTimeErrorShow">
          结束时间不能早于开始时间
        </div>
      </FormItem>
      <FormItem
        :label-width="0"
        style="display: inline-block;"
        prop="end_time"
        :class="{ 'ivu-form-item-error': activityTimeErrorShow }"
      >
        <DatePicker
          type="datetime"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.end_time"
          format="yyyy-MM-dd HH:mm"
          placeholder="请选择结束时间"
          class="common-input-text-200"
          :options="{
            disabledDate: disabledDate
          }"
        ></DatePicker>
      </FormItem>
      <FormItem label="参团人数：" prop="people_num">
        <InputNumber
          class="common-input-text-160"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.people_num"
          :precision="0"
          :max="100"
          :min="0"
          placeholder="请填写2-100的数字"
        ></InputNumber>
        <span class="marketing-groupbuying-create-12">人</span>
      </FormItem>
      <FormItem label="拼团有效期：" prop="close_day">
        <InputNumber
          style="width: 70px;"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.close_day"
          :formatter="formatTime"
          @on-blur="onBlurChange('close_day')"
          :precision="0"
          :max="30"
          :min="0"
        ></InputNumber>
        <span class="marketing-groupbuying-create-12">日</span>
        <InputNumber
          style="width: 70px;"
          :disabled="info.base_info.status === 1"
          class="marketing-groupbuying-create-12"
          v-model="info.base_info.close_hour"
          :formatter="formatTime"
          :precision="0"
          @on-blur="onBlurChange('close_hour')"
          :max="23"
          :min="0"
        ></InputNumber>
        <span class="marketing-groupbuying-create-12">时</span>
        <InputNumber
          style="width: 70px;"
          :disabled="info.base_info.status === 1"
          class="marketing-groupbuying-create-12"
          v-model="info.base_info.close_minute"
          :precision="0"
          @on-blur="onBlurChange('close_minute')"
          :formatter="formatTime"
          :max="59"
          :min="0"
        ></InputNumber>
        <span class="marketing-groupbuying-create-12">分</span>
        <more-message
          placement="top"
          :text="
            `例如：设置1日，用户发起开团后，需要\n在1日之内成团，超时则拼团失败`
          "
        />
      </FormItem>
      <!--<FormItem label="拼单基数：">-->
        <!--<InputNumber-->
          <!--class="common-input-text-260"-->
          <!--:min="0"-->
          <!--:max="9999999"-->
          <!--:precision="0"-->
          <!--v-model="info.base_info.order_base_num"-->
          <!--placeholder="请输入拼单基数"-->
        <!--&gt;</InputNumber>-->
        <!--<span class="marketing-groupbuying-create-12">单</span>-->
        <!--<more-message-->
          <!--placement="top"-->
          <!--:text="`拼单基数是指在前台展示的【已拼数量=\n拼单基数+实际拼单数量】`"-->
        <!--/>-->
      <!--</FormItem>-->
      <FormItem label="模拟成团：">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_mock_group"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启模拟成团后，拼团有效期内人数未满的团，系统将会模拟“匿名买家”凑满人数，<br />
          使该团成团。你只需要对已付款参团的真实买家发货。建议合理开启，以提高成团率。
        </div>
      </FormItem>
      <FormItem label="凑团设置：">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_virtual_group"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启凑团后，对于未参团的买家，活动商品详情页会显示未成团的列表，买家可以直接<br />
          任选一个参团，提升成团率。
        </div>
      </FormItem>
      <FormItem label="优惠叠加：">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_coupon"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启后，拼团商品可以使用优惠券。
        </div>
      </FormItem>
      <FormItem label="积分抵扣：">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_point"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启后，拼团商品可以使用积分抵扣（跟随商品设置的积分抵扣规则）
        </div>
      </FormItem>
      <FormItem label="参与分销分佣：" v-if="hasLicensePerm('ENABLE_DISTRIBUTION')">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_distribution"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启后，拼团订单允许参与分销分佣（跟随商品设置的分销佣金规则）
        </div>
      </FormItem>
      <FormItem label="参与代理分红：" v-if="hasLicensePerm('ENABLE_AGENT')">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_agent"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启后，拼团订单允许参与代理分红（跟随商品设置的代理分红和销售返佣规则）
        </div>
      </FormItem>
      <FormItem label="参与区域返佣：" v-if="hasLicensePerm('ENABLE_AREA_AGENT')">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_area_agent"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-base-tip">
          *开启后，拼团订单允许参与区域返佣（跟随商品设置的区域代理返佣规则）
        </div>
      </FormItem>
      <FormItem label="拼团规则：">
        <Input
          type="textarea"
          class="common-input-text-260"
          style="height: auto;"
          :maxlength="500"
          v-model="info.base_info.rule_info"
          placeholder="请输入拼团规则说明"
        />
        <span
          style="position: absolute;bottom: 0;margin-left: 10px;line-height: 12px;padding-bottom: 5px;color:#999999;"
          >{{ info.base_info.rule_info.length }}/500</span
        >
      </FormItem>
    </Form>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    moreMessage
  },
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activityTimeErrorShow: false,
      disabledDate: date => {
        return date && date.valueOf() < Date.now() - 86400000;
      },
      ruleValidate: {
        title: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value.trim()) {
                return callback();
              }
              return callback(new Error("请输入活动名称"));
            },
            trigger: "blur"
          }
        ],
        start_time: [
          {
            required: true,
            validator: (rule, value, callback) => {
              this.activityTimeErrorShow = false;
              if (value) {
                this.info.base_info.end_time &&
                  this.checkActivityTime(value, this.info.base_info.end_time);
                return callback();
              }
              return callback(new Error("请选择开始时间"));
            },
            trigger: "change"
          }
        ],
        end_time: [
          {
            validator: (rule, value, callback) => {
              this.activityTimeErrorShow = false;
              if (value) {
                this.info.base_info.start_time &&
                  this.checkActivityTime(this.info.base_info.start_time, value);
                return callback();
              }
              return callback(new Error("请选择结束时间"));
            },
            trigger: "change"
          }
        ],
        people_num: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value !== null) {
                if (value >= 2) {
                  return callback();
                }
                return callback(new Error("请填写2-100的数字"));
              }
              return callback(new Error("请填写参团人数"));
            },
            trigger: "blur"
          }
        ],
        close_day: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (
                !this.info.base_info.close_day &&
                !this.info.base_info.close_hour &&
                !this.info.base_info.close_minute
              ) {
                return callback(new Error("设置不合理，不能选择00：00：00"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    formatTime(val) {
      let value = val.toString();
      value = value[1] ? value : "0" + value;
      return value;
    },
    onBlurChange(key) {
      if (this.info.base_info[key] === null) {
        this.$nextTick(() => {
          this.$set(this.info.base_info, key, 0);
        });
      }
    },
    checkActivityTime(time1, time2) {
      let status = new Date(time1).getTime() < new Date(time2).getTime();
      this.activityTimeErrorShow = !status;
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-groupbuying-create-base {
  padding: 24px;
  .marketing-groupbuying-create-12 {
    margin-left: 12px;
  }
  .marketing-groupbuying-create-base-tip {
    position: absolute;
    top: 5px;
    min-height: 22px;
    left: 60px;
    line-height: 16px;
    font-size: 12px;
    color: #9ea7b4;
    display: flex;
    align-items: center;
  }
  /deep/span.ivu-radio + span {
    margin-right: 0;
  }
  /deep/.more-message {
    line-height: 28px;
    margin-left: 10px;
    i {
      font-size: 16px;
    }
  }
  .marketing-groupbuying-suffix {
    padding-left: 5px;
    position: absolute;
    line-height: 48px;
    display: inline-block;
  }
  /deep/textarea {
    height: 76px;
    padding: 6px 7px;
  }
}
</style>
