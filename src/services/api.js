// นำ URL ที่ได้จาก Google Apps Script มาใส่ตรงนี้
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

// ฟังก์ชันสำเร็จรูปสำหรับยิงข้อมูล
export const saveToGoogleSheets = async (payload) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { success: true, message: "บันทึกข้อมูลสำเร็จ" };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการบันทึก" };
  }
};