// create submission schema
const SubmissionSchema = new global.Schema({
    title: { 
        type: String,
        required: true
    },
    googleId: {
        type: String,
        ref: "User",
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
    type: {
        type: String,
        enum: ["url", "ask"],
        required: true
    },
    comments: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
  
  const Submission = global.mongoose.model("Submission", SubmissionSchema);
  module.exports = Submission;