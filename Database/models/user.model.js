// create users schema
const UsersSchema = new global.Schema({
    username: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: true
    },
    karma: {
        type: Number,
        default: 1
    },
    about: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    showdead: {
        type: Boolean,
        default: false
    },
    noprocrast: {
        type:Boolean,
        default: false
    },
    maxvisit: {
        type: Number,
        default: 20
    },
    minaway: {
        type: Number,
        default: 180
    },
    delay: {
        type: Number,
        default: 0
    },
    upvotedSubmissions: [{
        ref: "Submission",
        type: Schema.Types.ObjectId,
        default: []
    }],
    upvotedComments: [{
        ref: "Comment",
        type: Schema.Types.ObjectId,
        default: []
    }],
    favouriteSubmissions: [{
        ref: "Submission",
        type: Schema.Types.ObjectId,
        default: []
    }],
    favouriteComments: [{
        ref: "Comment",
        type: Schema.Types.ObjectId,
        default: []
    }],
}, {
    timestamps: true
});
  
  const Users = global.mongoose.model("User", UsersSchema);
  module.exports = Users;