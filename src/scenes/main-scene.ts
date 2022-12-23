import { Redhat } from '../objects/redhat';
import { Item } from '../objects/items';

// TODO
// Spawn pattern selection DONE!
//
// Win animation
// Win sprites
// win sound
// Avoid enemy 

const SPAWNPATTERNS = {
  grouped: {
    rock: { x: [0, 400], y: [0, 300] },
    paper: { x: [200, 600], y: [300, 600] },
    scissors: { x: [400, 800], y: [0, 300] },
  },
  wholeMap: {
    rock: { x: [0, 800], y: [0, 600] },
    paper: { x: [0, 800], y: [0, 600] },
    scissors: { x: [0, 800], y: [0, 600] },
  },
  column: {
    rock: { x: [0, 200], y: [0, 600] },
    paper: { x: [300, 500], y: [0, 600] },
    scissors: { x: [600, 800], y: [0, 600] },
  }
}
const POSSIBLEWINNERS = ['rock', 'paper', 'scissors'];
export class MainScene extends Phaser.Scene {
  private items: Phaser.GameObjects.Group;
  private rocks: Phaser.GameObjects.Group;
  private scissors: Phaser.GameObjects.Group;
  private papers: Phaser.GameObjects.Group;
  private rockCount: integer;
  private paperCount: integer;
  private scissorsCount: integer;
  private rockCountText: Phaser.GameObjects.Text;
  private paperCountText: Phaser.GameObjects.Text;
  private scissorsCountText: Phaser.GameObjects.Text;
  private counts: number;
  private totalCountText: Phaser.GameObjects.Text;
  private totalGroups: number;
  private sp: {
    rock: { x: number[], y: number[] },
    paper: { x: number[], y: number[] },
    scissors: { x: number[], y: number[] },
  };
  private buttons: {
    one: Phaser.GameObjects.Image,
    two: Phaser.GameObjects.Image,
    three: Phaser.GameObjects.Image,
  };
  private selectedButton: integer;
  private losers: string[] = [];
  private winner: string = '';
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private itemSpeed: number = 20;
  private itemSpeedText: Phaser.GameObjects.Text;
  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.image('redhat', 'images/redhat.png');
    this.load.image('scissors', 'images/scissors.png');
    this.load.image('rock', 'images/rock.png');
    this.load.image('paper', 'images/paper.png');
    this.load.image('redParticle', 'images/red.png');
    this.load.image('restart', 'images/restart.png')
    this.load.image('one', 'images/digit1.png')
    this.load.image('two', 'images/digit2.png')
    this.load.image('three', 'images/digit3.png')
    this.load.image('up', 'images/upwards-button.png')
    this.load.image('down', 'images/downwards-button.png')
    this.load.audio('rock', 'sound/rock.wav');
    this.load.audio('paper', 'sound/paper.wav');
    this.load.audio('scissors', 'sound/scissors.wav');
  }

  init(data: any): void {
    console.log("init")
    this.winner = '';
    this.losers = [];
    // this.resetGroups();
    if (data.sp != undefined) {
      this.sp = data.sp;
      this.selectedButton = data.selectedButton;
      this.counts = data.counts
      this.itemSpeed = data.itemSpeed
    } else {
      console.log("Initializing with default data")
      this.sp = SPAWNPATTERNS.grouped;
      this.selectedButton = 1;
      this.counts = 15
    }
  }

  create(): void {
    // 

    // this.myRock = new Item({
    //   scene: this,
    //   x: 400,
    //   y: 300,
    //   texture: 'rock',
    //   targetGroup: this.items
    // });

    this.totalGroups = 3
    let groupCounts = this.counts * this.totalGroups
    this.rockCount = this.counts;
    this.paperCount = this.counts;
    this.scissorsCount = this.counts;
    this.rocks = new Phaser.GameObjects.Group(this, [], { maxSize: groupCounts, runChildUpdate: true });
    this.scissors = new Phaser.GameObjects.Group(this, [], { maxSize: groupCounts, runChildUpdate: true });
    this.papers = new Phaser.GameObjects.Group(this, [], { maxSize: groupCounts, runChildUpdate: true });
    this.items = new Phaser.GameObjects.Group(this, [], { maxSize: this.rocks.maxSize + this.scissors.maxSize + this.papers.maxSize, runChildUpdate: true });
    this.initializeGroups()

    this.add.text(0, 0, 'Rock count', { font: '"Press Start 2P"' });
    this.rockCountText = this.add.text(62, 0, `${this.rockCount}`, { font: '"Press Start 2P"' });
    this.add.text(100, 0, 'Paper count', { font: '"Press Start 2P"' });
    this.paperCountText = this.add.text(162, 0, `${this.paperCount}`, { font: '"Press Start 2P"' });
    this.add.text(200, 0, 'Scissors count', { font: '"Press Start 2P"' });
    this.scissorsCountText = this.add.text(272, 0, `${this.scissorsCount}`, { font: '"Press Start 2P"' });

    //RESTART button
    this.add.sprite(760, 10, 'restart').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.particles.emitters.removeAll();
      this.scene.restart({
        sp: this.sp,
        selectedButton: this.selectedButton,
        counts: this.counts,
        itemSpeed: this.itemSpeed
      });

    });


    // Item speed
    this.add.sprite(510, 10, 'up').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.itemSpeed = this.itemSpeed + 1
      this.itemSpeedText.setText(`${this.itemSpeed}`)
    })
    this.add.sprite(560, 10, 'down').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.itemSpeed = this.itemSpeed - 1
      this.itemSpeedText.setText(`${this.itemSpeed}`)
    })
    this.itemSpeedText = this.add.text(540, 15, `${this.itemSpeed}`, { font: '"Press Start 2P"' });
    this.add.text(520, 0, `Item speed`, { font: '"Press Start 2P"' });
    // Amount of items to spawn
    this.add.sprite(610, 10, 'up').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.counts = this.counts + 1
      this.totalCountText.setText(`${this.counts}`)
    })
    this.add.sprite(660, 10, 'down').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.counts = this.counts - 1
      this.totalCountText.setText(`${this.counts}`)
    })
    this.totalCountText = this.add.text(640, 15, `${this.counts}`, { font: '"Press Start 2P"' });
    this.add.text(620, 0, `Item amount`, { font: '"Press Start 2P"' });
    // Spawn Patterns
    this.add.text(690, 0, `Spawn Patterns`, { font: '"Press Start 2P"' });
    let one = this.add.sprite(690, 10, 'one').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.buttons.one.setAlpha(1);
      this.buttons.two.setAlpha(0.5);
      this.buttons.three.setAlpha(0.5);
      this.selectedButton = 1;
      this.sp = SPAWNPATTERNS.grouped
    }).setAlpha(this.selectedButton === 1 ? 1 : 0.5);
    let two = this.add.sprite(713, 10, 'two').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.buttons.one.setAlpha(0.5);
      this.buttons.two.setAlpha(1);
      this.buttons.three.setAlpha(0.5);
      this.selectedButton = 2;
      this.sp = SPAWNPATTERNS.wholeMap
    }).setAlpha(this.selectedButton === 2 ? 1 : 0.5);
    let three = this.add.sprite(736, 10, 'three').setScale(0.2).setOrigin(0).setInteractive().on('pointerdown', () => {
      this.buttons.one.setAlpha(0.5);
      this.buttons.two.setAlpha(0.5);
      this.buttons.three.setAlpha(1);
      this.selectedButton = 3;
      this.sp = SPAWNPATTERNS.column
    }).setAlpha(this.selectedButton === 3 ? 1 : 0.5);
    this.buttons = { one, two, three }
  }

  resetGroups() {
    this.items && this.items.clear();
    this.papers && this.papers.clear();
    this.rocks && this.rocks.clear();
    this.scissors && this.scissors.clear();
  }
  initializeGroups() {
    this.resetGroups();
    let spriteScale = 0.2;
    this.items.createMultiple({
      classType: Item,
      key: 'rock',
      quantity: this.rockCount,
      active: true,
      visible: true,
      setScale: { x: spriteScale, y: spriteScale },
    })

    this.items.createMultiple({
      classType: Item,
      key: 'paper',
      quantity: this.paperCount,
      active: true,
      visible: true,
      setScale: { x: spriteScale, y: spriteScale }
    })

    this.items.createMultiple({
      classType: Item,
      key: 'scissors',
      quantity: this.scissorsCount,
      active: true,
      visible: true,
      setScale: { x: spriteScale, y: spriteScale }
    })
    this.particles = this.add.particles('rock');
    this.items.children.iterate((child: Item) => {
      child.speed = this.itemSpeed;
      child.particles = this.particles;
      switch (child.texture.key) {
        case "rock":
          this.rocks.add(child)
          child.setX(Phaser.Math.Between(this.sp.rock.x[0], this.sp.rock.x[1]))
          child.setY(Phaser.Math.Between(this.sp.rock.y[0], this.sp.rock.y[1]))
          child.target = this.scissors
          child.group = this.rocks
          child.avoid = this.papers
          break;
        case "paper":
          this.papers.add(child)
          child.setX(Phaser.Math.Between(this.sp.paper.x[0], this.sp.paper.x[1]))
          child.setY(Phaser.Math.Between(this.sp.paper.y[0], this.sp.paper.y[1]))
          child.target = this.rocks
          child.group = this.papers
          child.avoid = this.scissors
          break;
        case "scissors":
          this.scissors.add(child)
          child.setX(Phaser.Math.Between(this.sp.scissors.x[0], this.sp.scissors.x[1]))
          child.setY(Phaser.Math.Between(this.sp.scissors.y[0], this.sp.scissors.y[1]))
          child.target = this.papers
          child.group = this.scissors
          child.avoid = this.rocks
          break;
        default:
          break;
      }
    });

    this.add.existing(this.items)
    this.add.existing(this.rocks)
    this.add.existing(this.papers)
    this.add.existing(this.scissors)
    this.physics.add.collider(this.items, this.items, this.onItemCollision, undefined, this);
  }

  onItemCollision(item1: Item, item2: Item) {
    if (item1.target === item2.group) {
      this.eat(item1, item2)
    } else if (item2.target === item1.group) {
      this.eat(item2, item1)
    }
    this.updateCounters();
  }

  updateCounters() {
    this.rockCountText.setText(`${this.rocks.getLength()}`)
    this.paperCountText.setText(`${this.papers.getLength()}`)
    this.scissorsCountText.setText(`${this.scissors.getLength()}`)
  }

  eat(winner: Item, loser: Item) {
    loser.group.remove(loser)
    winner.group.add(loser)
    if (loser.group.getLength() === 0) {
      this.losers.push(loser.texture.key)
    }
    loser.setTexture(winner.texture.key)
    loser.target = winner.target
    loser.group = winner.group
    //Hacky, the sound has the same name as the texture
    this.sound.play(winner.texture.key, { volume: 0.3 })
  }

  showWinner() {
    this.items.children.iterate((child: Item) => {
      child.bounce();
      child.startEmitting();
    });
  }

  update(time: number, delta: number): void {
    if (this.winner === '' && this.losers.length === this.totalGroups - 1) {
      let difference = POSSIBLEWINNERS.filter(x => !this.losers.includes(x));
      this.winner = difference[0]
      console.log("winner!", this.winner)
      this.showWinner();

    }
  }
}

