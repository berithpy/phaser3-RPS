import { ISpriteItemConstructor } from '../interfaces/sprite.interface';

export class Item extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  fear: string;
  target: Phaser.GameObjects.Group;
  group: Phaser.GameObjects.Group;
  avoid: Phaser.GameObjects.Group;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  speed: number;
  // sound

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number) {
    super(scene, x, y, texture, frame);
    this.initPhysics();
    this.initHover();
    this.scene.add.existing(this);
  }

  private initHover() {
    this.setInteractive();
    this.on('pointerover', () => {
      console.log(this)
    })
  }

  private initPhysics() {
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(true);
    this.body.setAllowGravity(false);
  }

  startEmitting() {
    this.particles.setTexture(this.texture.key)
    this.emitter = this.particles.createEmitter({
      speed: 0,
      frequency: 100,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
    });
    this.emitter.startFollow(this);
  }

  bounce() {
    this.body.setAllowGravity(true);
    this.body.setDrag(1, 1)
    this.body.setVelocity(100, Phaser.Math.Between(-this.speed, this.speed));
    this.body.setBounce(1, 1);
  }
  private moveToClosestTarget() {
    const closest = this.scene.physics.closest(this, this.target.children.entries);
    if (closest) {
      this.scene.physics.moveToObject(this, closest, this.speed);
    }
  }
  private moveAwayFromClosestAvoid() {
    const closest = this.scene.physics.closest(this, this.avoid.children.entries);
    if (closest) {
      // this.scene.physics.moveToObject(this, closest, -this.speed);
    }
  }
  update(): void {
    this.moveToClosestTarget();
    this.moveAwayFromClosestAvoid();
  }
}
