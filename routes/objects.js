const express = require('express');
const router = express.Router();
const dboperations = require('../service/objects/dboperations'); // Import the appropriate database operations module
const e = require('express');

// Get Last Building Announcement
router.post('/get-building-last-announcement', (request, response) => {
    const building_id = request.body.building_id;


    dboperations.getBuildingLastAnnouncement(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-last-announcement:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get Building Request Types
router.post('/get-building-request-types', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getBuildingRequestTypes(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-request-types:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get Building Request Logs
router.post('/get-building-request-logs', (request, response) => {
    const request_id = request.body.request_id;

  

    dboperations.getBuildingRequestLogs(request_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-request-logs:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-building-contact-numbers', (request, response) => {
    const building_id = request.body.building_id;

  

    dboperations.getBuildingContactNumbers(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-contact-numbers:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-building-posts', (request, response) => {
    const building_id = request.body.building_id;
    const user_id = request.body.user_id;
    const user_type = request.body.user_type;

    

  

    dboperations.getBuildingPosts(building_id, user_id, user_type)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-posts:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/get-building-booking-types', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getBuildingBookingTypes(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-booking-types:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/get-building-amenity-unit-timeslots', (request, response) => {
    const amenity_unit_id = request.body.amenity_unit_id;
    const date = request.body.date;
    var exclude_booking_id = request.body.exclude_booking_id;

    if (exclude_booking_id === undefined || exclude_booking_id === null) {
        exclude_booking_id = 0;
    }


 //   console.log(amenity_unit_id, date);

    dboperations.getBuildingAmenityUnitTimeslots(amenity_unit_id, date, exclude_booking_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-amenity-unit-timeslots:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });

});



router.post('/get-object-by-id', (request, response) => {
    const id = request.query.id;


    dboperations.getObjectById(id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});




router.post('/get-objects-by-company-id', (request, response) => {
    const company = request.query.company;



    dboperations.getObjectsByCompanyId(company)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-objects-by-company:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-object-details', (request, response) => {
    const { object_id, name, street,  zip_code, location, image_url } = request.body;


    dboperations.updateObjectDetails(object_id, name, street, zip_code, location, image_url)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-object-details:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-building-units-by-id', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getBuildingUnitsById(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-units-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-building-unit-contracts-by-unit-id', (request, response) => {
    const unit_id = request.body.unit_id;

    dboperations.getBuildingUnitContractsByUnitId(unit_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-unit-contracts-by-unit-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-building-non-contract-tenants-by-building-id', (request, response) => {
    const building_id = request.body.building_id;

    dboperations.getAllNonContractTenantsByBuildingId(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-non-contract-tenants-by-building-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-contract-by-id', (request, response) => {
    const contract_id = request.body.contract_id;

    dboperations.getContractById(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-contract-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/add-user-to-object', (request, response) => {
    const object_id = request.query.object_id;
    const user_id = request.body.user_id;

    //console.log("Adding tenant to contract:", contract_id, tenant_id, is_primary);

    dboperations.addUserToObject(object_id, user_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /add-user-to-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-user-from-object', (request, response) => {
    const object_id = request.body.object_id;


    dboperations.deleteUserFromObject(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-user-from-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/update-contract-details', (request, response) => {
    var { contract_id, contract_code, start_date, end_date, status_id} = request.body;


   // console.log(end_date);
    if(end_date === undefined || end_date === null || end_date === "") {
        end_date = null;
    }

    if (start_date === undefined || start_date === null || start_date === "") {
        start_date = null;
    }


    dboperations.updateContractDetails(contract_id, contract_code, start_date, end_date, status_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-contract-details:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-active-contract-by-unit-id', (request, response) => {
    const unit_id = request.body.unit_id;

    dboperations.getActiveContractByUnitId(unit_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-active-contract-by-unit-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-unit-status', (request, response) => {
    const { unit_id, status_id} = request.body;

    dboperations.updateUnitStatus(unit_id, status_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-unit-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/create-contract', (request, response) => {
    var {  contract_code, start_date,  status_id, unit_id} = request.body;




    if (start_date === undefined || start_date === null || start_date === "") {
        start_date = null;
    }


    dboperations.createContract(contract_code, start_date, status_id, unit_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-contract:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-building-zones-by-id', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getBuildingZoneById(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-zones-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-building-zone-assigment-by-id', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getBuildingZoneAssigmentById(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-zones-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/assign-units-to-zone', (request, response) => {
    const zone_id = request.body.zone_id;
    const unit_ids = Array.isArray(request.body.unit_ids)
    ? request.body.unit_ids.join(',') // Convert to "101,102,103"
    : request.body.unit_ids;


    console.log("Assigning units to zone:", zone_id, unit_ids);


    return;


    dboperations.assignUnitsToZone(zone_id, unit_ids)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /assign-units-to-zone:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/assign-units-batch', async (req, res) => {
    const assignments = req.body.assignments;
  
    if (!Array.isArray(assignments)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }
  
    try {
      for (const { zone_id, unit_ids } of assignments) {
        const unitIdString = unit_ids.join(',');
        await dboperations.assignUnitsToZone(zone_id, unitIdString);
      }
  
      return res.json({
        success: true,
        message: "All zone assignments processed",
      });
    } catch (err) {
      console.error("Error in /assign-units-batch:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  

  router.post('/create-amenity-zone', (request, response) => {
    const building_id = request.body.building_id;
    const amenity_zone_name = request.body.amenity_zone_name;



    dboperations.createAmenityZone(building_id, amenity_zone_name)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-amenity-zone:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/remove-user-from-object', (request, response) => {
    const object_id = request.query.object_id;
    const user_id = request.query.user_id;


    dboperations.removeUserFromObject(object_id,user_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /remove-user-from-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-all-documents-by-object-id', (request, response) => {
    const object_id = request.query.object_id;

    dboperations.getAllNonContractTenantsByBuildingId(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-non-contract-tenants-by-building-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/create-contract-media', (request, response) => {
    var {  contract_id, doc_url,  file_name, creator_id, creator_type} = request.body;


    dboperations.createContractMedia(contract_id, doc_url, file_name, creator_id, creator_type)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-contract-media:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-document-by-id', (request, response) => {
    const document_id = request.body.document_id;


    dboperations.deleteDocumentById(document_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-document-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/update-file-name', (request, response) => {
    const document_id = request.body.document_id;
    const file_name = request.body.file_name;


    dboperations.updateFileName(document_id, file_name)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-file-name:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/get-all-object-permissions', (request, response) => {
    const object_id = request.query.id;

    dboperations.getAllObjectPermissions(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-object-permissions:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-object-by-id', (request, response) => {
    const object_id = request.query.object_id;


    dboperations.deleteObjectById(object_id)
        .then(result => {
            // if (!result.success) {
            //     return response.status(404).json(result);
            // }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-object-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-building-request-types', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getBuildingRequestTypes(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-request-types:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-building-recent-bookings', (request, response) => {
    const building_id = request.body.building_id;

  

    dboperations.getBuildingRecentBookings(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-building-recent-bookings:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-object-all-requests', (request, response) => {
    const object_id = request.query.object_id;

  

    dboperations.getObjectAllRequests(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-all-requests:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


module.exports = router;