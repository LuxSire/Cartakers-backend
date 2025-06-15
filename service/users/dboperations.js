require('dotenv').config();

const pool = require('../dbconfig'); // Ensure this exports the mysql2/promise pool
const { hashPassword, verifyPassword, generateSalt } = require('../bcrypt');
const { post } = require('request');
const axios = require("axios"); //  Import axios





//// start flutter calls 

async function validateUserInvitationToken(token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.validate_user_invitation_token(?)`,
            [token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Token validation successful" : "Invalid token",
            data: data
        };
    } catch (error) {
        console.error('Error in validateUserInvitationToken:', error);
        return {
            success: false,
            message: "Failed to validate token due to a database error",
            data: null
        };
    }
}


async function validateCompanyInvitationToken(token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.validate_company_invitation_token(?)`,
            [token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Company Token validation successful" : "Company Invalid token",
            data: data
        };
    } catch (error) {
        console.error('Error in validateCompanyInvitationToken:', error);
        return {
            success: false,
            message: "Failed to validate company token due to a database error",
            data: null
        };
    }
}

async function registerUser(user) {
    try {
        const { id, email, first_name, last_name, phone, country, password } = user;

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.register_update_user(?,?,?,?,?,?,?)`,
            [email, password, first_name, last_name, phone, country, id]
        );
        
        // Fix: Ensure that only the first item is returned
        const data = Array.isArray(result) && result.length > 0 ? result[0][0] : null;

        return {
            success: !!data, // True if data exists
            message: data ? "User registered successfully" : "Failed to register user",
            data: data ?? {} // Return an empty object if no data exists
        };
    } catch (error) {
        console.error('Error in registerUser:', error);
        return {
            success: false,
            message: "Failed to register user due to a database error",
            data: null
        };
    }
}

async function registerCompany(company) {
    try {

      //  console.log('registerAgent:', agent);
        const {  id, name, user,phone,country } = company;

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.register_update_company(?,?,?,?,?)`,
            [ name,user, phone, country, id]
        );

        // Fix: Ensure that only the first item is returned
        const data = Array.isArray(result) && result.length > 0 ? result[0][0] : null;

        return {
            success: !!data, // True if data exists
            message: data ? "Company registered successfully" : "Failed to register company",
            data: data ?? {} // Return an empty object if no data exists
        };
    } catch (error) {
        console.error('Error in register Company:', error);
        return {
            success: false,
            message: "Failed to register company due to a database error",
            data: null
        };
    }
}



async function loginUser(user) {
    try {
        const { email, password } = user;

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.login_user(?,?)`,
            [email, password]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Login successful" : "Invalid email or password",
            data: data
        };
    } catch (error) {
        console.error('Error in login user:', error);
        return {
            success: false,
            message: "Failed to log in due to a database error",
            data: null
        };
    }
}

async function getUserByEmail(email) {
    try {

         //console.log('getTenantByEmail:', email);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_by_email(?)`,
            [email]
        );



        const data = result[0] || [];

       // console.log('getTenantByEmail:', data);
        return {
            success: data.length > 0,
            message: data.length > 0 ? "User found" : "User not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        return {
            success: false,
            message: "Failed to retrieve user due to a database error",
            data: null
        };
    }
}

async function getCompanyByEmail(email) {
    try {

         //console.log('getTenantByEmail:', email);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_company_by_email(?)`,
            [email]
        );



        const data = result[0] || [];

        return {
            success: data.length > 0,
            message: data.length > 0 ? "Agent found" : "Agent not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getAgentByEmail:', error);
        return {
            success: false,
            message: "Failed to retrieve agent due to a database error",
            data: null
        };
    }
}



