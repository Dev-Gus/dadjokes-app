const getJokeBtn = document.getElementById('get-joke-btn');
const joke = document.getElementById('joke');
const copyJokeBtn = document.getElementById('copy-joke-btn');

getJokeBtn.addEventListener('click', getJoke);
copyJokeBtn.addEventListener('click', copyJoke);

function setLoadingState(isLoading) {
    if(isLoading) {
        getJokeBtn.disabled = true;
        copyJokeBtn.disabled = true;
        getJokeBtn.textContent = 'Loading...';
        joke.style.opacity = '0.6';
    } else {
        getJokeBtn.disabled = false;
        copyJokeBtn.disabled = false;
        getJokeBtn.textContent = 'Get a Dad Joke';
        joke.style.opacity = '1';
    }
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
        joke.textContent = data.joke;
    } catch (error) {
        joke.textContent = "Failed to fetch a joke. Please try again later.";
        console.error('Error fetching joke:', error);
    } finally {
        setLoadingState(false);
    }
}

async function copyJoke() {
    const jokeText = joke.textContent;

    if (!jokeText || jokeText.trim() === '' || jokeText.trim() === 'Loading...') return;

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