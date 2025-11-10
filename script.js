// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const tab = this.dataset.tab;
        console.log('Switched to tab:', tab);
        // Add filtering logic here based on tab
    });
});

// Navigate to detail page
function goToDetail() {
    window.location.href = 'detail.html';
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

// Sample data
const queueData = [
    {
        id: 1,
        title: '[POP MART] ĐĂNG KÍ MUA HÀNG TẠI POP OR TREAT POP-UP EVENT NGÀY 21.10.2025',
        queueNumber: 28,
        date: 'Thứ 3 , 21/10/2025',
        time: '08:00 - 13:00',
        store: 'POP OR TREAT POP-UP EVENT',
        location: 'Sảnh Chính, Tầng 1, Lotte Mall West Lake, Hà Nội.',
        checkinTime: '08:00 21/10/2025 - 13:00 21/10/2025',
        status: 'uncheckin'
    }
];

console.log('Queue data loaded:', queueData);

