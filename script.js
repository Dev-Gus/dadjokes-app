const getJokeBtn = document.getElementById('get-joke-btn');
const joke = document.getElementById('joke');
const copyJokeBtn = document.getElementById('copy-joke-btn');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');

const PLACEHOLDER_TEXT = 'Click the button above to get a dad joke!';
const TIMEOUT_DURATION = 10000; // 10 seconds

getJokeBtn.addEventListener('click', getJoke);
copyJokeBtn.addEventListener('click', copyJoke);
retryBtn.addEventListener('click', getJoke);

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
        retryBtn.disabled = true;
        getJokeBtn.textContent = 'Loading...';
        joke.style.opacity = '0.6';
        hideError();
    } else {
        getJokeBtn.disabled = false;
        retryBtn.disabled = false;
        getJokeBtn.textContent = 'Get a Dad Joke';
        joke.style.opacity = '1';
        updateCopyButtonState();
    }

    getJokeBtn.disabled = false;
    getJokeBtn.textContent = MESSAGES.GET_JOKE_BTN_DEFAULT;
    jokeElement.style.opacity = ANIMATION.NORMAL_OPACITY;
    updateCopyButtonState();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    retryBtn.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
    retryBtn.classList.add('hidden');
}

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
    hideError();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, TIMEOUT_DURATION);

    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        // Remove fade-in class to restart animation
        joke.classList.remove('fade-in');
        // Force reflow to restart animation
        void joke.offsetWidth;
        joke.textContent = data.joke;
        joke.classList.add('fade-in');
        hideError();
    } catch (error) {
        clearTimeout(timeoutId);
        
        let errorMsg = 'Failed to fetch a joke. ';
        
        if (error.name === 'AbortError') {
            errorMsg += 'The request timed out. Please check your connection and try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg += 'Network error. Please check your internet connection.';
        } else {
            errorMsg += 'Please try again later.';
        }
        
        showError(errorMsg);
        console.error('Error fetching joke:', error);
        
        const currentJoke = joke.textContent.trim();
        if (currentJoke === PLACEHOLDER_TEXT || currentJoke === 'Loading...' || currentJoke.startsWith('Failed to fetch')) {
            joke.textContent = PLACEHOLDER_TEXT;
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