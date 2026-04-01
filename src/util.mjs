import * as child_process from "node:child_process"

import * as process from "node:process"

import * as path from "node:path"
import * as fs from "node:fs"

import * as url from "node:url"

// execute | write | read | delete | clear
// new | old | base
// adjust | format
// expected | received
// required | optional
// directory | file
// path | domain | extension | name
// list | index

/**
 * @param {string} domainPath
 * @returns {[string[], [string, string | (null | undefined)] | (null | undefined)]}
 */
export function adjustDomainPath(domainPath) {
  const [file, ...directoryDomainPath] = [...domainPath.split(/[\\\/]+/g)].reverse();
  const directoryPath = [...directoryDomainPath].reverse();

  const fileDomainList = file.split(/[\.]+/g);

  /**
   * @type {string[][]}
   */
  const fileExtensionList = [].map((_el, _ind, _arr) => _el.split(/[\.]+/g));

  /**
   * @type {string | (null | undefined)}
   */
  let fileExtension;
  /**
   * @type {string}
   */
  let fileName;

  fileExtensionList.map((_el, _ind, _arr) => {
    if (_el.every((__el, __ind, __arr) => _el[__ind] === fileDomainList[(fileDomainList.length - _el.length) + __ind]) && fileDomainList.length > _el.length) {
      fileExtension = _el.join(".");
      fileName = fileDomainList.slice(0, fileDomainList.length - _el.length).join(".");
    }
  });

  if ((fileExtension === null || fileExtension === void null) && (fileName === null || fileName === void null)) {
    const [newFileExtension, ...newFileDomainList] = [...fileDomainList].reverse();
    const newFileName = [...newFileDomainList].reverse().join(".");

    fileExtension = newFileExtension;
    fileName = newFileName;

    if (newFileDomainList.length === 0) {
      fileExtension = null;
      fileName = newFileExtension;
    }
  }

  const newDomainPath = [directoryPath, [fileName, fileExtension]];

  if (fs.existsSync(formatDomainPath(newDomainPath, null))) {
    const newDomainPathStat = fs.statSync(formatDomainPath(newDomainPath, null), {});

    if (newDomainPathStat.isDirectory()) {
      return [[...directoryPath, fileName], null];
    }
    if (newDomainPathStat.isFile()) {
      return [directoryPath, [fileName, fileExtension]];
    }
  }

  return newDomainPath;
}

/**
 * @param {[string[], [string, string | (null | undefined)] | (null | undefined)]} domainPath
 * @param {'\\' | '/' | (null | undefined)} pathSeparator
 * @returns {string}
 */
export function formatDomainPath(domainPath, pathSeparator) {
  const [directoryPath, fileDomainPath] = domainPath;

  /**
   * @type {string[]}
   */
  const newDomainPath = [];

  newDomainPath.push(...directoryPath);

  if (fileDomainPath !== null && fileDomainPath !== void null) {
    const [fileName, fileExtension] = fileDomainPath;

    newDomainPath.push([
      ...((fileName !== null && fileName !== void null) ? [fileName] : [globalThis.String()]),
      ...((fileExtension !== null && fileExtension !== void null) ? [fileExtension] : []),
    ].join("."));
  }

  return newDomainPath.join((pathSeparator !== null && pathSeparator !== void null) ? pathSeparator : path.sep);
}

/**
 * @param {string[]} directoryPath
 * @returns {Promise<[string[], [string, string | (null | undefined)]][]>}
 */
export async function readDirectory(directoryPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.readdir(formatDomainPath([directoryPath, null], null), {
      recursive: false,
    }, async (err, files) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      /**
       * @type {[string[], [string, string | (null | undefined)]][]}
       */
      const fileList = [];

      for (const file of files.map((_el, _ind, _arr) => _el.toString())) {
        const fileDomainPath = [directoryPath, [file, null]];

        const fileStat = fs.statSync(formatDomainPath(fileDomainPath, null), {});
        if (fileStat.isDirectory()) {
          fileList.push(...(await readDirectory([...directoryPath, file])));

          continue;
        }

        const [_, [fileName, fileExtension]] = adjustDomainPath(file);

        fileList.push([directoryPath, [fileName, fileExtension]]);
      }

      resolve(fileList);

      return;
    });
  });
}
/**
 * @param {string[]} directoryPath
 * @returns {Promise<void>}
 */
