interface Stat {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: Stat[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger-container">
        {stats.map((stat, index) => (
          <div key={index} className="stagger-item" style={{ '--item-index': index } as any}>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stat.value}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 