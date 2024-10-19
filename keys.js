class Keys {
    constructor() {
        this.keys_down = {}
    }

    static start_listening() {
        let keys = new Keys(); 

        addEventListener('keydown', function(ev) {
            if (typeof ev.code === 'string') {
                keys.keys_down[ev.code] = true; 
            }
        })

        addEventListener('keyup', function(ev) {
            if (typeof ev.code === 'string') {
                keys.keys_down[ev.code] = false; 
            }
        })

        return keys; 
    }

    iskeyDown(code) {
        return !!this.keys_down[code]; 
    }

    iskeyUp(code) {
        return !this.keys_down[code]; 
    }

    // Iterate over keys that are currently down
    keysdownList() {
        return Object.entries(this.keys_down)
               .filter(kv=> kv[1])
               .map(kv=> kv[0])
    }
}