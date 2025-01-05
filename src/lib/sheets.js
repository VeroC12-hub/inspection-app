const SHEETS_CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwn5kOrvRRBvx-7ZhyGj8Bo9XfIQAdHbOsHxuMkHBBx9nRVy6FHEgvflc6IplbSGWl1PA/exec', // Replace with your URL from Step 3
  };
  
  function submitToGoogleSheets(data) {
    return fetch(SHEETS_CONFIG.SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        action: 'appendInspectionData',
        data: data
      })
    })
    .then(response => response.json())
    .then(result => {
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result;
    });
  }
  
  // Make these available to other files
  window.SHEETS_CONFIG = SHEETS_CONFIG;
  window.submitToGoogleSheets = submitToGoogleSheets;