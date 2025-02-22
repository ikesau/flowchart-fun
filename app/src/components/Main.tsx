import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  Suspense,
  useCallback,
  useState,
} from "react";

import { useFullscreen } from "../lib/hooks";
import CurrentTab from "./CurrentTab";
import Graph from "./Graph";
import GraphWrapper from "./GraphWrapper";
import Loading from "./Loading";
import styles from "./Main.module.css";
import { CopyButton } from "./MenuNext";
import MobileTabToggle from "./MobileTabToggle";
import TabPane from "./TabPane";
import TextResizer from "./TextResizer";

export type MainProps = {
  children?: ReactNode;
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
};

const Main = memo(
  ({ children, textToParse, setHoverLineNumber }: MainProps) => {
    const [shouldResize, triggerResize] = useState(0);
    const trigger = useCallback(() => triggerResize((n) => n + 1), []);
    const isFullscreen = useFullscreen();
    return (
      <>
        {isFullscreen ? null : (
          <TabPane triggerResize={trigger}>
            <Suspense fallback={<Loading />}>
              <CurrentTab>{children}</CurrentTab>
            </Suspense>
          </TabPane>
        )}
        <GraphWrapper>
          <Graph
            textToParse={textToParse}
            setHoverLineNumber={setHoverLineNumber}
            shouldResize={shouldResize}
          />
          {isFullscreen ? (
            <div className={styles.CopyButtonWrapper}>
              <CopyButton />
            </div>
          ) : null}
        </GraphWrapper>
        {!isFullscreen && <MobileTabToggle />}
        <TextResizer />
      </>
    );
  }
);

Main.displayName = "Main";

export default Main;
