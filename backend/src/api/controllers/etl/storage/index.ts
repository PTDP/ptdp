import { Storage, File as GCloudFile } from "@google-cloud/storage";

import * as functions from "firebase-functions";
import os from "os";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const downloadFile = async (file: GCloudFile) => {
  const destination = `${os.tmpdir()}/${uuidv4()}.json`;
  await file.download({
    destination,
  });
  return destination;
};

export const fileToJSON = async (file: GCloudFile) => {
  const path = await downloadFile(file);
  return JSON.parse(fs.readFileSync(path, "utf-8"));
};

export const stringToPath = async (str: string, destination: string) => {
  const storage = new Storage();
  const file = storage
    .bucket(functions.config().storage.bucket)
    .file(destination);
  await file.save(str);
  await file.makePublic();

  return (
    "https://storage.googleapis.com/" +
    functions.config().storage.bucket.replace("gs://", "") +
    "/" +
    destination
  );
};

export const listFilesByPrefix = async (prefix: string) => {
  /**
   * This can be used to list all blobs in a "folder", e.g. "public/".
   *
   * The delimiter argument can be used to restrict the results to only the
   * "files" in the given "folder". Without the delimiter, the entire tree under
   * the prefix is returned. For example, given these blobs:
   *
   *   /a/1.txt
   *   /a/b/2.txt
   *
   * If you just specify prefix = 'a/', you'll get back:
   *
   *   /a/1.txt
   *   /a/b/2.txt
   *
   * However, if you specify prefix='a/' and delimiter='/', you'll get back:
   *
   *   /a/1.txt
   */
  const options = {
    prefix: prefix,
  };

  // if (delimiter) {
  //   options.delimiter = delimiter;
  // }

  // Lists files in the bucket, filtered by a prefix
  const storage = new Storage();

  const [files] = await storage
    .bucket(functions.config().storage.bucket)
    .getFiles(options);

  return files;
};
