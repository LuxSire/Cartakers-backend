const express = require('express');
const router = express.Router();
const dboperations = require('../service/objects/dboperations'); // Import the appropriate database operations module
const e = require('express');
const { json } = require('body-parser');


router.post('/get-user-docs', (request, response) => {
    const user_id = request.query.user_id || request.body.user_id;


    dboperations.getUserDocs(user_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-docs:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-object-docs', async (request, response) => {
    const object_id = request.body.object_id || request.query.object_id;

    if (!object_id) {
        return response.status(400).json({ success: false, message: "object_id is required" });
    }

    try {
        const result = await dboperations.getObjectDocs(object_id);
        response.json(result);
    } catch (error) {
        console.error("Error in /get-object-docs:", error);
        response.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get all document URLs for an object from Azure Blob Storage
router.post('/get-object-doc-urls', (request, response) => {
    const object_id = request.body.object_id || request.query.object_id;

    if (!object_id) {
        return response.status(400).json({ success: false, message: "object_id is required" });
    }

    dboperations.getObjectDocUrls(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-doc-urls:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
// Get Last Object Announcement
router.post('/get-object-last-announcement', (request, response) => {
    const object_id = request.query.object_id;


    dboperations.getObjectLastAnnouncement(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-last-announcement:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get object Request Logs
router.post('/get-object-request-logs', (request, response) => {
    const request_id = request.query.request_id;

  

    dboperations.getObjectRequestLogs(request_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-request-logs:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-object-contact-numbers', (request, response) => {
    const object_id = request.query.object_id;

  

    dboperations.getObjectContactNumbers(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-contact-numbers:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-object-posts', (request, response) => {
    const object_id = request.query.object_id;
    const user_id = request.query.user_id;
    const user_type = request.query.user_type;

    

  

    dboperations.getObjectPosts(object_id, user_id, user_type)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-posts:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});






router.post('/get-object-by-id', (request, response) => {
    const id = request.body.id || request.query.id;


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


router.post('/get-objects-by-user-id', (request, response) => {
        const user_id = request.body.user_id || request.query.user_id;

    if (!user_id) {
        return response.status(400).json({ success: false, message: "user_id is required" });
    }



    dboperations.getObjectsByUserId(user_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-objects-by-user:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-objects-by-company-id', (request, response) => {
    const company = request.query.company_id || request.body.company_id;

    if (!company) {
        return response.status(400).json({ success: false, message: "company_id is required" });
    }

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
router.post('/get-all-objects', (request, response) => {
    



    dboperations.getAllObjects()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-objects:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-zoning', (request, response) => {
    dboperations.getAllZoning()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-zoning:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-types', (request, response) => {
    dboperations.getAllTypes()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-types:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-object-details', (request, response) => {
    const { object_id, name, street,  zip_code, location, image_url,description } = request.body;


    dboperations.updateObjectDetails(object_id, name, street, zip_code, location, image_url,description)
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

router.post('/update-unit-details', (request, response) => {
    const { unit_id, description,sqm } = request.body;


    dboperations.updateUnitDetails(unit_id,description,sqm)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-unit-details:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/create-unit', (request, response) => {
        const { object_id } = request.body;


    dboperations.createUnit(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-unit-details:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-object-field', (request, response) => {
    const { object_id, table, field,value } = request.query;


    dboperations.updateObjectField(object_id, table, field,value)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-object-field:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/add-user-to-object', (request, response) => {
    const object_id = request.query.object_id;
    const user_id = request.body.user_id;

    //console.log("Adding user to object:", contract_id, tenant_id, is_primary);

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
    const object_id = request.query.object_id;


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
router.post('/remove-permission', (request, response) => {
    const permission_id = request.query.id || request.body.id;


    dboperations.removePermission(permission_id)
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
router.post('/create-permission', (request, response) => {

    const user_id = request.body.user_id || request.query.user_id;
    const object_id = request.body.object_id || request.query.object_id;
    const role_id = request.body.role_id || request.query.role_id;

    console.log("Creating permission for user:", user_id, object_id, role_id);
    dboperations.createPermission(user_id, object_id, role_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-permission:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/create-quick-object', (request, response) => {
    var {  name, address,  company} = request.query;


    dboperations.createQuickObject(name, address,  company)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-quick-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/create-object', (request, response) => {
         const jsonData = request.body;


                 // Convert JavaScript object to JSON string
        const jsonString = JSON.stringify({
            company: jsonData.company_id,
            name: jsonData.name,
            address: jsonData.street,
            zip_code: jsonData.zip_code || '',
            location: jsonData.location || '',
            description: jsonData.description || '',
            city: jsonData.country || '',
            state: jsonData.state || '',
            city: jsonData.city || '',
            price: jsonData.price || 0,
            currency: jsonData.currency || '',
            floors: jsonData.total_floors || 1,
            units: jsonData.total_units || 1,
            type: jsonData.type || 'Office',
            img_url: jsonData.img_url || '',
            occupancy: jsonData.occupancy || '',
            zoning: jsonData.zoning || '',
            country: jsonData.country || '',
            yield_net: jsonData.yield_net || 0,
            yield_gross: jsonData.yield_gross || 0,

           
        });


    if (!jsonData) {
        return response.status(400).json({ success: false, message: "Missing jsonfile" });
    }
    console.log("Creating object with data:", jsonString);
    dboperations.createObject(jsonString)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-object', (request, response) => {
         const jsonData = request.body;


                 // Convert JavaScript object to JSON string
        const jsonString = JSON.stringify({
            id: jsonData.id,
            company: jsonData.company_id,
            name: jsonData.name,
            address: jsonData.street,
            street: jsonData.street,
            zip_code: jsonData.zip_code || '',
            location: jsonData.location || '',
            description: jsonData.description || '',
            city: jsonData.country || '',
            state: jsonData.state || '',
            status: jsonData.status || '',
            city: jsonData.city || '',
            price: jsonData.price || 0,
            currency: jsonData.currency || '',
            floors: jsonData.total_floors || 1,
            units: jsonData.total_units || 1,
            type: jsonData.type || 'Office',
            img_url: jsonData.img_url || '',
            occupancy: jsonData.occupancy || '',
            zoning: jsonData.zoning || '',
            country: jsonData.country || '',
            yield_net: jsonData.yield_net || 0,
            yield_gross: jsonData.yield_gross || 0,
        });


    if (!jsonData) {
        return response.status(400).json({ success: false, message: "Missing jsonfile" });
    }
    console.log("Updating object with data:", jsonString);
    dboperations.updateObject(jsonString)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

/*
{
  "company": 1,
  "address": "123 Main St",
  "name": "mine"
}

*/ 
router.post('/create-object-media', (request, response) => {
    var {  object_id, doc_url,  file_name, creator_id, creator_type} = request.query;


    dboperations.createObjectMedia(object_id, doc_url, file_name, creator_id, creator_type)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-object-media:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-document-by-id', (request, response) => {
    const document_id = request.query.document_id;


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
    const document_id = request.query.document_id;
    const file_name = request.query.file_name;


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

router.post('/get-all-permissions', (request, response) => {

    dboperations.getAllPermissions()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-permissions:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-all-permissions', (request, response) => {

    dboperations.getAllPermissions()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-permissions:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-bookingo-categories', (request, response) => {
    dboperations.getAllBookingCategories()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-booking-categories:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-zonings', (request, response) => {

    dboperations.getAllZonings()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-zonings:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-occupancies', (request, response) => {

    dboperations.getAllOccupancies()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-occupancies:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-status', (request, response) => {

    dboperations.getAllStatus()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-countries', (request, response) => {

    dboperations.getAllCountries()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);          
            
        })
        .catch(error => {
            console.error("Error in /get-all-countries:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-currencies', (request, response) => {

    dboperations.getAllCurrencies()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);          
            
        })
        .catch(error => {
            console.error("Error in /get-all-currencies:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-all-updates', (request, response) => {

    dboperations.getAllUpdates()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-updates:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-zoning-types', (request, response) => {

    dboperations.getAllTypes()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-types:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-all-object-permissions', (request, response) => {
    const object_id = request.query.id || request.body.id;

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
router.post('/get-user-object-permissions', (request, response) => {
    const object_id = request.query.object_id || request.body.object_id;
    const user_id = request.query.user_id || request.body.user_id;

    dboperations.getUserObjectPermissions(object_id, user_id    )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-object-permissions:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-object-units-by-id', (request, response) => {
    const object_id = request.query.object_id || request.body.object_id;

    dboperations.getAllObjectUnits(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-object-units-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/delete-object-by-id', (request, response) => {
    const object_id = request.query.id || request.body.id;


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

router.post('/delete-unit-by-id', (request, response) => {
    const unit_id = request.query.id || request.body.id;

    dboperations.deleteUnitById(unit_id)
        .then(result => {
            // if (!result.success) {
            //     return response.status(404).json(result);
            // }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-unit-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-object-all-requests', (request, response) => {
    const object_id = request.query.object_id || request.body.object_id;

  

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