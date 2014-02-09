window.addEventListener("load", function (e) {

    var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        .setup({
            maximize: true
        });

    Q.scene("helloWorld", function (stage) {
        var box = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height / 2,
            fill: "rgba(0,0,0,0.5)"
        }));

        var button = box.insert(new Q.UI.Button({
            asset: 'enemy.png'
        }));

        box.insert(new Q.UI.Text({
            y: button.p.h / 1.5,
            label: "Hello World!"
        }));

        box.fit(20);
    });

    Q.load("enemy.png", function () {
        Q.stageScene("helloWorld");
    });

});