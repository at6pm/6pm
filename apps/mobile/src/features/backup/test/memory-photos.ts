import type { PhotoFiles } from '../../../data/spend-photos';

/** A photo folder in memory: each file's base64 by name. */
export function memoryPhotoFiles(): PhotoFiles & { readonly files: Map<string, string> } {
  const files = new Map<string, string>();
  const nameOf = (uri: string) => uri.replace('memory://photos/', '');
  return {
    files,
    names: () => [...files.keys()],
    uri: (name) => `memory://photos/${name}`,
    size: (name) => {
      const file = files.get(name);
      return file === undefined ? null : Math.floor((file.length * 3) / 4);
    },
    remove: (name) => {
      files.delete(name);
    },
    read: (name) => {
      const file = files.get(name);
      return file === undefined ? Promise.reject(new Error('missing')) : Promise.resolve(file);
    },
    write: (name, base64) => {
      files.set(name, base64);
      return Promise.resolve();
    },
    keep: (from, name) => {
      files.set(nameOf(name), Buffer.from(from).toString('base64'));
      return Promise.resolve();
    },
  };
}
