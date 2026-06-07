class Start extends Phaser.Scene{
    constructor(){
        super("startScreen");
        this.key = null;
    }
    init(){
        this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }
    create(){
        this.background = this.sound.add("song", 1);
        this.background.loop = true;
        this.background.play();
        this.key = this.input.keyboard.addKey('E');
        this.end = this.add.tilemap("startScreen", 18, 18, 40, 25);
        this.tiles = this.end.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.endLayer = this.end.createLayer("Tile Layer 1", this.tiles, 0, 0);
        this.endLayer.setCollisionByProperty({
            collides: true
        });
        my.sprite.player = this.physics.add.sprite(200, 200, "platformer_characters", "tile_0005.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.end.widthInPixels, this.end.heightInPixels);
        this.physics.add.collider(my.sprite.player, this.endLayer);
        
        this.cameras.main.setBounds(0, 0, this.end.widthInPixels, this.end.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);


        //text "press E to start"
        this.add.text(150,200, "Flag-Man", {
            fontFamily: "Times, Serif",
            fontSize: 30
        });
        this.add.text(150, 250, "press e to start", {
            fontFamily: "Times, Serif",
            fontSize: 20
        });
    }
    update(){
        if(Phaser.Input.Keyboard.JustDown(this.key)){
            this.music.stop();
            this.scene.start("level1Scene");
        }
    }
}