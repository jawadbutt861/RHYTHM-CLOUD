import { ImageKit } from "@imagekit/nodejs"

// Instantiated lazily so a missing IMAGEKIT_PRIVATE_KEY only breaks
// actual upload calls, instead of crashing the whole app on import
// (this module gets loaded for every request, not just uploads).
let ImageKitClient;

function getClient() {
    if (!ImageKitClient) {
        if (!process.env.IMAGEKIT_PRIVATE_KEY) {
            throw new Error(
                "IMAGEKIT_PRIVATE_KEY is not set. Add it in your Vercel project's Environment Variables."
            );
        }
        ImageKitClient = new ImageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        });
    }
    return ImageKitClient;
}

async function uploadFile(file) {
    const result = await getClient().files.upload({
        file,
        fileName: "music_" + Date.now(),
        folder: "yt-complete-backend/music"
    })

    return result;
}


export { uploadFile }