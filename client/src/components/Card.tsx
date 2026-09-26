export function Card({ title, value, text }: { title: string; value?: string; text?: string }) {
  return <article className="card"><p className="eyebrow">{title}</p><h2>{value}</h2><p>{text}</p></article>;
}
