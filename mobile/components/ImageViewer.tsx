import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ImageViewerProps {
  visible: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ImageViewer({
  visible,
  images,
  initialIndex,
  onClose,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setImageLoading(true);
      setImageError(false);
      // Scroll to initial image after a brief delay to ensure ScrollView is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * screenWidth,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / screenWidth);
    setCurrentIndex(imageIndex);
  };

  const navigateToImage = (direction: "prev" | "next") => {
    let newIndex = currentIndex;
    if (direction === "prev" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === "next" && currentIndex < images.length - 1) {
      newIndex = currentIndex + 1;
    }

    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({
      x: newIndex * screenWidth,
      animated: true,
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-4">
            <TouchableOpacity
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View className="bg-black/50 rounded-full px-4 py-2">
              <Text className="text-white text-sm font-medium">
                {currentIndex + 1} of {images.length}
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          {/* Image ScrollView */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            className="flex-1"
          >
            {images.map((imageUrl, index) => (
              <View
                key={index}
                className="justify-center items-center"
                style={{ width: screenWidth }}
              >
                <ScrollView
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  className="flex-1"
                  contentContainerClassName="justify-center items-center"
                >
                  {imageLoading && index === currentIndex && (
                    <View className="absolute inset-0 justify-center items-center">
                      <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color="white"
                        />
                      </View>
                      <Text className="text-white/70 mt-2">Loading...</Text>
                    </View>
                  )}

                  {imageError && index === currentIndex ? (
                    <View className="justify-center items-center">
                      <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
                        <Ionicons
                          name="image-outline"
                          size={32}
                          color="white"
                        />
                      </View>
                      <Text className="text-white/70 text-center">
                        Failed to load image
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{
                        width: screenWidth - 40,
                        height: screenHeight - 200,
                      }}
                      resizeMode="contain"
                      onLoad={
                        index === currentIndex ? handleImageLoad : undefined
                      }
                      onError={
                        index === currentIndex ? handleImageError : undefined
                      }
                    />
                  )}
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          {/* Navigation Arrows (only show if more than 1 image) */}
          {images.length > 1 && (
            <>
              {/* Previous Arrow */}
              {currentIndex > 0 && (
                <TouchableOpacity
                  className="absolute left-4 top-1/2 w-12 h-12 bg-black/50 rounded-full items-center justify-center"
                  style={{ marginTop: -24 }}
                  onPress={() => navigateToImage("prev")}
                >
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
              )}

              {/* Next Arrow */}
              {currentIndex < images.length - 1 && (
                <TouchableOpacity
                  className="absolute right-4 top-1/2 w-12 h-12 bg-black/50 rounded-full items-center justify-center"
                  style={{ marginTop: -24 }}
                  onPress={() => navigateToImage("next")}
                >
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Dots Indicator (for multiple images) */}
          {images.length > 1 && (
            <View className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center">
              <View className="bg-black/50 rounded-full px-4 py-2 flex-row">
                {images.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full mx-1 ${
                      index === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
