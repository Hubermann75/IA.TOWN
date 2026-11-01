/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "2891cd1fd5b2489fa6f2f4efc6d43f20"
  }, {
    "url": "pwa-512x512.png",
    "revision": "641afa7e7af13bbb1304d09d6f3b3250"
  }, {
    "url": "pwa-192x192.png",
    "revision": "57b811db6a629fc6067f3e182c492931"
  }, {
    "url": "index.html",
    "revision": "4e0d1003b178cbd4623fdeb95fcc9c9d"
  }, {
    "url": "icon.svg",
    "revision": "795cab1f45c49a62d58a7d1835f6a894"
  }, {
    "url": "icon-maskable.svg",
    "revision": "09f4d1e6d29cce8b90da13313e28756f"
  }, {
    "url": "favicon.ico",
    "revision": "42bad7e04f67b09ec2d36efa01306b9f"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9efeb232fd007e639e9a2526c7921879"
  }, {
    "url": "skins/skyline_panorama.png",
    "revision": "628d96892382d2c42b01376f7801e597"
  }, {
    "url": "skins/design_system_sheet.png",
    "revision": "99547589aefe33939a1a6c2615393516"
  }, {
    "url": "skins/centmine_shelter.png",
    "revision": "fdb19346091a8031511ec2e03456d5bb"
  }, {
    "url": "skins/buildings_cutaway.png",
    "revision": "a0fc8a08f2bed6e5d5d0547b6eccda39"
  }, {
    "url": "assets/index-mLveLRjB.js",
    "revision": null
  }, {
    "url": "assets/index-CLcnIS8z.css",
    "revision": null
  }, {
    "url": "assets/aistudio/file_00000000c5d081f49d2b64745d5e740d_81159ac6.png",
    "revision": null
  }, {
    "url": "assets/aistudio/file_00000000bec0824394601379ca5bad3f_e9241fe4.png",
    "revision": null
  }, {
    "url": "assets/aistudio/file_000000004f8081f4b881b606697f033a_3b29286a.png",
    "revision": null
  }, {
    "url": "assets/aistudio/file_0000000045d881f483bce23ac527a6f6_9b6e63a6.png",
    "revision": null
  }, {
    "url": "assets/aistudio/file_00000000439081f4ac75925d6039d5ed_a129bb5c.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9efeb232fd007e639e9a2526c7921879"
  }, {
    "url": "favicon.ico",
    "revision": "42bad7e04f67b09ec2d36efa01306b9f"
  }, {
    "url": "icon.svg",
    "revision": "795cab1f45c49a62d58a7d1835f6a894"
  }, {
    "url": "pwa-192x192.png",
    "revision": "57b811db6a629fc6067f3e182c492931"
  }, {
    "url": "pwa-512x512.png",
    "revision": "641afa7e7af13bbb1304d09d6f3b3250"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "2891cd1fd5b2489fa6f2f4efc6d43f20"
  }, {
    "url": "skins/buildings_cutaway.png",
    "revision": "a0fc8a08f2bed6e5d5d0547b6eccda39"
  }, {
    "url": "skins/centmine_shelter.png",
    "revision": "fdb19346091a8031511ec2e03456d5bb"
  }, {
    "url": "skins/design_system_sheet.png",
    "revision": "99547589aefe33939a1a6c2615393516"
  }, {
    "url": "skins/skyline_panorama.png",
    "revision": "628d96892382d2c42b01376f7801e597"
  }, {
    "url": "manifest.webmanifest",
    "revision": "b3feacbeebb7488c731bce464b467f33"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
