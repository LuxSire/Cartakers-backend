require('dotenv').config();
const express = require('express');
const router = express.Router();
const dboperations = require('../service/users/dboperations'); // Import the appropriate database operations module

const heicConvert = require('heic-convert');


// Azure Storage settings
const { BlobServiceClient,  generateBlobSASQueryParameters ,StorageSharedKeyCredential, newPipeline, BlobSASPermissions } = require("@azure/storage-blob");
const accountName =  process.env['AZURE_TENANTS10_BLOB_NAME'];
const accountKey = process.env['AZURE_TENANTS10_BLOB_ACCOUNT_KEY'];
const pipeline = newPipeline(new StorageSharedKeyCredential(accountName, accountKey));

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new StorageSharedKeyCredential(accountName, accountKey)
);


const multer = require('multer');
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { authenticateToken } = require('../middleware/auth');

// crypto
const { encrypt, decrypt, cipher, decipher } = require('../service/crypto');
const e = require('express');







  // Azure Storage 

//   router.post('/upload-user-media', upload.single('file'), async (req, res) => {


//     //console.log('upload-user-media');

//     const uploadedFile = req.file;
//     const containerName = req.query.containerName; 
//     const contentType = req.query.contentType;
//     const directoryName = req.query.directoryName; 
//     const newFileName = req.query.newFileName; // Get the new file name from the request body

   

//     if (!uploadedFile) {
//       return res.status(400).json({ message: 'No file uploaded.' });
//     }

//     try {
//       const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, pipeline);
//       const containerClient = blobServiceClient.getContainerClient(containerName);
      
//       // Construct the full blob name including the directory
//       const fullBlobName = `${directoryName}/${newFileName}.${contentType.split('/')[1]}`;

//       const blockBlobClient = containerClient.getBlockBlobClient(fullBlobName);
      
//       await blockBlobClient.uploadData(uploadedFile.buffer, {
//         blobHTTPHeaders: { blobContentType: contentType }
//       });

//       const fullUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fullBlobName}`;

//       return res.status(200).json({ message: 'File uploaded to Azure Blob Storage.', url: fullUrl });
//     } catch (error) {
//       console.error('Error uploading to Azure Blob Storage:', error);
//       return res.status(500).json({ message: 'Internal server error.' });
//     }
//   });


