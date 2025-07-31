<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// CORS for local development
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400");
    exit(0);
}

header("Content-Type: application/json");

// Parse JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validate input
if (empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$to = $data['email'];
$subject = "Your KYC Documents Are Verified - TWM RESEARCH ALERT";

// Text version
$plainTextMessage = "Dear User,\n\nWe are pleased to inform you that your KYC documents have been successfully verified.\nYou can now access all features on your account.\n\nThanks,\nTWM Research Alert";

// HTML version
$htmlMessage = "
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background-color:rgb(37, 145, 18);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .header h2 {
            margin: 0;
            font-size: 26px;
        }
        .content {
            padding: 20px 10px;
        }
        .content p {
            margin-bottom: 15px;
        }
        .highlight {
            background-color: #e6f4ea;
            padding: 15px;
            border-left: 5px solid rgb(158, 11, 165);
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        a {
            color: #3498DB;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>KYC Verification Successful</h2>
        </div>

        <div class='content'>
            <p>Dear User,</p>

            <div class='highlight'>
                <p><strong>Your KYC documents have been successfully verified.</strong></p>
            </div>

            <p>You now have full access to the services provided by <strong>TWM RESEARCH ALERT</strong>.</p>

            <p>If you have any questions or need assistance, feel free to reply to this email or reach out via our support portal.</p>

            <p style='margin-top: 40px;'>Thanks & Regards,<br><strong>TWM RESEARCH ALERT Team</strong></p>
        </div>

        <div class='footer'>
            <p>© " . date('Y') . " TWM Research Alert. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";


// Send email
$mail = new PHPMailer(true);
try {
    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'harshikapatil56@gmail.com';    // Your Gmail
    $mail->Password   = 'githlcsbzqqgmmqr';             // App password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    // Fix SSL verification ( for localhost only)
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ]
    ];

    // Email details
    $mail->setFrom('harshikapatil56@gmail.com', 'TWM RESEARCH ALERT');
    $mail->addAddress($to);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $htmlMessage;
    $mail->AltBody = $plainTextMessage;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'KYC verification email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Mailer Error: " . $mail->ErrorInfo]);
}
?>