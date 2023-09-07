import {
  Engine,
  Scene,
  Vector3,
  Mesh,
  ActionManager,
  IncrementValueAction,
  PredicateCondition,
  IPointerEvent,
  PickingInfo,
  PhysicsImpostor,
  Sound,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { Inspector } from '@babylonjs/inspector';

import { Box } from '../mesh/Box';
import { Sphere } from '../mesh/Sphere';
import { Ground } from '../mesh/Ground';
import { Car, CarMesh } from '../mesh/Car';

import { Environment } from './environment';
import { MainCamera } from './mainCamera';
import { MainLight } from './mainLight';

/** Main scene of the app. */
export class MainScene {
  private readonly engine: Engine;

  private scene: Scene;

  private readonly bump: Sound;

  private readonly fall: Sound;

  private ground: Mesh;

  private sphere: Mesh;

  private box: Mesh;

  private car?: Car;

  private isGameOver: boolean;

  public constructor(canvas: HTMLCanvasElement) {
    this.isGameOver = false;
    this.engine = new Engine(canvas);
    this.scene = new Scene(this.engine);

    Environment.create(this.scene);
    MainCamera.create(this.scene);

    // Inspector.Show(this.scene, {});

    this.engine.displayLoadingUI();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    this.bump = new Sound('bump', 'src/sounds/bump.wav', this.scene);
    this.fall = new Sound('fall', 'src/sounds/short-whistle-fall.wav', this.scene);

    this.ground = new Ground(this.scene);
    this.box = new Box().create('box', this.scene, { position: this.generateRandomPosition() });
    this.sphere = new Sphere().create('sphere', this.scene, { position: this.generateRandomPosition() });
    this.loadCar().then();
  }

  /** Create random range of values. */
  private getRandomRange(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
  }

  /** Create scene. */
  private generateRandomPosition(): Vector3 {
    const x = this.getRandomRange(-10, 10);
    const z = this.getRandomRange(-10, 10);

    return new Vector3(x, 1, z);
  }

  /** Reload game. */
  private reload(): void {
    this.isGameOver = false;
    this.box.dispose()
    this.box = new Box().create('box', this.scene, { position: this.generateRandomPosition() });
    this.sphere.dispose()
    this.sphere = new Sphere().create('sphere', this.scene, { position: this.generateRandomPosition() });
    this.loadCar().then();
  }

  /** Load car mesh. */
  private async loadCar(): Promise<Car> {
    const car = new Car(this.scene);
    const meshes = await car.create('car');

    MainLight.create(this.scene, this.sphere, this.box, meshes.car);

    this.createActions({ ...meshes });
    this.car = car;

    // Move the box and sphere on car hit.
    this.moveMeshOnHit(this.box, PhysicsImpostor.BoxImpostor, meshes.car);
    this.moveMeshOnHit(this.sphere, PhysicsImpostor.SphereImpostor, meshes.car);

    this.engine.hideLoadingUI();

    return this.car;
  }

  /** Erase 3D related resources. */
  public erase(): void {
    this.scene.dispose();
    this.engine.dispose();
  }

  /**
   * Move mesh on car hit.
   * @param mesh Target mesh.
   * @param boxImpostorType Box impostor type.
   * @param car Car mesh.
   */
  private moveMeshOnHit(mesh: Mesh, boxImpostorType: number, car: Mesh): void {
    car.actionManager?.registerAction(
      new IncrementValueAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: mesh,
        },
        mesh,
        'position.z',
        -0.1,
        new PredicateCondition(mesh as any, () => {
          car.physicsImpostor = new PhysicsImpostor(
            mesh,
            boxImpostorType,
            { mass: 1, restitution: 0 },
            this.scene,
          );

          this.bump.play();

          return true;
        }),
      ),
    );
  }

  /** Check game over. */
  private checkGameOver(): void {
    const dropPosition = -5;

    if (this.car?.mesh?.car.position && this.car?.mesh?.car.position.y < dropPosition) {
      this.isGameOver = true;
    }

    if (this.box.position.y < dropPosition && this.sphere.position.y < dropPosition) {
      this.isGameOver = true;
    }
  }

  /** Create actions. */
  private createActions({ car }: CarMesh): void {
    let distVec = 0;
    let targetNormalized: Vector3 = Vector3.Zero();
    let speed = 0.2;

    // Click on the scene
    this.scene.onPointerDown = (
      event: IPointerEvent,
      pickResult: PickingInfo,
    ) => {
      // Left button on the ground
      if (
        event.button === 0 &&
        pickResult.pickedMesh?.id === this.ground.name
      ) {
        this.car?.startRotateWheels();
        let targetCoords = pickResult.pickedPoint;

        if (targetCoords) {
          const initCoords = car.position;

          distVec = Vector3.Distance(targetCoords, initCoords);
          targetCoords = targetCoords.subtract(initCoords);
          targetNormalized = Vector3.Normalize(targetCoords);

          // Turn the car to target click.
          car.setDirection(new Vector3(-targetCoords.x, 0, -targetCoords.z));
        }
      }
    };

    const carPhysics = () => {
      this.checkGameOver();
      if (distVec > 0.3) {
        let carMoveVector = car.forward;
        carMoveVector.y = 0;
        carMoveVector.x = -carMoveVector.x * speed;
        carMoveVector.z = -carMoveVector.z * speed;

        car.moveWithCollisions(carMoveVector);
        car.physicsImpostor?.setLinearVelocity(new Vector3(0, -Environment.gravity, 0));
      }

      if (distVec <= 0) {
        this.car?.stopRotateWheels();
      }

      if (this.isGameOver) {
        this.fall.play();
        this.scene.unregisterBeforeRender(carPhysics);
        this.reload();
      }
    };

    this.scene.registerBeforeRender(carPhysics);
  }
}
