import { assetService, UploadResponse } from "@/services/assetService";

export async function uploadFileInChunks(
    file: File,
    onProgress: (percent: number) => void
): Promise<UploadResponse> {
    const fileId = crypto.randomUUID();
    const chunkSize = 1 * 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedSize = 0;

    for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);

        try {
            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('fileId', fileId);
            formData.append('chunkIndex', i.toString());
            formData.append('totalChunks', totalChunks.toString());
            formData.append('fileName', file.name);
            formData.append('mimeType', file.type);
            await assetService.uploadChunk(formData);

            uploadedSize += chunk.size;
            const percent = Math.floor((uploadedSize / file.size) * 100);
            onProgress(percent);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    try {
        const response = await assetService.completeUpload({
            fileId,
            fileName: file.name,
        });
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
