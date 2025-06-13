require('dotenv').config();

const pool = require('../dbconfig'); // Ensure this exports the mysql2/promise pool


// Get Last Building Announcement
async function getBuildingLastAnnouncement(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_last_announcement(?)`,
            [building_id]
        );

        const announcement = result[0] || []; // Ensure valid data

        return {
            success: announcement.length > 0,
            message: announcement.length > 0 ? "Building announcement retrieved successfully" : "No announcement found",
            data: announcement
        };
    } catch (error) {
        console.error('Error in getBuildingLastAnnouncement:', error);
        return {
            success: false,
            message: "Failed to retrieve building announcement due to a database error",
            data: []
        };
    }
}

// Get Building Request Types
async function getBuildingRequestTypes(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_request_types(?)`,
            [building_id]
        );

        const requestTypes = result[0] || []; // Ensure valid data

        return {
            success: requestTypes.length > 0,
            message: requestTypes.length > 0 ? "Building request types retrieved successfully" : "No request types found",
            data: requestTypes
        };
    } catch (error) {
        console.error('Error in getBuildingRequestTypes:', error);
        return {
            success: false,
            message: "Failed to retrieve building request types due to a database error",
            data: []
        };
    }
}

// Get Building Request Logs
async function getBuildingRequestLogs(request_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_request_logs(?)`,
            [request_id]
        );

        const requestLogs = result[0] || []; // Ensure valid data

        return {
            success: requestLogs.length > 0,
            message: requestLogs.length > 0 ? "Building request logs retrieved successfully" : "No request logs found",
            data: requestLogs
        };
    } catch (error) {
        console.error('Error in getBuildingRequestLogs:', error);
        return {
            success: false,
            message: "Failed to retrieve building request logs due to a database error",
            data: []
        };
    }
}


async function getBuildingContactNumbers(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_contact_numbers(?)`,
            [building_id]
        );

        const requestLogs = result[0] || []; // Ensure valid data

        return {
            success: requestLogs.length > 0,
            message: requestLogs.length > 0 ? "Building contact numbers retrieved successfully" : "No contact numbers logs found",
            data: requestLogs
        };
    } catch (error) {
        console.error('Error in getBuildingContactNumbers:', error);
        return {
            success: false,
            message: "Failed to retrieve building contact numbers due to a database error",
            data: []
        };
    }
}


async function getBuildingPosts(building_id, user_id, user_type) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_posts(?,?,?)`,
            [building_id, user_id, user_type]
        );

        const buildingPosts = result || []; // Ensure valid data

        return {
            success: buildingPosts.length > 0,
            message: buildingPosts.length > 0 ? "Building posts retrieved successfully" : "No  posts found",
            data: buildingPosts
        };
    } catch (error) {
        console.error('Error in getBuildingPosts:', error);
        return {
            success: false,
            message: "Failed to retrieve building posts due to a database error",
            data: []
        };
    }
}



async function getBuildingBookingTypes(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_booking_types(?)`,
            [building_id]
        );

        const bookingtTypes = result[0] || []; // Ensure valid data

        return {
            success: bookingtTypes.length > 0,
            message: bookingtTypes.length > 0 ? "Building booking types retrieved successfully" : "No booking types found",
            data: bookingtTypes
        };
    } catch (error) {
        console.error('Error in getBuildingBookingTypes:', error);
        return {
            success: false,
            message: "Failed to retrieve building booking types due to a database error",
            data: []
        };
    }
}


async function getBuildingAmenityUnitTimeslots(amenity_unit_id, date, exclude_booking_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_amenity_unit_availability(?,?,?)`,
            [amenity_unit_id, date, exclude_booking_id ]
        );

     //   console.log(amenity_unit_id, date);

        //console.log(result);

        const timeslots = result[0] || []; // Ensure valid data

        return {
            success: timeslots.length > 0,
            message: timeslots.length > 0 ? "Building timeslots retrieved successfully" : "No timeslots found",
            data: timeslots
        };
    } catch (error) {
        console.error('Error in getBuildingAmenityUnitTimeslots:', error);
        return {
            success: false,
            message: "Failed to retrieve building timeslots due to a database error",
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

async function getBuildingsByAgencyId(agency_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_buildings_by_agency_id(?)`,
            [agency_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Agency buildings retrieved successfully" : "No buildings found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getBuildingsByAgencyId:', error);
        return {
            success: false,
            message: "Failed to retrieve agency buildings types due to a database error",
            data: []
        };
    }
}

async function updateBuildingDetails(building_id, name, street, building_number, zip_code, location, image_url) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_building_details(?,?,?,?,?,?,?)`,
            [building_id, name, street, building_number, zip_code, location, image_url]
        );

        const data = result[0] || [];

        console.log(data);
        return {
            success: data.length > 0,
            message: "Building details updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateBuildingDetails:', error);
        return {
            success: false,
            message: "Failed to update building details due to a database error",
            data: null
        };
    }
}



async function getBuildingUnitsById(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_units_by_id(?)`,
            [building_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Building  units retrieved successfully" : "No building units found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getBuildingUnitsById:', error);
        return {
            success: false,
            message: "Failed to retrieve building units types due to a database error",
            data: []
        };
    }
}

