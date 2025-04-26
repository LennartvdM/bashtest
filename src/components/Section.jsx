export default function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-4xl min-h-[85vh] rounded-2xl
                      bg-white/70 backdrop-blur p-10 space-y-6 shadow-xl">
        <h2 className="text-3xl font-bold">{title}</h2>
        {children}
      </div>
    </section>
  );
}
