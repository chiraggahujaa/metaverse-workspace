"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { getSession } from "next-auth/react";
import useSocket from "@/hooks/useSocket";
import Phaser from "phaser";
import PreloaderScene from "@/scenes/PreloaderScene";
import MainScene from "@/scenes/MainScene";

const SpaceDetail = () => {
  const params = useParams();
  const router = useRouter();
  const roomName = params.roomName;

  const socket = useSocket();
  const [space, setSpace] = useState<any>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const isDevelopment = process.env.NODE_ENV === "development";
  const userRef = useRef<{ x: number; y: number; name?: string }>({
    x: 0,
    y: 0,
  });
  const [otherUsers, setOtherUsers] = useState<
    { socketId: string; userId: string; x: number; y: number }[]
  >([]);
  const [x, y] = useMemo(() => {
    if (space) {
      let [x, y] = space.dimensions.split("x").map(Number);
      x = 1000;
      y = 1000;
      x = Math.min(x, window.innerWidth);
      y = Math.min(y, window.innerHeight);
      return [x, y];
    }
    return [0, 0];
  }, [space]);

  useEffect(() => {
    console.log("roomName:", roomName);
    if (!roomName) return;

    async function fetchSpace() {
      const response = await fetch(`/api/spaces/${roomName}`);
      const data = await response.json();
      setSpace(data.space);
    }
    fetchSpace();
  }, [roomName]);

  useEffect(() => {
    if (!socket || !roomName) return;

    socket.emit("joinRoom", roomName);

    socket.on("userMoved", (data: any) => {
      console.log("userMoved", data);

      const handleSetOtherUsers = (prev: any) => {
        const existingUserIndex = prev.findIndex(
          (user: any) => user.socketId === data.socketId
        );
        if (existingUserIndex !== -1) {
          const updatedUsers = [...prev];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            x: data.x,
            y: data.y,
          };
          return updatedUsers;
        } else {
          return [
            ...prev,
            {
              socketId: data.socketId,
              userId: data.userId,
              x: data.x,
              y: data.y,
            },
          ];
        }
      };

      setOtherUsers((prev) => {
        const res = handleSetOtherUsers(prev);
        console.log("setOtherUsers", res);
        return res;
      });

      // Update MainScene with new user data
      if (game) {
        const mainScene = game.scene.getScene("MainScene") as MainScene;
        mainScene.updateUserPosition(data);
      }
    });

    socket.on("userLeft", (data: any) => {
      setOtherUsers((prev) =>
        prev.filter((user) => user.socketId !== data.socketId)
      );

      // Update MainScene with user removal
      if (game) {
        const mainScene = game.scene.getScene("MainScene") as MainScene;
        mainScene.removeUser(data.socketId);
      }
    });

    return () => {
      socket.emit("leaveRoom", roomName);
    };
  }, [socket, roomName, game]);

  useEffect(() => {
    async function initPhaser() {
      if (space && game === null) {
        const config = {
          type: Phaser.AUTO,
          width: x,
          height: y,
          mode: Phaser.Scale.ScaleModes.RESIZE,
          backgroundColor: "#1d212d",
          parent: "phaser-game",
          scene: [PreloaderScene, MainScene],
          physics: {
            default: "arcade",
            arcade: {
              debug: isDevelopment,
            },
          },
          plugins: {
            scene: [
              {
                key: "gridEngine",
                plugin: "GridEngine",
                mapping: "gridEngine",
              },
            ],
          },
        };
        const newGame = new Phaser.Game(config);
        newGame.scene.start("MainScene", {
          userRef: userRef.current,
          otherUsers,
          socket,
          roomName,
        });

        setGame(newGame);
      }
    }

    initPhaser();
  }, [space, otherUsers, game]);

  const handleLeaveSpace = () => {
    if (socket && roomName) {
      socket.emit("leaveRoom", roomName);
      router.push("/");
    }
  };

  if (!space) return <div>Loading...</div>;
  
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {space.name} ({x} x {y})
        </h1>
        <button
          onClick={handleLeaveSpace}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff4d4d",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Leave Space
        </button>
      </div>
      <div
        id="phaser-game"
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></div>
    </div>
  );
}

export default SpaceDetail;