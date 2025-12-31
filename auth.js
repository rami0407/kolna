// Authentication Logic

// عناصر DOM
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const loginFormContainer = document.getElementById('loginForm');
const signupFormContainer = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const authMessage = document.getElementById('authMessage');

// التبديل بين نماذج تسجيل الدخول والتسجيل
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('hidden');
    signupFormContainer.classList.remove('hidden');
    hideMessage();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
    hideMessage();
});

// دوال مساعدة لعرض الرسائل
function showMessage(message, type = 'success') {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.classList.remove('hidden');

    // إخفاء الرسالة بعد 5 ثواني
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    authMessage.classList.add('hidden');
}

function showLoader(button) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    button.disabled = true;
}

function hideLoader(button) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    button.disabled = false;
}

// معالجة تسجيل الدخول
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginFormElement.querySelector('button[type="submit"]');

    showLoader(submitBtn);
    hideMessage();

    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        showMessage('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');

        // إعادة التوجيه بعد ثانيتين
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        hideLoader(submitBtn);
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/user-disabled':
                errorMessage = 'تم تعطيل هذا الحساب';
                break;
            case 'auth/user-not-found':
                errorMessage = 'لا يوجد حساب بهذا البريد الإلكتروني';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً';
                break;
            case 'auth/configuration-not-found':
                errorMessage = 'خدمة المصادقة غير مفعلة في المشروع. يرجى تفعيل Email/Password في Firebase Console.';
                break;
            default:
                errorMessage = error.message;
        }

        showMessage(errorMessage, 'error');
    }
});

// معالجة التسجيل
signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const submitBtn = signupFormElement.querySelector('button[type="submit"]');

    // التحقق من تطابق كلمات المرور
    if (password !== passwordConfirm) {
        showMessage('كلمات المرور غير متطابقة', 'error');
        return;
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
        showMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
        return;
    }

    showLoader(submitBtn);
    hideMessage();

    try {
        // إنشاء المستخدم
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);

        // تحديث الملف الشخصي بالاسم
        await userCredential.user.updateProfile({
            displayName: name
        });

        // حفظ بيانات المستخدم في Firestore
        await firebaseDB.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'user'
        });

        showMessage('تم إنشاء الحساب بنجاح! جاري التحويل...', 'success');

        // إعادة التوجيه بعد ثانيتين
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        hideLoader(submitBtn);
        let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'التسجيل غير مفعل حالياً';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة المرور ضعيفة جداً';
                break;
            default:
                errorMessage = error.message;
        }

        showMessage(errorMessage, 'error');
    }
});

// التحقق من حالة المستخدم عند تحميل الصفحة
checkAuthState((user) => {
    if (user) {
        // المستخدم مسجل دخول بالفعل، إعادة التوجيه
        window.location.href = 'index.html';
    }
});
