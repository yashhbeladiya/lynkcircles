import cloudinary from '../lib/cloudinary.js';

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const uploadToCloudinary = async (filePath, folder) => {
    const result = await cloudinary.uploader.upload(filePath, { folder, resource_type: "auto" });
    return result.secure_url;
};

export const deleteFromCloudinary = async (item_url) => {
    const public_id = item_url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(public_id);
};