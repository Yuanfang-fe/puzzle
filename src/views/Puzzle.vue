<template>
  <div class="page-puzzle bg">
    <div class="title"></div>
    <div class="game-name"></div>
    <div class="puzzle-bg">
      <!-- 倒计时和步数 -->
      <div class="flex flex-hj flex-vc header">
        <div class="flex flex-vc">
          <i class="iconfont icon-star"></i>
          <i class="iconfont icon-clock"></i>
          {{ timeFormat }}
        </div>
        <div class="flex flex-vc">
          <i class="iconfont icon-star"></i>步数：{{ stepNum }}
        </div>
      </div>
      <!-- 拼图 -->
      <div class="puzzle-content">
        <div ref="blocks" class="puzzle-blocks">
          <div
            v-for="(i, index) in imgLength"
            class="block"
            :key="i"
            :data-index="i"
            @click="imgBlockClick(index, $event)"
          ></div>
        </div>
        <transition name="fade">
          <div
            v-show="showTip"
            class="tipImg"
            :style="{ backgroundImage: `url('${bgimg[randomIndex]}')` }"
          ></div>
        </transition>
        <div v-if="!eventId" class="pause flex flex-vc flex-hc">
          <div class="icon-warpper flex flex-vc animate__animated " :class="{'animate__fadeIn': !visible}">
            <i class="iconfont icon-play" @click="timeCountDown"></i>
          </div>
        </div>
      </div>
      <!-- 操作提示文案 -->
      <p class="tip">（点击拼图置换位置）</p>
    </div>
    <!-- 操作按钮 -->
    <div v-if="!eventId" class="big-btn btn-start" @click="timeCountDown">
      开始
    </div>
    <div v-else class="flex flex-hj">
      <div class="btn btn-tip" @click="openTip">{{ tipBtnText }}</div>
      <div class="btn btn-restart" @click="reStart">重新开始</div>
    </div>
  </div>
  <!-- 成功、失败拼成 -->
  <div
    class="dialog-bg animate__animated"
    :class="{'animate__fadeIn': visible}"
    v-show="visible"
    key="dialogBg"
  ></div>
  <div
    class="dialog animate__animated"
    :class="{'animate__bounceIn': visible}"
    v-show="visible"
  >
    <div class="dialog-content">
      <p class="header dialog-header">{{ resultText }}</p>
      <div class="dialog-img" id="resultImg" v-html="resultImg"></div>
      <div class="pingjia">评价</div>
      <!-- rate -->
      <van-rate
        class="rate"
        v-model="rateValue"
        :size="28"
        color="#ffd21e"
        allow-half
        void-icon="star"
        void-color="#D5D5D3"
      ></van-rate>
      <van-field
        class="input-field"
        v-model="suggest"
        name=""
        label=""
        placeholder="你有什么建议吗？（非必填）"
      />
    </div>
    <!-- 按钮 -->
    <div class="big-btn submit-btn" @click="submit">提交并回溯我的操作</div>
    <!-- 取消 -->
    <div class="cancel" @click="cancel">取消</div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Toast, Rate, Field } from "vant";
import * as rrweb from 'rrweb'

