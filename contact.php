<?php
// Enable error reporting for development
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Configuration
const ADMIN_EMAIL = "Abdelmoughitezinebi@gmail.com";
const MAX_MESSAGE_LENGTH = 3000;

class ContactFormHandler {
    private $errors = [];
    private $data = [];
    
    public function __construct() {
        if ($_SERVER["REQUEST_METHOD"] === "POST") {
            $this->handleRequest();
        }
    }
    
    private function handleRequest() {
        // Sanitize and validate inputs
        $this->data = [
            'name' => $this->sanitizeInput($_POST["name"] ?? ''),
            'email' => filter_var($_POST["email"] ?? '', FILTER_SANITIZE_EMAIL),
            'project' => $this->sanitizeInput($_POST["project"] ?? ''),
            'message' => $this->sanitizeInput($_POST["message"] ?? '')
        ];
        
        if ($this->validateInputs()) {
            $this->sendEmail();
        }
        
        $this->sendResponse();
    }
    
    private function sanitizeInput($input) {
        return htmlspecialchars(strip_tags(trim($input)));
    }
    
    private function validateInputs() {
        // Validate name
        if (empty($this->data['name'])) {
            $this->errors[] = "Name is required";
        }
        
        // Validate email
        if (!filter_var($this->data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = "Valid email is required";
        }
        
        // Validate project
        if (empty($this->data['project'])) {
            $this->errors[] = "Project description is required";
        }
        
        // Validate message
        if (empty($this->data['message'])) {
            $this->errors[] = "Message is required";
        } elseif (strlen($this->data['message']) > MAX_MESSAGE_LENGTH) {
            $this->errors[] = "Message is too long";
        }
        
        return empty($this->errors);
    }
    
    private function sendEmail() {
        $to = ADMIN_EMAIL;
        $subject = "New Contact Form Submission from {$this->data['name']}";
        
        // Create email headers
        $headers = [
            'From' => $this->data['email'],
            'Reply-To' => $this->data['email'],
            'X-Mailer' => 'PHP/' . phpversion(),
            'Content-Type' => 'text/plain; charset=utf-8'
        ];
        
        $messageBody = "Name: {$this->data['name']}\n"
                    . "Email: {$this->data['email']}\n"
                    . "Project: {$this->data['project']}\n"
                    . "Message:\n{$this->data['message']}";
        
        if (!mail($to, $subject, $messageBody, $this->formatHeaders($headers))) {
            $this->errors[] = "Error sending the message. Please try again later.";
        }
    }
    
    private function formatHeaders($headers) {
        return implode("\r\n", array_map(
            fn($k, $v) => "$k: $v",
            array_keys($headers),
            $headers
        ));
    }
    
    private function sendResponse() {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => empty($this->errors),
            'message' => empty($this->errors) ? 'Message sent successfully!' : 'Error occurred',
            'errors' => $this->errors
        ]);
        exit;
    }
}

// Initialize the handler
new ContactFormHandler();
