import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { useBookmarks, useBooks } from "@/hooks/useAppQuery";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const bottomPadding = Platform.OS === "android" ? insets.bottom + 80 : insets.bottom + 80;

  // Local state for editable display name, avatar, and banner
  const [displayName, setDisplayName] = useState(user?.username || "Guest");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Load avatar and banner from AsyncStorage (same as home/library pages)
  useFocusEffect(
    useCallback(() => {
      const loadImages = async () => {
        const savedAvatar = await AsyncStorage.getItem("userAvatar");
        if (savedAvatar) {
          setAvatar(savedAvatar);
        } else if (user?.profilePhotoUrl) {
          setAvatar(user.profilePhotoUrl);
        }

        const savedBanner = await AsyncStorage.getItem("userBanner");
        if (savedBanner) {
          setBanner(savedBanner);
        }
      };
      loadImages();
    }, [user?.profilePhotoUrl])
  );

  // Load and persist display name
  useFocusEffect(
    useCallback(() => {
      const loadDisplayName = async () => {
        const savedName = await AsyncStorage.getItem("userDisplayName");
        if (savedName) {
          setDisplayName(savedName);
        } else if (user?.username) {
          setDisplayName(user.username);
        }
      };
      loadDisplayName();
    }, [user?.username])
  );

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;

  // Queries
  const { data: books } = useBooks();
  const { data: bookmarks } = useBookmarks();

  // Book carousels
  const carousels = useMemo(() => {
    const allBooks = Array.isArray(books) ? books : [];
    const recommended = allBooks.slice(0, 10);
    const favoriteBooks = bookmarks?.map((b) => ({ id: b.workId, title: "", imageUrl: b.workImageUrl })) || [];

    const lists = [];
    if (favoriteBooks.length > 0) {
      lists.push({ title: "Белгиленген китептер:", data: favoriteBooks });
    }

    lists.push({ title: "Сизге жагуу мүмкүн:", data: recommended });

    return lists;
  }, [books, bookmarks]);

  const cardAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  // Run animations on focus
  const runAnimations = useCallback(() => {
    // Reset all
    headerAnim.setValue(0);
    profileAnim.setValue(0);
    avatarAnim.setValue(0);
    cardAnims.forEach((anim) => anim.setValue(0));

    // Header fade in
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Profile area fade in
    Animated.timing(profileAnim, {
      toValue: 1,
      duration: 500,
      delay: 100,
      useNativeDriver: true,
    }).start();

    // Avatar scale in
    Animated.spring(avatarAnim, {
      toValue: 1,
      delay: 200,
      useNativeDriver: true,
      damping: 12,
      stiffness: 150,
    }).start();

    // Stagger carousel animations
    Animated.stagger(
      120,
      cardAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [headerAnim, profileAnim, avatarAnim, cardAnims]);

  useEffect(() => {
    runAnimations();
  }, [runAnimations]);

  // Handle avatar image picker
  const handleAvatarPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to change your avatar.");
        return;
      }

      setIsUploadingAvatar(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        setIsUploadingAvatar(false);
        return;
      }

      const asset = result.assets[0];
      const imageUri = asset.uri;
      await AsyncStorage.setItem("userAvatar", imageUri);
      setAvatar(imageUri);
      try {
        const formData = new FormData();
        formData.append("photo", {
          uri: asset.uri,
          name: "avatar.jpg",
          type: asset.mimeType ?? "image/jpeg",
        } as any);
        const response = await authApi.uploadProfilePhoto(formData);
        if (user) {
          setUser({
            ...user,
            profilePhotoUrl: response.url,
          });
        }
      } catch (uploadError) {
        if (__DEV__) console.warn("[Profile] Backend avatar upload failed, saved locally:", uploadError);
        if (user) {
          setUser({
            ...user,
            profilePhotoUrl: imageUri,
          });
        }
      }

      setIsUploadingAvatar(false);
    } catch (error) {
      if (__DEV__) console.error("[Profile] Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsUploadingAvatar(false);
    }
  };

  // Handle banner image picker
  const handleBannerPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to change your banner.");
        return;
      }

      setIsUploadingBanner(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [SCREEN_WIDTH, 280],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        setIsUploadingBanner(false);
        return;
      }

      const asset = result.assets[0];
      const imageUri = asset.uri;
      await AsyncStorage.setItem("userBanner", imageUri);
      setBanner(imageUri);

      setIsUploadingBanner(false);
    } catch (error) {
      if (__DEV__) console.error("[Profile] Error picking banner:", error);
      Alert.alert("Error", "Failed to pick banner image. Please try again.");
      setIsUploadingBanner(false);
    }
  };

  // Handle display name save
  const handleNameSave = async () => {
    if (displayName.trim().length === 0) {
      Alert.alert("Invalid Name", "Name cannot be empty.");
      setDisplayName(user?.username || "Guest");
      setIsEditingName(false);
      return;
    }

    const trimmedName = displayName.trim();
    await AsyncStorage.setItem("userDisplayName", trimmedName);
    if (user) {
      setUser({
        ...user,
        username: trimmedName,
      });
    }

    setIsEditingName(false);
  };

  const username = user?.username || "Guest";
  const userHandle = user?.username ? `@${username.toLowerCase()}` : "Not logged in";

  if (!user?.username) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <StatusBar barStyle="dark-content" />
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: 'rgba(232, 67, 38, 0.08)',
          alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <Ionicons name="person-circle-outline" size={40} color="#E84326" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1A2E', textAlign: 'center' }}>
          Okuulib-ке кош келиңиз
        </Text>
        <Text style={{ fontSize: 15, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
          Профилиңизди, белгиленгендерди жана башка мүмкүнчүлүктөрдү көрүү үчүн кириңиз
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          style={{
            backgroundColor: '#E84326', borderRadius: 14,
            paddingVertical: 14, paddingHorizontal: 48,
            marginTop: 24, alignItems: 'center',
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>Кирүү</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/auth/register')}
          style={{ marginTop: 14 }}
        >
          <Text style={{ color: '#E84326', fontSize: 15, fontWeight: '600' }}>Аккаунт түзүү</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Bar */}
      <Animated.View
        style={[
          styles.headerBar,
          {
            paddingTop: statusBarHeight + insets.top,
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Профиль</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/profile/settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomPadding + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Banner Area */}
        <Animated.View
          style={[
            styles.profileBanner,
            {
              opacity: profileAnim,
              transform: [
                {
                  translateY: profileAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Banner background */}
          <TouchableOpacity
            onPress={handleBannerPress}
            activeOpacity={0.9}
            disabled={isUploadingBanner}
            style={styles.bannerTouchable}
          >
            {isUploadingBanner ? (
              <View style={styles.bannerLoading}>
                <Ionicons name="cloud-upload-outline" size={40} color="#FFFFFF" />
              </View>
            ) : banner ? (
              <Image
                source={{ uri: banner }}
                style={styles.bannerImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={styles.grayBackground} />
            )}
            {/* Edit indicator overlay */}
            {!isUploadingBanner && (
              <View style={styles.bannerEditOverlay}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.bannerEditText}>Банерди өзгөртүү</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.redBar} />
          {/* Avatar with image picker */}
          <TouchableOpacity
            onPress={handleAvatarPress}
            activeOpacity={0.8}
            disabled={isUploadingAvatar}
          >
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  transform: [
                    {
                      scale: avatarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {isUploadingAvatar ? (
                <View style={styles.avatarLoading}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#FFFFFF" />
                </View>
              ) : avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={300}
                />
              ) : user?.profilePhotoUrl ? (
                <Image
                  source={{ uri: user.profilePhotoUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <Image
                  source={icons.defaultAvatar}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Editable User Name */}
          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoFocus
                maxLength={50}
                onSubmitEditing={handleNameSave}
                onBlur={handleNameSave}
                textAlign="center"
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingName(true)}
              style={styles.userNameContainer}
            >
              <Text style={styles.userName}>{displayName}</Text>
              <Ionicons name="create-outline" size={14} color="#FFFFFF" style={styles.editIcon} />
            </TouchableOpacity>
          )}

          {/* User Handle */}
          <Text style={[styles.userHandle, isEditingName && styles.userHandleEditing]}>
            {userHandle}
          </Text>
        </Animated.View>

        {/* Book Carousels */}
        {carousels.map((carousel, index) => {
          const animStyle = {
            opacity: cardAnims[index],
            transform: [
              {
                translateY: cardAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          };

          return (
            <Animated.View
              key={carousel.title}
              style={[styles.carouselContainer, animStyle]}
            >
              <Text style={styles.carouselTitle}>{carousel.title}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselScroll}
              >
                {Array.isArray(carousel.data)
                  ? carousel.data.map((book: { id: number; title?: string; imageUrl?: string }) => (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => router.push(`/books/${book.id}`)}
                      style={styles.bookCard}
                      activeOpacity={0.8}
                    >
                      {book.imageUrl ? (
                        <Image
                          source={{ uri: book.imageUrl }}
                          style={styles.bookImage}
                          contentFit="cover"
                          transition={500}
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <View style={styles.bookPlaceholder} />
                      )}
                    </TouchableOpacity>
                  ))
                  : null}
              </ScrollView>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: -20,
    right: -20,
    zIndex: 100,
    backgroundColor: "#E74026",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 38,
    paddingBottom: 11,
    borderRadius: 30,
  },
  headerTitle: {
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    fontSize: 20,
    lineHeight: 24,
    color: "#FFFFFF",
  },
  settingsButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileBanner: {
    height: 280,
    position: "relative",
    marginBottom: 25,
  },
  bannerTouchable: {
    position: "absolute",
    width: "100%",
    height: 280,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerLoading: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerEditOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bannerEditText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  grayBackground: {
    position: "absolute",
    width: "100%",
    height: 280,
    backgroundColor: colors.skeleton,
  },
  redBar: {
    position: "absolute",
    width: "100%",
    height: 111,
    top: 170,
    backgroundColor: colors.accent,
  },
  avatarContainer: {
    position: "absolute",
    width: 100,
    height: 100,
    left: (SCREEN_WIDTH - 100) / 2,
    top: 100,
    borderRadius: 50,
    backgroundColor: colors.textMuted,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarLoading: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  userNameContainer: {
    position: "absolute",
    width: "100%",
    top: 215,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
  },
  userName: {
    fontFamily: "Inter-Regular",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
    color: "#FFFFFF",
  },
  editIcon: {
    marginLeft: 4,
  },
  nameEditContainer: {
    position: "absolute",
    width: "100%",
    top: 215,
    left: 0,
    paddingHorizontal: 40,
  },
  nameInput: {
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "center",
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  userHandle: {
    position: "absolute",
    width: "100%",
    top: 242,
    left: 0,
    fontFamily: "Inter-Regular",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
  },
  userHandleEditing: {
    top: 260,
  },
  carouselContainer: {
    marginBottom: 25,
  },
  carouselTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 19,
    color: colors.text,
    marginLeft: 16,
    marginBottom: 10,
  },
  carouselScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  bookCard: {
    width: 90,
    height: 130,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.skeleton,
    marginRight: 10,
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  bookPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.skeleton,
  },
});
