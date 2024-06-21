import { useBridge } from "@webview-bridge/react-native";
import { useEffect, useRef, useState } from "react";
import { LinkedWebView, editorBridge } from "./editorBridge";
import { WebViewMessageEvent } from "react-native-webview";

import { EditorBridgeState, EditorParams } from "../../../shared/types";
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { SafeAreaView, StyleSheet, useWindowDimensions } from "react-native";
import htmlString from "../../../lexical-editor/dist/htmlString";
import { Toolbar } from "./Toolbar";
import { MentionCombobox } from "./MentionCombobox";
import { useAutosizeWebviewProps } from "../../hooks/useAutosizeWebviewProps";

export function WebViewEditor() {
  const { style, ...autosizeProps } = useAutosizeWebviewProps();
  const webviewRef = useRef<any>(null);

  useEffect(() => {
    editorBridge.subscribe(
      (newState: EditorBridgeState, prevState: EditorBridgeState) => {
        if (newState.isReady && !prevState.isReady) {
          console.log("EditorBridge is ready ... do something if you like ...");
        }
      }
    );
  }, []);

  const editorParams: EditorParams = {
    namespace: "MyLexicalEditor",
    initialEditorState: "",
    enableOnChangePlugin: {
      includeHtmlText: true,
      includeJsonState: true,
      includePlainText: true,
    },
  };

  const injectedJavaScriptBeforeContentLoaded = `(function() {
    window.editorParams = ${JSON.stringify(editorParams)};
  })();`;

  return (
    <KeyboardProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          bottomOffset={62}
          contentContainerStyle={styles.containerCCKASV}
        >
          <LinkedWebView
            {...autosizeProps}
            ref={webviewRef}
            hideKeyboardAccessoryView={true}
            originWhitelist={["*"]}
            injectedJavaScriptBeforeContentLoaded={
              injectedJavaScriptBeforeContentLoaded
            }
            source={{ html: htmlString }}
            style={[
              style,
              {
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 10,
                backgroundColor: "transparent",
                width: "100%",
                maxHeight: 200,
              },
            ]}
          />
          <MentionCombobox />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <KeyboardToolbar showArrows={false} content={<Toolbar />} />
    </KeyboardProvider>
  );
}

// const bodyHeightInjectedJavascript = ``

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCCKASV: {
    margin: 16,
  },
  textInput: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  text: {
    fontSize: 24,
  },
});
