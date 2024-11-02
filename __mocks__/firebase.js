const firestore = {
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            collection: jest.fn(() => ({
                add: jest.fn(),
                get: jest.fn(() => Promise.resolve({
                    size: 1,
                    docs: [{ data: () => ({ content: 'Mock post content' }) }]
                }))
            })),
            set: jest.fn(),
            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ username: "MockUser" }) }))
        }))
    })),
};

const auth = {
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { email: "testuser@example.com", uid: "testUserId" } })),
};

const firebase = {
    firestore: () => firestore,
    auth: () => auth,
    initializeApp: jest.fn(),
};

module.exports = firebase;
