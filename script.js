// ============================================================================
// CONSTANTS
// ============================================================================

// DOM Selectors
const SELECTORS = {
    GET_JOKE_BTN: 'get-joke-btn',
    JOKE: 'joke',
    COPY_JOKE_BTN: 'copy-joke-btn'
};

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://icanhazdadjoke.com/',
    HEADERS: {
        'Accept': 'application/json'
    }
};

// UI Messages
const MESSAGES = {
    PLACEHOLDER: 'Click the button above to get a dad joke!',
    LOADING: 'Loading...',
    GET_JOKE_BTN_DEFAULT: 'Get a Dad Joke',
    COPY_JOKE_BTN_DEFAULT: 'Copy Joke',
    COPY_JOKE_BTN_COPIED: 'Copied!',
    COPY_JOKE_BTN_FAILED: 'Failed to Copy',
    ERROR_FETCH_JOKE: 'Failed to fetch a joke. Please try again later.'
};

// Animation & UI Constants
const ANIMATION = {
    FADE_IN_CLASS: 'fade-in',
    LOADING_OPACITY: '0.6',
    NORMAL_OPACITY: '1'
};

const TIMING = {
    COPY_BUTTON_RESET_DELAY: 1500 // milliseconds
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const getJokeBtn = document.getElementById(SELECTORS.GET_JOKE_BTN);
const jokeElement = document.getElementById(SELECTORS.JOKE);
const copyJokeBtn = document.getElementById(SELECTORS.COPY_JOKE_BTN);

// ============================================================================
// EVENT LISTENERS
// ============================================================================

getJokeBtn.addEventListener('click', handleGetJoke);
copyJokeBtn.addEventListener('click', handleCopyJoke);

// Initialize: disable copy button on load since only placeholder is shown
updateCopyButtonState();

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Fetches a random dad joke from the API
 * @returns {Promise<{joke: string}>} Promise that resolves with joke data
 * @throws {Error} If the API request fails
 */
async function fetchJokeFromAPI() {
    const response = await fetch(API_CONFIG.BASE_URL, {
        headers: API_CONFIG.HEADERS
    });

    if (!response.ok) {
        throw new Error('Failed to fetch a joke');
    }

    return await response.json();
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Updates the loading state of the UI
 * @param {boolean} isLoading - Whether the app is currently loading
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        getJokeBtn.disabled = true;
        copyJokeBtn.disabled = true;
        getJokeBtn.textContent = MESSAGES.LOADING;
        jokeElement.style.opacity = ANIMATION.LOADING_OPACITY;
        return;
    }

    getJokeBtn.disabled = false;
    getJokeBtn.textContent = MESSAGES.GET_JOKE_BTN_DEFAULT;
    jokeElement.style.opacity = ANIMATION.NORMAL_OPACITY;
    updateCopyButtonState();
}

/**
 * Updates the copy button's enabled/disabled state based on current joke content
 */
function updateCopyButtonState() {
    const jokeText = jokeElement.textContent.trim();
    const isEmpty = !jokeText || 
                   jokeText === MESSAGES.PLACEHOLDER || 
                   jokeText === MESSAGES.LOADING;
    
    copyJokeBtn.disabled = isEmpty;
}

/**
 * Applies fade-in animation to the joke element
 * Removes and re-adds the class to restart the animation
 */
function triggerFadeInAnimation() {
    jokeElement.classList.remove(ANIMATION.FADE_IN_CLASS);
    // Force reflow to restart animation
    void jokeElement.offsetWidth;
    jokeElement.classList.add(ANIMATION.FADE_IN_CLASS);
}

/**
 * Updates the joke element's text content with animation
 * @param {string} text - The text to display
 */
function updateJokeText(text) {
    triggerFadeInAnimation();
    jokeElement.textContent = text;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles the "Get a Dad Joke" button click event
 * Fetches a new joke from the API and displays it
 */
async function handleGetJoke() {
    setLoadingState(true);

    try {
        const data = await fetchJokeFromAPI();
        updateJokeText(data.joke);
    } catch (error) {
        updateJokeText(MESSAGES.ERROR_FETCH_JOKE);
        console.error('Error fetching joke:', error);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handles the "Copy Joke" button click event
 * Copies the current joke text to the clipboard
 */
async function handleCopyJoke() {
    const jokeText = jokeElement.textContent.trim();

    // Early return if joke is empty or placeholder
    if (!jokeText || 
        jokeText === MESSAGES.PLACEHOLDER || 
        jokeText === MESSAGES.LOADING) {
        return;
    }

    try {
        await navigator.clipboard.writeText(jokeText);
        copyJokeBtn.textContent = MESSAGES.COPY_JOKE_BTN_COPIED;
    } catch (error) {
        copyJokeBtn.textContent = MESSAGES.COPY_JOKE_BTN_FAILED;
        console.error('Clipboard error:', error);
    } finally {
        setTimeout(() => {
            copyJokeBtn.textContent = MESSAGES.COPY_JOKE_BTN_DEFAULT;
        }, TIMING.COPY_BUTTON_RESET_DELAY);
    }
}