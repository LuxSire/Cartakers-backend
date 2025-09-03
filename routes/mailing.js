const express = require('express');
const router = express.Router();
const dboperations = require('../service/users/dboperations'); // Import the appropriate database operations module
require('dotenv').config();
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');
require("isomorphic-fetch");
const { translateText } = require("../translation"); // Import the translation service








async function getAccessToken() {
    const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            scope: "https://graph.microsoft.com/.default",
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "client_credentials",
        }),
    });

    const data = await response.json();
    if (!data.access_token) throw new Error("Failed to get access token");
    return data.access_token;
}

router.post("/email-user-reset-password", async (req, res) => {
    try {
        const { email, greetings, body_text, reset_code_text, reset_code, available_on_text, help_text, support_text, subject } = req.body;

        // Load email template
        let emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/user-reset-user-password.html"), "utf8");

        // Replace placeholders
        emailTemplate = emailTemplate.replace("[GREETINGS-TEXT]", greetings)
            .replace("[BODY-TEXT]", body_text)
            .replace("[RESET-CODE-TEXT]", reset_code_text)
            .replace("[RESET-CODE]", reset_code)
            .replace("[DOWNLOAD-NOW-TEXT]", available_on_text)
            .replace("[HELP-TEXT]", help_text)
            .replace("[SUPPORT-TEXT]", support_text);

        const accessToken = await getAccessToken();

        // Send Email using Microsoft Graph API
        
        const response = await fetch("https://graph.microsoft.com/v1.0/users/" + process.env.SENDER_EMAIL + "/sendMail", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject: subject,
                    body: {
                        contentType: "HTML",
                        content: emailTemplate,
                    },
                    toRecipients: [{ emailAddress: { address: email } }],
            
                },
                saveToSentItems: "true",

            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${await response.text()}`);
        }

        console.log("Email sent successfully");
        res.status(200).json({ success: true, message: "Email sent successfully", data: [{email, success: true}] });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", data: [] });
    }
});


router.post("/email-user-booking-reminder", async (req, res) => {
    try {
        const { email, greetings, body_text, body2_title_text, body2_text, available_on_text, help_text, support_text, subject } = req.body;

        // Load email template
        let emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/user-booking-reminder.html"), "utf8");

        // Replace placeholders
        emailTemplate = emailTemplate.replace("[GREETINGS-TEXT]", greetings)
            .replace("[BODY-TEXT]", body_text)
            .replace("[BODY2-TITLE-TEXT]", body2_title_text)
            .replace("[BODY2-TEXT]", body2_text)
            .replace("[DOWNLOAD-NOW-TEXT]", available_on_text)
            .replace("[HELP-TEXT]", help_text)
            .replace("[SUPPORT-TEXT]", support_text);

        const accessToken = await getAccessToken();

        // Send Email using Microsoft Graph API
        
        const response = await fetch("https://graph.microsoft.com/v1.0/users/" + process.env.SENDER_EMAIL + "/sendMail", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject: subject,
                    body: {
                        contentType: "HTML",
                        content: emailTemplate,
                    },
                    toRecipients: [{ emailAddress: { address: email } }],
            
                },
                saveToSentItems: "true",

            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${await response.text()}`);
        }

        console.log("Email sent successfully");
        res.status(200).json({ success: true, message: "Email sent successfully", data: [{email, success: true}] });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", data: [] });
    }
});


