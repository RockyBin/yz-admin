<template>
  <div class="data-list-search">
    <template v-for="(column,key) in columns">
      <div :key="key + '_new'" v-if="column[0].search_new_line"></div>
      <div
        class="data-list-search-item"
        :key="key"
        :class="{'data-list-line-item': column[0].search_new_line}"
      >
        <template v-for="(item, index) in column">
          <span
            v-if="item.combine && !item.name && index > 0"
            class="data-list-search-span date-line"
            :key="'line-span' + index"
          ></span>
          <div
            :key="'line' + index"
            style="display: inline-block;"
            :class="{'data-list-line-item-combine': item.combine}"
          >
            <span
              v-if="item.name"
              :style="{width: item.width}"
              class="data-list-search-span"
            >{{item.name}}</span>
            <!-- 普通输入框 -->
            <Input
              v-if="item.type===1"
              :key="item.type"
              v-model="searchDataCopy[item.key]"
              :placeholder="item.placeholder"
              :prefix="item.prefixIcon ? item.prefixIcon : ''"
              @on-enter="onSearchClick"
            />
            <!-- 只能输入数字的普通输入框 -->
            <div
              v-if="item.type === 9"
              class="ivu-input-wrapper ivu-input-wrapper-default ivu-input-type"
            >
              <input
                :placeholder="item.placeholder"
                type="text"
                name
                class="ivu-input ivu-input-default"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="searchDataCopy[item.key]"
                @keypress="$event.keyCode === 13 && onSearchClick()"
              />
            </div>
            <!--复合型输入框-->
            <Input
              v-if="item.type === 10"
              :key="item.type"
              v-model="searchDataCopy[item.key]"
              :placeholder="
                typeof item.placeholder === 'object'
                  ? item.placeholder[searchDataCopy[item.optionKey]]
                  : item.placeholder || ''
              "
              :prefix="item.prefixIcon ? item.prefixIcon : ''"
              @on-enter="onSearchClick"
              :style="{width: `${item.width ? item.width : 220}px`,'padding-left':'0'}"
              class="mixInput"
            >
              <Select v-model="searchDataCopy[item.optionKey]" slot="prepend" :style="{width: `${item.optionWidth ? item.optionWidth : 77}px`}">
                <template v-for="(item1, key) in item.options">
                  <Option
                      v-if="item1"
                      :key="key"
                      :value="item1.id"
                  >{{item1.value}}</Option>
                </template>
              </Select>
            </Input>
            <InputNumber v-if="item.type===4" v-model="searchDataCopy[item.key]"></InputNumber>
            <!-- 日期输入框 -->
            <DatePicker
              v-if="item.type===2"
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              :value="searchDataCopy[item.key].startTime"
              :options="{
            disabledDate: (date) => {
              return disableStartDate.apply(this, [date, item])
            }
          }"
              placeholder="选择开始日期"
              @on-change="onStartDateChange.apply(this, [item, ...arguments])"
            ></DatePicker>
            <span v-if="item.type===2" class="data-list-search-span date-line"></span>
            <DatePicker
              v-if="item.type===2"
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              :value="searchDataCopy[item.key].endTime"
              :options="{
            disabledDate: (date) => {
              return disableEndDate.apply(this, [date, item])
            }
          }"
              placeholder="选择结束日期"
              @on-change="onEndDateChange.apply(this, [item, ...arguments])"
            ></DatePicker>
            <!-- 单项选择框 -->
            <!-- 给单项选择器添加标题 -->
           <span v-if="item.type===3 && item.title" style="margin-right:5px">
             {{item.title}}
           </span>
            <Select
              v-if="item.type===3"
              :placeholder="item.placeholder || '请选择'"
              v-model="searchDataCopy[item.key]"
              :style="item.width ? 'width:' + item.width + 'px' : ''"
            >
              <Option
                v-for="(item1, key) in item.options"
                :value="item1.id"
                :key="key"
              >{{item1.value}}</Option>
            </Select>
            <!--复合选择框-->
            <Input class="compound-selection" :key="item.type" v-if="item.type===12" :style="{width: `${item.width ? item.width : 250}px`,'padding-left':'0'}">
              <Select v-model="searchDataCopy[item.optionKey]" @on-change="getChangeLevel(searchDataCopy[item.optionKey])" slot="prepend" :style="`width: ${(item.width ? item.width : 250) - 150}px;`">
                <template v-for="(item1, key) in item.optionsType">
                  <Option
                      v-if="item1"
                      :key="key"
                    :value="item1.id"
                  >{{item1.value}}</Option>
                </template>
              </Select>
              <Select v-model="searchDataCopy[item.key]"  slot="append" :placeholder="item.placeholder || '请选择'" style="width: 150px;text-align: left;">
                <Option
                  v-for="(item1, key) in item.options"
                  :value="item1.id"
                  :key="key"
                >{{item1.value}}</Option>
              </Select>
            </Input>
            <!-- 复选框 -->
            <CheckboxGroup
              v-if="item.type===5"
              v-model="searchDataCopy[item.key]"
              class="check-style"
            >
              <Checkbox v-for="(item1, key) in item.options" :label="item1.value" :key="key"></Checkbox>
            </CheckboxGroup>
            <!-- 多选搜索 -->
            <Select
              v-if="item.type===7"
              v-model="searchDataCopy[item.key].select"
              :width="item.width"
              :multiple="true"
            >
              <Option
                v-for="(item1, key) in item.options"
                :value="item1.id"
                :key="key"
                :style="{'padding-left':(item1.space ? item1.space : 0) * 12 + 'px'}"
              >{{item1.value}}</Option>
            </Select>
            <!-- 树形多选搜索 -->
            <tree-select
              v-if="item.type===8"
              :ref="item.key"
              :style="{width: item.width + 'px'}"
              :placeholder="item.placeholder"
              :data="item.data"
              @on-check-change="onTreeChange(item.key,item.onChange)"
            ></tree-select>
            <!-- 树形单选搜索 -->
            <single-select
              v-if="item.type===11"
              v-model="searchDataCopy[item.key]"
              :style="{width: item.width + 'px'}"
              :placeholder="item.placeholder"
              :levelList="item.options"
            ></single-select>
            <!-- 多选搜索 -->
            <Select
              v-if="item.type===6"
              v-model="searchDataCopy[item.key].select"
              class="header-select"
              style="width: 100px; height:30px;"
            >
              <Option
                v-for="(item1, key) in item.options"
                :value="item1.id"
                :key="key"
              >{{item1.value}}</Option>
            </Select>
            <span
              v-if="item.type===6"
              style="margin-left: 6px;font-weight:bold;"
              class="data-list-search-span"
            >:</span>
            <InputNumber
              v-if="item.type===6"
              :max="item.max"
              :min="item.min"
              :step="item.step"
              :precision="item.precision"
              ref="isClear"
              v-model="searchDataCopy[item.key].startStep"
              placeholder="最小值"
              style="width: 120px;"
            ></InputNumber>
            <span v-if="item.type===6" class="data-list-search-span date-line"></span>
            <InputNumber
              v-if="item.type===6"
              :max="item.max"
              :min="item.min"
              :step="item.step"
              :precision="item.precision"
              v-model="searchDataCopy[item.key].endStep"
              placeholder="最大值"
              style="width: 120px;"
            ></InputNumber>
          </div>
        </template>
      </div>
    </template>
    <div class="data-list-search-btn" :class="{'data-list-search-line': onLine}">
      <Button class="search-style" @click="onSearchClick">查询</Button>
      <slot></slot>
    </div>
  </div>
