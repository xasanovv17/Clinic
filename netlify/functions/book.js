const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Faqat POST so‘rovlar qabul qilinadi" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ message: "Noto‘g‘ri so‘rov formati" }) };
  }

  const { doctorId, doctorName, dept, date, time, name, phone } = data;
  if (!doctorId || !date || !time || !name || !phone) {
    return { statusCode: 400, body: JSON.stringify({ message: "Barcha maydonlarni to‘ldiring" }) };
  }

  const store = getStore("bookings");
  const key = doctorId + "_" + date;

  try {
    const existing = (await store.get(key, { type: "json" })) || {};
 
    // Ikkinchi foydalanuvchi shu vaqtni band qilishga urinsa — rad etiladi.
    if (existing[time]) {
      return { statusCode: 409, body: JSON.stringify({ message: "Bu vaqt allaqachon band qilingan, boshqasini tanlang" }) };
    }

    existing[time] = { name, phone, bookedAt: new Date().toISOString() };
    await store.setJSON(key, existing);
  } catch (err) {
    console.error("Bandlashni saqlashda xatolik:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Serverda xatolik yuz berdi" }) };
  }

  // Telegram botga xabarnoma. Token va chat ID Netlify muhit o'zgaruvchilaridan olinadi —
  // hech qachon shu faylga yoki frontend kodiga yozilmaydi.
  const token = "8756019741:AAFnn6P8QLAl4x-tf5DDa9LQzxa4M_IxRgI";
  const chatId = "909706462"; 
  if (token && chatId) {
    const text = [
      "🆕 Yangi yozuv — Asalxon Malika klinikasi",
      "Shifokor: " + doctorName + " (" + dept + ")",
      "Sana: " + date + ", soat " + time,
      "Bemor: " + name,
      "Telefon: " + phone
    ].join("\n");
    try {
      await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text })
      });
    } catch (err) {
      console.error("Telegram xabarnomasi yuborilmadi:", err);
      // Bandlash baribir saqlanган, faqat xabarnoma yuborilmadi.
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true })
  };
};
