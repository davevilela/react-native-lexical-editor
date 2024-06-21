// lexical-editor/src/Editor.tsx

import { LexicalComposer } from "@lexical/react/LexicalComposer";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import "./Editor.css";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import EditorTheme from "./EditorTheme";
import { EditorBridgePlugin } from "./plugins/EditorBridgePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { BridgeContextProvider } from "./utils/BridgeContext";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import {
  BeautifulMentionNode,
  ZeroWidthNode,
  ZeroWidthPlugin,
} from "lexical-beautiful-mentions";
import { MentionsBridgePlugin } from "./plugins/MentionsBridgePlugin";

function onError(error: unknown) {
  console.error(error);
}

export function Editor() {
  const initialConfig = {
    namespace: window?.editorParams?.namespace ?? "MyEditor",
    theme: EditorTheme,
    onError,
    ...(window?.editorParams?.initialEditorState && {
      editorState: window?.editorParams?.initialEditorState,
    }),
  };

  return (
    <LexicalComposer
      initialConfig={{
        ...initialConfig,
        nodes: [BeautifulMentionNode, ZeroWidthNode, LinkNode, AutoLinkNode],
      }}
    >
      <BridgeContextProvider>
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <p className="editor-placeholder">Enter some text...</p>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <ZeroWidthPlugin />

          <MentionsBridgePlugin />
          <EditorBridgePlugin />
          <LinkPlugin
            validateUrl={function validateUrl(url: string): boolean {
              return url === "https://" || urlRegExp.test(url);
            }}
          />
          <AutoLinkPlugin matchers={MATCHERS} />
        </div>
      </BridgeContextProvider>
    </LexicalComposer>
  );
}

const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
);

const URL_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
    return `mailto:${text}`;
  }),
];
