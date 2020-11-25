<template>
  <router-view/>
</template>

<script>
var FastClick = require('fastclick');

export default {
  setup(){
    window.onresize = setRootFontSize
    function setRootFontSize() {
      document.getElementsByTagName('html')[0].style.fontSize = 100 / 375 * window.innerWidth + 'px';
    }
    setRootFontSize()

    FastClick.attach(document.body);
  }
}
</script>
<style>
html {
  font-size: 100px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  margin: 0;
  padding: 0;
  font-size: 14px;
  -webkit-overflow-scrolling: touch;
  
}
body::-webkit-scrollbar {
  display: none;
}
</style>
