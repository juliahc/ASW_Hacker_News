class User {
    
    constructor(params) {
        if (!params.hasOwnProperty('createdAt')) { return this.constructDefault(params.googleId, params.username, params.email) }
        this.googleId = params.googleId;
        this.username = params.username;
        this.createdAt = params.createdAt;
        this.karma = params.karma;
        this.about = params.about;
        this.email = params.email;
        this.showdead = params.showdead;
        this.noprocrast = params.noprocrast;
        this.maxvisit = params.maxvisit;
        this.minaway = params.minaway;
        this.delay = params.delay;
    }

    constructDefault(googleId, username, email) {
        this.googleId = googleId;
        this.username = username;
        this.createdAt = Date.now();
        this.karma = 1;
        this.about = "";
        this.email = email;
        this.showdead = false;
        this.noprocrast = false;
        this.maxvisit = 20;
        this.minaway = 180;
        this.delay = 0;
    }
    
}

module.exports = User;