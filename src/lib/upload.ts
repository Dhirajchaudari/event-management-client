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

  const json = (await response.json()) as UploadResponse & { error?: string };

  if (!response.ok) {
    throw new Error(json.error ?? "UPLOAD_FAILED");
  }

  if (!json.url) {
    throw new Error("UPLOAD_FAILED");
  }

  return json.url;
}

export { UnauthorizedError };
