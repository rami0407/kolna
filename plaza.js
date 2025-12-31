// Plaza.js - Learning Plaza JavaScript Module

// ============================================
// INITIALIZATION
// ============================================

let currentUser = null;
let currentRoom = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializePlaza();
    setupTabNavigation();
    setupEventListeners();
    checkAuthState(handleAuthStateChange);
});

function initializePlaza() {
    loadPublicPosts();
    loadActiveSchools();
    loadStats();
}

// ============================================
// AUTHENTICATION HANDLING
// ============================================

function handleAuthStateChange(user) {
    currentUser = user;
    const newPostCard = document.getElementById('newPostCard');
    const loginPrompt = document.getElementById('loginPrompt');
    const publishBtn = document.getElementById('publishPostBtn');

    if (user) {
        // User is logged in
        if (loginPrompt) loginPrompt.classList.add('hidden');
        if (publishBtn) publishBtn.disabled = false;
        loadUserRooms();
    } else {
        // User is not logged in
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (publishBtn) publishBtn.disabled = true;
    }
}

// ============================================
// TAB NAVIGATION
// ============================================

function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.plaza-tab-btn');
    const sections = document.querySelectorAll('.plaza-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === tabId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// PUBLIC POSTS
// ============================================

async function loadPublicPosts() {
    const feedContainer = document.getElementById('postsFeed');

    try {
        const snapshot = await firebaseDB.collection('plaza_posts')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        if (snapshot.empty) {
            feedContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <h3>لا توجد منشورات بعد</h3>
                    <p>كن أول من يشارك شيئاً مع المدارس الأخرى!</p>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const post = doc.data();
            html += createPostCard(doc.id, post);
        });

        feedContainer.innerHTML = html;

        // Add event listeners to post actions
        setupPostEventListeners();

    } catch (error) {
        console.error('Error loading posts:', error);
        feedContainer.innerHTML = `
            <div class="error-state">
                <span class="error-icon">⚠️</span>
                <p>حدث خطأ أثناء تحميل المنشورات</p>
            </div>
        `;
    }
}

function createPostCard(id, post) {
    const timeAgo = getTimeAgo(post.createdAt);
    const commentsCount = post.commentsCount || 0;
    const likesCount = post.likes || 0;

    return `
        <article class="post-card" data-post-id="${id}">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">👤</div>
                    <div class="author-info">
                        <span class="author-name">${escapeHtml(post.authorName || 'مستخدم')}</span>
                        <span class="author-school">${escapeHtml(post.authorSchool || '')}</span>
                    </div>
                </div>
                <span class="post-time">${timeAgo}</span>
            </div>
            <div class="post-content">
                <h3 class="post-title">${escapeHtml(post.title || '')}</h3>
                <p class="post-text">${escapeHtml(post.content || '')}</p>
            </div>
            <div class="post-actions">
                <button class="post-action-btn like-btn" data-post-id="${id}">
                    <span class="action-icon">❤️</span>
                    <span class="action-count">${likesCount}</span>
                </button>
                <button class="post-action-btn comment-btn" data-post-id="${id}">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${commentsCount}</span>
                </button>
                <button class="post-action-btn share-btn">
                    <span class="action-icon">🔗</span>
                    <span class="action-text">مشاركة</span>
                </button>
            </div>
            <div class="post-comments hidden" id="comments-${id}">
                <div class="comments-list"></div>
                <div class="comment-input-area">
                    <input type="text" placeholder="اكتب تعليقاً..." class="comment-input">
                    <button class="btn btn-small">إرسال</button>
                </div>
            </div>
        </article>
    `;
}

function setupPostEventListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => handleLike(btn.dataset.postId));
    });

    // Comment buttons
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleComments(btn.dataset.postId));
    });
}

async function handleLike(postId) {
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }

    try {
        const postRef = firebaseDB.collection('plaza_posts').doc(postId);
        await postRef.update({
            likes: firebase.firestore.FieldValue.increment(1)
        });

        // Update UI
        const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
        const countSpan = likeBtn.querySelector('.action-count');
        countSpan.textContent = parseInt(countSpan.textContent) + 1;

    } catch (error) {
        console.error('Error liking post:', error);
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.classList.toggle('hidden');
        if (!commentsSection.classList.contains('hidden')) {
            loadComments(postId);
        }
    }
}

async function loadComments(postId) {
    const commentsList = document.querySelector(`#comments-${postId} .comments-list`);

    try {
        const snapshot = await firebaseDB.collection('plaza_comments')
            .where('postId', '==', postId)
            .orderBy('createdAt', 'asc')
            .get();

        if (snapshot.empty) {
            commentsList.innerHTML = '<p class="no-comments">لا توجد تعليقات بعد</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const comment = doc.data();
            html += `
                <div class="comment-item">
                    <span class="comment-author">${escapeHtml(comment.authorName)}</span>
                    <p class="comment-text">${escapeHtml(comment.content)}</p>
                    <span class="comment-time">${getTimeAgo(comment.createdAt)}</span>
                </div>
            `;
        });

        commentsList.innerHTML = html;

    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// ============================================
// PUBLISH NEW POST
// ============================================

function setupEventListeners() {
    // Publish post button
    const publishBtn = document.getElementById('publishPostBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', publishPost);
    }

    // Room modal close
    const closeModalBtn = document.getElementById('closeRoomModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeRoomModal);
    }

    // Send room message
    const sendMsgBtn = document.getElementById('sendRoomMessage');
    if (sendMsgBtn) {
        sendMsgBtn.addEventListener('click', sendRoomMessage);
    }

    // Room message input enter key
    const roomMsgInput = document.getElementById('roomMessageInput');
    if (roomMsgInput) {
        roomMsgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendRoomMessage();
        });
    }

    // Resource category buttons
    document.querySelectorAll('.resource-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.resource-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterResources(btn.dataset.category);
        });
    });
}