async function getUserById(id) {
    try {

        // console.log('getTenantById:', id);


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_by_id(?)`,
            [id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "User found" : "User not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getUserById:', error);
        return {
            success: false,
            message: "Failed to retrieve user by id due to a database error",
            data: null
        };
    }
}


async function getCompanyById(id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_company_by_id(?)`,
            [id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Company found" : "Company not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getcompanyById:', error);
        return {
            success: false,
            message: "Failed to retrieve company by id due to a database error",
            data: null
        };
    }
}

async function getUserUpcomingBooking(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_upcoming_booking(?)`,
            [contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Upcoming booking retrieved" : "No upcoming bookings found",
            data: data
        };
    } catch (error) {
        console.error('Error in getUserUpcomingBooking:', error);
        return {
            success: false,
            message: "Failed to retrieve upcoming booking due to a database error",
            data: null
        };
    }
}

async function createUserObjectRequest(request_id, tenant_id, unit_id, description,
    building_id, agency_id, contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_user_object_request(?,?,?,?,?,?,?)`,
            [request_id, tenant_id, unit_id, description, building_id, agency_id, contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Object request created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createUserObjectRequest:', error);
        return {
            success: false,
            message: "Failed to create object request due to a database error",
            data: null
        };
    }
}

async function createUserObjectRequestLog(request_id, status, description, processed_by_id, processed_by_type) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_user_object_request_log(?,?,?,?,?)`,
            [request_id, status, description, processed_by_id, processed_by_type]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Object request log created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createUserObjectRequestLog:', error);
        return {
            success: false,
            message: "Failed to create request log due to a database error",
            data: null
        };
    }
}


async function getUserObjectRequests(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_object_requests(?)`,
            [object_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Requests retrieved successfully" : "No requests found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getUserObjectRequests:', error);
        return {
            success: false,
            message: "Failed to retrieve requests due to a database error",
            data: []
        };
    }
}



async function createUserObjectPost(object_id, creator_id, title, isReceivePrivateMessage, description, creator_type) {
    try {

       // console.log('createTenantBuildingPost:', building_id, creator_id, title, isReceivePrivateMessage, description, creator_type);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_object_post(?,?,?,?,?,?)`,
            [object_id, creator_id, title, isReceivePrivateMessage, description, creator_type]
        );
        

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createUserObjectPost:', error);
        return {
            success: false,
            message: "Failed to create object post due to a database error",
            data: null
        };
    }
}


async function createUserObjectPostMedia(post_id, media_url) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_user_object_post_media(?,?)`,
            [post_id, media_url]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Post media uploaded successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createUserObjectPostMedia:', error);
        return {
            success: false,
            message: "Failed to upload post media due to a database error",
            data: null
        };
    }
}

async function createUserObjectPostComment(post_id, creator_id, creator_type, description, post_owner_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_object_post_comment(?,?,?,?)`,
            [post_id, creator_id, creator_type, description]
        );

        const data = result[0] || [];


     //  const item_id = data[0].id;

     const item_id = post_id;







        if (post_owner_id !== creator_id) {
            // send push notification to post owner



            const creatorResponse = await getTenantById(creator_id);

            const creatorName = creatorResponse.data[0].display_name;

            const [tokens] = await pool.execute(
                `CALL ${process.env['DB_DATABASE']}.get_user_device_tokens(?)`,
                [post_owner_id]
            );

            //  console.log('creatorName:', creatorName);
            //    console.log('post_owner_id:', post_owner_id);
            let notificationType = "comment";
            let notificationTitle = "New Comment";
            let message = `${creatorName} commented on your post: ${description}`;

            //   Call stored procedure to create notifications
            const [rows] = await pool.execute(
                `CALL ${process.env['DB_DATABASE']}.create_user_notification(?,?,?,?)`,
                [post_owner_id, 3, message, item_id]
            );


            for (const tokenData of tokens[0]) {
                const { device_token, display_name, lang } = tokenData;


                //  Step 5: Send API request to `/api/firebase/send-push-notification`
                const pushPayload = {
                    token: device_token,
                    title: notificationTitle, // Ensure correct title
                    body: message, // Ensure message is included
                    type: notificationType, // Ensure type is correctly mapped
                    data: { itemId: item_id }, // Ensure item_id is included
                    receiverLangCode: lang // Ensure language is passed for translation
                };

                //    console.log(` Push notification request:`, pushPayload);

                try {
               
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Push notification request DEV');

                        const response = await axios.post(
                            `${process.env.BASE_URL}api/firebase/send-push-notification`,
                            pushPayload
                        );
                    } else {
                        console.log('Push notification request PROD');

                        const response = await axios.post(
                            `${process.env.BASE_URL_PROD}api/firebase/send-push-notification`,
                            pushPayload
                        );

                    }
                 

                    //   console.log(` Push notification request sent for ${display_name} (${lang})`);
                } catch (err) {
                    console.error(` Failed to send push notification for ${display_name} (${lang}):`, err.response?.data || err.message);
                }
            }



        }





        return {
            success: data.length > 0,
            message: "Object post comment created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createUserObjectPostComment:', error);
        return {
            success: false,
            message: "Failed to create object post comment due to a database error",
            data: null
        };
    }
}




