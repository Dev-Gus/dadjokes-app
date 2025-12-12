const getJokeBtn = document.getElementById('get-joke-btn');
const joke = document.getElementById('joke');

getJokeBtn.addEventListener('click', getJoke);

function setLoadingState(isLoading) {
    if(isLoading) {
        getJokeBtn.disabled = true;
        getJokeBtn.textContent = 'Loading...';
        joke.style.opacity = '0.6';
    } else {
        getJokeBtn.disabled = false;
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