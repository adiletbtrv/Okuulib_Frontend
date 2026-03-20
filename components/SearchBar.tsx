import { colors, radius, spacing, typography } from "@/constants/theme";
import { useSearchBooks } from "@/hooks/useSearchBooks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SearchResultCard from "./SearchResultCard";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Props {
  onSearchStatusChange?: (isSearching: boolean) => void;
}

export default function SearchBar({ onSearchStatusChange }: Props) {
  const [query, setQuery] = useState("");
  const { items, search, clear, loading } = useSearchBooks();
  const lastQuery = useRef("");

  const handleChange = async (text: string) => {
    setQuery(text);
    lastQuery.current = text;

    if (!text.trim()) {
      clear();
      onSearchStatusChange?.(false);
      return;
    }

    onSearchStatusChange?.(true);
    await search(text);

    if (lastQuery.current !== text) {
      clear();
    }
  };

  const handleClear = () => {
    setQuery("");
    clear();
    onSearchStatusChange?.(false);
  };

  const noResults = query.trim() !== "" && !loading && items.length === 0;
  const showResults = items.length > 0 || loading || noResults;

  return (
    <View style={s.root}>
      {/* ─── Search Input ─── */}
      <View style={s.inputContainer}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={s.searchIcon} />
        <TextInput
          placeholder="Китеп издөө..."
          placeholderTextColor={colors.textMuted}
          style={s.input}
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={s.clearButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Dropdown results ─── */}
      {showResults && (
        <View style={s.dropdown}>
          {loading && (
            <View style={s.centeredState}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={s.loadingText}>Изделүүдө...</Text>
            </View>
          )}

          {noResults && (
            <View style={s.centeredState}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              <Text style={s.noResultsTitle}>Табылган жок</Text>
              <Text style={s.noResultsSubtext}>Башка сөз менен издеп көрүңүз</Text>
            </View>
          )}

          {items.length > 0 && (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.resultsContent}
            >
              {items.map((book, index) => (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => {
                    router.push(`/books/${book.id}`);
                    handleClear();
                  }}
                  style={{ marginTop: index === 0 ? 0 : spacing.md }}
                  activeOpacity={0.7}
                >
                  <SearchResultCard book={book} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    height: 36,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: spacing.xs,
  },

  dropdown: {
    position: "absolute",
    top: 44,
    left: -63,
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
    backgroundColor: colors.background,
    zIndex: 1001,
  },

  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.accent,
  },
  noResultsTitle: {
    ...typography.headline,
    color: colors.accent,
  },
  noResultsSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resultsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