async function updateUserPersonalDetails(user_id, display_name, phone_number, country_code, profile_pic) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_user_personal_details(?,?,?,?,?)`,
            [user_id, display_name, phone_number, country_code, profile_pic]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User personal details updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserPersonalDetails:', error);
        return {
            success: false,
            message: "Failed to update user personal details due to a database error",
            data: null
        };
    }
}


async function getUserObjectDocs(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_object_docs(?)`,
            [object_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const docs = result[0] || []; // Ensure it's a valid list
        // console.log('getUserObjectDocs:', result);

        return {
            success: docs.length > 0 ? true : false,
            message: docs.length > 0 ? "User all docs retrieved successfully" : "No docs found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getUserObjectDocs:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant docs due to a database error",
            data: []
        };
    }
}



async function updateUserResetPasswordCode(email, reset_code) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_user_reset_password_code(?,?)`,
            [email, reset_code]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Reset code updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserResetPasswordCode:', error);
        return {
            success: false,
            message: "Failed to update reset code due to a database error",
            data: null
        };
    }
}

async function updateUserDeviceToken(user_id, device_token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_User_device_token(?,?)`,
            [user_id, device_token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Device token updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserDeviceToken:', error);
        return {
            success: false,
            message: "Failed to update device token due to a database error",
            data: null
        };
    }
}

async function getUserByResetCode(email, reset_code) {
    try {




        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_by_reset_code(?,?)`,
            [email, reset_code]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Userfound" : "User not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getUserByResetCode:', error);
        return {
            success: false,
            message: "Failed to retrieve user by reset code due to a database error",
            data: null
        };
    }
}


async function updateUserPassword(user_id, password) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_user_password(?,?)`,
            [user_id, password]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User password updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserPassword:', error);
        return {
            success: false,
            message: "Failed to update user password due to a database error",
            data: null
        };
    }
}


async function getUserNotifications(user_id, read_filter) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_notifications(?,?)`,
            [user_id, read_filter]
        );

        // Extract only the first element of the result, which contains the actual request data
        const docs = result[0] || []; // Ensure it's a valid list
        
        return {
            success: docs.length > 0 ? true : false,
            message: docs.length > 0 ? "User notifications retrieved successfully" : "No user notifications found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getUserNotifications:', error);
        return {
            success: false,
            message: "Failed to retrieve user notifications due to a database error",
            data: []
        };
    }
}


async function getUserObjectRequestById(id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_object_request_by_id(?)`,
            [id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Request retrieved successfully" : "No request found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getUserObjectRequestById:', error);
        return {
            success: false,
            message: "Failed to retrieve request due to a database error",
            data: []
        };
    }
}


async function updateUserNotificationStatus(id, status) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_user_notification_status(?,?)`,
            [id, status]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User notification status updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserNotificationStatus:', error);
        return {
            success: false,
            message: "Failed to update user notification status due to a database error",
            data: null
        };
    }
}

async function getUserObjectAnnouncements(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_object_announcements(?)`,
            [building_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Announcements retrieved successfully" : "No annoucements found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getUserObjectAnnouncements:', error);
        return {
            success: false,
            message: "Failed to retrieve announcements due to a database error",
            data: []
        };
    }
}


async function getUserObjectAnnouncementById(id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_object_announcement_by_id(?)`,
            [id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Announcement retrieved successfully" : "No request found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getUserObjectAnnouncementById:', error);
        return {
            success: false,
            message: "Failed to retrieve announcement due to a database error",
            data: []
        };
    }
}


async function deleteUserDeviceToken(device_token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_user_device_token(?)`,
            [device_token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Device token deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteUserDeviceToken:', error);
        return {
            success: false,
            message: "Failed to delete device token due to a database error",
            data: null
        };
    }
}


