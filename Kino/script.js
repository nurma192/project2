const baseUrl = 'https://api.themoviedb.org/3'
const imageUrl400 = 'https://image.tmdb.org/t/p/w400'
const imageUrl200 = 'https://image.tmdb.org/t/p/w200'
const apiKey = '804a432a05c81a1dac58c222a1eb8949'
const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MDRhNDMyYTA1YzgxYTFkYWM1OGMyMjJhMWViODk0OSIsIm5iZiI6MTczMTM5MjU2Ny4wODIwMDU1LCJzdWIiOiI2NzMyZjJmNDYwN2U4YWEyMGVmNjg4YmEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Sv3mAn1-n5BqDwW9MPknT5d9sM7qod5Ept07YiYXdjA'
const searchInput = document.querySelector(".searchFilm_input")
const searchBtn = document.querySelector(".searchFilm_btn")
const content = document.querySelector(".content")
const searchTitle = document.querySelector(".searchTitle");
const sortByRatingButton = document.querySelector("#sortByRating");
const sortByPopular = document.querySelector("#sortByPopular");
const sortByDate = document.querySelector("#sortByDate");

const dialog = document.getElementById("film-info");
dialog.close()
dialog.addEventListener('click', ((event) => {
		let rect = event.target.getBoundingClientRect();
		if (rect.left > event.clientX || rect.right < event.clientX || rect.top > event.clientY || rect.bottom < event.clientY) {
			dialog.close();
		}
	})
);

const autoSuggest = document.getElementById("autoSuggest");

function clearSuggest() {
	autoSuggest.innerHTML = ``
}

function debounce(fn, delay) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

async function fetchFilms(query) {
	if (query) {
		const films = await getFilmByNameAndPage(query, 1);
		autoSuggest.innerHTML = films
			.slice(0, 5)
			.map(film => `<li onclick="searchFilmAndShow('${film.title}')">${film.title}</li>`)
			.join('');
	}
}

const debouncedFetchFilms = debounce(fetchFilms, 300);
searchInput.addEventListener("input", (e) => {
	debouncedFetchFilms(e.target.value);
});

searchBtn.addEventListener("click", async () => {
	if (searchInput.value.trim() === "") {
		return;
	}
	await searchFilmAndShow(searchInput.value)
})
searchInput.addEventListener("keyup", async (e) => {
	if (searchInput.value.trim() === "") {
		return;
	}
	if (e.key === "Enter") {
		await searchFilmAndShow(searchInput.value)
	}
})

showFavorites().catch(err => console.error(err))

async function searchFilmAndShow(value) {
	const films = await getFilmByNameAndPage(value, 1)
	console.log(films)
	showFilms(films)
	searchTitle.innerText = value
}

async function getFilmByNameAndPage(value, page) {
	const url = `${baseUrl}/search/movie
		?query=${value}
		&include_adult=false
		&language=en-US
		&page=${page}
		&sort_by=release_date.desc`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	};

	try {
		const res = await fetch(url, options);
		const json = await res.json();
		return json.results;
	} catch (err) {
		console.error(err);
		return null;
	}
}

async function getFilmAllInfoById(id) {
	const url = `${baseUrl}/movie/${id}?append_to_response=credits&language=en-US`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	};

	try {
		const res = await fetch(url, options);
		return await res.json();
	} catch (err) {
		console.error(err);
		return null;
	}
}

// showFilms(films)

function showFilms(films, sortBy = '') {
	sortByRatingButton.disabled = true;
	sortByDate.disabled = true;
	sortByPopular.disabled = true;
	if (sortBy === "rating") {
		sortByRatingButton.classList.add("active");
		sortByDate.classList.remove("active");
		sortByPopular.classList.remove("active");
	} else if (sortBy === "popularity") {
		sortByRatingButton.classList.remove("active");
		sortByDate.classList.remove("active");
		sortByPopular.classList.add("active");
	} else if (sortBy === "date") {
		sortByRatingButton.classList.remove("active");
		sortByDate.classList.add("active");
		sortByPopular.classList.remove("active");
	} else {
		sortByRatingButton.classList.remove("active");
		sortByDate.classList.remove("active");
		sortByPopular.classList.remove("active");
	}
	sortByRatingButton.addEventListener("click", () => {
		console.log(sortByRatingButton)
		if (sortBy !== "rating") {
			films.sort((a, b) => b.vote_average - a.vote_average);
			showFilms(films, 'rating')
		}
	})
	sortByPopular.addEventListener("click", () => {
		console.log(sortByPopular)

		if (sortBy !== "popularity") {
			films.sort((a, b) => b.popularity - a.popularity);
			showFilms(films, 'popularity');
		}
	})
	sortByDate.addEventListener("click", () => {
		console.log(sortByDate)

		if (sortBy !== "date") {
			films.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
			showFilms(films, 'date')
		}
	})
	clearSuggest()
	let htmlContent = '';
	films.forEach(film => {
		htmlContent +=
			`<div class="film-card">
                <div class="card-img">

                    <img src="${imageUrl400}${film?.poster_path}" alt="" class="film-img">
				</div>
                <div class="film-information">
	                <h3>${film.title}</h3>
	                <p class="film-info-text"><b>Release date</b>: ${film?.release_date}</p>
	                <p class="film-info-text"><b>Rating</b>: ${film?.vote_average}</p>
				</div>  
                <div class="card-buttons">
                    <button class="btn show-btn" onclick="showFilmModal(${film.id})">Show</button>
                    <input class="favorite-checkbox" type="checkbox" name="check" id="check${film.id}" ${isFavorite(film.id) ? 'checked' : ''}> 
                    <label for="check${film.id}" class="btn favorite-btn" onclick="handleFavorite(${film.id})">
		                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
					</label>
				</div>
            </div>`;
	});
	content.innerHTML = htmlContent;
	sortByRatingButton.disabled = false;
	sortByDate.disabled = false;
	sortByPopular.disabled = false;
}


