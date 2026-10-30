/** Enforce an explicit shared policy on every imported next/image element. */
export const imageLoadingPlugin = {
  rules: {
    "explicit-intent": {
      meta: {
        type: "problem", schema: [],
        messages: {
          missing: "Use {...imageLoading('critical' | 'visible' | 'deferred')} on Next Image. Choose from the image's layout role.",
          override: "Do not override loading, fetchPriority, priority or preload beside imageLoading(). Keep the loading policy in the shared helper.",
        },
      },
      create(context) {
        const names = new Set();
        return {
          ImportDeclaration(node) {
            if (node.source.value === "next/image") {
              for (const specifier of node.specifiers) if (specifier.type === "ImportDefaultSpecifier") names.add(specifier.local.name);
            }
          },
          JSXOpeningElement(node) {
            if (node.name.type !== "JSXIdentifier" || !names.has(node.name.name)) return;
            const policy = node.attributes.some((attribute) => attribute.type === "JSXSpreadAttribute" && attribute.argument.type === "CallExpression" && attribute.argument.callee.type === "Identifier" && attribute.argument.callee.name === "imageLoading");
            if (!policy) context.report({ node, messageId: "missing" });
            for (const attribute of node.attributes) {
              if (attribute.type === "JSXAttribute" && ["loading", "fetchPriority", "priority", "preload"].includes(attribute.name.name)) context.report({ node: attribute, messageId: "override" });
            }
          },
        };
      },
    },
  },
};
