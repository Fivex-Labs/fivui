"use client"

import * as React from "react"
import { Check, Copy, FileText, Terminal } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const codeBlockVariants = cva(
  "relative overflow-hidden rounded-lg border bg-muted/50",
  {
    variants: {
      variant: {
        default: "border-border",
        ghost: "border-transparent bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CodeBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof codeBlockVariants> {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  showCopy?: boolean
  maxHeight?: string
  theme?: "light" | "dark"
}

// Language icons mapping
const languageIcons: Record<string, React.ReactNode> = {
  javascript: <FileText className="h-4 w-4 text-yellow-500" />,
  typescript: <FileText className="h-4 w-4 text-blue-500" />,
  jsx: <FileText className="h-4 w-4 text-cyan-500" />,
  tsx: <FileText className="h-4 w-4 text-blue-600" />,
  python: <FileText className="h-4 w-4 text-green-500" />,
  bash: <Terminal className="h-4 w-4 text-gray-500" />,
  shell: <Terminal className="h-4 w-4 text-gray-500" />,
  json: <FileText className="h-4 w-4 text-orange-500" />,
  css: <FileText className="h-4 w-4 text-purple-500" />,
  html: <FileText className="h-4 w-4 text-red-500" />,
  sql: <FileText className="h-4 w-4 text-blue-400" />,
  yaml: <FileText className="h-4 w-4 text-red-400" />,
  xml: <FileText className="h-4 w-4 text-orange-400" />,
  default: <FileText className="h-4 w-4 text-muted-foreground" />,
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({
    className,
    variant,
    code,
    language = "text",
    filename,
    showLineNumbers = false,
    showCopy = true,
    maxHeight = "400px",
    theme = "dark",
    ...props
  }, ref) => {
    const [copied, setCopied] = React.useState(false)

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy code:", err)
      }
    }

    const languageIcon = languageIcons[language.toLowerCase()] || languageIcons.default

    return (
      <div
        ref={ref}
        className={cn(codeBlockVariants({ variant, className }))}
        {...props}
      >
        {/* Header */}
        {(filename || language || showCopy) && (
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-2">
              {languageIcon}
              {filename && (
                <span className="text-sm font-medium text-foreground">
                  {filename}
                </span>
              )}
              {!filename && language && language !== "text" && (
                <span className="text-sm text-muted-foreground">
                  {language}
                </span>
              )}
            </div>
            {showCopy && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy code</span>
              </Button>
            )}
          </div>
        )}

        {/* Code Content */}
        <div className="relative">
          <Highlight
            theme={theme === "dark" ? themes.vsDark : themes.vsLight}
            code={code.trim()}
            language={language as any}
          >
            {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={cn(
                  "overflow-auto p-4 text-sm",
                  highlightClassName
                )}
                style={{ 
                  ...style, 
                  maxHeight,
                  backgroundColor: 'transparent'
                }}
              >
                <code className="relative block">
                  {showLineNumbers ? (
                    <div className="flex">
                      {/* Line Numbers */}
                      <div className="mr-4 select-none border-r pr-4 text-muted-foreground">
                        {tokens.map((_, index) => (
                          <div key={index} className="text-right leading-6">
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      {/* Code Lines */}
                      <div className="flex-1">
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })} className="leading-6">
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })} className="leading-6">
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))
                  )}
                </code>
              </pre>
            )}
          </Highlight>

          {/* Copy button for no-header variant */}
          {!filename && !language && showCopy && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy code</span>
            </Button>
          )}
        </div>
      </div>
    )
  }
)
CodeBlock.displayName = "CodeBlock"

export { CodeBlock, codeBlockVariants, type CodeBlockProps } 