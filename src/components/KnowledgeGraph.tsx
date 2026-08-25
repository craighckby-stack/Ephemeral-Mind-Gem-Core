import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface KnowledgeGraphProps {
  mermaidCode: string;
}

export default function KnowledgeGraph({ mermaidCode }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!mermaidCode) return;

    // Clean up code block tags (e.g. ```mermaid ... ```)
    let cleanCode = mermaidCode
      .replace(/^```mermaid\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    // Ensure we have correct theme variables matching the neon theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        lineColor: '#84cc16',
        mainBkg: '#000000',
        primaryColor: '#84cc16',
        primaryTextColor: '#000000',
        nodeBorder: '#84cc16',
        textColor: '#84cc16',
        actorBorder: '#84cc16',
        signalColor: '#84cc16',
      },
      securityLevel: 'loose',
    });

    const renderGraph = async () => {
      try {
        setErrorMsg('');
        const id = `mermaid-svg-${Math.floor(Math.random() * 100000)}`;
        const { svg } = await mermaid.render(id, cleanCode);
        setSvgContent(svg);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setErrorMsg('GRAPH_RENDER_FAILURE: Could not compile custom node topology.');
        // Clean up any broken nodes that mermaid injected so future renders succeed
        const badElement = document.getElementById('dmermaid-svg-custom');
        if (badElement) badElement.remove();
      }
    };

    renderGraph();
  }, [mermaidCode]);

  return (
    <div className="mermaid-container border-2 border-lime-400 p-4 bg-black overflow-x-auto min-h-[250px] flex flex-col justify-center">
      {errorMsg ? (
        <div className="text-red-500 font-mono text-xs">
          <p className="font-bold mb-2 text-sm">{errorMsg}</p>
          <pre className="bg-black p-2 border border-red-500 overflow-x-auto max-h-48 text-red-400 whitespace-pre-wrap">
            {mermaidCode}
          </pre>
        </div>
      ) : svgContent ? (
        <div
          ref={containerRef}
          className="flex justify-center items-center select-none"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className="text-center py-8 text-lime-700 animate-pulse text-xs">
          [ WAITING FOR SYSTEM GRAPH TOPOLOGY GENERATION... ]
        </div>
      )}
    </div>
  );
}
