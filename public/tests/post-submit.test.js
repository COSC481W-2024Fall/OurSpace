const { initializeTestEnvironment, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');

// Set Firestore emulator host to prevent connection to the live Firestore
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

let testEnv;
let db;

beforeAll(async () => {
    // Initialize Firestore emulator environment
    testEnv = await initializeTestEnvironment({
        projectId: "ourspace-9703c",
        firestore: {
            host: "127.0.0.1",
            port: 8080,
            rules: fs.readFileSync("firestore-test.rules", "utf8"),
            ssl: false
        }
    });

    // Initialize Firestore db instance for tests
    const testUserContext = testEnv.authenticatedContext("testUserId", { email: "testuser@example.com" });
    db = testUserContext.firestore();
});

afterAll(async () => {
    // Cleanup environment after tests
    if (testEnv) {
        await testEnv.cleanup();
    }
});

it('should connect to Firestore emulator', async () => {
    const userRef = db.collection('users').doc('test@example.com');
    await expect(assertSucceeds(userRef.get())).resolves.not.toThrow();
});

describe('Firestore User Posts Tests', () => {
    afterEach(async () => {
        // Clear Firestore data between tests
        if (testEnv) {
            await testEnv.clearFirestore();
        }
    });

    it('should add a post to the user\'s posts sub-collection', async () => {
        
        // Reference to the user's posts sub-collection
        const userRef = db.collection('users').doc('testuser@example.com');
        const postData = {
            content: "Hello, world!",
            createdAt: new Date(),
        };
    
        // Add a new post to the user's posts sub-collection
        await assertSucceeds(userRef.collection('posts').add(postData));
    
        // Fetch posts to confirm it was added
        const postSnapshot = await assertSucceeds(userRef.collection('posts').get());
        expect(postSnapshot.size).toBe(1);  // Expect one post to be present
    
        // Convert Firestore timestamp to Date for comparison
        const savedPostData = postSnapshot.docs[0].data();
        savedPostData.createdAt = savedPostData.createdAt.toDate();
    
        expect(savedPostData).toMatchObject(postData);  // Confirm post data matches
    });
});    