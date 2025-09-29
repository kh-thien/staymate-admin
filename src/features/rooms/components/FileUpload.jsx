import React, { useState, useRef } from "react";

const FileUpload = ({
  onFileSelect,
  selectedFile,
  onRemove,
  accept = ".pdf,.doc,.docx",
  maxSize = 10,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file size (in MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File quá lớn. Kích thước tối đa là ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      alert(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Tải lên hợp đồng
      </label>

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            accept={accept}
            className="hidden"
          />

          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="text-sm text-gray-600">
              <button
                type="button"
                onClick={openFileDialog}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Nhấp để tải lên
              </button>
              <span> hoặc kéo thả file vào đây</span>
            </div>

            <p className="text-xs text-gray-500">
              Hỗ trợ: {accept} (Tối đa {maxSize}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <div className="flex-shrink-0 flex space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Thay đổi
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
