const baseUrl = "https://api.spoonacular.com/recipes"
const apiKey = "673879c24a6346e7a510ec778d8f0304"

const searchInput = document.querySelector(".searchRecipe_input")
const searchBtn = document.querySelector(".searchRecipe_btn")
const content = document.querySelector(".content")
const searchTitle = document.querySelector(".searchTitle");
const dialog = document.getElementById("recipe-info");
dialog.close()
dialog.addEventListener('click', ((event) => {
		let rect = event.target.getBoundingClientRect();
		if (rect.left > event.clientX || rect.right < event.clientX || rect.top > event.clientY || rect.bottom < event.clientY) {
			dialog.close();
		}
	})
);

const autoSuggest = document.getElementById("autoSuggest");

function clearSuggest(){
	autoSuggest.innerHTML = ``
}
function debounce(fn, delay) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

async function fetchRecipes(query) {
	if (query) {
		const recipesRequest = await getRecipeByName(query, 5);
		autoSuggest.innerHTML = recipesRequest.results
			.map(recipe => `<li onclick="searchRecipeAndShow('${recipe.title}')">${recipe.title}</li>`)
			.join('');
	}
}

const debouncedFetchRecipes = debounce(fetchRecipes, 300);

searchInput.addEventListener("input", (e) => {
	debouncedFetchRecipes(e.target.value);
});



searchBtn.addEventListener("click", async () => {
	await searchRecipeAndShow(searchInput.value)
})
searchInput.addEventListener("keyup", async (e) => {
	if (e.key === "Enter") {
		await searchRecipeAndShow(searchInput.value)
	}
})

showFavorites().catch(err => console.error(err))

async function searchRecipeAndShow(value) {
	const recipes = await getRecipeByName(value, 50)
	showRecipes(recipes)
	searchTitle.innerText = value
}

async function getRecipeByName(value, maxItem) {
	try {
		const response = await fetch(
			`${baseUrl}/complexSearch/
			?apiKey=${apiKey}
			&query=${value}&number=${maxItem}`
		)
		const recipes = await response.json()
		// console.log(recipes)
		return recipes
	} catch (err) {
		console.error(err)
	}
}

async function getRecipeAllInfoById(id) {
	// https://api.spoonacular.com/recipes/{id}/information

	try {
		const response = await fetch(
			`${baseUrl}/${id}/information
			?apiKey=${apiKey}
			&includeNutrition=true`
		)
		const recipes = await response.json()
		// console.log(recipes)
		return recipes
	} catch (err) {
		console.error(err)
	}
}

async function showFavorites() {
	const favorites = JSON.parse(localStorage.getItem("favorites"))
	console.log('favorites', favorites)

	if (favorites && favorites.length > 0) {
		searchTitle.innerText = "Your Favorites"
		content.innerHTML = ``

		for (const item of favorites) {
			const recipe = await getRecipeAllInfoById(item)
			console.log('recipe', recipe)

			content.innerHTML += `<div class="recipe-card">
					                <div class="card-img">
					                    <img src="${recipe.image}" alt="" class="recipe-img">
									</div>
					                <h4>${recipe.title}</h4>
					                <div class="card-buttons">
					                    <button class="btn show-btn" onclick="showRecipeInfo(${recipe.id})">Show</button>
					                    <input class="favorite-checkbox" type="checkbox" name="check" id="check${recipe.id}" ${isFavorite(recipe.id) ? 'checked' : ''}>
					                    <label for="check${recipe.id}" class="btn favorite-btn" onclick="handleFavorite(${recipe.id})">
							                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
										</label> 
									
									</div>
					            </div>`
		}

	} else {
		searchTitle.innerText = "Your Favorites"
		content.innerHTML = `<h3>You dont have any favorite recipes, search the recipes and you can save this recipes here</h3>`
	}
}

function handleFavorite(id) {
	console.log('handleFavorite')
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
	console.log("added", newFavorites)
}

function removeFromFavorites(id) {
	let favorites = JSON.parse(localStorage.getItem("favorites"))
	if (favorites && favorites.length > 0) {
		favorites = favorites.filter(item => item !== id)
		localStorage.setItem("favorites", JSON.stringify(favorites))
		console.log("removed", favorites)
	}
}

function isFavorite(id) {
	const favorites = JSON.parse(localStorage.getItem("favorites")) || []
	return !!favorites.find(item => item === id)
}

