const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const doctorId = event.queryStringParameters && event.queryStringParameters.doctorId;
  const date = event.queryStringParameters && event.queryStringParameters.date;

  if (!doctorId || !date) {
    return { statusCode: 400, body: JSON.stringify({ message: "doctorId va date kerak" }) };
  }

  try {
    const store = getStore("bookings");
    const key = doctorId + "_" + date;
    const existing = (await store.get(key, { type: "json" })) || {};
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taken: Object.keys(existing) })
    };
  } catch (err) {
    console.error("slots xatosi:", err);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taken: [] }) };
  }
};