</template>
<script>
import treeSelect from "@/views/shop/components/selector/class-tree-select";
import singleSelect from "@/views/shop/components/selector/single-tree-select.vue";
export default {
  components: { treeSelect, singleSelect },
  props: {
    onLine: {
      type: Boolean,
      default: false
    },
    searchParams: {
      default() {
        return [];
      },
      type: Array
    },
    searchData: {
      default() {
        return {};
      },
      type: Object
    }
  },
  watch: {
    searchData: {
      handler(val) {
        let data = {};
        Object.keys(val).forEach(el => {
          if (val[el] && typeof val[el] === "object") {
            data[el] = JSON.parse(JSON.stringify(val[el]));
          } else {
            data[el] = val[el];
          }
        });
        this.searchDataCopy = data;
      },
      immediate: true,
      deep: true
    },
    searchDataCopy: {
      // 需要用到旧数据比较，闭包存起来
      handler: (() => {
        let old;
        return function(data) {
          // on-change放到最后，因为on-change可能重新修改searchDataCopy
          let old1 = old;
          old = JSON.parse(JSON.stringify(data));
          this.$emit("on-change", this.searchDataCopy, old1);
        };
      })(),
      immediate: true,
      deep: true
    }
  },
  computed: {
    columns() {
      let combineKey = {};
      return this.searchParams
        .map(item => {
          if (item){
            if (item.combine) {
              // 有则添加组合到之前那个，没有新建一个并返回
              if (combineKey[item.combine]) {
                combineKey[item.combine].push(item);
                return false;
              } else {
                combineKey[item.combine] = [item];
                return combineKey[item.combine];
              }
            } else {
              return [item];
            }
          }
        })
        .filter(n => n);
    }
  },
  data() {
    return {
      searchDataCopy: {},
      dataSelected: {},
      treeNames: {}
    };
  },
  methods: {
      getChangeLevel(val){
          this.$emit("getChangeLevel",val);
      },
    /**
     * 需要通过世界时的毫秒数才能与86400000区域，否则0时转成东八区会不整除
     */
    disableStartDate(date, item) {
      if (this.searchDataCopy[item.key].endTime) {
        let time = this.getFullTime(
          new Date(this.searchDataCopy[item.key].endTime)
        );
        return date && this.getFullTime(date) >= time - (time % 86400000);
      }
    },
    disableEndDate(date, item) {
      if (this.searchDataCopy[item.key].startTime) {
        let time = this.getFullTime(
          new Date(this.searchDataCopy[item.key].startTime)
        );
        return (
          date && this.getFullTime(date) < time - (time % 86400000) + 86400000
        );
      }
    },
    /**
     * 获取世界时的毫秒数
     */
    getFullTime(date) {
      let year = date.getFullYear();
      let month = date.getMonth();
      let day = date.getDate();
      let hour = date.getHours();
      let minu = date.getMinutes();
      let second = date.getSeconds();
      return Date.UTC(year, month, day, hour, minu, second);
    },
    dataCopy(val, target) {
      Object.keys(val).forEach(el => {
        if (
          val[el] &&
          typeof val[el] === "object" &&
          val[el].constructor !== Array
        ) {
          this.dataCopy(val[el], target[el]);
        } else {
          target[el] = val[el];
        }
      });
    },
    // 日期
    timeForMat(count) {
      let endTime = new Date();
      endTime.setTime(endTime.getTime());
      let Y1 = endTime.getFullYear();
      let M1 =
        endTime.getMonth() + 1 > 9
          ? endTime.getMonth() + 1
          : "0" + (endTime.getMonth() + 1);
      let D1 =
        endTime.getDate() > 9 ? endTime.getDate() : "0" + endTime.getDate();
      let endTimes = Y1 + "-" + M1 + "-" + D1 + " 00:00:00"; // 当前时间
      let startTime = new Date();
      startTime.setTime(
        startTime.getTime() - 24 * 60 * 60 * 1000 * (count - 1)
      );
      let Y2 = startTime.getFullYear();
      let M2 =
        startTime.getMonth() + 1 > 9
          ? startTime.getMonth() + 1
          : "0" + (startTime.getMonth() + 1);
      let D2 =
        startTime.getDate() > 9
          ? startTime.getDate() - 1
          : "0" + startTime.getDate();
      let startTimes = Y2 + "-" + M2 + "-" + D2 + " 00:00:00"; // 之前的7天或者30天
      return {
        endTime: endTimes,
        startTime: startTimes
      };
    },
    /**
     * 获取近几天的日期
     */
    chooseDays(val, key, objTime) {
      this.$set(this.dataSelected, key, val);
      let timer = this.timeForMat(val);
      this.$set(objTime, "startTime", timer.startTime);
      this.$set(objTime, "endTime", timer.endTime);
    },
    onSearchClick() {
      let typeSix = this.searchParams
        .filter(item => item.type === 6)
        .filter(item => {
          return !(
            this.searchDataCopy[item.key].startStep ===
              this.searchDataCopy[item.key].endStep ||
            (typeof this.searchDataCopy[item.key].startStep === "number" &&
              typeof this.searchDataCopy[item.key].endStep === "number" &&
              this.searchDataCopy[item.key].startStep <=
                this.searchDataCopy[item.key].endStep)
          );
        });
      if (typeSix.length) {
        let selectIndex = this.searchDataCopy[typeSix[0].key].select;
        let option = typeSix[0].options.find(option => {
          return option.id == selectIndex;
        });
        let showName =
          (typeSix[0].errorName && typeSix[0].errorName[selectIndex]) ||
          (option && option.value);
        this.$Message.error(`最大${showName}不能小于最小${showName}`);
        return;
      }
      this.dataCopy(this.searchDataCopy, this.searchData);
    },
    onStartDateChange(item, val) {
      if (!this.searchDataCopy[item.key]) {
        this.$set(this.searchDataCopy, item.key, {});
      }
      this.$set(this.searchDataCopy[item.key], "startTime", val);
      var dd = this.calDateDiff(val, this.searchDataCopy[item.key].endTime);
      if (dd != this.dataSelected[item.key])
        this.$set(this.dataSelected, item.key, 0);
    },
    onEndDateChange(item, val) {
      if (!this.searchDataCopy[item.key]) {
        this.searchDataCopy[item.key] = {};
      }
      this.searchDataCopy[item.key].endTime = val;
      var dd = this.calDateDiff(
        this.searchDataCopy[item.key].startTime,
        val
      );
      if (dd != this.dataSelected[item.key])
        this.$set(this.dataSelected, item.key, 0);
    },
    onTreeChange(key, callback) {
      var list = this.$refs[key][0].getCheckedNodes();
      // var ids = [];
      // list.forEach(item => {
      //   ids.push(item.data.id);
      // });
      if (callback) callback(this.searchDataCopy, list);
      //this.$set(this.searchDataCopy, key, ids);
    },
    //计算两个日期的天数差 sDate1和sDate2是2017-9-25格式
    calDateDiff(sDate1, sDate2) {
      var aDate, oDate1, oDate2, iDays;
      aDate = sDate1.split("-");
      oDate1 = new Date(aDate[1] + "-" + aDate[2] + "-" + aDate[0]); //转换为9-25-2017格式
      aDate = sDate2.split("-");
      oDate2 = new Date(aDate[1] + "-" + aDate[2] + "-" + aDate[0]);
      iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
      return iDays;
    }
  },
  created() {
    if (this.searchDataCopy.dealType || this.searchDataCopy.dealType) {
      this.searchDataCopy.dealType.startStep = null;
      this.searchDataCopy.dealType.endStep = null;
    }
  }
};
</script>
<style lang="less" scoped>
.data-list-search {
  // margin-right: -16px;
  font-size: 12px;
  margin-bottom: 4px;
  .commmon-date-style {
    cursor: pointer;
    margin-left: -10px;
    width: 65px;
    > span {
      display: inline-block;
      padding: 3px;
      border: 1px solid transparent;
      border-radius: 5px;
      color: #3f66d3;
    }
    &.date-style {
      span {
        border: 1px solid #3f66d3;
      }
    }
  }
  .date-style {
    color: #3f66d3;
  }
  .data-list-search-item {
    display: inline-block;
    margin-bottom: 16px;
    margin-right: 16px;
    .ivu-input-wrapper,
    .ivu-select {
      width: 210px;
    }
    .header-select {
      /deep/.ivu-select-selection {
        border-color: #dcdee2;
        box-shadow: none;
        overflow: hidden;
        &:hover {
          border-color: #dcdee2;
        }
      }
      /deep/.ivu-select-selected-value {
        background:#f8f8f9;
      }
    }
    /deep/.compound-selection{
      .ivu-input{
        display: none;
      }
      .ivu-input-group-append{
        height: 32px;
        background-color: #fff !important;
      }
      .ivu-input-group-prepend{
        background-color: #f5f6f7;
        border-right: 1px solid #DCDEE2;
      }
      .ivu-select-item{
        text-align: left;
      }
    }
    .check-style {
      display: inline-block;
    }
    /deep/.ivu-date-picker {
      .ivu-input-wrapper {
        width: 180px;
      }
    }
    .data-list-search-span {
      display: inline-block;
      margin-right: 5px;
      text-align: right;
      color: #464c5b;
    }
    .date-line {
      vertical-align: middle;
      width: 7px;
      height: 1px;
      margin: 0 10px;
      background-color: #9ea4b1;
    }
    /deep/.class-selector {
      position: relative;
    }
    .data-list-line-item-combine {
      & + .data-list-line-item-combine {
        margin-left: 15px;
      }
    }
  }
  .data-list-search-btn {
    display: inline-block;
    padding-bottom: 16px;
    button:first-child {
      width: 58px;
    }
    /deep/button {
      height: 32px;
      line-height: 1;
      margin-right: 12px;
    }
    .search-style {
      color: white;
      background-color: #4a6af5;
      border-color: #4a6af5;
    }
    .search-style:hover {
      color: white;
      background-color: #6e88f7;
    }
    &.data-list-search-line {
      display: inline-block;
    }
  }
  .mixInput {
    display: inline-table;
    /deep/.ivu-input-prefix{
      left: 77px;
      z-index: 2;
    }
  }
  .compound-selection{
    display: inline-block;
  }
}
</style>
