# مؤشرات أداء قسم التسويق | يسوم للمحاماة

نظام لوحة تحكم تنفيذي لإدارة ومتابعة مؤشرات أداء قسم التسويق (Marketing KPI Dashboard)، مبني بالكامل بواجهة عربية RTL.

## التقنيات

**الواجهة الأمامية:** React 19، Vite، TypeScript، TailwindCSS، مكونات على طراز Shadcn UI، React Router، React Hook Form + Zod، TanStack Table، TanStack Query، ApexCharts، Framer Motion، Axios.

**الخادم:** Node.js، Express، JWT، Better SQLite3، Multer، PDFKit، ExcelJS، bcrypt.

## هيكل المشروع

```
├── server/                # واجهة برمجية (Express + SQLite)
│   ├── src/
│   │   ├── db/             # schema.sql, db.ts, seed.ts
│   │   ├── middleware/      # auth, upload, errorHandler
│   │   ├── controllers/     # منطق كل مورد (categories, kpis, kpi-values, dashboard, reports, settings, auth)
│   │   ├── routes/          # مسارات REST API
│   │   ├── services/        # pdfService, excelService, reportData
│   │   ├── utils/           # حسابات النمو/الإنجاز
│   │   └── assets/fonts/    # خط Amiri لدعم العربية في PDF
│   └── data/                # قاعدة بيانات SQLite (تُنشأ تلقائيًا)
└── client/                 # واجهة المستخدم (React + Vite)
    └── src/
        ├── components/      # ui/ (عناصر Shadcn), layout/, shared/, charts/, categories/, kpis/, kpiValues/
        ├── context/         # Auth, Theme, Brand
        ├── hooks/           # React Query hooks لكل مورد
        ├── services/        # طبقة الاتصال بالـ API
        ├── pages/            # Login, Dashboard, Categories, Kpis, QuarterData, Reports, Settings, PublicDashboard
        └── routes/           # حماية المسارات
```

## التشغيل محليًا

```bash
npm install
npm run dev
```

- الواجهة الأمامية: http://localhost:5173
- الواجهة البرمجية: http://localhost:4000

عند أول تشغيل للخادم يتم تلقائيًا إنشاء قاعدة بيانات SQLite (من `schema.sql`) وتعبئتها ببيانات تجريبية (مستخدم إداري + فئات ومؤشرات وبيانات فصلية لعينة توضيحية) — لا حاجة لأي خطوة يدوية إضافية. يمكن أيضًا تشغيل الـ seed يدويًا في أي وقت (لن يكرر البيانات إن كانت موجودة):

```bash
npm run seed
```

## بيانات الدخول الافتراضية

| الحقل | القيمة الافتراضية |
|---|---|
| اسم المستخدم | `admin` |
| كلمة المرور | `Admin@12345` |
| كلمة مرور اللوحة العامة | `Public@12345` |

يمكن تغيير القيم الافتراضية عبر ملف `server/.env` (انسخ `server/.env.example`).

## المزايا الرئيسية

- **مصادقة JWT** مع مسارات محمية وتسجيل خروج.
- **لوحة تحكم تنفيذية**: بطاقات مؤشرات، مقارنة فصلية وسنوية، أفضل الفئات والمؤشرات، آخر التحديثات، رسوم بيانية تفاعلية (ApexCharts).
- **إدارة الفئات والمؤشرات**: CRUD كامل، بحث، فرز، حالة نشط/غير نشط، بدون قيم ثابتة.
- **البيانات الفصلية**: إدخال Q1–Q4 لكل سنة، حساب تلقائي لنسبة النمو، نسبة الإنجاز، الفرق، والحالة.
- **التقارير**: تصفية تفاعلية، بحث، فرز، طباعة، تصدير PDF (بدعم كامل للعربية RTL عبر خط Amiri) وExcel.
- **الإعدادات**: اسم الشركة والنظام، رفع الشعار مع استخراج تلقائي للون الأساسي من الشعار (Canvas)، تخصيص الألوان، الوضع الفاتح/الداكن، إعدادات اللوحة العامة.
- **اللوحة العامة**: وضع عرض للقراءة فقط محمي بكلمة مرور مستقلة عن حساب الإدارة.
- **دعم كامل للوضع الداكن/الفاتح** والتصميم المتجاوب.

## ملاحظات تقنية

- الألوان قابلة للتخصيص بالكامل من الإعدادات وتُطبَّق فورًا كمتغيرات CSS في كامل الواجهة والتقارير.
- عند رفع شعار جديد، يتم تحليل الصورة في المتصفح (Canvas) لاستخراج لون بارز تلقائيًا كاقتراح للون الأساسي، مع إمكانية التعديل يدويًا.
- توليد ملفات PDF يعتمد على خط Amiri (مرخّص SIL Open Font License) المضمّن في `server/src/assets/fonts` لضمان عرض عربي سليم دون الحاجة لأي معالجة يدوية للنص.
