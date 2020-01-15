export default class IDProvider {

    constructor() {
        this.id = 0
    }

    static getId(socket, type) {
        this.id++
        return socket.id + '|' + btoa(`${type}|${this.id}`)
    }
}