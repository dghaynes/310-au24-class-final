const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search');
const recipesContainer = document.getElementById('recipes');
const groceryListContainer = document.getElementById('grocery-list');
const saveShoppingList = document.getElementById('save-grocery');
const loadShoppingList = document.getElementById('load-grocery');

const apiKey = API_KEY;

/**class Recipe {
    //constructor to initialize recipe object
    constructor(id, title, image, ingredients = [], instructions =''){
        this.id = id // Recipe ID
        this.title = title;
        this.image = image;
        this.ingredients = ingredients;
        this.instructions = instructions;
    }

    //Method to update ingredients and instructions
    upDateDetails(ingredients, instructions){
        this.ingredients = ingredients;
        this.instructions = instructions;
    }

     toJSON() {
        return JSON.stringify(this);
    }

    static fromJSON(jsonString){
        const data = JSON.parse(jsonString);
        return new Recipe(data.d, data.title, data.image, data.ingredients, data.instructions);
    }
} **/


let selectedIngredients = [];
const savedRecipes = {};


saveShoppingList.addEventListener('click', () => {
    saveGroceryList();
});

loadShoppingList.addEventListener('click', () => {
    loadGroceryList();
});

searchButton.addEventListener('click', async (e) => {
    const query = searchInput.value.trim();

    if (!query){
        e.preventDefault();
        alert('Please enter a search term.');

    }else if (query.length < 2){
        e.preventDefault();
       alert('please search for a recipe more that 2 char');

    }else if(/\d/.test(query)){
        // Check if input contains any digits
        e.preventDefault();
        alert("input must not contain numbers");

    }else{

    //array of recipe objects
    const recipes = await fetchRecipes(query);
    displayRecipes(recipes);}
});


function displayRecipes(recipes) {

    recipesContainer.innerHTML = '';

    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<p>No Recipes Found </p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';
        recipeDiv.innerHTML = `
          <img src="${recipe.image}" alt="${recipe.title}" />
          <strong>${recipe.title}</strong>
          <button data-id="${recipe.id}" id="add">Add Ingredients</button>
          <button data-id="${recipe.id}" id="removeAll">Remove Recipe Ingredients</button>
          <button data-id="${recipe.id}" id="removeRecipe">Remove Recipe</button>
        `;


        recipeDiv.querySelector('#add').addEventListener('click', async (e) => {
            const recipeId = e.target.getAttribute('data-id');
            const ingredients = await fetchIngredients(recipeId);
            addIngredientsToGroceryList(ingredients);



        });

        recipeDiv.querySelector('#removeRecipe').addEventListener('click', async (e) => {
            e.target.parentElement.remove();
        });

            recipesContainer.appendChild(recipeDiv);


    });
}

//Returns recipes by query
async function fetchRecipes(query) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${apiKey}`;

    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.results);
        return data.results || [];
    }catch(error){
        throw error;
    }

}



 async function fetchIngredients(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/ingredientWidget.json?apiKey=${apiKey}`;

    try {
        console.log('fetching ingredients');
        const response = await fetch(url);
        const data = await response.json();
        return data.ingredients || [];
    } catch(error) {
        throw(error);
    }
}
/*
function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';
        recipeDiv.innerHTML = `
          <img src="${recipe.image}" alt="${recipe.title}" />
          <strong>${recipe.title}</strong>
          <button data-id="${recipe.id}" id="add">Add Ingredients</button>
          <button data-id="${recipe.id}" id="removeAll">Remove Recipe Ingredients</button>
          <button data-id="${recipe.id}" id="removeRecipe">Remove Recipe</button>
        `;

        console.log(`displayRecipes: ${recipe.id}`);
        recipeDiv.querySelector('#add').addEventListener('click', async (e) => {
            const recipeId = e.target.getAttribute('data-id');
            const ingredients = await fetchIngredients(recipeId);
            addIngredientsToGroceryList(ingredients);
        });
        recipesContainer.appendChild(recipeDiv);

        recipeDiv.querySelector('#removeAll').addEventListener('click', async (e) => {
            const recipeId = e.target.getAttribute('data-id');
            const ingredients = await fetchIngredients(recipeId);
            removeRecipeFromGroceryList(ingredients);
        })

        recipeDiv.querySelector('#save').addEventListener('click', async (e) => {
            const recipeId = e.target.getAttribute('data-id');
            const recipe = await fetchRecipeById(recipeId);   //returns recipe object
            saveRecipeToLocalStorage(recipe);

        })

        recipeDiv.querySelector('#removeRecipe').addEventListener('click', async (e) => {
                e.target.parentElement.remove();
            }
        )

    });
}
*/

//given a recipeID return recipe object
async function fetchRecipeById(recipeId){

    console.log(`recipeId is: ${recipeId}`);
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;

    try {
        const response = await fetch(url);

        if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        //Create and return a Recipe instance
        const recipe = new Recipe(
            data.id,
            data.title,
            data.image,
            data.extendedIngredients.map(ingredient => ingredient.original),
            data.instructions
        );

        console.log(recipe);
        console.log(recipe.id);

        return recipe;

    } catch (error){
        console.error(error.message);
        throw error;
    }

}


function addIngredientsToGroceryList(ingredients) {
    console.log("add");
    ingredients.forEach(ingredient => {
        if (!selectedIngredients.some(item => item.name === ingredient.name)) {
            selectedIngredients.push(ingredient);
            const listItem = document.createElement('li');
            listItem.id = ingredient.name;
            listItem.textContent = `${ingredient.amount.metric.value} ${ingredient.amount.metric.unit} - ${ingredient.name}`;
            groceryListContainer.appendChild(listItem);
        }
    });
}

function saveGroceryList(){

    localStorage.setItem('grocery-list', JSON.stringify(selectedIngredients))
    removeRecipeFromGroceryList(selectedIngredients);

}

function loadGroceryList(){
    const storedList = localStorage.getItem('grocery-list');
    const groceryList = JSON.parse(storedList);

    addIngredientsToGroceryList(groceryList);
    localStorage.clear();

}

function removeRecipeFromGroceryList(ingredients){

    ingredients.forEach(ingredient => {
        if(selectedIngredients.some(item => item.name === ingredient.name )){
            console.log(`item is in list ${ingredient.name}`);

            selectedIngredients = selectedIngredients.filter(item => item.name !== ingredient.name);

            const li = document.getElementById(ingredient.name);
            if(li){
                li.remove();
            }

        }else{
           return undefined;
        }
    });
}