async function getBuildingUnitContractsByUnitId(unit_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_unit_contracts_by_unit_id(?)`,
            [unit_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Building unit contracts retrieved successfully" : "No building unit contracts found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getBuildingUnitContractsByUnitId:', error);
        return {
            success: false,
            message: "Failed to retrieve building unit contract due to a database error",
            data: []
        };
    }
}


async function getAllNonContractTenantsByBuildingId(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_non_contract_tenants_by_building_id(?)`,
            [building_id]
        );

        const buildingTenats = result[0] || []; // Ensure valid data

        return {
            success: buildingTenats.length > 0,
            message: buildingTenats.length > 0 ? "Building non contract tenants retrieved successfully" : "No building non contract tenants found",
            data: buildingTenats
        };
    } catch (error) {
        console.error('Error in getAllNonContractTenantsByBuildingId:', error);
        return {
            success: false,
            message: "Failed to retrieve building non contract tenants due to a database error",
            data: []
        };
    }
}


async function getContractById(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_contract_by_id(?)`,
            [contract_id]
        );

        const contract = result[0] || []; // Ensure valid data

        return {
            success: contract.length > 0,
            message: contract.length > 0 ? "Building contract  retrieved successfully" : "No building contract found",
            data: contract
        };
    } catch (error) {
        console.error('Error in getContractById:', error);
        return {
            success: false,
            message: "Failed to retrieve building contract due to a database error",
            data: []
        };
    }
}


async function addTenantToContract(contract_id, tenant_id, is_primary) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.add_tenant_to_contract(?,?,?)`,
            [contract_id, tenant_id, is_primary]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Add tenant to contract created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in addTenantToContract:', error);
        return {
            success: false,
            message: "Failed to add tenant to contract due to a database error",
            data: null
        };
    }
}




async function deleteTenantsFromContract(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_tenants_from_contract(?)`,
            [contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenants deleted from contractsuccessfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteTenantsFromContract:', error);
        return {
            success: false,
            message: "Failed to delete tenants from contract due to a database error",
            data: null
        };
    }
}


async function updateContractDetails(contract_id, contract_code ,start_date, end_date, status_id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_contract_details(?,?,?,?,?)`,
            [contract_id, contract_code ,start_date, end_date, status_id]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "Building contract details updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateContractDetails:', error);
        return {
            success: false,
            message: "Failed to update building contract details due to a database error",
            data: null
        };
    }
}


async function getActiveContractByUnitId(unit_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_active_contract_by_unit_id(?)`,
            [unit_id]
        );

        const contract = result[0] || []; // Ensure valid data

        return {
            success: contract.length > 0,
            message: contract.length > 0 ? "Active contract retrieved successfully" : "No active contract found",
            data: contract
        };
    } catch (error) {
        console.error('Error in getActiveContractByUnitId:', error);
        return {
            success: false,
            message: "Failed to retrieve active contract due to a database error",
            data: []
        };
    }
}


async function updateUnitStatus(unit_id, status_id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.update_unit_status(?,?)`,
            [unit_id, status_id]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "Unit status updated successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in updateUnitStatus:', error);
        return {
            success: false,
            message: "Failed to update unit status due to a database error",
            data: null
        };
    }
}


async function createContract(contract_code ,start_date, status_id, unit_id) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_contract(?,?,?,?)`,
            [contract_code ,start_date, status_id, unit_id]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "New contract created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createContract:', error);
        return {
            success: false,
            message: "Failed to create new contract due to a database error",
            data: null
        };
    }
}




async function getBuildingZoneById(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_zones_by_id(?)`,
            [building_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Building zones retrieved successfully" : "No building zones found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getBuildingZoneById:', error);
        return {
            success: false,
            message: "Failed to retrieve building zones  due to a database error",
            data: []
        };
    }
}

async function getBuildingZoneAssigmentById(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_zone_assignments_by_building_id(?)`,
            [building_id]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Building zone assigment retrieved successfully" : "No building zone assigment found",
            data: buildings
        };
    } catch (error) {
        console.error('Error in getBuildingZoneAssigmentById:', error);
        return {
            success: false,
            message: "Failed to retrieve building zone assigment due to a database error",
            data: []
        };
    }
}

async function assignUnitsToZone(zone_id, unit_ids) {
    try {


       // console.log(zone_id, unit_ids);
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.assign_units_to_zone(?,?)`,
            [zone_id, unit_ids]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Building units assigment successfully" : "No building units assigment done",
            data: buildings
        };
    } catch (error) {
        console.error('Error in assignUnitsToZone:', error);
        return {
            success: false,
            message: "Failed to retrieve result of unit assigment due to a database error",
            data: []
        };
    }
}


