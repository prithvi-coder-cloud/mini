import { io } from "socket.io-client";
const socket = io("http://localhost:6005"); // Connect to backend
export default socket;
