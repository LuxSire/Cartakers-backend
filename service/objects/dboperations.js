require('dotenv').config();

const { get } = require('request');
const pool = require('../dbconfig'); // Ensure this exports the mysql2/promise pool

const { BlobServiceClient } = require('@azure/storage-blob');
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'docs';
const storageAccount = process.env.AZURE_BLOB_NAME;

async function getObjectDocs(object_id) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const prefix = `objects/${object_id}/`;
        let docs = [];
        for await (const blob of containerClient.listBlobsFlat({ prefix })) {
            docs.push({
                url: `https://${storageAccount}.blob.core.windows.net/${containerName}/${blob.name}`,
                name: blob.name.split('/').pop(),
                contentType: blob.properties.contentType,
                size: blob.properties.contentLength,
                lastModified: blob.properties.lastModified,
                etag: blob.properties.etag

            });
        }

        return {
            success: true,
            message: docs.length ? "Documents found" : "No documents found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getObjectDocs:', error);
        return {
            success: false,
            message: "Failed to retrieve documents",
            data: []
        };
    }
}
async function getUserDocs(user_id) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const prefix = `users/${user_id}/`;
        let docs = [];
        for await (const blob of containerClient.listBlobsFlat({ prefix })) {
            docs.push({
                url: `https://${storageAccount}.blob.core.windows.net/${containerName}/${blob.name}`,
                name: blob.name.split('/').pop(),
                contentType: blob.properties.contentType,
                size: blob.properties.contentLength,
                lastModified: blob.properties.lastModified,
                etag: blob.properties.etag

            });
        }

        return {
            success: true,
            message: docs.length ? "Documents found" : "No documents found",
            data: docs
        };
    } catch (error) {
        console.error('Error in getObjectDocs:', error);
        return {
            success: false,
            message: "Failed to retrieve documents",
            data: []
        };
    }
}
async function getObjectDocUrls(object_id) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const prefix = `${object_id}/`;
        let urls = [];
        for await (const blob of containerClient.listBlobsFlat({ prefix })) {
            const url = `https://xmarketstorage.blob.core.windows.net/${containerName}/objects/${blob.name}`;
            urls.push(url);
        }

        return {
            success: true,
            message: urls.length ? "Document URLs found" : "No documents found",
            data: urls
        };
    } catch (error) {
        console.error('Error in getObjectDocUrls:', error);
        return {
            success: false,
            message: "Failed to retrieve document URLs",
            data: []
        };
    }
}
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

        const objects = result[0] || []; // Ensure valid data

        return {
            success: objects.length > 0,
            message: objects.length > 0 ? "User objects retrieved successfully" : "No objects found",
            data: objects
        };
    } catch (error) {
        console.error('Error in getObjesByUserId:', error);
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
async function updateObjectDetails(object_id, name, street, zip_code, location, image_url,description) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_object_details(?,?,?,?,?,?,?)`,
            [object_id, name, street, zip_code, location, image_url,description]
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

async function deleteObjectById(object_id) {
    try {

        // console.log(contract_id, tenant_id);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_object_by_id(?)`,
            [object_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Object deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteObjectByID:', error);
        return {
            success: false,
            message: "Failed to delete object due to a database error",
            data: null
        };
    }
}



async function removePermission(permission_id) {
    try {

        // console.log(contract_id, tenant_id);
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.remove_permission(?)`,
            [permission_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Permission removed successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in removePermission:', error);
        return {
            success: false,
            message: "Failed to remove user from object due to a database error",
            data: null
        };
    }
}

async function createPermission(user_id,object_id) {
    try {

        // console.log(contract_id, tenant_id);
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_permission(?,?)`,
            [user_id,object_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Permission created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createPermission:', error);
        return {
            success: false,
            message: "Failed to create permission due to a database error",
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


async function updateObject(json) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_object(?)`,
            [json]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "Object updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateObject:', error);
        return {
            success: false,
            message: "Failed to update object due to a database error",
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
async function getAllPermissions() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_permissions()`
        );
        
        console.log('All Permissions Result:', result);
        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Permissions retrieved successfully" : "No object permissions found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllPermissions:', error);
        return {
            success: false,
            message: "Failed to retrieve  permissions due to a database error",
            data: []
        };
    }
}
async function getAllOccupancies() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_occupancy()`
        );

        console.log('All Occupancies Result:', result);
        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Occupancies retrieved successfully" : "No object occupancies found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllOccupancies:', error);
        return {
            success: false,
            message: "Failed to retrieve occupancies due to a database error",
            data: []
        };
    }
}
async function getAllZonings() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_zoning()`
        );

        console.log('All Zonings Result:', result);
        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Zonings retrieved successfully" : "No object zonings found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllZonings:', error);
        return {
            success: false,
            message: "Failed to retrieve zonings due to a database error",
            data: []
        };
    }
}
async function getAllTypes() {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_all_types()`
        );

        console.log('All Types Result:', result);
        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Types retrieved successfully" : "No object types found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getAllTypes:', error);
        return {
            success: false,
            message: "Failed to retrieve types due to a database error",
            data: []
        };
    }
}
async function getUserObjectPermissions(object_id,user_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_user_object_permissions(?,?)`,
            [object_id,user_id]
        );

        const objects = result[0] || []; // Ensure valid data

        return {
            success: objects.length > 0,
            message: objects.length > 0 ? "Object user permissions retrieved successfully" : "No object user permissions found",
            data: objects
        };
    } catch (error) {
        console.error('Error in getUserObjectPermissions:', error);
        return {
            success: false,
            message: "Failed to retrieve user object permissions due to a database error",
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
async function removeUserFromObject(object_id, user_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.remove_user_from_object(?, ?)`,
            [object_id, user_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "User removed from object successfully",
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
async function getAllObjectUnits(object_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_object_units_by_id(?)`,
            [object_id]
        );

        const requests = result[0] || []; // Ensure valid data

        return {
            success: requests.length > 0,
            message: requests.length > 0 ? "object units retrieved successfully" : "No object units found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getAllObjectUnits:', error);
        return {
            success: false,
            message: "Failed to retrieve object units due to a database error",
            data: []
        };
    }
}

module.exports = {

    getObjectLastAnnouncement: getObjectLastAnnouncement,
    getObjectRequestLogs: getObjectRequestLogs,
    getObjectContactNumbers: getObjectContactNumbers,
    getObjectPosts: getObjectPosts,
    getAllObjectUnits: getAllObjectUnits,
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
    getObjectsByUserId:getObjectsByUserId,
    getUserObjectPermissions: getUserObjectPermissions,
    getObjectDocUrls: getObjectDocUrls,
    getObjectDocs: getObjectDocs,
    getUserDocs: getUserDocs,
    getAllPermissions: getAllPermissions,
    removePermission: removePermission,
    createPermission: createPermission,
    getAllOccupancies   : getAllOccupancies,
    getAllZonings: getAllZonings,
    getAllTypes: getAllTypes,
    updateObject: updateObject,
    deleteObjectById: deleteObjectById
}


