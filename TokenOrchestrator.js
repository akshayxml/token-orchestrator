const { v4: uuidv4 } = require('uuid');
const KEEP_ALIVE_TIME = 5 * 60 * 1000;
const UNBLOCKER_TIME = 60 * 1000;

class TokenOrchestrator {
    constructor() {
        this._keysMetadata = {}
        this._idToKeyMap = {}
        this._availableKeyCount = 0
        this._blockedKeys = new Set()
        setInterval(this.checkBlockedKeys.bind(this), 5000);
    }

    generateKeys(){
        let key = uuidv4();
        let keyMetadata = {};
        keyMetadata["createdAt"] = Date.now();
        keyMetadata["id"] = ++this._availableKeyCount;
        keyMetadata["keepAliveTimerStart"] = 0;
        this._keysMetadata[key] = keyMetadata;
        this._idToKeyMap[this._availableKeyCount] = key;
        console.log(this._keysMetadata)
        console.log(this._idToKeyMap)
        return key;
    }

    getKey(){
        if(this._availableKeyCount === 0)
            return "";
        let randomId = Math.floor((Math.random() * this._availableKeyCount) + 1);
        let keyAtRandomId = this._idToKeyMap[randomId];

        // swap key at random id with key at last id
        this.swapKeys(randomId, this._availableKeyCount)
        this._availableKeyCount--;
        this._keysMetadata[keyAtRandomId]["assignedAt"] = Date.now();
        this._blockedKeys.add(keyAtRandomId);

        console.log(this._keysMetadata);
        console.log(this._idToKeyMap);
        return keyAtRandomId;
    }

    getDetails(key){
        if(key in this._keysMetadata)
            return "Created At = " + this._keysMetadata[key]["createdAt"] + " | " + "Assigned At = " + this._keysMetadata[key]["assignedAt"]
        else
            return "No data for the key"
    }

    deleteKey(key){
        if(key in this._keysMetadata){
            if((Date.now() - this._keysMetadata[key]["keepAliveTimerStart"]) <= KEEP_ALIVE_TIME){
                return "Delete failed, keep alive is set for this key"
            }
            let keyId = this._keysMetadata[key]["id"];
            if(keyId <= this._availableKeyCount){
                this.swapKeys(keyId, this._availableKeyCount);
                this._availableKeyCount--;
            }
            delete this._keysMetadata[key];
            delete this._idToKeyMap[keyId];
            this._blockedKeys.delete(key);
            console.log(this._keysMetadata);
            console.log(this._idToKeyMap);
            return "Key deleted"
        }
        else{
            return "Key not present";
        }
    }

    unblockKey(key){
        if(key in this._keysMetadata){
            this._keysMetadata[key]["assignedAt"] = 0;
            this._keysMetadata["id"] = ++this._availableKeyCount;
            this._keysMetadata["keepAliveTimerStart"] = 0;
            this._idToKeyMap[this._availableKeyCount] = key;
            this._blockedKeys.delete(key);
            console.log(this._keysMetadata);
            console.log(this._idToKeyMap);
            return "Key unblocked"
        }
        else{
            return "Key not found"
        }
    }

    keepAlive(key){
        if(key in this._keysMetadata){
            this._keysMetadata["keepAliveTimerStart"] = Date.now();
        }
    }

    swapKeys(firstId, secondId){
        if(firstId === secondId)
            return;
        let keyAtSecondId = this._idToKeyMap[secondId];
        let keyAtFirstId = this._idToKeyMap[firstId];
        this._keysMetadata[keyAtFirstId]["id"] = secondId;
        this._keysMetadata[keyAtSecondId]["id"] = firstId;
        this._idToKeyMap[firstId] = keyAtSecondId;
        this._idToKeyMap[secondId] = keyAtFirstId;
    }

    checkBlockedKeys(){
        if(this._blockedKeys !== undefined){
            let keysToUnblock = []
            this._blockedKeys.forEach(blockedKey => {
                if((Date.now() - this._keysMetadata[blockedKey]["assignedAt"]) > UNBLOCKER_TIME){
                    keysToUnblock.push(blockedKey);
                }
            });
            keysToUnblock.forEach(key => {
                this.unblockKey(key);
            });
        }
    }
}

module.exports = TokenOrchestrator