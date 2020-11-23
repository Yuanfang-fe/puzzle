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
          {{timeFormat}}
        </div>
        <div class="flex flex-vc"><i class="iconfont icon-star"></i>步数：{{stepNum}}</div>
      </div>
      <!-- 拼图 -->
      <div class="puzzle-content">
        <div ref="blocks" class="puzzle-blocks">
          <div v-for="(item, index) in imgLength" class="block" :key="item" @click="imgBlockClick(index, $event)">
            <span class="order">{{item}}</span>
          </div>
        </div>
        <div v-if="!eventId" class="pause flex flex-vc flex-hc">
          <i class="iconfont icon-play" @click="timeCountDown"></i>
        </div>
      </div>
      <!-- 操作提示文案 -->
      <p class="tip">（点击拼图置换位置）</p>
    </div>
    <!-- 操作按钮 -->
    <div v-if="!eventId" class="big-btn btn-start" @click="timeCountDown">开始</div>
    <div v-else class="flex flex-hj">
      <div class="btn btn-tip" @click="openTip">提示</div>
      <div class="btn btn-restart" @click="reStart">重新开始</div>
    </div>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue'
export default {
  setup(){
    // 剩余时间
    let time = ref(60);
    let timeFormat = ref('1:00');
    let eventId = ref(null);
    // 步数
    let stepNum = ref(0);
    // let unit = 100; //block width
    let place = [ //坐标位置
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2]
    ];
    let bgimg = [ //全部图片路径
        "https://static.wxb.com.cn/frontEnd/images/common/lx-pt-300x300.png",
        "https://static.wxb.com.cn/frontEnd/images/common/lx-activity-puzzle-300*300.png",
    ];

    let nowOrder = roa([0, 1, 2, 3, 4, 5, 6, 7, 8]);       //当前块排序
    // let purposeOder = [0, 1, 2, 3, 4, 5, 6, 7, 8];         //目标排序
    let oldIndex = null;
    let imgLength = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let blocks = ref(null);
  
    // 倒计时
    function timeCountDown() {
      if(eventId.value) return;
      eventId.value = setInterval(() => {
        if(time.value===0) {
          // 游戏倒计时结束
          clearInterval(eventId.value)

        } else {
          time.value += -1;
          let val = time.value;
          if(time.value<10){
            val = `0${time.value}`
          }
          timeFormat.value = `00:${val}`
        }
      }, 1000);
    }

    onMounted(() => {
      blockInit()
      changeImg()
    })

    function blockInit() {
      blocks.value.children.forEach((ele, i)=>{
        let temp = getCoordinate(nowOrder[i]);
        ele.style.left = temp.x * 100 + "px";
        ele.style.top = temp.y * 100 + "px";
      })
    }

    function getCoordinate(index) {
      return {
          x: place[index][0],
          y: place[index][1],
      }
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
      const randomIndex = Math.round(Math.random() * (bgimg.length - 1));
      blocks.value.children.forEach(ele => {
          ele.style.backgroundImage = "url(" + bgimg[randomIndex] + ")";
      })
    }
    function Toast(obj) {
      console.log(obj)
    }

    function imgBlockClick(i, event) {
      if(time.value<=0) {
        Toast({
          message: '倒计时已结束，请重新开始',
          // iconClass: 'icon icon-warn'
        })
      }
      const ele = event.target;
      if (typeof oldIndex === 'number'){
          let temp = nowOrder[oldIndex];
          nowOrder[oldIndex] = nowOrder[i];
          nowOrder[i] = temp;
          
          //统计步数
          stepNum.value += 1;
          blockInit();

          //剩余距离
          const distanceCount = totalDis(nowOrder);
          
          //判断是否完成
          if (distanceCount == 0) {
            console.log('已完成')
            Toast('已完成')
            clearInterval(eventId.value)
              // successShow();
          }
          blocks.value.children[oldIndex].classList.remove('active')
          oldIndex = null
      }else{
          ele.classList.add('active');
          oldIndex = i;
      }
    }
    // 当前状态总距离
    function totalDis(arr) {
      var temp = 0;
      arr.forEach(function (ele, index) {
        temp += distance(ele, index);
      })
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
      clearInterval(eventId.value)
      stepNum.value = 0
      time.value = 60
      nowOrder = roa([0, 1, 2, 3, 4, 5, 6, 7, 8])
      blockInit()
      timeFormat.value = `01:00`
      eventId.value = null;
      timeCountDown()
      changeImg()
    }

    // 提示
    function openTip() {
      
    }

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
    }
  }
}
</script>

