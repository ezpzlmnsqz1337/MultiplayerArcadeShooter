import IDProvider from '../IDProvider'

export default class AbstractSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, sprite, objectType, opts) {
    super(scene, x, y, sprite)

    this.id = IDProvider.getId(scene.socket, objectType)
    this.objectType = objectType


    if (opts.group) {
      opts.group.add(this)
    } else {
      scene.physics.add.existing(this)      
    }
    scene.add.existing(this)

    if (opts.scale) this.setScale(opts.scale)
  }

  update() {
    // abstract method
  }
}