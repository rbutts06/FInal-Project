class LevelTwo extends Phaser.Scene {
    constructor() {
        super("levelTwoScene");
    }

    init() {
       
        this.ACCELERATION = 300;
        this.DRAG = 1000;  
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.SWIM_VELOCITY = 100;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.gemPicked = 0;
        this.health = 2;
        this.SpawnX = 30;
        this.SpawnY = 220;
    }

    create() {
        console.log("create started");
        this.map = this.add.tilemap("HamsterDisasterUpdate", 18, 18, 160, 25);
        this.jumpSound = this.sound.add("jumping", 1);
        this.collectSound = this.sound.add("collect", 1);

        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        
        this.skyLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.waterLayer = this.map.createLayer("Water", this.tileset, 0, 0);
        this.waterLayer.setCollisionByExclusion([-1]);
        this.dangerLayer = this.map.createLayer("Danger", this.tileset, 0, 0);
        this.dangerLayer.setCollisionByExclusion([-1]);
        this.fallingLayer = this.map.createLayer("Fall", this.tileset, 0, 0);
        this.fallingLayer.setCollisionByProperty({
            collides: true
        });
        //this.collectLayer = this.map.createLayer("Objects", this.tileset, 0, 0);
        this.endGoal = this.map.createLayer("Goal", this.tileset, 0, 0);
        this.endGoal.setCollisionByProperty({
            collides: true
           });    
        
           //This should make is so that when the player touches the goal layer, the end screen is triggered by a statement in update.
        this.mySound = this.sound.add("bang", 1);

        this.coins = this.map.createFromObjects("Collect", {
            name: "gems",
            key: "tilemap_sheet",
            frame: 67
        });
        
        this.textLayer = this.map.getObjectLayer('Text');

        if (this.textLayer && this.textLayer.objects) {
            this.textLayer.objects.forEach(obj => {
                if (obj.text) {
                    const textObj = this.add.text(obj.x, obj.y, obj.text.text, {
                        fontFamily: obj.text.fontfamily || 'Tahoma',
                        fontSize: `${obj.text.pixelsize || 16}px`,
                        color: obj.text.color || '#000000',
                        align: obj.text.halign || 'center',
                        wordWrap: { width: obj.width || 0 }
                    });
                }
            });
        } 
    



         this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.swimming = false;

        let disappear = (obj1, obj2) => {
            obj2.visible = false;
            obj2.setCollision(false);
        }
        let temp = (obj1, obj2) => {
            this.time.delayedCall(500, disappear, [obj1, obj2])
        }
       
        my.sprite.player = this.physics.add.sprite(30, 220, "platformer_characters", "tile_0005.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.isWater == true;
        });
        console.log(this.waterTiles.length)
        
       
        
        this.physics.add.collider(my.sprite.player, this.fallingLayer, temp);
       // this.physics.add.collider(my.sprite.player, this.dangerLayer);
       console.log("player created");
        this.physics.add.collider(
          my.sprite.player,
          this.endGoal,
          () => {
            if(this.gemPicked == 49){
                this.scene.start("level3Scene");
            }
           },
           null,
           this
           );

           

        this.coinParticle = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_01.png',
            speed: {min: 100, max: 300},
            lifespan: 800,
            scale: {start:0.6, end: 0},
            blendMode: 'ADD',
            quantity: 4,
            emitting: false
        });

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
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
            obj2.destroy();
            this.mySound.play();
        });

        

       
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        

        console.log("PreParticles")
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: 'magic_05.png',
            scale: {start: 0.03, end: 0.1},
            lifespan: 800,
            quantity: 2,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: 'dirt_01.png',
            scale: {start: 0.03, end: 0},
            lifespan: 600,
            quantity: 2,
            emitting: false
        });
        console.log("Particles")


        my.vfx.walking.stop();
        my.vfx.jumping.stop();

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        

        
//         this.physics.add.collider(
  //       my.sprite.player,
    //     this.waterLayer,
      //   this.swimmingStart,
        // null,
//         this
  //       );
       
    console.log("create finished");
    }

    update() {
        this.isDying = false;
        this.physics.add.collider(
         my.sprite.player,
         this.dangerLayer,
         this.playerDeath,
         null,
         this
         );

    this.playerX = my.sprite.player.x;
    this.playerY = my.sprite.player.y;

    this.tileX = this.groundLayer.worldToTileX(this.playerX);
    this.tileY = this.groundLayer.worldToTileY(this.playerY);

    this.tile = this.groundLayer.getTileAt(this.tileX, this.tileY);

    if (this.tile) {
        if (this.tile.properties && this.tile.properties.isWater) {
            this.swimming = true;
        } 
        if (this.tile.properties && !this.tile.properties.isWater) {
            this.swimming = false;
        }
    }

        if (this.isDying) {
         return;
        }        
        if (this.swimming == false){
            this.physics.world.gravity.y = 1500;
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                my.vfx.walking.start();
            }else{
              my.vfx.walking.stop();
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/10-2, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                my.vfx.walking.start();
            }else{
              my.vfx.walking.stop();
            }
            

        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

         my.sprite.player.setAccelerationX(0);

            my.sprite.player.setDragX(this.DRAG);

            my.sprite.player.anims.play('idle');
             my.vfx.walking.stop();
        }

        if(!my.sprite.player.body.blocked.down) {
           // my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/10-2, my.sprite.player.displayHeight/2-5, false);
           // my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.sprite.player.anims.play('jump');
            my.vfx.jumping.start();
        }else{
          my.vfx.jumping.stop();
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
    if (this.swimming == true){
        my.sprite.player.tint = 0x0000FF;
        this.physics.world.gravity.y = 500;
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.SWIM_VELOCITY);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            //make vfx swimming?
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                my.vfx.walking.start();
            
            

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.SWIM_VELOCITY);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            //make vfx swimming?
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/10-2, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                my.vfx.walking.start();
          
              my.vfx.walking.stop();
            
            

        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

             my.vfx.walking.stop();
        }

        if(!my.sprite.player.body.blocked.down) {
           //bubbles?
        }else{
          //my.vfx.jumping.stop();
        }
        if(cursors.up.isDown) {
            my.sprite.player.body.setVelocityY(-this.SWIM_VELOCITY);
            my.sprite.player.anims.play('walk', true);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}
  swimmingStart(){
    if (this.swimming) return;
    this.swimming = true;
  }
    playerDeath() {
    if (this.isDying) return;
    this.isDying = true;
    my.sprite.player.setVelocity(0, 0);
    my.sprite.player.setAcceleration(0, 0);
    my.sprite.player.setTint(0xff0000);
    my.sprite.player.body.enable = false;

    this.tweens.add({
        targets: my.sprite.player,
        y: "-=80",
        duration: 400,
        ease: "Power2",
        yoyo: true,
        onComplete: () => {
            if (this.health > 0){
                this.health -= 1;
                //console.log(this.health);
                my.sprite.player.y = this.SpawnY;
                my.sprite.player.x = this.SpawnX;
                my.sprite.player.body.enable = true;
            } else if(this.health == 0){
                console.log(this.health);
                this.scene.start("level1Scene");
            }
        }
    });
}
}