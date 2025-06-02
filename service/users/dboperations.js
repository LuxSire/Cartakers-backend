require('dotenv').config();

const pool = require('../dbconfig'); // Ensure this exports the mysql2/promise pool
const { hashPassword, verifyPassword, generateSalt } = require('../bcrypt');
const { post } = require('request');
const axios = require("axios"); //  Import axios





//// start flutter calls 

async function validateTenantInvitationToken(token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.validate_tenant_invitation_token(?)`,
            [token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Token validation successful" : "Invalid token",
            data: data
        };
    } catch (error) {
        console.error('Error in validateTenantInvitationToken:', error);
        return {
            success: false,
            message: "Failed to validate token due to a database error",
            data: null
        };
    }
}


async function validateAgentInvitationToken(token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.validate_agent_invitation_token(?)`,
            [token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Agent Token validation successful" : "Agent Invalid token",
            data: data
        };
    } catch (error) {
        console.error('Error in validateAgentInvitationToken:', error);
        return {
            success: false,
            message: "Failed to validate agent token due to a database error",
            data: null
        };
    }
}

async function registerTenant(tenant) {
    try {
        const { tenant_id, email, first_name, last_name, phone_number, country_code, password } = tenant;

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.register_update_tenant(?,?,?,?,?,?,?)`,
            [email, password, first_name, last_name, phone_number, country_code, tenant_id]
        );

        // Fix: Ensure that only the first item is returned
        const data = Array.isArray(result) && result.length > 0 ? result[0][0] : null;

        return {
            success: !!data, // True if data exists
            message: data ? "Tenant registered successfully" : "Failed to register tenant",
            data: data ?? {} // Return an empty object if no data exists
        };
    } catch (error) {
        console.error('Error in registerTenant:', error);
        return {
            success: false,
            message: "Failed to register tenant due to a database error",
            data: null
        };
    }
}

async function registerAgent(agent) {
    try {

      //  console.log('registerAgent:', agent);
        const { agent_id, email, first_name, last_name, password } = agent;

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.register_update_agent(?,?,?,?,?)`,
            [email, password, first_name, last_name, agent_id]
        );

        // Fix: Ensure that only the first item is returned
        const data = Array.isArray(result) && result.length > 0 ? result[0][0] : null;

        return {
            success: !!data, // True if data exists
            message: data ? "Agent registered successfully" : "Failed to register agent",
            data: data ?? {} // Return an empty object if no data exists
        };
    } catch (error) {
        console.error('Error in registerAgent:', error);
        return {
            success: false,
            message: "Failed to register agent due to a database error",
            data: null
        };
    }
}



async function loginTenant(tenant) {
    try {
        const { email, password } = tenant;

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.login_tenant(?,?)`,
            [email, password]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Login successful" : "Invalid email or password",
            data: data
        };
    } catch (error) {
        console.error('Error in loginTenant:', error);
        return {
            success: false,
            message: "Failed to log in due to a database error",
            data: null
        };
    }
}

async function getTenantByEmail(email) {
    try {

         //console.log('getTenantByEmail:', email);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_by_email(?)`,
            [email]
        );



        const data = result[0] || [];

       // console.log('getTenantByEmail:', data);
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Tenant found" : "Tenant not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getTenantByEmail:', error);
        return {
            success: false,
            message: "Failed to retrieve tenant due to a database error",
            data: null
        };
    }
}

