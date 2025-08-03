// Google Apps Script code to monitor Gmail and send to WhatsApp bot
// This should be deployed as a Google Apps Script project

// Replace with your Render.com app URL
const WEBHOOK_URL = 'https://your-app-name.onrender.com/send-whatsapp';

function processGmailEmails() {
  try {
    // Search for unread emails (you can modify the search query as needed)
    const threads = GmailApp.search('is:unread', 0, 10);
    
    for (let thread of threads) {
      const messages = thread.getMessages();
      
      for (let message of messages) {
        if (message.isUnread()) {
          const subject = message.getSubject();
          const body = message.getPlainBody();
          
          // Check if email contains phone number pattern
          if (body.includes('CountryCode:') && body.includes('Phone:')) {
            console.log('Found email with phone number pattern');
            console.log('Email subject:', subject);
            console.log('Email body preview:', body.substring(0, 200) + '...');
            
            // Send to WhatsApp bot
            sendToWhatsAppBot(body, subject);
            
            // Mark as read to avoid processing again
            message.markRead();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing emails:', error);
  }
}

function sendToWhatsAppBot(emailBody, subject) {
  try {
    // Validate inputs
    if (!emailBody || emailBody.trim() === '') {
      console.error('Email body is empty or null');
      return;
    }
    
    const payload = {
      emailBody: emailBody,
      subject: subject || 'No Subject'
    };
    
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    console.log('Making request to:', WEBHOOK_URL);
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    
    console.log('Response status:', response.getResponseCode());
    console.log('Response text:', response.getContentText());
    
    if (response.getResponseCode() === 200) {
      const responseData = JSON.parse(response.getContentText());
      console.log('WhatsApp bot response:', responseData);
    } else {
      console.error('HTTP Error:', response.getResponseCode(), response.getContentText());
    }
    
  } catch (error) {
    console.error('Error sending to WhatsApp bot:', error);
    console.error('Error details:', error.toString());
  }
}

// Set up a time-based trigger to run every 5 minutes
function createTrigger() {
  ScriptApp.newTrigger('processGmailEmails')
    .timeBased()
    .everyMinutes(5)
    .create();
}

// Manual function to test the script
function testEmailProcessing() {
  processGmailEmails();
}

// Test function with sample data
function testWithSampleData() {
  const sampleEmailBody = `
Passenger Details

Passenger 1

Title: mr
FirstName: test
LastName: test
Email: test@example.com
CountryCode: +91
SelectedCountryCode: +91
Phone: 9876543210
Nationality: Indian
SelectedNationality: IN
Dob: 2025-08-01
  `;
  
  console.log('Testing with sample email body...');
  console.log('Sample body:', sampleEmailBody);
  
  sendToWhatsAppBot(sampleEmailBody, 'Test Booking');
}