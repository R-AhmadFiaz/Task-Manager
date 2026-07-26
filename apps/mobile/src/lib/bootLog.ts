// Diagnostic-only startup instrumentation. Imported first, before any other
// app module, so it can install a global JS error handler before anything
// else runs. It only observes and forwards to the previous handler — it
// never changes app behavior. Every line is meant to be read from the Metro
// terminal while reproducing the crash on a physical device.

export function boot(label: string): void {
  // eslint-disable-next-line no-console
  console.log(`[BOOT] ${label}`);
}

boot("bootLog module evaluated (first module in the bundle)");

type ErrorHandler = (error: Error, isFatal?: boolean) => void;
declare const ErrorUtils:
  | {
      getGlobalHandler: () => ErrorHandler;
      setGlobalHandler: (handler: ErrorHandler) => void;
    }
  | undefined;

if (typeof ErrorUtils !== "undefined" && ErrorUtils) {
  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(
      `[BOOT-FATAL] isFatal=${String(isFatal)} name=${error?.name ?? "?"} message=${error?.message ?? String(error)}\n${error?.stack ?? "(no stack)"}`,
    );
    previousHandler(error, isFatal);
  });
  boot("global ErrorUtils handler installed");
} else {
  console.warn("[BOOT] ErrorUtils unavailable — cannot install a global JS error handler");
}