router.post("/email-user-mail", async (req, res) => {
    try {
        const { email, greetings, body_text, body2_title_text, body2_text, subject, lang } = req.body;


 
        const translatedGreetings = await translateText(greetings, lang);
        const translatedBody = await translateText(body_text, lang);
        const translatedBody2Title = await translateText(body2_title_text, lang);
        //const translatedBody2Text = await translateText(body2_text, lang);
        const translatedSubject = await translateText(subject, lang);
        const translatedAvailableOn = await translateText(`Available on:`, lang);
        const translatedHelpText = await translateText(`Help?`, lang);  
        const translatedSupport = await translateText(`Support`, lang);


        // Load email template
        let emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/user-mail.html"), "utf8");

        // Replace placeholders
        emailTemplate = emailTemplate.replace("[GREETINGS-TEXT]", translatedGreetings)
            .replace("[BODY-TEXT]", translatedBody)
            .replace("[BODY2-TITLE-TEXT]", translatedBody2Title)
            .replace("[BODY2-TEXT]", body2_text)
            .replace("[DOWNLOAD-NOW-TEXT]", translatedAvailableOn)
            .replace("[HELP-TEXT]", translatedHelpText)
            .replace("[SUPPORT-TEXT]", translatedSupport);


        const accessToken = await getAccessToken();

        // Send Email using Microsoft Graph API
        
        const response = await fetch("https://graph.microsoft.com/v1.0/users/" + process.env.SENDER_EMAIL + "/sendMail", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject: translatedSubject,
                    body: {
                        contentType: "HTML",
                        content: emailTemplate,
                    },
                    toRecipients: [{ emailAddress: { address: email } }],
            
                },
                saveToSentItems: "true",

            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${await response.text()}`);
        }

        console.log("Email sent successfully");
        res.status(200).json({ success: true, message: "Email sent successfully", data: [{email, success: true}] });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", data: [] });
    }
});

router.post("/send-smtp-invitation-email", async (req, res) => {
    try {
        const { email, greetings, body_text, body2_title_text, body2_text, subject, lang } = req.body;

        // Optionally translate text here if needed
        const translatedAvailableOn = await translateText(`Available on:`, lang);
        const translatedHelpText = await translateText(`Help?`, lang);  
        const translatedSupport = await translateText(`Support`, lang);

        // Load email template
        let emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/user-mail.html"), "utf8");

        // Replace placeholders
        emailTemplate = emailTemplate.replace("[GREETINGS-TEXT]", greetings)
            .replace("[BODY-TEXT]", body_text)
            .replace("[BODY2-TITLE-TEXT]", body2_title_text)
            .replace("[BODY2-TEXT]", body2_text)
            .replace("[DOWNLOAD-NOW-TEXT]", translatedAvailableOn)
            .replace("[HELP-TEXT]", translatedHelpText)
            .replace("[SUPPORT-TEXT]", translatedSupport);

        // Setup nodemailer transporter for Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,      // Your Gmail address from .env
                pass: process.env.GMAIL_PASS       // Your Gmail app password from .env
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
    
            to: email,
            subject: subject,
            html: emailTemplate
        };

        // Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).json({ success: true, message: 'Email sent successfully', data: [{email, success: true}] });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email', data: [] });
    }
});

router.post("/send-user-invitation-email", async (req, res) => {
    try {
        const { email, greetings, body_text, body2_title_text, body2_text, subject, lang } = req.body;


 
        const translatedGreetings = await translateText(greetings, lang);
        const translatedBody = await translateText(body_text, lang);
        const translatedBody2Title = await translateText(body2_title_text, lang);
        //const translatedBody2Text = await translateText(body2_text, lang);
        const translatedSubject = await translateText(subject, lang);
        const translatedAvailableOn = await translateText(`Available on:`, lang);
        const translatedHelpText = await translateText(`Help?`, lang);  
        const translatedSupport = await translateText(`Support`, lang);


        // Load email template
        let emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/user-mail.html"), "utf8");

        // Replace placeholders
        emailTemplate = emailTemplate.replace("[GREETINGS-TEXT]", translatedGreetings)
            .replace("[BODY-TEXT]", translatedBody)
            .replace("[BODY2-TITLE-TEXT]", translatedBody2Title)
            .replace("[BODY2-TEXT]", body2_text)
            .replace("[DOWNLOAD-NOW-TEXT]", translatedAvailableOn)
            .replace("[HELP-TEXT]", translatedHelpText)
            .replace("[SUPPORT-TEXT]", translatedSupport);


        const accessToken = await getAccessToken();

        // Send Email using Microsoft Graph API
        
        const response = await fetch("https://graph.microsoft.com/v1.0/users/" + process.env.SENDER_EMAIL + "/sendMail", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject: translatedSubject,
                    body: {
                        contentType: "HTML",
                        content: emailTemplate,
                    },
                    toRecipients: [{ emailAddress: { address: email } }],
            
                },
                saveToSentItems: "true",

            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${await response.text()}`);
        }

        console.log("Email sent successfully");
        res.status(200).json({ success: true, message: "Email sent successfully", data: [{email, success: true}] });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", data: [] });
    }
});



