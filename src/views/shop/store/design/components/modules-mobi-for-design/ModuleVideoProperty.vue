<template>
  <div class="property-container" v-if="module.module_type == 'ModuleVideo'">
    <h3>
      <span>视频设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <!--http://www.w3school.com.cn/i/movie.mp4-->
      <FormItem label="视频地址" prop="url" class="form-video-url">
        <Input v-model="module.url" placeholder="http://"/>
        <span style="color:#9ea4b1;font-size:12px;">仅支持.mp4(AVC(H264))格式的视频源地址</span>
      </FormItem>
      <FormItem label="播放比例" class="form-radio">
        <RadioGroup v-model="module.scale">
          <Radio :label="1">4:3</Radio>
          <Radio :label="2">16:9</Radio>
          <Radio :label="3">3:2</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem v-show="false" label="自动播放">
        <i-switch
          v-model="module.autoplay"
          :true-value="1"
          :false-value="0"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <span v-if="module.autoplay" class="tip-text">开启自动播放</span>
        <span v-else class="tip-text">关闭自动播放</span>
      </FormItem>
      <FormItem label="循环播放">
        <i-switch
          v-model="module.loop"
          :true-value="1"
          :false-value="0"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <span v-if="module.loop" class="tip-text">开启循环播放</span>
        <span v-else class="tip-text">关闭循环播放</span>
      </FormItem>
      <FormItem label="视频封面" class="form-pic-select">
        <Button type="dashed" :class="{'img-exist': module.cover}" class="icon-btn" @click="onShowFilesSelector">
          <Icon
            v-if="module.cover"
            type="md-close-circle"
            size="16"
            @click.stop="deleteCover"
          />
          <img class="icon-img" v-if="module.cover" :src="module.cover">
          <Icon v-else type="md-add" size="20"/>
        </Button>
        <div class="tips">建议图片宽高为{{scaleText}}，图片支持jpg, png, gif</div>
      </FormItem>
      <FormItem label="上下边距">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面边距">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
    </Form>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script type="text/ecmascript-6">
import BaseModuleProperty from "./BaseModuleProperty";
import FilesSelector from "@/components/files/files";
export default {
  extends: BaseModuleProperty,
  components: { FilesSelector },
  props: ["module"],
  data() {
    return {
      showFilesSelector: false
    };
  },
  computed: {
    scaleText() {
      if (this.module.scale == 1) return "4:3";
      if (this.module.scale == 2) return "16:9";
      if (this.module.scale == 3) return "3:2";
      return "";
    }
  },
  methods: {
    onShowFilesSelector() {
      this.showFilesSelector = true;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.module.cover = files[0];
      }
    },
    deleteCover(){
      this.module.cover="";
    }
  }
};
</script>
<style lang="less" scoped>
.icon-btn {
  width: 44px;
  height: 44px;
  vertical-align: top;
  text-align: center;
  padding: 0;
  position: relative;
  vertical-align: text-bottom;
  &.img-exist {
    border-style: solid;
  }
  /deep/.ivu-icon-md-close-circle {
    display:none;
    position: absolute;
    top: -8px;
    right: -8px;
    color: rgb(100, 100, 100) !important;
  }
  .icon-img {
    width: 100%;
    height:100%;
    object-fit: contain;
    vertical-align: middle;
  }
  &:hover {
    /deep/.ivu-icon-md-close-circle{
      display:block;
    }
  }
}
.form-video-url{
  /deep/.ivu-form-item-content{
    line-height:normal;
    .ivu-input-wrapper{
      margin-bottom:5px;
    }
  }
}
.form-pic-select{
  /deep/.ivu-form-item-content{
    line-height:normal;
  }
}
.tips {
  padding-left: 12px;
  display: inline-block;
  vertical-align:text-bottom;
  font-size: 12px;
  color: #9ea4b1;
  line-height: 1;
}
.property-container .tip-text {
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle;
}
</style>
