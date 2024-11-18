const { loadFriendProfile } = require('./friendspage.js');

test('should load friend profile with correct data', async () => {
    const mockFriendData = {
        username: 'friend_user',
        bio: 'Hello, I love coding!',
        profileColor: '#ffcc00',
    };
    const friendProfile = await loadFriendProfile('friend_user');

    expect(friendProfile.username).toBe('friend_user');
    expect(friendProfile.bio).toBe('Hello, I love coding!');
    expect(friendProfile.profileColor).toBe('#ffcc00');
});

const { signOut } = require('./friendspage.js');
const auth = { signOut: jest.fn(() => Promise.resolve()) };

test('should sign out the user and redirect to login', async () => {
    await signOut(auth);
    expect(auth.signOut).toHaveBeenCalled();
});
