import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, FC, memo, useMemo, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import SyntaxHighlighter, { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';

type MarkdownProps = {
    markdown: string;
};

// Add Fira Code font import (Google Fonts CDN)
const FIRA_CODE_FONT_LINK = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap';

const getFileExtension = (lang: string): string => {
    if (!lang) return '';
    const map: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        bash: 'sh',
        shell: 'sh',
        json: 'json',
        html: 'html',
        css: 'css',
        scss: 'scss',
        less: 'less',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        csharp: 'cs',
        go: 'go',
        ruby: 'rb',
        php: 'php',
        rust: 'rs',
        swift: 'swift',
        kotlin: 'kt',
        dart: 'dart',
        sql: 'sql',
        yaml: 'yml',
        markdown: 'md',
        dockerfile: 'Dockerfile',
        plaintext: 'txt',
        text: 'txt',
    };
    const ext = map[lang.toLowerCase()];
    return ext || lang.toLowerCase();
};

// Move static styles outside component
const staticStyles = `
    .hljs-ln-line, .hljs-line, .hljs-line-numbers, .hljs-line-number, .hljs-ln, .hljs-ln-code, .hljs-ln-numbers {
        background: transparent !important;
    }
    .fira-code {
        font-family: 'Fira Code', 'Fira Mono', 'Menlo', 'monospace' !important;
        font-variant-ligatures: contextual;
    }
`;

type CodeBlockProps = {
    codeString: string;
    lang: string;
    isDark: boolean;
    customTheme: SyntaxHighlighterProps['style'];
    codeBlockStyle: React.CSSProperties;
    fileExt: string;
} & ComponentPropsWithoutRef<typeof SyntaxHighlighter>;

const CodeBlock = memo(({ codeString, lang, isDark, customTheme, codeBlockStyle, fileExt, ...props }: CodeBlockProps) => {
    const [wrap, setWrap] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="group relative">
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                {fileExt && (
                    <span
                        className={cn(
                            'rounded px-2 py-1 font-mono text-xs font-semibold select-none',
                            isDark
                                ? 'border border-neutral-700 bg-neutral-900 text-neutral-300'
                                : 'border border-neutral-200 bg-neutral-100 text-neutral-700',
                            'fira-code',
                        )}
                    >
                        .{fileExt}
                    </span>
                )}
                <button
                    onClick={handleCopy}
                    className={cn(
                        'rounded px-2 py-1 text-xs font-medium',
                        isDark ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
                        'border border-transparent transition-colors hover:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none',
                    )}
                    title="Copy code"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={() => setWrap((w) => !w)}
                    className={cn(
                        'rounded px-2 py-1 text-xs font-medium',
                        isDark ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
                        'border border-transparent transition-colors hover:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none',
                    )}
                    title={wrap ? 'Disable line wrap' : 'Enable line wrap'}
                >
                    {wrap ? 'No Wrap' : 'Wrap'}
                </button>
            </div>
            <SyntaxHighlighter
                style={customTheme}
                language={lang}
                PreTag="div"
                customStyle={{
                    ...codeBlockStyle,
                    overflowX: wrap ? 'auto' : 'scroll',
                    whiteSpace: wrap ? 'pre-wrap' : 'pre',
                    wordBreak: wrap ? 'break-word' : 'normal',
                    fontFamily: `'Fira Code', 'Fira Mono', 'Menlo', 'monospace'`,
                }}
                wrapLongLines={wrap}
                showLineNumbers
                lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: isDark ? '#6b7280' : '#9ca3af',
                    background: 'transparent',
                    fontFamily: `'Fira Code', 'Fira Mono', 'Menlo', 'monospace'`,
                    fontSize: '1em',
                    userSelect: 'none',
                }}
                {...props}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

