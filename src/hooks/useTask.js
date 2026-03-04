import { useState, useEffect, useCallback } from "react";
import {
  saveTasks,
  loadTasks,
  saveArchivedTasks,
  loadArchivedTasks,
} from "../utils/storage";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks on mount
  useEffect(() => {
    const loadAllTasks = async () => {
      setIsLoading(true);
      const [loadedTasks, loadedArchivedTasks] = await Promise.all([
        loadTasks(),
        loadArchivedTasks(),
      ]);
      setTasks(loadedTasks);
      setArchivedTasks(loadedArchivedTasks);
      setIsLoading(false);
    };

    loadAllTasks();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  // Save archived tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveArchivedTasks(archivedTasks);
    }
  }, [archivedTasks, isLoading]);

  const addTask = useCallback((newTask) => {
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const toggleTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const archiveTask = useCallback(
    (taskId) => {
      const taskToArchive = tasks.find((task) => task.id === taskId);
      if (taskToArchive) {
        setArchivedTasks((prev) => [
          ...prev,
          { ...taskToArchive, archivedAt: new Date().toISOString() },
        ]);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
    },
    [tasks],
  );

  const restoreTask = useCallback(
    (taskId) => {
      const taskToRestore = archivedTasks.find((task) => task.id === taskId);
      if (taskToRestore) {
        const { archivedAt, ...restoredTask } = taskToRestore;
        setTasks((prev) => [...prev, restoredTask]);
        setArchivedTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
    },
    [archivedTasks],
  );

  const permanentlyDeleteTask = useCallback((taskId) => {
    setArchivedTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const clearAllArchived = useCallback(() => {
    setArchivedTasks([]);
  }, []);

  return {
    tasks,
    archivedTasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    archiveTask,
    restoreTask,
    permanentlyDeleteTask,
    clearAllArchived,
  };
};
