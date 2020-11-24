// 秒转换为分秒（00:00）
export function timeFormat(seconds) {
  let m = Math.floor(seconds / 60);
  let s = Math.ceil(seconds % 60);
  return singleToDouble(m) + ":" + singleToDouble(s);
}

// 单位数转双位数
function singleToDouble(num) {
  if(num < 10 && num >= 0) {
    return `0${num}`
  }
  return num
}

// 节流
export function throttle(fn, delay = 1000) {
  let timer = null
  let startTime = new Date()
  return function () {
    const context = this
    let currentTime = new Date()
    clearTimeout(timer)
    if (currentTime - startTime >= delay) {
      fn.apply(context, arguments)
      startTime = currentTime
    } else {
      //让方法在脱离事件后也能执行一次
      timer = setTimeout(() => {
        fn.apply(context, arguments)
      }, delay)
    }
  }
}