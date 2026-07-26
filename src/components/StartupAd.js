import { useEffect } from "react";
import { preloadEventCreatedAd, showStartupAdOnce } from "../services/ads";

export function StartupAd() {
  useEffect(() => {
    preloadEventCreatedAd();
    return showStartupAdOnce();
  }, []);

  return null;
}
