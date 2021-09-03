var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Campaign = mongoose.model('campaign');
const Grower = mongoose.model("grower");
var Phone = mongoose.model('phoneNote');
var notifications = require('@ag-libs/function');
const { SendResponse } = require("@ag-common");
const moment = require('moment');

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/compaign/add')
        .post(session.adminCheckToken, methods.add);
};

/*========================
***   addPhoneJson  ***
==========================*/
methods.add = function(req, res) {

    req.checkBody('to', 'to is required.').notEmpty();
    req.checkBody('subject', 'subject is required.').notEmpty();
    req.checkBody('mailBody', 'mailBody is required.').notEmpty();
    req.checkBody('recordType', 'recordType is required.').notEmpty();
    req.checkBody('growersEmails', 'growersEmails is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        if (req.body.growersEmails.length && req.body.to.length) {
            var bcc = [];
            if (process.env.SEND_QUOTE_MAIL == 'true' && process.env.LIVE_SERVER == 'true') {
                bcc = req.body.growersEmails;
            } else {
                if (req.body.to.indexOf('achinlalit@gmail.com') == -1) {
                    bcc.push('achinlalit@gmail.com');
                }
            }

            notifications.send_Mail_with_attachment({
                to: req.body.to,
                bcc: bcc,
                subject: req.body.subject,
                body: req.body.mailBody,
                attachments: req.body.attachments
            }, async function(err, success) {
                if (err) {
                    return SendResponse(res, { error: true, status: err.code, errors: err.message, userMessage: err });
                } else {
                    await Campaign.create({
                        to: req.body.to,
                        bcc: bcc,
                        subject: req.body.subject,
                        createdBy: req.admin._id,
                        mailBody: req.body.mailBody,
                        recordType: req.body.recordType,
                        attachments: req.body.attachments,
                        mailSend: true
                    });

                    if (bcc === req.body.growersEmails) {
                      const growers = await Grower.find({email: {$in: req.body.growersEmails}}).lean();
                      const phoneNotes = growers.map(grower => ({
                        createdBy: req.admin._id,
                        status: 0,
                        createdAt: Date.now(),
                        message: `Email with subject "${req.body.subject}" was sent by "${req.admin.fullName}" at ${moment().format('YYYY-MM-DD HH:mm')}`,
                        growerId: grower._id
                      }));

                      await Phone.insertMany(phoneNotes);
                    }

                    return SendResponse(res, { userMessage: 'Saved' });
                }
            });
        } else {
            return SendResponse(res, { error: true, status: 400, errors: null, userMessage: 'Invalid request' });
        }
    }
};