async function getUserDeviceTokens(tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_device_tokens(?)`,
            [tenant_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "User device tokens retrieved successfully" : "No bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getUserDeviceTokens:', error);
        return {
            success: false,
            message: "Failed to retrieve all user device tokens due to a database error",
            data: []
        };
    }
}





async function updateUserLanguageCode(user_id, lang_code) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_user_lang(?,?)`,
            [tenant_id, lang_code]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User language code updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserLanguageCode:', error);
        return {
            success: false,
            message: "Failed to update user language code due to a database error",
            data: null
        };
    }
}


async function createTenantContractNotificationAndSendPush(contract_id, type_id, message, item_id) {
    try {
        //  Step 1: Call stored procedure to create notifications
        const [rows] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_contract_notification(?,?,?,?)`,
            [contract_id, type_id, message, item_id]
        );

        const notifications = rows[0] || [];
        if (notifications.length === 0) {
            console.warn(`⚠️ No notifications created for contract ${contract_id}`);
            return { success: false, message: "No notifications created", data: null };
        }

        //   console.log(` ${notifications.length} notifications created for contract ${contract_id}`);

        // Step 2: Process each tenant notification
        for (const notification of notifications) {
            const tenant_id = notification.tenant_id;

            //  Step 3: Get device tokens, display name, and language preference
            const [tokens] = await pool.execute(
                `CALL ${process.env['DB_DATABASE']}.get_tenant_device_tokens(?)`,
                [tenant_id]
            );

            if (tokens.length === 0) {
                console.warn(`⚠️ No device tokens found for tenant ${tenant_id}`);
                continue;
            }

            //  console.log(`Found ${tokens.length} device tokens for tenant ${tenant_id}`);

            //  Step 4: Get the type of notification
            let notificationType = "";
            let notificationTitle = "";
            var typeId = parseInt(type_id);
            switch (typeId) {
                case 1:
                    notificationType = "booking";
                    notificationTitle = "Booking Update";
                    break;
                case 2:
                    notificationType = "request";
                    notificationTitle = "Request Update";
                    break;
                case 3:
                    notificationType = "comment";
                    notificationTitle = "New Comment";
                    break;
                case 4:
                    notificationType = "announcement";
                    notificationTitle = "New Announcement";
                    break;
                case 5:
                    notificationType = "parcel";
                    notificationTitle = "Parcel Update";
                    break;
                default:
                    notificationType = "general";
                    notificationTitle = "New Notification";
                    break;
            }



            for (const tokenData of tokens[0]) {
                const { device_token, display_name, lang } = tokenData;


                //  Step 5: Send API request to `/api/firebase/send-push-notification`
                const pushPayload = {
                    token: device_token,
                    title: notificationTitle, // Ensure correct title
                    body: message, // Ensure message is included
                    type: notificationType, // Ensure type is correctly mapped
                    data: { itemId: item_id }, // Ensure item_id is included
                    receiverLangCode: lang // Ensure language is passed for translation
                };

                //    console.log(` Push notification request:`, pushPayload);

                try {

                    // check if it is in dev mode or production mode

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Push notification request DEV');

                        const response = await axios.post(
                            `${process.env.BASE_URL}api/firebase/send-push-notification`,
                            pushPayload
                        );
                    } else {
                        console.log('Push notification request PROD');

                        const response = await axios.post(
                            `${process.env.BASE_URL_PROD}api/firebase/send-push-notification`,
                            pushPayload
                        );

                    }
                 
                    //     console.log(` Push notification request sent for ${display_name} (${lang})`);
                } catch (err) {
                    console.error(` Failed to send push notification for ${display_name} (${lang}):`, err.response?.data || err.message);
                }
            }
        }

        return { success: true, message: "Notifications created and push sent", data: notifications };
    } catch (error) {
        console.error(" Error in createTenantContractNotificationAndSendPush:", error);
        return { success: false, message: "Database or push notification error", data: null };
    }
}



async function createTenantNotificationAndSendPush(tenant_id, type_id, message, item_id) {
    try {
        //  Step 1: Call stored procedure to create notifications
        const [rows] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_notification(?,?,?,?)`,
            [tenant_id, type_id, message, item_id]
        );

        const notifications = rows[0] || [];
        if (notifications.length === 0) {
            console.warn(`⚠️ No notifications created for contract ${tenant_id}`);
            return { success: false, message: "No notifications created", data: null };
        }
        //
        //     console.log(` ${notifications.length} notifications created for tenant_id ${tenant_id}`);

        //  Step 2: Process each tenant notification
        for (const notification of notifications) {
            const tenant_id = notification.tenant_id;

            //  Step 3: Get device tokens, display name, and language preference
            const [tokens] = await pool.execute(
                `CALL ${process.env['DB_DATABASE']}.get_tenant_device_tokens(?)`,
                [tenant_id]
            );

            if (tokens.length === 0) {
                console.warn(`⚠️ No device tokens found for tenant ${tenant_id}`);
                continue;
            }

            //   console.log(` Found ${tokens.length} device tokens for tenant ${tenant_id}`);

            //  Step 4: Get the type of notification
            let notificationType = "";
            let notificationTitle = "";
            var typeId = parseInt(type_id);
            switch (typeId) {
                case 1:
                    notificationType = "booking";
                    notificationTitle = "Booking Update";
                    break;
                case 2:
                    notificationType = "request";
                    notificationTitle = "Request Update";
                    break;
                case 3:
                    notificationType = "comment";
                    notificationTitle = "New Comment";
                    break;
                case 4:
                    notificationType = "announcement";
                    notificationTitle = "New Announcement";
                    break;
                case 5:
                    notificationType = "parcel";
                    notificationTitle = "Parcel Update";
                    break;
                default:
                    notificationType = "general";
                    notificationTitle = "New Notification";
                    break;
            }



            for (const tokenData of tokens[0]) {
                const { device_token, display_name, lang } = tokenData;


                //  Step 5: Send API request to `/api/firebase/send-push-notification`
                const pushPayload = {
                    token: device_token,
                    title: notificationTitle, // Ensure correct title
                    body: message, // Ensure message is included
                    type: notificationType, // Ensure type is correctly mapped
                    data: { itemId: item_id }, // Ensure item_id is included
                    receiverLangCode: lang // Ensure language is passed for translation
                };

                //    console.log(` Push notification request:`, pushPayload);

                try {
           
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Push notification request DEV');

                        const response = await axios.post(
                            `${process.env.BASE_URL}api/firebase/send-push-notification`,
                            pushPayload
                        );
                    } else {
                        console.log('Push notification request PROD');

                        const response = await axios.post(
                            `${process.env.BASE_URL_PROD}api/firebase/send-push-notification`,
                            pushPayload
                        );

                    }
                 
                    //   console.log(` Push notification request sent for ${display_name} (${lang})`);
                } catch (err) {
                    console.error(` Failed to send push notification for ${display_name} (${lang}):`, err.response?.data || err.message);
                }
            }
        }

        return { success: true, message: "Notifications created and push sent", data: notifications };
    } catch (error) {
        console.error(" Error in createTenantNotificationAndSendPush:", error);
        return { success: false, message: "Database or push notification error", data: null };
    }
}


