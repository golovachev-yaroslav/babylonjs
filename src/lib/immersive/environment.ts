import { CubeTexture, Scene, Vector3, CannonJSPlugin } from '@babylonjs/core';
import * as CANNON from 'cannon';

/** Environment. */
export class Environment {

  // Gravitational constant.
  public static readonly gravity = 9.81;

  /**
   * Creates environment.
   * @param scene Main scene.
   */
  public static create(scene: Scene): void {
    const envTex = CubeTexture.CreateFromPrefilteredData(
      'src/environment/street.env',
      scene,
    );

    scene.environmentTexture = envTex;
    scene.createDefaultSkybox(envTex, true);
    scene.collisionsEnabled = true;
    scene.enablePhysics(
      new Vector3(0, -this.gravity, 0),
      new CannonJSPlugin(true, 10, CANNON),
    );
  }
}
