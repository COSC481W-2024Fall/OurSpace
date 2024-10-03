<?php

class Login
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function sanitizeInput($input)
    {
        $trim = trim($input);
        $stripped = stripslashes($trim);
        return htmlspecialchars($stripped);
    }

    public function authenticate($username, $password)
    {
        $finaluser = $this->sanitizeInput($username);
        $finalpass = $this->sanitizeInput($password);

        $sql = "SELECT * FROM `login` WHERE username='$finaluser' AND password='$finalpass'";
        $result = $this->db->query($sql);

        if ($result && mysqli_num_rows($result) > 0) {
            $_SESSION["myuser"] = $finaluser;
            return true;
        } else {
            $_SESSION["error"] = "You are not a valid user";
            return false;
        }
    }
}
