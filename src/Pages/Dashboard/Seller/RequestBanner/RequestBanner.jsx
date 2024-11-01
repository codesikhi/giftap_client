import { useState } from "react";
import axios from "axios";
import useAxiosSecure from "../../../../Components/Hooks/useAxiosSecure";
import toast from "react-hot-toast";
import useAuth from "../../../../Components/Hooks/useAuth";
import { AuthContext } from "../../../../Components/Provider/AuthProvider";

const RequestBanner = () => {
  const [banner, setBanner] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for image upload
  
  // Call useAxiosSecure at the top level of the component
  const axiosSecure = useAxiosSecure();
  const userName = useAuth(AuthContext);

  const handleFileChange = (file) => {
    if (file) {
      setBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (banner) {
      setLoading(true);

      // Create FormData to send the image to Imgbb
      const formData = new FormData();
      formData.append("image", banner);

      try {
        // Upload to Imgbb using your API key
        const image_hosting_key = import.meta.env.VITE_IMGBB_API;
        const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload?key=${image_hosting_key}`, formData);
        const imgbbUrl = imgbbResponse.data.data.url;
        

        // Send the image URL to your backend to store in MongoDB
        await axiosSecure.post("/banner", { bannerUrl: imgbbUrl, sellerName: userName.user.displayName, type: "pending" });
        toast.success('Request success wait for admin confirmation')

        // Reset state after successful upload
        setBanner(null);
        setPreview(null);
      } catch (error) {
        console.error("Error uploading banner:", error);
        alert("There was an error uploading your banner. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please select a banner to upload");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Upload Your Banner</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`flex justify-center items-center w-full ${isDragging ? "border-pink-500 bg-gray-200" : "border-gray-300 bg-white"} h-60 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave} 
          onDrop={handleDrop} 
        >
          <label
            htmlFor="file-upload"
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {preview ? (
              <img
                src={preview}
                alt="Banner Preview"
                className="object-cover h-full w-full rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16V8m0 0l4-4m0 0l4 4m-4-4v12M5 20h14a2 2 0 002-2V10a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-colors shadow-lg"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Request Advertise"}
        </button>
      </form>
    </div>
  );
};

export default RequestBanner;
