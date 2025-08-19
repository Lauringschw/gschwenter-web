'use client';

interface ArtworkDetailModalProps {
  artworkId: string;
  onClose: () => void;
  onArtworkUpdated: () => void;
}

export default function ArtworkDetailModal({ artworkId, onClose, onArtworkUpdated }: ArtworkDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Artwork Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Artwork details coming soon...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {artworkId}</p>
        </div>
      </div>
    </div>
  );
}
