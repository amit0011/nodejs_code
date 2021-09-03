const mongoose = require('mongoose');
const session = require('@ag-libs/session');
const fxContractNote = mongoose.model('fxContractNote');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/fxContractNote')
        .post(session.adminCheckToken, methods.add)
        .get(session.adminCheckToken, methods.list);
};

methods.add = async function(req, res) {
    let obj = {
        createdBy: req.admin._id,
        message: req.body.message,
        contractId: req.body.contractId
    };
    let data = await (new fxContractNote(obj)).save();

    data = await fxContractNote.findById(data._id)
        .select("message createdBy createdAt")
        .populate('createdBy', 'fullName');

    SendResponse(res, {data, userMessage: 'List'});
};

methods.list = async (req, res) => {
    let data = await fxContractNote.find({
            createdBy: req.admin._id,
            contractId: req.query.contractId,
            status: 0
        })
        .select("message createdBy createdAt")
        .populate('createdBy', 'fullName');

    SendResponse(res, {data, userMessage: 'List'});
};
