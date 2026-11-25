import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TextInput, Pressable,
  ActivityIndicator, Alert
} from "react-native";
import { AudioModule, useAudioRecorder, RecordingPresets } from "expo-audio";
import { API_BASE_URL } from "./src/config";

const CONTEXTS = [
  ["doorbell_or_visitor", "Doorbell / visitor"],
  ["play", "During play"],
  ["left_alone", "When left alone"],
  ["outside_sound", "Outside sound"],
  ["attention", "Seeking attention"],
  ["unknown", "Not sure"]
] as const;

export default function App() {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [context, setContext] = useState<string>("unknown");
  const [note, setNote] = useState("");
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const start = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone permission", "Allow microphone access to record a naturally occurring sound.");
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
      setResult(null);
      setFeedbackSaved(false);
    } catch (error: any) {
      Alert.alert("Recording could not start", error?.message || "Please try again.");
    }
  };

  const stop = async () => {
    setRecording(false);
    setBusy(true);
    try {
      await recorder.stop();
      if (!recorder.uri) throw new Error("No audio file was created.");
      const body = new FormData();
      body.append("file", { uri: recorder.uri, name: "bark.m4a", type: "audio/mp4" } as any);
      body.append("dog_name", name.trim() || "My dog");
      body.append("breed", breed.trim());
      const response = await fetch(`${API_BASE_URL}/api/audio/analyze`, { method: "POST", body });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      setResult(await response.json());
    } catch (error: any) {
      Alert.alert("Could not analyze", error?.message || "Check the API connection.");
    } finally {
      setBusy(false);
    }
  };

  const submitFeedback = async () => {
    setFeedbackBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dog_name: name.trim() || "My dog",
          observed_context: context,
          owner_note: note.trim() || null
        })
      });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      setFeedbackSaved(true);
      Alert.alert("Feedback saved", "Thanks. This records the situation you observed, not your dog's emotion.");
    } catch (error: any) {
      Alert.alert("Could not save feedback", error?.message || "Check the API connection.");
    } finally {
      setFeedbackBusy(false);
    }
  };

  const buttonStyle = {
    backgroundColor: "#245BDB", padding: 16, borderRadius: 14,
    alignItems: "center" as const, marginTop: 12
  };
  const cardStyle = {
    backgroundColor: "white", padding: 18, borderRadius: 18, marginBottom: 16
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F7FC" }}>
      <ScrollView contentContainerStyle={{ padding: 22 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: "#183153" }}>BarkMate AI</Text>
        <Text style={{ color: "#64748B", marginTop: 6, marginBottom: 22 }}>
          Understand behaviour. Don't guess what your dog is saying.
        </Text>

        <View style={cardStyle}>
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>DOG PROFILE</Text>
          <TextInput placeholder="Dog's name" value={name} onChangeText={setName}
            style={{ backgroundColor: "#F1F5F9", padding: 13, borderRadius: 10, marginBottom: 10 }} />
          <TextInput placeholder="Breed (optional)" value={breed} onChangeText={setBreed}
            style={{ backgroundColor: "#F1F5F9", padding: 13, borderRadius: 10 }} />
        </View>

        <View style={cardStyle}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>BARK RECORDING</Text>
          <Text style={{ color: "#64748B", lineHeight: 21 }}>
            Record a short sample during naturally occurring behaviour. Never frighten or provoke a dog to obtain a recording.
          </Text>
          <Pressable style={[buttonStyle, (busy || feedbackBusy) && { opacity: 0.6 }]}
            disabled={busy || feedbackBusy} onPress={recording ? stop : start}>
            <Text style={{ color: "white", fontWeight: "700" }}>
              {recording ? "Stop and upload" : "●  Record a sound"}
            </Text>
          </Pressable>
          {busy && <ActivityIndicator style={{ marginTop: 14 }} />}
        </View>

        {result && (
          <View style={cardStyle}>
            <Text style={{ fontWeight: "700" }}>ANALYSIS STATUS</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8, color: "#183153" }}>
              {result.classification}
            </Text>
            <Text style={{ color: "#64748B", marginTop: 8 }}>{result.explanation}</Text>
            <Text style={{ color: "#B45309", fontWeight: "700", marginTop: 12 }}>
              DEMO ONLY — not an AI prediction
            </Text>
          </View>
        )}

        <View style={cardStyle}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>WHAT WAS HAPPENING?</Text>
          <Text style={{ color: "#64748B", marginBottom: 12, lineHeight: 20 }}>
            Your observation helps us understand the situation. It is not treated as a verified emotion label.
          </Text>
          {CONTEXTS.map(([value, label]) => (
            <Pressable key={value} onPress={() => { setContext(value); setFeedbackSaved(false); }}
              style={{
                padding: 12, borderRadius: 10, marginBottom: 7,
                backgroundColor: context === value ? "#DBEAFE" : "#F1F5F9",
                borderWidth: context === value ? 1 : 0,
                borderColor: "#245BDB"
              }}>
              <Text style={{ color: "#183153", fontWeight: context === value ? "700" : "500" }}>
                {context === value ? "●  " : "○  "}{label}
              </Text>
            </Pressable>
          ))}
          <TextInput placeholder="Optional note (e.g. delivery person at the gate)"
            value={note} onChangeText={(value) => { setNote(value); setFeedbackSaved(false); }}
            multiline maxLength={500}
            style={{ backgroundColor: "#F1F5F9", padding: 13, borderRadius: 10, minHeight: 72, textAlignVertical: "top" }} />
          <Pressable style={[buttonStyle, feedbackBusy && { opacity: 0.6 }]}
            disabled={feedbackBusy || feedbackSaved} onPress={submitFeedback}>
            {feedbackBusy ? <ActivityIndicator color="white" /> :
              <Text style={{ color: "white", fontWeight: "700" }}>
                {feedbackSaved ? "Feedback saved ✓" : "Save my observation"}
              </Text>}
          </Pressable>
        </View>

        <Text style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 4 }}>
          BarkMate AI v0.4 · Behaviour estimates are not translations or veterinary advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
