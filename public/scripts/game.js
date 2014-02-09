window.addEventListener("load", function (e) {

    var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        .setup({
            maximize: true
        })
        .controls()

    // MAIN GAME
    // ===============================================
    Q.scene("Level1", function (stage) {
        var player = stage.insert(new Q.Doge());
        var asteroid = stage.insert(new Q.Asteroid());

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

    // GAME OVER SCREEN
    // ===============================================
    Q.scene('endGame',function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
        }));
      
        var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                      label: "Play Again" }))         
        var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                       label: stage.options.label }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click",function() {
            Q.clearStages();
            Q.stageScene('level1');
        });
      
        // Expand the container to visibily fit it's contents
        container.fit(20);
    });


    // PLAYER
    // ===============================================
    Q.Sprite.extend("Doge", {
      init:function(p) {
        this._super(p, {
          asset: "doge.png",
          jumpSpeed: -400,
          speed: 300,
          x: Q.width / 2, 
          y: 300,
        });
        this.add('2d');
    },
      step: function(p) {
        if(Q.inputs['fire']) { 
          this.p.vy = -500;
        }
      }
    });

    // ENEMY
    // ===============================================
    Q.Sprite.extend("Asteroid", {
        init: function(p) {
            this._super(p, {
                asset: "asteroid.png",
                x: 0, 
                y: 300,
                vy: -400
            });


            this.on("bump.left, bump.right, bump.bottom, bump.top", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.stageScene("endGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                }
            });
        },
        step: function(p) {

        }
    })

    Q.load(["doge.png", "asteroid.png"],function() {
        Q.stageScene("Level1");
        // run the game
    });

});