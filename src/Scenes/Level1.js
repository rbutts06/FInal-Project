class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 10000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.gemPicked = 0;
        this.key = null;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 120 tiles wide and 25 tiles tall.
        this.spawnX = 30;
        this.spawnY = 300;
        this.map = this.add.tilemap("Level1Map", 18, 18, 150, 25);
        this.background = this.add.tilemap("lvl1Back", 24, 24, 120, 21);
        this.jumpSound = this.sound.add("jumping", 1);
        this.collectSound = this.sound.add("collect", 1);

        this.key = this.input.keyboard.addKey('E');

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tilesetBack = this.background.addTilesetImage("kenny_background_tiles", "background_tilemap");

        // Create a layer
        this.backLayer = this.background.createLayer("Tile Layer 1", this.tilesetBack, 0, 0);
        this.groundLayer = this.map.createLayer("Ground/platforms", this.tileset, 0, 0);
        this.decorLayer = this.map.createLayer("decor", this.tileset, 0,0);
        this.fallLayer = this.map.createLayer("falling", this.tileset, 0,0);
        

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.fallLayer.setCollisionByProperty({
            collides: true
        });

        // TODO: Add createFromObjects here
        
        this.gems = this.map.createFromObjects("Objects", {
            name: "gems",
            key: "tilemap_sheet",
            frame: 67
        });
        this.spikes = this.map.createFromObjects("Objects", {
            name: "spikes",
            key: "tilemap_sheet",
            frame: 68
        });
        this.flags = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 131
        });
        this.flagTop = this.map.createFromObjects("Objects", {
            name: "flagTop",
            key: "tilemap_sheet",
            frame: 111
        });
        this.switch = this.map.createFromObjects("Objects", {
            name:"switch", 
            key: "tilemap_sheet",
            frame: 64
        });
        
        
        let disappear = (obj1, obj2) => {
            obj2.visible = false;
            obj2.setCollision(false);
        }
        let temp = (obj1, obj2) => {
            this.time.delayedCall(500, disappear, [obj1, obj2])
        }

        

        // TODO: Add turn into Arcade Physics here
        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);
        this.gemGroup = this.add.group(this.gems);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spikes);
        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);
        this.flagGroup = this.add.group(this.flags, this.flagTop);
        this.physics.world.enable(this.switch, Phaser.Physics.Arcade.STATIC_BODY);
        

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spawnX, this.spawnY, "platformer_characters", "tile_0005.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.fallLayer, temp);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.gemParticles = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'magic_03.png',
            speed: {min: -this.PARTICLE_VELOCITY, max: this.PARTICLE_VELOCITY},
            lifespan: 800,
            scale: {start: 0.3, end: 0},
            blendMode: 'ADD',
            quantity: 1,
            emitting: false
        });
        // TODO: Add coin collision handler
        this.physics.add.overlap(my.sprite.player, this.switch, (obj1, obj2) => {
            if(this.key.isDown){
                obj2.index = 66;
                this.fallLayer.forEachTile(tile => {
                if(tile.index !== -1){
                    tile.visible = true;
                    tile.setCollision(true);
                }
            });
            }
        });


        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.gemPicked +=1
            this.gemParticles.setConfig({
                frame: 'magic_03.png',
                x: obj2.x,
                y: obj2.y,

                speed: {min: -this.PARTICLE_VELOCITY, max: this.PARTICLE_VELOCITY},
                lifespan: 300,
                scale: {start: 0.1, end: 0},
                blendMode: 'ADD',
                quantity: 1,
                emitting: true,
                duration: 5
            });
            this.collectSound.play();
        });
        
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            obj1.x = this.spawnX;
            obj1.y = this.spawnY;
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
            
            
        })
        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1, obj2) => {
            if(this.gemPicked == 37){
                this.scene.start("endScreen");
            }
        })

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.physics.world.drawDebug = false;

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: 'magic_05.png',
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 800,
            quantity: 2,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.jumped = this.add.particles(0, 0, "kenny-particles", {
            frame: 'dirt_01.png',
            scale: {start: 0.03, end: 0},
            lifespan: 600,
            quantity: 2,
            emitting: false
        });

        my.vfx.walking.stop();
        

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        
        //add flag obj
        //if sprite overlap flag and this.gemsPicked == 30
        //set end screen

    }

    update() {
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

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();
            my.vfx.jumped.setConfig({
                frame: 'dirt_01.png',
                x: my.sprite.player.x,
                y: my.sprite.player.y + 10,
                scale: {start: 0.1, end: 0},
                lifespan: 600,
                quantity: 4,
                blendMode: 'MULTIPLY',
                emitting: true,
                duration: 10
            });
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}