class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("Level1Map", "Level1Map.tmj");   // Tilemap in JSON
        this.load.image("background_tilemap", "tilemap-backgrounds_packed.png");
        this.load.tilemapTiledJSON("lvl1Back", "lvl1Back.tmj");
        this.load.tilemapTiledJSON("HamsterDisasterUpdate", "HamsterDisasterUpdate.tmj");
        this.load.tilemapTiledJSON("endScreen", "endScreen.tmj");
        this.load.tilemapTiledJSON("Level3Map", "Level3Map.tmj");
        this.load.tilemapTiledJSON("startScreen", "startScreen.tmj");

        this.load.audio("collect", "collection.mp3");
        this.load.audio("jumping", "jumper.mp3");
        this.load.audio("bang", "jingles_HIT14.ogg");
        this.load.audio("song", "lightbeatsmusic-joyful-rhythm-walk-funk-513936.mp3");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("background_sheet", "tilemap-backgrounds_packed.png", {
            frameWidth: 24,
            frameHeight: 24
        });

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 4,
                end: 5,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0004.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0005.png" }
            ],
        });

        this.anims.create({
            key: 'NPC walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: 'tile_',
                start: 20,
                end: 19,
                suffix: '.png',
                zeroPad: 4
            }),
            frameRate: 10,
            repeat: -1
        });

         // ...and pass to the next Scene
         //DO NOT PUSH!!!!!!!!
         //this.scene.start("level3Scene");
         //this.scene.start("levelTwoScene");
         this.scene.start("level3Scene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}