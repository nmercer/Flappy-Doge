
window.addEventListener("load", function (e) {

    var $score = document.getElementById("score")
    ,   $action_window = document.getElementById("action_window")
    ,   $play_again_btn = document.getElementById("play_again")
    ,   $action_text = document.getElementById("action_text")
    ,   $game_canvas   

    var Q = window.Q = Quintus({ audioSupported: ['wav']})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({
            maximize: true
        })
        .controls().enableSound();


    // press p to pause
    document.onkeydown = function(e) {
        var e = e || window.event;
        switch(e.which || e.keyCode) {
            case 80:
                if (Q.state.get('is_paused')) {
                    Q.unpauseGame();
                    Q.state.set('is_paused', false)
                    Q.audio.play('boner.wav', { loop: true }); 
   
                } else {
                    Q.pauseGame();
                    Q.state.set('is_paused', true)
                    Q.audio.stop();
                }
        }
    }

    // PLAYER
    // ===============================================

    var player = {
        highscore: 0,
        name: ""
    }




    
    // MAIN GAME
    // ===============================================
    Q.scene("Level1", function (stage) {
        // Background
        //stage.insert(new Q.Repeater({ asset: "space-bkg.jpg", speedX: 1, speedY: 1, type: 0 }));
        var player = stage.insert(new Q.Doge());
        var asteroid = stage.insert(new Q.Asteroid());

        var counter = 1;
        var coin_counter = 1;

        var level_counter = 80;         // Starting level
        var LEVEL_RESET = 10;            // Static level reset
        var level_reset = LEVEL_RESET;   // How many astroids till we make it faster
        var lowest_level = 20;           // Fastest speed you can make it, smaller faster.
        var level_drop = 10;             // How much faster to make it every time

        Q.state.set('game_over', false);
        $score.innerHTML = "0";

        stage.on("step",function() {
            counter += 1;

            if ((counter % level_counter) === 0) {
                counter = 1;
                stage.insert(new Q.Asteroid({
                    y: Math.floor(Math.random() * Q.height) + 1,
                }));

                coin_counter += 1;

                level_reset -= 1;
                if(level_reset <= 0) {
                    level_reset = LEVEL_RESET;
                    if (level_counter > lowest_level) {
                        level_counter -= level_drop;
                    }
                }
            }

            // Todo - Make this more random
            if ((coin_counter % 5) === 0) {
                coin_counter = 1;

                if ((Math.floor(Math.random() * 1000) + 1) === 888) {
                    for(var i = 0; i < Q.height; i=i+20) {
                        stage.insert(new Q.Coin({y: i}));
                    }
                }
                else {
                    stage.insert(new Q.Coin({y: Math.floor(Math.random() * Q.height) + 1}));
                }
            }

            if(!Q.state.get('game_over')) {
                Q.state.inc("score", 100);
                $score.innerHTML = Q.state.get("score");
            }
        });
    });

    // GAME OVER SCREEN
    // ===============================================
    Q.scene('startGame',function(stage) {
        
        var current_score = Q.state.get('score')
        var high_score = localStorage.getItem('flappy_doge_highscore') || 0

        if (current_score > high_score) {
            localStorage.setItem('flappy_doge_highscore', current_score)
        }


        $action_text.innerHTML = stage.options.label;
        $action_window.className = "show";
        $play_again_btn.focus();
        $play_again_btn.addEventListener('click', function(event) {
            Q.clearStages();
            Q.stageScene('Level1');
            Q.state.set('score', 0);
            $action_window.className = stage.options.label;
            $game_canvas.focus()
        });
    });

    // WOW
    // ===============================================
    Q.UI.Text.extend("Wow", {
        init:function(p) {
            var wow_choices = ["wow",
                               "To The Moon!",
                               "Much Coin", 
                               "Very Win", 
                               "DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE",
                               "such truasre",
                               "every doge has its day"]; // Todo - Add way more

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

    

    // DOGE!
    // ===============================================
    Q.Sprite.extend("Doge", {
        init:function(p) {
            this._super(p, {
                asset: "doge.png",
                jumpSpeed: -400,
                speed: 300,
                x: Q.width / 6, 
                y: 300,
                scale: 0.5,
                gravity: 3,
            });
            this.add('2d');
        },
        step: function(p) {
            this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 1,
                    y: this.p.y,
                    x: this.p.x - 100,
                    gravity: 0,
                    opacity: .5
                }))

            if(Q.inputs['fire']) { 
                this.p.vy = -1000;
                this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 3,
                    y: this.p.y,
                    x: this.p.x - 100,
                    gravity: 0,
                    opacity: .5
                }))
            }
            if(this.p.y - 100 > Q.height) {
                Q.stageScene("startGame", 1, { label: "You Fell!" });
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

            if (this.p.x < 10) {
                this.destroy();
            }
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
                scale: Math.round(Math.random() * (3 - 2 ) + 2),
                speed: parseFloat((Math.random() * (0.09 - 0.01) + 0.01).toFixed(4)),
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.state.set("game_over", true);
                    Q.stageScene("startGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                }
            });
        },

        step: function(dt) {
            this.p.x += this.p.vx * this.p.speed;
            this.p.y += this.p.vy * this.p.speed;

            if (this.p.x < 10) {
                this.destroy();
            }
        }
    })


    // MUCH SMOKE TRAILS
    // ===============================================
    Q.MovingSprite.extend("Smoke",{
        init: function(p) {
            this._super(p, {
                asset: "smoke.png",
            });
        },
        // step: function(p) {
        //     if (this.p.x < 10) {
        //         this.destroy();
        //     }
        // }
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

    Q.state.reset({ score: 0, game_over: false, is_paused: false});

    Q.load("doge.png, asteroid.png, boner.wav, coin.png, smoke.png", function() {
        Q.stageScene("startGame",1, { label: "Start Game" });
        Q.audio.play('boner.wav',{ loop: true });
        $game_canvas = document.getElementById("quintus");
    });

});
