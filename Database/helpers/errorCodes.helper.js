const errorCodes = {
    SUCCESS: 200,
    CONTENT_CREATED: 201,
    DATA_ALREADY_EXISTS: 202,
    DATA_NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    RESOURCE_NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    REQUIRED_PARAMETER_MISSING: 422,
    INTERNAL_SERVER_ERROR: 500,
    SYNTAX_ERROR: 502
}

module.exports = errorCodes