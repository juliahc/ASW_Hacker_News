// create apyKey schema
const ApiKeySchema = new global.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    }
});
  
  const ApiKey = global.mongoose.model("ApiKey", ApiKeySchema);
  module.exports = ApiKey;