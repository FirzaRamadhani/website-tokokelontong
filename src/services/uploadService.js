export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    "tokomasnovi"
  );

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dqm5zjwjs/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  return data.secure_url;
};