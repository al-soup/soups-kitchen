import { appManifestResponse } from "@/lib/appPwa";

export function GET() {
  return appManifestResponse("habits");
}
