import type { CarePlan, CareRecord, CareTask } from "./types";

const KEYS = {
  plans: "carePlans",
  records: "careRecords",
  tasks: "careTasks",
};

const readArray = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveArray = <T>(key: string, value: T[]) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const careStore = (set: any, get: any) => ({
  carePlans: [] as CarePlan[],
  careRecords: [] as CareRecord[],
  careTasks: [] as CareTask[],
  careLoading: false,

  fetchCarePlans: async () => {
    set({ careLoading: true });
    const carePlans = readArray<CarePlan>(KEYS.plans);
    saveArray(KEYS.plans, carePlans);
    set({ carePlans, careLoading: false });
  },

  fetchCareRecords: async () => {
    set({ careLoading: true });
    const careRecords = readArray<CareRecord>(KEYS.records);
    saveArray(KEYS.records, careRecords);
    set({ careRecords, careLoading: false });
  },

  fetchCareTasks: async () => {
    set({ careLoading: true });
    const careTasks = readArray<CareTask>(KEYS.tasks);
    saveArray(KEYS.tasks, careTasks);
    set({ careTasks, careLoading: false });
  },

  addCareTask: async (taskData: Partial<CareTask>) => {
    try {
      const newTask: CareTask = {
        id: Date.now().toString(),
        plantId: taskData.plantId || "",
        plantName: taskData.plantName || "",
        type: taskData.type || "water",
        title: taskData.title || "新任务",
        description: taskData.description || "",
        dueDate: taskData.dueDate || new Date().toISOString(),
        completed: taskData.completed || false,
        completedAt: taskData.completedAt,
        priority: taskData.priority || "medium",
        createdAt: taskData.createdAt || new Date().toISOString(),
      };

      const careTasks = [...readArray<CareTask>(KEYS.tasks), newTask];
      saveArray(KEYS.tasks, careTasks);
      set({ careTasks });
      return { success: true, data: newTask };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "添加任务失败",
      };
    }
  },

  updateCareTask: async (id: string, taskData: Partial<CareTask>) => {
    try {
      const careTasks = readArray<CareTask>(KEYS.tasks).map((task) =>
        task.id === id ? { ...task, ...taskData } : task
      );
      saveArray(KEYS.tasks, careTasks);
      set({ careTasks });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "更新任务失败",
      };
    }
  },

  completeCareTask: async (id: string) => {
    return get().updateCareTask(id, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  },

  deleteCareTask: async (id: string) => {
    try {
      const careTasks = readArray<CareTask>(KEYS.tasks).filter((task) => task.id !== id);
      saveArray(KEYS.tasks, careTasks);
      set({ careTasks });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "删除任务失败",
      };
    }
  },

  addCareRecord: async (recordData: Partial<CareRecord>) => {
    try {
      const newRecord: CareRecord = {
        id: Date.now().toString(),
        plantId: recordData.plantId || "",
        plantName: recordData.plantName || "",
        type: recordData.type || "water",
        title: recordData.title || "养护记录",
        description: recordData.description || "",
        completedAt: recordData.completedAt || new Date().toISOString(),
        notes: recordData.notes,
        images: recordData.images,
      };

      const careRecords = [...readArray<CareRecord>(KEYS.records), newRecord];
      saveArray(KEYS.records, careRecords);
      set({ careRecords });
      return { success: true, data: newRecord };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "添加记录失败",
      };
    }
  },

  deleteCareRecord: async (id: string) => {
    try {
      const careRecords = readArray<CareRecord>(KEYS.records).filter(
        (record) => record.id !== id
      );
      saveArray(KEYS.records, careRecords);
      set({ careRecords });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "删除记录失败",
      };
    }
  },

  generateCarePlan: async (plantId: string) => {
    try {
      const plant = get().plants?.find((p: any) => p.id === plantId);
      if (!plant) throw new Error("植物不存在");

      const newPlan: CarePlan = {
        id: Date.now().toString(),
        plantId,
        plantName: plant.name,
        tasks: [],
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      const carePlans = [...readArray<CarePlan>(KEYS.plans), newPlan];
      saveArray(KEYS.plans, carePlans);
      set({ carePlans });
      return newPlan;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "生成计划失败",
      };
    }
  },

  getTodayTasks: () => {
    const today = new Date().toISOString().split("T")[0];
    return readArray<CareTask>(KEYS.tasks).filter((task) => {
      const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
      return taskDate === today && !task.completed;
    });
  },

  getOverdueTasks: () => {
    const now = new Date();
    return readArray<CareTask>(KEYS.tasks).filter((task) => {
      return new Date(task.dueDate) < now && !task.completed;
    });
  },
});
