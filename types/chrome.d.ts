// Chrome Extension API type declarations for Next.js
declare global {
  interface Window {
    chrome?: {
      runtime: {
        sendMessage: (message: any) => Promise<any>;
        id: string;
      };
    };
  }
}

export {};