async function getAgentByEmail(email) {
    try {

         //console.log('getTenantByEmail:', email);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_agent_by_email(?)`,
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



async function getTenantById(id) {
    try {

        // console.log('getTenantById:', id);


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_by_id(?)`,
            [id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Tenant found" : "Tenant not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getTenantById:', error);
        return {
            success: false,
            message: "Failed to retrieve tenant by id due to a database error",
            data: null
        };
    }
}


async function getAgentById(id) {
    try {

        // console.log('getTenantById:', id);


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_agent_by_id(?)`,
            [id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Agent found" : "Agent not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getagentById:', error);
        return {
            success: false,
            message: "Failed to retrieve agent by id due to a database error",
            data: null
        };
    }
}

async function getTenantUpcomingBooking(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_upcoming_booking(?)`,
            [contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Upcoming booking retrieved" : "No upcoming bookings found",
            data: data
        };
    } catch (error) {
        console.error('Error in getTenantUpcomingBooking:', error);
        return {
            success: false,
            message: "Failed to retrieve upcoming booking due to a database error",
            data: null
        };
    }
}

async function createTenantBuildingRequest(request_id, tenant_id, unit_id, description,
    building_id, agency_id, contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_building_request(?,?,?,?,?,?,?)`,
            [request_id, tenant_id, unit_id, description, building_id, agency_id, contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building request created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingRequest:', error);
        return {
            success: false,
            message: "Failed to create building request due to a database error",
            data: null
        };
    }
}

async function createTenantBuildingRequestLog(request_id, status, description, processed_by_id, processed_by_type) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_building_request_log(?,?,?,?,?)`,
            [request_id, status, description, processed_by_id, processed_by_type]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building request log created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingRequestLog:', error);
        return {
            success: false,
            message: "Failed to create request log due to a database error",
            data: null
        };
    }
}

async function createTenantBuildingRequestMedia(request_id, media_url) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_building_request_media(?,?)`,
            [request_id, media_url]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Request media uploaded successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingRequestMedia:', error);
        return {
            success: false,
            message: "Failed to upload request media due to a database error",
            data: null
        };
    }
}

async function updateTenantBuildingRequestStatus(request_id, status) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_building_request_status(?,?)`,
            [request_id, status]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Request status updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantBuildingRequestStatus:', error);
        return {
            success: false,
            message: "Failed to update request status due to a database error",
            data: null
        };
    }
}



async function getTenantBuildingRequests(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_requests(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Requests retrieved successfully" : "No requests found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingRequests:', error);
        return {
            success: false,
            message: "Failed to retrieve requests due to a database error",
            data: []
        };
    }
}



async function createTenantBuildingPost(building_id, creator_id, title, isReceivePrivateMessage, description, creator_type) {
    try {

       // console.log('createTenantBuildingPost:', building_id, creator_id, title, isReceivePrivateMessage, description, creator_type);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_building_post(?,?,?,?,?,?)`,
            [building_id, creator_id, title, isReceivePrivateMessage, description, creator_type]
        );
        

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingPost:', error);
        return {
            success: false,
            message: "Failed to create building post due to a database error",
            data: null
        };
    }
}


async function createTenantBuildingPostMedia(post_id, media_url) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_building_post_media(?,?)`,
            [post_id, media_url]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Post media uploaded successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingPostMedia:', error);
        return {
            success: false,
            message: "Failed to upload post media due to a database error",
            data: null
        };
    }
}

async function createTenantBuildingPostComment(post_id, creator_id, creator_type, description, post_owner_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_building_post_comment(?,?,?,?)`,
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
                `CALL ${process.env['DB_DATABASE']}.get_tenant_device_tokens(?)`,
                [post_owner_id]
            );

            //  console.log('creatorName:', creatorName);
            //    console.log('post_owner_id:', post_owner_id);
            let notificationType = "comment";
            let notificationTitle = "New Comment";
            let message = `${creatorName} commented on your post: ${description}`;

            //   Call stored procedure to create notifications
            const [rows] = await pool.execute(
                `CALL ${process.env['DB_DATABASE']}.create_tenant_notification(?,?,?,?)`,
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
            message: "Building post comment created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingPostComment:', error);
        return {
            success: false,
            message: "Failed to create building post comment due to a database error",
            data: null
        };
    }
}


