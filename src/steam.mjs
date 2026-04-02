import * as child_process from "node:child_process"

import * as process from "node:process"

import * as path from "node:path"
import * as fs from "node:fs"

import * as url from "node:url"

import * as util from "./util.mjs"

/**
 * @param {number} steamGameId
 * @returns {[[string, string], [string, string, string], [string, string, string], [string]]}
 */
export function hyperLink(steamGameId) {
  const steamGameURLStore = `steam://store/${steamGameId}`;
  const steamGameURLPurchase = `steam://purchase/${steamGameId}`;

  const steamGameURLNews = `steam://appnews/${steamGameId}`;
  const steamGameURLLibrary = `steam://open/games/details/${steamGameId}`;
  const steamGameURLSettings = `steam://gameproperties/${steamGameId}`;

  const steamGameURLPreload = `steam://preload/${steamGameId}`;
  const steamGameURLInstall = `steam://install/${steamGameId}`;
  const steamGameURLUnInstall = `steam://uninstall/${steamGameId}`;

  const steamGameURLLaunch = `steam://launch/${steamGameId}/dialog`;

  return [
    [steamGameURLStore, steamGameURLPurchase],
    [steamGameURLNews, steamGameURLLibrary, steamGameURLSettings],
    [steamGameURLPreload, steamGameURLInstall, steamGameURLUnInstall],
    [steamGameURLLaunch],
  ];
}

/**
 * @returns {Promise<Map<number, [[number, string], [() => boolean, () => Promise<void>], string[]]>>}
 */
