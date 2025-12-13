const getJokeBtn = document.getElementById('get-joke-btn');
const joke = document.getElementById('joke');
const copyJokeBtn = document.getElementById('copy-joke-btn');

const PLACEHOLDER_TEXT = 'Click the button above to get a dad joke! 😄';

getJokeBtn.addEventListener('click', getJoke);
copyJokeBtn.addEventListener('click', copyJoke);

// Initialize: disable copy button on load since only placeholder is shown
updateCopyButtonState();

function setLoadingState(isLoading) {
    if(isLoading) {
        getJokeBtn.disabled = true;
        copyJokeBtn.disabled = true;
        getJokeBtn.textContent = 'Loading...';
        joke.style.opacity = '0.6';
    } else {
        getJokeBtn.disabled = false;
        getJokeBtn.textContent = 'Get a Dad Joke';
        joke.style.opacity = '1';
        updateCopyButtonState();
    }
}

function updateCopyButtonState() {
    const jokeText = joke.textContent.trim();
    const isEmpty = !jokeText || jokeText === PLACEHOLDER_TEXT || jokeText === 'Loading...';
    copyJokeBtn.disabled = isEmpty;
}

async function getJoke() {
    setLoadingState(true);

    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            }
        });

        if(!response.ok) {
            throw new Error('Failed to fetch a joke');
        }

        const data = await response.json();
        // Remove fade-in class to restart animation
        joke.classList.remove('fade-in');
        // Force reflow to restart animation
        void joke.offsetWidth;
        joke.textContent = data.joke;
        joke.classList.add('fade-in');
    } catch (error) {
        joke.classList.remove('fade-in');
        void joke.offsetWidth;
        joke.textContent = "Failed to fetch a joke. Please try again later.";
        joke.classList.add('fade-in');
        console.error('Error fetching joke:', error);
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