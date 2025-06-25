import { useCallback, useRef, useState } from "react";
import { IAttachment } from "@/types";
import { getFileExtension } from "@/utils";
import { uploadFileInChunks } from "@/utils/uploadFileInChunks";
import { toast } from "./use-toast";

/**
 * File upload state interface
 */
export interface FileUploadState {
    file: File | null;
    attachment: IAttachment | null;
    extension: string | null;
    url: string | null;
    progress: number;
    isUploading: boolean;
    error: string | null;
}

/**
 * Custom hook for managing file upload functionality
 * 
 * Provides a clean interface for handling file selection, upload progress,
 * and upload status management in chat applications.
 * 
 * @returns Object containing file upload state and handlers
 */
export const useFileUpload = () => {
    const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
        file: null,
        attachment: null,
        extension: null,
        url: null,
        progress: 0,
        isUploading: false,
        error: null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Triggers the file input dialog
     */
    const handleFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    /**
     * Handles file selection and upload
     */
    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const extension = getFileExtension(file.name);

        setFileUploadState(prev => ({
            ...prev,
            file,
            extension: extension || null,
            isUploading: true,
            error: null,
            progress: 0,
        }));

        try {
            const result = await uploadFileInChunks(file, (progress) => {
                setFileUploadState(prev => ({ ...prev, progress }));
            });

            if (result) {
                setFileUploadState(prev => ({
                    ...prev,
                    attachment: result,
                    url: result.url,
                    isUploading: false,
                    progress: 100,
                }));
                toast({
                    title: "Upload successful",
                    description: "File uploaded successfully",
                    variant: "default",
                    duration: 3000,
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            toast({
                title: "Upload failed",
                description: errorMessage,
                variant: "destructive",
            });
            //   console.error("Upload failed:", error);

            setFileUploadState(prev => ({
                ...prev,
                error: errorMessage,
                isUploading: false,
            }));
        }
    }, []);

    /**
     * Clears the current file upload state
     */
    const clearFileUpload = useCallback(() => {
        setFileUploadState({
            file: null,
            attachment: null,
            extension: null,
            url: null,
            progress: 0,
            isUploading: false,
            error: null,
        });

        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    /**
     * Retries the upload for the current file
     */
    const retryUpload = useCallback(() => {
        if (fileUploadState.file) {
            // Create a proper mock event that matches React.ChangeEvent<HTMLInputElement>
            const mockFileList = {
                0: fileUploadState.file,
                length: 1,
                item: (index: number) => index === 0 ? fileUploadState.file : null,
                [Symbol.iterator]: function* () { yield fileUploadState.file; }
            } as FileList;

            const fakeEvent = {
                target: { files: mockFileList }
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            handleFileChange(fakeEvent);
        }
    }, [fileUploadState.file, handleFileChange]);

    return {
        fileUploadState,
        fileInputRef,
        handleFileSelect,
        handleFileChange,
        clearFileUpload,
        retryUpload,
    };
}; 