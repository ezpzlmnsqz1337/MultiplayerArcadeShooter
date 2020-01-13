import ObjectType from '../types/ObjectType'

export default class SceneBuilder {
    static instance

    constructor() {
        this.sceneObjects = []
        this.player = null
        this.otherPlayers = null
        this.platforms = null
        this.bullets = null
        this.bulletId = 0
    }

    static getInstance() {
        if (!SceneBuilder.instance) {
            SceneBuilder.instance = new SceneBuilder()
        }
        return SceneBuilder.instance
    }

    addPlayer(scene, playerInfo) {
        console.log('Add player: ', playerInfo)
        // The player and its settings
        const player = scene.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude')
        player.objectType = ObjectType.PLAYER
      
        //  Player physics properties. Give the little guy a slight bounce.
        player.setBounce(0.2)
        player.setCollideWorldBounds(true)
      
        //  Our player animations, turning, walking left and walking right.
        scene.anims.create({
          key: 'left',
          frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
        })
      
        scene.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        })
      
        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
        
        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        scene.physics.add.collider(player, this.getPlatforms())

        this.sceneObjects.push(player)
        this.player = player
        return player
    }
      
    addOtherPlayers(scene, playerInfo) {
        if (!this.otherPlayers) this.otherPlayers = scene.physics.add.group() 
        console.log('Add other players: ', playerInfo)
        const otherPlayer = scene.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
        otherPlayer.playerId = playerInfo.playerId
        otherPlayer.objectType = ObjectType.PLAYER
        this.otherPlayers.add(otherPlayer)
        
        //  Our player animations, turning, walking left and walking right.
        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('otherPlayer', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
        
        scene.anims.create({
            key: 'turn',
            frames: [ { key: 'otherPlayer', frame: 4 } ],
            frameRate: 20
        })
        
        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('otherPlayer', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
        scene.physics.add.collider(otherPlayer, this.getPlatforms())
        
        this.sceneObjects.push(otherPlayer)
        return otherPlayer
    }

    addPlatform(scene, x, y, opts) {
        if (!this.platforms) this.platforms = scene.physics.add.staticGroup()

        const platform = this.platforms.create(x, y, opts.name)
        platform.objectType = ObjectType.PLATFORM
        if (opts.scale) platform.setScale(opts.scale)

        platform.refreshBody()
        console.log('PL: ', platform)
        this.sceneObjects.push(platform)
        return platform
    }
    
    addBullet(scene, x, y, opts) {
        if (!this.bullets) this.bullets = scene.physics.add.group()

        const bullet =  this.bullets.create(x, y, 'bullet')
        bullet.objectType === ObjectType.BULLET
        
        bullet.bulletId = opts.bulletId ? opts.bulletId : this.bulletId++
        console.log('Createa bullet with id: ', bullet.bulletId)
        
        bullet.setCollideWorldBounds(true)
        scene.physics.add.collider(bullet, this.getPlatforms())
        scene.physics.add.collider(bullet, this.getPlayer(), this.playerHit, null, scene)
        scene.physics.add.collider(bullet, this.getOtherPlayers(), this.playerHit, null, scene)


        bullet.body.setAllowGravity(false)
        if (opts.direction === 'left') {
            bullet.setVelocityX(-700)
        } else {
            bullet.setVelocityX(700)
        }
        this.sceneObjects.push(bullet)
        return bullet
    }

    playerHit(o1, o2, a, b, c) {
        o1.destroy()
        o2.destroy()
    }

    getObjects(...types) {
        return types.length > 0 ? this.sceneObjects.filter(x => types.includes(x.type)) : this.sceneObjects
    }

    getPlayer() {
        return this.player
    }

    getOtherPlayers() {
        return this.otherPlayers
    }

    getPlatforms() {
        return this.platforms
    }

    getBullets() {
        return this.bullets
    }
}

