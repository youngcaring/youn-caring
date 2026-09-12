import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const sourceIcon = path.join(
  projectRoot,
  "public",
  "logo",
  "icon.png"
);

const outputDirectory = path.join(
  projectRoot,
  "public",
  "icons"
);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateIcon({
  filename,
  size,
  padding = 0,
}) {
  const availableSize = Math.round(
    size * (1 - padding * 2)
  );

  const resizedIcon = await sharp(sourceIcon)
    .resize(availableSize, availableSize, {
      fit: "contain",
      background: {
        r: 255,
        g: 255,
        b: 255,
        alpha: 0,
      },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: {
        r: 255,
        g: 255,
        b: 255,
        alpha: 1,
      },
    },
  })
    .composite([
      {
        input: resizedIcon,
        gravity: "center",
      },
    ])
    .png({
      compressionLevel: 9,
    })
    .toFile(
      path.join(outputDirectory, filename)
    );
}

async function main() {
  if (!(await fileExists(sourceIcon))) {
    throw new Error(
      "Le fichier public/logo/icon.png est introuvable."
    );
  }

  await fs.mkdir(outputDirectory, {
    recursive: true,
  });

  await Promise.all([
    generateIcon({
      filename: "icon-180.png",
      size: 180,
    }),

    generateIcon({
      filename: "icon-192.png",
      size: 192,
    }),

    generateIcon({
      filename: "icon-512.png",
      size: 512,
    }),

    /*
     * L’icône maskable contient une marge de sécurité
     * afin que le logo ne soit pas coupé par Android.
     */
    generateIcon({
      filename: "icon-maskable-192.png",
      size: 192,
      padding: 0.1,
    }),

    generateIcon({
      filename: "icon-maskable-512.png",
      size: 512,
      padding: 0.1,
    }),
  ]);

  console.log(
    "Les icônes PWA ont été générées avec succès."
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});