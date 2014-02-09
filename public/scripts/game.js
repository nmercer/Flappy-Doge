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
        // Background
        //stage.insert(new Q.Repeater({ asset: "space-bkg.jpg", speedX: 1, speedY: 1, type: 0 }));
        var player = stage.insert(new Q.Doge());
        stage.add("viewport").follow(player, { x: true, y: false });

        console.log(stage)

    });

    // GAME OVER SCREEN
    // ===============================================
    Q.scene('endGame',function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.8)"
        }));
      
        var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                      label: "Play Again" }))         
        var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                       label: stage.options.label }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function() {
            console.log('clicked')
            Q.clearStages();
            Q.stageScene('Level1');
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
                vx: 10,
            });
            this.add('2d');
        },
        step: function(p) {
            if(Q.inputs['fire']) { 
                this.p.vy = -500;
            }
            if(this.p.y > Q.height) {
                Q.stageScene("endGame", 1, { label: "You Fell!" });
            }
        }
    });

    // ENEMY
    // ===============================================
    Q.Sprite.extend("Asteroid", {
        init: function(p) {
            this._super(p, {
                asset: "asteroid.png",
            })

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.stageScene("endGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                }
            });
        }
    })

    Q.load("doge.png, asteroid.png, space-bkg.jpg", function() {
        Q.stageScene("Level1");
    });

    // // BACKGROUND
    // // ===============================================
    // Q.UI.extend("StarField", {
    //     sx: new Array(100),
    //     sy: new Array(100),
    //     ss: new Array(100),

    //     init: function(p) {
            
    //         for(i = 0; i < this.sx.length; i++) {
    //             this.sx[i] = Math.round( Math.random() * this.starCanvas.width );
    //             this.sy[i] = Math.round( Math.random() * this.starCanvas.height );
    //             this.ss[i] = Math.round( Math.random() * 3 + 1 );
    //         }
    //         this.ctx.fillStyle = "black";
    //         this.ctx.fillRect(0,0, this.starCanvas.width, this.starCanvas.height);
            
    //         // Draw the stars.
    //         this.ctx.fillStyle = "white";
    //         for( i = 0; i < this.sx.length ;i++){
    //             this.ctx.fillRect(this.sx[i], this.sy[i], 2, 2);
    //         }
    //         // Update the stars position.
    //         for( i = 0; i < this.sx.length; i++){
    //             this.sx[i] -= this.ss[i];
    //             if( this.sx[i] < 0 ) this.sx[i] = this.starCanvas.width;
    //         }
    //     },

    // })
});