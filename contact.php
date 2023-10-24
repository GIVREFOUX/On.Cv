<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $project = $_POST["project"];
    $message = $_POST["message"];
    
    $to = "Abdelmoughitezinebi@gmail.com"; // Use your email address here
    $subject = "New Contact Form Submission from $name";
    $headers = "From: $email";
    
    $messageBody = "Name: $name\nEmail: $email\nProject: $project\nMessage:\n$message";
    
    if (mail($to, $subject, $messageBody, $headers)) {
        echo "Message sent successfully!";
    } else {
        echo "Error sending the message. Please try again later.";
    }
}
?>
