<template>
  <div class="address-select">
    <FormItem prop="province" :label-width="0" :rules="provinceRule">
      <Select
        v-model="validateData.province"
        transfer
        placeholder="请选择省"
        :disabled="!provinceArray.length"
        @on-change="onProvinceChange"
      >
        <Option
          v-for="item in provinceArray"
          :value="item.value"
          :disabled="level === 1 && disabledArray.includes(Number(item.value))"
          :key="item.value"
          >{{ item.label }}</Option
        >
      </Select>
    </FormItem>
    <FormItem
      prop="city"
      :label-width="0"
      v-show="level >= 2"
      :rules="cityRule"
    >
      <Select
        v-model="validateData.city"
        transfer
        placeholder="请选择市"
        :disabled="!cityArray.length"
        @on-change="onCityChange"
        not-found-text=""
      >
        <Option
          v-for="item in cityArray"
          :value="item.value"
          :disabled="level === 2 && disabledArray.includes(Number(item.value))"
          :key="item.value"
          >{{ item.label }}</Option
        >
      </Select>
    </FormItem>
    <FormItem
      prop="area"
      :label-width="0"
      v-show="level >= 3"
      :rules="areaRule"
    >
      <Select
        v-model="validateData.area"
        transfer
        placeholder="请选择区"
        :disabled="!areaArray.length"
        @on-change="onAreaChange"
        not-found-text=""
      >
        <Option
          v-for="item in areaArray"
          :disabled="level === 3 && disabledArray.includes(Number(item.value))"
          :value="item.value"
          :key="item.value"
          >{{ item.label }}</Option
        >
      </Select>
    </FormItem>
  </div>
</template>
<script>
import cityData from "@/views/shop/components/cityDataThree";
let province = cityData[0].provinceArr;
export default {
  props: {
    level: {
      validator(value) {
        return [1, 2, 3].includes(value);
      }
    },
    validateData: {
      required: true,
      type: Object
    },
    /**
     * 是否开启禁用，如果不需要传false
     */
    disabledAsync: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      province,
      disabledArray: [],
      loading: false,
      loadingError: false,
      provinceRule: [
        {
          required: true,
          trigger: "none",
          validator: (rule, value, callback) => {
            if (value) {
              return callback();
            } else {
              return callback("请选择代理区域");
            }
          }
        }
      ],
      cityRule: [
        {
          required: true,
          trigger: "none",
          validator: (rule, value, callback) => {
            if (this.level <= 1 || value) {
              return callback();
            } else {
              return callback(
                this.validateData.province ? "请选择代理区域" : ""
              );
            }
          }
        }
      ],
      areaRule: [
        {
          required: true,
          trigger: "none",
          validator: (rule, value, callback) => {
            if (this.level <= 2 || value) {
              return callback();
            } else {
              return callback(this.validateData.city ? "请选择代理区域" : "");
            }
          }
        }
      ]
    };
  },
  watch: {
    level: {
      handler(val) {
        // 如果最后一级的上一级有值，则需要拉取数据禁用
        if ([1, this.validateData.province, this.validateData.city][val - 1]) {
          this.getDisabledData(
            [10, 9, 8][val - 1],
            [0, this.validateData.province, this.validateData.city][val - 1]
          );
        } else {
          this.disabledArray = [];
        }
      },
      immediate: true
    }
  },
  computed: {
    /**
     * 省列表
     */
    provinceArray() {
      if (this.level === 1 && (this.loading || this.loadingError)) {
        return [];
      }
      return this.province;
    },
    /**
     * 城市列表
     */
    cityArray() {
      if (this.level === 2 && (this.loading || this.loadingError)) {
        return [];
      }
      if (this.level >= 2 && this.validateData.province) {
        return this.province.find(n => n.value === this.validateData.province)
          .children;
      }
      return [];
    },
    /**
     * 区/县列表
     */
    areaArray() {
      if (this.level === 3 && (this.loading || this.loadingError)) {
        return [];
      }
      if (this.level >= 3 && this.validateData.city) {
        return this.cityArray.find(n => n.value === this.validateData.city)
          .children;
      }
      return [];
    }
  },
  methods: {
    onSelectTypeChange() {
      this.$children.forEach(n => (n.validateState = ""));
    },
    onProvinceChange(val) {
      this.$set(this.validateData, "city", null);
      this.$set(this.validateData, "area", null);
      this.onSelectTypeChange();
      val && this.getDisabledData(9, val);
    },
    onCityChange(val) {
      this.$set(this.validateData, "area", null);
      this.onSelectTypeChange();
      val && this.getDisabledData(8, val);
    },
    onAreaChange() {
      this.onSelectTypeChange();
    },
    /**
     * 获取禁用的区域
     */
    getDisabledData(area_type, parent_id) {
      // 如果不是当前级别不用请求
      if (
        !this.disabledAsync ||
        [10, 9, 8].findIndex(n => n === area_type) + 1 !== this.level
      ) {
        return;
      }
      this.disabledArray = [];
      this.loading = true;
      this.loadingError = false;
      this.$httpPost(
        "/shop/admin/area/agent/disable/area",
        {
          area_type: area_type,
          parent_id: parent_id
        },
        res => {
          this.loading = false;
          if (res.code === 200) {
            this.disabledArray = Object.values(res.data.area_ids || {});
          } else {
            this.loadingError = true;
            this.$Message.error(res.msg);
          }
        }
      )
    }
  }
}
</script>
<style lang="less" scoped>
.address-select {
  display: inline-block;
  /deep/.ivu-form-item {
    display: inline-block;
    margin-bottom: 0 !important;
    & + .ivu-form-item {
      margin-left: 5px;
    }
    .ivu-form-item-content .ivu-select {
      vertical-align: top;
    }
    .ivu-select {
      width: 100px;
    }
  }
}
</style>
