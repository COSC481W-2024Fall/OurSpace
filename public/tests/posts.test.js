const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const fetch = require('node-fetch');
const fs = require('fs');

let testEnv;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "ourspace-9703c",
        firestore: {
            host: "127.0.0.1",
            port: 8080, 
            rules: fs.readFileSync("firestore-test.rules", "utf8")
        }
    });
});

afterEach(async () => {
    if (testEnv) {
        await testEnv.clearFirestore();
    }
});

afterAll(async () => {
    if (testEnv) {
        await testEnv.cleanup();
    }
});

describe('Firebase Initialization', () => {
    let db;

    beforeEach(async () => {
        const testUserContext = testEnv.authenticatedContext("testUserId", { email: "testuser@example.com" });
        db = testUserContext.firestore();
    });

    afterEach(async () => {
        await testEnv.clearFirestore();
    });

    it('should initialize Firebase with the correct configuration', () => {
        expect(db).toBeDefined();
    });
});

