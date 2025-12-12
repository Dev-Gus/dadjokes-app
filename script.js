const getJokeBtn = document.getElementById('get-joke-btn');
const joke = document.getElementById('joke');

getJokeBtn.addEventListener('click', getJoke);

async function getJoke() {
    joke.textContent = 'Loading...';
    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        joke.textContent = data.joke;
    } catch (error) {
        joke.textContent = "Failed to fetch a joke. Please try again later.";
        console.error('Error fetching joke:', error);
    }
}