export async function writeDirectory(directoryPath) {
  return new globalThis.Promise((resolve, reject) => {
    for (let i = 0; i < directoryPath.length; i++) {
      const expectedDirectoryPath = formatDomainPath([directoryPath.slice(0, i + 1), null], null);

      if (!fs.existsSync(expectedDirectoryPath)) {
        fs.mkdirSync(expectedDirectoryPath, {});
      }
    }

    resolve();
  });
}

/**
 * @param {string[]} directoryPath
 * @returns {Promise<void>}
 */
export async function clearDirectory(directoryPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.readdir(formatDomainPath([directoryPath, null], null), {
      recursive: false,
    }, async (err, files) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      for (const file of files.map((_el, _ind, _arr) => _el.toString())) {
        const fileDomainPath = [directoryPath, [file, null]];

        const fileStat = fs.statSync(formatDomainPath(fileDomainPath, null), {});
        if (fileStat.isDirectory()) {
          await clearDirectory([...directoryPath, file]);

          continue;
        }
      }

      fs.readdir(formatDomainPath([directoryPath, null], null), {
        recursive: false,
      }, async (err, files) => {
        if (err !== null && err !== void null) {
          reject(err);

          return;
        }

        if (files.length === 0) {
          fs.rmdirSync(formatDomainPath([directoryPath, null], null), {});
        }

        resolve();

        return;
      });
    });
  });
}

/**
 * @param {[string[], [string, string | (null | undefined)]]} fileDomainPath
 * @returns {Promise<string>}
 */
export async function readFile(fileDomainPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.readFile(formatDomainPath(fileDomainPath, null), {
      encoding: "utf-8",
    }, (err, data) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      resolve(data);

      return;
    });
  });
}
/**
 * @param {[string[], [string, string | (null | undefined)]]} fileDomainPath
 * @param {string} fileContent
 * @returns {Promise<void>}
 */
export async function writeFile(fileDomainPath, fileContent) {
  return new globalThis.Promise(async (resolve, reject) => {
    const [directoryPath, [fileName, fileExtension]] = fileDomainPath;

    await writeDirectory(directoryPath);

    fs.writeFile(formatDomainPath(fileDomainPath, null), fileContent, {
      encoding: "utf-8",
    }, (err) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      resolve();

      return;
    });
  });
}

/**
 * @param {[string[], [string, string | (null | undefined)]]} fileDomainPath
 * @returns {Promise<void>}
 */
export async function deleteFile(fileDomainPath) {
  return new globalThis.Promise((resolve, reject) => {
    fs.rm(formatDomainPath(fileDomainPath, null), (err) => {
      if (err !== null && err !== void null) {
        reject(err);

        return;
      }

      resolve();

      return;
    });
  });
}

/**
 * @param {string} fileName
 * @returns {[string, (fileIndex: number, maxFileIndex: number) => string]}
 */
export function adjustFileName(fileName) {
  /**
   * @type {string | (null | undefined)}
   */
  const baseFileName = (() => {
    fileName = (fileName ?? globalThis.String())
      .replace(/(?:[_\-]+)(?:alt)(?:[_\-]+[\d]+$)/g, globalThis.String())
      .replace(/(?:[_\-]+)(?:alt)(?:[\d]+$)/g, globalThis.String());

    {
      const fileNameExec = /(?<=^)([_\-]*[\d]+)(?=$)/g.exec(fileName);
      if (globalThis.Array.isArray(fileNameExec)) {
        return null;
      }
    }

    {
      const fileNameExec = /(?<=^)(.*(?:[^_\-]))(?=[_\-]+[\d]+$)/g.exec(fileName);
      if (globalThis.Array.isArray(fileNameExec)) {
        return fileNameExec[1];
      }
    }

    {
      const fileNameExec = /(?<=^)(.*(?:[^_\-\d]))(?=[\d]+$)/g.exec(fileName);
      if (globalThis.Array.isArray(fileNameExec)) {
        return fileNameExec[1];
      }
    }

    return fileName;
  })();

  /**
   * @param {number} fileIndex
   * @param {number} maxFileIndex
   * @returns {string}
   */
  const formatFileName = (fileIndex, maxFileIndex) => [
    ...((baseFileName !== null && baseFileName !== void null) ? [baseFileName] : []),
    fileIndex.toString().padStart(globalThis.Math.max(2, globalThis.Math.floor(globalThis.Math.log10(maxFileIndex)) + 1), 0..toString()),
  ].join("_");

  return [(baseFileName !== null && baseFileName !== void null) ? baseFileName : formatFileName(1, globalThis.Math.pow(10, 2) - 1), formatFileName];
}

