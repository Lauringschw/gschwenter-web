"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  DocumentIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  GET_ARTWORK,
  UPDATE_ARTWORK,
  DELETE_ARTWORK,
  GET_CATEGORIES,
  ADD_IMAGE_TO_ARTWORK,
  REMOVE_IMAGE_FROM_ARTWORK,
  SET_PRIMARY_IMAGE,
} from "@/lib/queries";
import CategorySelector from "./CategorySelector";
import PDFViewer from "./PDFViewer";
import Cookies from "js-cookie";

interface ArtworkDetailModalProps {
  artworkId: string;
  onClose: () => void;
  onArtworkUpdated: () => void;
}

interface ArtworkImage {
  id: string;
  image_path: string;
  image_name: string;
  is_primary: boolean;
  file_type?: string;
  mime_type?: string;
  thumbnail_path?: string;
}

interface Artwork {
  id: string;
  title: string;
  artist_name: string;
  year_created?: number;
  medium: string;
  dimensions: string;
  edition_number?: string;
  provenance?: string;
  condition_status?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  current_value?: number;
  location_in_collection: string;
  category?: {
    id: string;
    name: string;
  };
  description?: string;
  notes?: string;
  images: ArtworkImage[];
  primary_image?: ArtworkImage;
  created_at: string;
  updated_at: string;
}

