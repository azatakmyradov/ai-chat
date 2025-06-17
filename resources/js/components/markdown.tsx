import { transformerCopyButton } from '@rehype-pretty/transformers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { useAppearance } from '@/hooks/use-appearance';

export function Markdown({ markdown, isStreaming = false }: { markdown: string; isStreaming?: boolean }) {
    const [highlightedCode, setHighlightedCode] = useState('');
    const { appearance } = useAppearance();
    
    // Determine current theme
    const isDark = useMemo(() => {
        if (typeof window === 'undefined') return false;
        if (appearance === 'dark') return true;
        if (appearance === 'light') return false;
        return document.documentElement.classList.contains('dark');
    }, [appearance]);

    // Process markdown - skip highlighting during streaming
    const processMarkdown = useCallback(async (content: string, darkMode: boolean) => {
        try {
            if (isStreaming) {
                // During streaming, just show plain text with basic formatting
                const plainText = content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br>');
                setHighlightedCode(`<div class="whitespace-pre-wrap font-mono text-sm">${plainText}</div>`);
            } else {
                // Only highlight when not streaming
                const result = await highlightCode(content, darkMode);
                setHighlightedCode(result);
            }
        } catch (error) {
            console.error('Markdown processing failed:', error);
            // Fallback to simple HTML with line breaks
            const fallback = content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
            setHighlightedCode(`<div class="whitespace-pre-wrap">${fallback}</div>`);
        }
    }, [isStreaming]);

    // Effect to process markdown when content, theme, or streaming state changes
    useEffect(() => {
        processMarkdown(markdown, isDark);
    }, [markdown, isDark, processMarkdown]);

    return (
        <section
            className="markdown-content"
            dangerouslySetInnerHTML={{
                __html: highlightedCode,
            }}
        />
    );
}

async function highlightCode(markdown: string, isDark: boolean) {
    try {
        const processor = unified()
            .use(remarkParse)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypePrettyCode, {
                theme: isDark ? 'github-dark' : 'github-light',
                keepBackground: false,
                defaultLang: 'plaintext',
                transformers: [
                    transformerCopyButton({
                        visibility: 'always',
                        feedbackDuration: 2000,
                    }),
                    {
                        name: 'line-numbers',
                        pre(node) {
                            // Add line numbers data attribute
                            node.properties = node.properties || {};
                            node.properties['data-line-numbers'] = true;
                        },
                        line(node, line) {
                            // Ensure each line has proper structure
                            if (node.children.length === 0) {
                                node.children = [{ type: 'text', value: ' ' }];
                            }
                            node.properties = node.properties || {};
                            node.properties['data-line-number'] = line;
                        },
                    },
                ],
                onVisitLine(node) {
                    // Ensure empty lines render properly
                    if (node.children.length === 0) {
                        node.children = [{ type: 'text', value: ' ' }];
                    }
                },
                onVisitHighlightedLine(node) {
                    node.properties = node.properties || {};
                    node.properties.className = node.properties.className || [];
                    node.properties.className.push('highlighted');
                },
                onVisitHighlightedChars(node) {
                    node.properties = node.properties || {};
                    node.properties.className = ['highlighted-chars'];
                },
            })
            .use(rehypeStringify, { allowDangerousHtml: true });

        const result = await processor.process(markdown);
        return String(result);
    } catch (error) {
        console.error('Syntax highlighting failed:', error);
        // Fallback to basic markdown processing
        const processor = unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeStringify);
        
        const result = await processor.process(markdown);
        return String(result);
    }
}