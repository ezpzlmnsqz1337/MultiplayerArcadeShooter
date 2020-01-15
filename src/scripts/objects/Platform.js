import ObjectType from '../types/ObjectType'
import AbstractImage from './AbstractImage'

export default class Platform extends AbstractImage {
    constructor(scene, x, y, opts) {
        super(scene, x, y, 'platform', ObjectType.PLATFORM, opts)

        setTimeout(() => this.refreshBody(), 500)        
    }

    update() {

    }
}