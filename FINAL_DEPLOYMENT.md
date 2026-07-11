# LANTANA — النشر النهائي

قاعدة البيانات **جاهزة وشغّالة** (مشروع Lantana على Supabase).
ما ضلّ إلا ترفع الكود وتكبس Deploy.

---

## ✅ خلصان (عملتو أنا)

- قاعدة البيانات: ٨ جداول + الحماية RLS
- ١٠ منتجات · ٣ مجموعات · ٦ أسعار شحن · ٢ كوبونات · ٢ مقالات · ٣ تقييمات
- فحص أمني: صفر مشاكل
- الصور مضغوطة ومحسّنة للسرعة

---

## الخطوة ١ — جيب المفتاح السرّي

Supabase → مشروع **Lantana** → **Project Settings** → **API Keys** → عند `service_role` اكبس **Reveal** وانسخو.

---

## الخطوة ٢ — ارفع الكود ع GitHub

1. افتح **https://github.com/new**
2. اسم المستودع: `lantana` → اختار **Private** → **Create repository**
3. بالصفحة اللي بتفتح، اكبس **uploading an existing file**
4. فكّ الـ ZIP عندك، وسحّاب (drag) **كل محتوياتو** لصفحة الرفع
5. اكبس **Commit changes**

---

## الخطوة ٣ — انشر ع Vercel

1. افتح **https://vercel.com/new**
2. اكبس **Import** جنب مستودع `lantana`
3. افتح **Environment Variables** وحط هالتلاتة:

| الاسم | القيمة |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ljzdnosvakfpdsddfxxg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (موجود بملف `.env.local.example`) |
| `SUPABASE_SERVICE_ROLE_KEY` | اللي نسختو بالخطوة ١ |

4. اكبس **Deploy**

---

## خلص — الموقع عايش

- **المتجر:** `https://lantana-xxx.vercel.app`
- **الأدمن:** `/admin` — إيميل `admin@lantana.com` · باسوورد `lantana2026`

### تغيير باسوورد الأدمن
بـ Vercel → Settings → Environment Variables → ضيف `ADMIN_EMAIL` و `ADMIN_PASSWORD` → **Redeploy**

### تشغيل الدفع بالبطاقة (اختياري، وقت ما بدّك)
ضيف `STRIPE_SECRET_KEY` و `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → **Redeploy**.
خيار البطاقة بيظهر لحالو بصفحة الدفع. حالياً الموقع بيقبل **الدفع عند الاستلام** (سوريا) و**الحوالة البنكية**.
