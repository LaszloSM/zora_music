import { useState } from "react";
import { Music } from "lucide-react";

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = "", 
  fallbackIcon 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Si no hay src o hubo error, mostrar fallback
  if (!src || error || src.includes('placeholder')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-cyan-900/30 ${className}`}>
        {fallbackIcon || <Music className="w-1/2 h-1/2 text-gray-500" />}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-cyan-900/30 ${className}`}>
          <Music className="w-1/2 h-1/2 text-gray-500 animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}
