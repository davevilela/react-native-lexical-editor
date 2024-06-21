import { ElementFormatType, TextFormatType } from "lexical";
import { BridgeStore } from "@webview-bridge/react-native";

export type EditorParams = {
  namespace?: string;
  initialEditorState?: string;
  enableOnChangePlugin?: {
    includePlainText: boolean;
    includeHtmlText: boolean;
    includeJsonState: boolean;
  };
};

export type OnChangePayload = {
  plainText?: string;
  htmlText?: string;
  jsonState?: string;
};

export type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  elementFormat: ElementFormatType;
};

export type MentionObject = {
  value: string;
  id: string;
  email: string;
  avatar: string;
};

export type MentionSelectPayload = {
  mention: MentionObject;
};

/** From Native to web */
export type WebBridge = {
  undoCommand(): Promise<void>;
  redoCommand(): Promise<void>;
  formatTextCommand(payload: TextFormatType): Promise<void>;
  formatElementCommand(payload: ElementFormatType): Promise<void>;
  insertMentionCommand(payload: MentionSelectPayload): Promise<void>;
  getEditorHtml(): Promise<string>;
  setEditorHtml(htmlString: string): Promise<void>;
  getEditorJson(): Promise<string>;
  setEditorJson(jsonString: string): Promise<void>;
};

export type MentionState = {
  trigger?: string;
  queryString?: string | null | undefined;
  isVisible?: boolean;
};

/** Written by webview */
export type EditorBridgeState = {
  isReady: boolean;
  setReady: (b: boolean) => Promise<void>;
  toolbarState: ToolbarState;
  setToolbarState: (s: ToolbarState) => Promise<void>;
  hasFocus: boolean;
  setFocus: (focus: boolean) => Promise<void>;
  changeNotification: (payload: OnChangePayload) => Promise<void>;
  mentionState: MentionState | null;
  setMentionState: (s: MentionState | null) => Promise<void>;
};

export type EditorBridge = BridgeStore<EditorBridgeState>;
