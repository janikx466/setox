import { getCloudinaryName } from './firebase';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = getCloudinaryName();
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured. Go to Admin → Cloudinary Settings and enter your cloud name (found in your Cloudinary Dashboard, NOT the upload preset name).');
  }

  // Validate cloud name format - it should not be 'ml_default' which is an upload preset
  if (cloudName === 'ml_default') {
    throw new Error('Invalid cloud name: "ml_default" is an upload preset, not a cloud name. Your cloud name can be found in your Cloudinary Dashboard (looks like "dxxxxxxxx" or a custom name).');
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
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || 'Upload failed';
    
    if (response.status === 401) {
      throw new Error(`Cloudinary authentication failed: ${errorMessage}. Please check: 1) Your cloud name "${cloudName}" is correct, 2) You have an unsigned upload preset named "ml_default" in your Cloudinary settings.`);
    }
    
    throw new Error(`Failed to upload image: ${errorMessage}`);
  }

  const data = await response.json();
  return data.secure_url;
};
