import { fal } from "@fal-ai/client";

// Secure API Proxy using the official fal.ai SDK
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { isEdit, payload } = req.body;
  const endpoint = isEdit ? "fal-ai/nano-banana-2/edit" : "fal-ai/nano-banana-2";
  
  // The SDK automatically uses the FAL_KEY environment variable
  if (!process.env.FAL_KEY) {
    return res.status(500).json({ error: 'FAL_KEY environment variable is not set' });
  }

  try {
    // Using fal.run for high-speed response models like nano-banana-2
    const result = await fal.run(endpoint, {
      input: payload
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("fal.ai SDK Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