router.post('/upload-user-media', upload.single('file'), async (req, res) => {
    const uploadedFile = req.file;
    let { containerName, contentType, directoryName, newFileName } = req.query;
  
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
  
    try {
      let bufferToUpload = uploadedFile.buffer;
  
      //  Detect and convert .heic
      if (contentType === 'image/heic') {
        const convertedBuffer = await heicConvert({
          buffer: bufferToUpload,
          format: 'JPEG',
          quality: 1
        });
  
        bufferToUpload = convertedBuffer;
        contentType = 'image/jpeg';
        newFileName = newFileName.replace(/\.heic$/i, ''); // remove extension if passed in
      }
  
      const extension = contentType.split('/')[1];
      const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, pipeline);
      const containerClient = blobServiceClient.getContainerClient(containerName);
  
      const fullBlobName = `${directoryName}/${newFileName}.${extension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(fullBlobName);
  
      await blockBlobClient.uploadData(bufferToUpload, {
        blobHTTPHeaders: { blobContentType: contentType }
      });
  
      const fullUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fullBlobName}`;
  
      return res.status(200).json({
        message: 'File uploaded to Azure Blob Storage.',
        url: fullUrl,
        converted: contentType === 'image/jpeg'
      });
    } catch (error) {
      console.error('Error uploading to Azure Blob Storage:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });

  router.delete('/delete-user-directory', async (req, res) => {

   const { containerName, directoryName } = req.body;


            try {
              const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, pipeline);
              const containerClient = blobServiceClient.getContainerClient(containerName);
              
              // List all blobs in the specified directory
              const blobItems = containerClient.listBlobsByHierarchy('/', { prefix: directoryName + '/' });
              
              // Delete each blob in the directory
              for await (const blobItem of blobItems) {
                  const blobClient = containerClient.getBlobClient(blobItem.name);
                  await blobClient.delete();
              }
              
              return res.status(200).json({ status:200, message: 'Directory and its files deleted successfully.' });
          } catch (error) {
              console.error('Error deleting directory and its files:', error);
              return res.status(500).json({status:500,  message: 'Internal server error.' });
          }
  });


  // also for any file, documents
  router.delete('/delete-profile-file', async (req, res) => {
    const { containerName, fileName } = req.body;

    // console.log(req.body);
    // console.log(containerName);
    // console.log(fileName);

    if (!containerName || !fileName) {
        console.log("Missing parameters", { containerName, fileName });
        return res.status(400).json({ status: 400, message: "Container name or file name missing." });
    }

    try {
        const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, pipeline);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Get the blob client for the specific file
        const blobClient = containerClient.getBlobClient(fileName);

        // Check if the file exists
        const exists = await blobClient.exists();
        if (!exists) {
            return res.status(404).json({ status: 404, message: 'File not found.' });
        }

        // Delete the file
        await blobClient.delete();

        return res.status(200).json({ status: 200, message: 'File deleted successfully.' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error.' });
    }
});


router.post('/g-tk-az-media', async (req, res) => {
    const { containerName, blobName } = req.body;

    try {
       
        const sasToken = await generateSasToken(containerName, blobName);
        return res.status(200).json({ status: 200, sasToken });
      //  return res.status(200).json({ status: 200, message: 'URL received sucessfully.' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error.' });
    }
});


async function generateSasToken(containerName, blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Set SAS token expiration time (e.g., 1 hour from now)
    const expiresOn = new Date();
   // expiresOn.setHours(expiresOn.getHours() + 1);
    expiresOn.setMinutes(expiresOn.getMinutes() + 5);

    const permissions = BlobSASPermissions.parse("r"); // Read permissions
    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions,
        startsOn: new Date(),
        expiresOn
    }, new StorageSharedKeyCredential(accountName, accountKey));

    return `${blobClient.url}?${sasToken}`;
}

  // End of Azure Storage




  ////////// start Flutter calls from here


// Validate Tenant Invitation Token
router.post('/validate-tenant-invitation-token', (request, response) => {
    const token = request.body.token;


    dboperations.validateTenantInvitationToken(token)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /validate-tenant-invitation-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/validate-agent-invitation-token', (request, response) => {
    const token = request.body.token;


    dboperations.validateAgentInvitationToken(token)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /validate-agent-invitation-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Register Tenant
router.post('/register-tenant', (request, response) => {
    const tenant = request.body.tenant;


    dboperations.registerTenant(tenant)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /register-tenant:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/register-agent', (request, response) => {
    const agent = request.body.agent;

    //console.log(agent);


    dboperations.registerAgent(agent)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /register-agent:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


// Tenant Login
router.post('/login-tenant', (request, response) => {
    const tenant = request.body.tenant;



    dboperations.loginTenant(tenant)
        .then(result => {
            if (!result.success) {
                return response.status(401).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /login-tenant:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get Tenant by Email
router.post('/get-tenant-by-email', (request, response) => {
    const email = request.body.email;


   //console.log(email);

    dboperations.getTenantByEmail(email )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
  
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-by-email:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-agent-by-email', (request, response) => {
    const email = request.body.email;



    dboperations.getAgentByEmail(email )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
  
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-agent-by-email:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-by-id', (request, response) => {
    const id = request.body.id;



    dboperations.getTenantById(id )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-agent-by-id', (request, response) => {
    const id = request.body.id;



    dboperations.getAgentById(id )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-agent-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


// Get Tenant Upcoming Booking
router.post('/get-tenant-upcoming-booking', (request, response) => {
    const contract_id = request.body.contract_id;



    dboperations.getTenantUpcomingBooking(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-upcoming-booking:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Create Tenant Building Request
router.post('/create-tenant-building-request', (request, response) => {
    const { request_id, tenant_id, unit_id, description, building_id, agency_id, contract_id } = request.body;


    dboperations.createTenantBuildingRequest(request_id, tenant_id, unit_id, description, building_id, 
        agency_id, contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-request:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Create Tenant Building Request Log
router.post('/create-tenant-building-request-log', (request, response) => {
    const { request_id, status, description, processed_by_id, processed_by_type } = request.body;


    dboperations.createTenantBuildingRequestLog(request_id, status, description, processed_by_id, processed_by_type)
        .then(result => {

           // console.log(result);
            if (!result.success) {
                return response.status(400).json(result);
            }

            //console.log(result);
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-request-log:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Create Tenant Building Request Media
router.post('/create-tenant-building-request-media', (request, response) => {
    const { request_id, media_url } = request.body;

    // if (!request_id || !media_url) {
    //     return response.status(400).json({ success: false, message: "Missing required parameters" });
    // }

    dboperations.createTenantBuildingRequestMedia(request_id, media_url)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-request-media:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get Tenant Building Requests
router.post('/get-tenant-building-requests', (request, response) => {
    const contract_id = request.body.contract_id;


    dboperations.getTenantBuildingRequests(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-requests:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Update Tenant Building Request Status
router.post('/update-tenant-building-request-status', (request, response) => {
    const { request_id, status } = request.body;


    dboperations.updateTenantBuildingRequestStatus(request_id, status)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-building-request-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

  

router.post('/create-tenant-building-post', (request, response) => {
    const { building_id, creator_id, title, is_receive_private_message, description, creator_type } = request.body;


    dboperations.createTenantBuildingPost(building_id, creator_id, title, is_receive_private_message, 
        description, creator_type)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-post:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});





router.post('/create-tenant-building-post-media', (request, response) => {
    const { post_id, media_url } = request.body;

    // if (!request_id || !media_url) {
    //     return response.status(400).json({ success: false, message: "Missing required parameters" });
    // }

    dboperations.createTenantBuildingPostMedia(post_id, media_url)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-post-media:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/create-tenant-building-post-comment', (request, response) => {
    const { post_id, creator_id, creator_type, description, post_owner_id } = request.body;


    dboperations.createTenantBuildingPostComment(post_id, creator_id, creator_type, description, post_owner_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-post-comment:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/create-tenant-building-post-like', (request, response) => {
    const { post_id, user_id, user_type } = request.body;


    dboperations.createTenantBuildingPostLike(post_id, user_id, user_type)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-post-like:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-tenant-building-post-like', (request, response) => {
    const { post_id, user_id, user_type } = request.body;


    dboperations.deleteTenantBuildingPostLike(post_id, user_id, user_type)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-tenant-building-post-like:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-personal-details', (request, response) => {
    const { tenant_id, display_name, phone_number, country_code, profile_pic } = request.body;

    dboperations.updateTenantPersonalDetails(tenant_id, display_name, phone_number, country_code, profile_pic)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }

    
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-personal-details:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/get-tenant-upcoming-bookings', (request, response) => {
    const contract_id = request.body.contract_id;


    dboperations.getTenantBuildingUpcomingBookings(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-upcoming-bookings:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-past-bookings', (request, response) => {
    const contract_id = request.body.contract_id;

    //console.log(tenant_id);


    dboperations.getTenantBuildingPastBookings(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-past-bookings:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-building-booking-types', (request, response) => {
    const tenant_id = request.body.tenant_id;



    dboperations.getTenantBuildingBookingTypes(tenant_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-booking-types:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-tenant-building-available-amenity-units', (request, response) => {
    const tenant_id = request.body.tenant_id;
    const amenity_id = request.body.amenity_id;

    dboperations.getTenantBuildingAvailableAmenityUnits(tenant_id, amenity_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-available-amenity-units:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/create-tenant-building-booking', (request, response) => {
    const { tenant_id, amenity_unit_id, booking_date, start_time, end_time, contract_id } = request.body;


    dboperations.createTenantBuildingBooking(tenant_id, amenity_unit_id, booking_date, start_time,
         end_time, contract_id )
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-booking:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-building-booking', (request, response) => {
    const { booking_id, status_id, booking_date, start_time, end_time } = request.body;




    dboperations.updateTenantBuildingBooking(booking_id, status_id, booking_date, start_time, end_time)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /uopdate-tenant-building-booking:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-building-booking-status', (request, response) => {
    const { booking_id, status_id } = request.body;




    dboperations.updateTenantBuildingBookingStatus(booking_id, status_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /uopdate-tenant-building-booking-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/get-tenant-all-bookings', (request, response) => {
    const contract_id = request.body.contract_id;


    dboperations.getTenantBuildingAllBookings(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-all-bookings:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-all-bookings-by-tenant-id', (request, response) => {
    const tenant_id = request.body.tenant_id;


    dboperations.getTenantBuildingAllBookingsByTenantId(tenant_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-all-bookings-by-tenant-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});




router.post('/get-tenant-building-docs', (request, response) => {
    const contract_id = request.body.contract_id;


    dboperations.getTenantBuildingDocs(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-docs:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-building-help-guides', (request, response) => {
    const building_id = request.body.building_id;


    dboperations.getTenantBuildingHelpGuides(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-help-guides:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-tenant-building-request-status', (request, response) => {
    const { request_id, status } = request.body;


    dboperations.updateTenantBuildingRequestStatus(request_id, status)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-building-request-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-tenant-reset-password-code', (request, response) => {
    const { email, reset_code } = request.body;


    dboperations.updateTenantResetPasswordCode(email, reset_code)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-reset-password-code:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-tenant-device-token', (request, response) => {
    const { tenant_id, device_token } = request.body;


    dboperations.updateTenantDeviceToken(tenant_id, device_token)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-device-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-tenant-by-reset-code', (request, response) => {
    const email = request.body.email;
    const reset_code = request.body.reset_code;


    dboperations.getTenantByResetCode(email, reset_code)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-by-reset-code:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-password', (request, response) => {
    const { tenant_id, password } = request.body;


    dboperations.updateTenantPassword(tenant_id, password)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-password:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-notifications', (request, response) => {
    const tenant_id = request.body.tenant_id;
    const read_filter = request.body.read_filter; // 0 - all, 1 - unread, 2 - read



    dboperations.getTenantNotifications(tenant_id, read_filter)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-upcoming-booking:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-tenant-building-request-by-id', (request, response) => {
    const id = request.body.id;


    dboperations.getTenantBuildingRequestById(id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-request-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-tenant-building-booking-by-id', (request, response) => {
    const id = request.body.id;


    dboperations.getTenantBuildingBookingById(id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-booking-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-notification-status', (request, response) => {
    const { id, status } = request.body;


    dboperations.updateTenantNotificationStatus(id, status)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-notification-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-tenant-building-announcemnts', (request, response) => {
    const building_id = request.body.building_id;


    dboperations.getTenantBuildingAnnouncemnts(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-announcemnts:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-building-announcement-by-id', (request, response) => {
    const id = request.body.id;


    dboperations.getTenantBuildingAnnouncementById(id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-building-announcement-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-tenant-device-token', (request, response) => {
    const { device_token } = request.body;


    dboperations.deleteTenantDeviceToken( device_token)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-tenant-device-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-booking-reminders', (request, response) => {
    const { tenant_id, val } = request.body;


    dboperations.updateTenantBookingReminders(tenant_id, val)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-booking-reminders:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-device-tokens', (request, response) => {
    const tenant_id = request.body.tenant_id;


    dboperations.getTenantDeviceTokens(tenant_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-device-tokens:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-language-code', (request, response) => {
    const { tenant_id, lang_code } = request.body;


    dboperations.updateTenantLanguageCode(tenant_id, lang_code)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-language-code:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/create-tenant-contract-notification-and-send-push', (request, response) => {
    const { contract_id, type_id, message, item_id} = request.body;

 //   console.log(request.body);

    dboperations.createTenantContractNotificationAndSendPush(contract_id, type_id, message, item_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-contract-notification-and-send-push:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/create-tenant-notification-and-send-push', (request, response) => {
    const { tenant_id, type_id, message, item_id} = request.body;

 //   console.log(request.body);

    dboperations.createTenantNotificationAndSendPush(tenant_id, type_id, message, item_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-notification-and-send-push:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/create-tenant-building-post-report', (request, response) => {
    const { post_id ,building_id, reported_by_id, reason, additional_comments } = request.body;


    dboperations.createTenantBuildingPostReport(post_id, building_id, reported_by_id, reason, additional_comments)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-tenant-building-post-report:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/delete-tenant-building-post', (request, response) => {
    const { post_id } = request.body;


    dboperations.deleteTenantBuildingPost(post_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-tenant-building-post:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-tenant-building-post-comment', (request, response) => {
    const { comment_id } = request.body;


    dboperations.deleteTenantBuildingPostComment( comment_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-tenant-building-post-comment:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-all-tenants-by-contract', (request, response) => {
    const contract_id = request.body.contract_id;



    dboperations.getTenantsByContractId(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

       //     console.log("get-all-tenants-by-contract", result);

            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-tenants-by-contract:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/create-quick-new-tenant', (request, response) => {
    const { first_name, last_name, email, building_id, created_by_id} = request.body;


    //console.log(request.body);


    dboperations.createQuickNewTenant(first_name, last_name, email, building_id, created_by_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-quick-new-tenant:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-quick-tenant', (request, response) => {
    const { first_name, last_name, building_id, tenant_id} = request.body;


    //console.log(request.body);


    dboperations.updateQuickTenant(first_name, last_name, building_id, tenant_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-quick-tenant:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-tenant-contract-primary', (request, response) => {
    const { contract_id, tenant_id } = request.body;


    dboperations.updateTenantContractPrimary(contract_id, tenant_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-contract-primary:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-tenant-all-requests', (request, response) => {
    const contract_id = request.body.contract_id;


    dboperations.getTenantBuildingAllRequests(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-all-requests:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-tenant-all-requests-by-tenant-id', (request, response) => {
    const tenant_id = request.body.tenant_id;


    dboperations.getTenantBuildingAllRequestsByTenantId(tenant_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-tenant-all-requests-by-tenant-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/update-tenant-request-status', (request, response) => {
    const { request_id, status_id } = request.body;


    dboperations.updateTenantRequestStatus(request_id, status_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-tenant-request-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-all-tenants-by-building', (request, response) => {
    const building_id = request.body.building_id;



    dboperations.getTenantsByBuildingId(building_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }


            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-tenants-by-building:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-tenant-building-tenant', (request, response) => {
    const { tenant_id, building_id } = request.body;


    dboperations.deleteTenantBuildingTenant(tenant_id, building_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-tenant-building-tenant:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


module.exports = router;