function showRecipes(items) {
	clearSuggest()
	let htmlContent = '';
	items.results.forEach(item => {
		htmlContent +=
			`<div class="recipe-card">
                <div class="card-img">
                    <img src="${item.image}" alt="" class="recipe-img">
				</div>
                <h4>${item.title}</h4>
                <div class="card-buttons">
                    <button class="btn show-btn" onclick="showRecipeInfo(${item.id})">Show</button>
                    <input class="favorite-checkbox" type="checkbox" name="check" id="check${item.id}" ${isFavorite(item.id) ? 'checked' : ''}>
                    <label for="check${item.id}" class="btn favorite-btn" onclick="handleFavorite(${item.id})">
		                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
					</label> 
				
				</div>
            </div>`;
	});
	content.innerHTML = htmlContent;
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

//------Dialog------
async function showRecipeInfo(id) {
	if (!id) return
	const recipe = await getRecipeAllInfoById(id)
	console.log(recipe)
	// const recipe = testRecipe
	dialog.innerHTML = `
		<div class="recipe-info">
			<img class="info-img" src="${recipe?.image}" alt="">
			<h1 class="recipe-title">${recipe.title}</h1>
			<button class="btn add-to-fav-btn" id="handleFavBtn" onclick="addToFavoritesAndChangeState(${recipe.id})">
			${isFavorite(recipe.id) ? 'Remove From Favorite' : 'Add To Favorites'}
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
			
			</button>
			<p><b>Preparation: </b> ${recipe.readyInMinutes} minutes</p>
			<div class="recipe-ingredients">
				<span><b>Ingredients:</b></span>
				<div class="ingredients">
					${recipe.extendedIngredients.map(ingredient => {
		return `<div class="ingredient">${ingredient.name} x${ingredient.amount}</div>`;
	}).join('')}
				</div>
			</div>
			<div class="steps">
				<span><b>Steps:</b></span>
				<ul>
					${recipe.analyzedInstructions[0]?.steps.map(step => {
							return `<li>            
										${step.number})
										${step.step}
									</li>`
	}).join('')}
				</ul>
			</div>
			<div class="nutritional">
				<table>
					<thead>
					    <th>Nutrition</th>
					    <th>Amount</th>
					</thead>
					${recipe.nutrition.nutrients.map((nutrition) => {
						if (!['Calories', 'Fat', 'Sugar', 'Alcohol'].includes(nutrition.name)) return
						return `<tr>
									<th>${nutrition.name}</th>
									<th>${nutrition.amount}${nutrition.unit}</th>
								</tr>`
	}).join('')}
				</table>
			</div>
		</div>
	`
	dialog.showModal();
}

// showRecipeInfo(10)

// showButton.addEventListener("click", () => {
// 	dialog.showModal();
// });
//
// closeButton.addEventListener("click", () => {
// 	dialog.close();
// });


