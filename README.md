# קולנו יחד - Kolana Yahad Website

אתר מודרני ויפהפה עבור ארגון "קולנו יחד" - ארגון המקדם שיתוף פעולה וקהילתיות בחברה הישראלית.

## תכונות האתר

- 🎨 עיצוב מודרני ומרשים עם גרדיאנטים ואנימציות
- 📱 תמיכה מלאה במובייל (Responsive Design)
- 🌐 תמיכה מלאה בעברית עם RTL
- ⚡ ביצועים מהירים וחוויית משתמש חלקה
- 🎯 SEO מותאם
- ✨ אנימציות חלקות ואפקטים אינטראקטיביים
- 🔐 **מערכת הרשמה והתחברות עם Firebase**
- 💾 **שמירת הודעות ב-Firestore Database**
- 📊 **לוח בקרה לניהול הודעות**

## מבנה הקבצים

```
.
├── index.html           # דף ראשי
├── auth.html            # דף התחברות והרשמה
├── admin.html           # לוח בקרה
├── style.css            # עיצוב ועיצוב מערכת
├── script.js            # פונקציונליות אינטראקטיבית
├── auth.js              # לוגיקת התחברות
├── admin.js             # לוגיקת לוח בקרה
├── firebase-config.js   # הגדרות Firebase
├── FIREBASE_SETUP.md    # מדריך הגדרת Firebase
└── README.md            # קובץ זה
```

## 🔥 הגדרת Firebase

**חשוב!** לפני שתוכל להשתמש בתכונות ההרשמה ושמירת ההודעות, עליך להגדיר Firebase:

1. קרא את המדריך המפורט ב-[FIREBASE_SETUP.md](FIREBASE_SETUP.md)
2. צור פרויקט Firebase חדש
3. העתק את מפתחות ההגדרה ל-`firebase-config.js`
4. הפעל Authentication ו-Firestore Database

**בלי הגדרת Firebase, תכונות ההרשמה ושמירת ההודעות לא יעבדו!**


## איך להריץ את האתר מקומית

פשוט פתח את הקובץ `index.html` בדפדפן שלך.

## איך להעלות ל-GitHub Pages

### שלב 1: צור repository חדש ב-GitHub

1. היכנס ל-[GitHub](https://github.com)
2. לחץ על הכפתור הירוק "+ New" או "New repository"
3. תן שם ל-repository (למשל: `kolana-yahad-website`)
4. בחר "Public" (חובה עבור GitHub Pages בחינם)
5. **אל תסמן** את האפשרויות "Add a README file", "Add .gitignore", או "Choose a license"
6. לחץ על "Create repository"

### שלב 2: העלה את הקבצים ל-GitHub

יש לך שתי אפשרויות:

#### אפשרות א': דרך ממשק GitHub (קל יותר למתחילים)

1. ב-repository החדש שיצרת, לחץ על "uploading an existing file"
2. גרור את כל הקבצים (`index.html`, `style.css`, `script.js`, `README.md`) לאזור ההעלאה
3. כתוב הודעת commit (למשל: "Initial commit - Kolana Yahad website")
4. לחץ על "Commit changes"

#### אפשרות ב': דרך Git בשורת הפקודה

פתח את PowerShell או Command Prompt בתיקייה שבה נמצאים הקבצים והרץ את הפקודות הבאות:

```bash
# אתחל repository מקומי
git init

# הוסף את כל הקבצים
git add .

# צור commit ראשון
git commit -m "Initial commit - Kolana Yahad website"

# הוסף את ה-remote (החלף USERNAME בשם המשתמש שלך ב-GitHub)
git remote add origin https://github.com/USERNAME/kolana-yahad-website.git

# שנה את שם הענף ל-main
git branch -M main

# העלה את הקבצים ל-GitHub
git push -u origin main
```

### שלב 3: הפעל את GitHub Pages

1. ב-repository שלך ב-GitHub, לחץ על "Settings" (הגדרות)
2. בתפריט הצדדי, לחץ על "Pages"
3. תחת "Source", בחר "Deploy from a branch"
4. תחת "Branch", בחר "main" ואז בחר "/ (root)"
5. לחץ על "Save"

### שלב 4: גש לאתר שלך!

אחרי כמה דקות, האתר שלך יהיה זמין בכתובת:

```
https://USERNAME.github.io/kolana-yahad-website/
```

(החלף `USERNAME` בשם המשתמש שלך ב-GitHub)

## עדכון האתר

כדי לעדכן את האתר לאחר שינויים:

### דרך ממשק GitHub:
1. לך ל-repository
2. לחץ על הקובץ שאתה רוצה לערוך
3. לחץ על סימן העיפרון (Edit)
4. ערוך את הקובץ
5. לחץ על "Commit changes"

### דרך Git:
```bash
git add .
git commit -m "תיאור השינויים"
git push
```

## טיפים נוספים

- האתר יתעדכן אוטומטית ב-GitHub Pages תוך מספר דקות מכל push
- אפשר לקשר דומיין מותאם אישית דרך הגדרות GitHub Pages
- כל השינויים שתעשה בקבצים יתעדכנו באתר החי

## תמיכה

אם יש לך שאלות או בעיות, פתח issue ב-repository או צור קשר עם המפתח.

---

**נבנה עם ❤️ עבור קולנו יחד**
