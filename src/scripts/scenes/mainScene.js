import ObjectFactory from '../factory/ObjectFactory'
import FpsText from '../objects/fpsText'
import EventType from '../types/EventType'
import BulletOwner from '../types/BulletOwner'
import Direction from '../types/Direction'
import eventBus from '../EventBus'

import io from 'socket.io-client'

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' })
        this.objectFactory = ObjectFactory.getInstance()
        
        // network
        this.socket = null

        // game status
        this.gameOver = false
        this.scoreText = null
        this.fpsText = null
    }

    bindEvents() {
        this.socket = io('http://localhost:3000')
        // socket status
        this.socket.on('connect', () => console.log('connect'))
        this.socket.on('disconnect', () => console.log('disconnect'))
        // game socket events
        this.socket.on(EventType.CURRENT_PLAYERS, e => this.handleCurrentPlayers(e))
        this.socket.on(EventType.PLAYER_CONNECTED, e => this.handlePlayerConnected(e))
        this.socket.on(EventType.PLAYER_DISCONNECTED, e => this.handlePlayerDisconnected(e))
        this.socket.on(EventType.PLAYER_MOVED, e => this.handlePlayerMoved(e))
        this.socket.on(EventType.CURRENT_BULLETS, e => this.handleCurrentBullets(e))

        // game events
        eventBus.on(EventType.PLAYER_SHOOT, e => this.handlePlayerShoot(e))
    }

    handlePlayerConnected(e) {
        const playerInfo = e
        console.log('Player connected: ', playerInfo)
        const player = this.objectFactory.createPlayer(scene, playerInfo, { mainPlayer: false })
        this.player.add(player)    
    }

    handlePlayerDisconnected(e) {
        const playerId = e
        console.log('Player disconnected: ', playerId)
        this.otherPlayers.getChildren().forEach(x => {
            if (playerId === x.playerId) {
                x.destroy()
            }
        })
    }

    handleCurrentPlayers(e) {
        const players = e
        console.log('Current players: ', players)
        Object.keys(players).forEach(id => {            
            if (players[id].playerId === this.socket.id) {
                const player = this.objectFactory.createPlayer(this, players[id].x, players[id].y, { mainPlayer: true })
                this.player = player
            } else {
                const player = this.objectFactory.createPlayer(this, players[id].x, players[id].y, { mainPlayer: false })
                this.otherPlayers.add(player)
            }
        })
    }

    handlePlayerMoved(e) {
        const playerInfo = e
        this.otherPlayers.getChildren().forEach(x => {
            if (playerInfo.playerId === x.playerId) {
                x.setPosition(playerInfo.x, playerInfo.y)
                const loop = Object.keys(Direction).includes(playerInfo.animation) ? true : false
                x.anims.play(playerInfo.animation, loop)
            }
        })
    }

    handleCurrentBullets(e) {
        const bullets = e
        Object.keys(bullets).forEach(bullet => {
            if (!this.bullets.getChildren().map(x => x.id).contains(bullet.id)) {
                this.objectFactory.createBullet(scene, bullet.x, bullet.y, { id: bullet.id, group: this.bullets })
            }
        })
    }

    handlePlayerShoot(e) {
        const y = e.player.body.top + e.player.height / 2
        const bullet = this.objectFactory.createBullet(this, e.player.x, y, { owner: BulletOwner.PLAYER, direction: e.player.anims.currentAnim.key, group: this.bullets })
        console.log('Bullet: ', bullet.body.velocity)
        this.socket.emit(EventType.BULLET_CREATED, { x: bullet.x, y: bullet.y, id: bullet.id })
    }

    create() {
        this.player = null
        this.otherPlayers = this.physics.add.group()
        this.platforms = this.physics.add.staticGroup()
        this.stars = this.physics.add.group()
        this.bombs = this.physics.add.group()
        this.bullets = this.physics.add.group()

        // controls
        this.cursors = this.input.keyboard.createCursorKeys()//  Input Events
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)


        console.log('Create', this)
        this.bindEvents()

        this.fpsText = new FpsText(this)
        //  A simple background for our game
        this.add.image(400, 300, 'sky')

        // ground
        this.objectFactory.createPlatform(this, 400, 568, { name: 'platform', scale: 2, group: this.platforms }),
        //  Now let's create some ledges
        this.objectFactory.createPlatform(this, 600, 400, { name: 'platform', group: this.platforms }),
        this.objectFactory.createPlatform(this, 50, 250, { name: 'platform', group: this.platforms }),
        this.objectFactory.createPlatform(this, 750, 220, { name: 'platform', group: this.platforms })

        //  Input Events

        //  The score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

        // display the Phaser.VERSION
        this.add
        .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
            color: '#000000',
            fontSize: 24
        })
        .setOrigin(1, 0)
    }

    update() {
        this.fpsText.update()

        if (this.player && !this.gameOver) {
            this.player.update()
        }

        // emit bullet movement
        if (this.bullets) {
            this.bullets.getChildren().forEach(b => b.update())
        }
    }
}
