export const getPublicIdFromUrl = (url: string) => {
  // Regular expression to match Cloudinary URL with versioning and folder
  const regex = /\/image\/upload(?:\/v\d+)?\/(.*?)(?=\.\w{3,4}$)/;
  
  const match = url.match(regex);
  return match ? match[1] : null; // Return the public_id if found
};
