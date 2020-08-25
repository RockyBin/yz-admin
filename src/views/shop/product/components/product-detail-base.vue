<template>
  <div class="product-detail-base">
    <Form ref="formValidateBase" :model="value" :rules="ruleValidateBase" :label-width="84">
      <alert-warning v-if="isCloudEnable">
        <p>修改商品信息（商品名称、商品规格、商品价格等），可能会影响经销商的云仓收入和云仓库存信息，以及涉及到云仓的商品的二次销售，请谨慎操作！</p>
      </alert-warning>
      <FormItem label="商品类型：" prop="productType">
        <div class="product-type">
          <div 
            :class="{'inline-box':true,'selected':value.productType=='0','disabled':$route.query.id}" 
            @click="value.productType='0'"
          >
            <div class="label">实物商品</div>
            <div class="tip">（物流发货）</div>
          </div>
          <div 
          :class="{'inline-box':true,'selected':value.productType=='1','disabled':$route.query.id}" 
          @click="value.productType='1'"
          >
            <div class="label">虚拟商品</div>
            <div class="tip">（无需物流）</div>
          </div>
          <Icon type="md-alert" size="16" color="#FF9900"></Icon>
          <span style="color:#464C5B;margin-left:10px;">商品保存后无法修改商品类型，请谨慎操作！</span>
        </div>
      </FormItem>
      <FormItem label="商品名称：" prop="productName" style="margin-top: 0 !important;">
        <div class="product-detail-item">
          <Input
            type="textarea"
            :disabled="disableChange"
            placeholder="请输入商品名称"
            v-model.trim="value.productName"
            :maxlength="50"
          />
          <span class="textarea-num">{{computedWordLength(value.productName)}}/50</span>
        </div>
      </FormItem>
      <!-- <FormItem label="商品编号：" prop="productNumber">
        <div class="product-detail-item">
          <Input
            :disabled="disableChange"
            class="common-input-text-260"
            v-model.trim="productNumber"
            placeholder="请输入编号"
          />
        </div>
      </FormItem>-->
      <FormItem
        label="商品状态："
        v-if="!(supplierInfo.verify_status === 0 && supplierInfo.id)"
      >
        <div class="product-detail-item">
          <RadioGroup v-model="value.status">
            <Radio :label="1">上架</Radio>
            <Radio :label="0">下架</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <FormItem label="商品分类：" prop="productClass">
        <div class="product-detail-item">
          <tree-select
            :data="sortedClass"
            ref="clstree"
            @on-check-change="onSelectClass"
            notFoundText="您还没有添加分类"
          ></tree-select>
          <Button
            type="primary"
            perm="product.class.view"
            style="width:58px;margin-left: 6px;vertical-align: top;"
            @click="$router.push({name: 'productClass'})"
          >新增</Button>
        </div>
      </FormItem>
      <FormItem label="商品图片：" prop="pruductImage">
        <div class="product-detail-item product-detail-item-image">
          <more-message text="推荐上传尺寸800*800以上的jpg、png图片格式，每张图片大小限制2M以内，最多能上传6张！"></more-message>
          <div class="product-detail-base-image-select">
            <image-dragable
              :disabled="disableChange"
              :class="{'has-error': imageIsError}"
              v-model="value.pruductImage"
              :pictureNumber="6"
            ></image-dragable>
            <div v-show="disableChange" class="product-detail-base-image-select-cover"></div>
          </div>
        </div>
      </FormItem>
      <FormItem label="商品视频：" prop="video" style="margin-top: 0 !important;">
        <div class="product-detail-item">
          <span class="spvideo">
            <Input
              type="textarea"
              :disabled="disableChange"
              placeholder="请输入商品视频的完整地址"
              v-model.trim="value.video"
              :maxlength="255"
              @on-blur="loadVideoSrc"
            />
            <Spin v-if="loadingVideo" fix>
              <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
              <div>系统正在帮您自动提取视频地址，大约需要10秒，请稍后...</div>
            </Spin>
          </span>
          <span class="textarea-num">仅支持.mp4(AVC(H264))格式的视频源地址</span>
        </div>
      </FormItem>
      <FormItem label="视频封面：">
        <div class="product-detail-item product-detail-item-image">
          <more-message text="建议图片比例与视频比例一致，支持jpg、png，图片大小限制2M以内"></more-message>
          <div class="product-detail-base-image-select">
            <image-dragable
              :disabled="disableChange"
              v-model="value.video_poster"
              :pictureNumber="1"
            ></image-dragable>
            <div v-show="disableChange" class="product-detail-base-image-select-cover"></div>
          </div>
        </div>
      </FormItem>
      <FormItem v-show="value.productType==0" label="物流运费：" prop="freightTemplate">
        <div class="product-detail-item">
          <RadioGroup v-model="value.productFreight">
            <Radio :disabled="disableChange" label="0">免运费</Radio>
            <br />
            <Radio :disabled="disableChange" label="1">买家承担运费</Radio>
          </RadioGroup>
          <div class="product-detail-newsline" v-show="value.productFreight === '1'">
            <Select
              :disabled="disableChange"
              v-model="value.freightTemplate"
              placeholder="选择运费模版"
              not-found-text
              :transfer="true"
              transfer-class-name="freightTemplateList"
            >
              <Option
                v-for="item in value.freightTemplateList"
                :value="item.id"
                :key="item.id"
              >{{item.template_name}}</Option>
            </Select>
            <Button
              type="primary"
              perm="logistics.view"
              style="width:58px;margin-left: 6px;"
              @click="$router.push({name: 'settingLogisticsList'})"
            >新增</Button>
          </div>
        </div>
      </FormItem>
      <FormItem label="限购数量：" prop="productAllow" v-show="false">
        <div class="product-detail-item">
          <Poptip trigger="hover" word-wrap content="最多三组规格">
            <i class="iconfont icon-ios-information-circ1"></i>
          </Poptip>
          <Input v-model="value.productAllow" />
        </div>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import imageDragable from "@/views/shop/components/image-select/image-select-dragable.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
