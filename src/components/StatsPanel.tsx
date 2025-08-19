"use client";
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  TagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface CollectionStats {
  total_artworks: number;
  total_value: number;
  categories_count: number;
  artists_count: number;
  recent_acquisitions: Array<{
    id: string;
    title: string;
    artist_name: string;
    acquisition_date?: string;
    medium?: string;
    dimensions?: string;
    location_in_collection?: string;
    primary_image?: {
      image_path: string;
    };
  }>;
}

interface StatsPanelProps {
  stats: CollectionStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "No value recorded";
    return new Intl.NumberFormat("de-AT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const statCards = [
    {
      name: "Total Artworks",
      value: stats.total_artworks.toLocaleString(),
      icon: ChartBarIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Collection Value",
      value: formatPrice(stats.total_value),
      icon: CurrencyEuroIcon,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Categories",
      value: stats.categories_count.toString(),
      icon: TagIcon,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      name: "Artists",
      value: stats.artists_count.toString(),
      icon: UserGroupIcon,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Acquisitions */}
      {stats.recent_acquisitions && stats.recent_acquisitions.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Acquisitions
            </h3>
            <p className="text-sm text-gray-500">
              Your latest additions to the collection
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {stats.recent_acquisitions.map((artwork) => (
                <div key={artwork.id} className="group cursor-pointer">
                  <div className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden mb-2">
                    {artwork.primary_image?.image_path ? (
                      <img
                        src={`${
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:4000"
                        }${artwork.primary_image.image_path}`}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ChartBarIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4
                      className="text-sm font-medium text-gray-900 truncate"
                      title={artwork.title}
                    >
                      {artwork.title}
                    </h4>
                    <p
                      className="text-xs text-gray-600 truncate"
                      title={artwork.artist_name}
                    >
                      {artwork.artist_name}
                    </p>
                    {artwork.acquisition_date && (
                      <p className="text-xs text-gray-500">
                        {new Date(
                          artwork.acquisition_date
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