async function createTenantBuildingPostLike(post_id, creator_id, creator_type) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_building_post_like(?,?,?)`,
            [post_id, creator_id, creator_type]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post like created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingPostLike:', error);
        return {
            success: false,
            message: "Failed to create building post like due to a database error",
            data: null
        };
    }
}


async function deleteTenantBuildingPostLike(post_id, creator_id, creator_type) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_building_post_like(?,?,?)`,
            [post_id, creator_id, creator_type]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building post like deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteTenantBuildingPostLike:', error);
        return {
            success: false,
            message: "Failed to delete building post like due to a database error",
            data: null
        };
    }
}


async function updateTenantPersonalDetails(tenant_id, display_name, phone_number, country_code, profile_pic) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_personal_details(?,?,?,?,?)`,
            [tenant_id, display_name, phone_number, country_code, profile_pic]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant personal details updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantPersonalDetails:', error);
        return {
            success: false,
            message: "Failed to update tenant personal details due to a database error",
            data: null
        };
    }
}


async function getTenantBuildingUpcomingBookings(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_upcoming_bookings(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Upcoming bookings retrieved successfully" : "No upcoming bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingUpcomingBookings:', error);
        return {
            success: false,
            message: "Failed to retrieve upcoming bookings due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingPastBookings(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_past_bookings(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Past bookings retrieved successfully" : "No past bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingPastBookings:', error);
        return {
            success: false,
            message: "Failed to retrieve past bookings due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingBookingTypes(tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_available_booking_categories(?)`,
            [tenant_id]
        );

        const bookingtTypes = result[0] || []; // Ensure valid data

        return {
            success: bookingtTypes.length > 0,
            message: bookingtTypes.length > 0 ? "Tenant Building booking types retrieved successfully" : "No booking types found",
            data: bookingtTypes
        };
    } catch (error) {
        console.error('Error in getTenantBuildingBookingTypes:', error);
        return {
            success: false,
            message: "Failed to retrieve building booking types due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingAvailableAmenityUnits(tenant_id, amenity_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_available_amenity_units(?,?)`,
            [tenant_id, amenity_id]
        );

        const amenityUnits = result[0] || []; // Ensure valid data

        return {
            success: amenityUnits.length > 0,
            message: amenityUnits.length > 0 ? "Tenant Building available amenity units retrieved successfully" : "No amenity units found",
            data: amenityUnits
        };
    } catch (error) {
        console.error('Error in getTenantBuildingAvailableAmenityUnits:', error);
        return {
            success: false,
            message: "Failed to retrieve tenant building available amenity units due to a database error",
            data: []
        };
    }
}

async function createTenantBuildingBooking(tenant_id, amenity_unit_id, booking_date, start_time, end_time, contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_tenant_building_booking(?,?,?,?,?,?)`,
            [tenant_id, amenity_unit_id, booking_date, start_time, end_time, contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building booking created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createTenantBuildingBooking:', error);
        return {
            success: false,
            message: "Failed to create tenant building booking due to a database error",
            data: null
        };
    }
}


async function updateTenantBuildingBooking(booking_id, status_id, booking_date, start_time, end_time) {
    try {

        // console.log('updateTenantBuildingBooking:', booking_id, status_id, booking_date, start_time, end_time);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_building_booking(?,?,?,?,?)`,
            [booking_id, status_id, booking_date, start_time, end_time]
        );


        //  console.log('updateTenantBuildingBooking:', result);

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building booking updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantBuildingBooking:', error);
        return {
            success: false,
            message: "Failed to update tenant building booking due to a database error",
            data: null
        };
    }
}

