window.addEventListener("load", function (e) {

    // var Q = window.Q = Quintus()
    //     .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
    //     .setup({
    //         maximize: true
    //     });

    // Q.scene("helloWorld", function (stage) {
    //     var box = stage.insert(new Q.UI.Container({
    //         x: Q.width / 2,
    //         y: Q.height / 2,
    //         fill: "rgba(0,0,0,0.5)",

    //     }));

    var Q = Quintus().include("Sprites").setup();

    Q.Sprite.extend("Doge",{
      init:function(p) {
        this._super(p,{
          asset: "doge.png",
          x: 0, 
          y: 300,
          vx: 50,
          vy: -400
        }); 
      },

      step: function(dt) {
        this.p.vy += dt * 9.8;

        this.p.x += this.p.vx * dt;
        this.p.y += this.p.vy * dt;
      }
    });

    Q.load("doge.png",function() {
        var doge = new Q.Doge();
        Q.gameLoop(function(dt) {
            doge.update(dt);
            Q.clear();
            doge.render(Q.ctx);
        });
    });

});