export default {
  components: {
    "van-rate": Rate,
    "van-field": Field,
  },
  setup() {
    const router = useRouter();
    // 剩余时间
    let time = ref(60);
    // 显示的剩余时间
    let timeFormat = ref("01:00");
    let eventId = ref(null);
    // 提示图片
    let showTip = ref(false);
    // 按钮提示语
    let tipBtnText = ref("提示");
    // 步数
    let stepNum = ref(0);
    // 弹框提示语
    let visible = ref(false);
    let resultText = ref("");
    let resultImg = ref(null);
    // 评价
    let rateValue = ref(0);
    let suggest = ref("");
    //坐标位置
    let place = [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ];
    //全部图片路径
    let bgimg = [
      "https://static.wxb.com.cn/frontEnd/images/common/lx-pt-300x300.png",
      "https://static.wxb.com.cn/frontEnd/images/common/lx-activity-puzzle-300*300.png",
    ];

    let randomIndex = ref(0);
    //当前块排序
    let nowOrder = roa([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    // let latestOrder = nowOrder;                            //最新排序
    // let purposeOder = [0, 1, 2, 3, 4, 5, 6, 7, 8];         //目标排序
    let oldIndex = null;
    let imgLength = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let blocks = ref(null);
    // 事件数组
    let events = [];
    // 停止录制函数
    let stopReordFn = null;

    // 倒计时
    function timeCountDown() {
      if (eventId.value) return;
      eventId.value = setInterval(() => {
        if (time.value === 0) {
          // 游戏倒计时结束
          clearInterval(eventId.value);

          //判断是否完成
          if (totalDis(nowOrder) == 0) {
            resultText.value = "恭喜你！成功拼成！";
          } else {
            resultText.value = "很遗憾！没有拼对！";
          }
          resultImg.value = blocks.value.innerHTML;
          // 打开弹框
          visible.value = true;
        } else {
          time.value += -1;
          let val = time.value;
          if (time.value < 10) {
            val = `0${time.value}`;
          }
          timeFormat.value = `00:${val}`;
        }
      }, 1000);
    }

    onMounted(() => {
      blockInit();
      changeImg();
      startRecord();
    });

    // 开始录制
    function startRecord() {
      stopReordFn = rrweb.record({
        emit(event) {
          console.log(event);
          events.push(event);
        },
      });
    }

    function blockInit() {
      blocks.value.children.forEach((ele, i) => {
        let temp = getCoordinate(nowOrder[i]);
        ele.style.left = temp.x * 100 + "px";
        ele.style.top = temp.y * 100 + "px";
      });
    }

    function getCoordinate(index) {
      return {
        x: place[index][0],
        y: place[index][1],
      };
    }

    //数组随机排序
    function roa(ar) {
      var arr = ar;
      var temp = new Array();
      var count = arr.length;
      for (let i = 0; i < count; i++) {
        var num = Math.floor(Math.random() * arr.length);
        temp.push(arr[num]);
        arr.splice(num, 1);
      }
      return temp;
    }

    function changeImg() {
      randomIndex.value = Math.round(Math.random() * (bgimg.length - 1));
      blocks.value.children.forEach((ele) => {
        ele.style.backgroundImage = "url(" + bgimg[randomIndex.value] + ")";
      });
    }

    function imgBlockClick(i, event) {
      if (time.value <= 0) {
        Toast.fail("倒计时已结束，请重新开始");
        return;
      }
      const ele = event.target;
      if (typeof oldIndex === "number") {
        let temp = nowOrder[oldIndex];
        nowOrder[oldIndex] = nowOrder[i];
        nowOrder[i] = temp;

        //统计步数
        stepNum.value += 1;
        blockInit();

        //判断是否完成
        if (totalDis(nowOrder) == 0) {
          Toast("已完成");
          clearInterval(eventId.value);
          resultText.value = "恭喜你！成功拼成！";

          resultImg.value = `<img src="${bgimg[randomIndex.value]}">`;

          // 打开弹框
          visible.value = true;
        }
        blocks.value.children[oldIndex].classList.remove("active");
        oldIndex = null;
      } else {
        ele.classList.add("active");
        oldIndex = i;
      }
    }
    // 当前状态总距离
    function totalDis(arr) {
      var temp = 0;
      arr.forEach(function (ele, index) {
        temp += distance(ele, index);
      });
      return temp;
    }
    // 距离判断(@位置序号->距离)
    function distance(a, b) {
      let aa = getCoordinate(a);
      let bb = getCoordinate(b);
      return Math.abs(aa.x - bb.x) + Math.abs(aa.y - bb.y);
    }

    // 重新开始
    function reStart() {
      clearInterval(eventId.value);
      stepNum.value = 0;
      time.value = 60;
      nowOrder = roa([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      blockInit();
      timeFormat.value = `01:00`;
      eventId.value = null;
      timeCountDown();
      changeImg();
    }

    // 提示
    function openTip() {
      showTip.value = !showTip.value;
      tipBtnText.value = !showTip.value ? "提示" : "关闭提示";

      // if(showTip.value){
      //   nowOrder = purposeOder
      //   blockInit()
      // }else{

      // }
    }

    function submit() {
      visible.value = false;
      saveToLocalStorage();
      router.push({
        path: "/puzzle-replay",
      });
      stopReordFn();
    }

    function cancel() {
      console.log("cancel");
      visible.value = false;
      reStart()
      // saveToLocalStorage();
      // router.push({
      //   path: "/puzzle-replay",
      // });
      // stopReordFn();
    }

    function saveToLocalStorage() {
      localStorage.setItem("events", JSON.stringify(events));
    }

    onUnmounted(()=>{
      stopReordFn();
    })

    return {
      imgLength,
      eventId,
      time,
      timeFormat,
      stepNum,
      timeCountDown,
      blocks,
      changeImg,
      imgBlockClick,
      reStart,
      openTip,
      showTip,
      tipBtnText,
      bgimg,
      randomIndex,
      resultText,
      rateValue,
      visible,
      suggest,
      resultImg,
      submit,
      cancel,
    };
  },
};
</script>

<style scoped>
.page-puzzle {
  position: relative;
}
.bg {
  background-image: url("../assets/image/puzzle/body-bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  overflow: auto;
  width: 100%;
  min-height: 100vh;
}
.title {
  position: relative;
  top: 0.34rem;
  background-image: url("../assets/image/puzzle/title.png");
  width: 100%;
  height: 1rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.game-name {
  position: relative;
  top: 0.24rem;
  background-image: url("../assets/image/puzzle/game-name.png");
  width: 100%;
  height: 0.4rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 3;
}
.puzzle-bg {
  position: relative;
  top: 0.05rem;
  background-image: url("../assets/image/puzzle/dialog-bg.png");
  width: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.header {
  position: relative;
  width: 78%;
  margin: 0 auto;
  font-size: 0.2rem;
  font-weight: bold;
  color: #ff6110;
  height: 0.6rem;
  line-height: 0.6rem;
}
.dialog-header {
  text-align: center;
}
.flex {
  display: flex;
}
.flex-hj {
  justify-content: space-between;
}
.flex-vc {
  align-items: center;
}
.tip {
  color: #ecab56;
  font-size: 0.14rem;
  text-align: center;
  padding-bottom: 0.14rem;
}
.tipImg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.btn,
.big-btn {
  font-size: 0.2rem;
  font-weight: bold;
}
.btn-tip,
.btn-restart {
  margin-top: 12px;
  width: 50%;
  padding: 14px 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.btn-tip {
  background-image: url("../assets/image/puzzle/btn-bg.png");
  color: #ff8845;
  user-select: none;
}
.btn-restart {
  background-image: url("../assets/image/puzzle/btn-bg-confirm.png");
  color: #fff;
}
.big-btn {
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("../assets/image/puzzle/btn-large-bg.png");
  background-position: center;
}
.btn-start {
  color: #fff;
  padding: 14px 0;
  margin-top: 25px;
  font-size: 20px;
  letter-spacing: 0.05rem;
}
.btn:active,
.btn-start:active {
  opacity: 0.75;
}
.puzzle-content {
  width: 300px;
  height: 300px;
  position: relative;
  margin: 0.2rem auto 0;
}
.puzzle-blocks {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.icon-star {
  margin-right: 5px;
  font-size: 0.1rem;
}
.icon-clock {
  margin-right: 5px;
  font-size: 0.2rem;
}
.pause {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
}
.icon-warpper {
  position: relative;
  height: 60px;
  width: 60px;
  text-align: center;
  background: linear-gradient(180deg, #fd762b 0%, #ff9433 100%);
  border-radius: 50%;
  margin: auto;
}
.icon-play {
  position: relative;
  width: 26px;
  font-size: 24px;
  color: #fff;
  margin: auto;
  margin: auto;
  padding-left: 5px;
}

.dialog-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9;
}
.dialog {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  z-index: 10;
}
.dialog .header {
  background: #ffe9ca;
  width: 100%;
}
.pingjia {
  position: relative;
  margin: 16px 16px 8px;
  font-size: 16px;
  font-weight: bold;
  color: #ecab56;
}
.pingjia::before {
  content: "";
  position: absolute;
  left: 5%;
  top: 11px;
  width: 110px;
  height: 1px;
  background-color: #ecab56;
}
.pingjia::after {
  content: "";
  position: absolute;
  right: 5%;
  top: 11px;
  width: 110px;
  height: 1px;
  background-color: #ecab56;
}
.rate {
  margin-bottom: 10px;
}
.dialog-content {
  position: relative;
  top: 5%;
  width: 90%;
  margin: auto;
  /* background-image: url('../assets/image/puzzle/dialog-bg.png'); */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: top center;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffeded 0%, #ffefd8 100%);
  padding-bottom: 15px;
}

.dialog-img {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0.2rem auto 0;
}
.input-field {
  width: 90%;
  margin: auto;
  border-radius: 8px;
  border: 1px solid #f5c892;
}

.submit-btn {
  position: relative;
  top: 5%;
  margin-top: 10px;
  z-index: 2;
  color: #fff;
  padding: 14px;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("../assets/image/puzzle/btn-large-bg.png");
  background-position: center;
}
.cancel {
  position: relative;
  top: 5%;
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
  font-weight: bold;
  color: #ffffff;
}
.dialog .block,
.puzzle-content .block {
  width: 100px;
  height: 100px;
  position: absolute;
  left: 100px;
  top: 100px;
  right: 0xp;
  line-height: 20px;
  text-align: left;
  font-size: 1.5em;
  background-image: url("https://static.wxb.com.cn/frontEnd/images/common/lx-activity-puzzle-300*300.png");
  background-repeat: no-repeat;
  cursor: pointer;
  transition: all 0.3s ease;
}
.puzzle-content .block.active {
  box-shadow: 0px 0px 6px 6px rgba(255, 210, 0, 0.5);
  z-index: 2;
}
.dialog .block > span,
.puzzle-content .block > span {
  text-shadow: 2px 2px 2px #fff;
  display: none;
}
.dialog .block:nth-child(1),
.puzzle-content .block:nth-child(1) {
  background-position: 0 0;
}
.dialog .block:nth-child(2),
.puzzle-content .block:nth-child(2) {
  background-position: -100px 0;
}
.dialog .block:nth-child(3),
.puzzle-content .block:nth-child(3) {
  background-position: -200px 0;
}
.dialog .block:nth-child(4),
.puzzle-content .block:nth-child(4) {
  background-position: 0 -100px;
}
.dialog .block:nth-child(5),
.puzzle-content .block:nth-child(5) {
  background-position: -100px -100px;
}
.dialog .block:nth-child(6),
.puzzle-content .block:nth-child(6) {
  background-position: -200px -100px;
}
.dialog .block:nth-child(7),
.puzzle-content .block:nth-child(7) {
  background-position: 0 -200px;
}
.dialog .block:nth-child(8),
.puzzle-content .block:nth-child(8) {
  background-position: -100px -200px;
}
.dialog .block:nth-child(8),
.puzzle-content .block:nth-child(9) {
  background-position: -200px -200px;
}
</style>