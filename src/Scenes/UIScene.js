class UIScene extends Phaser.Scene{
    constructor(){
        super('UIScene');
    }
    create(){
        this.healthText = this.add.text(20,20, 'Lives: 3', {
            fontFamily: 'Times, Serif',
            fontSize: 30,
            color: 0xffffff
        });
    }
}