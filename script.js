// ============================================================================
// CONSTANTS
// ============================================================================

// DOM Selectors
const SELECTORS = {
    GET_JOKE_BTN: 'get-joke-btn',
    JOKE: 'joke',
    COPY_JOKE_BTN: 'copy-joke-btn',
    ERROR_MESSAGE: 'error-message',
    RETRY_BTN: 'retry-btn'
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
    ERROR_FETCH_BASE: 'Failed to fetch a joke. ',
    ERROR_TIMEOUT: 'The request timed out. Please check your connection and try again.',
    ERROR_NETWORK: 'Network error. Please check your internet connection.',
    ERROR_GENERIC: 'Please try again later.'
};

// Animation & UI Constants
const ANIMATION = {
    FADE_IN_CLASS: 'fade-in',
    LOADING_OPACITY: '0.6',
    NORMAL_OPACITY: '1',
    HIDDEN_CLASS: 'hidden'
};

const TIMING = {
    COPY_BUTTON_RESET_DELAY: 1500, // milliseconds
    REQUEST_TIMEOUT: 10000 // 10 seconds
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const getJokeBtn = document.getElementById(SELECTORS.GET_JOKE_BTN);
const jokeElement = document.getElementById(SELECTORS.JOKE);
const copyJokeBtn = document.getElementById(SELECTORS.COPY_JOKE_BTN);
const errorMessage = document.getElementById(SELECTORS.ERROR_MESSAGE);
const retryBtn = document.getElementById(SELECTORS.RETRY_BTN);

// ============================================================================
// EVENT LISTENERS
// ============================================================================

getJokeBtn.addEventListener('click', handleGetJoke);
copyJokeBtn.addEventListener('click', handleCopyJoke);
retryBtn.addEventListener('click', handleGetJoke);

// Initialize: disable copy button on load since only placeholder is shown
updateCopyButtonState();

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Fetches a random dad joke from the API with timeout support
 * @param {AbortSignal} signal - AbortSignal for request cancellation
 * @returns {Promise<{joke: string}>} Promise that resolves with joke data
 * @throws {Error} If the API request fails or times out
 */
async function fetchJokeFromAPI(signal) {
    const response = await fetch(API_CONFIG.BASE_URL, {
        headers: API_CONFIG.HEADERS,
        signal: signal
    });

    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
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
        retryBtn.disabled = true;
        getJokeBtn.textContent = MESSAGES.LOADING;
        jokeElement.style.opacity = ANIMATION.LOADING_OPACITY;
        hideError();
        return;
    }

    getJokeBtn.disabled = false;
    retryBtn.disabled = false;
    getJokeBtn.textContent = MESSAGES.GET_JOKE_BTN_DEFAULT;
    jokeElement.style.opacity = ANIMATION.NORMAL_OPACITY;
    updateCopyButtonState();
}

/**
 * Displays an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove(ANIMATION.HIDDEN_CLASS);
    retryBtn.classList.remove(ANIMATION.HIDDEN_CLASS);
}

/**
 * Hides the error message and retry button
 */
function hideError() {
    errorMessage.classList.add(ANIMATION.HIDDEN_CLASS);
    retryBtn.classList.add(ANIMATION.HIDDEN_CLASS);
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
 * Fetches a new joke from the API and displays it with timeout handling
 */
async function handleGetJoke() {
    setLoadingState(true);
    hideError();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, TIMING.REQUEST_TIMEOUT);

    try {
        const data = await fetchJokeFromAPI(controller.signal);
        clearTimeout(timeoutId);
        updateJokeText(data.joke);
        hideError();
    } catch (error) {
        clearTimeout(timeoutId);
        
        let errorMsg = MESSAGES.ERROR_FETCH_BASE;
        
        if (error.name === 'AbortError') {
            errorMsg += MESSAGES.ERROR_TIMEOUT;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg += MESSAGES.ERROR_NETWORK;
        } else {
            errorMsg += MESSAGES.ERROR_GENERIC;
        }
        
        showError(errorMsg);
        console.error('Error fetching joke:', error);
        
        const currentJoke = jokeElement.textContent.trim();
        if (currentJoke === MESSAGES.PLACEHOLDER || 
            currentJoke === MESSAGES.LOADING || 
            currentJoke.startsWith(MESSAGES.ERROR_FETCH_BASE)) {
            jokeElement.textContent = MESSAGES.PLACEHOLDER;
        }
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