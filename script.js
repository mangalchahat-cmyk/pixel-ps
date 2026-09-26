// 1. Select key DOM elements
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Optional Enhancement: Select or create a container for result count status
let statusMessage = document.getElementById("status-message");
if (!statusMessage) {
  statusMessage = document.createElement("p");
  statusMessage.id = "status-message";
  statusMessage.className = "status-message";
  // Insert status message right above the results container
  resultsContainer.parentNode.insertBefore(statusMessage, resultsContainer);
}

// 2. Add form submit listener to catch the search action
form.addEventListener("submit", async (event) => {
  // Prevent form submission from reloading the page
  event.preventDefault();

  // Read and trim the search query
  const query = input.value.trim();

  // Task 4: Ignore empty searches
  if (!query) return;

  // Clear previous results and status
  resultsContainer.innerHTML = "";
  statusMessage.textContent = "";

  try {
    // Task 2: Build the request URL safely using encodeURIComponent
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
      "&gsrsearch=" + encodeURIComponent(query) +
      "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

    // Fetch data and check response
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if any results were returned
    if (!data.query || !data.query.pages) {
      statusMessage.textContent = `No results found for "${query}".`;
      return;
    }

    const items = Object.values(data.query.pages);

    // Task 5 (Enhancement): Display result count
    statusMessage.textContent = `Showing ${items.length} results for "${query}"`;

    // Task 3: Render results into the DOM
    renderResults(items);
  } catch (error) {
    console.error("Error fetching images:", error);
  }
});

/**
 * Renders an array of image items into the DOM
 * @param {Array} items - List of page objects from Wikimedia Commons API
 */
function renderResults(items) {
  items.forEach((item) => {
    // Build card element
    const card = document.createElement("article");
    card.className = "card";

    // Task 5 (Enhancement): Wrap image in a link to open full resolution in a new tab
    const imageLink = document.createElement("a");
    imageLink.href = item.imageinfo?.[0]?.descriptionurl || item.imageinfo?.[0]?.url;
    imageLink.target = "_blank";
    imageLink.rel = "noopener noreferrer";

    // Build image element
    const img = document.createElement("img");
    img.src = item.imageinfo?.[0]?.thumburl || "";
    img.alt = item.title;
    img.loading = "lazy";

    imageLink.appendChild(img);

    // Clean up title (removes the "File:" prefix if present)
    const cleanTitle = item.title.replace(/^File:/, "");

    // Build caption element
    const caption = document.createElement("p");
    caption.textContent = cleanTitle;

    // Assemble the card and append to grid
    card.appendChild(imageLink);
    card.appendChild(caption);
    resultsContainer.appendChild(card);
  });
}