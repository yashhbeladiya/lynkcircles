import cloudinary from '../lib/cloudinary.js';

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const uploadToCloudinary = async (filePath, folder) => {
    const result = await cloudinary.uploader.upload(filePath, { folder, resource_type: "auto" });
    return result.secure_url;
};

/**
 * Upload a multer file (memoryStorage -> req.file with .buffer/.mimetype)
 * directly to Cloudinary by streaming the buffer in. Avoids touching the
 * filesystem.
 */
export const uploadBufferToCloudinary = (file, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto" },
            (err, result) => {
                if (err) return reject(err);
                if (!result) return reject(new Error("Cloudinary returned empty result"));
                resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });

export const deleteFromCloudinary = async (item_url) => {
    const public_id = item_url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(public_id);
};