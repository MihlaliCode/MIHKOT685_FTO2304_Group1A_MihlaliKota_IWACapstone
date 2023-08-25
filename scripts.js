import { authors, genres, books, BOOKS_PER_PAGE } from "./data.js";

// Variables for DOM elements
const dataListButton = document.querySelector("[data-list-button]");
const dataListMessage = document.querySelector("[data-list-message]");
const dataListOverlay = document.querySelector("[data-list-active]");
const dataListItems = document.querySelector("[data-list-items]");
const dataListImage = document.querySelector("[data-list-image]");
const dataListTitle = document.querySelector("[data-list-title]");
const dataListSubtitle = document.querySelector("[data-list-subtitle]");
const dataListDescription = document.querySelector("[data-list-description]");
const dataListClose = document.querySelector("[data-list-close]");

const searchButton = document.querySelector("[data-header-search]");
const searchOverlay = document.querySelector("[data-search-overlay]");
const searchCancel = document.querySelector("[data-search-cancel]");
const searchForm = document.querySelector("[data-search-form]");
const searchAuthors = document.querySelector("[data-search-authors]");
const searchGenres = document.querySelector("[data-search-genres]");
const searchTitle = document.querySelector("[data-search-title]");

const settingsButton = document.querySelector("[data-header-settings]");
const settingsOverlay = document.querySelector("[data-settings-overlay]");
const settingsCancel = document.querySelector("[data-settings-cancel]");
const settingsForm = document.querySelector("[data-settings-form]");
const settingsTheme = document.querySelector("[data-settings-theme]");

// Constants
const day = { dark: "10, 10, 20", light: "255, 255, 255" };

const night = { dark: "255, 255, 255", light: "10, 10, 20" };

// Initialization
let matches = books;
let page = 1;
let dataListButtonLabel = `Show more (${matches.length - BOOKS_PER_PAGE})`;
dataListButton.disabled = !(matches.length - BOOKS_PER_PAGE > 0);
dataListButton.innerHTML = `<span>Show more</span><span class="list__remaining"> (${
  matches.length - BOOKS_PER_PAGE > 0 ? matches.length - BOOKS_PER_PAGE : 0
})</span>`;

// Functions

/**
 * Creates a book preview element.
 * @param {Object} book - The book object containing information about the book.
 * @param {string} book.author - The author ID of the book.
 * @param {string} book.id - The unique ID of the book.
 * @param {string} book.image - The URL of the book's cover image.
 * @param {string} book.title - The title of the book.
 * @returns {HTMLButtonElement} The created book preview element.
 */
