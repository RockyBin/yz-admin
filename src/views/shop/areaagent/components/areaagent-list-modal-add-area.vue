<template>
  <div>
    <Modal
      :width="480"
      title="添加代理区域"
      :loading="modalLoading"
      :mask-closable="false"
      v-model="modalStatus"
      @on-ok="onModalComfrimClick"
    >
      <Form
        ref="areaSelectForm"
        :label-width="83"
        :model="validateData"
        class="add-area-form"
      >
        <FormItem 
          label="代理区域：" 
          class="ivu-form-item-required"
          style="margin-bottom:10px!important"
        >
          <RadioGroup
            v-model="validateData.area_type"
            @on-change="onSelectTypeChange"
          >
            <Radio :label="10" >省代</Radio>
            <Radio :label="9" >市代</Radio>
            <Radio :label="8" >区代</Radio>
          </RadioGroup>
        </FormItem>
        <address-select
          style="margin-left:83px;"
          v-if="modalStatus"
          :validateData="validateData"
          :level="[10, 9, 8].findIndex(n => n === validateData.area_type) + 1"
        />
      </Form>
    </Modal>
  </div>
</template>
<script>
import addressSelect from "@/views/shop/components/selector/address-select";
const validateData = {
  area_type: 10,
  province: null,
  city: null,
  area: null,
}
export default {
  components: {
    addressSelect
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalStatus: false,
      modalLoading: true,
      validateData: {},
    }
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      this.validateData = {...validateData};
    },
    modalStatus(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onModalComfrimClick() {
      // 判断是否选择了会员和等级
      this.$refs["areaSelectForm"].validate(valid => {
        if (valid) {
          this.$emit("onGetAreaData", this.validateData);
          this.modalStatus = false;
        } else {
          this.modalLoading = false;
          this.$nextTick(() => {
            this.modalLoading = true;
          });
        }
      });
    },
    onSelectTypeChange() {
      this.$refs["areaSelectForm"].fields.forEach(n => {
        if (["province", "city", "area"].includes(n.prop)) {
          n.validateState = "";
        }
      });
    }
  }
}
</script>
<style lang='less' scoped>
.add-area-form {
  /deep/.ivu-radio-group {
    vertical-align: unset;
  }
  /deep/.ivu-radio-wrapper {
    vertical-align: unset;
    margin-right: 20px;
  }
}
</style>