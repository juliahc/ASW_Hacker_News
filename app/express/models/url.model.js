// create url schema
const UrlSchema = new global.Schema({
    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission"  
    },
    url: String
}, {
    timestamps: true
});
  
  const Url = global.mongoose.model("Url", UrlSchema);
  module.exports = Url;