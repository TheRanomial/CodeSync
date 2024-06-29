import { RefObject, useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { Socket } from "socket.io-client";
import ACTIONS from "../Action";

interface Props {
  socketRef: RefObject<Socket | null>;
  roomId: string;
  onCodeChange: (code: string) => void;
}

export default function Editor({ socketRef, roomId, onCodeChange }: Props) {
  const [value, setValue] = useState("console.log('hello world!');");

  const onChange = useCallback(
    (val: string) => {
      setValue(val);
      onCodeChange(val);
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: val });
      }
    },
    [onCodeChange, roomId, socketRef]
  );

  useEffect(() => {
    const currentSocket = socketRef.current;
    if (currentSocket) {
      const handleCodeChange = ({ code }: { code: string }) => {
        if (value !== code) { // Prevent infinite loops due to self-emission
          setValue(code);
        }
      };
      currentSocket.on(ACTIONS.CODE_CHANGE, handleCodeChange);

      return () => {
        if (currentSocket) {
          currentSocket.off(ACTIONS.CODE_CHANGE);
        }
      };
    }
  }, [socketRef, value]); // Add value as a dependency to avoid infinite loops

  console.log(value); // For debugging purposes (optional)

  return (
    <CodeMirror
      value={value}
      theme={dracula}
      height="400px"
      extensions={[javascript({ jsx: true })]}
      onChange={onChange}
    />
  );
}

