declare module "heic-decode" {
  export interface HeicDecoded {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }
  export default function decode(options: { buffer: Buffer }): Promise<HeicDecoded>;
}
