const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

export default async function handler(request, response) {
  // รับข้อมูลจาก Body ของ Request
  const { purchaseToken, productId, packageName } = request.body;

  if (!purchaseToken || !productId || !packageName) {
    return response.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // --- ส่วนสำคัญ: การจัดการ Service Account JSON ---
    // เราจะไม่เก็บไฟล์ JSON ในโค้ด แต่จะใช้ Environment Variable
    const keyFileBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    if (!keyFileBase64) throw new Error("Service account key not found.");

    const keyFileJson = Buffer.from(keyFileBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(keyFileJson);

    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const androidPublisher = google.androidpublisher({
      version: "v3",
      auth: auth,
    });

    const res = await androidPublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    // ถ้าสำเร็จ ส่งข้อมูลวันหมดอายุกลับไป
    return response.status(200).json({ 
      status: "success", 
      data: res.data 
    });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ status: "error", message: error.message });
  }
}