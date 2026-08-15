import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import stylelint from "stylelint";

const ruleName = "css-modules/no-unused-class";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (className, componentPath) =>
    `Class '.${className}' is not referenced in ${componentPath}`,
});

// This codebase colocates each Foo.module.scss with exactly one Foo.tsx (or
// .ts) in the same directory — the counterpart to the .tsx-side
// css-modules/no-undef-class ESLint rule, which resolves the pairing the
// other way (from the import).
function componentFileFor(scssPath) {
  const dir = path.dirname(scssPath);
  const base = path.basename(scssPath, ".module.scss");
  for (const ext of [".tsx", ".ts"]) {
    const candidate = path.join(dir, `${base}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function usedClassesIn(componentPath, scssPath) {
  const sourceFile = ts.createSourceFile(
    componentPath,
    fs.readFileSync(componentPath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    componentPath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const bindingNames = new Set();
  const used = new Set();

  function visit(node) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.importClause?.name
    ) {
      const resolved = path.resolve(
        path.dirname(componentPath),
        node.moduleSpecifier.text,
      );
      if (resolved === scssPath) {
        bindingNames.add(node.importClause.name.text);
      }
    } else if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      bindingNames.has(node.expression.text)
    ) {
      used.add(node.name.text);
    } else if (
      ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      bindingNames.has(node.expression.text)
    ) {
      // Fully dynamic access (styles[someVariable]) can't be resolved
      // statically — same escape hatch as the ESLint rule: don't false-flag.
      if (
        node.argumentExpression &&
        ts.isStringLiteralLike(node.argumentExpression)
      ) {
        used.add(node.argumentExpression.text);
      } else {
        return "dynamic";
      }
    }

    return ts.forEachChild(node, visit);
  }

  const hasDynamicAccess = visit(sourceFile) === "dynamic";
  return { used, hasDynamicAccess };
}

const rule = (enabled) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: enabled,
      possible: [true, false],
    });
    if (!validOptions || !enabled) return;

    const scssPath = root.source?.input.file;
    if (!scssPath) return;

    const componentPath = componentFileFor(scssPath);
    if (!componentPath) return;

    const { used, hasDynamicAccess } = usedClassesIn(componentPath, scssPath);
    if (hasDynamicAccess) return;

    const reported = new Set();

    root.walkRules((rule) => {
      // :global(...) classes are intentionally unscoped, not part of the
      // CSS Modules export map this rule checks against. Mask rather than
      // strip so the remaining match indices stay aligned with the
      // original selector text for accurate reporting.
      const masked = rule.selector.replace(/:global\([^)]*\)/g, (match) =>
        " ".repeat(match.length),
      );

      for (const match of masked.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
        const className = match[1];
        if (used.has(className) || reported.has(className)) continue;
        reported.add(className);

        stylelint.utils.report({
          message: messages.rejected(
            className,
            path.relative(path.dirname(scssPath), componentPath),
          ),
          node: rule,
          index: match.index,
          endIndex: match.index + match[0].length,
          result,
          ruleName,
        });
      }
    });
  };
};

rule.ruleName = ruleName;
rule.messages = messages;

export default stylelint.createPlugin(ruleName, rule);
