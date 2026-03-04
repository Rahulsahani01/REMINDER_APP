import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_KEY = "@myApp_tasks";
const ARCHIVED_TASKS_KEY = "@myApp_archived_tasks";

export const StorageKeys = {
  TASKS: TASKS_KEY,
  ARCHIVED_TASKS: ARCHIVED_TASKS_KEY,
};

export const saveTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error("Error saving tasks:", error);
    return false;
  }
};

export const loadTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
};

export const saveArchivedTasks = async (archivedTasks) => {
  try {
    const jsonValue = JSON.stringify(archivedTasks);
    await AsyncStorage.setItem(ARCHIVED_TASKS_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error("Error saving archived tasks:", error);
    return false;
  }
};

export const loadArchivedTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ARCHIVED_TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error loading archived tasks:", error);
    return [];
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([TASKS_KEY, ARCHIVED_TASKS_KEY]);
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
};
