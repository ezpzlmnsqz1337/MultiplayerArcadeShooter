import ObjectType from '../types/ObjectType'
import PlayerAnimation from '../types/PlayerAnimation'
import AbstractSprite from './AbstractSprite'

export default class OtherPlayer extends AbstractSprite {
    constructor(scene, x, y, opts) {
        super(scene, x, y, 'otherPlayer', ObjectType.PLAYER, opts)
        
        //  Our player animations, turning, walking left and walking right.
        scene.anims.create({
            key: PlayerAnimation.LEFT,
            frames: scene.anims.generateFrameNumbers('otherPlayer', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        
        scene.anims.create({
            key: PlayerAnimation.TURN,
            frames: [ { key: 'otherPlayer', frame: 4 } ],
            frameRate: 20
        })
        
        scene.anims.create({
            key: PlayerAnimation.RIGHT,
            frames: scene.anims.generateFrameNumbers('otherPlayer', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })

        //  Player physics properties. Give the little guy a slight bounce.
        this.setBounce(0.2)
        this.setCollideWorldBounds(true)
    }
}
  