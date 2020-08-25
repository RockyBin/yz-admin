<template>
  <div
    :class="wrapperClasses"
    v-click-outside:mousedown.capture="handleClose"
    v-click-outside:touchstart.capture="handleClose"
    v-click-outside.capture="handleClose"
  >
    <div ref="reference" :class="[prefixCls + '-rel']">
      <slot>
        <i-input
          :key="forceInputRerender"
          :element-id="elementId"
          :class="[prefixCls + '-editor']"
          :readonly="!editable || readonly"
          :disabled="disabled"
          :size="size"
          :placeholder="placeholder"
          :value="visualValue"
          :name="name"
          ref="input"
          @on-input-change="handleInputChange"
          @on-focus="handleFocus"
          @on-blur="handleBlur"
          @click.native="handleFocus"
          @keydown.native="handleKeydown"
          @mouseenter.native="handleInputMouseenter"
          @mouseleave.native="handleInputMouseleave"
        >
          <Icon
            @click="handleIconClick"
            :type="arrowType"
            :custom="customArrowType"
            :size="arrowSize"
            slot="suffix"
          />
        </i-input>
      </slot>
    </div>
    <transition name="transition-drop">
      <Drop
        @click.native="handleTransferClick"
        v-show="opened"
        :class="{ [prefixCls + '-transfer']: transfer }"
        :placement="placement"
        ref="drop"
        :data-transfer="transfer"
        :transfer="transfer"
        v-transfer-dom
      >
        <div>
          <DatePickerPanel
            ref="pickerPanel"
            :confirm="isConfirm"
            :value="internalValue"
            @on-pick="onPick"
            @on-pick-clear="handleClear"
            @on-pick-success="onPickSuccess"
            @on-pick-click="disableClickOutSide = true"
          ></DatePickerPanel>
          <div class="ivu-picker-panel-bottom">
            <Checkbox
              ref="checkbox"
              v-model="checkedLastDay"
              @on-change="onLastDaySelectChange"
              >每月最后一天</Checkbox
            >
          </div>
        </div>
      </Drop>
    </transition>
  </div>
</template>
<script>
import Drop from "iview/src/components/select/dropdown.vue";
import { directive as clickOutside } from "v-click-outside-x";
import TransferDom from "iview/src/directives/transfer-dom";
import DatePickerPanel from "./panel/Date/date.vue";
import { oneOf } from "iview/src/utils/assist";
import Emitter from "iview/src/mixins/emitter";

const prefixCls = "ivu-date-picker";
const pickerPrefixCls = "ivu-picker";

const isEmptyArray = val =>
  val.reduce(
    (isEmpty, str) =>
      (isEmpty && !str) || (typeof str === "string" && str.trim() === ""),
    true
  );
const keyValueMapper = {
  40: "up",
  39: "right",
  38: "down",
  37: "left"
};

