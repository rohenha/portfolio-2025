import fs from "fs";
import path from "path";
import SVGSpriter from "svg-sprite";

const config = {
  input: "svgs",
  output: {
    sprite: "public/images/",
    css: "src/",
    scss: "../src/styles/utils/_sprite.scss",
  },
  name: (id) => `icon-${id}`,
};

const files = fs
  .readdirSync(config.input)
  .filter((file) => file.endsWith(".svg"));
if (fs.existsSync(config.output.sprite + "svg")) {
  fs.rmSync(config.output.sprite + "svg", { recursive: true });
}
const sprite = SVGSpriter({
  mode: {
    symbol: {
      dest: config.output.sprite,
    },
    inline: true,
    css: {
      // Create a «css» sprite
      dest: config.output.css,
      prefix: ".%s", // CSS class prefix
      bust: false,
      example: false,
      render: {
        scss: {
          dest: config.output.scss,
        },
      },
    },
  },
  svg: {
    // General options for created SVG files
    xmlDeclaration: false, // Add XML declaration to SVG sprite
    doctypeDeclaration: false, // Add DOCTYPE declaration to SVG sprite
    dimensionAttributes: false, // Width and height attributes on the sprite
    rootAttributes: {
      style: "position:absolute; top:0; left:0; width:0; height:0;",
    },
  },
});

// Parcourez chaque fichier SVG et ajoutez-le au sprite
files.forEach((file) => {
  const filePath = path.join(config.input, file);
  const svg = fs.readFileSync(filePath, "utf8");
  const id = config.name(path.parse(file).name); // Utilisez le nom de fichier comme ID
  sprite.add(id, null, svg);
});

sprite.compile((error, result) => {
  for (const mode of Object.values(result)) {
    for (const resource of Object.values(mode)) {
      fs.mkdirSync(path.dirname(resource.path), { recursive: true });
      fs.writeFileSync(resource.path, resource.contents);
    }
  }
});
