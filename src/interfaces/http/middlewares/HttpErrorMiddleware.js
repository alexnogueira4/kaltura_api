const { StatusCodes, getReasonPhrase } = require('http-status-codes');

module.exports = (errors, req, res, next) => {
    const { status_code, details } = errors

    errors = Array.isArray(details) ? details : [details]
    errors = errors.filter(e => e);
    
    const status = status_code ? StatusCodes[status_code] : StatusCodes.UNPROCESSABLE_ENTITY

    const response = {
        status: getReasonPhrase(status),
        status_code: status,
        errors
    }

    return res.status(status).json(response);
};