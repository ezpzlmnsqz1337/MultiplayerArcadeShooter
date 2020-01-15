import BulletType from '../types/BulletType'

export default class StandardWeapon {
    constructor() {          
        this.bulletType = BulletType.STANDARD
    }

    getBulletType() {
        return this.bulletType
    }
}