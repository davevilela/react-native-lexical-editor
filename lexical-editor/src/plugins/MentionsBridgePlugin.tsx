import { useCallback, useEffect, useMemo, useState } from "react";
import { useBridgeInstance } from "../utils/BridgeContext";
import {
  MenuOption,
  MenuResolution,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  LexicalEditor,
  RangeSelection,
  TextNode,
} from "lexical";
import {
  MentionObject,
  MentionSelectPayload,
  MentionState,
} from "../../../shared/types";
import { $createBeautifulMentionNode } from "lexical-beautiful-mentions";

export function MentionsBridgePlugin({
  shouldSplitNodeWithQuery = true,
}: {
  shouldSplitNodeWithQuery?: boolean;
}) {
  const triggerFn = useBasicTypeaheadTriggerMatch("@", { minLength: 1 });

  const [editor] = useLexicalComposerContext();
  const { bridge, registerMethods } = useBridgeInstance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resolution, setResolution] = useState<Omit<
    MenuResolution,
    "getRect"
  > | null>(null);

  const closeTypeahead = useCallback(() => {
    setResolution(null);
    setMenuOpen(false);
  }, []);

  const openTypeahead = useCallback((res: Omit<MenuResolution, "getRect">) => {
    setResolution(res);
    setMenuOpen(true);
  }, []);

  useEffect(() => {
    const updateListener = () => {
      editor.getEditorState().read(() => {
        const editorWindow = editor._window || window;
        const range = editorWindow.document.createRange();
        const selection = $getSelection();
        const text = getQueryTextForSearch(editor);

        if (
          !$isRangeSelection(selection) ||
          !selection.isCollapsed() ||
          text === null ||
          range === null
        ) {
          closeTypeahead();
          return;
        }

        const match = triggerFn(text, editor);

        if (
          match !== null &&
          !isSelectionOnEntityBoundary(editor, match.leadOffset)
        ) {
          openTypeahead({ match });
          return;
        }
        closeTypeahead();
      });
    };

    const removeUpdateListener = editor.registerUpdateListener(updateListener);

    return () => {
      removeUpdateListener();
    };
  }, [closeTypeahead, editor, openTypeahead, triggerFn]);

  const typeaheadState = useMemo(() => {
    return {
      isVisible: menuOpen,
      queryString: resolution?.match?.matchingString,
      trigger: "@",
    } as MentionState;
  }, [menuOpen, resolution?.match?.matchingString]);

  useEffect(() => {
    (async function () {
      await bridge.setMentionState(typeaheadState);
    })().catch();
  }, [bridge, typeaheadState]);

  const selectOptionAndCleanUp = useCallback(
    (selectedEntry: MentionObject) => {
      editor.update(() => {
        const textNodeContainingQuery =
          resolution?.match != null && shouldSplitNodeWithQuery
            ? $splitNodeContainingQuery(resolution.match)
            : null;

        editor.update(() => {
          const mentionNode = $createBeautifulMentionNode(
            "@",
            selectedEntry.value,
            selectedEntry
          );

          if (textNodeContainingQuery) {
            textNodeContainingQuery.replace(mentionNode);
            const selection = $getSelection();
            selection?.insertText(" ");
          }
          closeTypeahead();
        });
      });
    },
    [editor, resolution?.match, shouldSplitNodeWithQuery, closeTypeahead]
  );

  const insertMentionCommand = useCallback(
    ({ mention }: MentionSelectPayload) => {
      console.log(mention, "selected mention");
      selectOptionAndCleanUp(mention);

      return Promise.resolve();
    },
    [selectOptionAndCleanUp]
  );

  useEffect(() => {
    registerMethods({ insertMentionCommand });
  }, [insertMentionCommand, editor, registerMethods]);

  return null;
}

// function useMentionsBridgePlugin({
//   shouldSplitNodeWithQuery = true,
// }: {
//   shouldSplitNodeWithQuery?: boolean;
// }) {
//   const triggerFn = useBasicTypeaheadTriggerMatch("@", { minLength: 1 });

//   const [editor] = useLexicalComposerContext();
//   const { bridge } = useBridgeInstance();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [resolution, setResolution] = useState<Omit<
//     MenuResolution,
//     "getRect"
//   > | null>(null);

