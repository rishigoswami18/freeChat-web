import axios from "axios";

export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
export const APK_DOWNLOAD_URL = import.meta.env.MODE === "development" ? "/apk-download" : "/api/apk/download";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

/**
 * Robust helper to download large files (APKs) with a predictable filename.
 * Uses a Blob approach to bypass Chrome's cross-origin restrictions on the `download` attribute.
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: direct link if blob fails
    window.open(url, "_blank");
  }
};
