import api from "@/lib/api";

// export interface UploadChunkParams {
//     chunk: any;
//     fileId: string;
//     chunkIndex: string;
//     totalChunks: string;
//     fileName: string;
//     mimeType: string;
// }

export interface CompleteUploadParams {
    fileId: string;
    fileName: string;
}

export interface UploadResponse {
    url: string;
    name: string;
    type: string;
    size: number;
}

export const assetService = {
    uploadChunk: (formData: FormData) => {
        return api.post("/assets/upload-chunk", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    completeUpload: (params: CompleteUploadParams): Promise<UploadResponse> => {
        return api.post("/assets/complete-upload", params);
    },

    // Legacy method - kept for backward compatibility
    uploadAsset: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post("/assets", formData);
    }
};