const testAPI = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Diagnostic Test Event',
        description: 'Testing the backend endpoint',
        date: '2026-08-15',
        time: '12:00',
        location: 'Localhost',
        seatCapacity: 100
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
};
testAPI();
