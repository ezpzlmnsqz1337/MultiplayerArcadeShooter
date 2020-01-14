import ObjectType from '../types/ObjectType'
import IDProvider from '../IDProvider'

export default class Platform extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, opts) {
        super(scene, x, y, 'platform')

        this.objectType = ObjectType.PLATFORM
        this.id = IDProvider.getId(this.objectType)
  
        if (opts.scale) this.setScale(opts.scale)
        
        scene.add.existing(this)

        setTimeout(() => this.refreshBody())
        
    }

    update() {

    }
}