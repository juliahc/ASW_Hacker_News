// create users schema
const UsersSchema = new global.Schema({
    name: String,
    password: String,
    karma: Number,
    about: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    showDead: {
        type: Boolean,
        default: false
    },
    noprocrast: {
        type:Boolean,
        default: false
    },
    maxvisit: Number,
    minaway: Number,
    delay: Number
}, {
    timestamps: true
});
  
  const Users = global.mongoose.model("User", UsersSchema);
  module.exports = Users;