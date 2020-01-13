import ObjectType from '../types/ObjectType'

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'dude')
      scene.add.existing(this)
      scene.physics.add.existing(this)
      this.objectType = ObjectType.PLAYER
    
      //  Player physics properties. Give the little guy a slight bounce.
      this.setBounce(0.2)
      this.setCollideWorldBounds(true)
    
      //  Our player animations, turning, walking left and walking right.
      scene.anims.create({
        key: 'left',
        frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      })
    
      scene.anims.create({
          key: 'turn',
          frames: [ { key: 'dude', frame: 4 } ],
          frameRate: 20
      })
    
      scene.anims.create({
          key: 'right',
          frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
          frameRate: 10,
          repeat: -1
      })
    }

    jump() {

    }

    shoot() {

    }

    duck() {

    }

    go(direction) {
        
    }

    preload() {

    }

    create() {

    }

    update() {
      if (this.scene.cursors.left.isDown) {
        this.setVelocityX(-160)

        this.anims.play('left', true)
      } else if (this.scene.cursors.right.isDown) {
          this.setVelocityX(160)

          this.anims.play('right', true)
      } else {
          this.setVelocityX(0)

          this.anims.play('turn')
      }

      if (this.scene.cursors.up.isDown && this.body.touching.down) {
          this.setVelocityY(-330)
      }
      
      if (Phaser.Input.Keyboard.JustDown(this.scene.spacebar)) {
          const y = this.body.top + this.height / 2
          const bullet = this.scene.sceneBuilder.addBullet(this.scene, this.x, y, { bulletType: 'player', direction: this.anims.currentAnim.key })
          this.scene.socket.emit('bullet:created', { x: bullet.x, y: bullet.y, bulletId: bullet.bulletId })
      }

      // emit player movement
      const x = this.x
      const y = this.y
      const animation = this.anims.currentAnim.key
  
      if (this.oldPosition) {
          const positionChanged = x !== this.oldPosition.x
              || y !== this.oldPosition.y
              || animation !== this.oldPosition.animation
          if (positionChanged) {
              this.scene.socket.emit('player:movement', { x, y, animation })
          }
      }
      
      // save old position data
      this.oldPosition = { x, y, animation }
    }
  }
  