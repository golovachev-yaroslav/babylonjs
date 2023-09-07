import { Scene, FreeCamera, Vector3 } from '@babylonjs/core';

/** Main camera of the scene. */
export class MainCamera {
  /**
   * Creates main camera for scene.
   * @param scene Main scene.
   */
  public static create(scene: Scene): void {
    const camera = new FreeCamera('mainCamera', new Vector3(8, 14, 14), scene);

    camera.setTarget(Vector3.Zero());
    camera.attachControl();
    camera.minZ = 0.3;
    camera.speed = 0.5;
    camera.checkCollisions = true;
  }
}