const Markdown: FC<MarkdownProps> = memo(({ markdown }) => {
    const { appearance } = useAppearance();
    const isDark = useMemo(
        () => appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
        [appearance],
    );

    const theme = useMemo(() => (isDark ? atomOneDark : atomOneLight), [isDark]);

    // Memoize custom theme with proper typing
    const customTheme: SyntaxHighlighterProps['style'] = useMemo(
        () => ({
            ...theme,
            hljs: {
                ...theme['hljs'],
                background: isDark ? 'rgb(23, 23, 23)' : 'rgb(250, 250, 250)',
                color: isDark ? 'rgb(229, 231, 235)' : 'rgb(23, 23, 23)',
            },
            'hljs-comment': {
                ...theme['hljs-comment'],
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
            },
            'hljs-keyword': {
                ...theme['hljs-keyword'],
                color: isDark ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)',
            },
            'hljs-string': {
                ...theme['hljs-string'],
                color: isDark ? 'rgb(134, 239, 172)' : 'rgb(22, 163, 74)',
            },
            'hljs-number': {
                ...theme['hljs-number'],
                color: isDark ? 'rgb(251, 191, 36)' : 'rgb(202, 138, 4)',
            },
            'hljs-function': {
                ...theme['hljs-function'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-title': {
                ...theme['hljs-title'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-params': {
                ...theme['hljs-params'],
                color: isDark ? 'rgb(229, 231, 235)' : 'rgb(23, 23, 23)',
            },
            'hljs-literal': {
                ...theme['hljs-literal'],
                color: isDark ? 'rgb(251, 191, 36)' : 'rgb(202, 138, 4)',
            },
            'hljs-type': {
                ...theme['hljs-type'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-attr': {
                ...theme['hljs-attr'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-built_in': {
                ...theme['hljs-built_in'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-selector-tag': {
                ...theme['hljs-selector-tag'],
                color: isDark ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)',
            },
            'hljs-selector-id': {
                ...theme['hljs-selector-id'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-selector-class': {
                ...theme['hljs-selector-class'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-selector-attr': {
                ...theme['hljs-selector-attr'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-selector-pseudo': {
                ...theme['hljs-selector-pseudo'],
                color: isDark ? 'rgb(251, 146, 60)' : 'rgb(234, 88, 12)',
            },
            'hljs-addition': {
                ...theme['hljs-addition'],
                color: isDark ? 'rgb(134, 239, 172)' : 'rgb(22, 163, 74)',
            },
            'hljs-deletion': {
                ...theme['hljs-deletion'],
                color: isDark ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)',
            },
            'hljs-emphasis': {
                ...theme['hljs-emphasis'],
                fontStyle: 'italic',
            },
            'hljs-strong': {
                ...theme['hljs-strong'],
                fontWeight: 'bold',
            },
            'hljs-ln-line': { background: 'transparent' },
            'hljs-line': { background: 'transparent' },
            'hljs-line-numbers': { background: 'transparent' },
            'hljs-line-number': { background: 'transparent' },
            'hljs-ln': { background: 'transparent' },
            'hljs-ln-code': { background: 'transparent' },
            'hljs-ln-numbers': { background: 'transparent' },
        }),
        [theme, isDark],
    );

    // Memoize code block style with proper typing
    const codeBlockStyle: React.CSSProperties = useMemo(
        () => ({
            background: isDark ? 'rgb(23, 23, 23)' : 'rgb(250, 250, 250)',
            borderRadius: '0.5rem',
            padding: '1rem',
            margin: '0.5rem 0',
            border: isDark ? '1px solid rgb(38, 38, 38)' : '1px solid rgb(229, 231, 235)',
        }),
        [isDark],
    );

    // Memoize the code component with proper types
    const codeComponent: Components = useMemo(
        () => ({
            code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');
                const isMultiline = codeString.includes('\n');
                const fileExt = getFileExtension(lang);

                if (match && isMultiline) {
                    return (
                        <CodeBlock
                            codeString={codeString}
                            lang={lang}
                            isDark={isDark}
                            customTheme={customTheme}
                            codeBlockStyle={codeBlockStyle}
                            fileExt={fileExt}
                            {...props}
                        />
                    );
                }

                if (match) {
                    return (
                        <SyntaxHighlighter
                            style={customTheme as any}
                            language={lang}
                            PreTag="div"
                            customStyle={{
                                ...codeBlockStyle,
                                fontFamily: `'Fira Code', 'Fira Mono', 'Menlo', 'monospace'`,
                            }}
                            showLineNumbers
                            lineNumberStyle={{
                                minWidth: '2.5em',
                                paddingRight: '1em',
                                color: isDark ? '#6b7280' : '#9ca3af',
                                background: 'transparent',
                                fontFamily: `'Fira Code', 'Fira Mono', 'Menlo', 'monospace'`,
                                fontSize: '1em',
                                userSelect: 'none',
                            }}
                            {...props}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    );
                }

                return (
                    <code
                        className={cn(
                            'fira-code rounded-md px-1.5 py-0.5 font-mono text-sm',
                            isDark
                                ? 'border border-[rgb(38,38,38)] bg-[rgb(23,23,23)] text-neutral-200'
                                : 'border border-[rgb(229,231,235)] bg-[rgb(250,250,250)] text-neutral-800',
                        )}
                        {...props}
                    >
                        {children}
                    </code>
                );
            },
        }),
        [isDark, customTheme, codeBlockStyle],
    );

    return (
        <>
            <link rel="stylesheet" href={FIRA_CODE_FONT_LINK} />
            <style>{staticStyles}</style>
            <ReactMarkdown components={codeComponent}>{markdown}</ReactMarkdown>
        </>
    );
});

Markdown.displayName = 'Markdown';

export default Markdown;
