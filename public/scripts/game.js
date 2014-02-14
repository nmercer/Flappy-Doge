
window.addEventListener("load", function (e) {


    // Elements
    var $score = $("#score")
    ,   $action_window = $("#action_window")
    ,   $play_again_btn = $("#play_again")
    ,   $player_name = $('#player_name')
    ,   $action_text = $("#action_text")
    ,   $mute_music = $('#mute_music')
    ,   $progress_bar = $('#progress_bar')
    ,   $coin_count = $('#coin_count')
    ,   $title = $('#title')
    ,   $game_canvas


    // Game states
    var   launch_asteroids = true
    ,     music_playing = localStorage.getItem('mute_music') || true
    ,     games_played_this_session = 0;


    // PLANET DISTANCES
    var MOON = 250000          // level 1
    ,   MARS = 35000000        // level 2
    ,   JUPITER = 370000000    // level 3
    ,   SATURN = 744000000     // level 4
    ,   URANUS = 1607000000    // level 5
    ,   NEPTUNE = 2680000000   // level 6
    ,   PLUTO = 2670000000;    // level 7

    // GAME SPRITE TYPES
    var SPRITE_PLAYER = 1
    ,   PARTICLES = 2
    ,   SPRITE_ENEMY = 4
    ,   PICKUP = 8;

    
    // Initialize Quintus
    var Q = window.Q = Quintus({ audioSupported: ['wav']})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({
            maximize: true
        })
        .controls()
        .enableSound();

    

    // PLAYER
    // ===============================================

    var player = window.player = {
        name: localStorage.getItem('player_name') || false,
        games_played: parseInt(localStorage.getItem('games_played')) || 0,
        highscore: localStorage.getItem('player_highscore') || 0,
    }

    


    // START SCREEN
    // ===============================================
    Q.scene('startGame',function(stage) {
        // Set Games Played
        games_played_this_session += 1;
        player.games_played += 1
        localStorage.setItem('games_played', player.games_played);

        var current_score = Q.state.get('score')

        $action_text.text(stage.options.label)

        if (player.name && games_played_this_session === 1) {            
            $action_text.html("Hello " + player.name + '!');
            $player_name.hide();
            $player_name.find('input').val(player.name)
        } else {
            $play_again_btn.on('click', function(event) {
                localStorage.setItem('player_name', $player_name.find('input').val());
                player.name = $player_name.find('input').val();
            });
        }

        if (current_score > player.highscore) {
            player.highscore = current_score
            localStorage.setItem('player_highscore', current_score)
        }
        
        $('#highscore span').text(player.highscore)
         
        $action_window.fadeIn();
        $play_again_btn.focus();
        $play_again_btn.on('click', function(event) {
            Q.clearStages();
            Q.stageScene('Level1');
            Q.state.set('score', 0);
            $action_window.fadeOut();
            setTimeout(function(){$game_canvas.focus()}, 10)
            launch_asteroids = true
        });
    });


    // MAIN GAME
    // ===============================================
    Q.scene("Level1", function (stage) {
        var player = stage.insert(new Q.Doge());
        var asteroid = stage.insert(new Q.Asteroid());
        Q.state.set("superman_sent", false);

        var counter = 1;
        var coin_counter = 1;

        var level_counter = 80;          // Starting level
        var LEVEL_RESET = 5;             // Static level reset
        var level_reset = LEVEL_RESET;   // How many astroids till we make it faster
        var lowest_level = 30;           // Fastest speed you can make it, smaller faster.
        var level_drop = 10;             // How much faster to make it every time

        Q.state.set('game_over', false);
        Q.state.set('coins', 0);

        initTouch();

        $coin_count.find('span').text(Q.state.get("coins"))

        $score.text("0");

        stage.on("step",function() {
            counter += 1;

            // Todo - Set this to a good score
            if (!Q.state.get('superman_sent') && Q.state.get('score') > 1000) {
                stage.insert(new Q.Superman({y: Math.floor(Math.random() * Q.height) + 1}));
                Q.state.set("superman_sent", true);
            }

            if (launch_asteroids) {

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

                    clearSmoke(); // doesnt have to be here, but it was convenient at the time
                }
                updateProgress(Q.state.get('score'));
            }

            if(!Q.state.get('game_over')) {
                Q.state.inc("score", 100);
                $score.text(Q.state.get("score"));
            }

        });
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
                type: SPRITE_PLAYER,
                collisionMask: SPRITE_ENEMY | PICKUP
            });
            this.add('2d');
        },
        step: function(p) {
            this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 1,
                    y: this.p.y + 50,
                    x: this.p.x - 50,
                    gravity: 0,
                    opacity: .5
                }))

            if(Q.inputs['fire']) { 
                this.p.vy = -1000;
                this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 3,
                    y: this.p.y + 50,
                    x: this.p.x - 50,
                    gravity: 0,
                    opacity: .5
                }))
            }
            if(this.p.y - 100 > Q.height) {
                this.destroy();
                Q.stageScene("startGame", 1, { label: "Whoops! Try Again!" });
                stopAsteroids();
            }
            if(this.p.y < 0) {
                this.p.y = 0;
            }
        }
    });

    // DOGECOIN
    // ===============================================
    Q.Sprite.extend("Coin", {
        init: function(p) {
            this._super(p, {
                asset: "coin.png",
                x: Q.width+50,
                y: 500,
                vy: 0,
                vx: -400,
                scale: .2,
                collisionMask: 0,
                type: PICKUP,
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.audio.play('ping.wav', {loop: false});

                    Q.state.inc("score", 1000000);
                    Q.state.inc('coins', 1);

                    console.log()

                    this.stage.insert(new Q.Wow());
                    this.destroy();
                    flashScreen();
                    $coin_count.find('span').text(Q.state.get("coins"))
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

    // ASTEROID
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
                angle: 0,
                type: SPRITE_ENEMY,
                collisionMask: SPRITE_PLAYER,
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) {
                    Q.audio.play('boom1.wav', {loop: false});
                    Q.state.set("game_over", true);
                    Q.stageScene("startGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                    stopAsteroids();
                }
            });
        },

        step: function(dt) {
            this.p.x += this.p.vx * this.p.speed;
            this.p.y += this.p.vy * this.p.speed;

            this.p.angle += Math.round(Math.random() * 5);

            if (this.p.x < 10) {
                this.destroy();
            }
        }
    })

    // SUPERMAN
    // ===============================================
    Q.Sprite.extend("Superman", {
        init: function(p) {
            this._super(p, {
                asset: "superman.png",
                x: Q.width+50,
                y: 500,
                vy: 0,
                vx: -400,
                scale: .5,
                speed: parseFloat((Math.random() * (0.09 - 0.01) + 0.01).toFixed(4)),
                type: SPRITE_ENEMY,
                collisionMask: SPRITE_PLAYER,
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) {
                    Q.audio.play('boom1.wav', {loop: false});
                    Q.state.set("game_over", true);
                    Q.stageScene("startGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                    stopAsteroids();
                }
            });
        },

        step: function(dt) {
            this.p.x += this.p.vx * this.p.speed;
            this.p.y += this.p.vy * this.p.speed;

            if (this.p.x < -100) {
                this.destroy();
            }
        }
    })

    // Q.Sprite.extend("Boom", {
    //     init: function(p) {
    //         this._super({asset: "sprites.png"});
    //     }
    // });

    // Q.sheet("Boom",
    //     "sprites.png",
    //     {
    //       tilew: 40,  // Each tile is 40 pixels wide
    //       tileh: 40,  // and 40 pixels tall
    //       sx: 0,   // start the sprites at x=0
    //       sy: 0    // and y=0
    //      });
    
    // WOW
    // ===============================================
    Q.UI.Text.extend("Wow", {
        init:function(p) {
            var wow_choices = [
                "wow",
                "To The Moon!",
                "Much Coin", 
                "Very Win", 
                "DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE",
                "such truasre",
                "every doge has its day"
            ]; // Todo - Add way more

            // Todo - Spawn these in random places, effects?
            this._super(p, {
                label: wow_choices[Math.floor(Math.random() * wow_choices.length)],
                color: "white",
                //x: Q.width/2,
                //y: 100,
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

    // MUCH SMOKE TRAILS
    // ===============================================
    Q.MovingSprite.extend("Smoke",{
        init: function(p) {
            this._super(p, {
                asset: "smoke.png",
                type: PARTICLES,
            });
        }
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

    function clearSmoke() {
        var smoke = Q('Smoke')

        old_smoke = smoke.items.splice(0, 400);
        for (var i = 0; i < old_smoke.length; i++) {
            old_smoke[i].destroy();
        };
    }

    // Functions and shit
    function stopAsteroids() {
        
        launch_asteroids = false
        var asteroids = Q('Asteroid')
        for (var i = 0; i < asteroids.items.length; i++) {
            asteroids.items[i].p.vx = 0;
        };
    }
    
    function flashScreen() {
        $('#flash_screen').show()
        setTimeout(function(){ $('#flash_screen').hide() }, 5)
    }

    function muteMusic() {
        if (music_playing) {
            Q.audio.stop();
            music_playing = false;
            $mute_music.text('unmute')
            localStorage.setItem('mute_music', true);
        } else {
            Q.audio.play('boner.wav', {loop: true});
            music_playing = true;
            $mute_music.text('mute')
            localStorage.setItem('mute_music', false);
        }
    }

    function playMusic() {
        if(music_playing === 'true') {
            Q.audio.play('boner.wav', {loop: true});
        }
    }

    function updateProgress(score) {
        $progress_bar.css('width', score / MOON * 100 + '%' );
        if (score === MOON) {
            
        } 
    }


    // USER INTERACTIONS
    // ==============================================

    // Key Bindings
    document.onkeydown = function(e) {
        var e = e || window.event;
        switch(e.which || e.keyCode) {
            // Pause game on 'P'
            case 80:
                if (Q.state.get('is_paused')) {
                    Q.unpauseGame();
                    Q.state.set('is_paused', false)
                } else {
                    Q.pauseGame();
                    Q.state.set('is_paused', true)
                }
            // Mute music on 'M'    
            case 77:
                muteMusic();
        }
    }

    // MOBILE TOUCH
    // document.addEventListener('touchstart', function(e) {
    //     e.preventDefault();
    //     var touch = e.touches[0];
    //     // move player

    //     var player = Q('Doge');

    //     player.p.vy = -1000;
    //     player.stage.insert(new Q.Smoke({
    //         vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
    //         vy: Math.round(Math.random() * (300 - -100 ) + -100),
    //         scale: 3,
    //         y: this.p.y + 50,
    //         x: this.p.x - 50,
    //         gravity: 0,
    //         opacity: .5
    //     }))
    // }, false);



    $mute_music.on('click', function() {
        muteMusic();
    })

    function initTouch() {
        $('#touch_this').on('click', function() {
            
            var player = Q("Doge").items[0];
            if (player) {
                player.p.vy = -1000;
                player.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 3,
                    y: player.p.y + 50,
                    x: player.p.x - 50,
                    gravity: 0,
                    opacity: .5
                }))    
            }
        });
    }


    // INIT GAME
    // ==============================================

    Q.state.reset({ score: 0, game_over: false, is_paused: false, coins: 0, level: 1, superman_sent: false});

    Q.load("doge.png, asteroid.png, boner.wav, coin.png, smoke.png, ping.wav, boom1.wav, superman.png", function() {
        Q.stageScene("startGame",1, { label: "Start Game" });
        $game_canvas = $("#quintus");
        playMusic();
        
    }, {
        progressCallback: function(loaded,total) {
            $("#loading_progress").css('width', Math.floor(loaded/total*100) + "%");
            if (loaded === total) {
                $("#loading").fadeOut();
            }
        }
    });

});