async function publishPost() {
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }

    const titleInput = document.getElementById('postTitleInput');
    const contentInput = document.getElementById('postContentInput');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert('يرجى ملء العنوان والمحتوى');
        return;
    }

    const publishBtn = document.getElementById('publishPostBtn');
    publishBtn.disabled = true;
    publishBtn.textContent = 'جاري النشر...';

    try {
        await firebaseDB.collection('plaza_posts').add({
            title: title,
            content: content,
            authorName: currentUser.displayName || currentUser.email,
            authorId: currentUser.uid,
            authorSchool: '', // Could be fetched from user profile
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            commentsCount: 0
        });

        // Clear inputs
        titleInput.value = '';
        contentInput.value = '';

        // Reload posts
        loadPublicPosts();

        // Update stats
        loadStats();

    } catch (error) {
        console.error('Error publishing post:', error);
        alert('حدث خطأ أثناء نشر المنشور');
    } finally {
        publishBtn.disabled = false;
        publishBtn.textContent = 'نشر المنشور';
    }
}

// ============================================
// SIDEBAR DATA
// ============================================

async function loadActiveSchools() {
    const container = document.getElementById('activeSchools');

    try {
        const snapshot = await firebaseDB.collection('partner_schools')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<p class="no-data">لا توجد مدارس مسجلة</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const school = doc.data();
            html += `
                <div class="school-item">
                    <span class="school-icon">🏫</span>
                    <span class="school-name">${escapeHtml(school.name)}</span>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading schools:', error);
        container.innerHTML = '<p class="error-text">خطأ في التحميل</p>';
    }
}

async function loadStats() {
    try {
        // Posts count
        const postsSnapshot = await firebaseDB.collection('plaza_posts').get();
        document.getElementById('postsCount').textContent = postsSnapshot.size;

        // Schools count
        const schoolsSnapshot = await firebaseDB.collection('partner_schools').get();
        document.getElementById('schoolsCount').textContent = schoolsSnapshot.size;

        // Discussions count (same as posts for now)
        document.getElementById('discussionsCount').textContent = postsSnapshot.size;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============================================
// LEARNING ROOMS
// ============================================

async function loadUserRooms() {
    const container = document.getElementById('roomsGrid');

    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔐</span>
                <h3>تسجيل الدخول مطلوب</h3>
                <p>يجب <a href="auth.html">تسجيل الدخول</a> لعرض غرف التعلم الخاصة بك</p>
            </div>
        `;
        return;
    }

    try {
        // For now, show sample rooms - in production, filter by user's school
        const snapshot = await firebaseDB.collection('learning_rooms')
            .limit(10)
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🚪</span>
                    <h3>لا توجد غرف بعد</h3>
                    <p>سيتم إنشاء غرف خاصة عندما يتم ربط مدرستك بمدرسة شريكة</p>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const room = doc.data();
            html += createRoomCard(doc.id, room);
        });

        container.innerHTML = html;

        // Add click handlers
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', () => openRoom(card.dataset.roomId));
        });

    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function createRoomCard(id, room) {
    return `
        <div class="room-card" data-room-id="${id}">
            <div class="room-icon">🚪</div>
            <h4 class="room-name">${escapeHtml(room.name || 'غرفة تعلم')}</h4>
            <p class="room-schools">${escapeHtml(room.school1Name || '')} + ${escapeHtml(room.school2Name || '')}</p>
            <span class="room-status">● نشطة</span>
        </div>
    `;
}

function openRoom(roomId) {
    currentRoom = roomId;
    const modal = document.getElementById('roomModal');
    modal.classList.remove('hidden');
    loadRoomMessages(roomId);
}

function closeRoomModal() {
    const modal = document.getElementById('roomModal');
    modal.classList.add('hidden');
    currentRoom = null;
}

async function loadRoomMessages(roomId) {
    const chatContainer = document.getElementById('roomChat');
    chatContainer.innerHTML = '<p class="loading-text">جاري تحميل الرسائل...</p>';

    try {
        const snapshot = await firebaseDB.collection('room_messages')
            .where('roomId', '==', roomId)
            .orderBy('createdAt', 'asc')
            .limit(50)
            .get();

        if (snapshot.empty) {
            chatContainer.innerHTML = '<p class="no-messages">لا توجد رسائل بعد. ابدأ المحادثة!</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const msg = doc.data();
            const isOwn = currentUser && msg.authorId === currentUser.uid;
            html += `
                <div class="chat-message ${isOwn ? 'own-message' : ''}">
                    <span class="message-author">${escapeHtml(msg.authorName)}</span>
                    <p class="message-text">${escapeHtml(msg.content)}</p>
                    <span class="message-time">${getTimeAgo(msg.createdAt)}</span>
                </div>
            `;
        });

        chatContainer.innerHTML = html;
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        console.error('Error loading room messages:', error);
        chatContainer.innerHTML = '<p class="error-text">حدث خطأ</p>';
    }
}

async function sendRoomMessage() {
    if (!currentUser || !currentRoom) return;

    const input = document.getElementById('roomMessageInput');
    const content = input.value.trim();

    if (!content) return;

    try {
        await firebaseDB.collection('room_messages').add({
            roomId: currentRoom,
            content: content,
            authorId: currentUser.uid,
            authorName: currentUser.displayName || currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        input.value = '';
        loadRoomMessages(currentRoom);

    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// ============================================
// RESOURCES
// ============================================

function filterResources(category) {
    const cards = document.querySelectorAll('.resource-card');
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            // Add data-category to cards for proper filtering
            card.style.display = 'block';
        }
    });
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

function getTimeAgo(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return date.toLocaleDateString('ar');
}
