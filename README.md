# Malika klinikasi — sayt

## Tuzilishi
- `index.html`, `haqida.html`, `shifokorlar.html`, `xizmatlar.html`, `profil.html`, `aloqa.html` — har biri alohida sahifa.
- `css/style.css` — umumiy uslub (liquid glass, 3D, qorong'u/yorug' rejim, floating dock).
- `js/script.js` — nav, tema, shifokorlar/bandlash mantig'i.
- `netlify/functions/slots.js` va `book.js` — bandlash uchun serverless funksiyalar (Netlify Blobs orqali barcha foydalanuvchilar uchun umumiy saqlanadi, shuning uchun bitta vaqtni ikki kishi band qila olmaydi).

## ⚠️ Muhim: Telegram tokeningiz haqida
Siz menga botingizning tokenini ochiq matnda yubordingiz. Bu suhbat tarixida saqlanib qoladi, shuning uchun **@BotFather** orqali o'sha botga kirib, tokenni **/revoke** (yangilash) qilishni tavsiya qilaman, so'ng yangi tokenni faqat quyidagi 2-qadamdagi kabi Netlify muhit o'zgaruvchisiga qo'shing. Tokenni hech qachon HTML yoki JS fayliga yozmang — aks holda uni saytni ko'rgan har kim brauzer orqali ko'rib, botingizdan foydalanishi mumkin.

## Netlify'ga joylash
1. Ushbu papkani GitHub'ga yuklang (yoki to'g'ridan-to'g'ri Netlify'ga zip qilib tashlang), so'ng Netlify'da "Add new site" orqali ulang. `netlify.toml` fayli build sozlamalarini avtomatik oladi.
2. **Site settings → Environment variables** bo'limiga kiring va qo'shing:
   - `TELEGRAM_BOT_TOKEN` — botingizning (yangilangan) tokeni
   - `TELEGRAM_CHAT_ID` — xabarlar boradigan chat/guruh ID'si
3. Chat ID'ni topish: botga Telegram'da `/start` yozing (yoki uni guruhga qo'shing), so'ng brauzerda quyidagi manzilni oching:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   Javobdagi `"chat":{"id": ...}` qiymati — sizning chat ID'ingiz.
4. Saytni qayta deploy qiling (muhit o'zgaruvchisi qo'shilgach, "Trigger deploy" bosing).

## Bilishingiz kerak bo'lgan cheklovlar
- Qorong'u/yorug' tugma har bir sahifada ishlaydi, lekin sahifadan sahifaga o'tganda tizim afzalligiga qaytadi (brauzer xotirasi ishlatilmagan). Agar tanlov doimiy saqlanishi kerak bo'lsa, aytib qo'ying — buni oddiy usulda qo'shib beraman.
- Bandlash funksiyalari (`slots.js`, `book.js`) faqat sayt Netlify'da (Functions yoqilgan holda) ishlaganda ishlaydi. Agar boshqa oddiy statik hosting'ga (masalan GitHub Pages) qo'ysangiz, bandlash qulfi ishlamaydi.
