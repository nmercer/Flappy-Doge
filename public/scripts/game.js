window.addEventListener("load", function (e) {

    var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        .setup({
            maximize: true
        })
        .controls()

    Q.scene("Level1", function (stage) {
        var player = stage.insert(new Q.Doge());
        var container = stage.insert(new Q.UI.Container({
          fill: "gray",
          border: 5,
          shadow: 10,
          shadowColor: "rgba(0,0,0,0.5)",
          y: 50,
          x: Q.width/2 
        }));

        stage.insert(new Q.UI.Text({ 
      label: "Here's a label\nin a container",
      color: "white",
      x: 0,
      y: 0
    }),container);
        container.fit(120,120);
    });

    Q.Sprite.extend("Doge", {
      init:function(p) {
        this._super(p, {
          asset: "doge.png",
          jumpSpeed: -400,
          speed: 300,
          x: 0, 
          y: 300,
        });
        this.add('2d');
    },
      
      step: function(p) {
        
        console.log(Q.inputs)

        if(Q.inputs['fire']) { 
          this.p.vy = -500;
        }
      }

    });

    Q.load("doge.png",function() {
        Q.stageScene("Level1");
        // run the game
    });

});