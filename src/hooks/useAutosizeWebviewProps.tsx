import { useState } from "react";
import { WebViewMessageEvent } from "react-native-webview";

export function useAutosizeWebviewProps({
  initialHeight = 40,
}: { initialHeight?: number } = {}) {
  const [webViewHeight, setWebViewHeight] = useState(1);
  function onMessage(event: WebViewMessageEvent) {
    const message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case "BODY_HEIGHT_CHANGE":
        setWebViewHeight(message.payload);
        break;
      default:
        break;
    }
  }

  return {
    injectedJavaScript: bodyHeightObserverInjectedJavascript,
    onMessage,
    scalesPageToFit: true,
    showsVerticalScrollIndicator: false,
    style: { height: webViewHeight === 1 ? initialHeight : webViewHeight },
  };
}

const bodyHeightObserverInjectedJavascript = `
                  const observer = new ResizeObserver(entries => {
                    const height = entries[0].target.clientHeight;
                    const message = {
                      type: 'BODY_HEIGHT_CHANGE',
                      payload: height
                    };
                    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
                  });
                  observer.observe(document.body);
                  true;
              `;
