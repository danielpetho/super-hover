/**
 * Registers Prism’s `svelte` language using the grammar from
 * [prism-svelte](https://github.com/pngwn/prism-svelte) (MIT), adapted for ESM.
 */
import Prism, { type Environment } from "prismjs";

import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";

function registerSvelteLanguage(P: typeof Prism): void {
  const blocks = "(if|else if|await|then|catch|each|html|debug)";

  P.languages.svelte = P.languages.extend("markup", {
    each: {
      pattern: new RegExp(
        "{[#/]each" +
          "(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}",
      ),
      inside: {
        "language-javascript": [
          {
            pattern: /(as[\s\S]*)\([\s\S]*\)(?=\s*\})/,
            lookbehind: true,
            inside: P.languages.javascript,
          },
          {
            pattern: /(as[\s]*)[\s\S]*(?=\s*)/,
            lookbehind: true,
            inside: P.languages.javascript,
          },
          {
            pattern: /(#each[\s]*)[\s\S]*(?=as)/,
            lookbehind: true,
            inside: P.languages.javascript,
          },
        ],
        keyword: /[#/]each|as/,
        punctuation: /{|}/,
      },
    },
    block: {
      pattern: new RegExp(
        "{[#:/@]/s" +
          blocks +
          "(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}",
      ),
      inside: {
        punctuation: /^{|}$/,
        keyword: [new RegExp("[#:/@]" + blocks + "( )*"), /as/, /then/],
        "language-javascript": {
          pattern: /[\s\S]*/,
          inside: P.languages.javascript,
        },
      },
    },
    tag: {
      pattern:
        /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?:"[^"]*"|'[^']*'|{[\s\S]+?}(?=[\s/>])))|(?=[\s/>])))+)?\s*\/?>/i,
      greedy: true,
      inside: {
        tag: {
          pattern: /^<\/?[^\s>\/]+/i,
          inside: {
            punctuation: /^<\/?/,
            namespace: /^[^\s>\/:]+:/,
          },
        },
        "language-javascript": {
          pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
          inside: P.languages.javascript,
        },
        "attr-value": {
          pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
          inside: {
            punctuation: [
              /^=/,
              {
                pattern: /^(\s*)["']|["']$/,
                lookbehind: true,
              },
            ],
            "language-javascript": {
              pattern: /{[\s\S]+}/,
              inside: P.languages.javascript,
            },
          },
        },
        punctuation: /\/?>/,
        "attr-name": {
          pattern: /[^\s>\/]+/,
          inside: {
            namespace: /^[^\s>\/:]+:/,
          },
        },
      },
    },
    "language-javascript": {
      pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
      lookbehind: true,
      inside: P.languages.javascript,
    },
  });

  /** `Grammar` typings omit extended markup `tag` / `entity` wiring used by Svelte. */
  const svelteGrammar = P.languages.svelte as {
    tag: {
      inside: { "attr-value": { inside: Record<string, unknown> } };
      addInlined: (tagName: string, lang: string) => void;
    };
    entity: unknown;
  };

  svelteGrammar.tag.inside["attr-value"].inside.entity = svelteGrammar.entity;

  P.hooks.add("wrap", (env: Environment) => {
    if (env.type === "entity" && env.attributes && env.content !== undefined) {
      env.attributes.title = env.content.replace(/&amp;/, "&");
    }
  });

  Object.defineProperty(svelteGrammar.tag, "addInlined", {
    value: function addInlined(tagName: string, lang: string) {
      const includedCdataInside: Record<string, unknown> = {};
      includedCdataInside["language-" + lang] = {
        pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
        lookbehind: true,
        inside: P.languages[lang],
      };
      includedCdataInside.cdata = /^<!\[CDATA\[|\]\]>$/i;

      const inside: Record<string, unknown> = {
        "included-cdata": {
          pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
          inside: includedCdataInside,
        },
      };
      inside["language-" + lang] = {
        pattern: /[\s\S]+/,
        inside: P.languages[lang],
      };

      const def: Record<string, unknown> = {};
      def[tagName] = {
        pattern: RegExp(
          /(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/
            .source.replace(/__/g, tagName),
          "i",
        ),
        lookbehind: true,
        greedy: true,
        inside,
      };

      P.languages.insertBefore("svelte", "cdata", def);
    },
  });

  svelteGrammar.tag.addInlined("style", "css");
  /* Docs snippets use `<script lang="ts">`; TypeScript grammar embeds JS. */
  svelteGrammar.tag.addInlined("script", "typescript");
}

registerSvelteLanguage(Prism);

export const prismWithSvelte = Prism;
