
window.addEventListener("load", function (e) {

    var $score = document.getElementById("score");

    var Q = window.Q = Quintus({ audioSupported: ['wav']})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({
            maximize: true
        })
        .controls().enableSound();

    // MAIN GAME
    // ===============================================
    Q.scene("Level1", function (stage) {
        // Background
        //stage.insert(new Q.Repeater({ asset: "space-bkg.jpg", speedX: 1, speedY: 1, type: 0 }));
        var player = stage.insert(new Q.Doge());
        var asteroid = stage.insert(new Q.Asteroid());

        var counter = 1;
        var coin_counter = 1;

        stage.on("step",function() {
            counter += 1;

            if ((counter % 50) === 0) {
                counter = 1;
                stage.insert(new Q.Asteroid({ 
                    y: Math.floor(Math.random() * Q.height) + 1,
                }));

                coin_counter += 1;
            }

            // Todo - Make this more random
            if ((coin_counter % 5) === 0) {
                coin_counter = 1;

                stage.insert(new Q.Coin({ 
                    y: Math.floor(Math.random() * Q.height) + 1,
                }));
            }

            if(!Q.state.get('game_over')) {
                Q.state.inc("score", 100);
                $score.innerHTML = Q.state.get("score");
            }


        });

        stage.add("viewport").follow(player, { x: true, y: false });
        

    });

    // GAME OVER SCREEN
    // ===============================================
    Q.scene('endGame', function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.8)"
        }));
      
        var button = container.insert(new Q.UI.Button({x: 0, y: 0, fill: "#CCCCCC",
                                                      label: "Play Again"}))
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

    // WOW
    // ===============================================
    Q.UI.Text.extend("Wow", {
        init:function(p) {
            var wow_choices = ["wow", "To The Moon!", "Much Coin", "Very Win"]; // Todo - Add way more

            // Todo - Spawn these in random places, effects?
            this._super(p, {
                label: wow_choices[Math.floor(Math.random() * wow_choices.length)],
                color: "white",
                x: Q.width/2,
                y: 100,
                counter: 1,
            });
        },

        step: function(p) {
            this.p.counter += 1;

            if ((this.p.counter % 50) === 0) {
                this.destroy();
            }
        }
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
                scale: 0.5,
                gravity: 3,
            });
            this.add('2d');
        },
        step: function(p) {
            if(Q.inputs['fire']) { 
                this.p.vy = -1000;
            }
            if(this.p.y - 100 > Q.height) {
                Q.stageScene("endGame", 1, { label: "You Fell!" });
            }
            if(this.p.y < 0) {
                this.p.y = 0;
            }
        }
    });

    // COIN
    // ===============================================
    Q.Sprite.extend("Coin", {
        init: function(p) {
            this._super(p, {
                asset: "coin.png",
                x: Q.width+50,
                y: 500,
                vy: 0,
                vx: -400,
                scale: .2
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.state.inc("score", 1000000);
                    this.stage.insert(new Q.Wow());
                    this.destroy();
                }
            });
        },

        step: function(dt) {
            this.p.x += this.p.vx * dt;
            this.p.y += this.p.vy * dt;
            // Todo - Destroy these when they are past a certain part of the screen
        }
    })

    // ENEMY
    // ===============================================
    Q.Sprite.extend("Asteroid", {
        init: function(p) {
            this._super(p, {
                asset: "asteroid.png",
                x: Q.width+50,
                y: 500,
                vy: 0,
                vx: -400,
                scale: 2.3
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.state.set("game_over", true);
                    Q.stageScene("endGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                }
            });
        },

        step: function(dt) {
            this.p.x += this.p.vx * dt;
            this.p.y += this.p.vy * dt;

            // Todo - Destroy these when they are past a certain part of the screen
        }
    })

    Q.state.reset({ score: 0, game_over: false});

    Q.load("doge.png, asteroid.png, space-bkg.jpg, coin.png, boner.wav", function() {
        Q.stageScene("Level1");
        Q.audio.play('boner.wav',{ loop: true });
    });

    // STARS (refactor this bullshit)
    // ===============================================
    var c = document.getElementById("star_field");
    var ctx=c.getContext("2d");
    var sx = new Array(100);
    var sy = new Array(100);
    var ss = new Array(100);
    
    for(i=0; i < sx.length; i++ ){
        sx[i]=Math.round(Math.random() * c.width);
        sy[i]=Math.round(Math.random() * c.height);
        ss[i]=Math.round(Math.random() * 1 + 1 );
    }
    
    function doGameLoop() {
        ctx.fillStyle="black";
        ctx.fillRect(0, 0, c.width, c.height);
        
        // Draw the stars.
        ctx.fillStyle = "white";
        for( i=0; i< sx.length; i++) {
            ctx.fillRect(sx[i], sy[i], .5, .5);
        }
        
        // Update the stars position.
        for(i = 0; i < sx.length; i++) {
            sx[i] -= ss[i];
            if( sx[i] < 0 ) sx[i] = c.width;
        }
    }

    (function animloop(){
        requestAnimFrame(animloop);
        doGameLoop();
    })();

});