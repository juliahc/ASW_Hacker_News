// create ask schema
const AskSchema = new global.Schema({
    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission"  
    },
    text: String
});
  
  const Ask = global.mongoose.model("Ask", AskSchema);
  module.exports = Ask;