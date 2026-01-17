import { getCloudinaryName } from './firebase';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = getCloudinaryName();
  
  if (!cloudName) {
    throw new Error('Cloudinary not configured. Please set Cloudinary name in admin settings.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url;
};