async function updateTenantBuildingBookingStatus(booking_id, status_id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_building_booking_status(?,?)`,
            [booking_id, status_id]
        );


        //  console.log('updateTenantBuildingBookingStatus:', result);

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Building booking status updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantBuildingBookingStatus:', error);
        return {
            success: false,
            message: "Failed to update tenant building booking status due to a database error",
            data: null
        };
    }
}


async function getTenantBuildingAllBookings(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_all_bookings(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenant all bookings retrieved successfully" : "No bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingAllBookings:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant bookings due to a database error",
            data: []
        };
    }
}



async function getTenantBuildingAllBookingsByTenantId(tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_all_bookings_by_tenant_id(?)`,
            [tenant_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenant all bookings by tenant id retrieved successfully" : "No bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingAllBookings:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant bookings by tenant id due to a database error",
            data: []
        };
    }
}

async function getTenantBuildingDocs(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_docs(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const docs = result[0] || []; // Ensure it's a valid list
        // console.log('getTenantBuildingDocs:', result);

        return {
            success: docs.length > 0 ? true : false,
            message: docs.length > 0 ? "Tenant all docs retrieved successfully" : "No docs found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getTenantBuildingDocs:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant docs due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingHelpGuides(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_help_guides(?)`,
            [building_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const docs = result[0] || []; // Ensure it's a valid list
        // console.log('getTenantBuildingHelpGuides:', result);

        return {
            success: docs.length > 0 ? true : false,
            message: docs.length > 0 ? "Help guides retrieved successfully" : "No docs found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getTenantBuildingHelpGuides:', error);
        return {
            success: false,
            message: "Failed to retrieve help guides due to a database error",
            data: []
        };
    }
}


async function updateTenantResetPasswordCode(email, reset_code) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_reset_password_code(?,?)`,
            [email, reset_code]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Reset code updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantResetPasswordCode:', error);
        return {
            success: false,
            message: "Failed to update reset code due to a database error",
            data: null
        };
    }
}

async function updateTenantDeviceToken(tenant_id, device_token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_device_token(?,?)`,
            [tenant_id, device_token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Device token updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantDeviceToken:', error);
        return {
            success: false,
            message: "Failed to update device token due to a database error",
            data: null
        };
    }
}

async function getTenantByResetCode(email, reset_code) {
    try {




        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_by_reset_code(?,?)`,
            [email, reset_code]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: data.length > 0 ? "Tenant found" : "Tenant not found",
            data: data
        };
    } catch (error) {
        console.error('Error in getTenantByResetCode:', error);
        return {
            success: false,
            message: "Failed to retrieve tenant by reset code due to a database error",
            data: null
        };
    }
}


async function updateTenantPassword(tenant_id, password) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_password(?,?)`,
            [tenant_id, password]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant password updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantPassword:', error);
        return {
            success: false,
            message: "Failed to update tenant password due to a database error",
            data: null
        };
    }
}


async function getTenantNotifications(tenant_id, read_filter) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_notifications(?,?)`,
            [tenant_id, read_filter]
        );

        // Extract only the first element of the result, which contains the actual request data
        const docs = result[0] || []; // Ensure it's a valid list
        // console.log('getTenantBuildingHelpGuides:', result);

        return {
            success: docs.length > 0 ? true : false,
            message: docs.length > 0 ? "Tenant notifications retrieved successfully" : "No tenant notifications found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getTenantNotifications:', error);
        return {
            success: false,
            message: "Failed to retrieve tenant notifications due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingRequestById(id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_request_by_id(?)`,
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
        console.error('Error in getTenantBuildingRequestById:', error);
        return {
            success: false,
            message: "Failed to retrieve request due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingBookingById(id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_booking_by_id(?)`,
            [id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Booking retrieved successfully" : "No booking found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingBookingById:', error);
        return {
            success: false,
            message: "Failed to retrieve booking due to a database error",
            data: []
        };
    }
}

async function updateTenantNotificationStatus(id, status) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_notification_status(?,?)`,
            [id, status]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant notification status updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantNotificationStatus:', error);
        return {
            success: false,
            message: "Failed to update tenant notification status due to a database error",
            data: null
        };
    }
}

async function getTenantBuildingAnnouncemnts(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_announcements(?)`,
            [building_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Announcemnts retrieved successfully" : "No annoucemnts found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantBuildingAnnouncemnts:', error);
        return {
            success: false,
            message: "Failed to retrieve announcemnts due to a database error",
            data: []
        };
    }
}


async function getTenantBuildingAnnouncementById(id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_building_announcement_by_id(?)`,
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
        console.error('Error in getTenantBuildingAnnouncementById:', error);
        return {
            success: false,
            message: "Failed to retrieve announcement due to a database error",
            data: []
        };
    }
}


async function deleteTenantDeviceToken(device_token) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_tenant_device_token(?)`,
            [device_token]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Device token deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteTenantDeviceToken:', error);
        return {
            success: false,
            message: "Failed to delete device token due to a database error",
            data: null
        };
    }
}


