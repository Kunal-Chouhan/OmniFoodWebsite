// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  
  // --- SIGNUP FORM LOGIC ---
  const ctaForm = document.querySelector('#signup-form');

  if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
      // 1. Prevent the form's default browser submission
      e.preventDefault();

      const button = ctaForm.querySelector('.btn--form');
      button.textContent = 'Sending...';
      button.disabled = true;

      // 2. Get the data from the form
      const formData = new FormData(ctaForm);
      const fullName = formData.get('full-name');
      const email = formData.get('email');
      const heardFrom = formData.get('select-where');

      // 3. Send the data to your backend API
      try {
        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: fullName,
            email: email,
            heardFrom: heardFrom
          }),
        });

        const data = await response.json();

        // 4. Handle the response from the server
        if (response.ok) { // Status 201
          alert('Success! Thank you for signing up.');
          ctaForm.reset();
        } else {
          // Show the specific error message from the server
          alert(`Error: ${data.message}`);
        }

      } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        // Re-enable the button
        button.textContent = 'Sign-up-now';
        button.disabled = false;
      }
    });
  }

  // --- NEW RECIPE SEARCH FEATURE ---
  const recipeForm = document.querySelector('#recipe-search-form');
  const resultsContainer = document.querySelector('#recipe-results');

  if (recipeForm) {
    recipeForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Stop the form from reloading the page
      resultsContainer.innerHTML = '<p>Searching for recipes...</p>';

      const formData = new FormData(recipeForm);
      const params = new URLSearchParams();
      
      const title = formData.get('title');
      const tag = formData.get('tag');
      const ingredient = formData.get('ingredient');
      const maxCalories = formData.get('maxCalories');

      if (title) params.append('title', title);
      if (tag) params.append('tag', tag);
      if (ingredient) params.append('ingredient', ingredient);
      if (maxCalories) params.append('maxCalories', maxCalories);
      
      const queryString = params.toString();
      const fullURL = `http://localhost:3000/api/recipes?${queryString}`;

      console.log('Fetching from:', fullURL);

      try {
        const response = await fetch(fullURL);

        // --- THIS IS THE FIX ---
        // First, check if the server responded OK (e.g., status 200)
        if (!response.ok) {
          // If not, get the error message and throw an error to stop
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server responded with an error');
        }

        // If we get here, the response was OK, so we can expect an array
        const recipes = await response.json();
        // -------------------------

        // Clear "Searching..." message
        resultsContainer.innerHTML = '';

        if (recipes.length === 0) {
          resultsContainer.innerHTML = '<p>No recipes found matching your criteria.</p>';
          return;
        }

        // Now this is safe, because we know 'recipes' is an array
        recipes.forEach(recipe => {
          const recipeCard = document.createElement('div');
          recipeCard.className = 'meal'; // We re-use your '.meal' class for styling!
          
          recipeCard.innerHTML = `
            <div class="meal-content">
              <p class="meal-title">${recipe.title}</p>
              <ul class="meal-attributes">
                <li class="meal-attribute">
                  <ion-icon class="meal-icon" name="flame-outline"></ion-icon>
                  <span><strong>${recipe.calories || 'N/A'}</strong> calories</span>
                </li>
              </ul>
              <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
              <p style="margin-top: 1.2rem;"><strong>Instructions:</strong> ${recipe.instructions}</p>
            </div>
          `;
          resultsContainer.appendChild(recipeCard);
        });

      } catch (error) {
        console.error('Recipe search error:', error);
        // Show the real error message to the user in the results box
        resultsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      }
    });
  }
  
});