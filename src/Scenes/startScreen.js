class Start extends Phaser.Scene{
    constructor(){
        super("startScreen");
        this.key = null;
    }
    create(){
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
    }
    update(){
        if(Phaser.Input.Keyboard.JustDown(this.key)){
            this.scene.start("level1Scene");
        }
    }
}