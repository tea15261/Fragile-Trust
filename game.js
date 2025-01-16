// Basic Phaser game setup
import {TavernScene} from '/scenes/TavernScene.js';
import {ForestScene} from '/scenes/ForestScene.js';

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // Collision debugging
        }
    },
    scene: [ForestScene, TavernScene ], 
    scale: {
        mode: Phaser.Scale.FIT, // Scale the game to fit the window
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game in the window
    },
    fps: {
        target: 60, 
        forceSetTimeOut: true 
    }
};

const game = new Phaser.Game(config);