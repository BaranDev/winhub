// Quick test of WinGet API
async function testWinGet() {
  try {
    const apiUrl = `https://api.winget.run/v2/packages`;
    const searchParams = new URLSearchParams({
      query: "discord",
      limit: "10",
    });

    console.log(`Testing: ${apiUrl}?${searchParams}`);

    const response = await fetch(`${apiUrl}?${searchParams}`, {
      method: "GET",
      headers: {
        "User-Agent": "WinHub/1.0.0",
        Accept: "application/json",
      },
    });

    console.log(`Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Found ${data.Packages?.length || 0} packages`);

    if (data.Packages && data.Packages.length > 0) {
      console.log("First package:", JSON.stringify(data.Packages[0], null, 2));
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testWinGet();
