import IDProvider from '../IDProvider'

export default class AbstractImage extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, image, objectType, opts) {
    super(scene, x, y, image)

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