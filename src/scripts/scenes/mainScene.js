import ObjectFactory from '../factory/ObjectFactory'
import FpsText from '../objects/fpsText'
import EventType from '../types/EventType'

import io from 'socket.io-client'
import eventBus from '../EventBus'

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' })
        this.fpsText = null
        this.objectFactory = ObjectFactory.getInstance()

        // game objects
        this.player = this.physics.add.group()
        this.otherPlayers = this.this.physics.add.group()
        this.platforms = this.this.physics.add.staticGroup()
        this.stars = this.this.physics.add.group()
        this.bombs = this.this.physics.add.group()
        this.bullets = this.this.physics.add.group()

        // controls
        this.cursors = this.input.keyboard.createCursorKeys()//  Input Events
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        // network
        this.socket = null

        // game status
        this.gameOver = false
        this.scoreText = null
    }

    bindEvents(scene) {
        this.socket = io('http://malina:3000')
        this.socket.on('connect', () => console.log('connect'))
        this.socket.on('disconnect', () => console.log('disconnect'))

        this.socket.on('currentPlayers', e => this.handleCurrentPlayers(e))
        this.socket.on('player:connected', e => this.handlePlayerConnected(e))
        this.socket.on('player:disconnected', e => this.handlePlayerDisconnected(e))
        this.socket.on('player:moved', e => this.handlePlayerMoved(e))

        this.socket.on('currentBullets', e => this.handleCurrentBullets(e))

        eventBus.on(EventType.PLAYER_SHOOT, e => {
            const y = e.player.body.top + e.player.height / 2
            const bullet = this.objectFactory.addBullet(this, e.player.x, e.player.y, { bulletType: 'player', direction: e.player.anims.currentAnim.key })
            this.bullets.add(bullet)
            this.socket.emit('bullet:created', { x: bullet.x, y: bullet.y, id: bullet.id })
        })
    }

    handlePlayerConnected(e) {
        const playerInfo = e
        console.log('Player connected: ', playerInfo)
        const player = this.objectFactory.createPlayer(scene, playerInfo)
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
            const player = this.objectFactory.createPlayer(scene, players[id])
            if (players[id].playerId === this.socket.id) {
                this.player.add(player)
            } else {
                this.otherPlayers.add(player)
            }
        })
    }

    handlePlayerMoved(e) {
        const playerInfo = e
        this.otherPlayers.getChildren().forEach(x => {
            if (playerInfo.playerId === x.playerId) {
                x.setPosition(playerInfo.x, playerInfo.y)
                const loop = ['left', 'right'].includes(playerInfo.animation) ? true : false
                x.anims.play(playerInfo.animation, loop)
            }
        })
    }

    handleCurrentBullets(e) {
        const bullets = e
        Object.keys(bullets).forEach(bullet => {
            if (!this.bullets.getChildren().map(x => x.id).contains(bullet.id)) {
                this.objectFactory.addBullet(scene, bullet.x, bullet.y, { id: bullet.id })
            }
        })
    }

    create() {
        console.log('Create')
        this.bindEvents(this)

        this.fpsText = new FpsText(this)
        //  A simple background for our game
        this.add.image(400, 300, 'sky')

        // ground
        this.platforms.addMultiple([
            this.objectFactory.createPlatform(this, 400, 568, { name: 'platform', scale: 2 }),
            //  Now let's create some ledges
            this.objectFactory.createPlatform(this, 600, 400, { name: 'platform' }),
            this.objectFactory.createPlatform(this, 50, 250, { name: 'platform' }),
            this.objectFactory.createPlatform(this, 750, 220, { name: 'platform' })
        ])

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

        if (!this.player || this.gameOver) return
        this.player.update()

        // emit bullet movement
        if (!this.bullets) return

        this.bullets.getChildren().forEach(b => b.update())
    }
}
