
describe('Spoonacular API test', () => {
    const mockApiKey = API_KEY;
    const mockRecipeId = 12345;
    const mockResponse = {
        id: 12345,
        title: 'Spaghetti ',
        ingredients: [
            { name: 'Spaghetti', quantity: '200g' },
            { name: 'Eggs', quantity: '3' },
        ],
        instructions: 'Cook spaghetti and mix with ingredients.',
    };

    beforeEach(() => {
// Spy on `fetch` and provide a mock implementation
        spyOn(window, 'fetch').and.callFake((url) => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });
        });
    });

    it('should fetch recipe information successfully', async () => {
        const recipe = await fetchRecipeById(mockRecipeId);

// Verify that fetch was called with the correct URL
        expect(window.fetch).toHaveBeenCalledWith(
            `https://api.spoonacular.com/recipes/${mockRecipeId}/information?apiKey=${mockApiKey}`
        );

// Check the returned recipe matches the mock response
        expect(recipe).toEqual(mockResponse);
    });

    it('should throw an error for a failed API call', async () => {
// Mock a failure response
        window.fetch.and.callFake(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
            });
        });

        try {
            await fetchRecipebyId(mockRecipeId);
            fail('Expected fetchRecipe to throw an error');
        } catch (error) {
            expect(error.message).toContain('HTTP error! status: 404');
        }
    });
});

