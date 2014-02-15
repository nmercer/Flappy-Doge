window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function numberWithCommas(x) {
    if (x) {
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "<span>,</span>");	
    }
}