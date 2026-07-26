import { Platform } from "react-native";
import mobileAds, { AdEventType, AppOpenAd, InterstitialAd, TestIds } from "react-native-google-mobile-ads";

const USE_TEST_ADS = false;

const productionAdUnits = {
  androidAppOpen: "ca-app-pub-8302015651143248/1808148482",
  iosAppOpen: "ca-app-pub-8302015651143248/9730870538",
  androidEventCreatedInterstitial: "ca-app-pub-8302015651143248/6862264697",
  iosEventCreatedInterstitial: "ca-app-pub-8302015651143248/7867124520"
};

let initializePromise;
let eventInterstitial;
let eventInterstitialLoaded = false;
let eventInterstitialLoading = false;

function initializeAds() {
  if (!initializePromise) {
    initializePromise = mobileAds()
      .initialize()
      .catch(() => null);
  }
  return initializePromise;
}

function productionOrTest(androidId, iosId, testId) {
  if (USE_TEST_ADS) return testId;
  const id = Platform.OS === "ios" ? iosId : androidId;
  return id && !id.startsWith("PASTE_") ? id : testId;
}

const appOpenUnitId = productionOrTest(productionAdUnits.androidAppOpen, productionAdUnits.iosAppOpen, TestIds.APP_OPEN);
const eventInterstitialUnitId = productionOrTest(
  productionAdUnits.androidEventCreatedInterstitial,
  productionAdUnits.iosEventCreatedInterstitial,
  TestIds.INTERSTITIAL
);

export function showStartupAdOnce() {
  let cancelled = false;
  let cleanup = () => {};

  initializeAds().finally(() => {
    if (cancelled) return;

    const appOpenAd = AppOpenAd.createForAdRequest(appOpenUnitId, {
      requestNonPersonalizedAdsOnly: true
    });

    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      if (!cancelled) appOpenAd.show();
      cleanup();
    });
    const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, cleanup);

    cleanup = () => {
      unsubscribeLoaded();
      unsubscribeError();
    };

    appOpenAd.load();
  });

  return () => {
    cancelled = true;
    cleanup();
  };
}

export function preloadEventCreatedAd() {
  if (eventInterstitial || eventInterstitialLoading) return;
  eventInterstitialLoading = true;

  initializeAds().finally(() => {
    eventInterstitial = InterstitialAd.createForAdRequest(eventInterstitialUnitId, {
      requestNonPersonalizedAdsOnly: true
    });

    eventInterstitial.addAdEventListener(AdEventType.LOADED, () => {
      eventInterstitialLoaded = true;
      eventInterstitialLoading = false;
    });
    eventInterstitial.addAdEventListener(AdEventType.CLOSED, () => {
      eventInterstitialLoaded = false;
      eventInterstitial = null;
      preloadEventCreatedAd();
    });
    eventInterstitial.addAdEventListener(AdEventType.ERROR, () => {
      eventInterstitialLoaded = false;
      eventInterstitialLoading = false;
      eventInterstitial = null;
    });

    eventInterstitial.load();
  });
}

export function showEventCreatedAd() {
  if (eventInterstitialLoaded && eventInterstitial) {
    eventInterstitial.show();
    return;
  }

  preloadEventCreatedAd();
}
