use PHPUnit\Framework\TestCase;

class LoginTest extends TestCase
{
    private $con;

    protected function setUp(): void
    {
        // Mock the mysqli connection
        $this->con = $this->createMock(mysqli::class);
    }

    public function testSanitizeInput()
    {
        $login = new Login($this->con);
        $input = " <b>test</b> ";
        $sanitized = $login->sanitizeInput($input);

        $this->assertEquals("&lt;b&gt;test&lt;/b&gt;", $sanitized);
    }

    public function testAuthenticateSuccess()
    {
        $username = 'validUser';
        $password = 'validPass';

        // Create a mock result set with one row
        $resultMock = $this->createMock(mysqli_result::class);
        $resultMock->expects($this->once())
                   ->method('num_rows')
                   ->willReturn(1);

        // Mock mysqli_query to return the mock result
        $this->con->expects($this->once())
                  ->method('query')
                  ->willReturn($resultMock);

        // Simulate session
        $_SESSION = [];

        $login = new Login($this->con);
        $this->assertTrue($login->authenticate($username, $password));
        $this->assertEquals($username, $_SESSION['myuser']);
    }

    public function testAuthenticateFailure()
    {
        $username = 'invalidUser';
        $password = 'invalidPass';

        // Create a mock result set with no rows
        $resultMock = $this->createMock(mysqli_result::class);
        $resultMock->expects($this->once())
                   ->method('num_rows')
                   ->willReturn(0);

        // Mock mysqli_query to return the mock result
        $this->con->expects($this->once())
                  ->method('query')
                  ->willReturn($resultMock);

        // Simulate session
        $_SESSION = [];

        $login = new Login($this->con);
        $this->assertFalse($login->authenticate($username, $password));
        $this->assertEquals("You are not valid user", $_SESSION['error']);
    }
}
