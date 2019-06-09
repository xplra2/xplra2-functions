const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const twilio = require('twilio');

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const accountSid = 'AC3efdbe7f99ddfeeb0f45d77170e8e7f8'; // firebaseConfig.twilio.sid;
const authToken  = '5cce7e865798547e60e635f4713d5dd3'; // firebaseConfig.twilio.token;

const client = new twilio(accountSid, authToken);

const twilioNumber = '+17344283577'; // your twilio phone number


/// start cloud function

exports.textStatus = functions.database
       .ref('/orders/{orderKey}/status')
       .onUpdate(event => {


    const orderKey = event.params.orderKey

    return admin.database()
                .ref(`/orders/${orderKey}`)
                .once('value')
                .then(snapshot => snapshot.val())
                .then(order => {
                    const status      = order.status
                    const phoneNumber = order.phoneNumber

                    if ( !validE164(phoneNumber) ) {
                        throw new Error('number must be E164 format!')
                    }

                    const textMessage = {
                        body: `Current order status: ${status}`,
                        to: phoneNumber,  // Text to this number
                        from: twilioNumber // From a valid Twilio number
                    }

                    return client.messages.create(textMessage)
                })
                .then(message => console.log(message.sid, 'success'))
                .catch(err => console.log(err))


});


/// Validate E164 format
function validE164(num) {
    return /^\+?[1-9]\d{1,14}$/.test(num)
}