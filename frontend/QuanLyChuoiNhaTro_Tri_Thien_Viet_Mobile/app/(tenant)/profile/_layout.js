// app/(tenant)/profile/_layout.js
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
