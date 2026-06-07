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
        this.game.events.on('updateLives', this.updateLifeText, this);
    }
    updateLifeText(health){
        health = health +1;
        this.healthText.setText(`Lives: ${health}`);
    }
}