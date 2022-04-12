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
    points: {
        type: Number,
        default: 0
    },
    submit: {
        ref: "Submission",
        type: Schema.Types.ObjectId,
        required: true
    },
    comments: [{
        ref: "Comment",
        type: String,
        default: []
    }]
}, {
    timestamps: true
});
  
  const Comment = global.mongoose.model("Comment", CommentSchema);
  module.exports = Comment;