import ClassUtil from "./class-util";
export default {
  props: {
    value: {
      required: true,
      type: Object
    },
    disableChange: {
      required: true,
      type: Boolean
    },
    supplierInfo: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      isCloudEnable: false, //是否有云仓模块
      imageIsError: false,
      loadingVideo: false,
      ruleValidateBase: {
        productName: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value.trim()) {
                return callback();
              }
              return callback(new Error("请输入商品名称"));
            }
          }
        ],
        productType: [
          {
            required: true,
          }
        ],
        productClass: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value.length) {
                return callback(new Error("请选择商品分类"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        pruductImage: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value.length) {
                this.imageIsError = false;
                return callback();
              }
              this.imageIsError = true;
              return callback(new Error("请上传商品图片"));
            }
          }
        ],
        video: [
          {
            required: false,
            validator: (rule, value, callback) => {
              let regex = new RegExp("^(http:\\/\\/|https:\\/\\/)");
              if (value.length && regex.test(value) === false) {
                return callback(new Error("请输入完整的视频地址，要以 http:// 或 https:// 开头"));
              }
              return callback();
            }
          }
        ],
        // 运费模板
        freightTemplate: [
          {
            trigger: "none",
            validator: (rule, value, callback) => {
              if (this.value.productFreight === "1" && !value) {
                return callback(new Error("请选择运费模板"));
              }
              return callback();
            }
          }
        ]
      }
    };
  },
  components: {
    imageDragable,
    moreMessage,
    treeSelect,
    alertWarning
  },
  computed: {
    sortedClass() {
      //生成树形结构
      var sortedClassList = [];
      var classUtil = ClassUtil.newIntance(this.value.productClassList);
      var clsTree = classUtil.getTreeList();

      if (clsTree.length > 0) {
        clsTree.forEach(item => {
          var titem = {
            title: item.class_name
          };
          titem.expand = !!item.expand;
          titem.children = [];
          titem.data = {
            id: item.id,
            class_name: item.class_name
          };
          if (this.value.productClass.indexOf(item.id) > -1)
            titem.checked = true;
          item.children.forEach(item1 => {
            titem.children.push({
              title: item1.class_name,
              data: {
                id: item1.id,
                class_name: item1.class_name
              },
              checked: this.value.productClass.indexOf(item1.id) > -1
            });
          });
          sortedClassList.push(titem);
        });
      }
      return sortedClassList;
    }
  },
  created() {
    this.isCloudEnable = window.hasLicensePerm('ENABLE_CLOUDSTOCK');
  },
  methods: {
    /**
     * 计算文字长度
     */
    computedWordLength(str) {
      return str.length;
      // 这一版不去处理英文的长度
      // let realLength = 0,
      //   len = str.length,
      //   charCode = -1;
      // for (let i = 0; i < len; i++) {
      //   charCode = str.charCodeAt(i);
      //   if (charCode >= 0 && charCode <= 128) realLength += 1;
      //   else realLength += 2;
      // }
      // return realLength;
    },
    /**
     * 获取选择的分类
     */
    onSelectClass() {
      var list = this.$refs["clstree"].getCheckedNodes();
      var cls = [];
      let expandObj = {};
      list.forEach(item => {
        cls.push(item.data.id);
      });
      this.sortedClass.forEach(item => {
        if (item.expand) {
          expandObj[item.data.id] = true;
        }
      });
      this.value.productClassList.forEach(item => {
        if (expandObj[item.id]) {
          item.expand = true;
        } else {
          delete item.expand;
        }
      });
      this.value.productClass = cls;
    },
    loadVideoSrc(){
      this.getVideoSrc(this.value.video, (res) => {
        this.value.video = res;
        this.loadingVideo = false;
      }, () => {
        this.loadingVideo = true;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.product-detail-base {
  .ivu-alert {
    margin-bottom: 20px;
  }
  .product-detail-base-image-select {
    position: relative;
    // margin-top: 20px;

    .product-detail-base-image-select-cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  // /deep/.ivu-form-item {
  //   .product-detail-item-image {
  //     + div.ivu-form-item-error-tip {
  //       left: 34px;
  //       top: 148px;
  //     }
  //   }
  // }

  /deep/.class-selector {
    width: 260px;
    position: relative;
  }
  /deep/.ivu-select-dropdown-list {
    overflow-x: hidden;
  }
  .product-detail-item {
    /deep/.ivu-input-wrapper,
    /deep/.ivu-select {
      width: 320px !important;
    }
  }
  .product-type {
    line-height: normal;
    .inline-box {
      display: inline-block;
      width: 130px;
      height: 56px;
      border: 1px solid #DCDEE2;
      border-radius: 3px;
      background: #F5F6F7;
      margin-right: 12px;
      padding-top: 10px;
      text-align: center;
      cursor: pointer;
      .label {
        color: #464C5B;
        font-size: 14px;
        font-weight: bold;
      }
      .tip {
        color: #9EA4B1;
        font-size: 12px;
      }
      &.disabled {
        pointer-events: none;
      }
      &.selected {
        position: relative;
        background: #F8F9FD;
        border: 1px solid #4A6AF5;
        .label,.tip {
          color: #4A6AF5;
        }
        &:before {
          position: absolute;
          content: "";
          right: 0;
          bottom: 0;
          border-top: 20px solid transparent;
          border-right: 20px solid #4A6AF5;
        }
        &:after {
          position: absolute;
          content: "";
          right: 1px;
          bottom: 4px;
          width: 10px;
          height: 6px;
          border-width: 1px;
          border-style: solid;
          border-color: transparent transparent white white;
          transform: rotate(-45deg);
        }
      }
    }
  }
}
.freightTemplateList {
  .ivu-select-item {
    width: 260px;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
}
.spvideo {
  position: relative;
  /deep/.ivu-spin {
    width: 100%;
    height: 100%;
    /deep/.ivu-spin-main {
      width: 100%;
      background: white;
    }
  }
}
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from { transform: rotate(0deg);}
  50%  { transform: rotate(180deg);}
  to   { transform: rotate(360deg);}
}
.demo-spin-col {
  height: 100px;
  position: relative;
  border: 1px solid #eee;
}
</style>