var prod = true;

if(prod) {
    var SAVE_URL = 'http://dogeinspace-env-qtuur5rufi.elasticbeanstalk.com/save'
    var SCORE_URL = 'http://dogeinspace-env-qtuur5rufi.elasticbeanstalk.com/scoreboard'
} else {
    var SAVE_URL = 'http://localhost:8900/save'
    var SCORE_URL = 'http://localhost:8900/scoreboard'
}

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
    ,     games_played_this_session = 0
    ,     game_is_loading = true
    ,     moon_reached = true;


    // PLANET DISTANCES
    var MOON = 100000000         // level 1
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
    ,   PICKUP = 8
    ,   UI = 16;

    // SCORE WHEN TO SEND SPECIAL SHIT
    var SUPERMAN_RANDOMIZER = 400;

    // Initialize Quintus
    var Q = window.Q = Quintus({ audioSupported: ['mp3', 'wav']})

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
        player.games_played += 1
        localStorage.setItem('games_played', player.games_played);

        var current_score = Q.state.get('score')

        $action_text.text(stage.options.label)
        
        if(stage.options.score) {
            console.log('tititit')

            $('#game_over_score')
                .show()
                .text(stage.options.score);
        }

        // RETURNING PLAYER 
        if (player.name) {            
            $player_name.hide();
            $player_name.find('input').val(player.name).hide();

            if(games_played_this_session === 0 ) {
                $('#clear_and_reset').show()
            } else {
                $('#clear_and_reset').hide()
            }

        // FIRST TIME PLAYER
        } else {
            // Save player's name
            $play_again_btn.on('click', function(event) {
                localStorage.setItem('player_name', $player_name.find('input').val());
                player.name = $player_name.find('input').val();
            });
        }

        if (current_score > player.highscore) {
            player.highscore = current_score
            localStorage.setItem('player_highscore', current_score)
        }
        
        // Set Highscore UI
        $('#highscore span').html(numberWithCommas(player.highscore) || 0)
         
        $action_window.fadeIn();

        setTimeout(function() {$play_again_btn.focus()}, 500);
        
        $play_again_btn.on('click', function(event) {
            event.preventDefault();
            games_played_this_session += 1;
            Q.clearStages();
            Q.stageScene('Level1');
            Q.state.set('score', 0);
            $action_window.fadeOut();
            launch_asteroids = true
        });
    });



    // MAIN GAME
    // ===============================================
    Q.scene("Level1", function (stage) {
        var player_sprite = stage.insert(new Q.Doge());
        var asteroid = stage.insert(new Q.Asteroid());

        var counter = 1;
        var coin_counter = 1;

        var level_counter = 80;          // Starting level
        var LEVEL_RESET = 5;             // Static level reset
        var level_reset = LEVEL_RESET;   // How many astroids till we make it faster
        var lowest_level = 30;           // Fastest speed you can make it, smaller faster.
        var level_drop = 10;             // How much faster to make it every time


        Q.state.set('game_over', false);
        Q.state.set('coins', parseInt(localStorage.getItem('coins')) || 0);
        Q.state.set("superman_sent", false);
        Q.state.set('player_alive', true);

        $('#moon').removeClass('enter');
        $('#earth').removeClass('peace');
        $('#space_bkg').removeClass('deepspace');

        initTouch();
        
        $coin_count.find('span').text(Q.state.get("coins"))

        $score.text("0");

        // PREGAME Floating Spacebar 
        setTimeout(function() { 
            Q.pauseGame(); 
            $('#help-text').fadeIn();
            console.log('pause!');
            $('#got-it').focus().on('click', function() {
                Q.unpauseGame();
                setTimeout(function(){$game_canvas.focus()}, 10)
                $('#help-text').fadeOut(); 
                blastOff();
            }) 
        }, 5)

        stage.on("step",function() {
            counter += 1;

            if (launch_asteroids) {

                if ((counter % level_counter) === 0) {
                    counter = 1;
                    stage.insert(new Q.Asteroid({
                        y: Math.floor(Math.random() * Q.height) + 1,
                    }));

                    // RANDOM SUPERMAN
                    if (!Q.state.get('superman_sent') && (Math.floor(Math.random() * SUPERMAN_RANDOMIZER ) + 1 ) === 111) {
                        stage.insert(new Q.Superman({y: Math.floor(Math.random() * Q.height) + 1}));
                        Q.state.set("superman_sent", true);
                    }

                    coin_counter += 1;

                    level_reset -= 1;
                    if(level_reset <= 0) {
                        level_reset = LEVEL_RESET;
                        if (level_counter > lowest_level) {
                            level_counter -= level_drop;
                        }
                    }
                }

                // HOUSEKEEPING
                // Clear the smoke every 100 steps
                if (counter % 100 === 0) {
                    clearSmoke();
                }

                // SPAWN DOGE COINS
                // Todo - Make this more random
                if ((coin_counter % 5) === 0) {
                    coin_counter = 1;

                    // Nick's Super Coin Spawn
                    if (( Math.floor(Math.random() * 1000 ) + 1 ) === 888) {
                        for ( var i = 0; i < Q.height; i = i + 20 ) {
                            stage.insert(new Q.Coin({ y: i }));
                        }
                    }
                    else {
                        stage.insert(new Q.Coin({y: Math.floor(Math.random() * Q.height) + 1}));
                    }
                }
                updateProgress(Q.state.get('score'));
            }

            if(!Q.state.get('game_over')) {
                Q.state.inc("score", 100);
                document.getElementById("score").innerHTML = numberWithCommas(Q.state.get("score"));
            }
        });
    });

    
    // DOGE!
    // ===============================================
    Q.Sprite.extend("Doge", {
        init:function(p) {
            this._super(p, {
                asset: "doge2.png",
                jumpSpeed: -400,
                speed: 300,
                x: Q.width / 6, 
                y: 300,
                z: 10,
                angle: 0,
                scale: 0.8,
                gravity: 3,
                type: SPRITE_PLAYER,
                collisionMask: SPRITE_ENEMY | PICKUP,
                sort: true
            });
            this.add('2d');
        },
        step: function(p) {
            // Engine 1
            this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 1,
                    y: this.p.y + 50,
                    x: this.p.x - 50,
                    gravity: 0,
                    opacity: .5
                }))
            // Engine 2
            this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 1,
                    y: this.p.y + 45,
                    x: this.p.x - 15,
                    gravity: 0,
                    opacity: .5
                }))


            // THRUSTING!!!!!
            if(Q.inputs['fire']) { 
                Q.audio.play('thrust.wav');

                // Tilt Doge
                this.p.angle = -10;

                // Move Vertically
                this.p.vy = -750;

                // Engine 1
                this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 5,
                    y: this.p.y + 50,
                    x: this.p.x - 50,
                    gravity: 0,
                    opacity: .5
                }))

                // Engine 2
                this.stage.insert(new Q.Smoke({
                    vx: Math.round(Math.random() * (500 - 400 ) + 400) * -1,
                    vy: Math.round(Math.random() * (300 - -100 ) + -100),
                    scale: 4.9,
                    y: this.p.y + 45,
                    x: this.p.x - 15,
                    gravity: 0,
                    opacity: .4
                }))

            // Not Thrusting
            } else {
                // Reset Doge Angle
                this.p.angle = 0;
            }

            // Kill player if doge falls off screen
            if(this.p.y - 100 > Q.height) {
                Q.state.set('player_alive', false);
                this.destroy();
                Q.audio.play('boom1.wav', {loop: false});
                Q.stageScene("startGame", 1, { label: "Whoops! You fell to your death." });
                saveScore(player.name, Q.state.get('score'));
                stopAsteroids();

            }

            // Set Game ceiling
            if(this.p.y < 0) {
                this.p.y = 0;
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
                z: 8,
                sort: true
            });
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
                    localStorage.setItem('coins', Q.state.get('coins'));

                    generateSuchText(this.p.x / 2, this.p.y / 2);

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
                    Q.state.set('player_alive', false);
                    Q.audio.play('boom1.wav', {loop: false});
                    Q.state.set("game_over", true);
                    Q.stageScene("startGame",1, { label: "You were obliterated!", score: Q.state.get('score') }); 
                    collision.obj.destroy();
                    stopAsteroids();
                    saveScore(player.name, Q.state.get('score'));
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
                    Q.state.set('player_alive', false);
                    Q.audio.play('boom1.wav', {loop: false});
                    Q.state.set("game_over", true);
                    Q.stageScene("startGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                    stopAsteroids();
                    saveScore(player.name, Q.state.get('score'));
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
    
    function generateSuchText(x,y) {
        $('#wow_text').fadeIn(100);
        var wow_choices = [
                "wow",
                "to the moon!",
                "much coin", 
                "very win", 
                "DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE DOGE",
                "such truasre",
                "every doge has its day",
                "FUN doge dodgein'",
                "much asteroid, such scare",
                "such space coin",
                "such speed",
                "amaze",
            ] // Todo - Add way more
        ,   wow_color_choices = ['#F12B6A', '#B47DFA', '#D9F57F', '#7FF0F5', '#F8A04F', '#45F76F']
        ,   color = wow_color_choices[Math.floor(Math.random() * wow_color_choices.length)]
        ,   text = wow_choices[Math.floor(Math.random() * wow_choices.length)];

        $('#wow_text').text(text).css({'color': color, left: x, top: y});

        setTimeout(function() { $('#wow_text').fadeOut(500); }, 2000)

    }

    // STARS (refactor this bullshit)
    // ===============================================
    var c = document.getElementById("star_field");
    var ctx = c.getContext("2d");
    var sx = new Array(100);
    var sy = new Array(100);
    var ss = new Array(100);
    var ssize = new Array(100);
    
    for(i = 0; i < sx.length; i++ ){
        sx[i] = Math.round(Math.random() * c.width);
        sy[i] = Math.round(Math.random() * c.height);
        ss[i] = Math.floor(Math.random() * (10 - 2 ) + 2) / 5;
        ssize[i] = Math.floor(Math.random() * (4 - 1 ) + 1) / 4;
    }
    
    function doGameLoop() {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle="transparent";
        
        // Draw the stars.
        ctx.fillStyle = "white";
        for( i = 0; i < sx.length; i++) {
            ctx.fillRect(sx[i], sy[i], ssize[i], ssize[i]);
        }
        
        //Update the stars position.
        for(i = 0; i < sx.length; i++) {
            sx[i] -= ss[i];
            if( sx[i] < 0 ) sx[i] = c.width;
        }
    }

    (function animloop(){
        requestAnimFrame(animloop);
        doGameLoop();
    })();

    function blastOff() {
        $('#earth').addClass('peace');
        $('#space_bkg').addClass('deepspace')
    }
    


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
            document.getElementById("boner").pause();
            music_playing = false;
            $mute_music.text('unmute')
            localStorage.setItem('mute_music', true);
        } else {
            document.getElementById("boner").play();
            music_playing = true;
            $mute_music.text('mute')
            localStorage.setItem('mute_music', false);
        }
    }

    function updateProgress(score) {
        $progress_bar.css('width', score / MOON * 100 + '%' );
        if (score >= (MOON - 2000000)) {
            moon_reached = true;
            if (!$('moon').hasClass('enter')) {
                $('#moon').addClass('enter');
            }
        } 
    }

    function saveScore(name, score) {    
        if (!Q.state.get('player_alive')) {
            console.log('saved!')
            $.post(SAVE_URL, {'name':name, 'score': score}).
                success(function (response) {
                    if(response.status === 'success') {
                    }
                    else {
                        // Todo - Some sort of error
                    }
                })
            ;
        }
    }

    // Todo - Orry - Needs to be called when we show scoreboard, not sure what you wannna do with that
    function loadHighscores() {
        $.ajax({
            type: "POST",
            url: SCORE_URL,
            success: function (response) {
                if(response.status === 'success') {
                    console.log(response);
                    $('#scoreboard ul').html('')
                    for (var i = 0; i < response.scores.length; i++) {
                        var score = response.scores[i];
                        $('#scoreboard ul').append('<li><strong>' + score.NAME + '</strong> -- <span>' + numberWithCommas(score.SCORE) + '</span></li>')
                    };
                }
                else {
                    // Todo - Some sort of error
                }
            }
        });
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
                break;
            // Mute music on 'M'    
            case 77:
                muteMusic();
                break;
        }
    }
    
    $mute_music.on('click', function() {
        muteMusic();
    })

    $('#clear_and_reset').on('click', function(event) {
        event.preventDefault();
        localStorage.clear();
        window.location.reload();
    });

    $('#view_scoreboard').on('click', function(e) {
        e.preventDefault();
        loadHighscores();
        $('#scoreboard').fadeToggle();
    });

    $('#view_credits').on('click', function(e) {
        e.preventDefault();
        loadHighscores();
        $('#credits').fadeToggle();
    });

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

    var loading_text = [
        'Reticulating Splines', 
        'Animating Loading Bar', 
        'Clearing Space Junk', 
        'Creating the Universe',
        'Loading Doge Coins',
        'Generating Moon',
        'Randomizing Asteroids',
        'Drinking a Space Beer',
        'Contemplating Spacetime Paradoxes',
        'Hosing Down Doge Rocket'
    ]

    function setLoadingText() {
        $('#loading_text').text(loading_text[Math.floor(Math.random() * loading_text.length )])
        if (game_is_loading) {
            setTimeout(function() { 
                setLoadingText();
            }, 5000);
        }
    }

    function afterLoadIsDone() {
        if (player.name) {
            $play_again_btn.focus();
        } else {
            $player_name.find('input').focus();
        }
        loadHighscores();
    }




    // INIT GAME
    // ==============================================

    Q.state.reset({ 
        score: 0, 
        game_over: false, 
        is_paused: false, 
        coins: 0, 
        level: 1, 
        superman_sent: false,
        player_alive: false
    });

    setLoadingText()

    Q.load("doge2.png, asteroid.png, coin.png, smoke.png, ping.wav, boom1.wav, superman.png, thrust.wav", function() {
        var label = "Welcome ensign! Enter your name"
        if (player.name) {
            label = "Welcome back, " + player.name + "!"
        } 

        Q.stageScene("startGame",1, { label: label});
        $game_canvas = $("#quintus");
        afterLoadIsDone();

    }, {
        progressCallback: function(loaded,total) {
            $("#loading_progress").css('width', Math.floor(loaded/total*100) + "%");
            if (loaded === total) {
                $("#loading").fadeOut();
                game_is_loading = false;
            }
        }
    });

});
