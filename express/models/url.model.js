// create url schema
const UrlSchema = new global.Schema({
    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission"  
    },
    url: {
      type: String,
      required: true
    }
});
  
  const Url = global.mongoose.model("Url", UrlSchema);
  module.exports = Url;