const testRecipe = {
	"vegetarian": false,
	"vegan": false,
	"glutenFree": false,
	"dairyFree": false,
	"veryHealthy": false,
	"cheap": false,
	"veryPopular": false,
	"sustainable": false,
	"lowFodmap": false,
	"weightWatcherSmartPoints": 17,
	"gaps": "no",
	"preparationMinutes": null,
	"cookingMinutes": null,
	"aggregateLikes": 1,
	"healthScore": 27,
	"creditsText": "foodista.com",
	"sourceName": "foodista.com",
	"pricePerServing": 163.92,
	"extendedIngredients": [
		{
			"id": 10123,
			"aisle": "Meat",
			"image": "raw-bacon.png",
			"consistency": "SOLID",
			"name": "bacon",
			"nameClean": "applewood smoked bacon",
			"original": "1 slice bacon (black peppered bacon is a favorite)",
			"originalName": "bacon (black peppered bacon is a favorite)",
			"amount": 1,
			"unit": "slice",
			"meta": [
				"black",
				"( peppered bacon is a favorite)"
			],
			"measures": {
				"us": {
					"amount": 1,
					"unitShort": "slice",
					"unitLong": "slice"
				},
				"metric": {
					"amount": 1,
					"unitShort": "slice",
					"unitLong": "slice"
				}
			}
		},
		{
			"id": 1002030,
			"aisle": "Spices and Seasonings",
			"image": "pepper.jpg",
			"consistency": "SOLID",
			"name": "pepper",
			"nameClean": "black pepper",
			"original": "black pepper",
			"originalName": "black pepper",
			"amount": 4,
			"unit": "servings",
			"meta": [
				"black"
			],
			"measures": {
				"us": {
					"amount": 4,
					"unitShort": "servings",
					"unitLong": "servings"
				},
				"metric": {
					"amount": 4,
					"unitShort": "servings",
					"unitLong": "servings"
				}
			}
		},
		{
			"id": 10011693,
			"aisle": "Canned and Jarred",
			"image": "tomatoes-canned.png",
			"consistency": "SOLID",
			"name": "canned tomatoes",
			"nameClean": "canned tomatoes",
			"original": "1 1/2 ounces pounds Roma tomatoes, chopped or 28 can",
			"originalName": "pounds Roma tomatoes, chopped or 28 can",
			"amount": 1.5,
			"unit": "ounces",
			"meta": [
				"chopped"
			],
			"measures": {
				"us": {
					"amount": 1.5,
					"unitShort": "oz",
					"unitLong": "ounces"
				},
				"metric": {
					"amount": 42.524,
					"unitShort": "g",
					"unitLong": "grams"
				}
			}
		},
		{
			"id": 11124,
			"aisle": "Produce",
			"image": "sliced-carrot.png",
			"consistency": "SOLID",
			"name": "carrots",
			"nameClean": "carrot",
			"original": "2 carrots, peeled and finely diced",
			"originalName": "carrots, peeled and finely diced",
			"amount": 2,
			"unit": "",
			"meta": [
				"diced",
				"peeled",
				"finely"
			],
			"measures": {
				"us": {
					"amount": 2,
					"unitShort": "",
					"unitLong": ""
				},
				"metric": {
					"amount": 2,
					"unitShort": "",
					"unitLong": ""
				}
			}
		},
		{
			"id": 11143,
			"aisle": "Produce",
			"image": "celery.jpg",
			"consistency": "SOLID",
			"name": "celery",
			"nameClean": "celery",
			"original": "2 stalks celery, finely diced",
			"originalName": "celery, finely diced",
			"amount": 2,
			"unit": "stalks",
			"meta": [
				"diced",
				"finely"
			],
			"measures": {
				"us": {
					"amount": 2,
					"unitShort": "stalks",
					"unitLong": "stalks"
				},
				"metric": {
					"amount": 2,
					"unitShort": "stalks",
					"unitLong": "stalks"
				}
			}
		},
		{
			"id": 6172,
			"aisle": "Canned and Jarred",
			"image": "chicken-broth.png",
			"consistency": "LIQUID",
			"name": "chicken stock",
			"nameClean": "chicken stock",
			"original": "5 cups chicken stock (or broth)",
			"originalName": "chicken stock (or broth)",
			"amount": 5,
			"unit": "cups",
			"meta": [
				"(or broth)"
			],
			"measures": {
				"us": {
					"amount": 5,
					"unitShort": "cups",
					"unitLong": "cups"
				},
				"metric": {
					"amount": 1.2,
					"unitShort": "l",
					"unitLong": "liters"
				}
			}
		},
		{
			"id": 11215,
			"aisle": "Produce",
			"image": "garlic.png",
			"consistency": "SOLID",
			"name": "garlic",
			"nameClean": "garlic",
			"original": "2 cloves garlic",
			"originalName": "garlic",
			"amount": 2,
			"unit": "cloves",
			"meta": [],
			"measures": {
				"us": {
					"amount": 2,
					"unitShort": "cloves",
					"unitLong": "cloves"
				},
				"metric": {
					"amount": 2,
					"unitShort": "cloves",
					"unitLong": "cloves"
				}
			}
		},
		{
			"id": 10720420,
			"aisle": "Pasta and Rice",
			"image": "spaghetti.jpg",
			"consistency": "SOLID",
			"name": "linguine",
			"nameClean": "linguine",
			"original": "1 pound Linguine",
			"originalName": "Linguine",
			"amount": 1,
			"unit": "pound",
			"meta": [],
			"measures": {
				"us": {
					"amount": 1,
					"unitShort": "lb",
					"unitLong": "pound"
				},
				"metric": {
					"amount": 453.592,
					"unitShort": "g",
					"unitLong": "grams"
				}
			}
		},
		{
			"id": 11282,
			"aisle": "Produce",
			"image": "brown-onion.png",
			"consistency": "SOLID",
			"name": "onion",
			"nameClean": "onion",
			"original": "1 small onion",
			"originalName": "onion",
			"amount": 1,
			"unit": "small",
			"meta": [],
			"measures": {
				"us": {
					"amount": 1,
					"unitShort": "small",
					"unitLong": "small"
				},
				"metric": {
					"amount": 1,
					"unitShort": "small",
					"unitLong": "small"
				}
			}
		},
		{
			"id": 1032,
			"aisle": "Cheese",
			"image": "parmesan.jpg",
			"consistency": "SOLID",
			"name": "parmesan cheese",
			"nameClean": "grated parmesan cheese",
			"original": "1/4 cup grated Parmesan cheese for garnish",
			"originalName": "grated Parmesan cheese for garnish",
			"amount": 0.25,
			"unit": "cup",
			"meta": [
				"grated",
				"for garnish"
			],
			"measures": {
				"us": {
					"amount": 0.25,
					"unitShort": "cups",
					"unitLong": "cups"
				},
				"metric": {
					"amount": 25,
					"unitShort": "g",
					"unitLong": "grams"
				}
			}
		},
		{
			"id": 1012047,
			"aisle": "Spices and Seasonings",
			"image": "salt.jpg",
			"consistency": "SOLID",
			"name": "sea salt",
			"nameClean": "coarse sea salt",
			"original": "1/2 teaspoon sea salt (plus more to taste)",
			"originalName": "sea salt (plus more to taste)",
			"amount": 0.5,
			"unit": "teaspoon",
			"meta": [
				"plus more to taste)"
			],
			"measures": {
				"us": {
					"amount": 0.5,
					"unitShort": "tsps",
					"unitLong": "teaspoons"
				},
				"metric": {
					"amount": 0.5,
					"unitShort": "tsps",
					"unitLong": "teaspoons"
				}
			}
		}
	],
	"id": 650126,
	"title": "Linguine E Americana",
	"readyInMinutes": 45,
	"servings": 4,
	"sourceUrl": "http://www.foodista.com/recipe/HK5RM88Z/linguine-e-americana",
	"image": "https://img.spoonacular.com/recipes/650126-556x370.jpg",
	"imageType": "jpg",
	"nutrition": {
		"nutrients": [
			{
				"name": "Calories",
				"amount": 606.15,
				"unit": "kcal",
				"percentOfDailyNeeds": 30.31
			},
			{
				"name": "Fat",
				"amount": 9.41,
				"unit": "g",
				"percentOfDailyNeeds": 14.48
			},
			{
				"name": "Saturated Fat",
				"amount": 3.01,
				"unit": "g",
				"percentOfDailyNeeds": 18.81
			},
			{
				"name": "Carbohydrates",
				"amount": 102.6,
				"unit": "g",
				"percentOfDailyNeeds": 34.2
			},
			{
				"name": "Net Carbohydrates",
				"amount": 97.24,
				"unit": "g",
				"percentOfDailyNeeds": 35.36
			},
			{
				"name": "Sugar",
				"amount": 10.71,
				"unit": "g",
				"percentOfDailyNeeds": 11.9
			},
			{
				"name": "Cholesterol",
				"amount": 18.07,
				"unit": "mg",
				"percentOfDailyNeeds": 6.02
			},
			{
				"name": "Sodium",
				"amount": 924.33,
				"unit": "mg",
				"percentOfDailyNeeds": 40.19
			},
			{
				"name": "Alcohol",
				"amount": 0,
				"unit": "g",
				"percentOfDailyNeeds": 100
			},
			{
				"name": "Alcohol %",
				"amount": 0,
				"unit": "%",
				"percentOfDailyNeeds": 100
			},
			{
				"name": "Protein",
				"amount": 25.79,
				"unit": "g",
				"percentOfDailyNeeds": 51.57
			},
			{
				"name": "Selenium",
				"amount": 82.04,
				"unit": "µg",
				"percentOfDailyNeeds": 117.2
			},
			{
				"name": "Vitamin A",
				"amount": 5274.12,
				"unit": "IU",
				"percentOfDailyNeeds": 105.48
			},
			{
				"name": "Manganese",
				"amount": 1.19,
				"unit": "mg",
				"percentOfDailyNeeds": 59.53
			},
			{
				"name": "Vitamin B3",
				"amount": 7.42,
				"unit": "mg",
				"percentOfDailyNeeds": 37.1
			},
			{
				"name": "Phosphorus",
				"amount": 369.27,
				"unit": "mg",
				"percentOfDailyNeeds": 36.93
			},
			{
				"name": "Copper",
				"amount": 0.55,
				"unit": "mg",
				"percentOfDailyNeeds": 27.38
			},
			{
				"name": "Vitamin B6",
				"amount": 0.48,
				"unit": "mg",
				"percentOfDailyNeeds": 23.82
			},
			{
				"name": "Potassium",
				"amount": 803.97,
				"unit": "mg",
				"percentOfDailyNeeds": 22.97
			},
			{
				"name": "Vitamin B2",
				"amount": 0.39,
				"unit": "mg",
				"percentOfDailyNeeds": 22.95
			},
			{
				"name": "Fiber",
				"amount": 5.36,
				"unit": "g",
				"percentOfDailyNeeds": 21.44
			},
			{
				"name": "Magnesium",
				"amount": 85.24,
				"unit": "mg",
				"percentOfDailyNeeds": 21.31
			},
			{
				"name": "Vitamin B1",
				"amount": 0.27,
				"unit": "mg",
				"percentOfDailyNeeds": 17.83
			},
			{
				"name": "Zinc",
				"amount": 2.53,
				"unit": "mg",
				"percentOfDailyNeeds": 16.88
			},
			{
				"name": "Iron",
				"amount": 2.5,
				"unit": "mg",
				"percentOfDailyNeeds": 13.88
			},
			{
				"name": "Folate",
				"amount": 53.55,
				"unit": "µg",
				"percentOfDailyNeeds": 13.39
			},
			{
				"name": "Calcium",
				"amount": 117.38,
				"unit": "mg",
				"percentOfDailyNeeds": 11.74
			},
			{
				"name": "Vitamin K",
				"amount": 11.53,
				"unit": "µg",
				"percentOfDailyNeeds": 10.98
			},
			{
				"name": "Vitamin B5",
				"amount": 0.73,
				"unit": "mg",
				"percentOfDailyNeeds": 7.33
			},
			{
				"name": "Vitamin C",
				"amount": 5.76,
				"unit": "mg",
				"percentOfDailyNeeds": 6.98
			},
			{
				"name": "Vitamin E",
				"amount": 0.66,
				"unit": "mg",
				"percentOfDailyNeeds": 4.43
			},
			{
				"name": "Vitamin B12",
				"amount": 0.11,
				"unit": "µg",
				"percentOfDailyNeeds": 1.86
			}
		],
		"properties": [
			{
				"name": "Glycemic Index",
				"amount": 61.96,
				"unit": ""
			},
			{
				"name": "Glycemic Load",
				"amount": 35.83,
				"unit": ""
			},
			{
				"name": "Inflammation Score",
				"amount": -10,
				"unit": ""
			},
			{
				"name": "Nutrition Score",
				"amount": 25.177391092414442,
				"unit": "%"
			}
		],
		"flavonoids": [
			{
				"name": "Cyanidin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Petunidin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Delphinidin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Malvidin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Pelargonidin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Peonidin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Catechin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Epigallocatechin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Epicatechin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Epicatechin 3-gallate",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Epigallocatechin 3-gallate",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Theaflavin",
				"amount": 0,
				"unit": ""
			},
			{
				"name": "Thearubigins",
				"amount": 0,
				"unit": ""
			},
			{
				"name": "Eriodictyol",
				"amount": 0,
				"unit": ""
			},
			{
				"name": "Hesperetin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Naringenin",
				"amount": 0,
				"unit": "mg"
			},
			{
				"name": "Apigenin",
				"amount": 0.57,
				"unit": "mg"
			},
			{
				"name": "Luteolin",
				"amount": 0.25,
				"unit": "mg"
			},
			{
				"name": "Isorhamnetin",
				"amount": 0.88,
				"unit": "mg"
			},
			{
				"name": "Kaempferol",
				"amount": 0.23,
				"unit": "mg"
			},
			{
				"name": "Myricetin",
				"amount": 0.04,
				"unit": "mg"
			},
			{
				"name": "Quercetin",
				"amount": 3.72,
				"unit": "mg"
			},
			{
				"name": "Theaflavin-3,3'-digallate",
				"amount": 0,
				"unit": ""
			},
			{
				"name": "Theaflavin-3'-gallate",
				"amount": 0,
				"unit": ""
			},
			{
				"name": "Theaflavin-3-gallate",
				"amount": 0,
				"unit": ""
			},
			{
				"name": "Gallocatechin",
				"amount": 0,
				"unit": "mg"
			}
		],
		"ingredients": [
			{
				"id": 10123,
				"name": "bacon",
				"amount": 0.25,
				"unit": "slice",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 2.63,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.35,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 2.18,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 3.63,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0.03,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 0.28,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 1.11,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 7.92,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0.22,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0.07,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0.02,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Trans Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 73.15
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 0.66,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Protein",
						"amount": 0.69,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 36.41,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0.96,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0.07,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.06,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.73,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 2.04,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 10.89,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 22.93,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 1002030,
				"name": "pepper",
				"amount": 1,
				"unit": "servings",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 0.44,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 0.16,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0.04,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Trans Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 73.15
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 0.02,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0.16,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 0.17,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0.02,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Fluoride",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Protein",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0.03,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0.06,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 0.55,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 1.33,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 0.25,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 10011693,
				"name": "canned tomatoes",
				"amount": 0.38,
				"unit": "ounces",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 1.37,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0.03,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 3.61,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0.06,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 3.4,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0.13,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0.57,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 1.38,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0.56,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.14,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 2.13,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 542.82,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Protein",
						"amount": 0.17,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0.2,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 14.03,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.13,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0.78,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0.47,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 22.86,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0.98,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 31.15,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 3.4,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 11124,
				"name": "carrots",
				"amount": 0.5,
				"unit": "",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 2.68,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.03,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0.07,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 10.06,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0.03,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 10.68,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0.3,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 2.07,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Trans Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 73.15
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 5.8,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 4.03,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.09,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 3.66,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0.31,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.08,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.04,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Fluoride",
						"amount": 0.98,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Protein",
						"amount": 0.28,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0.85,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 21.05,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.2,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 2.92,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.04,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 1.45,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.07,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 5095.33,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 1.8,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 97.6,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 12.51,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 11143,
				"name": "celery",
				"amount": 0.5,
				"unit": "stalks",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 1.22,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.02,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0.03,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 8,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0.08,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 4.8,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0.06,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0.27,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 7.2,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 5.86,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.04,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 2.2,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.05,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Fluoride",
						"amount": 0.8,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Protein",
						"amount": 0.14,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0.32,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 16,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.05,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0.59,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0.27,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 89.8,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0.62,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 52,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 2.8,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 6172,
				"name": "chicken stock",
				"amount": 1.25,
				"unit": "cups",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 27.6,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0.1,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.64,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 3.6,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 9,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 9,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 6.6,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 81,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 4.74,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 10.59,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 15,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0.6,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0.16,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.63,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 12,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Protein",
						"amount": 7.56,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0.25,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 429,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 1.75,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.09,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 10.59,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.18,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 4.74,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.42,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.96,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 9,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0.6,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 315,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 108,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 11215,
				"name": "garlic",
				"amount": 0.5,
				"unit": "cloves",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 0.35,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 2.71,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0.21,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 2.3,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0.47,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 0.05,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0.03,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 0.38,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Protein",
						"amount": 0.1,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0.03,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 0.25,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0.5,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 0.14,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0.47,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 6.01,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 2.23,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 10720420,
				"name": "linguine",
				"amount": 0.25,
				"unit": "pound",
				"nutrients": [
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0.1,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.64,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 1.71,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 23.81,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 71.67,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 214.32,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 1.93,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 81.05,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Trans Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 73.15
					},
					{
						"name": "Folate",
						"amount": 20.41,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Copper",
						"amount": 0.33,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Vitamin K",
						"amount": 0.11,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Iron",
						"amount": 1.47,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 60.1,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Vitamin B5",
						"amount": 0.49,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 1.04,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Protein",
						"amount": 14.79,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 3.63,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0.07,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 6.8,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0.19,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.12,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 84.67,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.16,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 3.03,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 1.6,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.31,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 0,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 252.88,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 420.71,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					}
				]
			},
			{
				"id": 11282,
				"name": "onion",
				"amount": 0.25,
				"unit": "small",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 1.07,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0.02,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 4.03,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0.09,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 5.07,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 1.34,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 3.33,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0.07,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.04,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 1.75,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Fluoride",
						"amount": 0.19,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Protein",
						"amount": 0.19,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0.3,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 0.7,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 1.63,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0.74,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.01,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 0.35,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 1.29,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 25.55,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 7,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 1032,
				"name": "parmesan cheese",
				"amount": 0.06,
				"unit": "cup",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 0.88,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0.08,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 1.75,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 5.44,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0.08,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 55.25,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 2.19,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 39.63,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0.77,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0.03,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 0.38,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0.11,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 2.19,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Protein",
						"amount": 1.85,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0.02,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 109.38,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0.4,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0.03,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0.77,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0.27,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0.97,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 54.06,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 11.5,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 26.31,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			},
			{
				"id": 1012047,
				"name": "sea salt",
				"amount": 0.13,
				"unit": "teaspoon",
				"nutrients": [
					{
						"name": "Choline",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Alcohol",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 100
					},
					{
						"name": "Vitamin B1",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 17.83
					},
					{
						"name": "Poly Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 14.48
					},
					{
						"name": "Cholesterol",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.02
					},
					{
						"name": "Vitamin B12",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 1.86
					},
					{
						"name": "Calcium",
						"amount": 0.18,
						"unit": "mg",
						"percentOfDailyNeeds": 11.74
					},
					{
						"name": "Selenium",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 117.2
					},
					{
						"name": "Phosphorus",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 36.93
					},
					{
						"name": "Vitamin B3",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 37.1
					},
					{
						"name": "Net Carbohydrates",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 35.36
					},
					{
						"name": "Vitamin D",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0.35
					},
					{
						"name": "Folic Acid",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Folate",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 13.39
					},
					{
						"name": "Vitamin K",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 10.98
					},
					{
						"name": "Copper",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 27.38
					},
					{
						"name": "Iron",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 13.88
					},
					{
						"name": "Magnesium",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 21.31
					},
					{
						"name": "Lycopene",
						"amount": 0,
						"unit": "µg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin B5",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 7.33
					},
					{
						"name": "Manganese",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 59.53
					},
					{
						"name": "Fluoride",
						"amount": 0.01,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Protein",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 51.57
					},
					{
						"name": "Fiber",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 21.44
					},
					{
						"name": "Vitamin B2",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 22.95
					},
					{
						"name": "Sodium",
						"amount": 290.68,
						"unit": "mg",
						"percentOfDailyNeeds": 40.19
					},
					{
						"name": "Mono Unsaturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 0
					},
					{
						"name": "Vitamin E",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 4.43
					},
					{
						"name": "Carbohydrates",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 34.2
					},
					{
						"name": "Vitamin B6",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 23.82
					},
					{
						"name": "Sugar",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 11.9
					},
					{
						"name": "Zinc",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 16.88
					},
					{
						"name": "Saturated Fat",
						"amount": 0,
						"unit": "g",
						"percentOfDailyNeeds": 18.81
					},
					{
						"name": "Vitamin A",
						"amount": 0,
						"unit": "IU",
						"percentOfDailyNeeds": 105.48
					},
					{
						"name": "Vitamin C",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 6.98
					},
					{
						"name": "Potassium",
						"amount": 0.06,
						"unit": "mg",
						"percentOfDailyNeeds": 22.97
					},
					{
						"name": "Calories",
						"amount": 0,
						"unit": "kcal",
						"percentOfDailyNeeds": 30.31
					},
					{
						"name": "Caffeine",
						"amount": 0,
						"unit": "mg",
						"percentOfDailyNeeds": 0
					}
				]
			}
		],
		"caloricBreakdown": {
			"percentProtein": 17.24,
			"percentFat": 14.16,
			"percentCarbs": 68.6
		},
		"weightPerServing": {
			"amount": 506,
			"unit": "g"
		}
	},
	"summary": "You can never have too many main course recipes, so give Linguine E Americanan a try. For <b>$1.64 per serving</b>, this recipe <b>covers 25%</b> of your daily requirements of vitamins and minerals. One portion of this dish contains roughly <b>26g of protein</b>, <b>9g of fat</b>, and a total of <b>606 calories</b>. This recipe serves 4. This recipe from Foodista has 1 fans. From preparation to the plate, this recipe takes approximately <b>45 minutes</b>. Head to the store and pick up chicken stock, celery, carrots, and a few other things to make it today. Taking all factors into account, this recipe <b>earns a spoonacular score of 80%</b>, which is solid. If you like this recipe, take a look at these similar recipes: <a href=\"https://spoonacular.com/recipes/americana-smoothies-375826\">Americana Smoothies</a>, <a href=\"https://spoonacular.com/recipes/americana-apple-pie-507157\">Americanan Apple Pie</a>, and <a href=\"https://spoonacular.com/recipes/americana-pot-roast-230322\">Americana Pot Roast</a>.",
	"cuisines": [],
	"dishTypes": [
		"side dish",
		"lunch",
		"main course",
		"main dish",
		"dinner"
	],
	"diets": [],
	"occasions": [],
	"instructions": "<ol><li>Saute the bacon in a large stockpot.</li><li>Cook until lightly browned but not burned.</li><li>Add the onion, stirring well to coat in bacon drippings.</li><li>Saute for 7-8 minutes over medium-high heat, until onion is soft and translucent.</li><li>Add garlic, carrots, and celery, mixing well with onion, and saute for 10 minutes until tender.</li><li>Add can of tomatoes, juice and all.</li><li>Bring to a simmer and then add the chicken stock.</li><li>Add salt and pepper.</li><li>Bring to a boil and add the pasta (be sure to break the linguine into 2-inch-long pieces).</li><li>Cook for about 10-12 minutes, until pasta is \"al dente\", the Italian expression for cooked pasta that is still firm, but not hard.</li><li>Stir the pot frequently as there will not be an abundance of liquid in which to cook the pasta.</li><li>Alternatively, you could cook the pasta in a separate pot of boiling water, drain it, and add to  the carrot/celery/chicken stock sauce.  But the pasta won't absorb all of the yummy flavors that way.)</li><li>Taste the sauce, and add more salt and pepper if necessary.</li><li>About the time the pasta is al dente, you will be left with a lovely sauce in the pot.  (If it is too runny and soupy, continue to cook a bit longer.)</li><li>Serve and garnish with the cheese.</li></ol>",
	"analyzedInstructions": [
		{
			"name": "",
			"steps": [
				{
					"number": 1,
					"step": "Saute the bacon in a large stockpot.Cook until lightly browned but not burned.",
					"ingredients": [
						{
							"id": 10123,
							"name": "bacon",
							"localizedName": "bacon",
							"image": "https://spoonacular.com/cdn/ingredients_100x100/raw-bacon.png"
						}
					],
					"equipment": [
						{
							"id": 404752,
							"name": "pot",
							"localizedName": "pot",
							"image": "https://spoonacular.com/cdn/equipment_100x100/stock-pot.jpg"
						}
					]
				},
				{
					"number": 2,
					"step": "Add the onion, stirring well to coat in bacon drippings.",
					"ingredients": [
						{
							"id": 4609,
							"name": "bacon drippings",
							"localizedName": "bacon drippings",
							"image": "raw-bacon.png"
						},
						{
							"id": 11282,
							"name": "onion",
							"localizedName": "onion",
							"image": "brown-onion.png"
						}
					],
					"equipment": []
				},
				{
					"number": 3,
					"step": "Saute for 7-8 minutes over medium-high heat, until onion is soft and translucent.",
					"ingredients": [
						{
							"id": 11282,
							"name": "onion",
							"localizedName": "onion",
							"image": "brown-onion.png"
						}
					],
					"equipment": [],
					"length": {
						"number": 8,
						"unit": "minutes"
					}
				},
				{
					"number": 4,
					"step": "Add garlic, carrots, and celery, mixing well with onion, and saute for 10 minutes until tender.",
					"ingredients": [
						{
							"id": 11124,
							"name": "carrot",
							"localizedName": "carrot",
							"image": "sliced-carrot.png"
						},
						{
							"id": 11143,
							"name": "celery",
							"localizedName": "celery",
							"image": "celery.jpg"
						},
						{
							"id": 11215,
							"name": "garlic",
							"localizedName": "garlic",
							"image": "garlic.png"
						},
						{
							"id": 11282,
							"name": "onion",
							"localizedName": "onion",
							"image": "brown-onion.png"
						}
					],
					"equipment": [],
					"length": {
						"number": 10,
						"unit": "minutes"
					}
				},
				{
					"number": 5,
					"step": "Add can of tomatoes, juice and all.Bring to a simmer and then add the chicken stock.",
					"ingredients": [
						{
							"id": 6172,
							"name": "chicken stock",
							"localizedName": "chicken stock",
							"image": "chicken-broth.png"
						},
						{
							"id": 11529,
							"name": "tomato",
							"localizedName": "tomato",
							"image": "tomato.png"
						},
						{
							"id": 1019016,
							"name": "juice",
							"localizedName": "juice",
							"image": "apple-juice.jpg"
						}
					],
					"equipment": []
				},
				{
					"number": 6,
					"step": "Add salt and pepper.Bring to a boil and add the pasta (be sure to break the linguine into 2-inch-long pieces).Cook for about 10-12 minutes, until pasta is \"al dente\", the Italian expression for cooked pasta that is still firm, but not hard.Stir the pot frequently as there will not be an abundance of liquid in which to cook the pasta.Alternatively, you could cook the pasta in a separate pot of boiling water, drain it, and add to  the carrot/celery/chicken stock sauce.  But the pasta won't absorb all of the yummy flavors that way.)Taste the sauce, and add more salt and pepper if necessary.About the time the pasta is al dente, you will be left with a lovely sauce in the pot.  (If it is too runny and soupy, continue to cook a bit longer.)",
					"ingredients": [
						{
							"id": 1102047,
							"name": "salt and pepper",
							"localizedName": "salt and pepper",
							"image": "salt-and-pepper.jpg"
						},
						{
							"id": 6172,
							"name": "chicken stock",
							"localizedName": "chicken stock",
							"image": "chicken-broth.png"
						},
						{
							"id": 20421,
							"name": "cooked pasta",
							"localizedName": "cooked pasta",
							"image": "fusilli.jpg"
						},
						{
							"id": 10720420,
							"name": "linguine",
							"localizedName": "linguine",
							"image": "spaghetti.jpg"
						},
						{
							"id": 11124,
							"name": "carrot",
							"localizedName": "carrot",
							"image": "sliced-carrot.png"
						},
						{
							"id": 11143,
							"name": "celery",
							"localizedName": "celery",
							"image": "celery.jpg"
						},
						{
							"id": 20420,
							"name": "pasta",
							"localizedName": "pasta",
							"image": "https://spoonacular.com/cdn/ingredients_100x100/fusilli.jpg"
						},
						{
							"id": 0,
							"name": "sauce",
							"localizedName": "sauce",
							"image": ""
						},
						{
							"id": 14412,
							"name": "water",
							"localizedName": "water",
							"image": "water.png"
						}
					],
					"equipment": [
						{
							"id": 404752,
							"name": "pot",
							"localizedName": "pot",
							"image": "https://spoonacular.com/cdn/equipment_100x100/stock-pot.jpg"
						}
					],
					"length": {
						"number": 12,
						"unit": "minutes"
					}
				},
				{
					"number": 7,
					"step": "Serve and garnish with the cheese.",
					"ingredients": [
						{
							"id": 1041009,
							"name": "cheese",
							"localizedName": "cheese",
							"image": "https://spoonacular.com/cdn/ingredients_100x100/cheddar-cheese.png"
						}
					],
					"equipment": []
				}
			]
		}
	],
	"originalId": null,
	"spoonacularScore": 0.3678186237812042,
	"spoonacularSourceUrl": "https://spoonacular.com/linguine-e-americana-650126"
}
const testRecipes = {
	"results": [
		{
			"id": 642583,
			"title": "Farfalle with Peas, Ham and Cream",
			"image": "https://img.spoonacular.com/recipes/642583-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 715538,
			"title": "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
			"image": "https://img.spoonacular.com/recipes/715538-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 650126,
			"title": "Linguine E Americana",
			"image": "https://img.spoonacular.com/recipes/650126-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 634629,
			"title": "Beef Lo Mein Noodles",
			"image": "https://img.spoonacular.com/recipes/634629-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 655575,
			"title": "Penne Pasta with Broccoli and Cheese",
			"image": "https://img.spoonacular.com/recipes/655575-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 649817,
			"title": "Lemon White Wine Chicken over Linguini",
			"image": "https://img.spoonacular.com/recipes/649817-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 667704,
			"title": "Shrimp, Bacon, Avocado Pasta Salad",
			"image": "https://img.spoonacular.com/recipes/667704-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 662773,
			"title": "Tagliatelle Con Vongole - Pasta With Little Clams",
			"image": "https://img.spoonacular.com/recipes/662773-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 656298,
			"title": "Pistachio Pasta",
			"image": "https://img.spoonacular.com/recipes/656298-312x231.jpg",
			"imageType": "jpg"
		},
		{
			"id": 654797,
			"title": "Pasta A La Lydia (Halloween Inspired)",
			"image": "https://img.spoonacular.com/recipes/654797-312x231.jpg",
			"imageType": "jpg"
		}
	],
	"offset": 0,
	"number": 10,
	"totalResults": 285
}
