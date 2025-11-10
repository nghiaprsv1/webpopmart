// Back button
function goBack() {
    window.history.back();
}

// Menu button
document.querySelector('.menu-btn').addEventListener('click', function() {
    alert('Menu clicked');
});

// Exit button
document.querySelector('.exit-btn').addEventListener('click', function() {
    if (confirm('Bạn có chắc chắn muốn thoát?')) {
        window.close();
    }
});

// Generate QR code (simple placeholder)
function generateQRCode() {
    console.log('QR Code generated');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    generateQRCode();
    console.log('Detail page loaded');
});

