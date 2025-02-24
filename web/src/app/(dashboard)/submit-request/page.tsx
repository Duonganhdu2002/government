"use client";

import React, { useState } from "react";
import {
  Button,
  Heading,
  DatePicker,
  Label,
  Select,
} from "@medusajs/ui";
import { Camera, XMarkMini } from "@medusajs/icons";

/**
 * Main page component containing the form content
 */
const Page = () => {
  // State to manage an array of three image URLs (or null if not set)
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  // State to manage the video URL (or null if not set)
  const [video, setVideo] = useState<string | null>(null);
  // State to manage the selected behavior from the dropdown
  const [selectedBehavior, setSelectedBehavior] = useState<string>("");

  /**
   * Handle image upload.
   * Creates a URL for the uploaded image and updates the corresponding index in state.
   *
   * @param event - The file input change event.
   * @param index - The index of the image slot being updated.
   */
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.target.files && event.target.files[0]) {
      const newImages = [...images];
      newImages[index] = URL.createObjectURL(event.target.files[0]);
      setImages(newImages);
    }
  };

  /**
   * Delete an image from the specified index.
   * Prevents the label click from re-triggering the file input.
   *
   * @param index - The index of the image to remove.
   * @param e - The mouse event (prevents default and stops propagation).
   */
  const handleDeleteImage = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  /**
   * Handle video upload.
   * Creates a URL for the uploaded video and updates the state.
   *
   * @param event - The file input change event.
   */
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideo(URL.createObjectURL(event.target.files[0]));
    }
  };

  /**
   * Delete the uploaded video.
   *
   * @param e - The mouse event (stops propagation).
   */
  const handleDeleteVideo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setVideo(null);
  };

  return (
    <div className="h-full p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-sm overflow-auto">
      <div>
        {/* Header: Title and Submit Button */}
        <div className="flex justify-between items-center mb-6">
          <Heading>Tạo đơn mới</Heading>
          <Button>Nộp</Button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 md:gap-4">
          {/* Item 1: Order Creation Date */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label htmlFor="date-picker" className="text-gray-600" weight="plus">
              Ngày tạo đơn
            </Label>
            <div className="w-full mt-2">
              <DatePicker id="date-picker" aria-label="Chọn ngày tạo đơn" />
            </div>
          </div>

          {/* Item 2: Location */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label htmlFor="location-picker" className="text-gray-600" weight="plus">
              Địa điểm
            </Label>
            <div className="w-full mt-2">
              <DatePicker id="location-picker" aria-label="Chọn địa điểm" />
            </div>
          </div>

          {/* Item 3: Order Type and Behavior (Select Component) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-gray-600" weight="plus">
              Loại đơn và hành vi
            </Label>
            <div className="w-full mt-2">
              <Select value={selectedBehavior} onValueChange={setSelectedBehavior}>
                <Select.Trigger>
                  <Select.Value placeholder="Chọn loại đơn và hành vi" />
                </Select.Trigger>
                <Select.Content>
                  {/* Group 1: Fraud related behaviors */}
                  <Select.Group>
                    <Select.Label>
                      Hành vi lừa đảo, chiếm đoạt tài sản
                    </Select.Label>
                    <Select.Item value="loadao1">
                      Lừa đảo mua bán qua mạng
                    </Select.Item>
                    <Select.Item value="loadao2">
                      Giả danh công an, ngân hàng để lừa đảo
                    </Select.Item>
                    <Select.Item value="loadao3">
                      Chiếm đoạt tài sản thông qua vay nợ
                    </Select.Item>
                    <Select.Item value="loadao4">
                      Lừa đảo tài chính, tín dụng đen
                    </Select.Item>
                  </Select.Group>
                  {/* Group 2: Security and public order violations */}
                  <Select.Group>
                    <Select.Label>
                      Hành vi vi phạm an ninh, trật tự xã hội
                    </Select.Label>
                    <Select.Item value="an_ninh1">
                      Gây rối trật tự công cộng
                    </Select.Item>
                    <Select.Item value="an_ninh2">
                      Bạo lực gia đình, hành hung người khác
                    </Select.Item>
                    <Select.Item value="an_ninh3">
                      Cưỡng đoạt tài sản, đe dọa tống tiền
                    </Select.Item>
                    <Select.Item value="an_ninh4">
                      Tổ chức đánh bạc, cá độ trái phép
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select>
            </div>
          </div>

          {/* Item 4: Image Upload Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-gray-600" weight="plus">
              Hình ảnh
            </Label>
            <div className="w-full mt-2 flex gap-2">
              {images.map((image, index) => (
                <label
                  key={index}
                  className="relative flex flex-col items-center justify-center w-24 h-24 border-2 border-gray-300 rounded-lg bg-white cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, index)}
                  />
                  {image ? (
                    // Display the uploaded image with a delete button
                    <div className="relative w-full h-full">
                      <img
                        src={image}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleDeleteImage(index, e)}
                        className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                      >
                        <XMarkMini className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  ) : (
                    // Display the upload prompt with camera icon if no image is set
                    <div className="flex flex-col items-center text-gray-400">
                      <Camera className="w-8 h-8" />
                      <span className="text-xs mt-1">{`${index + 1}/3`}</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Item 5: Video Upload Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-gray-600" weight="plus">
              Video
            </Label>
            <div className="w-full mt-2">
              <label className="relative flex flex-col items-center justify-center w-48 h-32 border-2 border-gray-300 rounded-lg bg-white cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
                />
                {video ? (
                  // Display the uploaded video with a delete button
                  <div className="relative w-full h-full">
                    <video
                      src={video}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleDeleteVideo(e)}
                      className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                    >
                      <XMarkMini className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  // Display the upload prompt with camera icon if no video is set
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera className="w-8 h-8" />
                    <span className="text-xs mt-1">Chọn video</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Item 6: Detailed Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-gray-600" weight="plus">
              Mô tả chi tiết
            </Label>
            <div className="w-full mt-2">
              <textarea
                placeholder="Nhập mô tả chi tiết..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                rows={4}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
