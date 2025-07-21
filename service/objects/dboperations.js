require('dotenv').config();

const pool = require('../dbconfig'); // Ensure this exports the mysql2/promise pool


// Get Last Building Announcement
async function getObjectLastAnnouncement(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_last_announcement(?)`,
            [building_id]
        );

        const announcement = result[0] || []; // Ensure valid data

        return {
            success: announcement.length > 0,
            message: announcement.length > 0 ? "Object announcement retrieved successfully" : "No announcement found",
            data: announcement
        };
    } catch (error) {
        console.error('Error in getObjectLastAnnouncement:', error);
        return {
            success: false,
            message: "Failed to retrieve object announcement due to a database error",
            data: []
        };
    }
}


// Get Object Request Logs
async function getObjectRequestLogs(request_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_request_logs(?)`,
            [request_id]
        );

        const requestLogs = result[0] || []; // Ensure valid data

        return {
            success: requestLogs.length > 0,
            message: requestLogs.length > 0 ? "Object request logs retrieved successfully" : "No request logs found",
            data: requestLogs
        };
    } catch (error) {
        console.error('Error in getObjectRequestLogs:', error);
        return {
            success: false,
            message: "Failed to retrieve Object request logs due to a database error",
            data: []
        };
    }
}


async function getObjectContactNumbers(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_contact_numbers(?)`,
            [building_id]
        );

        const requestLogs = result[0] || []; // Ensure valid data

        return {
            success: requestLogs.length > 0,
            message: requestLogs.length > 0 ? "Object contact numbers retrieved successfully" : "No contact numbers logs found",
            data: requestLogs
        };
    } catch (error) {
        console.error('Error in getObjectContactNumbers:', error);
        return {
            success: false,
            message: "Failed to retrieve building contact numbers due to a database error",
            data: []
        };
    }
}


async function getObjectPosts(object_id, user_id, user_type) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_posts(?,?,?)`,
            [object_id, user_id, user_type]
        );

        const objectPosts = result || []; // Ensure valid data

        return {
            success: objectPosts.length > 0,
            message: objectPosts.length > 0 ? "Object posts retrieved successfully" : "No  posts found",
            data: objectPosts
        };
    } catch (error) {
        console.error('Error in getObjectPosts:', error);
        return {
            success: false,
            message: "Failed to retrieve object posts due to a database error",
            data: []
        };
    }
}





async function getObjectById(id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_by_id(?)`,
            [id]
        );

        // Extract only the first element of the result, which contains the actual request data
        const requests = result[0] || []; // Ensure it's a valid list

        return {
            success: requests.length > 0 ? true : false,
            message: requests.length > 0 ? "Object retrieved successfully" : "No object found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getObjectById:', error);
        return {
            success: false,
            message: "Failed to retrieve object due to a database error",
            data: []
        };
    }
}

async function getObjectsByCompanyId(company_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_objects_by_company_id(?)`,
            [company_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Company objects retrieved successfully" : "No objects found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getObjectsBycompanyId:', error);
        return {
            success: false,
            message: "Failed to retrieve company objects types due to a database error",
            data: []
        };
    }
}
async function getObjectsByUserId(user_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_objects_by_user_id(?)`,
            [user_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "User objects retrieved successfully" : "No objects found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getUsersBycompanyId:', error);
        return {
            success: false,
            message: "Failed to retrieve user objects types due to a database error",
            data: []
        };
    }
}
async function getAllObjects() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_objects()`
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Company objects retrieved successfully" : "No objects found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllObjects:', error);
        return {
            success: false,
            message: "Failed to retrieve  objects types due to a database error",
            data: []
        };
    }
}
async function getAllZoning() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_zoning()`
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Zoning retrieved successfully" : "No zoning found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllZoning:', error);
        return {
            success: false,
            message: "Failed to retrieve  zoning types due to a database error",
            data: []
        };
    }
}
async function getAllTypes() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_types()`
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Types retrieved successfully" : "No types found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllTypes:', error);
        return {
            success: false,
            message: "Failed to retrieve   types due to a database error",
            data: []
        };
    }
}
async function updateObjectDetails(object_id, name, street, object_number, zip_code, location, image_url) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_object_details(?,?,?,?,?,?,?)`,
            [object_id, name, street, object_number, zip_code, location, image_url]
        );

        const data = result[0] || [];

        console.log(data);
        return {
            success: data.length > 0,
            message: "Object details updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateObjectDetails:', error);
        return {
            success: false,
            message: "Failed to update object details due to a database error",
            data: null
        };
    }
}
async function updateObjectField(object_id, table, field,value) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_object_field(?,?,?,?)`,
            [object_id, table, field,value]
        );

        const data = result[0] || [];

        console.log(data);
        return {
            success: data.length > 0,
            message: "Object field updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateObjectField:', error);
        return {
            success: false,
            message: "Failed to update object field due to a database error",
            data: null
        };
    }
}



