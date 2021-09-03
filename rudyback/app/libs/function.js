var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "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");
var Mailgen = require('mailgen');

var actions = {};
// Configure mailgen by setting a theme and your product info
var mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
        // Appears in header & footer of e-mails
        name: 'Rudy Agro Ltd',
        link: 'https://www.rudyagro.ca/',
        // Optional logo
        logo: 'http://erp.rudyagro.ca/assets/images/rudyLogo2.png'
    }
});

actions.forgotPassword = function(data) {
    var email = {
        body: {
            greeting: 'Dear',
            name: data.name,
            intro: `We received a request to reset your password on the agriculture application.`,
            action: {
                instructions: 'To reset your password, please click on the following link',
                button: {
                    color: '#3698d1', // Optional action button color
                    text: 'Reset Password',
                    link: data.link
                }
            },
            outro: 'This is a system generated email. Please do not reply to this mail id.',
            signature: 'Regards'
        }
    };
    return mailGenerator.generate(email);
};

actions.pdf = function(data) {
    var intro = null;
    let type = data.type.toLowerCase();
    let action = null;


    if (type == 'quote') {
        intro = 'Please view the quote in attachment';
    } else {
        intro = 'Please click the link below to view the elevator receipt(s) for your recently delivered product';
        action = {
            instructions: `To view your ${data.type}, please click on the following link`,
            button: {
                color: '#3698d1', // Optional action button color
                text: 'View ' + data.type,
                link: data.link
            }
        };
    }

    var email = {
        body: {
            greeting: 'Hello ',
            name: data.name,
            intro,
            action,
            outro: 'This email is automatically generated, please do not reply.',
            signature: 'Regards'
        }
    };
    return mailGenerator.generate(email);
};

module.exports = {
    "mail": function(newemail, password) {
        const msg = {
            to: newemail,
            from: 'no-reply@rudyagro.ca',
            subject: 'Your Password',
            text: 'This is new password ' + password,
            html: 'This is new password ' + password,
        };
        sgMail.send(msg, function(err, res) {
            if (err) {
                console.log('err---', err);
            } else {
                console.log('res---', res);
            }
        });
    },
    sendMail: function(message, body) {

        const mailOption = {
            from: 'no-reply@rudyagro.ca',
            to: message.email,
            subject: message.subject,
            generateTextFromHTML: true,
            text: body,
            html: body
        };

        if (message.attachments) {
            mailOption.attachments = message.attachments;
        }

        if (message.bcc && message.bcc.length) {
            mailOption['bcc'] = message.bcc;
        }
        sgMail.send(mailOption, function(err) {
            if (err) {
                console.log('err---', err);
            } else {
                console.log('Mail sent')
            }
        });
    },

    send_Mail: function(email, subject, body) {
        console.log('email----', email);
        const mailOption = {
            from: 'no-reply@rudyagro.ca',
            to: email,
            subject: subject,
            generateTextFromHTML: true,
            text: body,
            html: body
        };
        sgMail.send(mailOption, function(err) {
            if (err) {
                console.log('err---', err);
            } else {
                console.log('Mail sent ==>' + email);
            }
        });
    },
    send_mail_with_attachments: function(data, callback) {
        const mailOption = {
            from: 'no-reply@rudyagro.ca',
            to: data.to,
            bcc: data.bcc,
            subject: data.subject,
            generateTextFromHTML: true,
            text: data.body,
            attachments: data.attachments,
            html: data.body
        };

        sgMail
            .send(mailOption)
            .then(() => {
                console.log("mail send" + data.to, data.bcc);
                callback(null, "success");
            })
            .catch(error => {
                console.log(error);
                const {
                    message,
                    code
                } = error;
                callback({
                    message,
                    code
                }, null);
            });
    },
    createMail: function(message, action) {
        if (actions[action]) {
            this.sendMail(message, actions[action](message), function(err) {
                console.log('error in email sending ', err);
            });
        }
    },
    sendCustomMail: function(message) {
        this.send_Mail(message.email, message.subject, message.body, function(err) {
            console.log('error in email sending ', err);
        });
    },

    send_Mail_with_attachment: function(message, callback) {
        this.send_mail_with_attachments(message, callback, function(err) {
            console.log('error in email sending ', err);
        });
    },

    sendBagInventoryMail(bags) {
      let mailBody = mailGenerator.generate({
        body: {
          greeting: 'Hello',
          intro: 'This mail is to notify you about low stock bag inventory.',
          table: {
            data: bags.map(({name, bulkBag, bagCount}) => ({name, type: bulkBag, count: bagCount}))
          },
          outro: 'This email is automatically generated, please do not reply.',
          signature: 'Regards'
        }
      });

      const mailOption = {
        from: 'no-reply@rudyagro.ca',
          to: 'tulsiram.sunrise@gmail.com',
          // bcc: ['achinlalit@gmail.com'],
          subject: 'Rudy Agro Inventory Alert',
          generateTextFromHTML: true,
          text: mailBody,
          html: mailBody
      };

      sgMail.send(mailOption, function(err) {
        if (err) {
          console.log('Error: -- ', err);
        } else {
          console.log('Mail sent ==> BagInventory Alert');
        }
      });
    },
};