async function createTenantBuildingPostReport(post_id, building_id, reported_by_id, reason, additional_comments) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_building_post_report(?,?,?,?,?)`,
            [post_id, building_id, reported_by_id, reason, additional_comments]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post report successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingPostReport:', error);
        return {
            success: false,
            message: "Failed to create building post report due to a database error",
            data: null
        };
    }
}


async function deleteTenantBuildingPost(post_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_tenant_building_post(?)`,
            [post_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteTenantBuildingPost:', error);
        return {
            success: false,
            message: "Failed to delete building post due to a database error",
            data: null
        };
    }
}


async function deleteTenantBuildingPostComment(comment_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_tenant_building_post_comment(?)`,
            [comment_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post comment deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteTenantBuildingPostComment:', error);
        return {
            success: false,
            message: "Failed to delete building post comment due to a database error",
            data: null
        };
    }
}




async function getUsersbyObjectId(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_users_by_object_id(?)`,
            [object_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list



        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Users object retrieved successfully" : "No users building found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getUsersByObjectId:', error);
        return {
            success: false,
            message: "Failed to retrieve users object due to a database error",
            data: []
        };
    }
}


async function createQuickNewTenant(first_name, last_name, email, building_id, created_by_id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_quick_new_tenant(?,?,?,?,?)`,
            [first_name, last_name, email, building_id, created_by_id]
        );
        

        const data = result[0] || [];


      //  console.log('createQuickNewTenant:', data);
 

            if(data[0]['status']=='exists'){
                return {
                    success: true,
                    message: "Tenant already exists",
                    status: 0,
                    data: data
                };
            }
            if(data[0]['status']=='created'){
                return {
                    success: true,
                    message: "Quick new tenant created successfully",
                    status: 1,
                    data: data
                };
            }
    




  
    } catch (error) {
        console.error('Error in createQuickNewTenant:', error);
        return {
            success: false,
            message: "Failed to create quick new tenant due to a database error",
            status: 2,
            data: null
        };
    }
}
async function updateQuickTenant(first_name, last_name, building_id, tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_quick_tenant(?,?,?,?)`,
            [first_name, last_name, building_id, tenant_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant quick updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateQuickTenant:', error);
        return {
            success: false,
            message: "Failed to update tenant quickdue to a database error",
            data: null
        };
    }
}


