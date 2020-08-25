<template>
  <div>
    <!--
      为什么放个iframe,因为坑爹的google禁止了视频的自动播放，如果调用play()方法会出现Uncaught (in promise) DOMException的错误
      实际上google并不是禁止视频自动播放，而是要求自动播放的视频要静音，但iframe它又是允许，当页面已经有播放过声音的情况下，视频
      的自动播放就正常了，这个解决方法是查看这个页面得出 https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    -->
    <iframe v-if="module.autoplay" src="images/nosound.mp3" style="display:none" allow="autoplay"></iframe>
    <div ref="video" v-if="module.module_type == 'ModuleVideo'">
      <div class="container" :class="'scale_'+module.scale" :style="'height:' + height + 'px;'">
        <div
          v-if="!playing"
          class="cover"
          :style="'background-image:url('+(module.cover?module.cover:'images/ship.png')+');'"
        >
          <Icon type="md-arrow-dropright-circle" @click="play" />
        </div>
        <video
          v-show="playing"
          webkit-playsinline="webkit-playsinline"
          playsinline="playsinline"
          x5-video-player-type="h5-page"
          x5-video-player-fullscreen="false"
          ref="videotag"
          controls="controls"
          :src="module.url"
        ></video>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module"],
  data() {
    return {
      playing: false,
      height: 0
    };
  },
  mounted: function() {
    this.initHeight();
    if (this.module.loop) {
      this.$refs.videotag.setAttribute("loop", "true");
    }
    if (this.module.autoplay) {
      this.$refs.video.click();
      this.play();
    }
  },
  updated: function() {
    this.initHeight();
  },
  methods: {
    initHeight() {
      if (this.$refs.video) {
        var width = this.$refs.video.clientWidth;
        //显示比例 4:3
        if (this.module.scale == 1) {
          this.height = width * 0.75;
        }
        //显示比例 16:9
        if (this.module.scale == 2) {
          this.height = width * 0.5625;
        }
        //显示比例 3:2
        if (this.module.scale == 3) {
          this.height = width * 0.67;
        }
      }
    },
    play() {
      this.playing = true;
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.videotag.play();
        }, 500);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  display: block;
  position: relative;
}
.cover {
  width: 100%;
  height: 100%;
  position: absolute;
  background-size: 100% 100%;
  background-color: #eee;
}
.cover i {
  position: absolute;
  font-size: 40px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
  color: white;
}
video {
  /*object-fit: fill;*/
  width: 100%;
  height: 100%;
}
</style>
