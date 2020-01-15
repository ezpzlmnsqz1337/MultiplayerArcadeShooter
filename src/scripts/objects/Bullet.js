import IDProvider from '../IDProvider'
import ObjectType from '../types/ObjectType'
import Direction from '../types/Direction'
import AbstractImage from './AbstractImage'

export default class Bullet extends AbstractImage {
  constructor(scene, x, y, opts) {
    super(scene, x, y, 'bullet', ObjectType.BULLET, opts)

    this.owner = opts.owner

    this.setCollideWorldBounds(true)
    this.body.setAllowGravity(false)
    if (opts.direction === Direction.LEFT) {
      this.setVelocityX(-700)
    } else {
      this.setVelocityX(700)
    }
  }

  update() {
    const x = this.x
    const y = this.y
    const id = this.id

    if (this.oldPosition) {
        const positionChanged = x !== this.oldPosition.x
            || y !== this.oldPosition.y
        if (positionChanged) {
            this.scene.socket.emit('bullet:movement', { x, y, id })
        }
    }
    
    // save old position data
    this.oldPosition = { x, y }
  }
}