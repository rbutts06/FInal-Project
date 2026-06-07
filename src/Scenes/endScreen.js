class End extends Phaser.Scene{
    constructor(){
        super("endScreen");
    }
    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 10000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }
    create(){
        this.music = this.sound.add("song", 1);
        this.music.loop = true;
        this.music.play();
        this.spawnX = 400;
        this.spawnY = 200;
        this.end = this.add.tilemap("endScreen", 18, 18, 40, 25);
        this.tiles = this.end.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.endLayer = this.end.createLayer("Tile Layer 1", this.tiles, 0, 0);

        this.endLayer.setCollisionByProperty({
            collides: true
        });

        this.snowman = this.end.createFromObjects("Object1", {
            name: "restart",
            key: "tilemap_sheet",
            frame: 145
        });
        this.physics.world.enable(this.snowman, Phaser.Physics.Arcade.STATIC_BODY);
        this.snowGroup = this.add.group(this.snowman);
        this.physics.world.drawDebug = false;

        my.sprite.player = this.physics.add.sprite(this.spawnX, this.spawnY, "platformer_characters", "tile_0005.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.end.widthInPixels, this.end.heightInPixels);
        this.physics.add.collider(my.sprite.player, this.endLayer);

        this.physics.add.overlap(my.sprite.player, this.snowGroup, (obj1, obj2) => {
            this.music.stop();
            this.scene.start("level1Scene");
        });

        this.add.text(150,100, "You won! See the snowman to restart!", {
            fontFamily: "Times, Serif",
            fontSize: 30
        });


        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: 'magic_05.png',
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 800,
            quanitty: 1,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        cursors = this.input.keyboard.createCursorKeys();


        
        this.cameras.main.setBounds(0, 0, this.end.widthInPixels, this.end.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }
    update(){
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
            // TODO: add particle following code here

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }
}