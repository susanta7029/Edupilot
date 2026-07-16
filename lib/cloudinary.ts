export async function uploadImage(fileBase64: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_NAME;
  const apiKey = process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary is not configured. Returning default mock thumbnail.");
    // Return a random beautiful Unsplash tech/education image as fallback
    const fallbacks = [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  try {
    // Cloudinary direct upload endpoint
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    // We can compile a form-data request
    const formData = new FormData();
    formData.append("file", fileBase64);
    formData.append("upload_preset", "edupilot_preset"); // User will need to configure this or fallback is triggered

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.secure_url;
  } catch (e) {
    console.error("Cloudinary upload error, using placeholder:", e);
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600";
  }
}
