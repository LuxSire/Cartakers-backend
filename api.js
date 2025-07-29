require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");
const crypto = require('crypto');
const { translateText } = require("./translation"); // Import the translation service
const axios = require("axios"); //  Import axios


const usersDboperations = require('./service/users/dboperations'); // Import the appropriate database operations module

const cron = require('node-cron');




const app = express();



// Middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Import your routes

const usersRouter = require('./routes/users');
const mailingRouter = require('./routes/mailing');
const objectsRouter = require('./routes/objects');
const aiRouter = require('./routes/ai');

// Existing routes

app.use('/api/users', usersRouter);
app.use('/api/mailing', mailingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/objects', objectsRouter);


// Generate Firebase Custom Token
app.post('/api/firebase/custom-token', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Generate the custom token without manually adding 'firebase'
        const customToken = await admin.auth().createCustomToken(userId);
      // console.log('Custom token generated for UID:', userId);
        res.status(200).json({ token: customToken });
    } catch (error) {
        console.error('Error generating custom token:', error);
        res.status(500).json({ error: 'Failed to generate custom token' });
    }
});



app.post('/api/firebase/send-push-notification', async (req, res) => {
    
    
    
    const { token, title, body, type, data, receiverLangCode } = req.body;


   // console.log('Push notification request:', req.body);

    if (!token || !title || !body || !type || !receiverLangCode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {



        var translatedTitle = title
        var translatedBody = body;



        if (type != "chat" ) {
                
            translatedTitle = await translateText(title, receiverLangCode);
            translatedBody =  await translateText(body, receiverLangCode);
          }

        let notificationData = {
            type: type, // Store type (e.g., chat, booking)
        };

        // If the notification is for chat, add chat-specific details
        if (type === "chat" && data) {
            notificationData = {
                ...notificationData,
                type: type,
                chatId: data.chatId?.toString(),
                senderId: data.senderId?.toString(),
                receiverId: data.receiverId?.toString(),
                receiverName: data.receiverName,
                receiverImage: data.receiverImage || "",
            };
        }  else {

            notificationData = {
                ...notificationData,
                type: type,
                itemId: data.itemId?.toString(),

            };


        }


        const message = {
            token: token,  // Use `token` for a single device
            notification: {
                title: translatedTitle,
                body: translatedBody,
            },
            android: {
                priority: "high",
            },
            data: notificationData, //  Pass different data based on type

            apns: {
                payload: {
                    aps: {
                        sound: "default",
                    },
                },
            },
        };
        const response = await admin.messaging().send(message);
     // console.log('Push notification response:', response);

        res.json({ success: true, response });
    } catch (error) {
      //  console.error(" Error sending push notification:", error);

        //  Handle expired or unregistered FCM token error
        if (error.code === 'messaging/registration-token-not-registered') {
          //  console.warn(" Invalid FCM token detected. Removing from database:", token);
            
            //  Remove token from your database (modify this function)

             await usersDboperations.deleteTenantDeviceToken(token);
    
        }
        res.status(500).json({ error: 'Failed to send push notification' });
    }
});






// Middleware to verify Firebase token
const authenticateFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ error: "Unauthorized - Token missing" });
    }

    const idToken = authHeader.split("Bearer ")[1]; // Extract ID token

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Attach user data to the request
        next(); // Pass control to the next middleware/route
    } catch (error) {
        console.error("Error verifying Firebase token:", error.message);
        return res.status(401).send({ error: "Unauthorized - Invalid token" });
    }
};

// Apply this middleware to protected routes
app.use("/api/protected", authenticateFirebaseToken, (req, res) => {
    res.send({ message: "This is a protected route", user: req.user });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ status: 'API is running' });
});


// Generate a random token
app.post('/api/generate-token', (req, res) => {
    const length = req.body.length || 16;
    const token = crypto.randomBytes(16).toString('hex'); // 32-character token
    res.json({ token });
});



async function testTranslation() {
    const originalText = "Hello, how are you?";
    const targetLang = "fr"; // Translate to French

    const translatedText = await translateText(originalText, targetLang);
    console.log("🔹 Translated Text:", translatedText);
}


// */5 * * * * → Every 5 minutes
// */1 * * * * → Every minute (for debugging)
// Schedule a job to run every hour
// cron.schedule('*/1 * * * *', () => {
//     console.log('Running the cron job: Checking for upcoming bookings...');
    
//     // This is where we'll later add logic to check bookings and send notifications
// });
// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
    //console.log('Checking for reminders...');
  //  checkAndSendBookingReminders();
});



