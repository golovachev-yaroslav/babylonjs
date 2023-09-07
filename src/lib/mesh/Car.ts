import {
  MeshBuilder,
  Scene,
  Mesh,
  Vector3,
  SceneLoader,
  AbstractMesh,
  ActionManager,
  PhysicsImpostor,
  IncrementValueAction,
} from '@babylonjs/core';

/** Car. */
export interface CarMesh {

  /** Car. */
  car: Mesh;

  /** Forward left wheel. */
  wheelForwardLeft: AbstractMesh;

  /** Forward right wheel. */
  wheelForwardRight: AbstractMesh;

  /** Backward left wheel. */
  wheelBackwardLeft: AbstractMesh;

  /** Backward right wheel. */
  wheelBackwardRight: AbstractMesh;
}

/** Car. */
export class Car {
  private readonly scene: Scene;

  private readonly wheelOuterSide = (180 * Math.PI) / 180;

  /** Car meshes. */
  public mesh?: CarMesh;

  public constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates car.
   * @param name Car name.
   */
  public async create(name: string): Promise<CarMesh> {
    const rootMesh = '__root__';
    const { meshes } = await SceneLoader.ImportMeshAsync(
      '',
      'src/scenes/car/',
      'BuickRiviera.glb',
      this.scene,
    );

    const car = meshes.find(mesh => mesh.name === rootMesh) as AbstractMesh;
    const wheelForwardLeft = meshes.find(
      mesh => mesh.name === 'wheel.Ft.L',
    ) as AbstractMesh;
    const wheelForwardRight = meshes.find(
      mesh => mesh.name === 'wheel.Ft.R',
    ) as AbstractMesh;
    const wheelBackwardLeft = meshes.find(
      mesh => mesh.name === 'wheel.Bk.L',
    ) as AbstractMesh;
    const wheelBackwardRight = meshes.find(
      mesh => mesh.name === 'wheel.Bk.R',
    ) as AbstractMesh;

    // Need to calibration car, otherwise hit happens in the middle of the car.
    const carBox = MeshBuilder.CreateBox(name, {
      width: 1.7,
      height: 1.7,
      depth: 5,
    });

    carBox.position = new Vector3(4, 1, 7);
    carBox.visibility = 0;
    carBox.checkCollisions = true;
    carBox.showBoundingBox = true;

    car.rotation = Vector3.Zero();
    car.position = new Vector3(4, 0.2, 7);
    car.setParent(carBox);
    car.showBoundingBox = true;
    car.checkCollisions = false;

    // Enabled car physics.
    carBox.actionManager = new ActionManager(this.scene);
    carBox.physicsImpostor = new PhysicsImpostor(
      carBox,
      PhysicsImpostor.BoxImpostor,
      { mass: 1000, restitution: 0 },
      this.scene,
    );

    this.mesh = {
      car: carBox,
      wheelForwardLeft,
      wheelForwardRight,
      wheelBackwardLeft,
      wheelBackwardRight,
    };

    return this.mesh;
  }

  /**
   * Start rotate the wheels.
   */
  public startRotateWheels(): void {
    this.scene.actionManager = new ActionManager(this.scene);

    if (this.mesh) {
      const wheelsArray = [
        this.mesh.wheelForwardLeft,
        this.mesh.wheelForwardRight,
        this.mesh.wheelBackwardLeft,
        this.mesh.wheelBackwardRight,
      ];
      wheelsArray.forEach(wheel => {
        wheel.rotation = new Vector3(0, this.wheelOuterSide, 0);
        this.scene.actionManager.registerAction(
          new IncrementValueAction(
            ActionManager.OnEveryFrameTrigger,
            wheel,
            'rotation.x',
            1,
          ),
        );
      });
    }
  }

  /**
   * Stop rotate the wheels.
   */
  public stopRotateWheels(): void {
    if (this.mesh) {
      const wheelsArray = [
        this.mesh.wheelForwardLeft,
        this.mesh.wheelForwardRight,
        this.mesh.wheelBackwardLeft,
        this.mesh.wheelBackwardRight,
      ];
      wheelsArray.forEach(wheel => {
        wheel.rotation = new Vector3(0, this.wheelOuterSide, 0);
      });
    }
  }
}