router.post("/email-company-user-mail", async (req, res) => {
    try {
        const { email, greetings, body_text, body2_title_text, body2_text, subject, lang } = req.body;


 
        const translatedGreetings = await translateText(greetings, lang);
        const translatedBody = await translateText(body_text, lang);
        const translatedBody2Title = await translateText(body2_title_text, lang);
        //const translatedBody2Text = await translateText(body2_text, lang);
        const translatedSubject = await translateText(subject, lang);
        const translatedAvailableOn = await translateText(`Available on:`, lang);
        const translatedHelpText = await translateText(`Help?`, lang);  
        const translatedSupport = await translateText(`Support`, lang);


        // Load email template
        let emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/company-user-mail.html"), "utf8");

        // Replace placeholders
        emailTemplate = emailTemplate.replace("[GREETINGS-TEXT]", translatedGreetings)
            .replace("[BODY-TEXT]", translatedBody)
            .replace("[BODY2-TITLE-TEXT]", translatedBody2Title)
            .replace("[BODY2-TEXT]", body2_text)
            .replace("[DOWNLOAD-NOW-TEXT]", translatedAvailableOn)
            .replace("[HELP-TEXT]", translatedHelpText)
            .replace("[SUPPORT-TEXT]", translatedSupport);


        const accessToken = await getAccessToken();

        // Send Email using Microsoft Graph API
        
        const response = await fetch("https://graph.microsoft.com/v1.0/users/" + process.env.SENDER_EMAIL + "/sendMail", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject: translatedSubject,
                    body: {
                        contentType: "HTML",
                        content: emailTemplate,
                    },
                    toRecipients: [{ emailAddress: { address: email } }],
            
                },
                saveToSentItems: "true",

            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${await response.text()}`);
        }

        console.log("Email sent successfully");
        res.status(200).json({ success: true, message: "Email sent successfully", data: [{email, success: true}] });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", data: [] });
    }
});



// for the Tenants10 Website 

// POST /email-contact
const allowedOrigins = ['https://www.tenants10.com' ];

router.post("/email-contact", async (req, res) => {
    try {

        // const origin = req.headers.origin || req.headers.referer;

        // console.log("Origin:", origin);
        // console.log("Allowed Origins:", allowedOrigins);

        // if (!origin || !allowedOrigins.some(o => origin.startsWith(o))) {
        //   return res.status(403).json({ success: false, message: "Forbidden: Invalid origin." });
        // }

        
      const { name, email, subject, message } = req.body;
  
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
      }
  
      const htmlContent = `
      <p><strong>New Contact Request</strong></p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
    `;
    
  
      const accessToken = await getAccessToken(); // Assumes you already implemented this
  
      const response = await fetch(`https://graph.microsoft.com/v1.0/users/${process.env.SENDER_EMAIL}/sendMail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: `Contact Form: ${subject}`,
            body: {
              contentType: "HTML",
              content: htmlContent,
            },
            toRecipients: [{ emailAddress: { address: 'info@xm.com' } }],
  
              
          },
          saveToSentItems: "true",
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email: ${errorText}`);
      }
  
      res.status(200).json({ success: true, message: "Email sent successfully." });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ success: false, message: "Failed to send email." });
    }
  });
  

// router.post('/email-tenant-reset-password', async (req, res) => {


//     try {
//         const { email, greetings, body_text, reset_code_text, reset_code, available_on_text, help_text, support_text, subject} = req.body;

//         // Load email template
//         let emailTemplate = fs.readFileSync(path.join(__dirname, '../tenant-reset-user-password.html'), 'utf8');

//         console.log('Email:', email);

//         // Replace placeholders with actual content
//         emailTemplate = emailTemplate.replace('[GREETINGS-TEXT]', greetings);
//         emailTemplate = emailTemplate.replace('[BODY-TEXT]', body_text);
//         emailTemplate = emailTemplate.replace('[RESET-CODE-TEXT]', reset_code_text);
//         emailTemplate = emailTemplate.replace('[RESET-CODE]', reset_code);
//         emailTemplate = emailTemplate.replace('[DOWNLOAD-NOW-TEXT]', available_on_text);
//         emailTemplate = emailTemplate.replace('[HELP-TEXT]', help_text);
//         emailTemplate = emailTemplate.replace('[SUPPORT-TEXT]', support_text);


//         console.log('user email:', process.env['EMAIL_USER']);
//         console.log('user pass:', process.env['EMAIL_PASS']);
//         console.log('host:', process.env['E_HOST']);
//         console.log('port:', process.env['PORT_NO']);

//         // Setup transporter
//         const transporter = nodemailer.createTransport({
//             host: process.env['E_HOST'],
//             port: process.env['PORT_NO'],
    
//             auth: {
//                 user: process.env['EMAIL_USER'],
//                 pass: process.env['EMAIL_PASS']
//             }
//         });

//         const mailOptions = {
//             from: process.env['EMAIL_USER'],
//             to: email,
//             subject: subject,
//             html: emailTemplate
//         };

//         // Send Email
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.response);
//         res.status(200).json({ success: true, message: 'Email sent successfully' });
//     } catch (error) {
//         console.error('Email sending error:', error);
//         res.status(500).json({ success: false, message: 'Failed to send email' });
//     }
// });






module.exports = router;