async function createAmenityZone(building_id, amenity_zone_name) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_amenity_zone(?,?)`,
            [building_id, amenity_zone_name]
        );

        const buildings = result[0] || []; // Ensure valid data

        return {
            success: buildings.length > 0,
            message: buildings.length > 0 ? "Created new amenity zone successfully" : "No amenity zone created",
            data: buildings
        };
    } catch (error) {
        console.error('Error in createAmenityZone:', error);
        return {
            success: false,
            message: "Failed to retrieve of new amenity zone due to a database error",
            data: []
        };
    }
}

async function removeTenantFromContract(contract_id, tenant_id) {
    try {

        // console.log(contract_id, tenant_id);

        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.remove_tenant_from_contract(?,?)`,
            [contract_id, tenant_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "Tenant removed from contract successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in removeTenantFromContract:', error);
        return {
            success: false,
            message: "Failed to remove tenant from contract due to a database error",
            data: null
        };
    }
}


async function createContractMedia(contract_id, doc_url, file_name, creator_id, creator_type) {
    try {


        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.create_contract_media(?,?,?,?,?)`,
            [contract_id, doc_url, file_name, creator_id, creator_type]
        );

        const data = result[0] || [];

    //    console.log(data);
        return {
            success: data.length > 0,
            message: "New contract media created successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in createContractMedia:', error);
        return {
            success: false,
            message: "Failed to create new contract media due to a database error",
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


async function deleteContractById(contract_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.delete_contract_by_id(?)`,
            [contract_id]
        );

        const data = result[0] || [];
        return {
            success: data.length > 0,
            message: "contract deleted successfully",
            data: data
        };
    } catch (error) {
        console.error('Error in deleteContractById:', error);

        return {
            success: false,
            message: "Failed to delete contract due to a database error",
            sqlMessage: error,
            data: null
        };
    }
}


async function getBuildingRecentBookings(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_recent_bookings(?)`,
            [building_id]
        );

        const requestTypes = result[0] || []; // Ensure valid data

        return {
            success: requestTypes.length > 0,
            message: requestTypes.length > 0 ? "Building recent bookings retrieved successfully" : "No request types found",
            data: requestTypes
        };
    } catch (error) {
        console.error('Error in getBuildingRecentBookings:', error);
        return {
            success: false,
            message: "Failed to retrieve building recent bookings due to a database error",
            data: []
        };
    }
}


async function getBuildingAllRequests(building_id) {
    try {
        const [result] = await pool.execute(
            `CALL ${process.env['DB_DATABASE']}.get_building_all_requests(?)`,
            [building_id]
        );

        const requests = result[0] || []; // Ensure valid data

        return {
            success: requests.length > 0,
            message: requests.length > 0 ? "Building requests retrieved successfully" : "No buildings requests found",
            data: requests
        };
    } catch (error) {
        console.error('Error in getBuildingAllRequests:', error);
        return {
            success: false,
            message: "Failed to retrieve building requests due to a database error",
            data: []
        };
    }
}

module.exports = {

    getBuildingLastAnnouncement: getBuildingLastAnnouncement,
    getBuildingRequestTypes: getBuildingRequestTypes,
    getBuildingRequestLogs: getBuildingRequestLogs,
    getBuildingContactNumbers: getBuildingContactNumbers,
    getBuildingPosts: getBuildingPosts,
    getBuildingBookingTypes: getBuildingBookingTypes,
    getBuildingAmenityUnitTimeslots: getBuildingAmenityUnitTimeslots,
    getObjectById: getObjectById,
    getBuildingsByAgencyId: getBuildingsByAgencyId,
    updateBuildingDetails: updateBuildingDetails,
    getBuildingUnitsById: getBuildingUnitsById,
    getBuildingUnitContractsByUnitId: getBuildingUnitContractsByUnitId,
    getAllNonContractTenantsByBuildingId: getAllNonContractTenantsByBuildingId,
    getContractById: getContractById,
    addTenantToContract: addTenantToContract,
    deleteTenantsFromContract: deleteTenantsFromContract,
    updateContractDetails: updateContractDetails,
    getActiveContractByUnitId: getActiveContractByUnitId,
    updateUnitStatus: updateUnitStatus,
    createContract: createContract,
    getBuildingZoneById: getBuildingZoneById,
    getBuildingZoneAssigmentById: getBuildingZoneAssigmentById,
    assignUnitsToZone: assignUnitsToZone,
    createAmenityZone: createAmenityZone,
    removeTenantFromContract: removeTenantFromContract,
    createContractMedia: createContractMedia,
    deleteDocumentById: deleteDocumentById,
    updateFileName: updateFileName,
    getAllObjectPermissions: getAllObjectPermissions,
    deleteContractById: deleteContractById,
    getBuildingRecentBookings: getBuildingRecentBookings,
    getBuildingAllRequests: getBuildingAllRequests
    
}


