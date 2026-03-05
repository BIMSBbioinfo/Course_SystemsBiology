// ============================================================
// Google Apps Script — Artifact or Signal Vote Collector
//
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this entire code into the script editor
// 4. Click Deploy > New Deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the deployment URL
// 6. Paste the URL into app.js (GOOGLE_SCRIPT_URL variable)
// 7. Add a header row to Sheet1:
//    timestamp | deviceId | topicId | topicTitle | vote | answer
// ============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add header if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['timestamp', 'deviceId', 'topicId', 'topicTitle', 'vote', 'answer']);
    }

    sheet.appendRow([
      new Date().toISOString(),
      data.deviceId || '',
      data.topicId || '',
      data.topicTitle || '',
      data.vote || '',
      data.answer || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Return aggregated vote counts for the teacher dashboard
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    // Skip header row
    var votes = {};
    var devices = {};

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var deviceId = row[1];
      var topicId = row[2];
      var vote = row[4];

      // Use latest vote per device per topic
      var key = deviceId + '_' + topicId;
      if (!votes[key] || new Date(row[0]) > new Date(votes[key].timestamp)) {
        votes[key] = { timestamp: row[0], topicId: topicId, vote: vote, deviceId: deviceId };
      }
      devices[deviceId] = true;
    }

    // Aggregate
    var results = {};
    for (var k in votes) {
      var v = votes[k];
      if (!results[v.topicId]) results[v.topicId] = { artifact: 0, signal: 0 };
      if (results[v.topicId][v.vote] !== undefined) {
        results[v.topicId][v.vote]++;
      }
    }

    var output = {
      status: 'ok',
      deviceCount: Object.keys(devices).length,
      results: results
    };

    return ContentService
      .createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
