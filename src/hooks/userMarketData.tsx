import { useEffect, useState, useRef, useCallback } from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "https://capital-server-gnsu.onrender.com";
const SECRET_KEY = "aurify@123";

// Define types for better type safety
interface MarketData {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  timestamp?: number;
  [key: string]: any;
}

interface ServerToClientEvents {
  "market-data": (data: MarketData) => void;
  error: (error: string) => void;
  connect: () => void;
  disconnect: () => void;
}

interface ClientToServerEvents {
  "request-data": (symbols: string[]) => void;
}

export default function useMarketData(symbols: string[] = ["GOLD"]) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const handleMarketData = useCallback((data: MarketData) => {
    if (data?.symbol?.toLowerCase() === "gold") {
      setMarketData(data);
    }
  }, []);

  useEffect(() => {
    console.log("📡 Connecting to WebSocket...");
   
    // Initialize socket connection with proper typing
    socketRef.current = io(SOCKET_SERVER_URL, {
      query: { secret: SECRET_KEY },
      transports: ["websocket"],
      withCredentials: true,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    const socket = socketRef.current;

    // Null check to ensure socket exists
    if (!socket) {
      console.error("❌ Failed to initialize socket connection");
      return;
    }

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      socket.emit("request-data", symbols);
    });

    socket.on("market-data", handleMarketData);
    
    socket.on("error", (error: string) => {
      console.error("❌ WebSocket error:", error);
    });

    // Cleanup function
    return () => {
      console.log("🔌 Disconnecting WebSocket...");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [handleMarketData, symbols]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return { 
    marketData,
    isConnected: socketRef.current?.connected || false
  };
}