async function addUserToObject(object_id, user_id, is_primary) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.add_user_to_object(?,?,?)`,
            [object_id, user_id, is_primary]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Add user to object created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in addUserToObject:', error);
        return {
            success: false,
            message: "Failed to add user to object due to a database error",
            data: null
        };
    }
}




async function deleteUsersFromObject(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_users_from_object(?)`,
            [contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Users deleted from object successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteUsersFromObject:', error);
        return {
            success: false,
            message: "Failed to delete users from object due to a database error",
            data: null
        };
    }
}


async function removeUserFromObject(object_id, user_id) {
    try {

        // console.log(contract_id, tenant_id);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.remove_user_from_object(?,?)`,
            [object_id, user_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User removed from Object successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in removeUserFromObject:', error);
        return {
            success: false,
            message: "Failed to remove user from object due to a database error",
            data: null
        };
    }
}


async function createObjectMedia(object_id, doc_url, file_name, creator_id, creator_type) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_object_media(?,?,?,?,?)`,
            [object_id, doc_url, file_name, creator_id, creator_type]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "New object media created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createObjecttMedia:', error);
        return {
            success: false,
            message: "Failed to create new object media due to a database error",
            data: null
        };
    }
}
async function createQuickObject(name, address, company) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_quick_object(name,address,company)`,
            [name, address, company]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "New object  created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createQuickObject:', error);
        return {
            success: false,
            message: "Failed to create new object  due to a database error",
            data: null
        };
    }
}

async function createObject(json) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_object(?)`,
            [json]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "New object  created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createObjectt:', error);
        return {
            success: false,
            message: "Failed to create new object  due to a database error",
            data: null
        };
    }
}

async function deleteDocumentById(document_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_document_by_id(?)`,
            [document_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "document deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteDocumentById:', error);
        return {
            success: false,
            message: "Failed to delete document due to a database error",
            data: null
        };
    }
}


async function updateFileName(document_id,file_name) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_file_name(?,?)`,
            [document_id, file_name]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "File name updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateFileName:', error);
        return {
            success: false,
            message: "Failed to update file name due to a database error",
            data: null
        };
    }
}


async function getAllObjectPermissions(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_object_permissions(?)`,
            [object_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Object permissions retrieved successfully" : "No object permissions found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllObjectPermissions:', error);
        return {
            success: false,
            message: "Failed to retrieve object permissions due to a database error",
            data: []
        };
    }
}



async function getObjectRecentBookings(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_recent_bookings(?)`,
            [object_id]
        );

        const requestTypes = result[0] || []; // Ensure valid data

        return {
            success: requestTypes.length > 0,
            message: requestTypes.length > 0 ? "Building recent bookings retrieved successfully" : "No request types found",
            data: requestTypes
        };
    } catch (error) {
        console.error('Error in getObjectRecentBookings:', error);
        return {
            success: false,
            message: "Failed to retrieve object recent bookings due to a database error",
            data: []
        };
    }
}


async function getObjectAllRequests(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_all_requests(?)`,
            [object_id]
        );

        const requests = result[0] || []; // Ensure valid data

        return {
            success: requests.length > 0,
            message: requests.length > 0 ? "Building requests retrieved successfully" : "No buildings requests found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getObjectsAllRequests:', error);
        return {
            success: false,
            message: "Failed to retrieve object requests due to a database error",
            data: []
        };
    }
}

module.exports = {

    getObjectLastAnnouncement: getObjectLastAnnouncement,
    getObjectRequestLogs: getObjectRequestLogs,
    getObjectContactNumbers: getObjectContactNumbers,
    getObjectPosts: getObjectPosts,
    getObjectById: getObjectById,
    getObjectsByCompanyId: getObjectsByCompanyId,
    getAllObjects: getAllObjects,
    getAllZoning: getAllZoning,
    getAllTypes: getAllTypes,
    updateObjectDetails: updateObjectDetails,
    updateObjectField: updateObjectField,
    deleteUsersFromObject: deleteUsersFromObject,
    removeUserFromObject: removeUserFromObject,
    createObjectMedia: createObjectMedia,
    deleteDocumentById: deleteDocumentById,
    updateFileName: updateFileName,
    getAllObjectPermissions: getAllObjectPermissions,
    getObjectRecentBookings: getObjectRecentBookings,
    getObjectAllRequests: getObjectAllRequests,
    addUserToObject: addUserToObject,
    createObject: createObject,
    createQuickObject: createQuickObject,
    getObjectsByUserId:getObjectsByUserId
}


