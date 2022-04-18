// create comment schema
const CommentSchema = new global.Schema({
    text: {
      type: String,
      required: true
    },
    author: {
        ref: "User",
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    parent: {
        ref: "Comment",
        type: Schema.Types.ObjectId,
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