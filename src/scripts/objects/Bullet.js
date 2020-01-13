export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet')
        scene.add.existing(this)
        scene.physics.add.existing(this)
    
        this.setCollideWorldBounds(true)
      }

      update() {
          
      }
}