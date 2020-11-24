<template>
  <div class="replay-page">
    <!-- 回放界面 -->
    <div class="replay-box">
      <!-- 跳过无用户操作 -->
      <div class="operation flex flex-vc" :class="{ pause: !isPlaying }">
        <div class="skip-switch flex flex-vc flex-he">
          <span class="operation-text">跳过无用户操作</span>
          <van-switch
            v-model="skipInactive"
            size="18px"
            active-color="#6EC679"
          />
        </div>
        <i v-if="!isPlaying" class="iconfont icon-play" @click="start"></i>
      </div>
      <div id="player" @click="stop"></div>
      <!-- 进度条、倍速 -->
      <div class="operation-bottom flex flex-vc flex-hj">
        <!-- 进度条 -->
        <div class="flex flex-vc flex1 progress-time">
          <div class="current-time">{{ currentTimeFormat }}</div>
          <van-slider
            v-model="progressValue"
            bar-height="2px"
            step="0.1"
            active-color="#6EC679"
            inactive-color="#eeeeee"
            :max="progressMax"
            @change="progressChange"
          >
            <template v-slot:button>
              <div class="progress-button"></div>
            </template>
          </van-slider>
          <div class="total-time">{{ totalTime }}</div>
        </div>
        <!-- 倍速 -->
        <div class="speed-box">
          <div class="speed-select" @click="showSpeedDropDown">{{speed}}倍速</div>
          <div v-show="dropDownVisible" class="drop-down">
            <div v-for="i in speedList" class="drop-down-item" :key="i" :data-sp="i" @click="changeSpeed" :class="{'active': speed == i}">{{i}}倍速</div>
          </div>
        </div>
      </div>
    </div>
    <div class="big-btn" @click="goBack">重新拼图</div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import rrwebPlayer from "rrweb-player";
import { Switch, Slider } from "vant";
import { timeFormat, throttle } from "../assets/js/utils";
import { useRouter } from "vue-router";

export default {
  components: {
    "van-switch": Switch,
    "van-slider": Slider,
  },
  setup() {
    const router = useRouter();
    let skipInactive = ref(false);
    let speed = ref(1);
    let dropDownVisible = ref(false);
    let progressValue = ref(0);
    let progressMax = ref(100);
    let currentTimeFormat = ref("00:00");
    let currentTime = ref(0);
    let totalTime = ref("");

    let events = getEvents();
    let replayer = null;
    let speedList = [1, 2, 4, 8];
    let isPlaying = ref(false);

    // 获取事件
    function getEvents() {
      return localStorage.getItem("events") || [];
    }

    // 获取播放容器宽高
    function getSize() {
      let w = 375,
        h = 667;
      events.some((event) => {
        const { width, height } = event.data;
        if (width && height) {
          w = width;
          h = height;
        }
      });
      return {
        width: w,
        height: h,
      };
    }

    // 获取播放时长(s)
    function getReplayTime() {
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];
      const time = lastEvent.timestamp - firstEvent.timestamp;
      return Math.ceil(time / 1000);
    }
    
    function changeProgressValue(now) {
       progressValue.value = now;
    }
  
    onMounted(() => {
      events = JSON.parse(events) || [];
      const target = document.getElementById("player");
      const { width, height } = getSize();
      const time = getReplayTime();
      totalTime.value = timeFormat(time);
      progressMax.value = time;

      replayer = new rrwebPlayer({
        target: target,
        props: {
          events,
          width: width,
          height: height,
          autoPlay: false,
          speedOption: speedList,
          showController: false,
          mouseTail: false,
          skipInactive: skipInactive.value,
          speed: speed.value
        },
      });
      // console.log(replayer);
      let throttleProgress = throttle(changeProgressValue, 100)
      // 当前回放时间点
      replayer.addEventListener("ui-update-current-time", ({ payload }) => {
        const now = Math.round(payload / 100) / 10;
        throttleProgress(now)
        currentTime.value = now;
        // console.log('当前回放时间==>',now)
        currentTimeFormat.value = timeFormat(Math.ceil(payload / 1000));
      }); 
      replayer.getReplayer().on('finish',() => {
        isPlaying.value = false
      })
    });
    watch(skipInactive, (val) => {
      if (isPlaying.value) {
        replayer.pause();
        replayer.toggleSkipInactive(val)
        replayer.play();
      }else{
        replayer.toggleSkipInactive(val)
      }
    });
    
    // 开始
    function start() {
      isPlaying.value = true;
      const aimTime = currentTime.value * 1000;
      replayer.goto(aimTime);
      replayer.play();
    }
    // 暂停
    function stop() {
      isPlaying.value = false;
      replayer.pause();
    }
    // 切换播放速度
    function changeSpeed(e) {
      const { sp } = e.target.dataset;
      speed.value = sp;
      dropDownVisible.value = false;
      if(isPlaying.value){
        replayer.pause();
        replayer.setSpeed(sp)
        replayer.play();
      }else{
        replayer.setSpeed(sp)
      }
    }
    // 手动修改进度
    function progressChange(val) {
      if (isPlaying.value) {
        replayer.pause();
        replayer.goto(val * 1000);
        replayer.play();
      }
      // console.log(val)
      currentTime.value = val;
      currentTimeFormat.value = timeFormat(val);
    }
    // 打开关闭倍速选择
    function showSpeedDropDown() {
      dropDownVisible.value = !dropDownVisible.value
    }
    function goBack() {
      router.back()
    }

    return {
      skipInactive,
      speedList,
      speed,
      start,
      stop,
      changeSpeed,
      isPlaying,
      progressValue,
      progressChange,
      currentTimeFormat,
      totalTime,
      progressMax,
      showSpeedDropDown,
      dropDownVisible,
      goBack
    };
  },
};
</script>

