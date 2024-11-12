console.log("Hello world");
const content =  document.querySelector(".content");
const contentList =  document.querySelector(".content-list");
const addButton = document.querySelector("#addButton");
const itemNameInput = document.querySelector("#itemNameInput");

function addNewListItem(value) {
	contentList.innerHTML += `<li class="list">${value}</li>`
}

addButton.addEventListener("click", () => {
	if (itemNameInput.value === "") {
		return
	}
	addNewListItem(itemNameInput.value);

	itemNameInput.value = ""
})
