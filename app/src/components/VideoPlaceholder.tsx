import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { invictusTheme } from "../constants/theme";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";

interface MediaSource {
  type: "video" | "image";
  source: any;
}

interface VideoPlaceholderProps {
  exerciseName: string;
  media?: MediaSource;
  width?: number;
  height?: number;
}

function VideoPlayer({
  source,
  width,
  height,
}: {
  source: any;
  width: any;
  height: number;
}) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    player.play();
  }, [player]);

  return (
    <VideoView
      style={{
        width,
        height,
        borderColor: invictusTheme.ink,
        borderWidth: 2,
        borderBottomWidth: 5,
        borderRightWidth: 5,
      }}
      player={player}
      nativeControls={false}
      contentFit="contain"
    />
  );
}

export function VideoPlaceholder({
  exerciseName,
  media,
  width = "100%" as any,
  height = 200,
}: VideoPlaceholderProps) {
  if (media) {
    if (media.type === "video") {
      return (
        <VideoPlayer source={media.source} width={width} height={height} />
      );
    } else {
      return (
        <Image
          source={media.source}
          style={{
            width,
            height,
            resizeMode: "contain",
            borderColor: invictusTheme.ink,
            borderWidth: 2,
            borderBottomWidth: 5,
            borderRightWidth: 5,
            backgroundColor: invictusTheme.surfaceHigh,
          }}
        />
      );
    }
  }

  return (
    <View style={[st.container, { height }]}>
      <View style={st.inner}>
        <View style={st.iconWrap}>
          <MaterialCommunityIcons
            name="video-outline"
            size={36}
            color={invictusTheme.textMuted}
          />
        </View>
        <Text style={st.label}>ANIMATION PLACEHOLDER</Text>
        <Text style={st.name}>{exerciseName.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    width: "100%",
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderStyle: "dashed",
    backgroundColor: invictusTheme.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: { alignItems: "center", gap: 4 },
  iconWrap: { opacity: 0.5 },
  label: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 2,
  },
  name: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  hint: {
    color: invictusTheme.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
