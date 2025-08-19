// src/components/Dashboard.tsx
"use client";
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  GET_ARTWORKS,
  GET_CATEGORIES,
  GET_COLLECTION_STATS,
} from "@/lib/queries";
import ArtworkGrid from "./ArtworkGrid";
import { SearchBar } from "./SearchBar";
import FilterPanel from "./FilterPanel";
import StatsPanel from "./StatsPanel";
import AddArtworkModal from "./AddArtworkModal";
import ManagementModal from "./ManagementModal";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);

  const {
    data: artworksData,
    loading: artworksLoading,
    refetch: refetchArtworks,
  } = useQuery(GET_ARTWORKS, {
    variables: {
      filter: { ...filters, search: searchQuery || undefined },
      limit: 50,
      offset: 0,
    },
  });

  const { data: categoriesData, refetch: refetchCategories } =
    useQuery(GET_CATEGORIES);

  const { data: statsData, refetch: refetchStats } =
    useQuery(GET_COLLECTION_STATS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleArtworkAdded = () => {
    refetchArtworks();
    refetchStats();
    setShowAddModal(false);
  };

  const handleManagementUpdate = () => {
    refetchArtworks();
    refetchCategories();
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Art Collection Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Artwork
              </button>
              <button
                onClick={() => setShowManagementModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Manage
              </button>
              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Panel */}
        {statsData && <StatsPanel stats={statsData.collectionStats} />}

        {/* Search and Filters */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              categories={categoriesData?.categories || []}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Results */}
            <div className="mt-6">
              {artworksLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <ArtworkGrid
                  artworks={artworksData?.artworks || []}
                  totalCount={artworksData?.artworkCount || 0}
                  onArtworkUpdated={refetchArtworks}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Artwork Modal */}
      {showAddModal && (
        <AddArtworkModal
          onClose={() => setShowAddModal(false)}
          onArtworkAdded={handleArtworkAdded}
        />
      )}

      {/* Management Modal */}
      {showManagementModal && (
        <ManagementModal
          onClose={() => setShowManagementModal(false)}
          onUpdate={handleManagementUpdate}
        />
      )}
    </div>
  );
}
