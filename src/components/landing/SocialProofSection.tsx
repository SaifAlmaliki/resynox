interface SocialProofSectionProps {
  title: string;
  subtitle: string;
  logos: string[];
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export function SocialProofSection({ title, subtitle, logos, stats }: SocialProofSectionProps) {
  return (
    <div className="mb-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-md animate-fade-in-up border border-gray-200 dark:border-gray-700" style={{ animationDelay: '1s' }}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Company Logos */}
      <div className="mb-12">
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          {logos.map((logo, index) => (
            <div key={index} className="text-gray-400 dark:text-gray-500 font-bold text-lg">
              {logo}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-800 dark:text-green-100 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