async function updateTenantBookingReminders(tenant_id, val) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_booking_reminders(?,?)`,
            [tenant_id, val]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant send booking reminders updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantBookingReminders:', error);
        return {
            success: false,
            message: "Failed to update tenant booking reminders due to a database error",
            data: null
        };
    }
}

async function getTenantDeviceTokens(tenant_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_device_tokens(?)`,
            [tenant_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenant device tokens retrieved successfully" : "No bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantDeviceTokens:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenant device tokens due to a database error",
            data: []
        };
    }
}





async function updateTenantLanguageCode(tenant_id, lang_code) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_lang(?,?)`,
            [tenant_id, lang_code]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant language code updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantLanguageCode:', error);
        return {
            success: false,
            message: "Failed to update tenant language code due to a database error",
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


async function getTenantUpcomingBookingsReminders() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenant_upcoming_bookings_for_reminders()`,
      
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenants upcoming bookings reminder retrieved successfully" : "No tenants upcing bookings found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantUpcomingBookingsReminders:', error);
        return {
            success: false,
            message: "Failed to retrieve all tenants upcoming booking reminders due to a database error",
            data: []
        };
    }
}

async function updateBookingReminderSent(booking_id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_booking_reminder_sent(?)`,
            [booking_id]
        );



        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Booking reminder sent updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateBookingReminderSent:', error);
        return {
            success: false,
            message: "Failed to update booking reminder sent due to a database error",
            data: null
        };
    }
}



async function getTenantsByContractId(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenants_by_contract_id(?)`,
            [contract_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list


     //   console.log('getTenantsByContractId:', requests);

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenants Contract retrieved successfully" : "No tenants contracts found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantsByContractId:', error);
        return {
            success: false,
            message: "Failed to retrieve tenats contract due to a database error",
            data: []
        };
    }
}


async function getTenantsByBuildingId(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_tenants_by_building_id(?)`,
            [building_id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list


     //   console.log('getTenantsByBuildingId:', requests);

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Tenants building retrieved successfully" : "No tenants building found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getTenantsByBuildingId:', error);
        return {
            success: false,
            message: "Failed to retrieve tenats building due to a database error",
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



async function updateTenantRequestStatus(request_id, status_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_tenant_request_status(?,?)`,
            [request_id, status_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant request updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateTenantRequestStatus:', error);
        return {
            success: false,
            message: "Failed to update tenant request status due to a database error",
            data: null
        };
    }
}


