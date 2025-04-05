"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./Main.css";
import useSocket from "@/hooks/useSocket";
import Space from "@/components/Space/Space";
import { useSession } from "next-auth/react";

export default function Main() {
  const socket = useSocket();
  const router = useRouter();
  const [spaces, setSpaces] = useState([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    if (!socket) return;
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("userJoined", (data: any) => {
      console.log("User Joined", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchSpaces() {
      const response = await fetch("/api/spaces");
      const data = await response.json();
      setSpaces(data.spaces);
    }
    fetchSpaces();
  }, [status]);

  const handleJoin = (roomName: string) => {
    // socket.emit("joinRoom", roomName);
    router.push(`/spaces/${roomName}`);
  };

  if (status !== "authenticated") return <></>;

  return (
    <div className="spaces-container">
      {spaces.map((space) => (
        <Space key={space.id} space={space} onJoin={handleJoin} />
      ))}
    </div>
  );
}
