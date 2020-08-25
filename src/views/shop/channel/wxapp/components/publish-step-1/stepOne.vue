<template>
  <div class="tbForm">
    <Form :model="info" ref="form" :label-width="120" :rules="ruleInline">
      <div class="framecontainer">
        <div>
          <div style="height:30px;width:100%;text-align:center;padding: 2px;" :style="{backgroundColor:info.head_bgcolor}">
            <!--<img style="width: 100%;" src="./image/titletop.png" />-->
            <i style="position:absolute;left:2px;top: -1px;" :style="{color:info.head_fontcolor}" class="iconfont icon-weibiaoti-"></i>
            <i style="position:absolute;left:30px;top: -1px;" :style="{color:info.head_fontcolor}" class="iconfont icon-xinhao"></i>
            <div style="position:absolute;left:129px;font-size: 10px;-webkit-transform-origin-x: 0;-webkit-transform: scale(0.9);" :style="{color:info.head_fontcolor}">
              9:41 AM
            </div>
            <div style="position:absolute;right:2px;top: -1px;">
              <span style="display:inline-block;-webkit-transform-origin-x: 0;-webkit-transform: scale(0.9);font-size: 9px;vertical-align: text-bottom;" :style="{color:info.head_fontcolor}">100%</span><i :style="{color:info.head_fontcolor}" class="iconfont icon-dianchi"></i>
            </div>
          </div>
          <div :style="{backgroundColor:info.head_bgcolor}" class="titleNameDiv">
            <span :style="{color: info.head_fontcolor}" class="titleName">{{info.name}}</span>
            <i style="position:absolute;right:2px;font-size: 24px;" :style="{color:info.head_fontcolor}" class="iconfont icon-xiaochengxu1"></i>
          </div>
        </div>
        <iframe class="webframe" scrolling="no" src="/shop/front/"></iframe>
        <div class="mask"></div>
      </div>
      <div class="domain-name" style="border:1px solid #dddee1;float:left">
        <div class="bigtitle">
          小程序样式设置
        </div>
        <div class="tip-step">
          <div class="title-left">
            <FormItem prop="name" label="小程序标题：">
              <Input
                  v-model.trim="info.name"
                  style="width: 250px;"
                  placeholder="请输入小程序标题"
                  :maxlength="20"
              >
                <span slot="suffix"
                >{{ info.name ? info.name.length : 0 }}/20</span
                >
              </Input>
            </FormItem>
          </div>
        </div>
        <div class="tip-step">
          <div class="title-left">
            <FormItem prop="head_fontcolor" label="字体颜色：">
              <RadioGroup v-model="info.head_fontcolor" style="display:inline-block !important">
                <Radio label="black">
                  <span>黑色</span>
                </Radio>
                <Radio label="white">
                  <span>白色</span>
                </Radio>
              </RadioGroup>
            </FormItem>
          </div>
        </div>
        <div class="tip-step">
          <div class="title-left">
            <FormItem label="顶部颜色：">
              <ColorPicker v-model="info.head_bgcolor" recommend editable />
            </FormItem>
          </div>
        </div>
      </div>
      <div class="foot-button">
        <Button type="primary" @click="submit" perm="wxapp.config.operate">下一步</Button>
      </div>
    </Form>
  </div>
</template>
<script>
export default {
  props: {
    info: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      ruleInline: {
        name: [
          { required: true, message: "请填写小程序标题", trigger: "blur" }
        ],
        head_bgcolor: [
          { required: true, message: "请头部背景颜色", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    // 下一步
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit("onsubmit");
        } else {
          this.$Message.error("有未填写的表单字段！");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import url("stepOne.less");
</style>
