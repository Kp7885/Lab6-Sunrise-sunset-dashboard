const locationSelect = document.getElementById("location");
const getLocationBtn = document.getElementById("getLocation");
const resultsContainer = document.getElementById("results");
const themeToggle = document.getElementById("toggleTheme");

// ===== Fetch Data =====
locationSelect.addEventListener("change", () => {
  const [lat, lon] = locationSelect.value.split(",");
  fetchData(lat, lon);
});

getLocationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchData(latitude, longitude);
    },
    err => alert("Location access denied or unavailable.")
  );
});

async function fetchData(lat, lon) {
  resultsContainer.innerHTML = '<p>Loading data...</p>';
  try {
    const [todayRes, tomorrowRes] = await Promise.all([
      fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=today`),
      fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=tomorrow`)
    ]);

    const todayData = await todayRes.json();
    const tomorrowData = await tomorrowRes.json();

    if (todayData.status !== "OK" || tomorrowData.status !== "OK") {
      throw new Error("API response error");
    }

    resultsContainer.innerHTML = '';
    displayCard("Today", todayData.results);
    displayCard("Tomorrow", tomorrowData.results);
  } catch (err) {
    resultsContainer.innerHTML = `<p class="error">❌ Failed to load data: ${err.message}</p>`;
  }
}

function displayCard(label, data) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h2>${label}</h2>
    <button class="toggle-btn">Show/Hide Details</button>
    <div class="card-details">
      <p>🌅 Sunrise: ${data.sunrise}</p>
      <p>🌇 Sunset: ${data.sunset}</p>
      <p>🌄 Dawn: ${data.dawn}</p>
      <p>🌆 Dusk: ${data.dusk}</p>
      <p>🕒 Solar Noon: ${data.solar_noon}</p>
      <p>⏳ Day Length: ${data.day_length}</p>
      <p>🕰️ Timezone: ${data.timezone}</p>
    </div>
  `;

  card.querySelector(".toggle-btn").addEventListener("click", () => {
    card.classList.toggle("active");
  });

  resultsContainer.appendChild(card);
}

// ===== Theme Detection & Toggle =====
(function applyInitialTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
});