export async function getSteam() {
  /**
   * @type {[string[], [string, string]][]}
   */
  const registryList = [
    [["HKEY_LOCAL_MACHINE", "SOFTWARE", "Valve", "Steam"], ["InstallPath", ["REG", "SZ"].join("_")]],
    [["HKEY_LOCAL_MACHINE", "SOFTWARE", "WOW6432Node", "Valve", "Steam"], ["InstallPath", ["REG", "SZ"].join("_")]],
    [["HKEY_LOCAL_MACHINE", "SOFTWARE", "WOW6432Node", "Valve", "SteamService"], ["installpath_default", ["REG", "SZ"].join("_")]],
  ];

  /**
  * @type {string[]}
  */
  const steamLauncherPathList = (await globalThis.Promise.all(
    registryList.map(([registryDomainPath, [registryKeyName, registryKeyType]], _ind, _arr) => new globalThis.Promise((resolve, reject) => {
      registryDomainPath = registryDomainPath.join(path.sep);

      child_process.exec(
        [
          "reg",
          "query",
          `"${registryDomainPath}"`,
          "/v",
          `${registryKeyName}`,
          ["/reg", 64].join(":"),
        ].join(globalThis.String().padStart(1, " ")),
        (error, stdout, stderr) => {
          if (error !== null && error !== void null) {
            reject(error);

            return;
          }

          /**
          * @param {string | (null | undefined)} expectedPattern
          */
          const stdoutTrim = (expectedPattern) => {
            stdout = stdout.trim();

            if (expectedPattern !== null && expectedPattern !== void null) {
              if (stdout.startsWith(expectedPattern)) {
                stdout = stdout.slice(expectedPattern.length, stdout.length);
              }
            }
          };

          stdoutTrim(null);

          stdoutTrim(registryDomainPath);

          stdoutTrim(registryKeyName);
          stdoutTrim(registryKeyType);

          stdoutTrim(null);

          resolve(stdout);

          return;
        },
      );
    }))
  )).filter((_el, _ind, _arr) => !_arr.slice(0, _ind).includes(_el));

  /**
  * @type {Map<number, [[number, string], [() => boolean, () => Promise<void>], string[]]>}
  */
  const steamGameMap = new globalThis.Map([]);

  await globalThis.Promise.all(steamLauncherPathList.map(async (_el, _ind, _arr) => {
    const [directoryPath, ] = util.adjustDomainPath(_el);
    const [newDirectoryPath, [newFileName, newFileExtension]] = [[...directoryPath, "steamapps"], ["libraryfolders", "vdf"]];

    /**
    * @param {unknown[]} valueList
    * @returns {string}
    */
    const escapeRegExp = (valueList) => valueList.map((_el, _ind, _arr) => `\\${globalThis.String(_el)}`).join(globalThis.String());

    const spaceRegExp = new globalThis.RegExp(`[^${escapeRegExp(["S"])}]`, "gm");

    /**
    * @param {number} groupIndex
    * @returns {RegExp}
    */
    const variableRegExp = (groupIndex) => new globalThis.RegExp(`((?:[${escapeRegExp(["\"", "\'"])}])?)([${escapeRegExp(["w", "-"])}]+)((?:${escapeRegExp([groupIndex])}))`, "gm");

    const fileContentJSON = globalThis.JSON.parse(
      `{\n${
        fs.existsSync(util.formatDomainPath([newDirectoryPath, [newFileName, newFileExtension]], null))
          ? await util.readFile([newDirectoryPath, [newFileName, newFileExtension]])
          : ""
      }\n}`
        .replace(
          new globalThis.RegExp(`^(?:${spaceRegExp.source}*)((?:${variableRegExp(2).source})(?:(?:(?:${escapeRegExp(["."])})(?:${variableRegExp(5).source}))*))(?:${spaceRegExp.source}*)`, "gm"),
          (match, group_1, group_2, group_3, group_4, group_5, group_6, group_7) => `,"${group_1.replace(new globalThis.RegExp(`(?:${variableRegExp(1).source})`, "gm"), `$${2}`)}":`,
        )
        .replace(new globalThis.RegExp(`(?:${spaceRegExp.source}+)`, "gm"), globalThis.String().padStart(1, " "))
        .replace(new globalThis.RegExp(`(?<=(?:[${escapeRegExp(["{", "["])}]))(?:${spaceRegExp.source}*)(?:${escapeRegExp([","])})`, "gm"), globalThis.String())
        .replace(new globalThis.RegExp(`(?:${escapeRegExp([","])})(?:${spaceRegExp.source}*)(?=(?:[${escapeRegExp(["}", "]"])}]))`, "gm"), globalThis.String())
    )["libraryfolders"] ?? {};

    for (const steamDiskIndex in fileContentJSON) {
      const steamDisk = fileContentJSON[steamDiskIndex];

      const steamDiskGameList = steamDisk["apps"];
      for (const steamDiskGameIndex in steamDiskGameList) {
        const [directoryPath, ] = util.adjustDomainPath(steamDisk["path"]);
        const [newDirectoryPath, [newFileName, newFileExtension]] = [[...directoryPath, "steamapps"], [["appmanifest", steamDiskGameIndex].join("_"), "acf"]];

        const fileContentJSON = globalThis.JSON.parse(
          `{\n${
            fs.existsSync(util.formatDomainPath([newDirectoryPath, [newFileName, newFileExtension]], null))
              ? await util.readFile([newDirectoryPath, [newFileName, newFileExtension]])
              : ""
          }\n}`
            .replace(
              new globalThis.RegExp(`^(?:${spaceRegExp.source}*)((?:${variableRegExp(2).source})(?:(?:(?:${escapeRegExp(["."])})(?:${variableRegExp(5).source}))*))(?:${spaceRegExp.source}*)`, "gm"),
              (match, group_1, group_2, group_3, group_4, group_5, group_6, group_7) => `,"${group_1.replace(new globalThis.RegExp(`(?:${variableRegExp(1).source})`, "gm"), `$${2}`)}":`,
            )
            .replace(new globalThis.RegExp(`(?:${spaceRegExp.source}+)`, "gm"), globalThis.String().padStart(1, " "))
            .replace(new globalThis.RegExp(`(?<=(?:[${escapeRegExp(["{", "["])}]))(?:${spaceRegExp.source}*)(?:${escapeRegExp([","])})`, "gm"), globalThis.String())
            .replace(new globalThis.RegExp(`(?:${escapeRegExp([","])})(?:${spaceRegExp.source}*)(?=(?:[${escapeRegExp(["}", "]"])}]))`, "gm"), globalThis.String())
        )["AppState"] ?? {};

        if (["appid", "name", "installdir"].every((_el, _ind, _arr) => _el in fileContentJSON)) {
          const steamGameId = globalThis.Number.parseInt(fileContentJSON["appid"]);
          const steamGameName = fileContentJSON["name"];

          const steamGameDirectoryName = fileContentJSON["installdir"];
          const steamGameDirectoryDomainPath = [...newDirectoryPath, "common", steamGameDirectoryName];

          steamGameMap.set(steamGameId, [
            [
              steamGameId,
              steamGameName,
            ],
            [
              function steamGameIsReady() {
                return fileContentJSON["TargetBuildID"] === fileContentJSON["buildid"]
                  && fileContentJSON["BytesToDownload"] === fileContentJSON["BytesDownloaded"]
                  && fileContentJSON["BytesToStage"] === fileContentJSON["BytesStaged"];
              },
              function steamGameLaunch() {
                const [directoryPath, ] = util.adjustDomainPath(_el);
                const [newDirectoryPath, [newFileName, newFileExtension]] = [directoryPath, ["steam", "exe"]];

                return new globalThis.Promise((resolve, reject) => {
                  child_process.spawn(
                    `"${fileContentJSON["LauncherPath"] ?? util.formatDomainPath([newDirectoryPath, [newFileName, newFileExtension]], null)}"`,
                    [
                      ["applaunch", [steamGameId]],
                    ].map(([optionName, optionParameterList], _ind, _arr) => [
                      ...(((optionName !== null && optionName !== void null)) ? [`-${optionName}`] : []),
                      ...optionParameterList,
                    ].join(globalThis.String().padStart(1, " "))),
                    {
                      shell: true,

                      cwd: process.cwd(),

                      stdio: [process.stdin, "ignore", process.stderr],
                    }
                  )
                    .once("error", (err) => {
                      reject(err);
                    })
                    .once("exit", (code, signal) => {
                      resolve();
                    })
                    .once("close", (code, signal) => {
                      resolve();
                    });
                });
              },
            ],
            steamGameDirectoryDomainPath,
          ]);
        }
      }
    }
  }));

  return steamGameMap;
}
