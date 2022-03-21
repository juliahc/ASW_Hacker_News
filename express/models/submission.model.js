// create submission schema
const SubmissionSchema = new global.Schema({
    title: { 
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
  
  const Submission = global.mongoose.model("Submission", SubmissionSchema);
  module.exports = Submission;