async function showFavorites() {
	const favorites = JSON.parse(localStorage.getItem("favorites"))
	console.log('favorites', favorites)

	if (favorites && favorites.length > 0) {
		searchTitle.innerText = "Your Favorites"
		let favoriteMovies = []

		for (const item of favorites) {
			const film = await getFilmAllInfoById(item)
			favoriteMovies.push(film)
		}

		showFilms(favoriteMovies)

	} else {
		searchTitle.innerText = "Your Favorites"
		content.innerHTML = `<h1>You dont have any favorite films, search the films and you can save this films here</h1>`
	}
}

function handleFavorite(id) {
	const favorites = JSON.parse(localStorage.getItem("favorites")) || []
	if (!favorites) return

	if (favorites.find(item => item === id)) {
		removeFromFavorites(id)
		return false;
	} else {
		addToFavorites(id)
		return true
	}
}

function addToFavorites(id) {
	const favorites = JSON.parse(localStorage.getItem("favorites")) || []
	if (favorites.find(item => item === id)) return
	const newFavorites = [...favorites, id]
	localStorage.setItem("favorites", JSON.stringify(newFavorites))
}

function removeFromFavorites(id) {
	let favorites = JSON.parse(localStorage.getItem("favorites"))
	if (favorites && favorites.length > 0) {
		favorites = favorites.filter(item => item !== id)
		localStorage.setItem("favorites", JSON.stringify(favorites))
	}
}

function isFavorite(id) {
	const favorites = JSON.parse(localStorage.getItem("favorites")) || []
	return !!favorites.find(item => item === id)
}


function addToFavoritesAndChangeState(id) {
	const handleFavButton = document.getElementById('handleFavBtn')
	const favCheckbox = document.getElementById(`check${id}`)
	if (handleFavorite(id)) {
		handleFavButton.innerHTML = `Remove From Favorites <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`
		favCheckbox.checked = true
	} else {
		handleFavButton.innerHTML = `Add To Favorites <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`
		favCheckbox.checked = false
	}

}

// showFilmModal(209112)
//------Dialog------
async function showFilmModal(id) {
	if (!id) return
	const film = await getFilmAllInfoById(id)
	console.log(film)
	// const film = testFilm
	dialog.innerHTML = `
		<div class="film-modal-content">
			<div class="about-film">
				<div class="film-img-btn">
					<img class="film-img" src="${imageUrl400}${film.poster_path}" alt="#">
					<button class="btn add-to-fav-btn" id="handleFavBtn" onclick="addToFavoritesAndChangeState(${film.id})">
					${isFavorite(film.id) ? 'Remove From Favorite' : 'Add To Favorites'}
		                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
					</button>
				</div>
				<div class="film-info">
					<h2 class="film-name">${film.title}</h2>
					<div class="rating-block">
						<h3>Rating:</h3>
						<div class="rating-circle" style="${(Math.round(film.vote_average * 10) / 10) > 7 ? `background: green` : `background: red`}">${Math.round(film.vote_average * 10) / 10}</div>
					</div>
					<p class="runtime-text"><b>Runtime:</b> ${film.runtime} minutes</p>
					
					<h3>Cast</h3>
					<div class="castOrCrew">
						${film.credits?.cast
		// .sort((a, b) => b.popularity - a.popularity)
		.filter(actor => actor.profile_path !== null)
		.slice(0, 12)
		.map(actor => {
			return `
								<div class="actor-card">
									<img class="actor-img" src="${imageUrl200}${actor.profile_path}" alt="">
									<h4>${actor.name}</h4>
									<p>${actor.character}</p>
								</div>
							`
		}).join('')}
						
					</div>
					<h3>Crew</h3>
					<div class="castOrCrew">
						${film.credits?.crew
		.filter(crew => crew.profile_path !== null)
		.slice(0, 4)
		.map(crew => {
			return `
									<div class="actor-card">
										<img class="actor-img" src="${imageUrl200}${crew.profile_path}" alt="">
										<h4>${crew.name}</h4>
										<p>${crew.job}</p>
									</div>
								`
		}).join('')}
					</div>	
				</div>
			</div>
		</div>
	`
	dialog.showModal();
}

const body = document.querySelector("body");
body.addEventListener("click", (e) => {
	if (autoSuggest.innerHTML !== '') {
		autoSuggest.innerHTML = ''
	}
})

