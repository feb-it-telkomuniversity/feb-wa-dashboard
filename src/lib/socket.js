import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (typeof window === "undefined") return null;

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001", {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });
    }

    return socket;
};
