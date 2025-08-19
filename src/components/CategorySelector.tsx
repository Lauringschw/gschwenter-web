// Create src/components/CategorySelector.tsx

"use client";
import { useState, useEffect, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  parent_id?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  required?: boolean;
}

export default function CategorySelector({
  categories,
  value,
  onChange,
  error,
  required,
}: CategorySelectorProps) {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<
    Category[]
  >([]);

  // Memoize the separated categories to prevent recreating on every render
  const { mainCategories, subcategoriesMap } = useMemo(() => {
    const main = categories.filter((cat) => !cat.parent_id);
    const subcategoriesMap = new Map<string, Category[]>();

    categories.forEach((cat) => {
      if (cat.parent_id) {
        if (!subcategoriesMap.has(cat.parent_id)) {
          subcategoriesMap.set(cat.parent_id, []);
        }
        subcategoriesMap.get(cat.parent_id)!.push(cat);
      }
    });

    return { mainCategories: main, subcategoriesMap };
  }, [categories]);

  // Find which main category is selected based on current value
  useEffect(() => {
    if (value) {
      const selectedCategory = categories.find((cat) => cat.id === value);
      if (selectedCategory) {
        if (selectedCategory.parent_id) {
          // If a subcategory is selected, find its parent
          setSelectedMainCategory(selectedCategory.parent_id);
        } else {
          // If a main category is selected
          setSelectedMainCategory(value);
        }
      }
    } else {
      setSelectedMainCategory("");
    }
  }, [value, categories]);

  // Update available subcategories when main category changes
  useEffect(() => {
    if (selectedMainCategory) {
      const subs = subcategoriesMap.get(selectedMainCategory) || [];
      setAvailableSubcategories(subs);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedMainCategory, subcategoriesMap]);

  const handleMainCategoryChange = (mainCategoryId: string) => {
    setSelectedMainCategory(mainCategoryId);

    // Check if this main category has subcategories
    const hasSubcategories = subcategoriesMap.has(mainCategoryId);

    if (!hasSubcategories) {
      // If no subcategories, select the main category directly
      onChange(mainCategoryId);
    } else {
      // If has subcategories, clear the selection and wait for subcategory selection
      onChange("");
    }
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    onChange(subcategoryId);
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Main Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main Category {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedMainCategory}
          onChange={(e) => handleMainCategoryChange(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          required={required}
        >
          <option value="">Choose main category...</option>
          {mainCategories.map((category) => (
            <option
              key={category.id}
              value={category.id}
              className="text-gray-900"
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Subcategory Selection (if available) */}
      {selectedMainCategory && availableSubcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            required={required}
          >
            <option value="">Choose specific type...</option>
            {availableSubcategories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                className="text-gray-900"
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Category Display */}
      {value && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
          <div className="text-sm text-indigo-800">
            <span className="font-medium">Selected:</span>{" "}
            {(() => {
              const selectedCategory = categories.find(
                (cat) => cat.id === value
              );
              if (selectedCategory?.parent_id) {
                const parentCategory = categories.find(
                  (cat) => cat.id === selectedCategory.parent_id
                );
                return `${parentCategory?.name} → ${selectedCategory.name}`;
              }
              return selectedCategory?.name;
            })()}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
