<?php

session_start();

$con = mysqli_connect("localhost", "root", "", "our_space");

$usertrim = trim($_POST["username"]);
$userstrip = stripcslashes($usertrim);
$finaluser = htmlspecialchars($userstrip);

$passtrim = trim($_POST["password"]);
$passstrip = stripcslashes($passtrim);
$finalpass = htmlspecialchars($passstrip);


$sql = "SELECT * FROM `login` WHERE username='$finaluser' AND password='$finalpass'";
$result = mysqli_query($con,$sql);

if (mysqli_num_rows($result) >= 1) {
    $_SESSION["myuser"] = $finaluser;
    header("Location:homepage.html");
} else {
    $_SESSION["error"] = "You are not valid user";
    header("Location:error.html");
}

?>