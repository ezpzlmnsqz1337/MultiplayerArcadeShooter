import IDProvider from '../IDProvider'
import ObjectType from '../types/ObjectType'
export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet', opts)

    this.objectType = ObjectType.BULLET
    this.id = IDProvider.getId(this.objectType)

    this.owner = opts.owner
    
    this.setCollideWorldBounds(true)

    scene.add.existing(this)   
  }

  update() {
    const x = this.x
    const y = this.y
    const id = this.id

    if (this.oldPosition) {
        const positionChanged = x !== this.oldPosition.x
            || y !== this.oldPosition.y
        if (positionChanged) {
            this.socket.emit('bullet:movement', { x, y, id })
        }
    }
    
    // save old position data
    b.oldPosition = { x, y }
  }
}