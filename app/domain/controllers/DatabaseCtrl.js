const axios = require("axios");
const errCodes = require("../../utils/errorCodes.js");

let DatabaseCtrl;
(function() {
    let instance;
    DatabaseCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.DB_URI = "http://localhost:2000/v1";
        this.errors = errCodes;
    };
}());


DatabaseCtrl.prototype.postRequest = async function (endpoint, params) {
    let res = {};
    await axios({
        method: 'post',
        url: this.DB_URI + endpoint,
        data: {
            params
        },
        headers: {
            "x-api-key": process.env.DB_SECRET_KEY
        }
      })
      .then(response => {
          res = response.data;
      })
      .catch(err => {
          throw Error(err.code);
      })
    return res;
}
//getRequest("/submission_page", {p: page, t: type, o: order});
DatabaseCtrl.prototype.getRequest = async function (endpoint, query) {
    let res = {};
    await axios({
        method: 'get',
        url: this.DB_URI + endpoint,
        params: query,
        headers: {
            "x-api-key": process.env.DB_SECRET_KEY
        }
      })
      .then(response => {
          res = response.data;
      })
      .catch(err => {
        throw Error(err.code);
      })
    return res;
}

module.exports = DatabaseCtrl;