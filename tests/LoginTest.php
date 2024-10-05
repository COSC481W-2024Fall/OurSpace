<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../src/login/Login.php';  // Adjust the path as needed
require_once __DIR__ . '/../src/login/Database.php';  // Add the new database class

class LoginTest extends TestCase
{
    private $db;

    protected function setUp(): void
    {
        // Mock the Database class, not mysqli
        $this->db = $this->getMockBuilder(Database::class)
                         ->disableOriginalConstructor()
                         ->getMock();
    }

    // Test input sanitization
    public function testSanitizeInput()
    {
        // Arrange
        $login = new Login($this->db);
        $input = " <b>test</b> ";
        
        // Act
        $sanitized = $login->sanitizeInput($input);

        // Assert
        $this->assertEquals("&lt;b&gt;test&lt;/b&gt;", $sanitized);
    }

    // Test successful authentication
    public function testAuthenticateSuccess()
    {
        // Arrange
        $username = 'validUser';
        $password = 'validPass';

        // Simulate a successful query returning a valid result (as an array)
        $this->db->method('query')
                 ->willReturn(true); // Simulate a result that exists
        $this->db->method('query')
                 ->willReturn(true);  // Simulate a successful result found

        // Simulate session
        $_SESSION = [];

        // Act
        $login = new Login($this->db);
        $result = $login->authenticate($username, $password);

        // Assert
        $this->assertTrue($result);
        $this->assertEquals($username, $_SESSION['myuser']);
    }

    // Test failed authentication
    public function testAuthenticateFailure()
    {
        // Arrange
        $username = 'invalidUser';
        $password = 'invalidPass';

        // Simulate a query returning no result
        $this->db->method('query')->willReturn(false);  // Simulate query failure or no result

        // Simulate session
        $_SESSION = [];

        // Act
        $login = new Login($this->db);
        $result = $login->authenticate($username, $password);

        // Assert
        $this->assertFalse($result);
        $this->assertEquals("You are not a valid user", $_SESSION['error']);
    }
}
