const { searchUsers } = require('./public/homepage.js');

test('should display usernames matching search term', async () => {
    const mockUsers = ['Alice', 'Alicia', 'Bob'];
    const searchTerm = 'Ali';
    const result = await searchUsers(searchTerm, mockUsers);
    
    expect(result).toContain('Alice');
    expect(result).toContain('Alicia');
    expect(result).not.toContain('Bob');
});

test('should show "No users found" when no match exists', async () => {
    const mockUsers = ['Alice', 'Bob'];
    const searchTerm = 'Xander';
    const result = await searchUsers(searchTerm, mockUsers);

    expect(result).toEqual(['No users found']);
});


import { searchFriends } from './public/homepage.js';

// Mock Firebase
const mockGet = jest.fn();
const mockFirestore = {
    collection: jest.fn(() => ({
        get: mockGet
    })),
};

global.firebase = { firestore: () => mockFirestore };

describe('searchFriends', () => {
    let inputElement;
    let resultsContainer;

    beforeEach(() => {
        // Set up DOM elements
        document.body.innerHTML = `
            <input id="searchInput" value="" />
            <div id="searchResults" style="display: none;"></div>
        `;

        inputElement = document.getElementById('searchInput');
        resultsContainer = document.getElementById('searchResults');
    });

    it('displays matching usernames', async () => {
        inputElement.value = 'test';
        
        // Mock data with a matching username
        mockGet.mockResolvedValue({
            forEach: (callback) => {
                callback({ data: () => ({ username: 'testUser' }), id: '1' });
            },
        });
        
        await searchFriends();

        expect(resultsContainer.style.display).toBe('block');
        expect(resultsContainer.innerHTML).toContain('testUser');
    });

    it('displays "No users found" when no matches are found', async () => {
        inputElement.value = 'nomatch';

        // Mock data with no matching usernames
        mockGet.mockResolvedValue({
            forEach: () => {},
        });

        await searchFriends();

        expect(resultsContainer.style.display).toBe('block');
        expect(resultsContainer.innerHTML).toContain('No users found');
    });
});