export default {
  mixins: [Emitter],
  components: { Drop, DatePickerPanel },
  directives: { clickOutside, TransferDom },
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    confirm: {
      type: Boolean,
      default: false
    },
    open: {
      type: Boolean,
      default: null
    },
    size: {
      validator(value) {
        return oneOf(value, ["small", "large", "default"]);
      },
      default() {
        return !this.$IVIEW || this.$IVIEW.size === ""
          ? "default"
          : this.$IVIEW.size;
      }
    },
    placeholder: {
      type: String,
      default: ""
    },
    placement: {
      validator(value) {
        return oneOf(value, [
          "top",
          "top-start",
          "top-end",
          "bottom",
          "bottom-start",
          "bottom-end",
          "left",
          "left-start",
          "left-end",
          "right",
          "right-start",
          "right-end"
        ]);
      },
      default: "bottom-start"
    },
    transfer: {
      type: Boolean,
      default() {
        return !this.$IVIEW || this.$IVIEW.transfer === ""
          ? false
          : this.$IVIEW.transfer;
      }
    },
    name: {
      type: String
    },
    elementId: {
      type: String
    },
    value: {
      type: [Number, String, Array]
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 处理初始值显示
    const emptyArray = [];
    const initialValue = isEmptyArray(this.value || [])
      ? emptyArray
      : this.parseDate(this.value);
    return {
      prefixCls: prefixCls,
      showClose: false,
      visible: false,
      checkedLastDay: false,
      internalValue: initialValue,
      disableClickOutSide: false, // fixed when click a date,trigger clickoutside to close picker
      disableCloseUnderTransfer: false, // transfer 模式下，点击Drop也会触发关闭,
      forceInputRerender: 1,
      isFocused: false,
      internalFocus: false
    };
  },
  computed: {
    ownPickerProps() {
      return this.options;
    },
    wrapperClasses() {
      return [
        prefixCls,
        {
          [prefixCls + "-focused"]: this.isFocused
        }
      ];
    },
    opened() {
      return this.open === null ? this.visible : this.open;
    },
    transition() {
      const bottomPlaced = this.placement.match(/^bottom/);
      return bottomPlaced ? "slide-up" : "slide-down";
    },
    visualValue() {
      return this.formatDate(this.value);
    },
    isConfirm() {
      return this.confirm;
    },
    // 3.4.0, global setting customArrow 有值时，arrow 赋值空
    arrowType() {
      let type = "ios-calendar-outline";

      if (this.$IVIEW) {
        if (this.$IVIEW.datePicker.customIcon) {
          type = "";
        } else if (this.$IVIEW.datePicker.icon) {
          type = this.$IVIEW.datePicker.icon;
        }
      }

      if (this.showClose) type = "ios-close-circle";

      return type;
    },
    // 3.4.0, global setting
    customArrowType() {
      let type = "";

      if (!this.showClose) {
        if (this.$IVIEW) {
          if (this.$IVIEW.datePicker.customIcon) {
            type = this.$IVIEW.datePicker.customIcon;
          }
        }
      }

      return type;
    },
    // 3.4.0, global setting
    arrowSize() {
      let size = "";

      if (!this.showClose) {
        if (this.$IVIEW) {
          if (this.$IVIEW.datePicker.iconSize) {
            size = this.$IVIEW.datePicker.iconSize;
          }
        }
      }

      return size;
    }
  },
  methods: {
    onLastDaySelectChange() {
      this.onPick(-1);
    },
    // 开启 transfer 时，点击 Drop 即会关闭，这里不让其关闭
    handleTransferClick() {
      if (this.transfer) this.disableCloseUnderTransfer = true;
    },
    handleClose(e) {
      if (this.disableCloseUnderTransfer) {
        this.disableCloseUnderTransfer = false;
        return false;
      }

      if (e && e.type === "mousedown" && this.visible) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (this.visible) {
        const pickerPanel =
          this.$refs.pickerPanel && this.$refs.pickerPanel.$el;
        if (e && pickerPanel && pickerPanel.contains(e.target)) return; // its a click inside own component, lets ignore it.

        this.visible = false;
        e && e.preventDefault();
        e && e.stopPropagation();
        this.$emit("on-clickoutside", e);
        return;
      }

      this.isFocused = false;
      this.disableClickOutSide = false;
    },
    handleFocus(e) {
      if (this.readonly) return;
      this.isFocused = true;
      if (e && e.type === "focus") return; // just focus, don't open yet
      if (!this.disabled) {
        this.visible = true;
      }
    },
    handleBlur(e) {
      if (this.internalFocus) {
        this.internalFocus = false;
        return;
      }
      if (this.visible) {
        e.preventDefault();
        return;
      }

      this.isFocused = false;
      this.internalValue = this.internalValue.slice(); // trigger panel watchers to reset views
    },
    handleKeydown(e) {
      const keyCode = e.keyCode;

      // handle "tab" key
      if (keyCode === 9) {
        if (this.visible) {
          e.stopPropagation();
          e.preventDefault();

          if (this.isConfirm) {
            const selector = `.${pickerPrefixCls}-confirm > *`;
            const tabbable = this.$refs.drop.$el.querySelectorAll(selector);
            this.internalFocus = true;
            const element = [...tabbable][e.shiftKey ? "pop" : "shift"]();
            element.focus();
          } else {
            this.handleClose();
          }
        } else {
          this.focused = false;
        }
      }

      // open the panel
      const arrows = [37, 38, 39, 40];
      if (!this.visible && arrows.includes(keyCode)) {
        this.visible = true;
        return;
      }

      // close on "esc" key
      if (keyCode === 27) {
        if (this.visible) {
          e.stopPropagation();
          this.handleClose();
        }
      }

      // select date, "Enter" key
      if (keyCode === 13) {
        return;
      }

      if (!arrows.includes(keyCode)) return; // ignore rest of keys

      this.navigateDatePanel(keyValueMapper[keyCode]);
    },
    navigateDatePanel(direction, shift) {
      // 上下左右切换
      console.log(direction, shift);
    },
    handleInputChange(event) {
      const oldValue = this.visualValue;
      const newValue = event.target.value;
      const newDate = this.parseDate(newValue);
      const disabledDateFn =
        this.options &&
        typeof this.options.disabledDate === "function" &&
        this.options.disabledDate;
      const valueToTest = newDate;
      const isDisabled = disabledDateFn && disabledDateFn(valueToTest);
      const isValidDate = newDate.reduce(
        (valid, date) => valid && date instanceof Date,
        true
      );

      if (newValue !== oldValue && !isDisabled && isValidDate) {
        this.emitChange();
        this.internalValue = newDate;
      } else {
        this.forceInputRerender++;
      }
    },
    handleInputMouseenter() {
      if (this.readonly || this.disabled) return;
      if (this.visualValue && this.clearable) {
        this.showClose = true;
      }
    },
    handleInputMouseleave() {
      this.showClose = false;
    },
    handleIconClick(e) {
      if (this.showClose) {
        if (e) e.stopPropagation();
        this.handleClear();
      } else if (!this.disabled) {
        this.handleFocus();
      }
    },
    handleClear() {
      this.visible = false;
      this.internalValue = [];
      this.checkedLastDay = false;
      this.$emit("on-clear");
      this.$emit("input", []);
      this.dispatch("FormItem", "on-form-change", "");
      this.emitChange();
    },
    emitChange() {
      this.$nextTick(() => {
        this.$emit("on-change");
        this.dispatch("FormItem", "on-form-change", this.value.length);
      });
    },
    parseDate(val) {
      return val.concat();
    },
    formatDate(value) {
      let val = value
        .filter(n => n)
        .sort((a, b) => {
          if (a === -1 || b === -1) return b - a;
          return a - b;
        })
        .map(n => {
          if (n === -1) {
            return "最后一天";
          }
          return n;
        });
      return val.join(";");
    },
    onPick(val, visible = false) {
      const valIndex = this.internalValue.findIndex(date => val === date);
      if (valIndex === -1) {
        this.internalValue.push(val);
      } else {
        this.internalValue = this.internalValue.filter(n => n !== val);
      }
      if (!this.isConfirm) this.visible = visible;
    },
    onPickSuccess() {
      this.visible = false;
      this.$emit("on-ok");
      this.$emit("input", this.internalValue.concat());
      this.emitChange();
      this.focus();
    },
    focus() {
      this.$refs.input && this.$refs.input.focus();
    },
    updatePopper() {
      this.$refs.drop.update();
    }
  },
  watch: {
    visible(state) {
      if (state === false) {
        this.$refs.drop.destroy();
      } else {
        this.checkedLastDay = !!this.value.find(n => n === -1);
        this.internalValue = this.value.length ? this.value.concat() : [];
      }
      this.$refs.drop.update();
      this.$emit("on-open-change", state);
    },
    value(val) {
      this.internalValue = this.parseDate(val);
      this.checkedLastDay = !!val.find(n => n === -1);
    },
    open(val) {
      this.visible = val === true;
    }
  },
  mounted() {
    if (this.open !== null) this.visible = this.open;

    // to handle focus from confirm buttons
    this.$on("focus-input", () => this.focus());
    this.$on("update-popper", () => this.updatePopper());
    this.$refs.checkbox.change = function(event) {
      if (this.disabled) {
        return false;
      }

      const checked = event.target.checked;
      this.currentValue = checked;

      const value = checked ? this.trueValue : this.falseValue;
      this.$emit("input", value);

      if (this.group) {
        this.parent.change(this.model);
      } else {
        this.$emit("on-change", value);
      }
    }.bind(this.$refs.checkbox);
  }
};
</script>
<style lang="less" scoped>
.ivu-picker-panel-bottom {
  position: absolute;
  bottom: 0;
  padding: 10px;
  line-height: 20px;
}
</style>