async function checkAndSendBookingReminders() {
    try {
    //    console.log("Checking for upcoming bookings...");
        
       // Get all upcoming bookings
       const response = await usersDboperations.getTenantUpcomingBookingsReminders();
        
       // Extract actual data array
       const bookings = response.data; // <-- Extract the array

     //  console.log("Upcoming bookings:", bookings);

       if (!Array.isArray(bookings)) {
           throw new Error("Expected an array but got something else.");
       }

       var listEmails = [];

       // Loop through each booking and check if a reminder should be sent
       for (const booking of bookings) {
           const { booking_id, tenant_id, date, start_time, end_time, title, device_token, lang, email} = booking;



        
         
       //    console.log("Checking booking:", booking_id, tenant_id, date, start_time, end_time, title, device_token);

            const pushPayload = {
                token: device_token,
                title: `Booking Reminder: ${title}`, // Ensure correct title
                body: `Tomorrow at ${start_time.substring(0, 5)} - ${end_time.substring(0, 5)}`, // Ensure message is included
                type: 'booking', // Ensure type is correctly mapped
                data: { itemId: booking_id }, // Ensure item_id is included
                receiverLangCode: lang // Ensure language is passed for translation
            };

            //    console.log(` Push notification request:`, pushPayload);

            try {
       
                if (process.env.NODE_ENV === 'development') {
                    console.log('Push notification request DEV');

                //    const response = await axios.post(
                  //      `${process.env.BASE_URL}api/firebase/send-push-notification`,
                    //    pushPayload
                  //  );
                } else {
                    console.log('Push notification request PROD');

                    const response = await axios.post(
                        `${process.env.BASE_URL_PROD}api/firebase/send-push-notification`,
                        pushPayload
                    );

                }

            }

            catch (error) {
                console.error("Error sending push notification:", error);
            }


               // add email to list if not already there

               if (listEmails.indexOf(email) == -1) {
                        listEmails.push(email);



                        // formate date to dd.mm.yyyy


                          // Ensure `date` is a valid Date object and format it correctly
                          var formattedDate = '';
                        if (date instanceof Date) {
                            const day = String(date.getDate()).padStart(2, '0'); // Ensures two-digit day
                            const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensures two-digit month (Months are 0-based)
                            const year = date.getFullYear();

                            formattedDate = `${day}.${month}.${year}`; // Formats as dd.MM.yyyy
                        }


                        // translate subject  and body

                        const translatedType = await translateText(title, lang);
                        const translatedGreetings = await translateText('Hello,', lang);
                        const translatedBody = await translateText(`You have a booking tomorrow.`, lang);
                        const translatedSubject = await translateText(`Booking Reminder: ${translatedType} | ${formattedDate} (${start_time.substring(0, 5)} - ${end_time.substring(0, 5)}) `, lang);
                        const translatedAvailableOn = await translateText(`Available on:`, lang);
                        const translatedHelpText = await translateText(`Help?`, lang);  
                        const translatedSupport = await translateText(`Support`, lang);

                        const emailPayload = {
                            email: email,
                            greetings: translatedGreetings,
                            body_text: translatedBody,
                            body2_title_text: translatedType,
                            body2_text: `${start_time.substring(0, 5)} - ${end_time.substring(0, 5)}`,
                            available_on_text: translatedAvailableOn,
                            help_text: translatedHelpText,
                            support_text: translatedSupport,
                            subject: translatedSubject
                        };

                        try {
                     

                            if (process.env.NODE_ENV === 'development') {
                                console.log('Push notification request DEV');
        
                              //  const response = await axios.post(
                                //    `${process.env.BASE_URL}api/mailing/email-tenant-booking-reminder`,
                                  //  emailPayload
                              //  );
                            } else {
                                console.log('Push notification request PROD');
        
                                const response = await axios.post(
                                    `${process.env.BASE_URL_PROD}api/mailing/email-user-booking-reminder`,
                                    emailPayload
                                );
        
                            }
                         
                        }

                        catch (error) {
                            console.error("Error sending email reminder:", error);
                        }

                
                }


                try {
                      // update reminder sent
                    const response = await usersDboperations.updateBookingReminderSent(booking_id);
                    console.log("Reminder sent:", response);
                    
                } catch (error) {
                    console.error("Error sending email reminder:", error
                    );
                    
                }

              


        }

      
 
    } catch (error) {
        console.error("Error checking/updating reminders:", error);
    }
}

async function testMethod() {

  //  const response = await usersDboperations.updateBookingReminderSent(83);
  //  console.log("Reminder sent:", response);

    const response = await usersDboperations.getTenantUpcomingBookingsReminders();
    console.log("Upcoming bookings:", response);

    
}



// version v.1.0.6

console.log('NODE_ENV:', process.env.NODE_ENV); //  Debugging



// Start the server
const port = process.env.PORT || 8090;
app.listen(port, () => console.log(`XM Server v.1.0.1 running on port ${port}`));


//testTranslation(); // Test the translation service