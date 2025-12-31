// Firebase Configuration
// استبدل هذه القيم بمفاتيح مشروعك من Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyB9KTo2FQOwRroh10Xhh3PBbJTDmpTXubg",
    authDomain: "heemmshotfem.firebaseapp.com",
    projectId: "heemmshotfem",
    storageBucket: "heemmshotfem.firebasestorage.app",
    messagingSenderId: "321084476622",
    appId: "1:321084476622:web:82fea124c51ef4f72dd49f",
    measurementId: "G-MTD01XET6J"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// تهيئة الخدمات
const auth = firebase.auth();
const db = firebase.firestore();

// تكوين اللغة العربية للرسائل
auth.languageCode = 'ar';

// دالة مساعدة للتحقق من حالة تسجيل الدخول
function checkAuthState(callback) {
    auth.onAuthStateChanged((user) => {
        if (callback) {
            callback(user);
        }
    });
}

// دالة مساعدة لتسجيل الخروج
function signOut() {
    return auth.signOut();
}

// دالة مساعدة للحصول على المستخدم الحالي
function getCurrentUser() {
    return auth.currentUser;
}

// تصدير المتغيرات للاستخدام في ملفات أخرى
window.firebaseAuth = auth;
window.firebaseDB = db;
window.checkAuthState = checkAuthState;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
