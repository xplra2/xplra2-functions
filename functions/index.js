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

exports.textStatus = functions.firestore
       .document('/streetpark/{streetparkId}')
       .onUpdate((change,context) => {


    const orderKey = context.params.streetparkId;
    const before = change.before;
    const after = change.after;
    console.log('textStatus', orderKey);


    return admin.firestore()
                .collection('streetpark')
                .doc(orderKey)
                .get()
                .then(order => {
                    const oldStatus   = before.data().Expired;
                    const newStatus   = order.data().Expired;
                    const phoneNumber = order.data().PhoneNumber;
                    const spotNumber  = order.data().Number;

				    console.log('oldStatus', oldStatus);
				    console.log('newStatus', newStatus);
				    console.log('phoneNumber', phoneNumber);
				    console.log('spotNumber', spotNumber);

                    if ( !validE164(phoneNumber) ) {
                        throw new Error('number must be E164 format!')
                    }

                    if (!oldStatus && newStatus) {

					    console.log('expired!', spotNumber);

	                    const textMessage = {
	                        body: `Your parking spot ${spotNumber} has expired!`,
	                        to: phoneNumber,  // Text to this number
	                        from: twilioNumber // From a valid Twilio number
	                    }

	                    return client.messages.create(textMessage)

                    }
                })
                .then(message => {

					if (typeof message === "undefined") {
	                	console.log('success - no message sent');
					} else {
	                	console.log(message.sid, 'success - message sent');
					}

                })
                .catch(err => console.log(err))


});


/// Validate E164 format
function validE164(num) {
    return /^\+?[1-9]\d{1,14}$/.test(num)
}