async function updateTenantContractPrimary(contract_id, tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_contract_primary(?,?)`,
            [contract_id, tenant_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant contract primary updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantContractPrimary:', error);
        return {
            success: false,
            message: "Failed to update tenant contract primary due to a database error",
            data: null
        };
    }
}

async function getTenantBuildingAllRequests(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_requests(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenant all requests retrieved successfully" : "No requests found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingAllRequests:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant requests due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingAllRequestsByTenantId(tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_requests_by_tenant_id(?)`,
            [tenant_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenant all requests retrieved by tenant id successfully" : "No requests found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingAllRequestsByTenantId:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant requests by tenant id due to a database error",
            data: []
        };
    }
}



async function updateUserRequestStatus(request_id, status_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_user_request_status(?,?)`,
            [request_id, status_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User request updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUserRequestStatus:', error);
        return {
            success: false,
            message: "Failed to update user request status due to a database error",
            data: null
        };
    }
}



module.exports = {

    validateUserInvitationToken: validateUserInvitationToken,
    registerUser: registerUser,
    loginUser: loginUser,
    getUserByEmail: getUserByEmail,
    getUserUpcomingBooking: getUserUpcomingBooking,
    createUserObjectRequest: createUserObjectRequest,
    getUserObjectRequests: getUserObjectRequests,
    createUserObjectRequestLog: createUserObjectRequestLog,
    createUserObjectPost: createUserObjectPost,
    createUserObjectPostMedia: createUserObjectPostMedia,
    createUserObjectPostComment: createUserObjectPostComment,
    getUserById: getUserById,
    updateUserPersonalDetails: updateUserPersonalDetails,
    getUserObjectDocs: getUserObjectDocs,
    updateUserResetPasswordCode: updateUserResetPasswordCode,
    updateUserDeviceToken: updateUserDeviceToken,
    getUserByResetCode: getUserByResetCode,
    updateUserPassword: updateUserPassword,
    getUserNotifications: getUserNotifications,
    getUserObjectRequestById: getUserObjectRequestById,
    updateUserNotificationStatus: updateUserNotificationStatus,
    getUserObjectAnnouncements: getUserObjectAnnouncements,
    getUserObjectAnnouncementById: getUserObjectAnnouncementById,
    deleteUserDeviceToken: deleteUserDeviceToken,
    getUserDeviceTokens: getUserDeviceTokens,
    updateUserLanguageCode: updateUserLanguageCode,
    createTenantNotificationAndSendPush: createTenantNotificationAndSendPush,
    createTenantContractNotificationAndSendPush: createTenantContractNotificationAndSendPush,
    createTenantBuildingPostReport: createTenantBuildingPostReport,
    deleteTenantBuildingPost: deleteTenantBuildingPost,
    deleteTenantBuildingPostComment: deleteTenantBuildingPostComment,
    validateCompanyInvitationToken: validateCompanyInvitationToken,
    registerCompany: registerCompany,
    getCompanyByEmail: getCompanyByEmail,
    getCompanyById: getCompanyById,
    getUsersbyObjectId: getUsersbyObjectId,
    createQuickNewTenant: createQuickNewTenant,
    updateTenantContractPrimary: updateTenantContractPrimary,
    getTenantBuildingAllRequests: getTenantBuildingAllRequests,
    updateUserRequestStatus: updateUserRequestStatus,
    getTenantBuildingAllRequestsByTenantId: getTenantBuildingAllRequestsByTenantId,
    updateQuickTenant: updateQuickTenant
}

