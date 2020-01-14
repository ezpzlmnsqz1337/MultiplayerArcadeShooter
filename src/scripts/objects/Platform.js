export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, opts) {
        super(scene, x, y, 'platform')

        this.objectType = ObjectType.PLATFORM
        this.id = IDProvider.getId(this.objectType)

        this.owner = opts.owner        
        if (opts.scale) this.setScale(opts.scale)

        this.refreshBody()
        
        scene.add.existing(this)   
    }

    update() {

    }
}