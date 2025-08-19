"use client";
import { useState } from "react";
import Image from "next/image";
import ArtworkDetailModal from "./ArtworkDetailModal";

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

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat("de-AT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/placeholder-artwork.jpg";
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    }${imagePath}`;
  };

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
                {isPDF(artwork.primary_image?.image_path) ? (
                  // PDF Display
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                    <svg
                      className="w-16 h-16 text-red-600 mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-red-600 font-medium">
                      PDF Document
                    </span>
                  </div>
                ) : (
                  // Image Display
                  <Image
                    src={getImageUrl(artwork.primary_image?.image_path)}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                )}
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
