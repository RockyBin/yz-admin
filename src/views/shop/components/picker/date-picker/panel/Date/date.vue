<template>
  <div :class="classes" @mousedown.prevent>
    <div :class="[prefixCls + '-body']">
      <div :class="[prefixCls + '-content']">
        <DateTable
          :dates="dates"
          v-on="$listeners"
          ref="pickerTable"
        ></DateTable>
      </div>
      <Confirm v-if="confirm" v-on="$listeners"></Confirm>
    </div>
  </div>
</template>
<script>
import DateTable from "../../base/date-table.vue";
import Confirm from "../../base/confirm.vue";

import Locale from "iview/src/mixins/locale";

const prefixCls = "ivu-picker-panel";
const datePrefixCls = "ivu-date-picker";

export default {
  name: "DatePickerPanel",
  mixins: [Locale],
  components: {
    DateTable,
    Confirm
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    confirm: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const { value } = this;

    const dates = value.slice().sort();
    return {
      prefixCls: prefixCls,
      datePrefixCls: datePrefixCls,
      currentView: "date",
      pickerTable: "date-table",
      dates: dates
    };
  },
  computed: {
    classes() {
      return [`${prefixCls}-body-wrapper`];
    }
  },
  watch: {
    value(newVal) {
      this.dates = newVal;
    }
  }
};
</script>
