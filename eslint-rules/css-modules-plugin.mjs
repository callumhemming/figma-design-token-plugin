import fs from "node:fs";
import path from "node:path";
import scss from "postcss-scss";

// scssPath -> { mtimeMs, classes }. Rules run once per lint pass per file
// that imports a given .module.scss, so several TSX files sharing one
// stylesheet would otherwise reparse it repeatedly.
const classCache = new Map();

function definedClasses(scssPath) {
  const stat = fs.statSync(scssPath, { throwIfNoEntry: false });
  if (!stat) return null;

  const cached = classCache.get(scssPath);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.classes;

  const root = scss.parse(fs.readFileSync(scssPath, "utf8"), {
    from: scssPath,
  });
  const classes = new Set();

  root.walkRules((rule) => {
    // :global(...) classes are intentionally unscoped, not part of the
    // CSS Modules export map these rules check against.
    const selector = rule.selector.replace(/:global\([^)]*\)/g, "");
    // Selector text only (never declaration values), so a bare `\.` match
    // is safe — it can't collide with a decimal like `0.2`. This won't
    // resolve SCSS interpolation (`.icon-#{$size}`), which isn't used
    // anywhere in this codebase today.
    for (const match of selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
      classes.add(match[1]);
    }
  });

  classCache.set(scssPath, { mtimeMs: stat.mtimeMs, classes });
  return classes;
}

function moduleScssBinding(context, node) {
  if (!node.source.value.endsWith(".module.scss")) return null;
  const defaultSpecifier = node.specifiers.find(
    (specifier) => specifier.type === "ImportDefaultSpecifier",
  );
  if (!defaultSpecifier) return null;

  const scssPath = path.resolve(
    path.dirname(context.filename),
    node.source.value,
  );
  const classes = definedClasses(scssPath);
  if (!classes) return null;

  return { localName: defaultSpecifier.local.name, scssPath, classes };
}

// `styles.foo` -> "foo"; `styles["foo"]` -> "foo"; anything more dynamic
// (a computed member with a non-literal property) can't be resolved
// statically, so callers get `undefined` and skip it.
function accessedClassName(node) {
  if (!node.computed && node.property.type === "Identifier") {
    return node.property.name;
  }
  if (
    node.computed &&
    node.property.type === "Literal" &&
    typeof node.property.value === "string"
  ) {
    return node.property.value;
  }
  return undefined;
}

const noUndefClass = {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow referencing a class not defined in the paired .module.scss file",
    },
    schema: [],
  },
  create(context) {
    const bindings = new Map();

    return {
      ImportDeclaration(node) {
        const binding = moduleScssBinding(context, node);
        if (binding) bindings.set(binding.localName, binding);
      },
      MemberExpression(node) {
        if (node.object.type !== "Identifier") return;
        const binding = bindings.get(node.object.name);
        if (!binding) return;

        const className = accessedClassName(node);
        if (className && !binding.classes.has(className)) {
          context.report({
            node: node.property,
            message: `Class '${className}' not found in ${path.relative(process.cwd(), binding.scssPath)}`,
          });
        }
      },
    };
  },
};

const noUnusedClass = {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow a class defined in a .module.scss file from going unreferenced",
    },
    schema: [],
  },
  create(context) {
    const bindings = new Map();

    return {
      ImportDeclaration(node) {
        const binding = moduleScssBinding(context, node);
        if (binding) bindings.set(binding.localName, { ...binding, importNode: node, used: new Set() });
      },
      MemberExpression(node) {
        if (node.object.type !== "Identifier") return;
        const binding = bindings.get(node.object.name);
        if (!binding) return;

        const className = accessedClassName(node);
        if (className) {
          binding.used.add(className);
        } else if (node.computed) {
          // Fully dynamic access (e.g. styles[someVariable]) — we can't
          // tell which classes it touches, so don't false-flag any of
          // them as unused.
          for (const name of binding.classes) binding.used.add(name);
        }
      },
      "Program:exit"() {
        for (const binding of bindings.values()) {
          const unused = [...binding.classes].filter(
            (name) => !binding.used.has(name),
          );
          if (unused.length > 0) {
            context.report({
              node: binding.importNode,
              message: `Unused class${unused.length > 1 ? "es" : ""} in ${path.relative(process.cwd(), binding.scssPath)}: ${unused.join(", ")}`,
            });
          }
        }
      },
    };
  },
};

export default {
  rules: {
    "no-undef-class": noUndefClass,
    "no-unused-class": noUnusedClass,
  },
};
