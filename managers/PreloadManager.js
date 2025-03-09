export default class PreloadManager {
    static preloadAssets(scene) {
        // common assets
        scene.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 });
        scene.load.image('customCursor', 'assets/cursor/hand_point.png');
        scene.load.image('openCursor', 'assets/cursor/hand_open.png');
        scene.load.image('closedCursor', 'assets/cursor/hand_closed.png');

        // weapon assets
        scene.load.image('fists', 'assets/player/weapon/Hands holding nothing.png');
        
        // environment assets
        scene.load.image('forest', 'assets/environment/forest-backdrop.png');
        scene.load.image('evil-forest', 'assets/environment/forest-backdrop-evil.png');
        scene.load.image('night-forest', 'assets/environment/night-forest-backdrop.jpg');
        scene.load.image('battle-scene', 'assets/environment/battle-arena.png');
        scene.load.image('tavern', 'assets/environment/tavern.jpg');
        
        // NPC assets
        scene.load.spritesheet('forest-cutter', 'assets/npc/forest-cutter.png', { frameWidth: 90, frameHeight: 75 });
        scene.load.spritesheet('stranger', 'assets/npc/Stranger.png', { frameWidth: 64, frameHeight: 64 });

        // Monster assets
        scene.load.spritesheet('SkeletonBaseIdle', 'assets/enemy/Skeleton-crew/Skelton-base/idle/Idle-Sheet (1).png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('SkeletonBaseDeath', 'assets/enemy/Skeleton-crew/Skelton-base/death/Death-Sheet.png', { frameWidth: 96, frameHeight: 64 });

        scene.load.spritesheet('SkeletonWarriorIdle', 'assets/enemy/Skeleton-crew/Skeleton-warrior/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('SkeletonWarriorDeath', 'assets/enemy/Skeleton-crew/Skeleton-warrior/death/Death-Sheet.png', { frameWidth: 64, frameHeight: 48 });

        scene.load.spritesheet('SkeletonRogueIdle', 'assets/enemy/Skeleton-crew/Skeleton-rogue/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('SkeletonRogueDeath', 'assets/enemy/Skeleton-crew/Skeleton-rogue/death/Death-Sheet.png', { frameWidth: 64, frameHeight: 64 });
        
        scene.load.spritesheet('SkeletonMageIdle', 'assets/enemy/Skeleton-crew/Skeleton-mage/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('SkeletonMageDeath', 'assets/enemy/Skeleton-crew/Skeleton-mage/death/Death-Sheet.png', { frameWidth: 64, frameHeight: 64 });
        
        scene.load.spritesheet('OrcBaseIdle', 'assets/enemy/Orc-crew/Orc-base/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('OrcBaseDeath', 'assets/enemy/Orc-crew/Orc-base/death/Death-Sheet.png', { frameWidth: 64, frameHeight: 64 });
        
        scene.load.spritesheet('OrcWarriorIdle', 'assets/enemy/Orc-crew/Orc-warrior/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('OrcWarriorDeath', 'assets/enemy/Orc-crew/Orc-warrior/death/Death-Sheet.png', { frameWidth: 96, frameHeight: 80 });
        
        scene.load.spritesheet('OrcRogueIdle', 'assets/enemy/Orc-crew/Orc-rogue/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('OrcRogueDeath', 'assets/enemy/Orc-crew/Orc-rogue/death/Death-Sheet.png', { frameWidth: 64, frameHeight: 64 });
        
        scene.load.spritesheet('OrcMageIdle', 'assets/enemy/Orc-crew/Orc-mage/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('OrcMageDeath', 'assets/enemy/Orc-crew/Orc-mage/death/Death-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    }
}
