"use client";
import { useState } from "react";
import ArtworkDetailModal from "./ArtworkDetailModal";
import { PhotoIcon, DocumentIcon } from "@heroicons/react/24/outline";

interface Artwork {
  id: string;
  title: string;
  artist_name: string;
  year_created?: number;
  medium?: string;
  dimensions?: string;
  condition_status?: string;
  acquisition_price?: number;
  current_value?: number;
  location_in_collection?: string;
  category?: {
    id: string;
    name: string;
  };
  primary_image?: {
    id: string;
    image_path: string;
    image_name: string;
  };
  created_at: string;
}

interface ArtworkGridProps {
  artworks: Artwork[];
  totalCount: number;
  onArtworkUpdated: () => void;
}

const isPDF = (imagePath?: string) => {
  return imagePath?.toLowerCase().endsWith(".pdf") || false;
};

export default function ArtworkGrid({
  artworks,
  totalCount,
  onArtworkUpdated,
}: ArtworkGridProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat("de-AT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    }${imagePath}`;
  };

  const handleImageError = (artworkId: string) => {
    console.log(`Image error for artwork ${artworkId}`);
    setImageErrors((prev) => new Set([...prev, artworkId]));
  };

  const renderArtworkImage = (artwork: Artwork) => {
    const imageUrl = getImageUrl(artwork.primary_image?.image_path);
    const hasImageError = imageErrors.has(artwork.id);

    console.log(`Rendering image for artwork ${artwork.id}:`, {
      hasImage: !!artwork.primary_image,
      imagePath: artwork.primary_image?.image_path,
      imageUrl,
      hasError: hasImageError,
    });

    // No image available or image failed to load
    if (!imageUrl || hasImageError || !artwork.primary_image) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <PhotoIcon className="h-16 w-16 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 font-medium">No Image</span>
        </div>
      );
    }

    // PDF file
    if (isPDF(artwork.primary_image.image_path)) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
          <DocumentIcon className="w-16 h-16 text-red-600 mb-2" />
          <span className="text-sm text-red-600 font-medium">PDF Document</span>
        </div>
      );
    }

    // Regular image using standard img tag (not Next.js Image)
    return (
      <img
        src={imageUrl}
        alt={artwork.title}
        className="w-full h-full object-cover"
        onError={() => handleImageError(artwork.id)}
        onLoad={() =>
          console.log(`Image loaded successfully for artwork ${artwork.id}`)
        }
      />
    );
  };

  console.log("ArtworkGrid rendering:", {
    artworkCount: artworks.length,
    totalCount,
    firstArtwork: artworks[0],
  });

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Collection ({totalCount} {totalCount === 1 ? "artwork" : "artworks"})
        </h2>
      </div>

      {artworks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No artworks found</div>
          <p className="text-gray-400 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedArtwork(artwork.id)}
            >
              {/* Image */}
              <div className="aspect-square relative bg-gray-200">
                {renderArtworkImage(artwork)}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 truncate"
                  title={artwork.title}
                >
                  {artwork.title}
                </h3>
                <p
                  className="text-gray-600 text-sm truncate"
                  title={artwork.artist_name}
                >
                  {artwork.artist_name}
                </p>

                <div className="mt-2 space-y-1">
                  {artwork.year_created && (
                    <p className="text-gray-500 text-xs">
                      {artwork.year_created}
                    </p>
                  )}
                  {artwork.medium && (
                    <p
                      className="text-gray-500 text-xs truncate"
                      title={artwork.medium}
                    >
                      {artwork.medium}
                    </p>
                  )}
                  {artwork.category && (
                    <p className="text-indigo-600 text-xs">
                      {artwork.category.name}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex justify-between items-center">
                  {artwork.current_value && (
                    <span className="text-green-600 font-semibold text-sm">
                      {formatPrice(artwork.current_value)}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      artwork.condition_status === "Excellent"
                        ? "bg-green-100 text-green-800"
                        : artwork.condition_status === "Very Good"
                        ? "bg-blue-100 text-blue-800"
                        : artwork.condition_status === "Good"
                        ? "bg-yellow-100 text-yellow-800"
                        : artwork.condition_status === "Fair"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {artwork.condition_status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artworkId={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onArtworkUpdated={onArtworkUpdated}
        />
      )}
    </>
  );
}
