import { Play } from "lucide-react";

interface VideoSectionProps {
  title: string;
  subtitle: string;
  videoUrl: string;
}

export function VideoSection({ title, subtitle, videoUrl }: VideoSectionProps) {
  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="w-full bg-black/[0.96] relative overflow-hidden rounded-xl shadow-2xl border-0 mb-16 animate-fade-in-up">
      <div className="p-8 md:p-12">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-100 to-green-900 tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Video Container */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-400/20 rounded-full blur-xl"></div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 md:mt-12">
          <p className="text-green-200/80 text-sm md:text-base mb-4">
            Ready to transform your job search?
          </p>
        </div>
      </div>
    </div>
  );
}
