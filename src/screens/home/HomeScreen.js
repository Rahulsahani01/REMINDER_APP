import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated,
{
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const numColumns = 2;
const cardMargin = 10;
const containerPadding = 20;
const cardGap = 12; // Gap between cards
const cardWidth = (width - containerPadding * 2 - cardGap) / numColumns;
const cardHeight = 140;
const SWIPE_THRESHOLD = cardWidth * 0.3;

// Light colors for cards
const LIGHT_COLORS = [
  "#FFE5E5", "#E5FFE5", "#E5E5FF", "#FFFFE5", "#FFE5FF", "#E5FFFF",
  "#FFF0E5", "#F0E5FF", "#E5FFF0", "#FFF5E5", "#E5F0FF", "#FFE5F0",
];

const getRandomLightColor = () => {
  return LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
};

// Detail types configuration
const DETAIL_TYPES = [
  { id: "paragraph", label: "📝 Paragraph", icon: "📝" },
  { id: "bullets", label: "• Bullets", icon: "•" },
  { id: "numbered", label: "1. Numbered", icon: "1." },
  { id: "checklist", label: "☑ Checklist", icon: "☑" },
];

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [viewArchivedTaskModal, setViewArchivedTaskModal] = useState(false);
  const [selectedArchivedTask, setSelectedArchivedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [detailType, setDetailType] = useState("paragraph");
  const [listItems, setListItems] = useState([""]);

  const openAddModal = () => {
    setNewTitle("");
    setNewDetails("");
    setDetailType("paragraph");
    setListItems([""]);
    setModalVisible(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTitle(task.title);
    setDetailType(task.details?.type || "paragraph");
    
    if (task.details?.type === "paragraph") {
      setNewDetails(task.details?.content || "");
      setListItems([""]);
    } else {
      setNewDetails("");
      setListItems(task.details?.content?.length > 0 ? [...task.details.content] : [""]);
    }
    
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingTask(null);
    setNewTitle("");
    setNewDetails("");
    setDetailType("paragraph");
    setListItems([""]);
  };

  const openArchiveModal = () => {
    setArchiveModalVisible(true);
  };

  const closeArchiveModal = () => {
    setArchiveModalVisible(false);
  };

  const openViewArchivedTask = (task) => {
    setSelectedArchivedTask(task);
    setViewArchivedTaskModal(true);
  };

  const closeViewArchivedTask = () => {
    setViewArchivedTaskModal(false);
    setSelectedArchivedTask(null);
  };

  const addListItem = () => {
    setListItems([...listItems, ""]);
  };

  const updateListItem = (index, value) => {
    const updated = [...listItems];
    updated[index] = value;
    setListItems(updated);
  };

  const removeListItem = (index) => {
    if (listItems.length > 1) {
      const updated = listItems.filter((_, i) => i !== index);
      setListItems(updated);
    }
  };

  const formatDetails = () => {
    if (detailType === "paragraph") {
      return { type: "paragraph", content: newDetails.trim() };
    }
    const filteredItems = listItems.filter((item) => item.trim() !== "");
    return { type: detailType, content: filteredItems };
  };

  const addTask = () => {
    if (newTitle.trim()) {
      const details = formatDetails();
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: newTitle.trim(),
          details: details,
          completed: false,
          color: getRandomLightColor(),
        },
      ]);
      setNewTitle("");
      setNewDetails("");
      setDetailType("paragraph");
      setListItems([""]);
      setModalVisible(false);
    }
  };

  const updateTask = () => {
    if (newTitle.trim() && editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: newTitle.trim(),
                details: formatDetails(),
              }
            : task
        )
      );
      closeEditModal();
    }
  };

  const deleteTaskFromEdit = () => {
    if (editingTask) {
      const taskToArchive = tasks.find((task) => task.id === editingTask.id);
      if (taskToArchive) {
        setArchivedTasks([
          ...archivedTasks,
          { ...taskToArchive, archivedAt: new Date().toISOString() },
        ]);
      }
      setTasks(tasks.filter((task) => task.id !== editingTask.id));
      closeEditModal();
    }
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const archiveTask = (id) => {
    const taskToArchive = tasks.find((task) => task.id === id);
    if (taskToArchive) {
      setArchivedTasks([
        ...archivedTasks,
        { ...taskToArchive, archivedAt: new Date().toISOString() },
      ]);
    }
    setTasks(tasks.filter((item) => item.id !== id));
  };

  const permanentlyDeleteTask = (id) => {
    setArchivedTasks(archivedTasks.filter((task) => task.id !== id));
    closeViewArchivedTask();
  };

  const clearAllArchived = () => {
    setArchivedTasks([]);
  };

  const restoreTask = (id) => {
    const taskToRestore = archivedTasks.find((task) => task.id === id);
    if (taskToRestore) {
      const { archivedAt, ...restoredTask } = taskToRestore;
      setTasks([...tasks, restoredTask]);
      setArchivedTasks(archivedTasks.filter((task) => task.id !== id));
    }
    closeViewArchivedTask();
  };

  const renderCardDetails = (details, completed) => {
    if (!details || !details.content || details.content.length === 0) return null;

    const textStyle = [styles.detailsText, completed && styles.completedText];

    if (details.type === "paragraph") {
      return (
        <Text style={textStyle} numberOfLines={2}>
          {details.content}
        </Text>
      );
    }

    const items = details.content.slice(0, 2);

    return (
      <View style={styles.listPreview}>
        {items.map((item, i) => (
          <Text key={i} style={textStyle} numberOfLines={1}>
            {details.type === "bullets" && "• "}
            {details.type === "numbered" && `${i + 1}. `}
            {details.type === "checklist" && "☐ "}
            {item}
          </Text>
        ))}
        {details.content.length > 2 && (
          <Text style={styles.moreText}>+{details.content.length - 2} more</Text>
        )}
      </View>
    );
  };

  const renderFullDetails = (details) => {
    if (!details || !details.content || details.content.length === 0) {
      return <Text style={styles.noDetailsText}>No details</Text>;
    }

    if (details.type === "paragraph") {
      return <Text style={styles.archivedDetailText}>{details.content}</Text>;
    }

    return (
      <View style={styles.archivedListContainer}>
        {details.content.map((item, i) => (
          <Text key={i} style={styles.archivedDetailText}>
            {details.type === "bullets" && "• "}
            {details.type === "numbered" && `${i + 1}. `}
            {details.type === "checklist" && "☐ "}
            {item}
          </Text>
        ))}
      </View>
    );
  };

  const TaskCard = ({ item, onDelete, onToggle, onEdit }) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd(() => {
        if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
          translateX.value = withTiming(
            translateX.value > 0 ? width : -width,
            { duration: 200 }
          );
          opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onDelete)(item.id);
          });
        } else {
          translateX.value = withSpring(0);
        }
      });

    const tapGesture = Gesture.Tap().onEnd(() => {
      runOnJS(onToggle)(item.id);
    });

    const longPressGesture = Gesture.LongPress()
      .minDuration(500)
      .onStart(() => {
        scale.value = withSpring(0.95);
      })
      .onEnd(() => {
        scale.value = withSpring(1);
        runOnJS(onEdit)(item);
      });

    const composedGesture = Gesture.Race(
      panGesture,
      Gesture.Exclusive(longPressGesture, tapGesture)
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: item.completed ? "#e8f5e9" : item.color },
            item.completed && styles.completedCard,
            animatedStyle,
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text
                style={[styles.titleText, item.completed && styles.completedTitle]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {item.details?.type && item.details.type !== "paragraph" && (
                <Text style={styles.typeIndicator}>
                  {DETAIL_TYPES.find(t => t.id === item.details.type)?.icon}
                </Text>
              )}
            </View>

            <View style={styles.cardBody}>
              {renderCardDetails(item.details, item.completed)}
            </View>

            <View style={styles.cardFooter}>
              {item.completed && (
                <Text style={styles.statusBadge}>✓ Done</Text>
              )}
              <Text style={styles.swipeHint}>Hold • Swipe</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  const renderItem = ({ item }) => (
    <TaskCard 
      item={item} 
      onDelete={archiveTask} 
      onToggle={toggleTask} 
      onEdit={openEditModal}
    />
  );

  const renderDetailInput = () => {
    if (detailType === "paragraph") {
      return (
        <TextInput
          style={[styles.modalInput, styles.detailsInput]}
          placeholder="Enter task details..."
          value={newDetails}
          onChangeText={setNewDetails}
          multiline={true}
          numberOfLines={3}
        />
      );
    }

    return (
      <View style={styles.listInputContainer}>
        <View style={styles.listScrollWrapper}>
          <ScrollView 
            style={styles.listScroll} 
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {listItems.map((item, index) => (
              <View key={`${detailType}-${index}`} style={styles.listItemRow}>
                <Text style={styles.listPrefix}>
                  {detailType === "bullets" && "•"}
                  {detailType === "numbered" && `${index + 1}.`}
                  {detailType === "checklist" && "☐"}
                </Text>
                <TextInput
                  style={styles.listItemInput}
                  placeholder={`Item ${index + 1}...`}
                  value={item}
                  onChangeText={(value) => updateListItem(index, value)}
                />
                {listItems.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeListItem(index)}
                    style={styles.removeItemBtn}
                  >
                    <Text style={styles.removeItemText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.addItemBtn} onPress={addListItem}>
          <Text style={styles.addItemText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderModal = (isEdit = false) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEdit ? editModalVisible : modalVisible}
      onRequestClose={isEdit ? closeEditModal : () => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>
              {isEdit ? "Edit Task" : "Add New Task"}
            </Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter task title..."
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus={!isEdit}
            />

            <Text style={styles.inputLabel}>Details Type</Text>
            <View style={styles.typeSelector}>
              {DETAIL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    detailType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    if (detailType !== type.id) {
                      const prevType = detailType;
                      setDetailType(type.id);
                      
                      if (type.id === "paragraph") {
                        setNewDetails("");
                      } else if (prevType === "paragraph") {
                        setListItems([""]);
                      }
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      detailType === type.id && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Details</Text>
            {renderDetailInput()}
          </ScrollView>

          <View style={styles.modalButtons}>
            {isEdit && (
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteTaskFromEdit}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, isEdit && styles.smallerButton]}
              onPress={isEdit ? closeEditModal : () => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                isEdit && styles.smallerButton,
                !newTitle.trim() && styles.disabledButton,
              ]}
              onPress={isEdit ? updateTask : addTask}
              disabled={!newTitle.trim()}
            >
              <Text style={styles.saveButtonText}>
                {isEdit ? "Update" : "Add Task"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderArchiveModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={archiveModalVisible}
      onRequestClose={closeArchiveModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.archiveModalContent}>
          <View style={styles.archiveHeader}>
            <Text style={styles.modalTitle}>📦 Archive</Text>
            <TouchableOpacity onPress={closeArchiveModal} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {archivedTasks.length === 0 ? (
            <View style={styles.emptyArchive}>
              <Text style={styles.emptyArchiveIcon}>📭</Text>
              <Text style={styles.emptyArchiveText}>No archived tasks</Text>
              <Text style={styles.emptyArchiveSubtext}>
                Swipe tasks to archive them
              </Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.archivedList}>
                {archivedTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.archivedCard, { backgroundColor: task.color }]}
                    onPress={() => openViewArchivedTask(task)}
                  >
                    <View style={styles.archivedCardContent}>
                      <Text style={styles.archivedTitle} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <Text style={styles.archivedDate}>
                        {new Date(task.archivedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.archivedArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={clearAllArchived}
              >
                <Text style={styles.clearAllText}>🗑️ Clear All</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderViewArchivedTaskModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={viewArchivedTaskModal}
      onRequestClose={closeViewArchivedTask}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.viewArchivedContent, { backgroundColor: selectedArchivedTask?.color || "#fff" }]}>
          <View style={styles.viewArchivedHeader}>
            <TouchableOpacity onPress={closeViewArchivedTask} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Back</Text>
            </TouchableOpacity>
          </View>

          {selectedArchivedTask && (
            <ScrollView style={styles.viewArchivedBody}>
              <Text style={styles.viewArchivedTitle}>
                {selectedArchivedTask.title}
              </Text>

              {selectedArchivedTask.completed && (
                <View style={styles.completedBadgeLarge}>
                  <Text style={styles.completedBadgeText}>✓ Completed</Text>
                </View>
              )}

              <Text style={styles.viewArchivedLabel}>Details</Text>
              <View style={styles.viewArchivedDetails}>
                {renderFullDetails(selectedArchivedTask.details)}
              </View>

              <Text style={styles.archivedAtText}>
                Archived on {new Date(selectedArchivedTask.archivedAt).toLocaleString()}
              </Text>
            </ScrollView>
          )}

          <View style={styles.viewArchivedActions}>
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={() => restoreTask(selectedArchivedTask?.id)}
            >
              <Text style={styles.restoreBtnText}>↩️ Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.permanentDeleteBtn}
              onPress={() => permanentlyDeleteTask(selectedArchivedTask?.id)}
            >
              <Text style={styles.permanentDeleteText}>🗑️ Delete Forever</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>My TODO List</Text>
        <TouchableOpacity style={styles.archiveBtn} onPress={openArchiveModal}>
          <Text style={styles.archiveBtnText}>📦</Text>
          {archivedTasks.length > 0 && (
            <View style={styles.archiveBadge}>
              <Text style={styles.archiveBadgeText}>{archivedTasks.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addTaskButton} onPress={openAddModal}>
        <Text style={styles.addTaskButtonText}>+ Add New Task</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
        }
      />

      {renderModal(false)}
      {renderModal(true)}
      {renderArchiveModal()}
      {renderViewArchivedTaskModal()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
    paddingHorizontal: containerPadding,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  archiveBtn: {
    position: "absolute",
    right: 0,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  archiveBtnText: {
    fontSize: 22,
  },
  archiveBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  archiveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  addTaskButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addTaskButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    gap: cardGap,
    marginBottom: cardMargin,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  completedCard: {
    borderColor: "#4CAF50",
    borderWidth: 1.5,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    flex: 1,
    lineHeight: 18,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#4CAF50",
  },
  typeIndicator: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  cardBody: {
    flex: 1,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 11,
    color: "#555",
    lineHeight: 16,
  },
  listPreview: {
    marginTop: 2,
  },
  moreText: {
    fontSize: 10,
    color: "#888",
    fontStyle: "italic",
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 9,
    color: "#4CAF50",
    fontWeight: "600",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  swipeHint: {
    fontSize: 8,
    color: "#aaa",
    marginLeft: "auto",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  detailsInput: {
    height: 80,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  typeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#666",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  listInputContainer: {
    marginBottom: 15,
  },
  listScrollWrapper: {
    maxHeight: 150,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  listScroll: {
    padding: 10,
    maxHeight: 150,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  listPrefix: {
    fontSize: 14,
    color: "#007AFF",
    width: 25,
    fontWeight: "bold",
  },
  listItemInput: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  removeItemBtn: {
    marginLeft: 8,
    padding: 5,
  },
  removeItemText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "bold",
  },
  addItemBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#e8f4ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  addItemText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  smallerButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    marginRight: 10,
    flex: 0.4,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  archiveModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
    maxHeight: "80%",
  },
  archiveHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
  closeBtnText: {
    fontSize: 20,
    color: "#999",
  },
  emptyArchive: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyArchiveIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyArchiveText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  emptyArchiveSubtext: {
    fontSize: 14,
    color: "#999",
  },
  archivedList: {
    maxHeight: 350,
  },
  archivedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  archivedCardContent: {
    flex: 1,
  },
  archivedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  archivedDate: {
    fontSize: 11,
    color: "#666",
  },
  archivedArrow: {
    fontSize: 24,
    color: "#999",
  },
  clearAllBtn: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: "#ffebee",
    borderRadius: 10,
    alignItems: "center",
  },
  clearAllText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "600",
  },
  viewArchivedContent: {
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
    maxHeight: "85%",
  },
  viewArchivedHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  viewArchivedBody: {
    flex: 1,
  },
  viewArchivedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 15,
  },
  completedBadgeLarge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  completedBadgeText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 13,
  },
  viewArchivedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  viewArchivedDetails: {
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  archivedDetailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  archivedListContainer: {
    gap: 5,
  },
  noDetailsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  archivedAtText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  viewArchivedActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  restoreBtn: {
    flex: 1,
    backgroundColor: "#e3f2fd",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  restoreBtnText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "600",
  },
  permanentDeleteBtn: {
    flex: 1,
    backgroundColor: "#ffebee",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  permanentDeleteText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "600",
  },
});
