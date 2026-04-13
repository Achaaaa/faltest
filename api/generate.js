import { fal } from "@fal-ai/client";

// Secure API Proxy using the official fal.ai SDK
export default async function handler(req, res) {
  // Add CORS headers for local development if needed
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Add some basic request logging for debugging
  const bodySize = req.body ? JSON.stringify(req.body).length : 0;
  console.log(`[API] Method: ${req.method}, Path: /api/generate, Body Size: ${(bodySize / 1024).toFixed(2)} KB`);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Please use POST.' });
  }

  const { isEdit, payload } = req.body || {};

  if (!payload) {
    return res.status(400).json({ error: 'Missing payload in request body' });
  }

  const endpoint = isEdit ? "fal-ai/nano-banana-2/edit" : "fal-ai/nano-banana-2";

  // The SDK automatically uses the FAL_KEY environment variable
  if (!process.env.FAL_KEY) {
    const envKeys = Object.keys(process.env).filter(k => !k.startsWith('VERCEL_')).sort();
    console.error("[API] FAL_KEY is missing.");
    console.error("[API] Available Env Keys (excluding VERCEL_*):", envKeys.join(', '));
    console.error("[API] Current NODE_ENV:", process.env.NODE_ENV);

    return res.status(500).json({
      error: 'FAL_KEY environment variable is not set in the server environment.',
      debug_info: {
        env_keys_found: envKeys,
        node_env: process.env.NODE_ENV,
        hint: 'Please check your Vercel Dashboard -> Settings -> Environment Variables and ensure FAL_KEY is added to all environments (Production, Preview, Development).'
      }
    });
  }

  try {
    console.log(`[API] Calling fal.ai endpoint: ${endpoint}`);
    // Using fal.run for high-speed response models like nano-banana-2
    const result = await fal.run(endpoint, {
      input: payload
    });

    console.log("[API] Successfully received response from fal.ai");
    return res.status(200).json(result);
  } catch (error) {
    console.error("[API] fal.ai SDK Error:", error);
    // Return a more descriptive error if possible
    const status = error.status || 500;
    const message = error.message || "An error occurred while calling the fal.ai API";
    return res.status(status).json({
      error: message,
      details: error.data || null
    });
  }
}
