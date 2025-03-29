import TavernScene from '/scenes/TavernScene.js';
import ForestScene from '/scenes/ForestScene.js';
import BattleScene from '/scenes/BattleScene.js';

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 400,
    physics: {  
        default: 'arcade',
        arcade: {
            debug: false // collision debugging
        }
    },
    scene: [BattleScene, TavernScene, ForestScene,], 
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH 
    },
    fps: {
        target: 60, 
        forceSetTimeOut: true 
    }
};

new Phaser.Game(config);