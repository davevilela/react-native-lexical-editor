import {
  ExcludePrimitive,
  LinkBridge,
  linkBridge,
  registerWebMethod,
} from "@webview-bridge/web";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  EditorBridge,
  EditorBridgeState,
  WebBridge,
} from "../../../shared/types";

type BridgeContextValue = {
  bridge: LinkBridge<
    ExcludePrimitive<EditorBridgeState>,
    Omit<EditorBridge, "setState">
  >;
  registerMethods: (methods: Partial<WebBridge>) => void;
  bridgeReady: boolean;
};

const Ctx = createContext<BridgeContextValue>({} as BridgeContextValue);

export function BridgeContextProvider({ children }: PropsWithChildren) {
  const methodsRef = useRef<Partial<WebBridge>>({});
  const [bridgeReady, setBridgeReady] = useState(false);

  const [bridge] = useState(() =>
    linkBridge<EditorBridge>({
      throwOnError: true,
      onReady() {
        setBridgeReady(true);
      },
    })
  );

  useEffect(() => {
    if (bridge && bridgeReady) {
      (async function fn() {
        await bridge.setReady(true);
      })().catch((e) => console.log(e, "bridge error"));
    }
  }, [bridge, bridgeReady]);

  const registerMethods = useCallback((methods: Partial<WebBridge>) => {
    //
    methodsRef.current = { ...methodsRef.current, ...methods };

    registerWebMethod(methodsRef.current);
  }, []);

  return (
    <Ctx.Provider value={{ bridge, bridgeReady, registerMethods }}>
      {children}
    </Ctx.Provider>
  );
}

export const useBridgeInstance = () => useContext(Ctx);
