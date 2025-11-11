import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ListItem, ShoppingList } from "./types";
import * as Storage from "./utils/storage";

// lightweight uuid generator
const uuidv4 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

export default function Index() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput | null>(null);

  // Rename modal state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameListId, setRenameListId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    (async () => {
      const loaded = await Storage.loadAllLists();
      setLists(loaded);
      if (loaded.length > 0) setActiveListId(loaded[0].id);
    })();
  }, []);

  useEffect(() => {
    // ensure there is an active list
    if (!activeListId && lists.length > 0) setActiveListId(lists[0].id);
  }, [lists, activeListId]);

  const activeList = lists.find((l) => l.id === activeListId) ?? null;

  async function saveList(updated: ShoppingList) {
    setLists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await Storage.saveList(updated); 
  }

  async function addList() {
    const name = `Ny liste ${lists.length + 1}`;
    const newList: ShoppingList = { id: uuidv4(), name, items: [] };
    const next = [newList, ...lists];
    setLists(next);
    setActiveListId(newList.id);
    await Storage.saveList(newList);
  }

  function showListActions(id: string, name: string) {
    Alert.alert(
      name,
      "Velg en handling:",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Endre navn",
          onPress: () => {
            setRenameListId(id);
            setRenameValue(name);
            setRenameModalVisible(true);
          },
        },
        {
          text: "Slett liste",
          style: "destructive",
          onPress: () => deleteList(id),
        },
      ]
    );
  }

  async function deleteList(id: string) {
    Alert.alert(
      "Slett liste",
      "Er du sikker?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett",
          style: "destructive",
          onPress: async () => {
            setLists((prev) => prev.filter((p) => p.id !== id));
            if (activeListId === id) setActiveListId(null);
            await Storage.deleteList(id);
          },
        },
      ]
    );
  }

  async function handleRename() {
    if (!renameValue.trim() || !renameListId) return;
    const list = lists.find((l) => l.id === renameListId);
    if (!list) return;
    const updated = { ...list, name: renameValue.trim() };
    await saveList(updated);
    setRenameModalVisible(false);
    setRenameListId(null);
    setRenameValue("");
  }

  async function addItem(textValue?: string) {
    const t = textValue ?? text;
    if (!t.trim() || !activeList) return;
    const item: ListItem = {
      id: uuidv4(),
      text: t.trim(),
      bought: false,
      createdAt: Date.now(),
    };
    const updated: ShoppingList = { ...activeList, items: [item, ...activeList.items] };
    setText("");
    inputRef.current?.focus();
    await saveList(updated);
  }

  async function toggleBought(itemId: string) {
    if (!activeList) return;
    const updatedItems = activeList.items.map((it: ListItem) => (it.id === itemId ? { ...it, bought: !it.bought } : it));
    // Re-sort to maintain bought items at bottom
    const notBought = updatedItems.filter((i) => !i.bought);
    const bought = updatedItems.filter((i) => i.bought);
    const sortedItems = [...notBought, ...bought];
    const updated: ShoppingList = { ...activeList, items: sortedItems };
    await saveList(updated);
  }

  async function reorderUnboughtItems(newOrder: ListItem[]) {
    if (!activeList) return;
    const boughtItems = activeList.items.filter((i) => i.bought);
    const updated: ShoppingList = { ...activeList, items: [...newOrder, ...boughtItems] };
    setLists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await Storage.saveList(updated);
  }

  async function reorderBoughtItems(newOrder: ListItem[]) {
    if (!activeList) return;
    const unboughtItems = activeList.items.filter((i) => !i.bought);
    const updated: ShoppingList = { ...activeList, items: [...unboughtItems, ...newOrder] };
    setLists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await Storage.saveList(updated);
  }

  function renderItem({ item, drag, isActive }: RenderItemParams<ListItem>) {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onPress={() => toggleBought(item.id)}
          onLongPress={drag}
          disabled={isActive}
          style={[styles.item, isActive && styles.itemDragging]}
        >
          <Text style={item.bought ? styles.itemBought : styles.itemText}>{item.text}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
      <View style={styles.listsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listsScroll}>
          {lists.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.listTab, activeListId === l.id && styles.listTabActive]}
              onPress={() => setActiveListId(l.id)}
              onLongPress={() => showListActions(l.id, l.name)}
            >
              <Text style={activeListId === l.id ? styles.listTabTextActive : styles.listTabText}>{l.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addList} onPress={addList}>
            <Text style={styles.addListText}>+ Ny liste</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={activeList ? `Legg til i ${activeList.name}` : "Velg eller opprett en liste"}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => addItem()}
          blurOnSubmit={false}
          returnKeyType="done"
        />
      </View>

      <View style={styles.listContainer}>
        {activeList ? (
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Unbought items section */}
            <View style={[styles.section]}>
              <DraggableFlatList
                data={activeList.items.filter((i) => !i.bought)}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                onDragEnd={({ data }) => reorderUnboughtItems(data)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ color: "#999" }}>Ingen elementer</Text>
                  </View>
                }
                scrollEnabled={false}
              />
            </View>

            {/* Bought items section */}
            {activeList.items.filter((i) => i.bought).length > 0 && (
              <View style={[styles.section, { marginTop: 16 }]}>
                <DraggableFlatList
                  data={activeList.items.filter((i) => i.bought)}
                  keyExtractor={(i) => i.id}
                  renderItem={renderItem}
                  onDragEnd={({ data }) => reorderBoughtItems(data)}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                  scrollEnabled={false}
                />
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={{ padding: 20 }}>
            <Text>Opprett en liste for å begynne.</Text>
          </View>
        )}
      </View>

      {/* Rename modal */}
      <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gi nytt navn til liste</Text>
            <TextInput
              style={styles.modalInput}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Skriv inn nytt navn"
              autoFocus
              onSubmitEditing={handleRename}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setRenameModalVisible(false);
                  setRenameListId(null);
                  setRenameValue("");
                }}
              >
                <Text style={styles.modalButtonText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleRename}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Lagre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  listsRow: { height: 56, borderBottomWidth: 1, borderColor: "#eee" },
  listsScroll: { alignItems: "center", paddingHorizontal: 12 },
  listTab: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 8, backgroundColor: "#f3f3f3" },
  listTabActive: { backgroundColor: "#4f83ff" },
  listTabText: { color: "#333" },
  listTabTextActive: { color: "#fff", fontWeight: "600" },
  addList: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#e6ffe6" },
  addListText: { color: "#066" },
  inputRow: { padding: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 },
  listContainer: { flex: 1 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#999", marginBottom: 8, paddingLeft: 4 },
  item: { padding: 12, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
  itemDragging: { opacity: 0.7, backgroundColor: "#f9f9ff", borderColor: "#4f83ff", borderWidth: 2 },
  itemText: { color: "#111" },
  itemBought: { color: "#999", textDecorationLine: "line-through" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%", maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16, color: "#333" },
  modalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  modalButtonCancel: { backgroundColor: "#f3f3f3" },
  modalButtonSave: { backgroundColor: "#4f83ff" },
  modalButtonText: { fontSize: 16, fontWeight: "500", color: "#333" },
  modalButtonTextSave: { color: "#fff" },
});
