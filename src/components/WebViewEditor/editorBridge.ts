import { bridge, createWebView } from "@webview-bridge/react-native";

import {
  type EditorBridgeState,
  OnChangePayload,
  ToolbarState,
  WebBridge,
} from "../../../shared/types";

export const editorBridge = bridge<EditorBridgeState>(({ set }) => ({
  isReady: false,
  async setReady(b: boolean) {
    set({ isReady: b });
  },
  toolbarState: {
    canUndo: false,
    canRedo: false,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    elementFormat: "left",
  },
  async setToolbarState(s: ToolbarState) {
    set({ toolbarState: s });
  },
  hasFocus: false,
  async setFocus(focus: boolean): Promise<void> {
    set({ hasFocus: focus });
  },
  async changeNotification(payload: OnChangePayload): Promise<void> {
    // console.log(
    //   `Editor changeNotification: ${JSON.stringify(payload, null, 2)}`
    // );
  },
  mentionState: null,
  async setMentionState(s) {
    console.log("mention state:", JSON.stringify(s));
    set({ mentionState: s });
  },
}));

export const { WebView: LinkedWebView, linkWebMethod } = createWebView({
  bridge: editorBridge,
  debug: true, // Enable console.log visibility in the native WebView
});

export const WebBridgeMethods = linkWebMethod<WebBridge>();
