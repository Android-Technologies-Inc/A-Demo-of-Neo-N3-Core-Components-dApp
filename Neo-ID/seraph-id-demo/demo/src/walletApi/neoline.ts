let initResult: Promise<{ neoDapi: any; neo3Dapi: any }>;

function init() {
  return new Promise<{ neoDapi: any; neo3Dapi: any }>((resovle, reject) => {
    function onReady() {
      if (!(window as any).NEOLine || !(window as any).NEOLineN3) return;
      const neoDapi = new (window as any).NEOLine.Init();
      const neo3Dapi = new (window as any).NEOLineN3.Init();
      return resovle({ neoDapi, neo3Dapi });
    }
    onReady();
    window.addEventListener('NEOLine.NEO.EVENT.READY', onReady);
    window.addEventListener('NEOLine.N3.EVENT.READY', onReady);
    setTimeout(() => reject(new Error('neoline not installed!')), 3000);
  });
}

export function getNeoDapiInstances() {
  if (!initResult) {
    initResult = init();
  }
  return initResult;
}