async function deleteTenantBuildingTenant(tenant_id, building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_tenant_building_tenant(?,?)`,
            [tenant_id, building_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant Building tenant deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteTenantBuildingTenant:', error);
        return {
            success: false,
            message: "Failed to delete tenant building tenant due to a database error",
            data: null
        };
    }
}


module.exports = {

    validateTenantInvitationToken: validateTenantInvitationToken,
    registerTenant: registerTenant,
    loginTenant: loginTenant,
    getTenantByEmail: getTenantByEmail,
    getTenantUpcomingBooking: getTenantUpcomingBooking,
    createTenantBuildingRequest: createTenantBuildingRequest,
    createTenantBuildingRequestMedia: createTenantBuildingRequestMedia,
    getTenantBuildingRequests: getTenantBuildingRequests,
    createTenantBuildingRequestLog: createTenantBuildingRequestLog,
    updateTenantBuildingRequestStatus: updateTenantBuildingRequestStatus,
    createTenantBuildingPost: createTenantBuildingPost,
    createTenantBuildingPostMedia: createTenantBuildingPostMedia,
    createTenantBuildingPostComment: createTenantBuildingPostComment,
    createTenantBuildingPostLike: createTenantBuildingPostLike,
    deleteTenantBuildingPostLike: deleteTenantBuildingPostLike,
    getTenantById: getTenantById,
    updateTenantPersonalDetails: updateTenantPersonalDetails,
    getTenantBuildingUpcomingBookings: getTenantBuildingUpcomingBookings,
    getTenantBuildingPastBookings: getTenantBuildingPastBookings,
    getTenantBuildingBookingTypes: getTenantBuildingBookingTypes,
    getTenantBuildingAvailableAmenityUnits: getTenantBuildingAvailableAmenityUnits,
    createTenantBuildingBooking: createTenantBuildingBooking,
    updateTenantBuildingBooking: updateTenantBuildingBooking,
    updateTenantBuildingBookingStatus: updateTenantBuildingBookingStatus,
    getTenantBuildingAllBookings: getTenantBuildingAllBookings,
    getTenantBuildingDocs: getTenantBuildingDocs,
    getTenantBuildingHelpGuides: getTenantBuildingHelpGuides,
    updateTenantResetPasswordCode: updateTenantResetPasswordCode,
    updateTenantDeviceToken: updateTenantDeviceToken,
    getTenantByResetCode: getTenantByResetCode,
    updateTenantPassword: updateTenantPassword,
    getTenantNotifications: getTenantNotifications,
    getTenantBuildingRequestById: getTenantBuildingRequestById,
    updateTenantNotificationStatus: updateTenantNotificationStatus,
    getTenantBuildingBookingById: getTenantBuildingBookingById,
    getTenantBuildingAnnouncemnts: getTenantBuildingAnnouncemnts,
    getTenantBuildingAnnouncementById: getTenantBuildingAnnouncementById,
    deleteTenantDeviceToken: deleteTenantDeviceToken,
    updateTenantBookingReminders: updateTenantBookingReminders,
    getTenantDeviceTokens: getTenantDeviceTokens,
    updateTenantLanguageCode: updateTenantLanguageCode,
    createTenantNotificationAndSendPush: createTenantNotificationAndSendPush,
    createTenantContractNotificationAndSendPush: createTenantContractNotificationAndSendPush,
    createTenantBuildingPostReport: createTenantBuildingPostReport,
    deleteTenantBuildingPost: deleteTenantBuildingPost,
    deleteTenantBuildingPostComment: deleteTenantBuildingPostComment,
    getTenantUpcomingBookingsReminders: getTenantUpcomingBookingsReminders,
    updateBookingReminderSent: updateBookingReminderSent,
    validateAgentInvitationToken: validateAgentInvitationToken,
    registerAgent: registerAgent,
    getAgentByEmail: getAgentByEmail,
    getAgentById: getAgentById,
    getTenantsByContractId: getTenantsByContractId,
    createQuickNewTenant: createQuickNewTenant,
    updateTenantContractPrimary: updateTenantContractPrimary,
    getTenantBuildingAllRequests: getTenantBuildingAllRequests,
    updateTenantRequestStatus: updateTenantRequestStatus,
    getTenantBuildingAllBookingsByTenantId: getTenantBuildingAllBookingsByTenantId,
    getTenantBuildingAllRequestsByTenantId: getTenantBuildingAllRequestsByTenantId,
    updateQuickTenant: updateQuickTenant,
    getTenantsByBuildingId: getTenantsByBuildingId,
    deleteTenantBuildingTenant: deleteTenantBuildingTenant,

}