//   const closeTypeahead = useCallback(() => {
//     setResolution(null);
//     setMenuOpen(false);
//   }, []);

//   const openTypeahead = useCallback((res: Omit<MenuResolution, "getRect">) => {
//     setResolution(res);
//     setMenuOpen(true);
//   }, []);

//   useEffect(() => {
//     const updateListener = () => {
//       editor.getEditorState().read(() => {
//         const editorWindow = editor._window || window;
//         const range = editorWindow.document.createRange();
//         const selection = $getSelection();
//         const text = getQueryTextForSearch(editor);

//         if (
//           !$isRangeSelection(selection) ||
//           !selection.isCollapsed() ||
//           text === null ||
//           range === null
//         ) {
//           closeTypeahead();
//           return;
//         }

//         const match = triggerFn(text, editor);

//         if (
//           match !== null &&
//           !isSelectionOnEntityBoundary(editor, match.leadOffset)
//         ) {
//           openTypeahead({ match });
//           return;
//         }
//         closeTypeahead();
//       });
//     };

//     const removeUpdateListener = editor.registerUpdateListener(updateListener);

//     return () => {
//       removeUpdateListener();
//     };
//   }, [closeTypeahead, editor, openTypeahead, triggerFn]);

//   const typeaheadState = useMemo(() => {
//     return {
//       isVisible: menuOpen,
//       queryString: resolution?.match?.matchingString,
//       trigger: "@",
//     } as MentionState;
//   }, [menuOpen, resolution?.match?.matchingString]);

//   useEffect(() => {
//     (async function () {
//       await bridge.setMentionState(typeaheadState);
//     })().catch();
//   }, [bridge, typeaheadState]);
// }

function getQueryTextForSearch(editor: LexicalEditor): string | null {
  let text = null;
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }
    text = getTextUpToAnchor(selection);
  });
  return text;
}

function getTextUpToAnchor(selection: RangeSelection): string | null {
  const anchor = selection.anchor;
  if (anchor.type !== "text") {
    return null;
  }
  const anchorNode = anchor.getNode();
  if (!anchorNode.isSimpleText()) {
    return null;
  }
  const anchorOffset = anchor.offset;
  return anchorNode.getTextContent().slice(0, anchorOffset);
}

function isSelectionOnEntityBoundary(
  editor: LexicalEditor,
  offset: number
): boolean {
  if (offset !== 0) {
    return false;
  }
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      const prevSibling = anchorNode.getPreviousSibling();
      return $isTextNode(prevSibling) && prevSibling.isTextEntity();
    }
    return false;
  });
}

/**
 * Split Lexical TextNode and return a new TextNode only containing matched text.
 * Common use cases include: removing the node, replacing with a new node.
 */
function $splitNodeContainingQuery(match: MenuTextMatch): TextNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  const anchor = selection.anchor;
  if (anchor.type !== "text") {
    return null;
  }
  const anchorNode = anchor.getNode();
  if (!anchorNode.isSimpleText()) {
    return null;
  }
  const selectionOffset = anchor.offset;
  const textContent = anchorNode.getTextContent().slice(0, selectionOffset);
  const characterOffset = match.replaceableString.length;
  const queryOffset = getFullMatchOffset(
    textContent,
    match.matchingString,
    characterOffset
  );
  const startOffset = selectionOffset - queryOffset;
  if (startOffset < 0) {
    return null;
  }
  let newNode;
  if (startOffset === 0) {
    [newNode] = anchorNode.splitText(selectionOffset);
  } else {
    [, newNode] = anchorNode.splitText(startOffset, selectionOffset);
  }

  return newNode;
}

/**
 * Walk backwards along user input and forward through entity title to try
 * and replace more of the user's text with entity.
 */
function getFullMatchOffset(
  documentText: string,
  entryText: string,
  offset: number
): number {
  let triggerOffset = offset;
  for (let i = triggerOffset; i <= entryText.length; i++) {
    if (documentText.substr(-i) === entryText.substr(0, i)) {
      triggerOffset = i;
    }
  }
  return triggerOffset;
}
