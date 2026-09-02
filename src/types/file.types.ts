export type FileCategory = "profile-picture" | "workout-plan";

export type CreateUploadUrlInput = {
  category: FileCategory;
  fileName: string;
  contentType: string;
};

export type CreateUploadUrlResult = {
  uploadUrl: string;
  key: string;
};
