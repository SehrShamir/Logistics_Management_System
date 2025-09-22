<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "logistics_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user_id = $_POST["user_id"];
    $amount = $_POST["amount"];
    $sql = "INSERT INTO payments (user_id, amount, status) VALUES ('$user_id', '$amount', 'Pending')";
    if ($conn->query($sql) === TRUE) {
        echo "Payment Initiated";
    } else {
        echo "Error: " . $sql . " " . $conn->error;
    }
}

$conn->close();
?>
