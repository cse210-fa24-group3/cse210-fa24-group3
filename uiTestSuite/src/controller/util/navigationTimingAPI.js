export const extractDataFromPerformanceTiming = (timing, ...dataNames) => {
  const navigationStart = timing.navigationStart;

  const extractedData = {};
  dataNames.forEach((name) => {
    extractedData[name] = timing[name] - navigationStart;
  });
  extractedData["domReady"] = timing.domComplete - timing.responseEnd;
  extractedData["blankScreen"] = timing.responseStart - timing.navigationStart;
  extractedData["redirect"] = timing.redirectEnd - timing.redirectStart;
  extractedData["lookupDomain"] = timing.domainLookupEnd - timing.domainLookupStart;
  extractedData["ttfb"] = timing.responseStart - timing.navigationStart;
  extractedData["request"] = timing.responseEnd - timing.requestStart;
  extractedData["loadEvent"] = timing.loadEventEnd - timing.loadEventStart;
  extractedData["appcache"] = timing.domainLookupStart - timing.fetchStart;
  extractedData["unloadEvent"] = timing.unloadEventEnd - timing.unloadEventStart;
  extractedData["connect"] = timing.connectEnd - timing.connectStart;
  return extractedData;
};

export default {
  extractDataFromPerformanceTiming,
};
