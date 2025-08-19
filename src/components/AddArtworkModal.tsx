// Enhanced src/components/AddArtworkModal.tsx with better error handling

"use client";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  CREATE_ARTWORK,
  ADD_IMAGE_TO_ARTWORK,
  GET_ARTISTS,
  GET_CATEGORIES,
} from "@/lib/queries";
import CategorySelector from "./CategorySelector";
import Cookies from "js-cookie";

interface Category {
  id: string;
  name: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
}

interface AddArtworkModalProps {
  onClose: () => void;
  onArtworkAdded: () => void;
}

interface SelectedFile {
  file: File;
  id: string;
  preview: string;
  isPDF?: boolean;
}

export default function AddArtworkModal({
  onClose,
  onArtworkAdded,
}: AddArtworkModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    artist_name: "",
    year_created: "",
    medium: "",
    dimensions: "",
    edition_number: "",
    provenance: "",
    condition_status: "Good",
    acquisition_date: "",
    acquisition_price: "",
    current_value: "",
    location_in_collection: "",
    category_id: "",
    description: "",
    notes: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [artistSearch, setArtistSearch] = useState("");
  const [filteredArtists, setFilteredArtists] = useState<string[]>([]);

  // Dimension inputs
  const [dimensionType, setDimensionType] = useState<"2d" | "3d">("2d");
  const [dimensions, setDimensions] = useState({
    width: "",
    height: "",
    length: "",
  });

  const [createArtwork] = useMutation(CREATE_ARTWORK, {
    onError: (error) => {
      console.error("Create artwork mutation error:", error);
      console.error("GraphQL errors:", error.graphQLErrors);
      console.error("Network error:", error.networkError);

      // Set a more specific error message
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.networkError?.message ||
        error.message ||
        "Unknown error occurred";
      setErrors({ general: errorMessage });
    },
  });

  const [addImage] = useMutation(ADD_IMAGE_TO_ARTWORK, {
    onError: (error) => {
      console.error("Add image mutation error:", error);
    },
  });

  // Get existing artists for dropdown
  const {
    data: artistsData,
    loading: artistsLoading,
    error: artistsError,
  } = useQuery(GET_ARTISTS, {
    onError: (error) => {
      console.error("Artists query error:", error);
    },
  });

  // Get categories
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES, {
    onError: (error) => {
      console.error("Categories query error:", error);
    },
  });

  const existingArtists = artistsData?.getArtists || [];
  const categories = categoriesData?.categories || [];

  useEffect(() => {
    // Filter artists based on search
    if (artistSearch) {
      const filtered = existingArtists.filter((artist: string) =>
        artist.toLowerCase().includes(artistSearch.toLowerCase())
      );
      setFilteredArtists(filtered);
    } else {
      setFilteredArtists(existingArtists.slice(0, 10)); // Show max 10 artists initially
    }
  }, [artistSearch, existingArtists]);

  useEffect(() => {
    // Update dimensions string when individual dimensions change
    let dimensionString = "";
    if (dimensionType === "2d") {
      if (dimensions.width && dimensions.height) {
        dimensionString = `${dimensions.width}×${dimensions.height} cm`;
      }
    } else {
      if (dimensions.width && dimensions.height && dimensions.length) {
        dimensionString = `${dimensions.width}×${dimensions.height}×${dimensions.length} cm`;
      }
    }
    setFormData((prev) => ({ ...prev, dimensions: dimensionString }));
  }, [dimensions, dimensionType]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (!file.isPDF && file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  // Add the missing handleCategoryChange function
  const handleCategoryChange = useCallback((categoryId: string) => {
    setFormData((prev) => ({ ...prev, category_id: categoryId }));

    // Clear error when category is selected
    setErrors((prev) => {
      if (prev.category_id) {
        const { category_id, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Check all mandatory fields
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.artist_name.trim())
      newErrors.artist_name = "Artist name is required";
    if (!formData.medium.trim()) newErrors.medium = "Medium is required";
    if (!formData.dimensions.trim())
      newErrors.dimensions = "Dimensions are required";
    if (!formData.location_in_collection.trim())
      newErrors.location_in_collection = "Location in collection is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";

    // Validate year if provided
    if (
      formData.year_created &&
      (parseInt(formData.year_created) < 1 ||
        parseInt(formData.year_created) > new Date().getFullYear())
    ) {
      newErrors.year_created = "Please enter a valid year";
    }

    // Validate prices if provided
    if (
      formData.acquisition_price &&
      parseFloat(formData.acquisition_price) < 0
    ) {
      newErrors.acquisition_price = "Price cannot be negative";
    }
    if (formData.current_value && parseFloat(formData.current_value) < 0) {
      newErrors.current_value = "Value cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      console.log("🎨 Creating artwork...");
      console.log("Form data:", formData);

      // Prepare artwork input with proper type conversion and validation
      const artworkInput = {
        title: formData.title.trim(),
        artist_name: formData.artist_name.trim(),
        medium: formData.medium.trim(),
        dimensions: formData.dimensions.trim(),
        location_in_collection: formData.location_in_collection.trim(),
        category_id: formData.category_id,
        year_created: formData.year_created
          ? parseInt(formData.year_created)
          : null,
        edition_number: formData.edition_number.trim() || null,
        provenance: formData.provenance.trim() || null,
        condition_status: formData.condition_status || "Good",
        acquisition_date: formData.acquisition_date || null,
        acquisition_price: formData.acquisition_price
          ? parseFloat(formData.acquisition_price)
          : null,
        current_value: formData.current_value
          ? parseFloat(formData.current_value)
          : null,
        description: formData.description.trim() || null,
        notes: formData.notes.trim() || null,
      };

      console.log("Prepared artwork input:", artworkInput);

      // Create artwork first
      const { data, errors: mutationErrors } = await createArtwork({
        variables: { input: artworkInput },
        errorPolicy: "all",
      });

      console.log("Mutation response:", { data, errors: mutationErrors });

      if (mutationErrors && mutationErrors.length > 0) {
        console.error("GraphQL errors:", mutationErrors);
        setErrors({ general: mutationErrors[0].message });
        return;
      }

      if (!data || !data.createArtwork) {
        console.error("No data returned from mutation");
        setErrors({ general: "Failed to create artwork - no data returned" });
        return;
      }

      const artworkId = data.createArtwork.id;
      console.log("✅ Artwork created with ID:", artworkId);

      // Now handle image uploads
      if (selectedFiles.length > 0) {
        console.log(`📸 Uploading ${selectedFiles.length} images...`);

        let uploadedCount = 0;
        let failedUploads = [];

        for (let i = 0; i < selectedFiles.length; i++) {
          const selectedFile = selectedFiles[i];
          console.log(
            `📤 Uploading file ${i + 1}/${selectedFiles.length}: ${
              selectedFile.file.name
            }`
          );

          try {
            // Prepare form data
            const formDataImg = new FormData();
            formDataImg.append("image", selectedFile.file);

            const token = Cookies.get("auth-token");
            console.log("Using auth token:", token ? "present" : "missing");

            // Upload file
            const uploadResponse = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
              }/upload`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formDataImg,
              }
            );

            console.log("Upload response status:", uploadResponse.status);

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error("Upload failed:", errorText);
              throw new Error(`HTTP ${uploadResponse.status}: ${errorText}`);
            }

            const uploadResult = await uploadResponse.json();
            console.log("Upload result:", uploadResult);

            // Add image to artwork
            console.log("🖼️ Adding image to artwork via GraphQL...");
            const imageResult = await addImage({
              variables: {
                artwork_id: artworkId,
                image_path: uploadResult.path,
                image_name: uploadResult.originalName,
                is_primary: i === 0, // First image is primary
                file_type: uploadResult.isPDF ? "pdf" : "image",
                mime_type: uploadResult.fileType,
                thumbnail_path: uploadResult.thumbnailPath,
              },
            });

            console.log("✅ Image added successfully:", imageResult);
            uploadedCount++;
          } catch (imageError) {
            console.error(
              `❌ Failed to upload ${selectedFile.file.name}:`,
              imageError
            );
            failedUploads.push({
              filename: selectedFile.file.name,
              error: imageError.message,
            });
          }
        }

        console.log(
          `📊 Upload summary: ${uploadedCount}/${selectedFiles.length} successful`
        );

        if (failedUploads.length > 0) {
          console.error("Failed uploads:", failedUploads);
          alert(
            `Artwork created successfully, but ${
              failedUploads.length
            } image(s) failed to upload:\n${failedUploads
              .map((f) => f.filename)
              .join("\n")}`
          );
        } else {
          console.log("✅ All images uploaded successfully");
        }
      }

      console.log("🎉 Artwork creation process completed");
      onArtworkAdded();
    } catch (error) {
      console.error("💥 Error in artwork creation process:", error);

      // More detailed error handling
      if (error instanceof Error) {
        setErrors({ general: `Error: ${error.message}` });
      } else {
        setErrors({
          general: "An unexpected error occurred while creating the artwork",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleArtistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setArtistSearch(value);
    setFormData((prev) => ({ ...prev, artist_name: value }));
    setShowArtistDropdown(true);

    if (errors.artist_name) {
      setErrors((prev) => {
        const { artist_name, ...rest } = prev;
        return rest;
      });
    }
  };

  const selectArtist = (artist: string) => {
    setFormData((prev) => ({ ...prev, artist_name: artist }));
    setArtistSearch(artist);
    setShowArtistDropdown(false);
  };

  const handleDimensionChange = (
    field: "width" | "height" | "length",
    value: string
  ) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));

    // Clear dimension error when user starts entering dimensions
    if (errors.dimensions) {
      setErrors((prev) => {
        const { dimensions, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: SelectedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const id = Math.random().toString(36).substr(2, 9);

        // Check if file is PDF or image
        const isPDF = file.type === "application/pdf";
        let preview = "";

        if (isPDF) {
          // Use a PDF placeholder
          preview =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgMkg5TDE0IDdWMjBIMTZWMkg2WiIgZmlsbD0iI0VGNDQ0NCIvPgo8L3N2Zz4=";
        } else {
          // Create object URL for images
          preview = URL.createObjectURL(file);
        }

        newFiles.push({
          file,
          id,
          preview,
          isPDF,
        });
      }

      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    // Reset input
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (
        fileToRemove &&
        !fileToRemove.isPDF &&
        fileToRemove.preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".artist-dropdown-container")) {
      setShowArtistDropdown(false);
    }
  }, []);

  useEffect(() => {
    if (showArtistDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showArtistDropdown, handleClickOutside]);

  const conditionOptions = [
    "Excellent",
    "Very Good",
    "Good",
    "Fair",
    "Poor",
    "Needs Restoration",
  ];

  if (categoriesLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white mb-10">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white mb-10">
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading categories</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Add New Artwork
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{errors.general}</p>
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer">
                Debug Info
              </summary>
              <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                {JSON.stringify(errors, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h4>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter artwork title"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Artist Name with Dropdown */}
              <div className="relative artist-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="artist_name"
                  required
                  value={formData.artist_name}
                  onChange={handleArtistInputChange}
                  onFocus={() => setShowArtistDropdown(true)}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.artist_name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter or select artist name"
                />
                {errors.artist_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.artist_name}
                  </p>
                )}

                {/* Artist Dropdown */}
                {showArtistDropdown && filteredArtists.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredArtists.map((artist, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectArtist(artist)}
                        className="w-full text-left px-3 py-2 text-gray-900 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                      >
                        {artist}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Medium */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medium/Material <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="medium"
                  required
                  value={formData.medium}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.medium ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Oil on canvas, Watercolor, Bronze, etc."
                />
                {errors.medium && (
                  <p className="text-red-500 text-xs mt-1">{errors.medium}</p>
                )}
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions <span className="text-red-500">*</span>
                </label>

                {/* Dimension Type Toggle */}
                <div className="mb-3">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="2d"
                        checked={dimensionType === "2d"}
                        onChange={(e) =>
                          setDimensionType(e.target.value as "2d" | "3d")
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">2D (W×H)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="3d"
                        checked={dimensionType === "3d"}
                        onChange={(e) =>
                          setDimensionType(e.target.value as "2d" | "3d")
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">3D (W×H×L)</span>
                    </label>
                  </div>
                </div>

                {/* Dimension Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Width (cm)"
                    value={dimensions.width}
                    onChange={(e) =>
                      handleDimensionChange("width", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Height (cm)"
                    value={dimensions.height}
                    onChange={(e) =>
                      handleDimensionChange("height", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {dimensionType === "3d" && (
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Length (cm)"
                      value={dimensions.length}
                      onChange={(e) =>
                        handleDimensionChange("length", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 col-span-2"
                    />
                  )}
                </div>

                {/* Preview dimensions */}
                {formData.dimensions && (
                  <p className="text-sm text-gray-600 mt-1">
                    Preview: {formData.dimensions}
                  </p>
                )}
                {errors.dimensions && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dimensions}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location in Collection <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location_in_collection"
                  required
                  value={formData.location_in_collection}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.location_in_collection
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., Living room wall, Storage room, Gallery wall"
                />
                {errors.location_in_collection && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.location_in_collection}
                  </p>
                )}
              </div>

              {/* Category - Two-Step Selection */}
              <div>
                <CategorySelector
                  categories={categories}
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                  error={errors.category_id}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                Additional Details
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Created
                </label>
                <input
                  type="number"
                  name="year_created"
                  min="1"
                  max={new Date().getFullYear()}
                  value={formData.year_created}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.year_created ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 2023"
                />
                {errors.year_created && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.year_created}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edition Number
                </label>
                <input
                  type="text"
                  name="edition_number"
                  value={formData.edition_number}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 5/100, AP, Unique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  name="condition_status"
                  value={formData.condition_status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {conditionOptions.map((condition) => (
                    <option
                      key={condition}
                      value={condition}
                      className="text-gray-900"
                    >
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="acquisition_price"
                  value={formData.acquisition_price}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.acquisition_price
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.acquisition_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.acquisition_price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="current_value"
                  value={formData.current_value}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.current_value ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.current_value && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.current_value}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Full-width fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provenance
              </label>
              <textarea
                name="provenance"
                rows={3}
                value={formData.provenance}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="History of ownership and exhibition history..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the artwork, style, subject matter..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes, conservation details, personal observations..."
              />
            </div>

            {/* Image Upload with Delete Functionality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload artwork images
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF, PDF up to 10MB each. First image will be
                      the primary image.
                    </span>

                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,application/pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <span className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Choose Files
                    </span>
                  </label>
                </div>
              </div>

              {/* Selected Images with Delete Option */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Selected Images ({selectedFiles.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedFiles.map((selectedFile, index) => (
                      <div key={selectedFile.id} className="relative group">
                        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          {selectedFile.isPDF ? (
                            // PDF Preview
                            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                              <svg
                                className="w-12 h-12 text-red-600 mb-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-xs text-red-600 font-medium">
                                PDF
                              </span>
                            </div>
                          ) : (
                            // Image Preview
                            <img
                              src={selectedFile.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeFile(selectedFile.id)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>

                          {/* Primary Badge */}
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>

                        <p
                          className="text-xs text-gray-600 mt-1 truncate"
                          title={selectedFile.file.name}
                        >
                          {selectedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Artwork"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