/**
 * @param {[string[], [string, string | (null | undefined)]][]} fileList
 * @returns {Map<string, [[string, (fileIndex: number, maxFileIndex: number) => string], [string, string | (null | undefined)][]]>}
 */
export function collectFileList(fileList) {
  /**
   * @type {Map<string, [[string, (fileIndex: number, maxFileIndex: number) => string], [string, string | (null | undefined)][]]>}
   */
  const newFileList = new globalThis.Map();

  for (const file of fileList) {
    const [directoryPath, [fileName, fileExtension]] = file;
    const [baseFileName, formatFileName] = adjustFileName(fileName);

    const baseFile = formatDomainPath([directoryPath, [baseFileName, null]], null);

    newFileList.set(baseFile, newFileList.has(baseFile) ? newFileList.get(baseFile) : [[baseFileName, formatFileName], []]);
    newFileList.get(baseFile)[1].push([fileName, fileExtension]);
  }

  return newFileList;
}

/**
 * @param {[number, number, number]} color
 * @param {string} captionText
 * @returns {string}
 */
export function colorForeground([colorRed, colorGreen, colorBlue], captionText) {
  return `\x1b[${38};${2};${colorRed};${colorGreen};${colorBlue}m${captionText}\x1b[${39}m`;
}
/**
 * @param {[number, number, number]} color
 * @param {string} captionText
 * @returns {string}
 */
export function colorBackground([colorRed, colorGreen, colorBlue], captionText) {
  return `\x1b[${48};${2};${colorRed};${colorGreen};${colorBlue}m${captionText}\x1b[${49}m`;
}

/**
 * @param {URL} url
 * @param {string} captionText
 * @returns {string}
 */
export function hyperLink(url, captionText) {
  return `\x1b]${8};;${url.toString()}\x1b\\${captionText}\x1b]${8};;\x1b\\`;
}

/**
 * @param {number} logLevel
 * @param {[string, [number, number, number] | (null | undefined)]} logTag
 * @param {string} logMessage
 * @param {unknown} logPayload
 * @returns {void}
 */
export function log(logLevel, [logTagText, logTagColor], logMessage, logPayload) {
  const logTag = `[${logTagText}]`.padStart(15, " ");

  console.log(
    `${globalThis.Array.isArray(logTagColor) ? colorForeground(logTagColor, logTag) : logTag}${globalThis.String().padStart(logLevel * 3, " ")}${[
      logMessage,
      ...((logPayload !== null && logPayload !== void null) ? [globalThis.String(logPayload)] : []),
    ].join(`:${globalThis.String().padStart(1, " ")}`)}`
  );
}

/**
 * @param {string} logMessage
 * @returns {void}
 */
export function logPending(logMessage) {
  log(1, [globalThis.String().padStart(3, "."), null], logMessage, null);
}

/**
 * @param {number} logLevel
 * @param {string} logMessage
 * @param {unknown} logPayload
 * @returns {void}
 */
export function logSuccess(logLevel, logMessage, logPayload) {
  log(logLevel, ["SUCCESS", [0, 255, 0]], logMessage, logPayload);
}
/**
 * @param {number} logLevel
 * @param {string} logMessage
 * @param {unknown} logPayload
 * @returns {void}
 */
export function logFailure(logLevel, logMessage, logPayload) {
  log(logLevel, ["ERROR", [255, 0, 0]], logMessage, logPayload);
}

/**
 * @param {number} logLevel
 * @param {string} logMessage
 * @param {unknown} logPayload
 * @returns {void}
 */
export function logWarning(logLevel, logMessage, logPayload) {
  log(logLevel, ["WARNING", [255, 155, 0]], logMessage, logPayload);
}
