export interface ISpriteItemConstructor {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string | Phaser.Textures.Texture;
  frame?: string | number;
  targetGroup?: Phaser.GameObjects.Group;
}