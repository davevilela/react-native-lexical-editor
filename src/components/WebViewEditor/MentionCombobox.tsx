import { useBridge } from "@webview-bridge/react-native";
import { WebBridgeMethods, editorBridge } from "./editorBridge";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { MentionObject } from "../../../shared/types";
import { useCallback, useMemo } from "react";

export function MentionCombobox() {
  const mentionState = useBridge(editorBridge, (state) => state.mentionState);

  const handleSelectMention = useCallback(async (mention: MentionObject) => {
    try {
      if (WebBridgeMethods.current.isReady) {
        await WebBridgeMethods.current.insertMentionCommand({
          mention,
        });
      }
    } catch (e) {
      console.error("Toolbar#insertMentionCommand", e);
    }
  }, []);

  const filteredOptions = useMemo(() => {
    if (!mentionState?.queryString?.length) return [];
    return mentionables.filter((mentionable) =>
      mentionable.value.toLowerCase().startsWith(mentionState.queryString!)
    );
  }, [mentionState]);

  if (!mentionState?.isVisible) return null;

  return (
    <View style={{ width: "100%", backgroundColor: "gainsboro" }}>
      <ScrollView>
        {filteredOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={{ width: "100%", padding: 10 }}
            onPress={() => {
              handleSelectMention(option);
            }}
          >
            <Text style={{ fontSize: 16 }}>{option.value}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const mentionables: MentionObject[] = [
  {
    value: "Alice Johnson",
    id: "1",
    email: "alice.johnson@example.com",
    avatar: "https://example.com/avatars/alice.jpg",
  },
  {
    value: "Alice Williams",
    id: "2",
    email: "alice.williams@example.com",
    avatar: "https://example.com/avatars/alice2.jpg",
  },
  {
    value: "Bob Smith",
    id: "3",
    email: "bob.smith@example.com",
    avatar: "https://example.com/avatars/bob.jpg",
  },
  {
    value: "Bob Brown",
    id: "4",
    email: "bob.brown@example.com",
    avatar: "https://example.com/avatars/bob2.jpg",
  },
  {
    value: "Carol White",
    id: "5",
    email: "carol.white@example.com",
    avatar: "https://example.com/avatars/carol.jpg",
  },
  {
    value: "Carol Black",
    id: "6",
    email: "carol.black@example.com",
    avatar: "https://example.com/avatars/carol2.jpg",
  },
  {
    value: "David Brown",
    id: "7",
    email: "david.brown@example.com",
    avatar: "https://example.com/avatars/david.jpg",
  },
  {
    value: "David Green",
    id: "8",
    email: "david.green@example.com",
    avatar: "https://example.com/avatars/david2.jpg",
  },
  {
    value: "Emma Wilson",
    id: "9",
    email: "emma.wilson@example.com",
    avatar: "https://example.com/avatars/emma.jpg",
  },
  {
    value: "Emma Taylor",
    id: "10",
    email: "emma.taylor@example.com",
    avatar: "https://example.com/avatars/emma2.jpg",
  },
];
