import { io } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1$/, "");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
