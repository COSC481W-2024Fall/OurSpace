const firebase = require('firebase/app');
require('firebase/auth'); // For Firebase Auth
require('firebase/firestore'); // For Firestore
const { JSDOM } = require('jsdom');
const { fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');

// Mock Firebase modules
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(),
    auth: jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(),
    })),
    firestore: jest.fn().mockReturnThis(),
  };
});

describe('Login form functionality', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Set up the DOM using jsdom
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <form id="loginForm">
            <input type="text" id="username" value="testuser@example.com" />
            <input type="password" id="password" value="password123" />
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    window = dom.window;

    // Mock localStorage
    window.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Simulate adding event listeners 
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') callback();
    });
    
    require('../login/firebaseLogin.js');  // Adjust path to your Firebase login script
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call Firebase signInWithEmailAndPassword when form is submitted', async () => {
    // Mock Firebase auth method
    const mockSignIn = firebase.auth().signInWithEmailAndPassword;
    mockSignIn.mockResolvedValueOnce({
      user: { uid: 'mockUserId' },
    });

    // Get the form and simulate submission
    const loginForm = document.getElementById('loginForm');
    fireEvent.submit(loginForm);

    // Check Firebase sign-in method call
    expect(mockSignIn).toHaveBeenCalledWith('testuser@example.com', 'password123');

    // Check localStorage for user id set
    expect(window.localStorage.setItem).toHaveBeenCalledWith('loggedInUserId', 'mockUserId');

    // Ensure window location is redirected
    expect(window.location.href).toBe('homepage.html');
  });

  it('should show an error if Firebase authentication fails', async () => {
    // Mock Firebase auth method to reject the login
    const mockSignIn = firebase.auth().signInWithEmailAndPassword;
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    // Mock window alert to suppress actual alerts during testing
    window.alert = jest.fn();

    // Get the form and simulate submission
    const loginForm = document.getElementById('loginForm');
    fireEvent.submit(loginForm);

    // Check that Firebase sign-in was called
    expect(mockSignIn).toHaveBeenCalledWith('testuser@example.com', 'password123');

    // Check that an error alert is shown
    expect(window.alert).toHaveBeenCalledWith('Error: Invalid credentials');
  });
});
