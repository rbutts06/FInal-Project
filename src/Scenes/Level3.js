class Level3 extends Phaser.Scene{
    constructor(){
        super("level3Scene");
    }
    init(){
        this.ACCELERATION = 400;
        this.DRAG = 10000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.gemPicked = 0;
    } 
    create(){
        this.map = this.add.tilemap("Level3Map", 18, 18, 150, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tilesetBack = this.background.addTilesetImage("kenny_background_tiles", "background_tilemap");

        this.groundLayer = this.map.createLayer("Ground/Platforms", this.tileset, 0, 0);
        this.decorLayer = this.map.createLayer("Decor", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({
            collides: true
        });
    }
}