export default function ArtworkDetailModal({
  artworkId,
  onClose,
  onArtworkUpdated,
}: ArtworkDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const {
    data: artworkData,
    loading: artworkLoading,
    refetch,
  } = useQuery(GET_ARTWORK, {
    variables: { id: artworkId },
    onCompleted: (data) => {
      if (data?.artwork) {
        setEditFormData({
          title: data.artwork.title,
          artist_name: data.artwork.artist_name,
          year_created: data.artwork.year_created?.toString() || "",
          medium: data.artwork.medium,
          dimensions: data.artwork.dimensions,
          edition_number: data.artwork.edition_number || "",
          provenance: data.artwork.provenance || "",
          condition_status: data.artwork.condition_status || "Good",
          acquisition_date: data.artwork.acquisition_date || "",
          acquisition_price: data.artwork.acquisition_price?.toString() || "",
          current_value: data.artwork.current_value?.toString() || "",
          location_in_collection: data.artwork.location_in_collection,
          category_id: data.artwork.category?.id || "",
          description: data.artwork.description || "",
          notes: data.artwork.notes || "",
        });
      }
    },
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  const [updateArtwork] = useMutation(UPDATE_ARTWORK);
  const [deleteArtwork] = useMutation(DELETE_ARTWORK);
  const [addImage] = useMutation(ADD_IMAGE_TO_ARTWORK);
  const [removeImage] = useMutation(REMOVE_IMAGE_FROM_ARTWORK);
  const [setPrimaryImage] = useMutation(SET_PRIMARY_IMAGE);

  const artwork: Artwork | null = artworkData?.artwork || null;
  const categories = categoriesData?.categories || [];

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat("de-AT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getImageUrl = (imagePath: string) => {
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    }${imagePath}`;
  };

  const isPDF = (image: ArtworkImage) => {
    return (
      image.file_type === "pdf" ||
      image.mime_type === "application/pdf" ||
      image.image_path.toLowerCase().endsWith(".pdf")
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data
    if (artwork) {
      setEditFormData({
        title: artwork.title,
        artist_name: artwork.artist_name,
        year_created: artwork.year_created?.toString() || "",
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        edition_number: artwork.edition_number || "",
        provenance: artwork.provenance || "",
        condition_status: artwork.condition_status || "Good",
        acquisition_date: artwork.acquisition_date || "",
        acquisition_price: artwork.acquisition_price?.toString() || "",
        current_value: artwork.current_value?.toString() || "",
        location_in_collection: artwork.location_in_collection,
        category_id: artwork.category?.id || "",
        description: artwork.description || "",
        notes: artwork.notes || "",
      });
    }
  };

  const handleSave = async () => {
    if (!artwork) return;

    setLoading(true);
    try {
      const updateInput = {
        ...editFormData,
        year_created: editFormData.year_created
          ? parseInt(editFormData.year_created)
          : undefined,
        acquisition_price: editFormData.acquisition_price
          ? parseFloat(editFormData.acquisition_price)
          : undefined,
        current_value: editFormData.current_value
          ? parseFloat(editFormData.current_value)
          : undefined,
        category_id: editFormData.category_id || undefined,
      };

      await updateArtwork({
        variables: {
          id: artwork.id,
          input: updateInput,
        },
      });

      setIsEditing(false);
      refetch();
      onArtworkUpdated();
    } catch (error) {
      console.error("Error updating artwork:", error);
      alert("Error updating artwork. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!artwork) return;

    if (
      !confirm(
        `Are you sure you want to delete "${artwork.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteArtwork({
        variables: { id: artwork.id },
      });

      onArtworkUpdated();
      onClose();
    } catch (error) {
      console.error("Error deleting artwork:", error);
      alert("Error deleting artwork. Please try again.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !artwork) return;

    setLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("image", file);

        const token = Cookies.get("auth-token");
        const uploadResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
          }/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadResult = await uploadResponse.json();

        await addImage({
          variables: {
            artwork_id: artwork.id,
            image_path: uploadResult.path,
            image_name: uploadResult.originalName,
            is_primary: artwork.images.length === 0, // First image is primary if no images exist
            file_type: uploadResult.isPDF ? "pdf" : "image",
            mime_type: uploadResult.fileType,
            thumbnail_path: uploadResult.thumbnailPath,
          },
        });
      }

      refetch();
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Error uploading images. Please try again.");
    } finally {
      setLoading(false);
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to remove this image?")) {
      return;
    }

    try {
      await removeImage({
        variables: { id: imageId },
      });
      refetch();
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Error removing image. Please try again.");
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await setPrimaryImage({
        variables: { id: imageId },
      });
      refetch();
    } catch (error) {
      console.error("Error setting primary image:", error);
      alert("Error setting primary image. Please try again.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setEditFormData((prev: any) => ({ ...prev, category_id: categoryId }));
  };

  if (artworkLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading artwork...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="text-center py-8">
            <p className="text-red-500">Artwork not found</p>
          </div>
        </div>
      </div>
    );
  }

  const conditionOptions = [
    "Excellent",
    "Very Good",
    "Good",
    "Fair",
    "Poor",
    "Needs Restoration",
  ];

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Artwork" : "Artwork Details"}
            </h3>
            <div className="flex space-x-2">
              {!isEditing && (
                <>
                  <button
                    onClick={handleEdit}
                    className="text-indigo-600 hover:text-indigo-800 p-2"
                    title="Edit artwork"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete artwork"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div>
              {/* Main Image/PDF Display */}
              <div className="mb-4">
                {artwork.images.length > 0 ? (
                  <div className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden">
                    {isPDF(artwork.images[selectedImageIndex]) ? (
                      <PDFViewer
                        pdfUrl={getImageUrl(
                          artwork.images[selectedImageIndex].image_path
                        )}
                        title={artwork.images[selectedImageIndex].image_name}
                      />
                    ) : (
                      <img
                        src={getImageUrl(
                          artwork.images[selectedImageIndex].image_path
                        )}
                        alt={artwork.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowImageViewer(true)}
                      />
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {artwork.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {artwork.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`aspect-square relative bg-gray-200 rounded cursor-pointer border-2 ${
                        selectedImageIndex === index
                          ? "border-indigo-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      {isPDF(image) ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <DocumentIcon className="h-8 w-8 text-red-600" />
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(
                            image.thumbnail_path || image.image_path
                          )}
                          alt={`${artwork.title} ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                      {image.is_primary && (
                        <div className="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Image Management */}
              {isEditing && (
                <div className="space-y-4">
                  {/* Upload New Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,application/pdf"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>

                  {/* Manage Existing Images */}
                  {artwork.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manage Images
                      </label>
                      <div className="space-y-2">
                        {artwork.images.map((image) => (
                          <div
                            key={image.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                {isPDF(image) ? (
                                  <div className="w-full h-full flex items-center justify-center bg-red-50">
                                    <DocumentIcon className="h-6 w-6 text-red-600" />
                                  </div>
                                ) : (
                                  <img
                                    src={getImageUrl(
                                      image.thumbnail_path || image.image_path
                                    )}
                                    alt={image.image_name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {image.image_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {image.is_primary
                                    ? "Primary image"
                                    : "Secondary image"}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!image.is_primary && (
                                <button
                                  onClick={() =>
                                    handleSetPrimaryImage(image.id)
                                  }
                                  className="text-indigo-600 hover:text-indigo-800 text-xs"
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveImage(image.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {isEditing ? (
                /* Edit Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Artist <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="artist_name"
                        value={editFormData.artist_name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medium <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="medium"
                        value={editFormData.medium}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={editFormData.dimensions}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location_in_collection"
                        value={editFormData.location_in_collection}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Created
                      </label>
                      <input
                        type="number"
                        name="year_created"
                        value={editFormData.year_created}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        name="condition_status"
                        value={editFormData.condition_status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {conditionOptions.map((condition) => (
                          <option key={condition} value={condition}>
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
                        value={editFormData.acquisition_date}
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
                        name="acquisition_price"
                        value={editFormData.acquisition_price}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Value (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="current_value"
                        value={editFormData.current_value}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <CategorySelector
                      categories={categories}
                      value={editFormData.category_id}
                      onChange={handleCategoryChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={editFormData.description}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={editFormData.notes}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {artwork.title}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {artwork.artist_name}
                    </p>
                    {artwork.year_created && (
                      <p className="text-gray-500">{artwork.year_created}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Medium
                      </h3>
                      <p className="text-gray-900">{artwork.medium}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Dimensions
                      </h3>
                      <p className="text-gray-900">{artwork.dimensions}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Location
                      </h3>
                      <p className="text-gray-900">
                        {artwork.location_in_collection}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Category
                      </h3>
                      <p className="text-gray-900">
                        {artwork.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    {artwork.condition_status && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Condition
                        </h3>
                        <p className="text-gray-900">
                          {artwork.condition_status}
                        </p>
                      </div>
                    )}
                    {artwork.edition_number && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Edition
                        </h3>
                        <p className="text-gray-900">
                          {artwork.edition_number}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Financial Information */}
                  {(artwork.acquisition_price || artwork.current_value) && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {artwork.acquisition_price && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Acquisition Price
                            </h4>
                            <p className="text-gray-900">
                              {formatPrice(artwork.acquisition_price)}
                            </p>
                            {artwork.acquisition_date && (
                              <p className="text-xs text-gray-500">
                                on{" "}
                                {new Date(
                                  artwork.acquisition_date
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        {artwork.current_value && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Current Value
                            </h4>
                            <p className="text-green-600 font-semibold">
                              {formatPrice(artwork.current_value)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {artwork.description && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {artwork.description}
                      </p>
                    </div>
                  )}

                  {/* Provenance */}
                  {artwork.provenance && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Provenance
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {artwork.provenance}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {artwork.notes && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Notes
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {artwork.notes}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Record Information
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        Created:{" "}
                        {new Date(artwork.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        Last updated:{" "}
                        {new Date(artwork.updated_at).toLocaleDateString()}
                      </p>
                      <p>Artwork ID: {artwork.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons for Edit Mode */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer &&
        artwork.images.length > 0 &&
        !isPDF(artwork.images[selectedImageIndex]) && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-60 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageViewer(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
              <img
                src={getImageUrl(artwork.images[selectedImageIndex].image_path)}
                alt={artwork.title}
                className="max-w-full max-h-full object-contain"
              />
              {artwork.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {artwork.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        selectedImageIndex === index
                          ? "bg-white"
                          : "bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
