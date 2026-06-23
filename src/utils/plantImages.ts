export const plantImageUrl = (fileName: string) =>
  `${import.meta.env.BASE_URL}images/${fileName}`;

export const PLANT_IMAGES = {
  default: plantImageUrl("plant-default.svg"),
  pothos: plantImageUrl("plant-pothos.svg"),
  succulent: plantImageUrl("plant-succulent.svg"),
};

export const isLegacyRemotePlantImage = (src?: string) =>
  Boolean(src && src.includes("images.unsplash.com"));
