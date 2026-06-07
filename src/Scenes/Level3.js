class Level3 extends Phaser.Scene{
    constructor(){
        super("level3Scene");
    }
    init(){
        this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.gemPicked = 0;
        this.key = null;
    } 
    create(){
        this.key = this.input.keyboard.addKey('E');
        this.spawnX = 30;
        this.spawnY = 200;
        this.map = this.add.tilemap("Level3Map", 18, 18, 150, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        //this.tilesetBack = this.background.addTilesetImage("kenny_background_tiles", "background_tilemap");
        this.jumpSound = this.sound.add("jumping", 1);
        this.collectSound = this.sound.add("collect", 1);

        this.groundLayer = this.map.createLayer("Ground/Platforms", this.tileset, 0, 0);
        this.decorLayer = this.map.createLayer("Decor", this.tileset, 0, 0);
        this.fallLayer = this.map.createLayer("fall", this.tileset, 0,0);

        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.fallLayer.setCollisionByProperty({
            collides: true
        });

        this.gems = this.map.createFromObjects("Objects", {
            name: "gems",
            key: "tilemap_sheet",
            frame: 67
        });
        this.flagTop = this.map.createFromObjects("Objects", {
            name: "flagTop",
            key: "tilemap_sheet",
            frame: 111
        });
        this.flags = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 131
        });
        this.switch = this.map.createFromObjects("Objects", {
            name:"switch", 
            key: "tilemap_sheet",
            frame: 64
        });
        this.spikes = this.map.createFromObjects("Objects", {
            name: "spikes",
            key: "tilemap_sheet",
            frame: 68
        });

        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);
        this.gemGroup = this.add.group(this.gems);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spikes);
        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);
        this.flagGroup = this.add.group(this.flags, this.flagTop);
        this.physics.world.enable(this.switch, Phaser.Physics.Arcade.STATIC_BODY);
        

        my.sprite.player = this.physics.add.sprite(this.spawnX, this.spawnY, "platformer_characters", "tile_0005.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        let disappear = (obj1, obj2) => {
            obj2.visible = false;
            obj2.setCollision(false);
        }
        let temp = (obj1, obj2) => {
            this.time.delayedCall(500, disappear, [obj1, obj2])
        }
        this.physics.add.collider(my.sprite.player, this.fallLayer, temp);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.coinParticle = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_01.png',
            speed: {min: 100, max: 300},
            lifespan: 800,
            scale: {start:0.6, end: 0},
            blendMode: 'ADD',
            quantity: 4,
            emitting: false
        });

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

        my.vfx.walking.stop();
        

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.gemPicked +=1
            this.coinParticle.setConfig({
                x: obj2.x,
                y: obj2.y,
                duration: 10,
                frame: 'star_01.png',
                speed: {min: 100, max: 300},
                lifespan: 800,
                scale: {start:0.2, end: 0},
                blendMode: 'ADD',
                quantity: 4,
                emitting: true
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
            if(this.gemPicked == 35){
                this.scene.start("endScreen");
            }
        })
        this.switch.id = 64;
        this.physics.add.overlap(my.sprite.player, this.switch, (obj1, obj2) => {
            if(Phaser.Input.Keyboard.JustDown(this.key)){
                if(obj2.id == 64){
                    obj2.setFrame(66);
                    obj2.id = 66;
                }
                else{
                    obj2.setFrame(64);
                    obj2.id = 64;
                }
                this.fallLayer.forEachTile(tile => {
                if(tile.index !== -1){
                    tile.visible = true;
                    tile.setCollision(true);
                }
            });
            }
        });

        my.sprite.enemy1 = new NPC(this, 1050, 300, 'tile_0020.png');
        my.sprite.enemy2 = new NPC(this, 650, 300, 'tile_0020.png');
        this.physics.add.collider(my.sprite.enemy1, this.groundLayer);
        this.physics.add.collider(my.sprite.enemy2, this.groundLayer);
        this.enemyGroup = this.add.group();
        this.enemyGroup.addMultiple([my.sprite.enemy1, my.sprite.enemy2]);
        this.enemyGroup = this.physics.add.group({
            classType: NPC,
            runChildUpdate: true
        });
        


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

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}