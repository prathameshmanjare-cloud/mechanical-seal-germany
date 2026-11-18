// Helpers over parsed page content ({ sections: [{ kind, h, blocks }] }).
export const introOf = (content) => content?.sections.find((s) => s.kind === 'intro')?.blocks.find((b) => b.p)?.p
export const ctaOf = (content) => content?.sections.find((s) => s.kind === 'cta')
