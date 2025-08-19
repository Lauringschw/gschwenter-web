'use client';
import { ChartBarIcon, CurrencyEuroIcon, TagIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const statCards = [
    {
      name: 'Total Artworks',
      value: stats.total_artworks.toLocaleString(),
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Collection Value',
      value: formatPrice(stats.total_value),
      icon: CurrencyEuroIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Categories',
      value: stats.categories_count.toString(),
      icon: TagIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Artists',
      value: stats.artists_count.toString(),
      icon: UserGroupIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-6 w-6 text-white p-1 rounded ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
