const responseObj = {};
const errorCodes = require("../helpers/errorCodes.helper");

exports.validate = async function (request, response, next) {
    var validationHeader = request.headers["x-api-key"];
    if (validationHeader == "f4jaFD2jd8faASdn1h23jvsbhm43gssfASfaSDFqkj2hslkjfHDSFGji5yfdSFGhergkjsdmrew232huiaswdfuhi18bfw") {
        next();
    } else {
        responseObj.status  = errorCodes.UNAUTHORIZED;
        responseObj.message = "Missing licence key!";
        responseObj.data    = {};
        response.send(responseObj);
    }
}