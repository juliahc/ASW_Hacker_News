// create submission schema
const SubmissionSchema = new global.Schema({
    title: { 
        type: String,
        required: true
    },
    author: {
        type: String,
        ref: "User",
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ["url", "ask"],
        required: true
    },
    comments: [{
        ref: "Comment",
        type: Schema.Types.ObjectId,
        default: []
    }]
}, {
    timestamps: true
});
  
  const Submission = global.mongoose.model("Submission", SubmissionSchema);
  module.exports = Submission;