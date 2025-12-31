// Admin Dashboard Logic

// Check if user is authenticated
checkAuthState((user) => {
    if (!user) {
        // User is not logged in, redirect to auth page
        alert('يجب تسجيل الدخول للوصول إلى لوحة التحكم');
        window.location.href = 'auth.html';
        return;
    }

    // Check if user is authorized admin
    const allowedAdminEmail = 'rami0407@gmail.com';

    if (user.email !== allowedAdminEmail) {
        alert('عذراً، انت لا تملك صلاحيات الدخول الى هذه الصفحة.');
        window.location.href = 'index.html';
        return;
    }

    // Update user info in navbar
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `مرحباً, ${user.displayName || user.email}`;
    }

    // Load messages
    loadMessages();
    loadTeachers();
    loadSchools();

    // Tab Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });
});

// Logout button handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('אירעה שגיאה בהתנתקות');
        }
    });
}

// Load messages from Firestore
async function loadMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    try {
        const messagesSnapshot = await firebaseDB
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .get();

        if (messagesSnapshot.empty) {
            messagesContainer.innerHTML = '<div class="loading-message">لا توجد رسائل حتى الآن</div>';
            return;
        }

        let tableHTML = `
            <table class="messages-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الرسالة</th>
                    </tr>
                </thead>
                <tbody>
        `;

        messagesSnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
            const formattedDate = timestamp.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            tableHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${escapeHtml(data.name)}</td>
                    <td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
                    <td class="message-text" title="${escapeHtml(data.message)}">${escapeHtml(data.message)}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        messagesContainer.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<div class="loading-message">حدث خطأ أثناء تحميل الرسائل</div>';
    }
}

// Load Teachers
async function loadTeachers() {
    const container = document.getElementById('teachersContainer');
    if (!container) return;

    try {
        const snapshot = await firebaseDB.collection('teachers').get();

        if (snapshot.empty) {
            container.innerHTML = '<div class="loading-message">لا يوجد معلمين مسجلين حتى الآن</div>';
            return;
        }

        let tableHTML = `
            <table class="messages-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>التخصص</th>
                        <th>سنوات الخبرة</th>
                        <th>معلومات الاتصال</th>
                    </tr>
                </thead>
                <tbody>
        `;

        snapshot.forEach((doc) => {
            const data = doc.data();
            tableHTML += `
                <tr>
                    <td>${escapeHtml(data.name || '-')}</td>
                    <td>${escapeHtml(data.subject || '-')}</td>
                    <td>${escapeHtml(data.experience || '0')}</td>
                    <td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading teachers:', error);
        container.innerHTML = '<div class="loading-message">لا يوجد معلمين مسجلين حتى الآن (أو حدث خطأ)</div>';
    }
}

// Load Schools
async function loadSchools() {
    const container = document.getElementById('schoolsContainer');
    if (!container) return;

    try {
        const snapshot = await firebaseDB.collection('schools').get();

        if (snapshot.empty) {
            container.innerHTML = '<div class="loading-message">لا توجد مدارس تبحث عن موظفين حالياً</div>';
            return;
        }

        let tableHTML = `
            <table class="messages-table">
                <thead>
                    <tr>
                        <th>اسم المدرسة</th>
                        <th>الموقع</th>
                        <th>الوظيفة المطلوبة</th>
                        <th>للتواصل</th>
                    </tr>
                </thead>
                <tbody>
        `;

        snapshot.forEach((doc) => {
            const data = doc.data();
            tableHTML += `
                <tr>
                    <td>${escapeHtml(data.schoolName || '-')}</td>
                    <td>${escapeHtml(data.location || '-')}</td>
                    <td>${escapeHtml(data.position || '-')}</td>
                    <td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading schools:', error);
        container.innerHTML = '<div class="loading-message">لا توجد مدارس مسجلة حتى الآن (أو حدث خطأ)</div>';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}
