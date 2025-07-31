<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// --- CORS ---
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400");
    exit(0);
}
header("Content-Type: application/json");

// --- JSON INPUT ---
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// --- VALIDATE INPUT ---
if (
    empty($data['email']) || 
    empty($data['packageDetails']) || 
    !filter_var($data['email'], FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid email or package details']);
    exit;
}

// --- EXTRACT DATA ---
$to = $data['email'];
$name = $data['name'] ?? 'Trader';
$package = $data['packageDetails'];
$subtype = $package['subtype'] ?? null;

if (!$subtype || !is_array($subtype)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid subtype in packageDetails']);
    exit;
}

$transactionId = $data['transaction_id'] ?? 'N/A';
$paymentMethod = $data['payment_method'] ?? 'N/A';
$amount = isset($data['amount']) ? number_format($data['amount'] / 100, 2) : 'N/A';
$subject = "Trade Package Purchased - TWM RESEARCH ALERT";

// --- PLAIN TEXT ---
$plainTextMessage = "Dear $name,\n\nYou have successfully subscribed to a trade package:\n" .
"Package: {$package['type_name']} (₹{$package['price']})\n" .
"Subtype: {$subtype['subtype_name']} (₹{$subtype['price']})\n" .
"Min Investment: ₹{$subtype['minimumInvestment']}\n" .
"Risk Category: {$subtype['riskCategory']}\n" .
"Payment Method: {$paymentMethod}\n" .
"Transaction ID: {$transactionId}\n" .
"Amount Paid: ₹{$amount}\n\n" .
"Thanks,\nTWM RESEARCH ALERT";

//html message
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
            background-color: #2C3E50;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .header h2 {
            margin: 0;
            font-size: 24px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            background-color: #fff;
        }
        th, td {
            border: 1px solid #e0e0e0;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: 600;
        }
        .feature-list {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .feature-list li {
            margin-bottom: 10px;
            position: relative;
            padding-left: 20px;
        }
        .feature-list li:before {
            content: '•';
            color: #2C3E50;
            position: absolute;
            left: 0;
        }
        .important-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .danger-notice {
            background-color: #f8d7da;
            border-left: 4px solid #f5c6cb;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
            text-align: center;
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
            <h2>Trade Package Confirmation</h2>
        </div>

        <p>Dear " . htmlspecialchars($name) . ",</p>
        <p>We’re excited to confirm that your trade package has been successfully activated.</p>

        <h3>Package Details</h3>
        <table>
            <tr><th>Package</th><td>" . htmlspecialchars($package['type_name'] ?? 'N/A') . "</td></tr>
            <tr><th>Subtype</th><td>" . htmlspecialchars($subtype['subtype_name'] ?? 'N/A') . "</td></tr>
            <tr><th>Package Price</th><td>₹" . htmlspecialchars($subtype['price'] ?? 'N/A') . "</td></tr>
            <tr><th>Min Investment</th><td>₹" . htmlspecialchars($subtype['minimumInvestment'] ?? 'N/A') . "</td></tr>
            <tr><th>Risk Category</th><td>" . htmlspecialchars($subtype['riskCategory'] ?? 'N/A') . "</td></tr>
            <tr><th>Payment Method</th><td>" . htmlspecialchars($paymentMethod) . "</td></tr>
            <tr><th>Transaction ID</th><td>" . htmlspecialchars($transactionId) . "</td></tr>
            <tr><th>Amount Paid</th><td>₹{$amount}</td></tr>
        </table>";

if (!empty($subtype['details']) && is_array($subtype['details'])) {
    $htmlMessage .= "
        <div class='feature-list'>
            <h3 style='color: #2C3E50;'>Included Features</h3>
            <ul>";
    foreach ($subtype['details'] as $feature) {
        $htmlMessage .= "<li>" . htmlspecialchars($feature) . "</li>";
    }
    $htmlMessage .= "</ul>
        </div>";
}

$htmlMessage .= "
        <div class='important-notice'>
            <h4 style='color:rgb(8, 111, 99); margin-top: 0;'>License Information</h4>
            <p><strong>License Holder's Name:</strong> RISHABH KUMAR SHARMA SEBI</p>
            <p><strong>Registration No.:</strong> INH000018081</p>
            <p><strong>ODR Portal:</strong> <a href='https://smartodr.in/'>https://smartodr.in/</a></p>
        </div>

        <div class='danger-notice'>
            <h4 style='color:rgb(0, 149, 248); margin-top: 0;'>Important Disclosures</h4>
            <ul>
                <li>Investment in securities market is subject to market risks. We do not offer any guaranteed profit service.</li>
                <li>Before taking expert advice or any services with TWM Research Alert, please read the disclaimer, terms and conditions, disclosure, and refund policy.</li>
                <li>Advisory fees should not be paid to personal or individual bank accounts; payments should be made only in favor of TWM Research Alert.</li>
                <li>All charges provided will be non-refundable from the advisory.</li>
                <li>Trading involves substantial risks and could result in the loss of your entire investment.</li>
                <li>TWM Research Alert provides trading ideas based on Technical and Derivative Analysis; results may vary.</li>
            </ul>
        </div>

        <p>For more details, visit our <a href='https://new.twmresearchalert.com/userconsent'>Terms and Conditions</a> or explore our <a href='https://new.twmresearchalert.com/'>website</a>.</p>

        <div class='footer'>
            <p>Thanks & Regards,<br><strong>TWM RESEARCH ALERT</strong></p>
        </div>
    </div>
</body>
</html>";


// --- SEND EMAIL ---
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'harshikapatil56@gmail.com';
    $mail->Password   = 'githlcsbzqqgmmqr'; // Gmail App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ]
    ];

    $mail->setFrom('harshikapatil56@gmail.com', 'TWM RESEARCH ALERT');
    $mail->addAddress($to, $name);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $htmlMessage;
    $mail->AltBody = $plainTextMessage;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Mailer Error: " . $mail->ErrorInfo]);
}
