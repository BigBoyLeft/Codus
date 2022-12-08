"use strict";
(() => {
  // src/client/MyOther.client.ts
  var myRandomData = {
    randomStuff: true
  };

  // src/client/client.ts
  on("onResourceStart", (resName) => {
    if (resName === GetCurrentResourceName()) {
      console.log(myRandomData);
      console.log("TypeScript boilerplate started!");
    }
  });
})();
