import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const numColumns = 2;
const cardMargin = 10;
const cardSize = (width - 40 - cardMargin * (numColumns + 1)) / numColumns;
const SWIPE_THRESHOLD = cardSize * 0.4;

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), text: task, completed: false },
      ]);
      setTask("");
    }
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  const TaskCard = ({ item, onDelete, onToggle }) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

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

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    }));

    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.card,
            item.completed && styles.cardCompleted,
            animatedStyle,
          ]}
        >
          <View style={styles.cardContent}>
            <View style={[styles.checkbox, item.completed && styles.checked]}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[styles.taskText, item.completed && styles.completedText]}
              numberOfLines={4}
            >
              {item.text}
            </Text>
            <Text style={styles.swipeHint}>← Swipe to delete →</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  const renderItem = ({ item }) => (
    <TaskCard item={item} onDelete={deleteTask} onToggle={toggleTask} />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>My TODO List</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={task}
          onChangeText={setTask}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={tasks.length > 1 ? styles.row : null}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 50,
    marginLeft: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: cardMargin,
  },
  card: {
    width: cardSize,
    height: cardSize,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: cardMargin,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCompleted: {
    backgroundColor: "#e8f5e9",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    flex: 1,
    marginVertical: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  swipeHint: {
    fontSize: 10,
    color: "#bbb",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 50,
  },
});
