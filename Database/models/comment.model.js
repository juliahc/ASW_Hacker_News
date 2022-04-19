// create comment schema
const CommentSchema = new global.Schema({
    text: {
      type: String,
      required: true
    },
    googleId: {
        ref: "User",
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    submission: {
        ref: "Submission",
        type: Schema.Types.ObjectId,
        required: true
    },
    parent: {
        ref: "Comment",
        type: Schema.Types.ObjectId,
        default: null
    },
    replies: [{
        ref: "Comment",
        type: Schema.Types.ObjectId,
        default: []
    }]
}, {
    timestamps: true
});
  
  const Comment = global.mongoose.model("Comment", CommentSchema);
  module.exports = Comment;