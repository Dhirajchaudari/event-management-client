import { getApiBaseUrl } from "@/lib/api-base";
import {
  handleUnauthorizedRedirect,
  isUnauthorizedStatus,
  UnauthorizedError
} from "@/lib/session";

interface UploadResponse {
  url: string;
  publicId: string;
}

function mapUploadError(status: number, errorCode?: string): string {
  if (status === 413) {
    return "Image is too large for the server (max 5 MB). Try a smaller file.";
  }
  if (errorCode === "CLOUDINARY_NOT_CONFIGURED") {
    return "Photo upload is not configured on the server";
  }
  if (errorCode === "IMAGE_TOO_LARGE") {
    return "Image must be 5 MB or smaller";
  }
  if (errorCode === "INVALID_IMAGE_TYPE") {
    return "Please choose a JPEG, PNG, WebP, or GIF image";
  }
  return errorCode ?? "UPLOAD_FAILED";
}

export async function uploadSpeakerPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/api/uploads/speaker-photo`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  if (isUnauthorizedStatus(response.status)) {
    handleUnauthorizedRedirect();
    throw new UnauthorizedError("UNAUTHENTICATED");
  }

  let json: UploadResponse & { error?: string } = { url: "", publicId: "" };
  try {
    json = (await response.json()) as UploadResponse & { error?: string };
  } catch {
    if (response.status === 413) {
      throw new Error(mapUploadError(413));
    }
  }

  if (!response.ok) {
    throw new Error(mapUploadError(response.status, json.error));
  }

  if (!json.url) {
    throw new Error("UPLOAD_FAILED");
  }

  return json.url;
}

export { UnauthorizedError };
