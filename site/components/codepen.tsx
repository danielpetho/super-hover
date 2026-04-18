interface CodePenProps {
  penId: string;
  title?: string;
  user?: string;
  height?: number;
  defaultTab?: 'result' | 'html' | 'css' | 'js';
}

export function CodePen({
  penId,
  title = "CodePen Embed",
  user = "nonzeroexitcode",
  height = 530,
  defaultTab = "result"
}: CodePenProps) {
  return (
    <div className="relative h-[530px]">
      <iframe
        height={height}
        className="w-[850px] absolute top-0 left-1/2 -translate-x-1/2 rounded-2xl border border-border overflow-hidden"
        title={title}
        src={`https://codepen.io/${user}/embed/${penId}?default-tab=${defaultTab}&theme-id=dark`}
        frameBorder="no"
        loading="lazy"
        allowTransparency={true}
        allowFullScreen={true}
      >
        <span>See the Pen <a href={`https://codepen.io/${user}/pen/${penId}`}>
        {title}</a> by {user} (<a href={`https://codepen.io/${user}`}>@{user}</a>)
        on <a href="https://codepen.io">CodePen</a>.</span>
      </iframe>
    </div>
  );
}