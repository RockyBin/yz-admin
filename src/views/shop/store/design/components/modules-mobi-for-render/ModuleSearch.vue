<template>
  <div
    :id="'module'+module.id"
    v-if="module.module_type == 'ModuleSearch'"
    :class="['container',module.is_top ? 'fixtop':'']"
    :style="{'background':module.background}"
  >
    <div v-html="styleText"></div>
    <form method="get" @submit="submit">
      <Icon
        class="search"
        type="ios-search"
        size="20"
        v-if="module.keyword_align=='center'"
        :color="module.icon_color ? module.icon_color : module.font_color"
        :style="{left:`calc(50% - ${textWidth/2+10}px)`}"
      />
      <span :id="'sample'+module.id">{{module.keyword||placeholder}}</span>
      <i-input
        v-model="module.keyword"
        class="input"
        :class="['style_' + module.style,'align_' + module.keyword_align]"
        :placeholder="placeholder"
        name="val"
        @on-focus="onInput"
      >
        <div slot="prefix">
          <Icon
            v-if="module.keyword_align=='left'"
            type="ios-search"
            size="20"
            :color="module.icon_color ? module.icon_color : module.font_color"
          />
        </div>
      </i-input>
    </form>
  </div>
</template>
<script type="text/ecmascript-6">
import jQuery from "jquery";
export default {
  components: {},
  props: ["module", "editMode"],
  data() {
    return {
      textWidth: 0,
      placeholder: "搜索商品"
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.fixTop();
    })
    // this.setPlaceholderColor();
    // document.querySelector(
    //   `#module${this.module.id} input`
    // ).style.color = this.module.font_color;
    // document.querySelector(
    //   `#module${this.module.id} input`
    // ).style.backgroundColor = this.module.input_background;
    window.addEventListener("resize", () => {
      this.fixTop();
    });
  },
  updated() {
    this.fixTop();
  },
  computed: {
    styleText() {
      return `<style>#module${this.module.id} input {
        color:${this.module.font_color || this.module.icon_color};
        background: ${this.module.input_background};
      }
      #module${this.module.id} input::-webkit-input-placeholder {
        color:${this.module.font_color?this.module.font_color:this.module.icon_color?this.module.icon_color:"#808695"};
      }</style>`
    }
  },
  watch: {
    module: {
      handler() {
        this.fixTop();
      },
      deep: true
    },
    
    // "module.font_color": {
    //   handler(newColor) {
    //     document.querySelector(
    //       `#module${this.module.id} input`
    //     ).style.color = newColor||this.module.icon_color;
    //     this.setPlaceholderColor();
    //   }
    // },
    // "module.input_background": {
    //   handler(newColor) {
    //     document.querySelector(
    //       `#module${this.module.id} input`
    //     ).style.backgroundColor = newColor;
    //   }
    // },
    "module.keyword": {
      handler() {
        this.$nextTick(() => {
          this.textWidth = this.getTextWidth();
        });
      },
      immediate: true
    }
  },
  methods: {
    fixTop() {
      //修正固顶显示时的占位高度
      var hasFixTop =
        jQuery.find(".module-item.fixed-top-edit,.module-item.fixed-top")
          .length > 0;
      if (hasFixTop) {
        var height = jQuery(
          ".module-item.fixed-top-edit,.module-item.fixed-top"
        ).outerHeight();
        jQuery("#module-list").css("padding-top", height + "px");
      } else {
        jQuery("#module-list").css("padding-top", "0");
      }
      var offset = jQuery("#module-list").offset();
      if (this.$el && this.editMode) {
        if (this.module.fix_top) {
          jQuery(this.$el.parentNode).offset({
            top: offset.top,
            left: offset.left
          });
        } else {
          this.$el.parentNode.style.left = 0;
          this.$el.parentNode.style.top = 0;
        }
      }
    },
    // setPlaceholderColor() {
    //   var style = document.createElement("style");
    //   style.innerHTML = `#module${
    //     this.module.id
    //   } input::-webkit-input-placeholder {color:${
    //     this.module.font_color?this.module.font_color:this.module.icon_color?this.module.icon_color:"#808695"
    //   };}`;
    //   style.setAttribute("type", "text/css");
    //   document.head.appendChild(style);
    // },
    getTextWidth() {
      var span = document.getElementById('sample'+this.module.id);
      span.style.display = "inline-block";
      var textWidth = span.offsetWidth;
      span.style.display = "none";
      return textWidth;
    },
    submit(e) {
      e.preventDefault();
      if (!this.editMode) {
        this.$router.push({
          path: "/product/product-list",
          query: { val: this.module.keyword }
        });
      }
      return false;
    },
    onInput() {
      if (!this.editMode) {
        this.$router.push({
          path: "/product/product-search",
          query: { keyword: this.module.keyword }
        });
      }
      return false;
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  padding: 6px;
  position: relative;
}
.search {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}
/deep/.input {
  line-height: 32px;
  height: 32px;
  .ivu-input {
    border-width: 0;
  }
}
#sample {
  display: none;
  visibility: hidden;
}
.fixtop {
  position: absolute;
  top: 0;
  margin-bottom: 32px;
}
.style_3 /deep/ input {
  border-radius: 6px;
}
.style_2 /deep/ input {
  border-radius: 0;
}
.style_1 /deep/ input {
  border-radius: 32px;
}
.align_center /deep/ input {
  text-align: center;
}
</style>
