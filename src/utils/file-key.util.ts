import { randomUUID } from "node:crypto";

import type { FileCategory } from "../types/file.types.js";

export const createFileKey = (
  category: FileCategory,
  ownerId: string,
  fileName: string,
) => {
  const extension = fileName.includes(".")
    ? fileName.substring(fileName.lastIndexOf("."))
    : "";

  const folder =
    category === "profile-picture" ? "profile-pictures" : "workout-plans";

  return `${folder}/${ownerId}/${randomUUID()}${extension}`;
};
