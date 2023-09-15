import { FC, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

import styles from "./App.module.css";

import { MainScene } from "./lib/immersive/mainScene";

const MAX_COUNT = 5;
const BASE_BUTTON_CLASS = "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-full";
const DISABLED_BUTTON_CLASS = "bg-gray-300 cursor-not-allowed text-gray-800 font-bold py-2 px-4 w-full bg-opacity-75";

/**
 * App component containing canvas with babylonjs scene.
 * Can be moved to a separate component.
 */
export const App: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scene = useRef<MainScene | null>(null);
  const [countSpheres, setCountSpheres] = useState(1);
  const [countBoxes, setCountBoxes] = useState(1);

  useEffect(() => {
    if (canvasRef.current != null) {
      scene.current = new MainScene(canvasRef.current);
    }

    return () => scene.current?.erase();
  }, []);

  const handleAddSphere = () => {
    if (scene.current) {
      const spheres = scene.current.addSphere();

      setCountSpheres(spheres.length);
    }
  };

  const handleRemoveSphere = () => {
    if (scene.current) {
      const spheres = scene.current.removeSphere();

      setCountSpheres(spheres.length);
    }
  };

  const handleAddBox = () => {
    if (scene.current) {
      const boxes = scene.current.addBox();

      setCountBoxes(boxes.length);
    }
  };

  const handleRemoveBox = () => {
    if (scene.current) {
      const boxes = scene.current.removeBox();

      setCountBoxes(boxes.length);
    }
  };

  const disabledAddSphere = countSpheres === MAX_COUNT;
  const disabledRemoveSphere = countSpheres === 1;
  const disabledAddBox = countBoxes === MAX_COUNT;
  const disabledRemoveBox = countBoxes === 1;

  return (
    <div className={styles.root}>
      <canvas className={styles.scene} ref={canvasRef} />
      <div className={styles.controlPanel}>
        <div className="inline-flex p-2">
          <button
            className={clsx("rounded-l", disabledAddSphere ? DISABLED_BUTTON_CLASS : BASE_BUTTON_CLASS)}
            disabled={disabledAddSphere}
            onClick={handleAddSphere}
          >
            Add Sphere
          </button>
          <button
            className={clsx("rounded-r", disabledRemoveSphere ? DISABLED_BUTTON_CLASS : BASE_BUTTON_CLASS)}
            disabled={disabledRemoveSphere}
            onClick={handleRemoveSphere}
          >
            Remove Sphere
          </button>
        </div>
        <div className="inline-flex p-2">
          <button
            className={clsx("rounded-l", disabledAddBox ? DISABLED_BUTTON_CLASS : BASE_BUTTON_CLASS)}
            disabled={disabledAddBox}
            onClick={handleAddBox}
          >
            Add Box
          </button>
          <button
            className={clsx("rounded-r", disabledRemoveBox ? DISABLED_BUTTON_CLASS : BASE_BUTTON_CLASS)}
            disabled={disabledRemoveBox}
            onClick={handleRemoveBox}
          >
            Remove Box
          </button>
        </div>
      </div>
    </div>
  );
};
