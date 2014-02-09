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
        var asteroid = stage.insert(new Q.Asteroid());

        var score = stage.insert(new Q.Score());

        var counter = 1
        stage.on("step",function() {
            counter += 1;

            if ((counter % 50) === 0) {
                counter = 1;

                var random = Math.floor(Math.random() * Q.height) + 1
                console.log(random)

                stage.insert(new Q.Asteroid({ 
                    y: random,
                }));
            }

        });

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
            this.p.label = (parseInt(this.p.label) + 100).toString();
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
                x: Q.width+50,
                y: 500,
                vy: 0,
                vx: -400,
            });

            this.on("hit.sprite", function(collision) {
                if(collision.obj.isA("Doge")) { 
                    Q.stageScene("endGame",1, { label: "You Died" }); 
                    collision.obj.destroy();
                }
            });
        },

        step: function(dt) {
            this.p.x += this.p.vx * dt;
            this.p.y += this.p.vy * dt;
        }
    })

    // INITIALIZE DOGE GAME
    Q.load("doge.png, asteroid.png, space-bkg.jpg", function() {
        Q.stageScene("Level1");
    });

    // STARS (refactor this bullshit)
    // ===============================================
    var c=document.getElementById("star_field");
    var ctx=c.getContext("2d");
    var sx = new Array(100);
    var sy = new Array(100);
    var ss = new Array(100);
    
    for(i=0;i<sx.length;i++){
        sx[i]=Math.round(Math.random()*c.width);
        sy[i]=Math.round(Math.random()*c.height);
        ss[i]=Math.round(Math.random()* 1 + 1 );
    }
    
    gameloop=setInterval(doGameLoop,16);
    function doGameLoop(){
        ctx.fillStyle="black";
        ctx.fillRect(0,0,c.width,c.height);
        // Draw the stars.
        ctx.fillStyle="white";
        for(i=0;i<sx.length;i++){
            ctx.fillRect(sx[i],sy[i],2,2);
        }
        // Update the stars position.
        for(i=0;i<sx.length;i++){
            sx[i]-=ss[i];
            if(sx[i]<0) sx[i]=c.width;
        }
    }





});