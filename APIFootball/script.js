const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const result = document.getElementById('result');
const error = document.getElementById('error');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const leagueSelect = document.getElementById('leagueSelect');

// Replace with your API-Football key
const API_KEY = '649b3a64cda1b8b461c855b48d8d45f5';

searchBtn.addEventListener('click', searchFootball);
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchFootball();
});


themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Fetch all leagues on page load
window.addEventListener('DOMContentLoaded', fetchAllLeagues);

async function fetchAllLeagues() {
  loading.style.display = 'block';
  error.textContent = '';
  result.innerHTML = '';
  try {
    const res = await fetch('https://v3.football.api-sports.io/leagues', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    if (!res.ok) throw new Error('Failed to fetch leagues');
    const data = await res.json();
    populateLeagueDropdown(data.response);
  } catch (err) {
    error.textContent = err.message;
  } finally {
    loading.style.display = 'none';
  }
}

function populateLeagueDropdown(leagues) {
  leagueSelect.innerHTML = '<option value="">Select a league/cup...</option>';
  leagues.forEach((item, idx) => {
    leagueSelect.innerHTML += `<option value="${idx}">${item.league.name} (${item.country.name})</option>`;
  });
  leagueSelect.style.display = 'inline-block';
  leagueSelect.onchange = function() {
    if (this.value) showLeagueInfo(leagues[this.value]);
    else result.innerHTML = '';
  };
}

async function searchFootball() {
  const query = searchInput.value.trim();
  if (!query) {
    error.textContent = 'Please enter a league or cup name.';
    return;
  }
  loading.style.display = 'block';
  error.textContent = '';
  result.innerHTML = '';
  try {
    // Example: Search for leagues
    const res = await fetch(`https://v3.football.api-sports.io/leagues?search=${encodeURIComponent(query)}`, {
      headers: {
        'x-apisports-key': API_KEY
      }
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    const data = await res.json();
    displayLeagues(data);
  } catch (err) {
    error.textContent = err.message;
  } finally {
    loading.style.display = 'none';
  }
}

function displayLeagues(data) {
  if (!data.response || data.response.length === 0) {
    result.innerHTML = '<p>No leagues or cups found.</p>';
    return;
  }
  // Populate dropdown and show first result
  populateLeagueDropdown(data.response);
  showLeagueInfo(data.response[0]);
}

function showLeagueInfo(item) {
  // Find the most recent season (by year)
  let latestSeason = null;
  if (item.seasons && item.seasons.length > 0) {
    latestSeason = item.seasons.reduce((latest, season) => {
      return (!latest || (season.year > latest.year)) ? season : latest;
    }, null);
  }
  result.innerHTML = `<div class="card">
    <h2>${item.league.name}</h2>
    <img src="${item.league.logo}" alt="${item.league.name}" style="width:60px;">
    <p><strong>Type:</strong> ${item.league.type}</p>
    <p><strong>Country:</strong> ${item.country.name}</p>
    <p><strong>Season:</strong> ${latestSeason?.year || 'N/A'}</p>
    <p><strong>Start:</strong> ${latestSeason?.start || 'N/A'}</p>
    <p><strong>End:</strong> ${latestSeason?.end || 'N/A'}</p>
    <p><strong>Current:</strong> ${latestSeason?.current ? 'Yes' : 'No'}</p>
  </div>`;
}
