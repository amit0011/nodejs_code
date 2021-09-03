// later we need to remove below code
let response = {
    error: false,
    status: 200,
    data: null,
    userMessage: '',
    errors: null
};

// later we need to remove below code
const NullResponseValue = function() {
    response = {
        error: false,
        status: 200,
        data: null,
        userMessage: '',
        errors: null
    };
    return true;
};

const SendResponse = function(res, resObject) {
    const data = Object.assign({
        error: false,
        status: 200,
        data: null,
        userMessage: '',
        errors: null
    }, resObject);

    return res.status(data.status).send(data);
};

String.prototype.includeDayStartTime = function() {
    return this + 'T00:00:00.000Z';
};

String.prototype.includeDayEndTime = function() {
    return this + 'T23:59:59.999Z';
};

module.exports = {
    response,
    NullResponseValue,
    SendResponse
};
