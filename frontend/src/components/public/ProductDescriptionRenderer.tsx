'use client';

import React from 'react';
import { BookOpen, Wrench, ShieldAlert } from 'lucide-react';

interface ProductDescriptionRendererProps {
  description: string;
  variant?: 'compact' | 'full';
}

export default function ProductDescriptionRenderer({
  description,
  variant = 'full',
}: ProductDescriptionRendererProps) {
  if (!description || !description.trim()) {
    return null;
  }

  // Standardize line breaks
  const rawText = description.replace(/\r\n/g, '\n').trim();
  const rawLines = rawText.split('\n');

  interface Block {
    type: 'warning' | 'section' | 'list_item' | 'bullet_item' | 'paragraph';
    title?: string;
    content?: string;
    num?: string;
  }

  const blocks: Block[] = [];
  let currentWarning: { title: string; body: string[] } | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      if (currentWarning) {
        blocks.push({
          type: 'warning',
          title: currentWarning.title,
          content: currentWarning.body.join('\n'),
        });
        currentWarning = null;
      }
      continue;
    }

    // Detect warning header
    const isWarningHeader =
      line.startsWith('***CẢNH BÁO') ||
      line.startsWith('CẢNH BÁO') ||
      line.includes('CẢNH BÁO QUAN TRỌNG') ||
      line.startsWith('⚠️') ||
      line.startsWith('![WARNING]');

    if (isWarningHeader) {
      if (currentWarning) {
        blocks.push({
          type: 'warning',
          title: currentWarning.title,
          content: currentWarning.body.join('\n'),
        });
      }
      const cleanTitle = line
        .replace(/^[⚠️!\*#\s]+/, '')
        .replace(/[\*#]+:?$/, '')
        .trim();
      currentWarning = { title: cleanTitle, body: [] };
      continue;
    }

    if (currentWarning) {
      if (line.startsWith('***') || line.startsWith('##') || line.startsWith('###')) {
        blocks.push({
          type: 'warning',
          title: currentWarning.title,
          content: currentWarning.body.join('\n'),
        });
        currentWarning = null;
      } else {
        currentWarning.body.push(line);
        continue;
      }
    }

    // Section Header (e.g., ***HƯỚNG DẪN SỬ DỤNG*** or ## Title)
    if (line.startsWith('***') || line.startsWith('###') || line.startsWith('##')) {
      const cleanTitle = line.replace(/^[\*#\s]+/, '').replace(/[\*#\s]+$/, '').trim();
      blocks.push({
        type: 'section',
        title: cleanTitle,
      });
      continue;
    }

    // Numbered item e.g. "1. Đồng bộ...", "2. Chu kỳ..."
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
    if (numMatch) {
      blocks.push({
        type: 'list_item',
        num: numMatch[1],
        content: numMatch[2],
      });
      continue;
    }

    // Bullet item e.g. "• ...", "- ...", "* ..."
    const bulletMatch = line.match(/^[•\-\*]\s*(.*)/);
    if (bulletMatch) {
      blocks.push({
        type: 'bullet_item',
        content: bulletMatch[1],
      });
      continue;
    }

    if (line === 'Mô Tả Sản Phẩm:' || line === 'MÔ TẢ SẢN PHẨM:') continue;

    blocks.push({
      type: 'paragraph',
      content: line,
    });
  }

  if (currentWarning) {
    blocks.push({
      type: 'warning',
      title: currentWarning.title,
      content: currentWarning.body.join('\n'),
    });
  }

  const isCompact = variant === 'compact';

  return (
    <div className={`space-y-2.5 text-slate-800 ${isCompact ? 'text-xs leading-snug' : 'text-xs sm:text-sm leading-relaxed'}`}>
      {blocks.map((block, idx) => {
        // 1. WARNING CALLOUT BOX (Sole vertical accent callout for critical warnings)
        if (block.type === 'warning') {
          return (
            <div
              key={`desc-block-${idx}`}
              className="my-3 rounded-md bg-red-50/90 border border-red-200 border-l-4 border-l-red-600 p-3.5 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-red-700 font-black text-xs uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{renderFormattedContent(block.title || 'CẢNH BÁO QUAN TRỌNG KHI SỬ DỤNG')}</span>
              </div>
              {block.content && (
                <div className="text-slate-800 text-xs sm:text-sm leading-relaxed pl-6 border-l border-red-200/90 font-medium">
                  {renderFormattedContent(block.content)}
                </div>
              )}
            </div>
          );
        }

        // 2. SECTION HEADER (Clean horizontal bottom divider, NO vertical left bar)
        if (block.type === 'section') {
          return (
            <div
              key={`desc-block-${idx}`}
              className="mt-5 mb-2.5 pb-1.5 border-b border-slate-200 font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-red-600 shrink-0" />
              <span>{block.title}</span>
            </div>
          );
        }

        // 3. NUMBERED ITEM (Clean rounded step badge)
        if (block.type === 'list_item') {
          const contentStr = block.content || '';
          const colonIdx = contentStr.indexOf(':');
          let label = '';
          let body = contentStr;

          if (colonIdx > 0 && colonIdx < 60) {
            label = contentStr.substring(0, colonIdx).trim();
            body = contentStr.substring(colonIdx + 1).trim();
          }

          return (
            <div key={`desc-block-${idx}`} className="flex items-start gap-2.5 pl-0.5 my-1.5">
              <span className="w-4.5 h-4.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {block.num}
              </span>
              <div className="flex-1 text-slate-800 text-xs sm:text-sm leading-relaxed">
                {label ? (
                  <>
                    <strong className="font-extrabold text-slate-900 mr-1.5">{label}:</strong>
                    <span>{renderFormattedContent(body)}</span>
                  </>
                ) : (
                  <span>{renderFormattedContent(body)}</span>
                )}
              </div>
            </div>
          );
        }

        // 4. BULLET ITEM
        if (block.type === 'bullet_item') {
          const contentStr = block.content || '';
          const colonIdx = contentStr.indexOf(':');
          let label = '';
          let body = contentStr;

          if (colonIdx > 0 && colonIdx < 60) {
            label = contentStr.substring(0, colonIdx).trim();
            body = contentStr.substring(colonIdx + 1).trim();
          }

          return (
            <div key={`desc-block-${idx}`} className="flex items-start gap-2 pl-5 sm:pl-6 my-1">
              <span className="w-1.5 h-1.5 rounded-xs bg-red-600 shrink-0 mt-1.5" />
              <div className="flex-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
                {label ? (
                  <>
                    <strong className="font-bold text-slate-900 mr-1.5">{label}:</strong>
                    <span>{renderFormattedContent(body)}</span>
                  </>
                ) : (
                  <span>{renderFormattedContent(body)}</span>
                )}
              </div>
            </div>
          );
        }

        // 5. REGULAR PARAGRAPH
        return (
          <p key={`desc-block-${idx}`} className="text-slate-700 text-xs sm:text-sm leading-relaxed my-1">
            {renderFormattedContent(block.content || '')}
          </p>
        );
      })}
    </div>
  );
}

// Format inline markdown formatting (**bold**, ***bold***, <CODE_TAG>)
function renderFormattedContent(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  const regex = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|<[A-Z0-9_\.-]{3,}>)/gi;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];

    if (token.startsWith('***') && token.endsWith('***')) {
      parts.push(
        <strong key={`inline-${key++}`} className="font-black text-slate-900">
          {token.slice(3, -3)}
        </strong>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`inline-${key++}`} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`inline-${key++}`} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('<') && token.endsWith('>')) {
      parts.push(
        <span
          key={`inline-${key++}`}
          className="font-mono text-xs font-bold text-red-600 bg-red-50 border border-red-200/90 px-1.5 py-0.5 rounded-md mx-0.5 inline-block"
        >
          {token.slice(1, -1)}
        </span>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
