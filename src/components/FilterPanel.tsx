// src/components/FilterPanel.tsx
"use client";
import { useState, useCallback } from "react";
import CategorySelector from "./CategorySelector";

interface Category {
  id: string;
  name: string;
  parent_id?: string;
  children?: Category[];
}

interface FilterPanelProps {
  categories: Category[];
  onFilterChange: (filters: any) => void;
}

export default function FilterPanel({
  categories,
  onFilterChange,
}: FilterPanelProps) {
  const [filters, setFilters] = useState({
    category_id: "",
    condition_status: "",
    year_from: "",
    year_to: "",
    artist_name: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Remove empty filters
    const cleanFilters = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    }, {} as any);

    onFilterChange(cleanFilters);
  };

  const handleCategoryChange = (categoryId: string) => {
    handleFilterChange("category_id", categoryId);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category_id: "",
      condition_status: "",
      year_from: "",
      year_to: "",
      artist_name: "",
    };
    setFilters(emptyFilters);
    onFilterChange({});
  };

  const conditionOptions = ["Excellent", "Very Good", "Good", "Fair", "Poor"];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <CategorySelector
            categories={categories}
            value={filters.category_id}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Artist Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Artist
          </label>
          <input
            type="text"
            placeholder="Artist name..."
            value={filters.artist_name}
            onChange={(e) => handleFilterChange("artist_name", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            value={filters.condition_status}
            onChange={(e) =>
              handleFilterChange("condition_status", e.target.value)
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Conditions</option>
            {conditionOptions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        {/* Year Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year Created
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="From"
              value={filters.year_from}
              onChange={(e) => handleFilterChange("year_from", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="To"
              value={filters.year_to}
              onChange={(e) => handleFilterChange("year_to", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
