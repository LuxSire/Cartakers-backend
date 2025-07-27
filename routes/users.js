require('dotenv').config();
const express = require('express');
const router = express.Router();
const dboperations = require('../service/users/dboperations'); // Import the appropriate database operations module

const heicConvert = require('heic-convert');


// Azure Storage settings
const { BlobServiceClient,  generateBlobSASQueryParameters ,StorageSharedKeyCredential, newPipeline, BlobSASPermissions } = require("@azure/storage-blob");
const accountName =  process.env['AZURE_BLOB_NAME'];
const accountKey = process.env['AZURE_BLOB_ACCOUNT_KEY'];
const pipeline = newPipeline(new StorageSharedKeyCredential(accountName, accountKey));

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new StorageSharedKeyCredential(accountName, accountKey)
);


const multer = require('multer');
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


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


// Validate User Invitation Token
router.post('/validate-user-invitation-token', (request, response) => {
    const token = request.query.token;


    dboperations.validateUserInvitationToken(token)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /validate-user-invitation-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/validate-company-invitation-token', (request, response) => {
    const token = request.query.token;


    dboperations.validateCompanyInvitationToken(token)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /validate-company-invitation-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Register user
router.post('/register-user', (request, response) => {
    const user = request.query.user;


    dboperations.registerUser(user)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /register-user:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/register-company', (request, response) => {
    const company = request.query.company;

    //console.log(agent);


    dboperations.RegisterCompany(company)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /register-company:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


// User Login
router.post('/login-user', (request, response) => {
    const user = request.query.user;

    dboperations.loginUser(user)
        .then(result => {
            if (!result.success) {
                return response.status(401).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /login-user:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get User by Email
router.post('/get-user-by-email', (request, response) => {
    const email = request.query.email;

   console.log(request);
   console.log(email);

    dboperations.getUserByEmail(email )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
  
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-by-email:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-company-by-email', (request, response) => {
    const email = request.query.email;



    dboperations.getCompanyByEmail(email )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
  
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-company-by-email:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-all-users', (request, response) => {
    



    dboperations.getAllUsers()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-users:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-all-companies', (request, response) => {
    



    dboperations.getAllCompanies()
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-companies:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
router.post('/get-user-by-id', (request, response) => {
    const id = request.query.id;



    dboperations.getUserById(id )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-company-by-id', (request, response) => {
    const id = request.query.id;



    dboperations.getCompanyById(id )
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-company-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


// Get User Upcoming Booking
router.post('/get-user-upcoming-booking', (request, response) => {
    const contract_id = request.query.contract_id;



    dboperations.getUserUpcomingBooking(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-upcoming-booking:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Create User Object Request
router.post('/create-user-object-request', (request, response) => {
    const { request_id, user_id, unit_id, description, object_id, agency_id, contract_id } = request.body;


    dboperations.createUserObjectRequest(request_id, user_id, unit_id, description, object_id, 
        agency_id, contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user-object-request:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Create User Object Request Log
router.post('/create-user-object-request-log', (request, response) => {
    const { request_id, status, description, processed_by_id, processed_by_type } = request.body;


    dboperations.createUserObjectRequestLog(request_id, status, description, processed_by_id, processed_by_type)
        .then(result => {

           // console.log(result);
            if (!result.success) {
                return response.status(400).json(result);
            }

            //console.log(result);
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user_object-request-log:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Get User Object Requests
router.post('/get-user-object-requests', (request, response) => {
    const object_id = request.query.object_id;


    dboperations.getUserObjectRequests(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-object-requests:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

// Update User Object Request Status
router.post('/update-user-object-request-status', (request, response) => {
    const { request_id, status } = request.body;


    dboperations.updateUserObjectRequestStatus(request_id, status)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-building-request-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

  

router.post('/create-user-object-post', (request, response) => {
    const { object_id, creator_id, title, is_receive_private_message, description, creator_type } = request.query;


    dboperations.createUserObjectPost(object_id, creator_id, title, is_receive_private_message, 
        description, creator_type)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user-object-post:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});





router.post('/create-user-object-post-media', (request, response) => {
    const { post_id, media_url } = request.body;

    // if (!request_id || !media_url) {
    //     return response.status(400).json({ success: false, message: "Missing required parameters" });
    // }

    dboperations.createUserObjectPostMedia(post_id, media_url)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user-object-post-media:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-user-field', (request, response) => {
    const { user_id, table, field,value } = request.query;


    dboperations.updateUserField(user_id, table, field,value)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-field:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});
/*
{
  "json": "{ \"user_id\": 1, \"value\": \"123 Main St\",  \"table\": \"Companies\",\"Field\":\"address\"  }"
}
   

*/

router.post('/update-user-personal-details', (request, response) => {
    const { user_id, display_name, phone_number, country_code, profile_pic } = request.body;

    dboperations.updateUserPersonalDetails(user_id, display_name, phone_number, country_code, profile_pic)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }

    
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-personal-details:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/get-user-object-docs', (request, response) => {
    const object_id = request.query.object_id;


    dboperations.getUserObjectDocs(object_id)
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



router.post('/update-user-object-request-status', (request, response) => {
    const { request_id, status } = request.query;


    dboperations.updateUserObjectRequestStatus(request_id, status)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-object-request-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-user-reset-password-code', (request, response) => {
    const { email, reset_code } = request.query;


    dboperations.updateUserResetPasswordCode(email, reset_code)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-reset-password-code:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/update-user-device-token', (request, response) => {
    const { user_id, device_token } = request.query;


    dboperations.updateUserDeviceToken(user_id, device_token)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-device-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-user-by-reset-code', (request, response) => {
    const email = request.query.email;
    const reset_code = request.query.reset_code;


    dboperations.getUserByResetCode(email, reset_code)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-by-reset-code:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-user-password', (request, response) => {
    const { user_id, password } = request.query;


    dboperations.updateUserPassword(user_id, password)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-password:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-user-notifications', (request, response) => {
    const user_id = request.query.user_id;
    const read_filter = request.query.read_filter; // 0 - all, 1 - unread, 2 - read



    dboperations.getUserNotifications(user_id, read_filter)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-upcoming-booking:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-user-object-request-by-id', (request, response) => {
    const id = request.body.id;


    dboperations.getUserObjectRequestById(id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-object-request-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-user-notification-status', (request, response) => {
    const { id, status } = request.query;


    dboperations.updateUserNotificationStatus(id, status)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-notification-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-user-object-announcemnts', (request, response) => {
    const object_id = request.query.object_id;


    dboperations.getUserObjectAnnouncemnts(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-object-announcemnts:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-user-object-announcement-by-id', (request, response) => {
    const id = request.query.id;


    dboperations.getUserObjectAnnouncementById(id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-object-announcement-by-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-user-device-token', (request, response) => {
    const { device_token } = request.query;


    dboperations.deleteUserDeviceToken( device_token)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-user-device-token:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});




router.post('/get-user-device-tokens', (request, response) => {
    const user_id = request.query.user_id;


    dboperations.getUserDeviceTokens(user_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-device-tokens:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-user-language-code', (request, response) => {
    const { user_id, lang_code } = request.query;


    dboperations.updateUserLanguageCode(user_id, lang_code)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-language-code:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/create-usercontract-notification-and-send-push', (request, response) => {
    const { contract_id, type_id, message, item_id} = request.body;

 //   console.log(request.body);

    dboperations.createUserContractNotificationAndSendPush(contract_id, type_id, message, item_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user-contract-notification-and-send-push:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/create-user-notification-and-send-push', (request, response) => {
    const { user_id, type_id, message, item_id} = request.body;

 //   console.log(request.body);

    dboperations.createUserNotificationAndSendPush(user_id, type_id, message, item_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user-notification-and-send-push:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/create-user-building-post-report', (request, response) => {
    const { post_id ,building_id, reported_by_id, reason, additional_comments } = request.body;


    dboperations.createUserBuildingPostReport(post_id, building_id, reported_by_id, reason, additional_comments)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-user-object-post-report:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/delete-user-object-post', (request, response) => {
    const { post_id } = request.query;


    dboperations.deleteUserObjectPost(post_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-user-object-post:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-all-users-by-object', (request, response) => {
    const object_id = request.query.object_id;



    dboperations.getUsersByObjectId(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }


            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-users-by-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/create-quick-new-user', (request, response) => {
    const { first_name, last_name, email, object_id, created_by_id} = request.body;


    //console.log(request.body);


    dboperations.createQuickNewUser(first_name, last_name, email, object_id, created_by_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /create-quick-new-user:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/update-quick-user', (request, response) => {
    const { first_name, last_name, object_id, user_id} = request.body;


    //console.log(request.body);


    dboperations.updateQuickUser(first_name, last_name, object_id, user_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-quick-user:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});

router.post('/get-user-all-requests', (request, response) => {
    const object_id = request.query.object_id;


    dboperations.getUserObjectAllRequests(contract_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-all-requests:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-user-all-requests-by-user-id', (request, response) => {
    const user_id = request.query.user_id;


    dboperations.getUserObjectAllRequestsByUserId(user_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }

           
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-user-all-requests-by-user-id:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});



router.post('/update-user-request-status', (request, response) => {
    const { request_id, status_id } = request.query;


    dboperations.updateUserRequestStatus(request_id, status_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /update-user-request-status:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/get-all-Users-by-object', (request, response) => {
    const object_id = request.query.object_id;



    dboperations.getUsersByObjectId(object_id)
        .then(result => {
            if (!result.success) {
                return response.status(404).json(result);
            }


            response.json(result);
        })
        .catch(error => {
            console.error("Error in /get-all-users-by-object:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


router.post('/delete-user-object-user', (request, response) => {
    const { user_id, object_id } = request.query;


    dboperations.deleteUserObjectUser(user_id, object_id)
        .then(result => {
            if (!result.success) {
                return response.status(400).json(result);
            }
            response.json(result);
        })
        .catch(error => {
            console.error("Error in /delete-user-object-user:", error);
            response.status(500).json({ success: false, message: "Internal server error" });
        });
});


module.exports = router;