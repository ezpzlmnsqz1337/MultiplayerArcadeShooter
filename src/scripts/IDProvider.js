export default class IDProvider {

    constructor() {
        this.id = 0
    }

    static getId(type) {
        this.id++
        return btoa(`${type}|${this.id}`)
    }
}