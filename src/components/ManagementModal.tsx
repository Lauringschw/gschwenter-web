// Create src/components/ManagementModal.tsx

"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  TagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  GET_CATEGORIES,
  GET_ARTISTS,
  CREATE_CATEGORY,
  DELETE_CATEGORY,
} from "@/lib/queries";

interface ManagementModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function ManagementModal({
  onClose,
  onUpdate,
}: ManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "artists">(
    "categories"
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { data: categoriesData, refetch: refetchCategories } =
    useQuery(GET_CATEGORIES);
  const { data: artistsData, refetch: refetchArtists } = useQuery(GET_ARTISTS);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const categories = categoriesData?.categories || [];
  const artists = artistsData?.getArtists || [];

  // Organize categories by parent/child
  const mainCategories = categories.filter((cat: any) => !cat.parent_id);
  const subcategories = categories.filter((cat: any) => cat.parent_id);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      await createCategory({
        variables: {
          name: newCategoryName.trim(),
          parent_id: selectedParentId || undefined,
        },
      });

      setNewCategoryName("");
      setSelectedParentId("");
      refetchCategories();
      onUpdate();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Error creating category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory({
        variables: { id: categoryId },
      });

      refetchCategories();
      onUpdate();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category. It may be in use by artworks.");
    }
  };

  const getCategoryLevel = (category: any) => {
    return category.parent_id ? 1 : 0;
  };

  const getCategoryArtworkCount = (categoryId: string) => {
    // This would need to be implemented in the backend
    return 0; // Placeholder
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Manage Categories & Artists
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <TagIcon className="h-5 w-5 inline-block mr-2" />
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("artists")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "artists"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline-block mr-2" />
              Artists ({artists.length})
            </button>
          </nav>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add New Category Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Add New Category
              </h4>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category (Optional)
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">None (Main Category)</option>
                      {mainCategories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !newCategoryName.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {loading ? "Adding..." : "Add Category"}
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Existing Categories
              </h4>
              <div className="space-y-2">
                {/* Main Categories */}
                {mainCategories.map((category: any) => (
                  <div key={category.id}>
                    {/* Main Category */}
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-indigo-600 mr-3" />
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {category.name}
                          </h5>
                          <p className="text-sm text-gray-500">
                            Main category •{" "}
                            {getCategoryArtworkCount(category.id)} artworks
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteCategory(category.id, category.name)
                        }
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subcategories */}
                    {subcategories
                      .filter((sub: any) => sub.parent_id === category.id)
                      .map((subcategory: any) => (
                        <div
                          key={subcategory.id}
                          className="ml-8 flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded"
                        >
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-3 flex items-center justify-center">
                              <span className="text-gray-400">→</span>
                            </div>
                            <div>
                              <h6 className="text-sm font-medium text-gray-800">
                                {subcategory.name}
                              </h6>
                              <p className="text-xs text-gray-500">
                                {getCategoryArtworkCount(subcategory.id)}{" "}
                                artworks
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteCategory(
                                subcategory.id,
                                subcategory.name
                              )
                            }
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Delete subcategory"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No categories found. Add your first category above.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === "artists" && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Artist Information
              </h4>
              <p className="text-sm text-gray-600">
                Artists are automatically added when you create artworks. This
                list shows all artists in your collection. To remove an artist,
                you would need to delete or reassign all their artworks first.
              </p>
            </div>

            {/* Artists List */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Artists in Collection
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists.map((artist: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <UserGroupIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{artist}</h5>
                      <p className="text-sm text-gray-500">
                        {/* This would show artwork count - needs backend implementation */}
                        Artist
                      </p>
                    </div>
                  </div>
                ))}

                {artists.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No artists found. Artists will appear here after you add
                    artworks.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
