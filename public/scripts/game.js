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
        stage.insert(new Q.Repeater({ asset: "space-bkg.jpg", speedX: 1, speedY: 1, type: 0 }));
        var player = stage.insert(new Q.Doge());
        var asteroid = stage.insert(new Q.Asteroid());

        var score = stage.insert(new Q.Score());

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
        });

        stage.add("viewport").follow(player, { x: true, y: false });

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

    // SCORE
    // ===============================================
    Q.UI.Text.extend("Score", {
        init:function(p) {
            this._super(p, {
                label: "0",
                color: "white",
                x: Q.width/2,
                y: 280
            });
        },

        step: function(p) {
            if(!Q.state.get('game_over')) {
                Q.state.inc("score", 100);
                this.p.label = Q.state.get("score").toString();
            }
        }
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

            console.log(this.p.counter);

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
                vx: 10,
            });
            this.add('2d');
        },
        step: function(p) {
            if(Q.inputs['fire']) { 
                this.p.vy = -500;
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

    Q.load("doge.png, asteroid.png, space-bkg.jpg, coin.png", function() {
        Q.stageScene("Level1");
    });

});