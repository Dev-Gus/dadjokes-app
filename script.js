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

function setLoadingState(isLoading) {
    if(isLoading) {
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
    const jokeText = joke.textContent.trim();
    const isEmpty = !jokeText || jokeText === PLACEHOLDER_TEXT || jokeText === 'Loading...';
    copyJokeBtn.disabled = isEmpty;
}

async function getJoke() {
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

async function copyJoke() {
    const jokeText = joke.textContent.trim();

    if (!jokeText || jokeText === PLACEHOLDER_TEXT || jokeText === 'Loading...') return;

    try {
        await navigator.clipboard.writeText(jokeText);
        copyJokeBtn.textContent = 'Copied!';
    } catch (error) {
        copyJokeBtn.textContent = 'Failed to Copy';
        console.error('Clipboard error:', error);
    } finally {
        setTimeout(() => {
            copyJokeBtn.textContent = 'Copy Joke';
        }, 1500);
    }
}