<style scoped>
.flex {
  display: flex;
}
.flex-hj {
  justify-content: space-between;
}
.flex1 {
  flex: 1;
}
.flex-vc {
  align-items: center;
}
.flex-he {
  justify-content: flex-end;
}
.replay-page {
  position: relative;
  background: rgba(0, 0, 0, 0.8);
}
.replay-box {
  position: relative;
  transform: scale(0.9);
  border-radius: 8px;
  overflow: hidden;
  top: -15px;
}
.skip-switch {
  position: absolute;
  right: 10px;
  top: 10px;
}
.operation {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  font-size: 12px;
  color: #fff;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  text-align: right;
  z-index: 3;
  transition: all ease 0.3s;
}
.operation.pause {
  height: 100%;
}
.operation-text {
  line-height: 20px;
  margin-right: 10px;
}
.operation-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9;
}
.icon-play {
  margin: auto;
  font-size: 32px;
}
.big-btn {
  position: relative;
  padding: 14px;
  color: #fff;
  letter-spacing: 5px;
  top: -30px;
  font-size: 0.2rem;
  font-weight: bold;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("../assets/image/puzzle/btn-large-bg.png");
  background-position: center;
}
.current-time {
  margin-right: 10px;
}
.total-time {
  margin-left: 10px;
}
.speed-select {
  padding: 1px 6px;
  border: 1px solid #fff;
  border-radius: 4px;
  color: #fff;
  margin-left: 10px;
}
.speed-select:active {
  opacity: .7;
  user-select: none;
}
.drop-down {
  position: absolute;
    bottom: 30px;
    right: 0px;
    width: 71px;
    z-index: 9;
  border: 1px solid #fff;
  border-radius: 4px;
}
.drop-down-item {
  color: #fff;
  padding: 5px 10px;
}
.drop-down-item.active {
  color: #6EC679
}
.speed-box {
  position: relative;
}
.progress-time {
  color: #fff;
}
.progress-button {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #ffa024;
  border: 1px solid #ffffff;
}
</style>
<style>
body {
  background-color: #2c3e50;
}
#app {
  background: linear-gradient(180deg, #fd762b 0%, #ff9433 18%, #ff9433 100%);
}
.rr-player {
  background: transparent;
  box-shadow: none;
}
.replayer-wrapper {
  position: relative;
}
iframe {
  border: none !important;
}
</style>