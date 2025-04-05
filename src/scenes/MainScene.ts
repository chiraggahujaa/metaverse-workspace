import Phaser from 'phaser';
import { GridEngine } from 'grid-engine';
import { getSession } from 'next-auth/react';

export default class MainScene extends Phaser.Scene {
    private gridEngine!: GridEngine;
    private userRef: {
        name: string; x: number; y: number
    };
    private otherUsers: { socketId: string; userId: string; x: number; y: number }[];
    private socket: any;
    private roomName: string;
    private otherUserCircles: { [key: string]: Phaser.GameObjects.Arc };
    private otherUserLabels: { [key: string]: Phaser.GameObjects.Text };
    private otherUserAvatars: { [key: string]: Phaser.GameObjects.Image };
    private background!: Phaser.GameObjects.TileSprite;

    constructor() {
        super({ key: 'MainScene' });
        this.userRef = { x: 0, y: 0, name: 'Me' };
        this.otherUsers = [];
        this.socket = null;
        this.roomName = '';
        this.otherUserCircles = {};
        this.otherUserLabels = {};
        this.otherUserAvatars = {};
    }

    async init(data: any) {
        this.userRef = data.userRef;
        this.otherUsers = data.otherUsers;
        this.socket = data.socket;
        this.roomName = data.roomName;

        const session = await getSession();
        console.log('session.user', session?.user);
        if (session) {
            this.userRef.name = session.user?.name || 'Me';
        }
    }

    preload() {
        // Load assets here
        this.load.image('bg', '/images/wood_floor_5.jpg');
        this.load.image('player', '/images/player.png');
    }

    async create() {
        // Add background image and repeat it
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg');
        this.background.setOrigin(0, 0);

        // Add player image
        const player = this.add.image(this.userRef.x, this.userRef.y, 'player');
        const desiredHeight = 80;
        const scale = desiredHeight / player.height;
        player.setScale(scale);

        const userLabel = this.add.text(this.userRef.x, this.userRef.y - 20, this.userRef.name || 'me', { color: '#ffffff' });

        this.input.keyboard?.on('keydown', (event: any) => {
            const step = 10;
            let newX = this.userRef.x;
            let newY = this.userRef.y;
            switch (event.key) {
                case 'ArrowUp':
                    newY -= step;
                    break;
                case 'ArrowDown':
                    newY += step;
                    break;
                case 'ArrowLeft':
                    newX -= step;
                    break;
                case 'ArrowRight':
                    newX += step;
                    break;
                default:
                    return;
            }

            const isOccupied = this.otherUsers.some(user => user.x === newX && user.y === newY);

            if (!isOccupied) {
                this.userRef.x = newX;
                this.userRef.y = newY;
                player.x = newX;
                player.y = newY;
                userLabel.x = newX;
                userLabel.y = newY - 20;
                console.log('move', this.userRef);
                this.socket.emit('move', {
                    room: this.roomName,
                    x: newX,
                    y: newY,
                });
            }
        });

        await this.loadOtherUsers();
    }

    async loadOtherUsers() {
        for (const user of this.otherUsers) {
            if (user.userId) {
                const userData = await fetch(`/api/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userIds: [user.userId] }),
                }).then(res => res.json());
                console.log('user', userData);

                if (userData.avatars && userData.avatars.length > 0) {
                    const avatar = userData.avatars[0];
                    if (avatar.imageUrl) {
                        this.load.image(`avatar-${user.userId}`, avatar.imageUrl);
                        this.load.once('complete', () => {
                            this.otherUserAvatars[user.socketId] = this.add.image(user.x, user.y, `avatar-${user.userId}`).setDisplaySize(20, 20);
                        });
                        this.load.start();
                    }
                }
            }
        }
    }

    updateUserPosition(data: { socketId: string; x: number; y: number, userId: any }) {
        console.log('updateUserPosition', data);
        const userIndex = this.otherUsers.findIndex(user => user.socketId === data.socketId);
        if (userIndex !== -1) {
            // Update existing user's position
            this.otherUsers[userIndex].x = data.x;
            this.otherUsers[userIndex].y = data.y;

            if (this.otherUserCircles[data.socketId]) {
                this.otherUserCircles[data.socketId].x = data.x;
                this.otherUserCircles[data.socketId].y = data.y;
            }

            if (this.otherUserLabels[data.socketId]) {
                this.otherUserLabels[data.socketId].x = data.x;
                this.otherUserLabels[data.socketId].y = data.y - 20;
            }

            if (this.otherUserAvatars[data.socketId]) {
                this.otherUserAvatars[data.socketId].x = data.x;
                this.otherUserAvatars[data.socketId].y = data.y;
            }
        } else {
            // Add new user at the given position
            const newUser = { socketId: data.socketId, userId: '', x: data.x, y: data.y };
            this.otherUsers.push(newUser);

            const otherUserColor = Phaser.Display.Color.RandomRGB();
            this.otherUserCircles[data.socketId] = this.add.circle(data.x, data.y, 10, otherUserColor.color);
            this.otherUserLabels[data.socketId] = this.add.text(data.x, data.y - 20, newUser.userId || '', { color: '#ffffff' });
        }
    }

    removeUser(socketId: string) {
        const userIndex = this.otherUsers.findIndex(user => user.socketId === socketId);
        if (userIndex !== -1) {
            this.otherUsers.splice(userIndex, 1);

            if (this.otherUserCircles[socketId]) {
                this.otherUserCircles[socketId].destroy();
                delete this.otherUserCircles[socketId];
            }

            if (this.otherUserLabels[socketId]) {
                this.otherUserLabels[socketId].destroy();
                delete this.otherUserLabels[socketId];
            }

            if (this.otherUserAvatars[socketId]) {
                this.otherUserAvatars[socketId].destroy();
                delete this.otherUserAvatars[socketId];
            }
        }
    }

    update() {
        // this.background.tilePositionX += 1;
        // this.background.tilePositionY += 1;

        this.otherUsers.forEach(user => {
            if (!this.otherUserCircles[user.socketId]) {
                const otherUserColor = Phaser.Display.Color.RandomRGB();
                this.otherUserCircles[user.socketId] = this.add.circle(user.x, user.y, 10, otherUserColor.color);
                this.otherUserLabels[user.socketId] = this.add.text(user.x, user.y - 20, user.userId || '', { color: '#ffffff' });
            } else {
                this.otherUserCircles[user.socketId].x = user.x;
                this.otherUserCircles[user.socketId].y = user.y;
                this.otherUserLabels[user.socketId].x = user.x;
                this.otherUserLabels[user.socketId].y = user.y - 20;
            }

            if (this.otherUserAvatars[user.socketId]) {
                this.otherUserAvatars[user.socketId].x = user.x;
                this.otherUserAvatars[user.socketId].y = user.y;
            }
        });
    }
}