/** Source silhouettes traced from the actual app icons, in their 512px canvas.
 * The same paths drive the WebGL solids and the accessible SVG fallback.
 */
export type MakerLogoCommand = ["M" | "L", number, number] | ["C", number, number, number, number, number, number] | ["Q", number, number, number, number];
export type MakerLogoShape = {
  commands: MakerLogoCommand[];
  center: [number, number];
  depth: number;
  roundness?: number;
  offset?: number;
  hole?: MakerLogoCommand[];
};
const drop = (tip: [number, number], left: number, right: number, bottom: number): MakerLogoCommand[] => [
  ["M", ...tip], ["C", tip[0] - 58, tip[1] + 83, left, bottom - 163, left, bottom - 108],
  ["C", left, bottom - 42, tip[0] - 58, bottom, tip[0], bottom],
  ["C", tip[0] + 69, bottom, right, bottom - 43, right, bottom - 108],
  ["C", right, bottom - 170, tip[0] + 53, tip[1] + 76, ...tip],
];

const ellipse = (x: number, y: number, rx: number, ry = rx): MakerLogoCommand[] => [
  ["M", x + rx, y], ["C", x + rx, y + ry * .5523, x + rx * .5523, y + ry, x, y + ry],
  ["C", x - rx * .5523, y + ry, x - rx, y + ry * .5523, x - rx, y],
  ["C", x - rx, y - ry * .5523, x - rx * .5523, y - ry, x, y - ry],
  ["C", x + rx * .5523, y - ry, x + rx, y - ry * .5523, x + rx, y],
];

export const MAKER_LOGO_SHAPES: Record<"sarpoli" | "vela" | "kaizencv" | "wardrobe" | "koebsklar" | "shield-family" | "iqra", MakerLogoShape[]> = {
  sarpoli: [
    { center: [105, 146], depth: .22, commands: [
      ["M", 490, 28], ["L", 170, 28], ["C", 91, 28, 29, 91, 29, 171],
      ["C", 29, 253, 90, 321, 172, 321], ["L", 290, 321],
      ["L", 162, 191], ["C", 148, 177, 157, 155, 177, 155], ["L", 490, 155],
    ] },
    { center: [409, 366], depth: .22, commands: [
      ["M", 29, 489], ["L", 344, 489], ["C", 428, 489, 491, 424, 491, 342],
      ["C", 491, 261, 427, 195, 345, 195], ["L", 229, 195],
      ["L", 358, 326], ["C", 373, 341, 363, 364, 343, 364], ["L", 29, 364],
    ] },
  ],
  vela: [
    { center: [232, 293], depth: .60, roundness: .62, commands: drop([232, 93], 120, 344, 420) },
    { center: [356, 190], depth: .12, commands: [
      ["M", 356, 153], ["C", 360, 177, 369, 186, 393, 190],
      ["C", 369, 194, 360, 203, 356, 227], ["C", 352, 203, 343, 194, 319, 190],
      ["C", 343, 186, 352, 177, 356, 153],
    ] },
  ],
  kaizencv: [
    { center: [200, 235], depth: .22, commands: [
      ["M", 116, 90], ["L", 205, 90], ["L", 205, 212], ["L", 281, 90],
      ["L", 383, 90], ["L", 282, 252], ["L", 264, 252],
      ["C", 183, 252, 123, 188, 116, 90],
    ] },
    { center: [200, 274], depth: .22, commands: [
      ["M", 264, 252], ["L", 282, 252], ["L", 396, 422], ["L", 288, 422],
      ["L", 205, 297], ["L", 205, 422], ["L", 116, 422],
      ["C", 123, 324, 183, 259, 264, 252],
    ] },
  ],
  wardrobe: [
    { center: [256, 300], depth: .65, roundness: .62, commands: drop([256, 51], 123, 390, 441) },
  ],
  koebsklar: [
    { center: [256, 288], depth: .25, commands: [
      ["M", 256, 80], ["L", 439, 240], ["L", 439, 424], ["L", 73, 424], ["L", 73, 240],
    ], hole: [
      ["M", 256, 250], ["C", 277, 250, 294, 267, 294, 288],
      ["C", 294, 302, 287, 313, 277, 320], ["L", 288, 400], ["L", 224, 400],
      ["L", 235, 320], ["C", 225, 313, 218, 302, 218, 288],
      ["C", 218, 267, 235, 250, 256, 250],
    ] },
  ],
  "shield-family": [
    { center: [256, 240], depth: .36, roundness: .30, commands: [
      ["M", 256, 94], ["L", 386, 137], ["C", 386, 276, 362, 339, 256, 410],
      ["C", 150, 339, 126, 276, 126, 137],
    ] },
    { center: [256, 231], depth: .03, offset: .38, commands: ellipse(256, 231, 86, 72) },
    { center: [223, 223], depth: .025, offset: .42, commands: ellipse(223, 223, 16) },
    { center: [288, 223], depth: .025, offset: .42, commands: ellipse(288, 223, 16) },
    { center: [256, 266], depth: .02, offset: .425, commands: [
      ["M", 226, 254], ["C", 245, 271, 267, 271, 286, 254], ["Q", 296, 259, 287, 267],
      ["C", 268, 283, 244, 283, 225, 267], ["Q", 217, 261, 226, 254],
    ] },
    { center: [256, 340], depth: .045, offset: .37, commands: [
      ["M", 256, 309], ["L", 264, 329], ["L", 284, 330], ["L", 269, 344], ["L", 273, 365],
      ["L", 256, 354], ["L", 239, 365], ["L", 243, 344], ["L", 228, 330], ["L", 248, 329],
    ] },
    { center: [256, 82], depth: .06, commands: ellipse(256, 82, 12) },
  ],
  iqra: [
    { center: [256, 270], depth: .20, commands: [
      ["M", 256, 123], ["C", 226, 164, 191, 176, 170, 201],
      ["C", 153, 221, 146, 239, 146, 259], ["L", 146, 388], ["L", 366, 388], ["L", 366, 259],
      ["C", 366, 239, 359, 221, 342, 201], ["C", 321, 176, 286, 164, 256, 123],
    ], hole: [
      ["M", 256, 161], ["C", 225, 196, 172, 211, 172, 260], ["L", 172, 364],
      ["C", 202, 355, 232, 360, 256, 386], ["C", 280, 360, 310, 355, 340, 364],
      ["L", 340, 260], ["C", 340, 211, 287, 196, 256, 161],
    ] },
    { center: [256, 330], depth: .17, commands: [
      ["M", 199, 247], ["C", 229, 247, 252, 267, 256, 303],
      ["C", 260, 267, 283, 247, 313, 247], ["L", 313, 346],
      ["C", 287, 346, 268, 362, 256, 385], ["C", 244, 362, 225, 346, 199, 346],
    ] },
  ],
};

export const makerLogoPathData = (commands: MakerLogoCommand[]) => commands.map(command => command.join(" ")).join(" ") + " Z";

export const MAKER_WARDROBE_HANGER = "M 435 107 C 435 87 406 86 405 106 C 404 119 420 118 420 127 L 420 134 L 470 174 L 369 174 L 420 134";
export const MAKER_WARDROBE_SMILE = "M 224 332 Q 256 365 288 332";