function createPreview(book) {
  const { author, id, image, title } = book;
  const preview = document.createElement("button");
  preview.classList.add("preview");
  preview.setAttribute("data-preview", id);

  preview.innerHTML = /* html */ `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return preview;
}

/**
 * Creates a document fragment containing book previews from the given matches array.
 * @param {Object[]} matches - The array of book objects to create previews from.
 * @param {number} start - The start index of the matches array to create previews from.
 * @param {number} end - The end index (exclusive) of the matches array to create previews from.
 * @returns {DocumentFragment} The document fragment containing the created book previews.
 */
function createPreviewsFragment(matches, start, end) {
  const fragment = document.createDocumentFragment();
  const extracted = matches.slice(start, end);

  for (const book of extracted) {
    fragment.appendChild(createPreview(book));
  }

  return fragment;
}

/**
 * Hides the book overlay by closing the overlay and clearing its content.
 */
function hideBookOverlay() {
  dataListOverlay.open = false;
  dataListImage.src = "";
  dataListTitle.textContent = "";
  dataListSubtitle.textContent = "";
  dataListDescription.textContent = "";
  const summaryElement = dataListDescription.querySelector(".book-summary");
  if (summaryElement) {
    dataListDescription.removeChild(summaryElement);
  }
}

/**
 * Applies the selected theme to the application by setting the appropriate CSS variables.
 * @param {string} theme - The theme to apply ("day" or "night").
 */
function applyTheme(theme) {
  if (theme === "day") {
    document.body.style.setProperty("--color-dark", day.dark);
    document.body.style.setProperty("--color-light", day.light);
  } else if (theme === "night") {
    document.body.style.setProperty("--color-dark", night.dark);
    document.body.style.setProperty("--color-light", night.light);
  }
}

const genresFragment = document.createDocumentFragment();
const genresOptionAll = document.createElement("option");
genresOptionAll.value = "any";
genresOptionAll.innerText = "All Genres";
genresFragment.appendChild(genresOptionAll);

for (const [id, name] of Object.entries(genres)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  genresFragment.appendChild(option);
}

const authorsFragment = document.createDocumentFragment();
const authorsOptionsAll = document.createElement("option");
authorsOptionsAll.value = "any";
authorsOptionsAll.innerText = "All Authors";
authorsFragment.appendChild(authorsOptionsAll);

for (const [id, name] of Object.entries(authors)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  authorsFragment.appendChild(option);
}

/**
 * Updates the label and disabled status of the dataListButton based on the current page and matches array.
 */
function updateDataListButtonLabel() {
  const remainingBooks = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
  dataListButtonLabel = `(${remainingBooks})`;
  dataListButton.innerHTML = `<span>Show more</span><span class="list__remaining"> ${dataListButtonLabel}</span>`;
  dataListButton.disabled = !remainingBooks > 0;
}

/**
 * Initializes the homepage by displaying the initial set of book previews.
 */
function initializeHomepage() {
  const initialPreviews = createPreviewsFragment(matches, 0, BOOKS_PER_PAGE);
  dataListItems.appendChild(initialPreviews);
  checkFilters(); // Call checkFilters after initializing the homepage
}

/**
 * Updates the homepage by displaying more book previews when the "Show more" button is clicked.
 */
function updateHomepage() {
  const startIndex = (page - 1) * BOOKS_PER_PAGE;
  const endIndex = page * BOOKS_PER_PAGE;
  const newPreviews = createPreviewsFragment(matches, startIndex, endIndex);
  dataListItems.appendChild(newPreviews);
  checkFilters(); // Call checkFilters after updating the homepage
}

/**
 * Checks if the filters are too narrow and displays dataListMessage if needed.
 */
function checkFilters() {
  const searchText = searchTitle.value.trim().toLowerCase();
  const selectedGenre = searchGenres.value;
  const selectedAuthor = searchAuthors.value;

  const noTitleMatch = !matches.some((book) =>
    book.title.toLowerCase().includes(searchText)
  );
  const noGenreMatch =
    selectedGenre !== "any" &&
    !matches.some((book) => book.genres.includes(selectedGenre));
  const noAuthorMatch =
    selectedAuthor !== "any" &&
    !matches.some((book) => book.author === selectedAuthor);

  // Check for mismatched genre and author
  const mismatchedGenreAndAuthor =
    selectedGenre !== "any" &&
    selectedAuthor !== "any" &&
    !matches.some(
      (book) =>
        book.genres.includes(selectedGenre) && book.author === selectedAuthor
    );

  const filtersTooNarrow =
    noTitleMatch || noGenreMatch || noAuthorMatch || mismatchedGenreAndAuthor;

  if (filtersTooNarrow) {
    dataListMessage.textContent =
      "No results found. Your filters might be too narrow.";
    dataListMessage.style.display = "block";
  } else {
    dataListMessage.style.display = "none";
  }
}

// Event listeners

/**
 * Event listener for the "Show more" button click event.
 * Adds more book previews to the homepage when the button is clicked.
 */
dataListButton.addEventListener("click", () => {
  dataListItems.appendChild(
    createPreviewsFragment(
      matches,
      page * BOOKS_PER_PAGE,
      (page + 1) * BOOKS_PER_PAGE
    )
  );
  dataListButton.disabled = !(matches.length - page * BOOKS_PER_PAGE > 0);
  page++;
  updateDataListButtonLabel();
  checkFilters(); // Call checkFilters after updating the dataListButtonLabel
});

/**
 * Event listener for book preview click event.
 * Displays the book overlay with detailed information when a book preview is clicked.
 */
dataListItems.addEventListener("click", (event) => {
  const pathArray = Array.from(event.path || event.composedPath());
  let active;

  for (const node of pathArray) {
    if (active) break;
    const previewId = node?.dataset?.preview;

    for (const singleBook of books) {
      if (singleBook.id === previewId) {
        active = singleBook;
        break;
      }
    }
  }

  if (!active) return;

  dataListOverlay.open = true;
  dataListImage.src = active.image;
  dataListTitle.textContent = active.title;
  dataListSubtitle.textContent = `${authors[active.author]} (${new Date(
    active.published
  ).getFullYear()})`;
  dataListDescription.textContent = active.description;

  if (active.summary) {
    const summaryElement = document.createElement("div");
    summaryElement.classList.add("book-summary");
    summaryElement.textContent = active.summary;
    dataListDescription.appendChild(summaryElement);
  }
});

/**
 * Event listener for the book overlay close button click event.
 * Hides the book overlay when the close button is clicked.
 */
dataListClose.addEventListener("click", () => {
  hideBookOverlay();
});

/**
 * Event listener for the settings button click event.
 * Displays the settings overlay when the settings button is clicked.
 */
settingsButton.addEventListener("click", () => {
  settingsOverlay.style.display = "block";
});

/**
 * Event listener for the settings form submit event.
 * Applies the selected theme and hides the settings overlay when the form is submitted.
 */
settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedTheme = settingsTheme.value;
  applyTheme(selectedTheme);
  settingsOverlay.style.display = "none";
});

/**
 * Event listener for the settings overlay cancel button click event.
 * Hides the settings overlay when the cancel button is clicked.
 */
settingsCancel.addEventListener("click", () => {
  settingsOverlay.style.display = "none";
});

/**
 * Event listener for the search button click event.
 * Displays the search overlay when the search button is clicked.
 */
searchButton.addEventListener("click", () => {
  searchOverlay.style.display = "block";
});

/**
 * Event listener for the search overlay cancel button click event.
 * Hides the search overlay when the cancel button is clicked.
 */
searchCancel.addEventListener("click", () => {
  searchOverlay.style.display = "none";
});

/**
 * Event listener for the search form submit event.
 * Filters the books based on the search input, updates the homepage, and hides the search overlay when the form is submitted.
 */
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchText = searchTitle.value.trim().toLowerCase();
  matches = books.filter((book) => {
    const title = book.title.toLowerCase();
    const author = authors[book.author].toLowerCase();
    const description = book.description.toLowerCase();
    return (
      title.includes(searchText) ||
      author.includes(searchText) ||
      description.includes(searchText)
    );
  });

  page = 1;
  dataListButton.disabled = !(matches.length - page * BOOKS_PER_PAGE > 0);
  dataListItems.innerHTML = "";
  dataListItems.appendChild(createPreviewsFragment(matches, 0, BOOKS_PER_PAGE));
  searchOverlay.style.display = "none";
  updateDataListButtonLabel();
  checkFilters(); // Call checkFilters after filtering the books based on search input
});

/**
 * Event listener for the genre filter change event.
 * Filters the books based on the selected genre, updates the homepage, and hides the search overlay when a genre is selected.
 */
searchGenres.appendChild(genresFragment);

/**
 * Event listener for the author filter change event.
 * Filters the books based on the selected author, updates the homepage, and hides the search overlay when an author is selected.
 */
searchAuthors.appendChild(authorsFragment);

/**
 * Event listener for the "DOMContentLoaded" event.
 * Initializes the homepage, updates the homepage, and updates the dataListMessage once the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeHomepage();
  updateHomepage();
});

/**
 * Event listener for the genre filter change event.
 * Filters the books based on the selected genre, updates the homepage, and hides the search overlay when a genre is selected.
 */
searchGenres.addEventListener("change", () => {
  const selectedGenre = searchGenres.value;
  if (selectedGenre === "any") {
    matches = books;
  } else {
    matches = books.filter((book) => book.genres.includes(selectedGenre));
  }

  page = 1;
  dataListButton.disabled = !(matches.length - page * BOOKS_PER_PAGE > 0);
  dataListItems.innerHTML = "";
  dataListItems.appendChild(createPreviewsFragment(matches, 0, BOOKS_PER_PAGE));
  searchOverlay.style.display = "none";
  updateDataListButtonLabel();
  checkFilters(); // Call checkFilters after filtering the books based on genre
});

/**
 * Event listener for the author filter change event.
 * Filters the books based on the selected author, updates the homepage, and hides the search overlay when an author is selected.
 */
searchAuthors.addEventListener("change", () => {
  const selectedAuthor = searchAuthors.value;
  if (selectedAuthor === "any") {
    matches = books;
  } else {
    matches = books.filter((book) => book.author === selectedAuthor);
  }

  page = 1;
  dataListButton.disabled = !(matches.length - page * BOOKS_PER_PAGE > 0);
  dataListItems.innerHTML = "";
  dataListItems.appendChild(createPreviewsFragment(matches, 0, BOOKS_PER_PAGE));
  searchOverlay.style.display = "none";
  updateDataListButtonLabel();
  checkFilters(); // Call checkFilters after filtering the books based on author
});
