class User {
    
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.createdAt = Date;
        this.karma = 1;
        this.about = [];
        this.email = [];
        this.showdead = Boolean;
        this.noprocrast = Boolean;
        this.maxvisit = 20;
        this.minaway = 180;
        this.delay = 0;
    }
    
}

module.exports = User;