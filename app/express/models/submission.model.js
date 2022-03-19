// create submission schema
const SubmissionSchema = new global.Schema({
    title: String,
    ponts: Number,
}, {
    timestamps: true
});
  
  const Submission = global.mongoose.model("Submission", SubmissionSchema);
  module.exports = Submission;