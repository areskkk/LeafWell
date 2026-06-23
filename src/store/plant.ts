import type { Plant } from "./types";

const PLANTS_KEY = "plants";
const VEGETABLE_CREATED_AT = "2026-03-12T00:00:00.000Z";

const defaultPlants: Plant[] = [
  {
    id: "1",
    name: "绿萝",
    species: "绿萝",
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop",
    status: "healthy",
    health: "good",
    location: "客厅",
    wateringFrequency: 7,
    lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextWatering: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "生长良好",
    description: "常见室内观叶植物，容易养护。",
    careLevel: "easy",
    lightNeeds: "medium",
    waterNeeds: "medium",
    temperature: { min: 15, max: 30 },
    humidity: 60,
    careTips: ["保持土壤适度湿润", "提供散射光", "定期擦拭叶片"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const readPlants = (): Plant[] | null => {
  const raw = localStorage.getItem(PLANTS_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const savePlants = (plants: Plant[]) => {
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
};

const normalizePlants = (plants: Plant[]) =>
  plants.map((plant) => {
    const name = String(plant.name || "");
    const species = String(plant.species || "");
    const isTarget =
      plant.id === "2" ||
      name.includes("娃娃菜") ||
      species.includes("娃娃菜") ||
      name.includes("多肉") ||
      species.includes("多肉");

    return isTarget ? { ...plant, createdAt: VEGETABLE_CREATED_AT } : plant;
  });

export const plantStore = (set: any, get: any) => ({
  plants: [] as Plant[],
  currentPlant: null as Plant | null,
  plantsLoading: false,

  fetchPlants: async () => {
    set({ plantsLoading: true });
    const storedPlants = readPlants();

    if (storedPlants !== null) {
      const plants = normalizePlants(storedPlants);
      savePlants(plants);
      set({ plants, plantsLoading: false });
      return;
    }

    savePlants(defaultPlants);
    set({ plants: defaultPlants, plantsLoading: false });
  },

  addPlant: async (plantData: Partial<Plant>) => {
    const currentPlants = get().plants?.length ? get().plants : readPlants() || [];
    const now = new Date().toISOString();
    const wateringFrequency = plantData.wateringFrequency || 7;
    const newPlant: Plant = {
      id: plantData.id || Date.now().toString(),
      name: plantData.name || "新植物",
      species: plantData.species || "未知",
      image:
        plantData.image ||
        "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=300&h=300&fit=crop",
      status: plantData.status || "healthy",
      health: plantData.health || "good",
      location: plantData.location || "客厅",
      wateringFrequency,
      lastWatered: plantData.lastWatered || now,
      nextWatering:
        plantData.nextWatering ||
        new Date(Date.now() + wateringFrequency * 24 * 60 * 60 * 1000).toISOString(),
      notes: plantData.notes || "",
      description: plantData.description,
      careLevel: plantData.careLevel,
      lightNeeds: plantData.lightNeeds,
      waterNeeds: plantData.waterNeeds,
      temperature: plantData.temperature,
      humidity: plantData.humidity,
      careTips: plantData.careTips,
      createdAt: plantData.createdAt || now,
      updatedAt: now,
    };

    const plants = [...currentPlants, newPlant];
    savePlants(plants);
    set({ plants });
    return newPlant;
  },

  updatePlant: async (id: string, plantData: Partial<Plant>) => {
    const currentPlants = get().plants?.length ? get().plants : readPlants() || [];
    const updatedAt = new Date().toISOString();
    const plants = currentPlants.map((plant: Plant) =>
      plant.id === id ? { ...plant, ...plantData, updatedAt } : plant
    );
    const currentPlant =
      get().currentPlant?.id === id
        ? { ...get().currentPlant, ...plantData, updatedAt }
        : get().currentPlant;

    savePlants(plants);
    set({ plants, currentPlant });
  },

  deletePlant: async (id: string) => {
    const currentPlants = get().plants?.length ? get().plants : readPlants() || [];
    const plants = currentPlants.filter((plant: Plant) => plant.id !== id);
    savePlants(plants);
    set({
      plants,
      currentPlant: get().currentPlant?.id === id ? null : get().currentPlant,
    });
  },

  setCurrentPlant: (plant: Plant | null) => {
    set({ currentPlant: plant });
  },

  fetchPlantById: async (id: string) => {
    const plants = get().plants?.length ? get().plants : readPlants() || [];
    const plant = plants.find((p: Plant) => p.id === id);
    if (!plant) {
      throw new Error("植物不存在");
    }
    set({ currentPlant: plant });
    return plant;
  },

  waterPlant: async (id: string) => {
    const currentPlants = get().plants?.length ? get().plants : readPlants() || [];
    const plants = currentPlants.map((plant: Plant) => {
      if (plant.id !== id) return plant;
      return {
        ...plant,
        lastWatered: new Date().toISOString(),
        nextWatering: new Date(
          Date.now() + plant.wateringFrequency * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    const currentPlant = get().currentPlant?.id === id
      ? plants.find((p: Plant) => p.id === id) || null
      : get().currentPlant;

    savePlants(plants);
    set({ plants, currentPlant });
  },

  updatePlantHealth: async (id: string, health: Plant["health"]) => {
    await get().updatePlant(id, { health });
  },
});
