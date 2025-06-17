import { transformerCopyButton } from '@rehype-pretty/transformers';
import { useEffect, useMemo, useState } from 'react';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export function Markdown({ markdown }: { markdown: string }) {
    const [highlightedCode, setHighlightedCode] = useState('');

    // Memoize the highlightCode function so it only changes when code or language changes
    const highlight = useMemo(() => {
        return async () => {
            const highlighted = await highlightCode(markdown);
            setHighlightedCode((prev) => (prev !== highlighted ? highlighted : prev));
        };
    }, [markdown]);

    useEffect(() => {
        highlight();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlight]);

    return (
        <section
            className="transition-all duration-300"
            dangerouslySetInnerHTML={{
                __html: highlightedCode,
            }}
        />
    );
}

async function highlightCode(markdown: string) {
    const processor = await unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypePrettyCode, {
            theme: 'github-light',
            transformers: [
                transformerCopyButton({
                    visibility: 'always',
                    feedbackDuration: 3_000,
                }),
            ],
        })
        .use(rehypeStringify)
        .process(markdown);

    return String(processor);
}
