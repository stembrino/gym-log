import { Redirect } from "expo-router";
import { FEATURE_FLAGS } from "@/constants/featureFlags";

export default function TabsIndexRedirect() {
  return <Redirect href={FEATURE_FLAGS.exercisesTab ? "/(tabs)/exercises" : "/(tabs)/workouts"} />;
}
