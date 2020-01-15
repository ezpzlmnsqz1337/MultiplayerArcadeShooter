import ObjectType from '../types/ObjectType'
import Direction from '../types/Direction'
import AbstractImage from './AbstractImage'
import EventType from '../types/EventType'

export default class Bullet extends AbstractImage {
  constructor(scene, x, y, opts) {
    super(scene, x, y, 'bullet', ObjectType.BULLET, opts)

    console.log('BID: ' , opts.id)

    if (opts.id) this.id = opts.id 
    this.owner = opts.owner
    this.direction = opts.direction

    this.setCollideWorldBounds(true)
    this.body.setAllowGravity(false)
    if (this.direction === Direction.LEFT) {
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
          console.log('Bullet id: ', id, this.id)
            this.scene.socket.emit('bullet:movement', { x, y, id })
        }
    }
    
    // save old position data
    this.oldPosition = { x, y }
  }

  destroy() {
    this.scene.socket.emit(EventType.BULLET_REMOVE, this)
    super.destroy()
  }
}