const express = require('express');
const router = express.Router();
const dboperations = require('../service/objects/dboperations'); // Import the appropriate database operations module
const e = require('express');

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
     const json = JSON.stringify(request.body);

    if (!json) {
        return response.status(400).json({ success: false, message: "Missing jsonfile" });
    }
    dboperations.createObject(json)
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