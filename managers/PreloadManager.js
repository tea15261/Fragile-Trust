export default class PreloadManager {
    static preloadAssets(scene) {
        // Common assets
        scene.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 });
        scene.load.image('customCursor', 'assets/cursor/hand_point.png');
        scene.load.image('openCursor', 'assets/cursor/hand_open.png');
        scene.load.image('closedCursor', 'assets/cursor/hand_closed.png');

        // Weapon assets
        scene.load.image('fists', 'assets/player/weapon/Hands holding nothing.png');
        
        // Environment assets
        scene.load.image('forest', 'assets/environment/forest-backdrop.png');
        scene.load.image('evil-forest', 'assets/environment/forest-backdrop-evil.png');
        scene.load.image('night-forest', 'assets/environment/night-forest-backdrop.jpg');
        scene.load.image('battle-scene', 'assets/environment/battle-arena.png');
        scene.load.image('tavern', 'assets/environment/tavern.jpg');
        
        // NPC assets
        scene.load.spritesheet('forest-cutter', 'assets/npc/forest-cutter.png', { frameWidth: 90, frameHeight: 75 });
        scene.load.spritesheet('stranger', 'assets/npc/Stranger.png', { frameWidth: 64, frameHeight: 64 });
    }
}
