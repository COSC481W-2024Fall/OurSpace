class Login
{
    private $con;

    public function __construct($con)
    {
        $this->con = $con;
    }

    public function sanitizeInput($input)
    {
        $trim = trim($input);
        $stripped = stripcslashes($trim);
        return htmlspecialchars($stripped);
    }

    public function authenticate($username, $password)
    {
        $finaluser = $this->sanitizeInput($username);
        $finalpass = $this->sanitizeInput($password);

        $sql = "SELECT * FROM `login` WHERE username='$finaluser' AND password='$finalpass'";
        $result = mysqli_query($this->con, $sql);

        if (mysqli_num_rows($result) >= 1) {
            $_SESSION["myuser"] = $finaluser;
            return true;
        } else {
            $_SESSION["error"] = "You are not valid user";
            return false;
        }
    }
}
