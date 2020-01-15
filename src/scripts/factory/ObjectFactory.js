import Player from '../objects/Player'
import OtherPlayer from '../objects/OtherPlayer'
import Platform from '../objects/Platform'
import Bullet from '../objects/Bullet'
import StandardWeapon from '../objects/StandardWeapon'
import BulletOwner from '../types/BulletOwner'

export default class ObjectFactory {
    constructor() {
        this.instance = null
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ObjectFactory()
        }
        return this.instance
    }

    createPlayer(scene, x, y, opts) {
        console.log('Add player: ', opts)
        // The player and its settings
        const player = opts.mainPlayer ? new Player(scene, x, y, opts) : new OtherPlayer(scene, x, y, opts)
        player.setWeapon = new StandardWeapon()
      
        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        scene.physics.add.collider(player, scene.platforms)
        return player
    }

    createPlatform(scene, x, y, opts) {
        const platform = new Platform(scene, x, y, opts)

        return platform
    }
    
    createBullet(scene, x, y, opts) {
        console.log('BID2: ' , opts.id)
        const bullet =  new Bullet(scene, x, y, opts)
        
        console.log('Createa bullet with id: ', bullet.id)
        
        scene.physics.add.collider(bullet, scene.platforms, this.wallHit, null, scene)
        scene.physics.add.collider(bullet, scene.player, this.playerHit, null, scene)
        scene.physics.add.collider(bullet, scene.otherPlayers, this.playerHit, null, scene)

        return bullet
    }

    playerHit(o1, o2) {        
        o1.destroy()
        o2.destroy()
    }
    
    wallHit(o1, o2) {
        o1.destroy()
    }
}

