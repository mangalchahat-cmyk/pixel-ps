const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const statusDiv = document.getElementById('status');
const resultsContainer = document.getElementById('results');

async function searchImages() {
  const query = searchInput.value.trim();
  
  if (!query) {
    statusDiv.textContent = 'Please enter a search term.';
    return;
  }

  // 1. LOADING STATE
  statusDiv.innerHTML = '<div class="spinner"></div> Searching...';
  resultsContainer.innerHTML = ''; // Clear previous results

  try {
    // API Request (Wikimedia Commons API)
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&ns=6&gsrlimit=12&prop=imageinfo&iiprop=url&format=json&origin=*`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // 2. EMPTY STATE
    if (!data.query || !data.query.pages) {
      statusDiv.textContent = `No results found for "${query}". Try another search.`;
      return;
    }

    // 3. RESULTS STATE
    const items = Object.values(data.query.pages);
    statusDiv.textContent = `Showing ${items.length} results for "${query}".`;
    
    renderResults(items);

  } catch (error) {
    // 4. ERROR STATE
    console.error('Fetch error:', error);
    statusDiv.textContent = 'Something went wrong. Please check your network and try again.';
  }
}

function renderResults(items) {
  resultsContainer.innerHTML = '';
  
  items.forEach(item => {
    if (item.imageinfo && item.imageinfo[0]) {
      const imgUrl = item.imageinfo[0].url;
      const title = item.title.replace('File:', '');

      const card = document.createElement('div');
      card.className = 'card fade-in';
      card.innerHTML = `
        <img src="${imgUrl}" alt="${title}" loading="lazy" />
        <p>${title}</p>
      `;
      resultsContainer.appendChild(card);
    }
  });
}

searchBtn.addEventListener('click', searchImages);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchImages();
});