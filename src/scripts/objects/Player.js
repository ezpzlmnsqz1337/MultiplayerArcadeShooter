import ObjectType from '../types/ObjectType'
import EventType from '../types/EventType'
import eventBus from '../EventBus'
import Direction from '../types/Direction'
import PlayerAnimation from '../types/PlayerAnimation'
import AbstractSprite from './AbstractSprite'

export default class Player extends AbstractSprite {
    constructor(scene, x, y, opts) {
        super(scene, x, y, 'dude', ObjectType.PLAYER, opts)
        this.weapon = null
        this.id = opts.playerId // player must have different id
        
        //  Our player animations, turning, walking left and walking right.
        scene.anims.create({
            key: PlayerAnimation.LEFT,
            frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        
        scene.anims.create({
            key: PlayerAnimation.TURN,
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        })
        
        scene.anims.create({
            key: PlayerAnimation.RIGHT,
            frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
        //  Player physics properties. Give the little guy a slight bounce.
        this.setBounce(0.2)
        this.setCollideWorldBounds(true)  
    }

    jump() {
        this.setVelocityY(-330)
    }

    shoot() {
        eventBus.emit(EventType.PLAYER_SHOOT, { player: this, weapon: this.weapon })
    }

    duck() {

    }

    go(direction) {
        if (direction === Direction.LEFT) {
            this.setVelocityX(-160)    
            this.anims.play(PlayerAnimation.LEFT, true)
        } else {
            this.setVelocityX(160)  
            this.anims.play(PlayerAnimation.RIGHT, true)
        }
    }

    stay() {
        this.setVelocityX(0)
        this.anims.play(PlayerAnimation.TURN)
    }

    preload() {

    }

    create() {              
    }

    update() {
        if (this.scene.cursors.left.isDown) {
            this.go(Direction.LEFT)
        } else if (this.scene.cursors.right.isDown) {
            this.go(Direction.RIGHT)
        } else {
            this.stay()        
        }

        if (this.scene.cursors.up.isDown && this.body.touching.down) {
            this.jump()
        }
      
        if (Phaser.Input.Keyboard.JustDown(this.scene.spacebar)) {
            this.shoot()     
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
                this.scene.socket.emit(EventType.PLAYER_MOVEMENT, { x, y, animation })
            }
        }
      
        // save old position data
        this.oldPosition = { x, y, animation }
    }
}
  