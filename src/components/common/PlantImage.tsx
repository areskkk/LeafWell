import React, { useState } from "react";
import styles from "./PlantImage.module.css";
import { PLANT_IMAGES, isLegacyRemotePlantImage } from "../../utils/plantImages";

interface PlantImageProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const PlantImage: React.FC<PlantImageProps> = ({
  src,
  alt,
  className = "",
  style,
  width,
  height,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageSrc = src && !isLegacyRemotePlantImage(src) ? src : PLANT_IMAGES.default;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    setIsLoading(false);
    
    // 防止无限循环，只有在不是默认图片时才切换
    if (target.src !== PLANT_IMAGES.default) {
      target.src = PLANT_IMAGES.default;
      setHasError(false);
    } else {
      setHasError(true);
    }
    
    onError?.(e);
  };

  const containerStyle = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`${styles.plantImageContainer} ${className} ${
        isLoading ? styles.loading : ""
      } ${hasError ? styles.error : ""}`}
      style={containerStyle}
    >
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={styles.plantImage}
      />
      {isLoading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
      {hasError && (
        <div className={styles.errorIndicator}>
          <span className={styles.errorIcon}>🌱</span>
          <span className={styles.errorText}>图片加载失败</span>
        </div>
      )}
    </div>
  );
};

export default PlantImage;
