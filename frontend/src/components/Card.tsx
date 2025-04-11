interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-16 w-[1200px] min-h-[800px] mx-auto my-8">
      {children}
    </div>
  );
}
