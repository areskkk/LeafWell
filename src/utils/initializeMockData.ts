import type { CareTask, Plant } from "../store/types";
import { PLANT_IMAGES, isLegacyRemotePlantImage } from "./plantImages";

const STORAGE_KEYS = {
  seeded: "greenly:mockDataSeeded",
  plants: "plants",
  careTasks: "careTasks",
  careRecords: "careRecords",
  carePlans: "carePlans",
};

const VEGETABLE_CREATED_AT = "2026-03-12T00:00:00.000Z";

const mockPlants: Plant[] = [
  {
    id: "1",
    name: "绿萝",
    species: "绿萝",
    location: "客厅",
    wateringFrequency: 3,
    description: "喜欢散射光，保持土壤微湿。",
    image: PLANT_IMAGES.pothos,
    careLevel: "easy",
    lightNeeds: "medium",
    waterNeeds: "medium",
    temperature: { min: 15, max: 30 },
    humidity: 60,
    careTips: ["保持土壤微湿", "避免阳光直射", "定期清洁叶片"],
    status: "healthy",
    health: "good",
    lastWatered: "2024-01-14T10:30:00Z",
    nextWatering: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "多肉",
    species: "多肉植物",
    location: "阳台",
    wateringFrequency: 7,
    description: "耐旱，少量浇水，保持通风。",
    image: PLANT_IMAGES.succulent,
    careLevel: "easy",
    lightNeeds: "high",
    waterNeeds: "low",
    temperature: { min: 10, max: 35 },
    humidity: 40,
    careTips: ["少量浇水", "充足光照", "通风良好"],
    status: "healthy",
    health: "excellent",
    lastWatered: "2024-01-12T14:00:00Z",
    nextWatering: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: VEGETABLE_CREATED_AT,
    updatedAt: VEGETABLE_CREATED_AT,
  },
];

const mockCareTasks: CareTask[] = [
  {
    id: "1",
    plantId: "1",
    plantName: "绿萝",
    type: "water",
    title: "给绿萝浇水",
    description: "检查土壤湿度，适量浇水。",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: "medium",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

const hasKey = (key: string) => localStorage.getItem(key) !== null;

const setJsonIfMissing = (key: string, value: unknown) => {
  if (!hasKey(key)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const migrateVegetableCreatedAt = () => {
  const rawPlants = localStorage.getItem(STORAGE_KEYS.plants);
  if (!rawPlants) return;

  try {
    const plants = JSON.parse(rawPlants);
    if (!Array.isArray(plants)) return;

    let changed = false;
    const updatedPlants = plants.map((plant: Plant) => {
      const name = String(plant.name || "");
      const species = String(plant.species || "");
      const isTarget =
        plant.id === "2" ||
        name.includes("娃娃菜") ||
        species.includes("娃娃菜") ||
        name.includes("多肉") ||
        species.includes("多肉");

      const image = isLegacyRemotePlantImage(plant.image)
        ? isTarget
          ? PLANT_IMAGES.succulent
          : PLANT_IMAGES.pothos
        : plant.image || PLANT_IMAGES.default;

      if (image !== plant.image || (isTarget && plant.createdAt !== VEGETABLE_CREATED_AT)) {
        changed = true;
      }

      return {
        ...plant,
        image,
        ...(isTarget ? { createdAt: VEGETABLE_CREATED_AT } : {}),
      };
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(updatedPlants));
    }
  } catch {
    // Ignore malformed local data; fetchPlants will handle it.
  }
};

export const initializeMockCareData = () => {
  const hasAnyData =
    hasKey(STORAGE_KEYS.plants) ||
    hasKey(STORAGE_KEYS.careTasks) ||
    hasKey(STORAGE_KEYS.careRecords) ||
    hasKey(STORAGE_KEYS.carePlans);

  if (!hasAnyData && !hasKey(STORAGE_KEYS.seeded)) {
    localStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(mockPlants));
    localStorage.setItem(STORAGE_KEYS.careTasks, JSON.stringify(mockCareTasks));
  }

  setJsonIfMissing(STORAGE_KEYS.plants, []);
  setJsonIfMissing(STORAGE_KEYS.careTasks, []);
  setJsonIfMissing(STORAGE_KEYS.careRecords, []);
  setJsonIfMissing(STORAGE_KEYS.carePlans, []);
  migrateVegetableCreatedAt();
  localStorage.setItem(STORAGE_KEYS.seeded, "true");
};

export const resetMockData = () => {
  localStorage.removeItem(STORAGE_KEYS.plants);
  localStorage.removeItem(STORAGE_KEYS.careTasks);
  localStorage.removeItem(STORAGE_KEYS.careRecords);
  localStorage.removeItem(STORAGE_KEYS.carePlans);
  localStorage.removeItem(STORAGE_KEYS.seeded);
};