<style scoped>
  .page-puzzle {
    position: relative;
  }
  .bg {
    background-image: url('../assets/puzzle/body-bg.png');
    width: 100%;
    height: 100vh;
  }
  .title {
    position: relative;
    top: .34rem;
    background-image: url('../assets/puzzle/title.png');
    width: 100%;
    height: 1rem;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  .game-name {
    position: relative;
    top: .24rem;
    background-image: url('../assets/puzzle/game-name.png');
    width: 100%;
    height: .4rem;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 3;
  }
  .puzzle-bg {
    position: relative;
    top: .05rem;
    background-image: url('../assets/puzzle/dialog-bg.png');
    width: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center; 
  }
  .header {
    position: relative;
    width: 78%;
    margin: 0 auto;
    font-size: .2rem;
    font-weight: bold;
    color: #FF6110;
    height: .6rem;

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
    color: #ECAB56;
    font-size: .14rem;
    text-align: center;
    padding-bottom: .14rem;
  }
  .btn,
  .big-btn {
    font-size: .2rem;
    font-weight: bold;
  }
  .btn-tip,
  .btn-restart{
    margin-top: 12px;
    width: 50%;
    padding: 14px 0;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  .btn-tip {
    background-image: url('../assets/puzzle/btn-bg.png'); 
    color: #FF8845;
  }
  .btn-restart {
    background-image: url('../assets/puzzle/btn-bg-confirm.png'); 
    color: #fff;
  }
  .big-btn {
    background-size: contain;
    background-repeat: no-repeat;
    background-image: url('../assets/puzzle/btn-large-bg.png'); 
    background-position: center;
  }
  .btn-start {
    color: #fff;
    padding: 14px 0;
    margin-top: 25px;
    font-size: 20px;
    letter-spacing: .05rem
  }
  .btn:active,
  .btn-start:active {
    opacity: .75;
  }
  .puzzle-content{
    width: 300px;
    height: 300px;
    position: relative;
    margin: .2rem auto 0;
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
    font-size: .1rem;
  }
  .icon-clock {
    margin-right: 5px;
    font-size: .2rem;
  }
  .pause {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,.7);
  }
  .icon-play {
    width: 26px;
    position: relative;
    margin: auto;
    font-size: 24px;
    color: #fff;
    padding: 17px;
    background: linear-gradient(180deg, #FD762B 0%, #FF9433 100%);
    border-radius: 50%;
  }
.puzzle-content .block {
  width: 100px;
  height: 100px;
  position:absolute;
  left:100px;
  top:100px;
  right:0xp;
  line-height: 20px;
  text-align: left;
  font-size: 1.5em;
  background-image: url("https://static.wxb.com.cn/frontEnd/images/common/lx-activity-puzzle-300*300.png");
  background-repeat: no-repeat;
  cursor: pointer;
  transition:all 0.3s ease;
}
.puzzle-content .block.active {
    box-shadow: 0px 0px 6px 6px rgba(255, 210, 0, .5);
    z-index: 2;
}
.puzzle-content .block > span {
  text-shadow: 2px 2px 2px #fff;
  display:none;

}
.puzzle-content .block:nth-child(1) {
	background-position: 0 0;
}
.puzzle-content .block:nth-child(2) {
	background-position: -100px 0;
}
.puzzle-content .block:nth-child(3) {
	background-position: -200px 0;
}
.puzzle-content .block:nth-child(4) {
	background-position: 0 -100px;
}
.puzzle-content .block:nth-child(5) {
	background-position: -100px -100px;
}
.puzzle-content .block:nth-child(6) {
	background-position: -200px -100px;
}
.puzzle-content .block:nth-child(7) {
	background-position: 0 -200px;
}
.puzzle-content .block:nth-child(8) {
	background-position: -100px -200px;
}
.puzzle-content .block:nth-child(9) {
	background-position: -200px -200px;
	/* display:none; */
}
</style>